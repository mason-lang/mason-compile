import {code} from '../CompileError'
import * as MsAstTypes from './MsAst'
import {AssignDestructure, AssignSingle, BlockVal, Call, Class, Constructor, Do, ForVal, Fun,
	LocalDeclareBuilt, LocalDeclareFocus, LocalDeclareRes, ModuleExport, ObjEntry, Pattern,
	SuperCallDo, Yield, YieldTo} from './MsAst'
import {assert, cat, ifElse, implementMany, isEmpty, opEach, reverseIter} from './util'
import VerifyResults from './VerifyResults'

/*
The verifier generates information needed during transpiling, the VerifyResults.
*/
export default (_context, msAst) => {
	context = _context
	locals = new Map()
	pendingBlockLocals = []
	isInGenerator = false
	okToNotUse = new Set()
	opLoop = null
	method = null
	results = new VerifyResults()

	msAst.verify()
	verifyLocalUse()

	const res = results
	// Release for garbage collection.
	context = locals = okToNotUse = opLoop = pendingBlockLocals = method = results = null
	return res
}

// Use a trick like in parse.js and have everything close over these mutable variables.
let
	context,
	// Map from names to LocalDeclares.
	locals,
	// Locals that don't have to be accessed.
	okToNotUse,
	opLoop,
	/*
	Locals for this block.
	These are added to locals when entering a Function or lazy evaluation.
	In:
		a = |
			b
		b = 1
	`b` will be a pending local.
	However:
		a = b
		b = 1
	will fail to verify, because `b` comes after `a` and is not accessed inside a function.
	It would work for `~a is b`, though.
	*/
	pendingBlockLocals,
	// Whether we are currently able to yield.
	isInGenerator,
	// Current method we are in, or a Constructor, or null.
	method,
	results,
	// Name of the closest AssignSingle
	name

const
	verifyOpEach = op => {
		if (op !== null)
			op.verify()
	},

	deleteLocal = localDeclare =>
		locals.delete(localDeclare.name),

	setLocal = localDeclare =>
		locals.set(localDeclare.name, localDeclare),

	accessLocal = (access, name) => {
		const declare = getLocalDeclare(name, access.loc)
		setDeclareAccessed(declare, access)
	},

	setDeclareAccessed = (declare, access) => {
		results.localDeclareToAccesses.get(declare).push(access)
	},

	// For expressions affecting lineNewLocals, they will be registered before being verified.
	// So, LocalDeclare.verify just the type.
	// For locals not affecting lineNewLocals, use this instead of just declare.verify()
	verifyLocalDeclare = localDeclare => {
		registerLocal(localDeclare)
		localDeclare.verify()
	},

	registerLocal = localDeclare => {
		results.localDeclareToAccesses.set(localDeclare, [])
	},

	setName = expr => {
		results.names.set(expr, name)
	}

// These functions change verifier state and efficiently return to the old state when finished.
const
	withInGenerator = (newIsInGenerator, action) => {
		const oldIsInGenerator = isInGenerator
		isInGenerator = newIsInGenerator
		action()
		isInGenerator = oldIsInGenerator
	},

	withLoop = (newLoop, action) => {
		const oldLoop = opLoop
		opLoop = newLoop
		action()
		opLoop = oldLoop
	},

	withMethod = (newMethod, action) => {
		const oldMethod = method
		method = newMethod
		action()
		method = oldMethod
	},

	withName = (newName, action) => {
		const oldName = name
		name = newName
		action()
		name = oldName
	},

	// Can't break out of loop inside of IIFE.
	withIIFE = action => {
		withLoop(false, action)
	},

	plusLocal = (addedLocal, action) => {
		const shadowed = locals.get(addedLocal.name)
		locals.set(addedLocal.name, addedLocal)
		action()
		if (shadowed === undefined)
			deleteLocal(addedLocal)
		else
			setLocal(shadowed)
	},

	// Should have verified that addedLocals all have different names.
	plusLocals = (addedLocals, action) => {
		const shadowedLocals = []
		for (const _ of addedLocals) {
			const shadowed = locals.get(_.name)
			if (shadowed !== undefined)
				shadowedLocals.push(shadowed)
			setLocal(_)
		}

		action()

		addedLocals.forEach(deleteLocal)
		shadowedLocals.forEach(setLocal)
	},

	verifyAndPlusLocal = (addedLocal, action) => {
		verifyLocalDeclare(addedLocal)
		plusLocal(addedLocal, action)
	},

	verifyAndPlusLocals = (addedLocals, action) => {
		addedLocals.forEach(verifyLocalDeclare)
		const names = new Set()
		for (const _ of addedLocals) {
			context.check(!names.has(_.name), _.loc, () =>
				`Duplicate local ${code(_.name)}`)
			names.add(_.name)
		}
		plusLocals(addedLocals, action)
	},

	withBlockLocals = action => {
		const oldPendingBlockLocals = pendingBlockLocals
		pendingBlockLocals = []
		plusLocals(oldPendingBlockLocals, action)
		pendingBlockLocals = oldPendingBlockLocals
	}

const verifyLocalUse = () => {
	for (const [accesses, local] of results.localDeclareToAccesses)
		if (!(local instanceof LocalDeclareBuilt || local instanceof LocalDeclareRes))
			context.warnIf(isEmpty(accesses) && !okToNotUse.has(local), local.loc, () =>
				`Unused local variable ${code(local.name)}.`)
}

implementMany(MsAstTypes, 'verify', {
	Assert() {
		this.condition.verify()
		verifyOpEach(this.opThrown)
	},

	AssignSingle() {
		withName(this.assignee.name, () => {
			const doV = () => {
				/*
				Fun and Class only get name if they are immediately after the assignment.
				so in `x = $after-time 1000 |` the function is not named.
				*/
				if (this.value instanceof Class || this.value instanceof Fun)
					setName(this.value)

				// Assignee registered by verifyLines.
				this.assignee.verify()
				this.value.verify()
			}
			if (this.assignee.isLazy())
				withBlockLocals(doV)
			else
				doV()
		})
	},

	AssignDestructure() {
		// Assignees registered by verifyLines.
		for (const _ of this.assignees)
			_.verify()
		this.value.verify()
	},

	BagEntry: verifyBagEntry,
	BagEntryMany: verifyBagEntry,

	BagSimple() {
		for (const _ of this.parts)
			_.verify()
	},

	BlockDo() {
		verifyLines(this.lines)
	},

	BlockValThrow() {
		const newLocals = verifyLines(this.lines)
		plusLocals(newLocals, () => this.throw.verify())
	},

	BlockWithReturn() {
		const newLocals = verifyLines(this.lines)
		plusLocals(newLocals, () => this.returned.verify())
	},


	BlockObj: verifyBlockBuild,
	BlockBag: verifyBlockBuild,
	BlockMap: verifyBlockBuild,

	BlockWrap() {
		withIIFE(() => this.block.verify())
	},

	Break() {
		verifyInLoop(this)
		context.check(!(opLoop instanceof ForVal), this.loc, () =>
			`${code('for')} must break with a value.`)
	},

	BreakWithVal() {
		verifyInLoop(this)
		context.check(opLoop instanceof ForVal, this.loc, () =>
			`${code('break')} only valid inside ${code('for')}`)
		this.value.verify()
	},

	Call() {
		this.called.verify()
		for (const _ of this.args)
			_.verify()
	},

	CaseDo() {
		verifyCase(this)
	},
	CaseDoPart: verifyCasePart,
	CaseVal() {
		withIIFE(() => verifyCase(this))
	},
	CaseValPart: verifyCasePart,

	Catch() {
		context.check(this.caught.opType === null, this.caught.loc, 'TODO: Caught types')
		verifyAndPlusLocal(this.caught, () => this.block.verify())
	},

	Class() {
		verifyOpEach(this.opSuperClass)
		verifyOpEach(this.opDo)
		for (const _ of this.statics)
			_.verify()
		if (this.opConstructor !== null)
			this.opConstructor.verify(this.opSuperClass !== null)
		for (const _ of this.methods)
			_.verify()
		// name set by AssignSingle
	},

	ClassDo() {
		verifyAndPlusLocal(this.declareFocus, () => this.block.verify())
	},

	Cond() {
		this.test.verify()
		this.ifTrue.verify()
		this.ifFalse.verify()
	},

	ConditionalDo() {
		this.test.verify()
		this.result.verify()
	},
	ConditionalVal() {
		this.test.verify()
		withIIFE(() => this.result.verify())
	},

	Constructor(classHasSuper) {
		okToNotUse.add(this.fun.opDeclareThis)
		withMethod(this, () => { this.fun.verify() })

		const superCall = results.constructorToSuper.get(this)

		if (classHasSuper)
			context.check(superCall !== undefined, this.loc, () =>
				`Constructor must contain ${code('super!')}`)
		else
			context.check(superCall === undefined, () => superCall.loc, () =>
				`Class has no superclass, so ${code('super!')} is not allowed.`)

		for (const _ of this.memberArgs)
			setDeclareAccessed(_, this)
	},

	ExceptDo: verifyExcept,
	ExceptVal: verifyExcept,

	ForBag() {
		verifyAndPlusLocal(this.built, () => verifyFor(this))
	},

	ForDo() {
		verifyFor(this)
	},

	ForVal() {
		verifyFor(this)
	},

	Fun() {
		withBlockLocals(() => {
			context.check(this.opDeclareRes === null || this.block instanceof BlockVal, this.loc,
				'Function with return condition must return something.')
			withInGenerator(this.isGenerator, () =>
				withLoop(null, () => {
					const allArgs = cat(this.opDeclareThis, this.args, this.opRestArg)
					verifyAndPlusLocals(allArgs, () => {
						verifyOpEach(this.opIn)
						this.block.verify()
						opEach(this.opDeclareRes, verifyLocalDeclare)
						const verifyOut = () => verifyOpEach(this.opOut)
						ifElse(this.opDeclareRes, _ => plusLocal(_, verifyOut), verifyOut)
					})
				}))
		})
		// name set by AssignSingle
	},

	Ignore() {
		for (const _ of this.ignored)
			accessLocal(this, _)
	},

	Lazy() {
		withBlockLocals(() => this.value.verify())
	},

	LocalAccess() {
		const declare = locals.get(this.name)
		if (declare === undefined) {
			const builtinPath = context.opts.builtinNameToPath.get(this.name)
			if (builtinPath === undefined)
				failMissingLocal(this.loc, this.name)
			else {
				const names = results.builtinPathToNames.get(builtinPath)
				if (names === undefined)
					results.builtinPathToNames.set(builtinPath, new Set([this.name]))
				else
					names.add(this.name)
			}
		} else {
			results.localAccessToDeclare.set(this, declare)
			setDeclareAccessed(declare, this)
		}
	},

	// Adding LocalDeclares to the available locals is done by Fun or lineNewLocals.
	LocalDeclare() {
		const builtinPath = context.opts.builtinNameToPath.get(this.name)
		context.warnIf(builtinPath !== undefined, this.loc, () =>
			`Local ${code(this.name)} overrides builtin from ${code(builtinPath)}.`)
		verifyOpEach(this.opType)
	},

	LocalMutate() {
		const declare = getLocalDeclare(this.name, this.loc)
		context.check(declare.isMutable(), this.loc, () => `${code(this.name)} is not mutable.`)
		// TODO: Track mutations. Mutable local must be mutated somewhere.
		this.value.verify()
	},

	Logic() {
		context.check(this.args.length > 1, 'Logic expression needs at least 2 arguments.')
		for (const _ of this.args)
			_.verify()
	},

	Not() {
		this.arg.verify()
	},

	NumberLiteral() { },

	MapEntry() {
		accessLocal(this, 'built')
		this.key.verify()
		this.val.verify()
	},

	Member() {
		this.object.verify()
	},

	MemberSet() {
		this.object.verify()
		this.value.verify()
	},

	MethodImpl() {
		verifyMethod(this, () => {
			okToNotUse.add(this.fun.opDeclareThis)
			this.fun.verify()
		})
	},
	MethodGetter() {
		verifyMethod(this, () => {
			okToNotUse.add(this.declareThis)
			verifyAndPlusLocals([this.declareThis], () => { this.block.verify() })
		})
	},
	MethodSetter() {
		verifyMethod(this, () => {
			verifyAndPlusLocals([this.declareThis, this.declareFocus], () => {
				this.block.verify()
			})
		})
	},

	Module() {
		// No need to verify this.doImports.
		for (const _ of this.imports)
			_.verify()
		verifyOpEach(this.opImportGlobal)

		withName(context.opts.moduleName(), () => {
			verifyLines(this.lines)
		})
	},

	ModuleExport() {
		this.assign.verify()
		for (const _ of this.assign.allAssignees())
			setDeclareAccessed(_, this)
	},

	New() {
		this.type.verify()
		for (const _ of this.args)
			_.verify()
	},

	ObjEntryAssign() {
		accessLocal(this, 'built')
		this.assign.verify()
		for (const _ of this.assign.allAssignees())
			setDeclareAccessed(_, this)
	},

	ObjEntryComputed() {
		accessLocal(this, 'built')
		this.key.verify()
		this.value.verify()
	},

	ObjSimple() {
		const keys = new Set()
		for (const pair of this.pairs) {
			const {key, value} = pair
			context.check(!keys.has(key), pair.loc, () => `Duplicate key ${key}`)
			keys.add(key)
			value.verify()
		}
	},

	Quote() {
		for (const _ of this.parts)
			if (typeof _ !== 'string')
				_.verify()
	},

	QuoteTemplate() {
		this.tag.verify()
		this.quote.verify()
	},

	SpecialDo() { },

	SpecialVal() {
		setName(this)
	},

	Splat() {
		this.splatted.verify()
	},

	SuperCall: verifySuperCall,
	SuperCallDo: verifySuperCall,
	SuperMember() {
		context.check(method !== null, this.loc, 'Must be in method.')
	},

	SwitchDo() {
		verifySwitch(this)
	},
	SwitchDoPart: verifySwitchPart,
	SwitchVal() {
		withIIFE(() => verifySwitch(this))
	},
	SwitchValPart: verifySwitchPart,

	Throw() {
		verifyOpEach(this.opThrown)
	},

	Import: verifyImport,
	ImportGlobal: verifyImport,

	With() {
		this.value.verify()
		withIIFE(() => {
			if (this.declare instanceof LocalDeclareFocus)
				okToNotUse.add(this.declare)
			verifyAndPlusLocal(this.declare, () => { this.block.verify() })
		})
	},

	Yield() {
		context.check(isInGenerator, this.loc, 'Cannot yield outside of generator context')
		verifyOpEach(this.opYielded)
	},

	YieldTo() {
		context.check(isInGenerator, this.loc, 'Cannot yield outside of generator context')
		this.yieldedTo.verify()
	}
})

function verifyBagEntry() {
	accessLocal(this, 'built')
	this.value.verify()
}

function verifyBlockBuild() {
	verifyAndPlusLocal(this.built, () => {
		verifyLines(this.lines)
	})
}

function verifyCasePart() {
	if (this.test instanceof Pattern) {
		this.test.type.verify()
		this.test.patterned.verify()
		verifyAndPlusLocals(this.test.locals, () => this.result.verify())
	} else {
		this.test.verify()
		this.result.verify()
	}
}

function verifySwitchPart() {
	for (const _ of this.values)
		_.verify()
	this.result.verify()
}

function verifyExcept() {
	this._try.verify()
	verifyOpEach(this._catch)
	verifyOpEach(this._finally)
}

function verifySuperCall() {
	context.check(method !== null, this.loc, 'Must be in a method.')
	results.superCallToMethod.set(this, method)

	if (method instanceof Constructor) {
		context.check(this instanceof SuperCallDo, this.loc, () =>
			`${code('super')} not supported in constructor; use ${code('super!')}`)
		results.constructorToSuper.set(method, this)
	}

	for (const _ of this.args)
		_.verify()
}

function verifyImport() {
	// Since Uses are always in the outermost scope, don't have to worry about shadowing.
	// So we mutate `locals` directly.
	const addUseLocal = _ => {
		const prev = locals.get(_.name)
		context.check(prev === undefined, _.loc, () =>
			`${code(_.name)} already imported at ${prev.loc}`)
		verifyLocalDeclare(_)
		setLocal(_)
	}
	for (const _ of this.imported)
		addUseLocal(_)
	opEach(this.opImportDefault, addUseLocal)
}

// Helpers specific to certain MsAst types:
const
	verifyFor = forLoop => {
		const verifyBlock = () => withLoop(forLoop, () => forLoop.block.verify())
		ifElse(forLoop.opIteratee,
			({element, bag}) => {
				bag.verify()
				verifyAndPlusLocal(element, verifyBlock)
			},
			verifyBlock)
	},

	verifyInLoop = loopUser =>
		context.check(opLoop !== null, loopUser.loc, 'Not in a loop.'),


	verifyCase = _ => {
		const doIt = () => {
			for (const part of _.parts)
				part.verify()
			verifyOpEach(_.opElse)
		}
		ifElse(_.opCased,
			_ => {
				_.verify()
				verifyAndPlusLocal(_.assignee, doIt)
			},
			doIt)
	},

	verifyMethod = (_, doVerify) => {
		if (typeof _.symbol !== 'string')
			_.symbol.verify()
		withMethod(_, doVerify)
	},

	verifySwitch = _ => {
		_.switched.verify()
		for (const part of _.parts)
			part.verify()
		verifyOpEach(_.opElse)
	}

// General utilities:
const
	getLocalDeclare = (name, accessLoc) => {
		const declare = locals.get(name)
		if (declare === undefined)
			failMissingLocal(accessLoc, name)
		return declare
	},

	failMissingLocal = (loc, name) => {
		context.fail(loc, () => {
			// TODO:ES6 `Array.from(locals.keys())` should work
			const keys = []
			for (const key of locals.keys())
				keys.push(key)
			const showLocals = code(keys.join(' '))
			return `No such local ${code(name)}.\nLocals are:\n${showLocals}.`
		})
	},

	lineNewLocals = line =>
		line instanceof AssignSingle ?
			[line.assignee] :
			line instanceof AssignDestructure ?
			line.assignees :
			line instanceof ObjEntry ?
			lineNewLocals(line.assign) :
			line instanceof ModuleExport ?
			lineNewLocals(line.assign) :
			[],

	verifyLines = lines => {
		/*
		We need to bet all block locals up-front because
		Functions within lines can access locals from later lines.
		NOTE: We push these onto pendingBlockLocals in reverse
		so that when we iterate through lines forwards, we can pop from pendingBlockLocals
		to remove pending locals as they become real locals.
		It doesn't really matter what order we add locals in since it's not allowed
		to have two locals of the same name in the same block.
		*/
		const newLocals = []

		const getLineLocals = line => {
			for (const _ of reverseIter(lineNewLocals(line))) {
				// Register the local now. Can't wait until the assign is verified.
				registerLocal(_)
				newLocals.push(_)
			}
		}
		for (const _ of reverseIter(lines))
			getLineLocals(_)
		pendingBlockLocals.push(...newLocals)

		/*
		Keeps track of locals which have already been added in this block.
		Mason allows shadowing, but not within the same block.
		So, this is allowed:
			a = 1
			b =
				a = 2
				...
		But not:
			a = 1
			a = 2
		*/
		const thisBlockLocalNames = new Set()

		// All shadowed locals for this block.
		const shadowed = []

		const verifyLine = line => {
			verifyIsStatement(line)
			for (const newLocal of lineNewLocals(line)) {
				const name = newLocal.name
				const oldLocal = locals.get(name)
				if (oldLocal !== undefined) {
					context.check(!thisBlockLocalNames.has(name), newLocal.loc,
						() => `A local ${code(name)} is already in this block.`)
					shadowed.push(oldLocal)
				}
				thisBlockLocalNames.add(name)
				setLocal(newLocal)

				// Now that it's added as a local, it's no longer pending.
				// We added pendingBlockLocals in the right order that we can just pop them off.
				const popped = pendingBlockLocals.pop()
				assert(popped === newLocal)
			}
			line.verify()
		}

		lines.forEach(verifyLine)

		newLocals.forEach(deleteLocal)
		shadowed.forEach(setLocal)

		return newLocals
	},

	verifyIsStatement = line => {
		const isStatement =
			line instanceof Do ||
			// Some values are also acceptable.
			line instanceof Call ||
			line instanceof Yield ||
			line instanceof YieldTo
		context.check(isStatement, line.loc, 'Expression in statement position.')
	}

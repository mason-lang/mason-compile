import {code} from '../../CompileError'
import {check, options, warn} from '../context'
import * as MsAstTypes from '../MsAst'
import {BlockVal, BlockValThrow, Class, Constructor,
	ForVal, Fun, Funs, Pattern, SuperCallDo} from '../MsAst'
import {cat, ifElse, implementMany, opEach} from '../util'
import {funKind, locals, method, okToNotUse, opLoop, results, setup, tearDown, withIIFE,
	withInFunKind, withMethod, withLoop, withName} from './context'
import {accessLocal, getLocalDeclare, failMissingLocal, plusLocals, setDeclareAccessed, setLocal,
	verifyAndPlusLocal, verifyAndPlusLocals, verifyLocalDeclare, warnUnusedLocals, withBlockLocals
	} from './locals'
import {setName, verifyName, verifyOp} from './util'
import verifyLines from './verifyLines'

/**
Generates information needed during transpiling, the VerifyResults.
Also checks for existence of local variables and warns for unused locals.
@param {MsAst} msAst
*/
export default function verify(msAst) {
	setup()
	msAst.verify()
	warnUnusedLocals()
	const res = results
	tearDown()
	return res
}

implementMany(MsAstTypes, 'verify', {
	Assert() {
		this.condition.verify()
		verifyOp(this.opThrown)
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

	BlockValReturn() {
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
		check(!(opLoop instanceof ForVal), this.loc, () =>
			`${code('for')} must break with a value.`)
	},

	BreakWithVal() {
		verifyInLoop(this)
		check(opLoop instanceof ForVal, this.loc, () =>
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
		check(this.caught.opType === null, this.caught.loc, 'TODO: Caught types')
		verifyAndPlusLocal(this.caught, () => this.block.verify())
	},

	Class() {
		verifyOp(this.opSuperClass)
		verifyOp(this.opDo)
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
			check(superCall !== undefined, this.loc, () =>
				`Constructor must contain ${code('super!')}`)
		else
			check(superCall === undefined, () => superCall.loc, () =>
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
		if (this.opReturnType !== null) {
			check(this.block instanceof BlockVal, this.loc,
				'Function with return type must return something.')
			if (this.block instanceof BlockValThrow)
				warn('Return type ignored because the block always throws.')
		}

		withBlockLocals(() => {
			withInFunKind(this.kind, () =>
				withLoop(null, () => {
					const allArgs = cat(this.opDeclareThis, this.args, this.opRestArg)
					verifyAndPlusLocals(allArgs, () => {
						this.block.verify()
						verifyOp(this.opReturnType)
					})
				}))
		})

		// name set by AssignSingle
	},

	Ignore() {
		for (const _ of this.ignoredNames)
			accessLocal(this, _)
	},

	Lazy() {
		withBlockLocals(() => this.value.verify())
	},

	LocalAccess() {
		const declare = locals.get(this.name)
		if (declare === undefined) {
			const builtinPath = options.builtinNameToPath.get(this.name)
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
		const builtinPath = options.builtinNameToPath.get(this.name)
		if (builtinPath !== undefined)
			warn(this.loc, `Local ${code(this.name)} overrides builtin from ${code(builtinPath)}.`)
		verifyOp(this.opType)
	},

	LocalMutate() {
		const declare = getLocalDeclare(this.name, this.loc)
		check(declare.isMutable(), this.loc, () => `${code(this.name)} is not mutable.`)
		// TODO: Track mutations. Mutable local must be mutated somewhere.
		this.value.verify()
	},

	Logic() {
		check(this.args.length > 1, 'Logic expression needs at least 2 arguments.')
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
		verifyName(this.name)
	},

	MemberFun() {
		verifyOp(this.opObject)
		verifyName(this.name)
	},

	MemberSet() {
		this.object.verify()
		verifyName(this.name)
		verifyOp(this.opType)
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
		verifyOp(this.opImportGlobal)

		withName(options.moduleName(), () => {
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

	ObjEntryPlain() {
		accessLocal(this, 'built')
		verifyName(this.name)
		this.value.verify()
	},

	ObjSimple() {
		const keys = new Set()
		for (const pair of this.pairs) {
			const {key, value} = pair
			check(!keys.has(key), pair.loc, () => `Duplicate key ${key}`)
			keys.add(key)
			value.verify()
		}
	},

	QuotePlain() {
		for (const _ of this.parts)
			verifyName(_)
	},

	QuoteSimple() {},

	QuoteTaggedTemplate() {
		this.tag.verify()
		this.quote.verify()
	},

	Range() {
		this.start.verify()
		verifyOp(this.end)
	},

	SetSub() {
		this.object.verify()
		for (const _ of this.subbeds)
			_.verify()
		verifyOp(this.opType)
		this.value.verify()
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
		check(method !== null, this.loc, 'Must be in method.')
		verifyName(this.name)
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
		verifyOp(this.opThrown)
	},

	Import: verifyImport,
	ImportGlobal: verifyImport,

	With() {
		this.value.verify()
		withIIFE(() => {
			if (this.declare.name === '_')
				okToNotUse.add(this.declare)
			verifyAndPlusLocal(this.declare, () => { this.block.verify() })
		})
	},

	Yield() {
		check(funKind !== Funs.Plain, `Cannot ${code('<~')} outside of async/generator.`)
		if (funKind === Funs.Async)
			check(this.opYielded !== null, this.loc, 'Cannot await nothing.')
		verifyOp(this.opYielded)
	},

	YieldTo() {
		check(funKind === Funs.Generator, this.loc, `Cannot ${code('<~~')} outside of generator.`)
		this.yieldedTo.verify()
	}
})

// Shared implementations

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
	this.try.verify()
	verifyOp(this.catch)
	verifyOp(this.finally)
}

function verifySuperCall() {
	check(method !== null, this.loc, 'Must be in a method.')
	results.superCallToMethod.set(this, method)

	if (method instanceof Constructor) {
		check(this instanceof SuperCallDo, this.loc, () =>
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
		check(prev === undefined, _.loc, () =>
			`${code(_.name)} already imported at ${prev.loc}`)
		verifyLocalDeclare(_)
		setLocal(_)
	}
	for (const _ of this.imported)
		addUseLocal(_)
	opEach(this.opImportDefault, addUseLocal)
}

// Helpers specific to certain MsAst types

function verifyFor(forLoop) {
	const verifyBlock = () => withLoop(forLoop, () => forLoop.block.verify())
	ifElse(forLoop.opIteratee,
		({element, bag}) => {
			bag.verify()
			verifyAndPlusLocal(element, verifyBlock)
		},
		verifyBlock)
}

function verifyInLoop(loopUser) {
	check(opLoop !== null, loopUser.loc, 'Not in a loop.')
}

function verifyCase(_) {
	const doIt = () => {
		for (const part of _.parts)
			part.verify()
		verifyOp(_.opElse)
	}
	ifElse(_.opCased,
		_ => {
			_.verify()
			verifyAndPlusLocal(_.assignee, doIt)
		},
		doIt)
}

function verifyMethod(_, doVerify) {
	verifyName(_.symbol)
	withMethod(_, doVerify)
}

function verifySwitch(_) {
	_.switched.verify()
	for (const part of _.parts)
		part.verify()
	verifyOp(_.opElse)
}

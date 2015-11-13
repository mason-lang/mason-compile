import {code} from '../../CompileError'
import {check, options, warn} from '../context'
import * as MsAstTypes from '../MsAst'
import {Block, Class, Constructor, Fun, Funs, Kind, LocalDeclare, Method, Pattern} from '../MsAst'
import {Keywords, showKeyword} from '../Token'
import {cat, ifElse, implementMany, opEach} from '../util'
import {funKind, locals, method, okToNotUse, opLoop, results, setup, tearDown, withIife,
	withIifeIf, withIifeIfVal, withInFunKind, withMethod, withLoop, withName} from './context'
import {accessLocal, getLocalDeclare, failMissingLocal, setDeclareAccessed, setLocal,
	verifyAndPlusLocal, verifyAndPlusLocals, verifyLocalDeclare, warnUnusedLocals, withBlockLocals
	} from './locals'
import SK,{checkDo, checkVal, markStatement} from './SK'
import {setName, verifyName, verifyOp} from './util'
import verifyBlock, {verifyModuleLines} from './verifyBlock'

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
	Assert(sk) {
		checkDo(this, sk)
		this.condition.verify(SK.Val)
		verifyOp(this.opThrown, SK.Val)
	},

	AssignSingle(sk) {
		checkDo(this, sk)
		withName(this.assignee.name, () => {
			const doV = () => {
				/*
				Fun and Class only get name if they are immediately after the assignment.
				so in `x = $after-time 1000 |` the function is not named.
				*/
				if (this.value instanceof Class ||
					this.value instanceof Fun ||
					this.value instanceof Method ||
					this.value instanceof Kind)
					setName(this.value)

				// Assignee registered by verifyLines.
				this.assignee.verify()
				this.value.verify(SK.Val)
			}
			if (this.assignee.isLazy())
				withBlockLocals(doV)
			else
				doV()
		})
	},

	AssignDestructure(sk) {
		checkDo(this, sk)
		// Assignees registered by verifyLines.
		for (const _ of this.assignees)
			_.verify()
		this.value.verify(SK.Val)
	},

	BagEntry(sk) {
		checkDo(this, sk)
		accessLocal(this, 'built')
		this.value.verify(SK.Val)
	},

	BagSimple(sk) {
		checkVal(this, sk)
		for (const _ of this.parts)
			_.verify(SK.Val)
	},

	Block: verifyBlock,

	BlockWrap(sk) {
		checkVal(this, sk)
		withIife(() => this.block.verify(sk))
	},

	Break(sk) {
		checkDo(this, sk)
		verifyInLoop(this)
		verifyOp(this.opValue, SK.Val)
		check(results.isStatement(opLoop) === (this.opValue === null), this.loc, () =>
			this.opValue === null ?
				`${showKeyword(Keywords.For)} in expression position must break with a value.` :
				`${showKeyword(Keywords.Break)} with value is only valid in ` +
				`${showKeyword(Keywords.For)} in expression position.`)
	},

	Call(_sk) {
		this.called.verify(SK.Val)
		for (const _ of this.args)
			_.verify(SK.Val)
	},

	Case(sk) {
		markStatement(this, sk)
		withIifeIfVal(sk, () => {
			const doIt = () => {
				for (const part of this.parts)
					part.verify(sk)
				verifyOp(this.opElse, sk)
			}
			ifElse(this.opCased,
				_ => {
					_.verify(SK.Do)
					verifyAndPlusLocal(_.assignee, doIt)
				},
				doIt)
		})
	},

	CasePart(sk) {
		if (this.test instanceof Pattern) {
			this.test.type.verify(SK.Val)
			this.test.patterned.verify(SK.Val)
			verifyAndPlusLocals(this.test.locals, () => this.result.verify(sk))
		} else {
			this.test.verify(SK.Val)
			this.result.verify(sk)
		}
	},

	Catch(sk) {
		check(this.caught.opType === null, this.caught.loc, 'TODO: Caught types')
		verifyAndPlusLocal(this.caught, () => this.block.verify(sk))
	},

	Class(sk) {
		checkVal(this, sk)
		verifyOp(this.opSuperClass, SK.Val)
		for (const _ of this.kinds)
			_.verify(SK.Val)
		verifyOp(this.opDo)
		for (const _ of this.statics)
			_.verify()
		if (this.opConstructor !== null)
			this.opConstructor.verify(this.opSuperClass !== null)
		for (const _ of this.methods)
			_.verify()
		// name set by AssignSingle
	},

	ClassKindDo() {
		verifyAndPlusLocal(this.declareFocus, () => this.block.verify(SK.Do))
	},

	Cond(sk) {
		// Could be a statement if both results are.
		this.test.verify(SK.Val)
		this.ifTrue.verify(sk)
		this.ifFalse.verify(sk)
	},

	Conditional(sk) {
		markStatement(this, sk)
		this.test.verify(SK.Val)
		withIifeIf(this.result instanceof Block && sk === SK.Val, () => {
			this.result.verify(sk)
		})
	},

	Constructor(classHasSuper) {
		okToNotUse.add(this.fun.opDeclareThis)
		withMethod(this, () => { this.fun.verify(SK.Val) })

		const superCall = results.constructorToSuper.get(this)

		if (classHasSuper)
			check(superCall !== undefined, this.loc, () =>
				`Constructor must contain ${showKeyword(Keywords.Super)}`)
		else
			check(superCall === undefined, () => superCall.loc, () =>
				`Class has no superclass, so ${showKeyword(Keywords.Super)} is not allowed.`)

		for (const _ of this.memberArgs)
			setDeclareAccessed(_, this)
	},

	Except(sk) {
		markStatement(this, sk)
		this.try.verify(sk)
		verifyOp(this.opCatch, sk)
		verifyOp(this.opFinally, SK.Do)
	},

	ForBag(sk) {
		checkVal(this, sk)
		verifyAndPlusLocal(this.built, () => verifyFor(this))
	},

	For(sk) {
		markStatement(this, sk)
		verifyFor(this)
	},

	Fun(sk) {
		checkVal(this, sk)
		check(this.opReturnType === null || !this.isDo, this.loc,
			'Function with return type must return something.')
		withBlockLocals(() => {
			withInFunKind(this.kind, () =>
				withLoop(null, () => {
					const allArgs = cat(this.opDeclareThis, this.args, this.opRestArg)
					verifyAndPlusLocals(allArgs, () => {
						this.block.verify(this.isDo ? SK.Do : SK.Val)
						verifyOp(this.opReturnType, SK.Val)
					})
				}))
		})
		// name set by AssignSingle
	},

	FunAbstract() {
		for (const _ of this.args)
			_.verify()
		verifyOp(this.opRestArg)
		verifyOp(this.opReturnType, SK.Val)
	},

	Ignore(sk) {
		checkDo(this, sk)
		for (const _ of this.ignoredNames)
			accessLocal(this, _)
	},

	Kind(sk) {
		checkVal(this, sk)
		for (const _ of this.superKinds)
			_.verify(SK.Val)
		verifyOp(this.opDo, SK.Do)
		for (const _ of this.statics)
			_.verify()
		for (const _ of this.methods)
			_.verify()
		// name set by AssignSingle
	},

	Lazy(sk) {
		checkVal(this, sk)
		withBlockLocals(() => this.value.verify(SK.Val))
	},

	LocalAccess(sk) {
		checkVal(this, sk)
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
		verifyOp(this.opType, SK.Val)
	},

	LocalMutate(sk) {
		checkDo(this, sk)
		const declare = getLocalDeclare(this.name, this.loc)
		check(declare.isMutable(), this.loc, () => `${code(this.name)} is not mutable.`)
		// TODO: Track mutations. Mutable local must be mutated somewhere.
		this.value.verify(SK.Val)
	},

	Logic(sk) {
		checkVal(this, sk)
		check(this.args.length > 1, this.loc, 'Logic expression needs at least 2 arguments.')
		for (const _ of this.args)
			_.verify(SK.Val)
	},

	Not(sk) {
		checkVal(this, sk)
		this.arg.verify(SK.Val)
	},

	NumberLiteral(sk) {
		checkVal(this, sk)
	},

	MapEntry(sk) {
		checkDo(this, sk)
		accessLocal(this, 'built')
		this.key.verify(SK.Val)
		this.val.verify(SK.Val)
	},

	Member(sk) {
		checkVal(this, sk)
		this.object.verify(SK.Val)
		verifyName(this.name)
	},

	MemberFun(sk) {
		checkVal(this, sk)
		verifyOp(this.opObject, SK.Val)
		verifyName(this.name)
	},

	MemberSet(sk) {
		checkDo(this, sk)
		this.object.verify(SK.Val)
		verifyName(this.name)
		verifyOp(this.opType, SK.Val)
		this.value.verify(SK.Val)
	},

	Method(sk) {
		checkVal(this, sk)
		okToNotUse.add(this.fun.opDeclareThis)
		for (const _ of this.fun.args)
			okToNotUse.add(_)
		opEach(this.fun.opRestArg, _ => okToNotUse.add(_))
		this.fun.verify(SK.Val)
		// name set by AssignSingle
	},

	MethodImpl() {
		verifyMethodImpl(this, () => {
			okToNotUse.add(this.fun.opDeclareThis)
			this.fun.verify(SK.Val)
		})
	},
	MethodGetter() {
		verifyMethodImpl(this, () => {
			okToNotUse.add(this.declareThis)
			verifyAndPlusLocals([this.declareThis], () => {
				this.block.verify(SK.Val)
			})
		})
	},
	MethodSetter() {
		verifyMethodImpl(this, () => {
			verifyAndPlusLocals([this.declareThis, this.declareFocus], () => {
				this.block.verify(SK.Do)
			})
		})
	},

	Module() {
		// No need to verify this.doImports.
		for (const _ of this.imports)
			_.verify()
		verifyOp(this.opImportGlobal)

		withName(options.moduleName(), () => {
			verifyModuleLines(this.lines, this.loc)
		})
	},

	New(sk) {
		checkVal(this, sk)
		this.type.verify(SK.Val)
		for (const _ of this.args)
			_.verify(SK.Val)
	},

	ObjEntryAssign(sk) {
		checkDo(this, sk)
		if (!results.isObjEntryExport(this))
			accessLocal(this, 'built')
		this.assign.verify(SK.Do)
		for (const _ of this.assign.allAssignees())
			setDeclareAccessed(_, this)
	},

	ObjEntryPlain(sk) {
		checkDo(this, sk)
		if (results.isObjEntryExport(this))
			check(typeof this.name === 'string', this.loc,
				'Module export must have a constant name.')
		else {
			accessLocal(this, 'built')
			verifyName(this.name)
		}
		this.value.verify(SK.Val)
	},

	ObjSimple(sk) {
		checkVal(this, sk)
		const keys = new Set()
		for (const pair of this.pairs) {
			const {key, value} = pair
			check(!keys.has(key), pair.loc, () => `Duplicate key ${key}`)
			keys.add(key)
			value.verify(SK.Val)
		}
	},

	GetterFun(sk) {
		checkVal(this, sk)
		verifyName(this.name)
	},

	QuotePlain(sk) {
		checkVal(this, sk)
		for (const _ of this.parts)
			verifyName(_)
	},

	QuoteSimple(sk) {
		checkVal(this, sk)
	},

	QuoteTaggedTemplate(sk) {
		checkVal(this, sk)
		this.tag.verify(SK.Val)
		this.quote.verify(SK.Val)
	},

	Range(sk) {
		checkVal(this, sk)
		this.start.verify(SK.Val)
		verifyOp(this.end, SK.Val)
	},

	SetSub(sk) {
		checkDo(this, sk)
		this.object.verify(SK.Val)
		for (const _ of this.subbeds)
			_.verify(SK.Val)
		verifyOp(this.opType, SK.Val)
		this.value.verify(SK.Val)
	},

	SimpleFun(sk) {
		checkVal(this, sk)
		verifyAndPlusLocal(LocalDeclare.focus(this.loc), () => {
			this.value.verify()
		})
	},

	SpecialDo(sk) {
		checkDo(this, sk)
	},

	SpecialVal(sk) {
		checkVal(this, sk)
		setName(this)
	},

	Spread() {
		this.spreaded.verify(SK.Val)
	},

	SuperCall(sk) {
		check(method !== null, this.loc, 'Must be in a method.')
		results.superCallToMethod.set(this, method)

		if (method instanceof Constructor) {
			check(sk === SK.Do, this.loc, () =>
				`${showKeyword(Keywords.Super)} in constructor must appear as a statement.'`)
			results.constructorToSuper.set(method, this)
		}

		for (const _ of this.args)
			_.verify(SK.Val)
	},

	SuperMember(sk) {
		checkVal(this, sk)
		check(method !== null, this.loc, 'Must be in method.')
		verifyName(this.name)
	},

	Switch(sk) {
		markStatement(this, sk)
		withIifeIfVal(sk, () => {
			this.switched.verify(SK.Val)
			for (const part of this.parts)
				part.verify(sk)
			verifyOp(this.opElse, sk)
		})
	},

	SwitchPart(sk) {
		markStatement(this, sk)
		for (const _ of this.values)
			_.verify(SK.Val)
		this.result.verify(sk)
	},

	Throw() {
		verifyOp(this.opThrown, SK.Val)
	},

	Import: verifyImport,
	ImportGlobal: verifyImport,

	With(sk) {
		markStatement(this, sk)
		this.value.verify(SK.Val)
		withIifeIfVal(sk, () => {
			if (sk === SK.Val && this.declare.name === '_')
				okToNotUse.add(this.declare)
			verifyAndPlusLocal(this.declare, () => {
				this.block.verify(SK.Do)
			})
		})
	},

	Yield(_sk) {
		check(funKind !== Funs.Plain, this.loc, () =>
			`Cannot ${showKeyword(Keywords.Yield)} outside of async/generator.`)
		if (funKind === Funs.Async)
			check(this.opYielded !== null, this.loc, 'Cannot await nothing.')
		verifyOp(this.opYielded, SK.Val)
	},

	YieldTo(_sk) {
		check(funKind === Funs.Generator, this.loc, () =>
			`Cannot ${showKeyword(Keywords.YieldTo)} outside of generator.`)
		this.yieldedTo.verify(SK.Val)
	}
})

// Shared implementations

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
	const verifyBlock = () => withLoop(forLoop, () => {
		forLoop.block.verify(SK.Do)
	})
	ifElse(forLoop.opIteratee,
		({element, bag}) => {
			bag.verify(SK.Val)
			verifyAndPlusLocal(element, verifyBlock)
		},
		verifyBlock)
}

function verifyInLoop(loopUser) {
	check(opLoop !== null, loopUser.loc, 'Not in a loop.')
}

function verifyMethodImpl(_, doVerify) {
	verifyName(_.symbol)
	withMethod(_, doVerify)
}

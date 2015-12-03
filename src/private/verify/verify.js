import {code} from '../../CompileError'
import {check, fail, options, pathOptions, warn} from '../context'
import * as MsAstTypes from '../MsAst'
import {Block, Class, Constructor, For, ForBag, Fun, Funs, Kind, LocalDeclare, Method, Pattern
	} from '../MsAst'
import {Keywords, showKeyword} from '../Token'
import {assert, cat, ifElse, implementMany, isEmpty, opEach} from '../util'
import {funKind, isInSwitch, locals, method, opLoop, results, setup, tearDown, withFun, withIife,
	withIifeIf, withIifeIfVal, withInFunKind, withInSwitch, withMethod, withLoop, withName
	} from './context'
import {accessLocal, failMissingLocal, plusLocals, registerAndPlusLocal, setDeclareAccessed,
	setLocal, verifyAndPlusLocal, verifyAndPlusLocals, verifyLocalDeclare, warnUnusedLocals,
	withBlockLocals} from './locals'
import SK, {checkDo, checkVal, getSK, markStatement} from './SK'
import {makeUseOptional, makeUseOptionalIfFocus, setName, verifyEach, verifyName, verifyNotLazy,
	verifyOp} from './util'
import verifyBlock, {verifyDoBlock, verifyModuleLines} from './verifyBlock'

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
		verifyEach(this.assignees)
		this.value.verify(SK.Val)
	},

	Await(_sk) {
		check(funKind === Funs.Async, this.loc, () =>
			`Cannot ${showKeyword(Keywords.Await)} outside of async function.`)
		this.value.verify(SK.Val)
	},

	BagEntry(sk) {
		checkDo(this, sk)
		accessLocal(this, 'built')
		this.value.verify(SK.Val)
	},

	BagSimple(sk) {
		checkVal(this, sk)
		verifyEach(this.parts, SK.Val)
	},

	Block: verifyBlock,

	BlockWrap(sk) {
		checkVal(this, sk)
		withIife(() => this.block.verify(sk))
	},

	Break(sk) {
		checkDo(this, sk)
		verifyOp(this.opValue, SK.Val)
		check(opLoop !== null, this.loc, 'Not in a loop.')
		const loop = opLoop

		if (loop instanceof For)
			if (results.isStatement(loop))
				check(this.opValue === null, this.loc, () =>
					`${showKeyword(Keywords.Break)} with value is only valid in ` +
					`${showKeyword(Keywords.For)} in expression position.`)
			else
				check(this.opValue !== null, this.loc, () =>
					`${showKeyword(Keywords.For)} in expression position must ` +
					`${showKeyword(Keywords.Break)} with a value.`)
		else {
			// (ForAsync isn't really a loop)
			assert(loop instanceof ForBag)
			check(this.opValue === null, this.loc, () =>
				`${showKeyword(Keywords.Break)} in ${showKeyword(Keywords.ForBag)} ` +
				`may not have value.`)
		}

		if (isInSwitch) {
			results.loopsNeedingLabel.add(loop)
			results.breaksInSwitch.add(this)
		}
	},

	Call(_sk) {
		this.called.verify(SK.Val)
		verifyEach(this.args, SK.Val)
	},

	Case(sk) {
		markStatement(this, sk)
		withIifeIfVal(sk, () => {
			const doIt = () => {
				verifyEach(this.parts, sk)
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
		// No need to do anything with `sk` except pass it to my block.
		makeUseOptionalIfFocus(this.caught)
		verifyNotLazy(this.caught, 'Caught error can not be lazy.')
		verifyAndPlusLocal(this.caught, () => {
			this.block.verify(sk)
		})
	},

	Class(sk) {
		checkVal(this, sk)
		verifyOp(this.opSuperClass, SK.Val)
		verifyEach(this.kinds, SK.Val)
		verifyOp(this.opDo)
		verifyEach(this.statics)
		verifyOp(this.opConstructor, this.opSuperClass !== null)
		verifyEach(this.methods)
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
		makeUseOptional(this.fun.opDeclareThis)
		withMethod(this, () => {
			this.fun.verify(SK.Val)
		})

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
		if (this.opElse === null)
			this.try.verify(sk)
		else {
			plusLocals(verifyDoBlock(this.try), () => this.opElse.verify(sk))
			if (isEmpty(this.allCatches))
				warn(this.loc,
					`${showKeyword(Keywords.Else)} must come after ${showKeyword(Keywords.Catch)}.`)
		}

		if (isEmpty(this.allCatches) && this.opFinally === null)
			warn(this.loc, `${showKeyword(Keywords.Except)} is pointless without ` +
				`${showKeyword(Keywords.Catch)} or ${showKeyword(Keywords.Finally)}.`)

		verifyEach(this.typedCatches, sk)
		verifyOp(this.opCatchAll, sk)
		verifyOp(this.opFinally, SK.Do)
	},

	For(sk) {
		markStatement(this, sk)
		verifyFor(this)
	},

	ForAsync(sk) {
		markStatement(this, sk)
		check(sk !== SK.Do || funKind === Funs.Async, this.loc, () =>
			`${showKeyword(Keywords.ForAsync)} as statement must be inside an async function.`)

		withVerifyIteratee(this.iteratee, () => {
			withFun(Funs.Async, () => {
				// Default block to returning a value, but OK if it doesn't.
				// If a statement, statement, the compiled code will make a Promise
				// that resolves to an array full of `undefined`.
				this.block.verify(getSK(this.block))
			})
		})
	},

	ForBag(sk) {
		checkVal(this, sk)
		verifyAndPlusLocal(this.built, () => verifyFor(this))
	},

	Fun(sk) {
		checkVal(this, sk)
		check(this.opReturnType === null || !this.isDo, this.loc,
			'Function with return type must return something.')
		verifyOp(this.opReturnType, SK.Val)
		const args = cat(this.opDeclareThis, this.args, this.opRestArg)
		withFun(this.kind, () => {
			verifyAndPlusLocals(args, () => {
				this.block.verify(this.isDo ? SK.Do : SK.Val)
			})
		})
		// name set by AssignSingle
	},

	FunAbstract() {
		verifyEach(this.args)
		verifyOp(this.opRestArg)
		verifyOp(this.opReturnType, SK.Val)
	},

	GetterFun(sk) {
		checkVal(this, sk)
		verifyName(this.name)
	},

	Ignore(sk) {
		checkDo(this, sk)
		for (const _ of this.ignoredNames)
			accessLocal(this, _)
	},

	Kind(sk) {
		checkVal(this, sk)
		verifyEach(this.superKinds, SK.Val)
		verifyOp(this.opDo, SK.Do)
		verifyEach(this.statics)
		verifyEach(this.methods)
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
		this.value.verify(SK.Val)
	},

	Logic(sk) {
		checkVal(this, sk)
		check(this.args.length > 1, this.loc, 'Logic expression needs at least 2 arguments.')
		verifyEach(this.args, SK.Val)
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
		makeUseOptional(this.fun.opDeclareThis)
		this.fun.args.forEach(makeUseOptional)
		opEach(this.fun.opRestArg, makeUseOptional)
		this.fun.verify(SK.Val)
		// name set by AssignSingle
	},

	MethodImpl() {
		verifyMethodImpl(this, () => {
			makeUseOptional(this.fun.opDeclareThis)
			this.fun.verify(SK.Val)
		})
	},
	MethodGetter() {
		verifyMethodImpl(this, () => {
			makeUseOptional(this.declareThis)
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
		verifyEach(this.imports)
		withName(pathOptions.moduleName(), () => {
			verifyModuleLines(this.lines, this.loc)
		})
	},

	MsRegExp(sk) {
		checkVal(this, sk)
		this.parts.forEach(verifyName)
		// Check RegExp validity; only possible if this has a single part.
		if (this.parts.length === 1 && typeof this.parts[0] === 'string')
			try {
				/* eslint-disable no-new */
				new RegExp(this.parts[0])
			} catch (err) {
				if (!(err instanceof SyntaxError))
					// This should never happen.
					throw err
				fail(this.loc, err.message)
			}
	},

	New(sk) {
		checkVal(this, sk)
		this.type.verify(SK.Val)
		verifyEach(this.args, SK.val)
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
		for (const {key, value, loc} of this.pairs) {
			check(!keys.has(key), loc, () => `Duplicate key ${key}`)
			keys.add(key)
			value.verify(SK.Val)
		}
	},

	Pipe(sk) {
		checkVal(this, sk)
		this.value.verify()
		for (const pipe of this.pipes)
			registerAndPlusLocal(LocalDeclare.focus(this.loc), () => {
				pipe.verify(SK.Val)
			})
	},

	QuotePlain(sk) {
		checkVal(this, sk)
		this.parts.forEach(verifyName)
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
		verifyEach(this.subbeds, SK.Val)
		verifyOp(this.opType, SK.Val)
		this.value.verify(SK.Val)
	},

	SimpleFun(sk) {
		checkVal(this, sk)
		withBlockLocals(() => {
			withInFunKind(Funs.Plain, () => {
				registerAndPlusLocal(LocalDeclare.focus(this.loc), () => {
					this.value.verify()
				})
			})
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

		verifyEach(this.args, SK.Val)
	},

	SuperMember(sk) {
		checkVal(this, sk)
		check(method !== null, this.loc, 'Must be in method.')
		verifyName(this.name)
	},

	Switch(sk) {
		markStatement(this, sk)
		withIifeIfVal(sk, () => {
			withInSwitch(true, () => {
				this.switched.verify(SK.Val)
				verifyEach(this.parts, sk)
				verifyOp(this.opElse, sk)
			})
		})
	},

	SwitchPart(sk) {
		markStatement(this, sk)
		verifyEach(this.values, SK.Val)
		this.result.verify(sk)
	},

	Throw() {
		verifyOp(this.opThrown, SK.Val)
	},

	Import() {
		// Since Uses are always in the outermost scope, don't have to worry about shadowing.
		// So we mutate `locals` directly.
		function addUseLocal(_) {
			const prev = locals.get(_.name)
			check(prev === undefined, _.loc, () =>
				`${code(_.name)} already imported at ${prev.loc}`)
			verifyLocalDeclare(_)
			setLocal(_)
		}
		for (const _ of this.imported)
			addUseLocal(_)
		opEach(this.opImportDefault, addUseLocal)
	},

	With(sk) {
		markStatement(this, sk)
		this.value.verify(SK.Val)
		withIifeIfVal(sk, () => {
			if (sk === SK.Val)
				makeUseOptionalIfFocus(this.declare)
			verifyAndPlusLocal(this.declare, () => {
				this.block.verify(SK.Do)
			})
		})
	},

	Yield(_sk) {
		check(funKind === Funs.Generator, this.loc, () =>
			`Cannot ${showKeyword(Keywords.Yield)} outside of generator function.`)
		verifyOp(this.opValue, SK.Val)
	},

	YieldTo(_sk) {
		check(funKind === Funs.Generator, this.loc, () =>
			`Cannot ${showKeyword(Keywords.YieldTo)} outside of generator function.`)
		this.value.verify(SK.Val)
	}
})

// Helpers specific to certain MsAst types

function verifyFor(forLoop) {
	function verifyForBlock() {
		withLoop(forLoop, () => {
			forLoop.block.verify(SK.Do)
		})
	}
	ifElse(forLoop.opIteratee,
		_ => {
			withVerifyIteratee(_, verifyForBlock)
		},
		verifyForBlock)
}

function withVerifyIteratee({element, bag}, action) {
	bag.verify(SK.Val)
	verifyNotLazy(element, 'Iteration element can not be lazy.')
	verifyAndPlusLocal(element, action)
}

function verifyMethodImpl(_, doVerify) {
	verifyName(_.symbol)
	withMethod(_, doVerify)
}

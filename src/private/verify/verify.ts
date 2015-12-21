import Op, {caseOp, nonNull, opEach, orThrow} from 'op/Op'
import {check, fail, options, pathOptions, warn} from '../context'
import MsAst from '../MsAst'
import * as MsAstTypes from '../MsAst'
import {Block, Class, Constructor, Do, For, ForBag, Fun, Funs, Iteratee, LocalDeclare, Loop, Method, MethodImplLike, Module, Pattern, Trait, Val
	} from '../MsAst'
import {Keywords} from '../Token'
import {assert, cat, implementMany, isEmpty} from '../util'
import VerifyResults from '../VerifyResults'
import {funKind, isInSwitch, locals, method, opLoop, results, setup, tearDown, withFun, withIife,
	withIifeIf, withIifeIfVal, withInSwitch, withMethod, withMethods, withLoop, withName
	} from './context'
import {accessLocal, missingLocalFail, plusLocals, registerAndPlusLocal, setDeclareAccessed,
	setLocal, verifyAndPlusLocal, verifyAndPlusLocals, verifyLocalDeclare, warnUnusedLocals,
	withBlockLocals} from './locals'
import SK, {checkDo, checkVal, getSK, markStatement} from './SK'
import {makeUseOptional, makeUseOptionalIfFocus, setName, verifyEach, verifyEachValOrSpread,
	verifyName, verifyNotLazy, verifyOp} from './util'
import verifyBlock, {verifyDoBlock, verifyModuleLines} from './verifyBlock'

/**
Generates information needed during transpiling, the VerifyResults.
Also checks for existence of local variables and warns for unused locals.
*/
export default function verify(module: Module): VerifyResults {
	setup()
	module.verify()
	warnUnusedLocals()
	const res = results
	tearDown()
	return res
}

//todo
function verifyOpVal(_: Op<Val>): void {
	if (nonNull(_))
		_.verify(SK.Val)
}
function verifyOpDo(_: Op<Do>): void {
	if (nonNull(_))
		_.verify(SK.Do)
}
function verifyEachVal(vals: Array<Val>): void {
	for (const _ of vals)
		_.verify(SK.Val)
}

//todo
//verifyModule
//verifyDo (was doing: sk = SK.Do, now that's implied)
//verifyVal (was doing: sk = SK.Val, now that's implied)
//and specific verifies
//e.g.:
/*
function verifyVal(_) {
	...
	else if (_ instanceof Conditional)
		//appears in multiple places so reuse that code
		verifyConditional(_)
	...
	else if (_ instanceof Sub)
		<<inline, only appears here>>
	...
	else
		<<error from checkVal>>
}

function verifyDo(_) {
	...
	else if (_ instanceof Conditional)
		verifyConditional(_)
	...
	else
		<<error from checkDo>>
}
*/

implementMany(MsAstTypes, 'verify', {
	Assert(sk: SK): void {
		checkDo(this, sk)
		this.condition.verify(SK.Val)
		verifyOpVal(this.opThrown)
	},

	AssignSingle(sk: SK): void {
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
					this.value instanceof Trait)
					setName(this.value)

				// Assignee registered by verifyLines.
				this.assignee.verify()
				this.value.verify(SK.Val)
			}
			if (this.assignee.isLazy)
				withBlockLocals(doV)
			else
				doV()
		})
	},

	AssignDestructure(sk: SK): void {
		checkDo(this, sk)
		// Assignees registered by verifyLines.
		for (const _ of this.assignees)
			_.verify()
		this.value.verify(SK.Val)
	},

	Await(_sk: SK): void {
		check(funKind === Funs.Async, this.loc, _ => _.misplacedAwait)
		this.value.verify(SK.Val)
	},

	BagEntry(sk: SK): void {
		checkDo(this, sk)
		accessLocal(this, 'built')
		this.value.verify(SK.Val)
	},

	BagSimple(sk: SK): void {
		checkVal(this, sk)
		verifyEachValOrSpread(this.parts)
	},

	Block: verifyBlock,

	BlockWrap(sk: SK): void {
		checkVal(this, sk)
		withIife(() => this.block.verify(sk))
	},

	Break(sk: SK): void {
		checkDo(this, sk)
		verifyOpVal(this.opValue)
		const loop = orThrow(opLoop, () => fail(this.loc, _ => _.misplacedBreak))

		if (loop instanceof For)
			if (results.isStatement(loop))
				check(this.opValue === null, this.loc, _ => _.breakCantHaveValue)
			else
				check(this.opValue !== null, this.loc, _ => _.breakNeedsValue)
		else {
			// (ForAsync isn't really a loop)
			assert(loop instanceof ForBag)
			check(this.opValue === null, this.loc, _ => _.breakValInForBag)
		}

		if (isInSwitch) {
			results.loopsNeedingLabel.add(loop)
			results.breaksInSwitch.add(this)
		}
	},

	Call(_sk: SK): void {
		// Call can be either SK.Val or SK.Do
		this.called.verify(SK.Val)
		verifyEachValOrSpread(this.args)
	},

	Case(sk: SK): void {
		markStatement(this, sk)
		withIifeIfVal(sk, () => {
			const doIt = () => {
				verifyEach(this.parts, sk)
				verifyOp(this.opElse, sk)
			}
			caseOp(this.opCased,
				_ => {
					_.verify(SK.Do)
					verifyAndPlusLocal(_.assignee, doIt)
				},
				doIt)
		})
	},

	CasePart(sk: SK): void {
		if (this.test instanceof Pattern) {
			this.test.type.verify(SK.Val)
			this.test.patterned.verify(SK.Val)
			verifyAndPlusLocals(this.test.locals, () => this.result.verify(sk))
		} else {
			this.test.verify(SK.Val)
			this.result.verify(sk)
		}
	},

	Catch(sk: SK): void {
		// No need to do anything with `sk` except pass it to my block.
		makeUseOptionalIfFocus(this.caught)
		verifyNotLazy(this.caught, _ => _.noLazyCatch)
		verifyAndPlusLocal(this.caught, () => {
			this.block.verify(sk)
		})
	},

	Class(sk: SK): void {
		checkVal(this, sk)
		opEach(this.opFields, fields => {
			for (const _ of fields)
				_.verify()
		})
		verifyOpVal(this.opSuperClass)
		verifyEachVal(this.traits)

		withIife(() => {
			opEach(this.opDo, _ => _.verify())
		})

		// Class acts like a Fun: loop/generator context is lost and we get block locals.
		withMethods(() => {
			for (const _ of this.statics)
				_.verify()
			opEach(this.opConstructor, _ => _.verify(this.opSuperClass !== null))
			for (const _ of this.methods)
				_.verify()
		})
		// name set by AssignSingle
	},

	ClassTraitDo(): void {
		verifyAndPlusLocal(this.declareFocus, () => this.block.verify(SK.Do))
	},

	Cond(sk: SK): void {
		// Could be a statement if both results are.
		this.test.verify(SK.Val)
		this.ifTrue.verify(sk)
		this.ifFalse.verify(sk)
	},

	Conditional(sk: SK): void {
		markStatement(this, sk)
		this.test.verify(SK.Val)
		withIifeIf(this.result instanceof Block && sk === SK.Val, () => {
			this.result.verify(sk)
		})
	},

	Constructor(classHasSuper: boolean): void {
		makeUseOptional(this.fun.opDeclareThis)
		withMethod(this, () => {
			this.fun.verify(SK.Val)
		})

		const superCall = results.constructorToSuper.get(this)

		if (classHasSuper)
			check(superCall !== undefined, this.loc, _ => _.superNeeded)
		else
			check(superCall === undefined, () => superCall.loc, _ => _.superForbidden)

		for (const _ of this.memberArgs)
			setDeclareAccessed(_, this)
	},

	Del(_sk: SK): void {
		// DelSub can be either SK.Val or SK.Do
		this.subbed.verify(SK.Val)
		verifyEachVal(this.args)
	},

	Except(sk: SK): void {
		markStatement(this, sk)
		if (this.opElse === null)
			this.try.verify(sk)
		else {
			plusLocals(verifyDoBlock(this.try), () => this.opElse.verify(sk))
			if (isEmpty(this.allCatches))
				warn(this.loc, _ => _.elseRequiresCatch)
		}

		if (isEmpty(this.allCatches) && this.opFinally === null)
			warn(this.loc, _ => _.uselessExcept)

		verifyEach(this.typedCatches, sk)
		verifyOp(this.opCatchAll, sk)
		verifyOpDo(this.opFinally)
	},

	Field(): void {
		verifyOpVal(this.opType)
	},

	For(sk: SK): void {
		markStatement(this, sk)
		verifyFor(this)
	},

	ForAsync(sk: SK): void {
		markStatement(this, sk)
		check(sk !== SK.Do || funKind === Funs.Async, this.loc, _ => _.forAsyncNeedsAsync)
		withVerifyIteratee(this.iteratee, () => {
			withFun(Funs.Async, () => {
				// Default block to returning a value, but OK if it doesn't.
				// If a statement, statement, the compiled code will make a Promise
				// that resolves to an array full of `undefined`.
				this.block.verify(getSK(this.block))
			})
		})
	},

	ForBag(sk: SK): void {
		checkVal(this, sk)
		verifyAndPlusLocal(this.built, () => verifyFor(this))
	},

	Fun(sk: SK): void {
		checkVal(this, sk)
		check(this.opReturnType === null || !this.isDo, this.loc, _ => _.doFuncCantHaveType)
		verifyOpVal(this.opReturnType)
		const args = cat(this.opDeclareThis, this.args, this.opRestArg)
		withFun(this.kind, () => {
			verifyAndPlusLocals(args, () => {
				this.block.verify(this.isDo ? SK.Do : SK.Val)
			})
		})
		// name set by AssignSingle
	},

	FunAbstract(): void {
		for (const _ of this.args)
			_.verify()
		opEach(this.opRestArg, _ => _.verify())
		opEach(this.opReturnType, _ => _.verify())
	},

	GetterFun(sk: SK): void {
		checkVal(this, sk)
		verifyName(this.name)
	},

	Ignore(sk: SK): void {
		checkDo(this, sk)
		for (const _ of this.ignoredNames)
			accessLocal(this, _)
	},

	Import(): void {
		// Since Uses are always in the outermost scope, don't have to worry about shadowing.
		// So we mutate `locals` directly.
		function addUseLocal(ld: LocalDeclare) {
			const prev = locals.get(ld.name)
			check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc))
			verifyLocalDeclare(ld)
			setLocal(ld)
		}
		for (const _ of this.imported)
			addUseLocal(_)
		opEach(this.opImportDefault, addUseLocal)
	},

	InstanceOf(sk: SK): void {
		checkVal(this, sk)
		this.instance.verify(SK.Val)
		this.type.verify(SK.Val)
	},

	Lazy(sk: SK): void {
		checkVal(this, sk)
		withBlockLocals(() => this.value.verify(SK.Val))
	},

	LocalAccess(sk: SK): void {
		checkVal(this, sk)
		const declare = locals.get(this.name)
		if (declare === undefined) {
			const builtinPath = orThrow(
				options.opBuiltinPath(this.name),
				() => missingLocalFail(this.loc, this.name))
			results.accessBuiltin(this.name, builtinPath)
		} else {
			results.localAccessToDeclare.set(this, declare)
			setDeclareAccessed(declare, this)
		}
	},

	// Adding LocalDeclares to the available locals is done by Fun or lineNewLocals.
	LocalDeclare(): void {
		opEach(options.opBuiltinPath(this.name), path => {
			warn(this.loc, _ => _.overriddenBuiltin(this.name, path))
		})
		opEach(this.opType, _ => _.verify())
	},

	LocalMutate(sk: SK): void {
		checkDo(this, sk)
		this.value.verify(SK.Val)
	},

	Logic(sk: SK): void {
		checkVal(this, sk)
		check(this.args.length > 1, this.loc, _ => _.argsLogic)
		verifyEachVal(this.args)
	},

	Not(sk: SK): void {
		checkVal(this, sk)
		this.arg.verify(SK.Val)
	},

	NumberLiteral(sk: SK): void {
		checkVal(this, sk)
	},

	MapEntry(sk: SK): void {
		checkDo(this, sk)
		accessLocal(this, 'built')
		this.key.verify(SK.Val)
		this.val.verify(SK.Val)
	},

	Member(sk: SK): void {
		checkVal(this, sk)
		this.object.verify(SK.Val)
		verifyName(this.name)
	},

	MemberFun(sk: SK): void {
		checkVal(this, sk)
		verifyOpVal(this.opObject)
		verifyName(this.name)
	},

	MemberSet(sk: SK): void {
		checkDo(this, sk)
		this.object.verify(SK.Val)
		verifyName(this.name)
		verifyOpVal(this.opType)
		this.value.verify(SK.Val)
	},

	Method(sk: SK): void {
		checkVal(this, sk)
		makeUseOptional(this.fun.opDeclareThis)
		this.fun.args.forEach(makeUseOptional)
		opEach(this.fun.opRestArg, makeUseOptional)
		this.fun.verify(SK.Val)
		// name set by AssignSingle
	},

	MethodImpl(): void {
		verifyMethodImpl(this, () => {
			makeUseOptional(this.fun.opDeclareThis)
			this.fun.verify(SK.Val)
		})
	},
	MethodGetter(): void {
		verifyMethodImpl(this, () => {
			makeUseOptional(this.declareThis)
			verifyAndPlusLocals([this.declareThis], () => {
				this.block.verify(SK.Val)
			})
		})
	},
	MethodSetter(): void {
		verifyMethodImpl(this, () => {
			verifyAndPlusLocals([this.declareThis, this.declareFocus], () => {
				this.block.verify(SK.Do)
			})
		})
	},

	Module(): void {
		// No need to verify this.doImports.
		for (const _ of this.imports)
			_.verify()
		withName(pathOptions.moduleName, () => {
			verifyModuleLines(this.lines, this.loc)
		})
	},

	MsRegExp(sk: SK): void {
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
				throw fail(this.loc, _ => _.badRegExp(this.parts[0]))
			}
	},

	New(sk: SK): void {
		checkVal(this, sk)
		this.type.verify(SK.Val)
		verifyEachValOrSpread(this.args)
	},

	ObjEntryAssign(sk: SK): void {
		checkDo(this, sk)
		if (!results.isObjEntryExport(this))
			accessLocal(this, 'built')
		this.assign.verify(SK.Do)
		for (const _ of this.assign.allAssignees())
			setDeclareAccessed(_, this)
	},

	ObjEntryPlain(sk: SK): void {
		checkDo(this, sk)
		if (results.isObjEntryExport(this))
			check(typeof this.name === 'string', this.loc, _ => _.exportName)
		else {
			accessLocal(this, 'built')
			verifyName(this.name)
		}
		this.value.verify(SK.Val)
	},

	ObjSimple(sk: SK): void {
		checkVal(this, sk)
		const keys = new Set()
		for (const {key, value, loc} of this.pairs) {
			check(!keys.has(key), loc, _ => _.duplicateKey(key))
			keys.add(key)
			value.verify(SK.Val)
		}
	},

	Pass(sk: SK): void {
		checkDo(this, sk)
		this.ignored.verify(SK.Val)
	},

	Pipe(sk: SK): void {
		checkVal(this, sk)
		this.startValue.verify()
		for (const pipe of this.pipes)
			registerAndPlusLocal(LocalDeclare.focus(this.loc), () => {
				pipe.verify(SK.Val)
			})
	},

	QuotePlain(sk: SK): void {
		checkVal(this, sk)
		this.parts.forEach(verifyName)
	},

	QuoteSimple(sk: SK): void {
		checkVal(this, sk)
	},

	QuoteTaggedTemplate(sk: SK): void {
		checkVal(this, sk)
		this.tag.verify(SK.Val)
		this.quote.verify(SK.Val)
	},

	Range(sk: SK): void {
		checkVal(this, sk)
		this.start.verify(SK.Val)
		verifyOpVal(this.end)
	},

	SetSub(sk: SK): void {
		checkDo(this, sk)
		this.object.verify(SK.Val)
		verifyEachVal(this.subbeds)
		verifyOpVal(this.opType)
		this.value.verify(SK.Val)
	},

	SimpleFun(sk: SK): void {
		checkVal(this, sk)
		withFun(Funs.Plain, () => {
			registerAndPlusLocal(LocalDeclare.focus(this.loc), () => {
				this.value.verify()
			})
		})
	},

	SpecialDo(sk: SK): void {
		checkDo(this, sk)
	},

	SpecialVal(sk: SK): void {
		checkVal(this, sk)
		setName(this)
	},

	Spread(sk: Op<SK>): void {
		check(sk === null, this.loc, _ => sk === SK.Val ? _.misplacedSpreadVal : _.misplacedSpreadDo)
		this.spreaded.verify(SK.Val)
	},

	Sub(sk: SK): void {
		checkVal(this, sk)
		this.subbed.verify(SK.Val)
		verifyEachVal(this.args)
	},

	SuperCall(sk: SK): void {
		const meth = orThrow(method, () => fail(this.loc, _ => _.superNeedsMethod))
		results.superCallToMethod.set(this, meth)

		if (meth instanceof Constructor) {
			check(sk === SK.Do, this.loc, _ => _.superMustBeStatement)
			results.constructorToSuper.set(meth, this)
		}

		verifyEachVal(this.args)
	},

	SuperMember(sk: SK): void {
		checkVal(this, sk)
		check(method !== null, this.loc, _ => _.superNeedsMethod)
		verifyName(this.name)
	},

	Switch(sk: SK): void {
		markStatement(this, sk)
		withIifeIfVal(sk, () => {
			withInSwitch(true, () => {
				this.switched.verify(SK.Val)
				verifyEach(this.parts, sk)
				verifyOp(this.opElse, sk)
			})
		})
	},

	SwitchPart(sk: SK): void {
		markStatement(this, sk)
		verifyEachVal(this.values)
		this.result.verify(sk)
	},

	Throw(): void {
		verifyOpVal(this.opThrown)
	},

	Trait(sk: SK): void {
		checkVal(this, sk)
		verifyEachVal(this.superTraits)
		verifyOpDo(this.opDo)
		withMethods(() => {
			for (const _ of this.statics)
				_.verify()
			for (const _ of this.methods)
				_.verify()
		})
		// name set by AssignSingle
	},

	TraitDo(sk: SK): void {
		checkDo(this, sk)
		this.implementor.verify(SK.Val)
		this.trait.verify(SK.Val)
		withMethods(() => {
			for (const _ of this.statics)
				_.verify()
			for (const _ of this.methods)
				_.verify()
		})
	},

	With(sk: SK): void {
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

	Yield(_sk: SK): void {
		check(funKind === Funs.Generator, this.loc, _ => _.misplacedYield(Keywords.Yield))
		verifyOpVal(this.opValue)
	},

	YieldTo(_sk: SK): void {
		check(funKind === Funs.Generator, this.loc, _ => _.misplacedYield(Keywords.YieldTo))
		this.value.verify(SK.Val)
	}
})

// Helpers specific to certain MsAst types

function verifyFor(forLoop: For | ForBag): void {
	function verifyForBlock(): void {
		withLoop(forLoop, () => {
			forLoop.block.verify(SK.Do)
		})
	}
	caseOp(forLoop.opIteratee,
		(_: Iteratee) => {
			withVerifyIteratee(_, verifyForBlock)
		},
		verifyForBlock)
}

function withVerifyIteratee({element, bag}: Iteratee, action: () => void): void {
	bag.verify(SK.Val)
	verifyNotLazy(element, _ => _.noLazyIteratee)
	verifyAndPlusLocal(element, action)
}

function verifyMethodImpl(_: MethodImplLike, doVerify: () => void): void {
	verifyName(_.symbol)
	withMethod(_, doVerify)
}

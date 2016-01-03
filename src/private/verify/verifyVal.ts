import Op, {nonNull, opEach, orThrow} from 'op/Op'
import CompileError from '../../CompileError'
import {check, fail, options} from '../context'
import {BlockWrap} from '../ast/Block'
import {Logic, Not} from '../ast/booleans'
import {New} from '../ast/Call'
import Class, {SuperMember} from '../ast/Class'
import Fun, {Funs, GetterFun, MemberFun, SimpleFun} from '../ast/Fun'
import LineContent, {isVal, Val} from '../ast/LineContent'
import {LocalAccess, LocalDeclare} from '../ast/locals'
import {ForBag} from '../ast/Loop'
import Method from '../ast/Method'
import Trait from '../ast/Trait'
import {BagSimple, InstanceOf, Lazy, Member, NumberLiteral, MsRegExp, ObjSimple, Pipe, QuotePlain, QuoteSimple, QuoteTaggedTemplate, Range, SpecialVal, Sub} from '../ast/Val'
import {locals, method, results, withFun, withIife} from './context'
import {missingLocalFail, registerAndPlusLocal, setDeclareAccessed, verifyAndPlusLocal, withBlockLocals} from './locals'
import SK from './SK'
import {makeUseOptional, setName, verifyEachValOrSpread, verifyMemberName} from './util'
import {verifyBlockVal} from './verifyBlock'
import verifyClass from './verifyClass'
import verifyFor from './verifyFor'
import verifyFunLike from './verifyFunLike'
import {verifyFun} from './verifyFunLike'
import verifyTrait from './verifyTrait'
import verifyValOrDo from './verifyValOrDo'

export default function verifyVal(_: Val): void {
	if (_ instanceof BagSimple)
		verifyEachValOrSpread(_.parts)

	else if (_ instanceof BlockWrap)
		withIife(() => verifyBlockVal(_.block))

	else if (_ instanceof Class)
		verifyClass(_)

	else if (_ instanceof ForBag)
		verifyAndPlusLocal(_.built, () => verifyFor(_))

	else if (_ instanceof Fun)
		verifyFun(_)

	else if (_ instanceof GetterFun)
		verifyMemberName(_.name)

	else if (_ instanceof InstanceOf) {
		const {instance, type} = _
		verifyVal(instance)
		verifyVal(type)

	} else if (_ instanceof Lazy)
		withBlockLocals(() => verifyVal(_.value))

	else if (_ instanceof LocalAccess) {
		const {loc, name} = _
		const declare = locals.get(name)
		if (declare === undefined) {
			const builtinPath = orThrow(
				options.opBuiltinPath(name),
				() => missingLocalFail(loc, name))
			results.accessBuiltin(name, builtinPath)
		} else {
			results.localAccessToDeclare.set(_, declare)
			setDeclareAccessed(declare, _)
		}

	} else if (_ instanceof Logic) {
		const {loc, args} = _
		check(args.length > 1, loc, _ => _.argsLogic)
		verifyEachVal(args)

	} else if (_ instanceof Member) {
		const {object, name} = _
		verifyVal(object)
		verifyMemberName(name)

	} else if (_ instanceof MemberFun) {
		const {opObject, name} = _
		verifyOpVal(opObject)
		verifyMemberName(name)

	} else if (_ instanceof Method) {
		const {fun} = _
		if (fun instanceof Fun)
			// fun always has opDeclareThis
			makeUseOptional(orThrow(fun.opDeclareThis))
		fun.args.forEach(makeUseOptional)
		opEach(fun.opRestArg, makeUseOptional)
		verifyFunLike(fun)
		// name set by AssignSingle

	} else if (_ instanceof MsRegExp) {
		const {loc, parts} = _
		parts.forEach(verifyMemberName)
		const onlyPart = parts[0]
		// Check RegExp validity; only possible if this has a single part.
		if (parts.length === 1 && typeof onlyPart === 'string')
			try {
				/* eslint-disable no-new */
				new RegExp(onlyPart)
			} catch (err) {
				if (!(err instanceof SyntaxError))
					// This should never happen.
					throw err
				throw fail(loc, _ => _.badRegExp(onlyPart))
			}

	} else if (_ instanceof New) {
		const {type, args} = _
		verifyVal(type)
		verifyEachValOrSpread(args)

	} else if (_ instanceof Not) {
		verifyVal(_.arg)

	} else if (_ instanceof NumberLiteral) {
		// nothing to do

	} else if (_ instanceof ObjSimple) {
		const keys = new Set()
		for (const {key, value, loc} of _.pairs) {
			check(!keys.has(key), loc, _ => _.duplicateKey(key))
			keys.add(key)
			verifyVal(value)
		}

	} else if (_ instanceof Pipe) {
		const {loc, startValue, pipes} = _
		verifyVal(startValue)
		for (const pipe of pipes)
			registerAndPlusLocal(LocalDeclare.focus(loc), () => {
				verifyVal(pipe)
			})

	} else if (_ instanceof QuotePlain) {
		_.parts.forEach(verifyMemberName)

	} else if (_ instanceof QuoteSimple) {

	} else if (_ instanceof QuoteTaggedTemplate) {
		const {tag, quote} = _
		verifyVal(tag)
		verifyVal(quote)

	} else if (_ instanceof Range) {
		const {start, opEnd} = _
		verifyVal(start)
		verifyOpVal(opEnd)

	} else if (_ instanceof SimpleFun) {
		const {loc, value} = _
		withFun(Funs.Plain, () => {
			registerAndPlusLocal(LocalDeclare.focus(loc), () => {
				verifyVal(value)
			})
		})

	} else if (_ instanceof SpecialVal) {
		setName(_)

	} else if (_ instanceof Sub) {
		const {subbed, args} = _
		verifyVal(subbed)
		verifyEachVal(args)

	} else if (_ instanceof SuperMember) {
		const {loc, name} = _
		check(method !== null, loc, _ => _.superNeedsMethod)
		verifyMemberName(name)

	} else if (_ instanceof Trait)
		verifyTrait(_)

	else
		verifyValOrDo(_, SK.Val)
}

export function ensureValAndVerify(_: LineContent): void {
	if (isVal(_))
		verifyVal(_)
	else
		throw fail(_.loc, _ => _.statementAsValue)
}

export function verifyOpVal(_: Op<Val>): void {
	if (nonNull(_))
		verifyVal(_)
}

export function verifyEachVal(vals: Array<Val>): void {
	for (const _ of vals)
		verifyVal(_)
}

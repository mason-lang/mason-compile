import Op, {nonNull} from 'op/Op'
import {check, fail} from '../context'
import {BlockWrap} from '../ast/Block'
import {Logic, Not} from '../ast/booleans'
import {New} from '../ast/Call'
import Class, {SuperMember} from '../ast/Class'
import Fun from '../ast/Fun'
import LineContent, {isVal, Val} from '../ast/LineContent'
import {LocalAccess, LocalDeclare} from '../ast/locals'
import {ForBag} from '../ast/Loop'
import Method from '../ast/Method'
import Trait from '../ast/Trait'
import Quote, {MsRegExp, QuoteTagged} from '../ast/Quote'
import {BagSimple, InstanceOf, Lazy, Member, NumberLiteral, ObjSimple, Pipe, Range, SpecialVal,
	SpecialVals, Sub} from '../ast/Val'
import {withIife} from './context'
import SK from './SK'
import {setName} from './util'
import {verifyBlockVal} from './verifyBlock'
import {verifyLogic, verifyNot} from './verifyBooleans'
import {verifyEachValOrSpread, verifyNew} from './verifyCall'
import verifyClass, {verifySuperMember} from './verifyClass'
import verifyFun from './verifyFun'
import {registerAndPlusLocal, verifyAndPlusLocal, verifyLocalAccess, withBlockLocals
	} from './verifyLocals'
import verifyLoop from './verifyLoop'
import verifyMemberName from './verifyMemberName'
import verifyMethod from './verifyMethod'
import verifyQuote, {verifyQuoteTagged, verifyRegExp} from './verifyQuote'
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
		verifyAndPlusLocal(_.built, () => verifyLoop(_, SK.Val))

	else if (_ instanceof Fun)
		verifyFun(_)

	else if (_ instanceof InstanceOf) {
		const {instance, type} = _
		verifyVal(instance)
		verifyVal(type)

	} else if (_ instanceof Lazy)
		withBlockLocals(() => verifyVal(_.value))

	else if (_ instanceof LocalAccess)
		verifyLocalAccess(_)

	else if (_ instanceof Logic)
		verifyLogic(_)

	else if (_ instanceof Member) {
		const {object, name} = _
		verifyVal(object)
		verifyMemberName(name)

	} else if (_ instanceof Method)
		verifyMethod(_)

	else if (_ instanceof MsRegExp)
		verifyRegExp(_)

	else if (_ instanceof New)
		verifyNew(_)

	else if (_ instanceof Not)
		verifyNot(_)

	else if (_ instanceof NumberLiteral) {
		// nothing to do

	} else if (_ instanceof ObjSimple) {
		const keys = new Set<string>()
		for (const {key, value, loc} of _.pairs) {
			if (typeof key === 'string') {
				check(!keys.has(key), loc, _ => _.duplicateKey(key))
				keys.add(key)
			} else
				verifyVal(key)
			verifyVal(value)
		}

	} else if (_ instanceof Pipe) {
		const {loc, startValue, pipes} = _
		verifyVal(startValue)
		for (const pipe of pipes)
			registerAndPlusLocal(LocalDeclare.focus(loc), () => {
				verifyVal(pipe)
			})

	} else if (_ instanceof Quote)
		verifyQuote(_)

	else if (_ instanceof QuoteTagged)
		verifyQuoteTagged(_)

	else if (_ instanceof Range) {
		const {start, opEnd} = _
		verifyVal(start)
		verifyOpVal(opEnd)

	} else if (_ instanceof SpecialVal) {
		if (_.kind === SpecialVals.Name)
			setName(_)

	} else if (_ instanceof Sub) {
		const {subbed, args} = _
		verifyVal(subbed)
		verifyEachVal(args)

	} else if (_ instanceof SuperMember)
		verifySuperMember(_)

	else if (_ instanceof Trait)
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

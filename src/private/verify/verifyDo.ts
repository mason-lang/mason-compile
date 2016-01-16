import Op, {nonNull} from 'op/Op'
import {fail} from '../context'
import BuildEntry from '../ast/BuildEntry'
import {Ignore, MemberSet, Pass, SetSub, SpecialDo} from '../ast/Do'
import {Assert, Throw} from '../ast/errors'
import LineContent, {Do, isDo} from '../ast/LineContent'
import {Assign, LocalMutate} from '../ast/locals'
import {Break} from '../ast/Loop'
import {TraitDo} from '../ast/Trait'
import SK from './SK'
import verifyBuildEntry from './verifyBuildEntry'
import {verifyAssert, verifyThrow} from './verifyErrors'
import {verifyAssign, verifyLocalMutate} from './verifyLocals'
import verifyMemberName from './verifyMemberName'
import {accessLocal} from './verifyLocals'
import {verifyBreak} from './verifyLoop'
import {verifyTraitDo} from './verifyTrait'
import verifyVal, {verifyEachVal, verifyOpVal} from './verifyVal'
import verifyValOrDo from './verifyValOrDo'

export default function verifyDo(_: Do): void {
	if (_ instanceof Assert)
		verifyAssert(_)

	else if (_ instanceof Assign)
		verifyAssign(_)

	else if (_ instanceof BuildEntry)
		verifyBuildEntry(_)

	else if (_ instanceof Break)
		verifyBreak(_)

	else if (_ instanceof Ignore) {
		const {ignoredNames} = _
		for (const name of ignoredNames)
			accessLocal(_, name)

	} else if (_ instanceof LocalMutate)
		verifyLocalMutate(_)

	else if (_ instanceof MemberSet) {
		const {object, name, opType, value} = _
		verifyVal(object)
		verifyMemberName(name)
		verifyOpVal(opType)
		verifyVal(value)

	} else if (_ instanceof Pass)
		verifyVal(_.ignored)

	else if (_ instanceof SetSub) {
		const {object, subbeds, opType, value} = _
		verifyVal(object)
		verifyEachVal(subbeds)
		verifyOpVal(opType)
		verifyVal(value)

	} else if (_ instanceof SpecialDo) {
		// nothing to do

	} else if (_ instanceof Throw)
		verifyThrow(_)

	else if (_ instanceof TraitDo)
		verifyTraitDo(_)

	else
		verifyValOrDo(_, SK.Do)
}

export function ensureDoAndVerify(_: LineContent): void {
	if (isDo(_))
		verifyDo(_)
	else
		throw fail(_.loc, _ => _.valueAsStatement)
}

export function verifyOpDo(_: Op<Do>): void {
	if (nonNull(_))
		verifyDo(_)
}

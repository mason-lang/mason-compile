import Op, {nonNull, orThrow} from 'op/Op'
import CompileError from '../../CompileError'
import {check, fail, warn} from '../context'
import {BagEntry, MapEntry, ObjEntryAssign, ObjEntryPlain} from '../ast/Block'
import Class from '../ast/Class'
import {Ignore, MemberSet, Pass, SetSub, SpecialDo} from '../ast/Do'
import {Assert} from '../ast/errors'
import Fun from '../ast/Fun'
import LineContent, {Do, isDo} from '../ast/LineContent'
import {AssignSingle, AssignDestructure, LocalMutate} from '../ast/locals'
import {Break, For, ForBag} from '../ast/Loop'
import Method from '../ast/Method'
import Trait, {TraitDo} from '../ast/Trait'
import {assert} from '../util'
import {isInSwitch, opLoop, results, withMethods, withName} from './context'
import {accessLocal, setDeclareAccessed, withBlockLocals} from './locals'
import SK from './SK'
import {setName, verifyMemberName} from './util'
import {justVerifyLocalDeclare} from './verifyLocalDeclare'
import verifyMethodImplLike from './verifyMethodImplLike'
import verifyVal, {verifyEachVal, verifyOpVal} from './verifyVal'
import verifyValOrDo from './verifyValOrDo'

export default function verifyDo(_: Do): void {
	if (_ instanceof Assert) {
		verifyVal(_.condition)
		verifyOpVal(_.opThrown)

	} else if (_ instanceof AssignSingle) {
		const {assignee, value} = _
		withName(assignee.name, () => {
			const doV = () => {
				/*
				Fun and Class only get name if they are immediately after the assignment.
				so in `x = $after-time 1000 |` the function is not named.
				*/
				//isNamed
				if (value instanceof Class ||
					value instanceof Fun ||
					value instanceof Method ||
					value instanceof Trait)
					setName(value)

				// Assignee registered by verifyLines.
				justVerifyLocalDeclare(assignee)
				verifyVal(value)
			}
			if (assignee.isLazy)
				withBlockLocals(doV)
			else
				doV()
		})

	} else if (_ instanceof AssignDestructure) {
		const {assignees, value} = _
		// Assignees registered by verifyLines.
		for (const _ of assignees)
			justVerifyLocalDeclare(_)
		verifyVal(value)

	} else if (_ instanceof BagEntry) {
		accessLocal(_, 'built')
		verifyVal(_.value)

	} else if (_ instanceof Break) {
		const {opValue, loc} = _
		verifyOpVal(opValue)
		const loop = orThrow(opLoop, () => fail(loc, _ => _.misplacedBreak))

		if (loop instanceof For)
			if (results.isStatement(loop))
				check(opValue === null, loc, _ => _.breakCantHaveValue)
			else
				check(opValue !== null, loc, _ => _.breakNeedsValue)
		else {
			// (ForAsync isn't really a loop)
			assert(loop instanceof ForBag)
			check(opValue === null, this.loc, _ => _.breakValInForBag)
		}

		if (isInSwitch) {
			results.loopsNeedingLabel.add(loop)
			results.breaksInSwitch.add(_)
		}

	} else if (_ instanceof Ignore) {
		const {ignoredNames} = _
		for (const name of ignoredNames)
			accessLocal(_, name)

	} else if (_ instanceof LocalMutate)
		verifyVal(_.value)

	else if (_ instanceof MapEntry) {
		const {key, val} = _
		accessLocal(_, 'built')
		verifyVal(key)
		verifyVal(val)

	} else if (_ instanceof MemberSet) {
		const {object, name, opType, value} = _
		verifyVal(object)
		verifyMemberName(name)
		verifyOpVal(opType)
		verifyVal(value)

	} else if (_ instanceof ObjEntryAssign) {
		const {assign} = _
		if (!results.isObjEntryExport(_))
			accessLocal(_, 'built')
		//verifyAssign
		verifyDo(assign)
		for (const assignee of assign.allAssignees())
			setDeclareAccessed(assignee, _)

	} else if (_ instanceof ObjEntryPlain) {
		const {loc, name, value} = _
		if (results.isObjEntryExport(_))
			check(typeof name === 'string', loc, _ => _.exportName)
		else {
			accessLocal(_, 'built')
			verifyMemberName(name)
		}
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

	} else if (_ instanceof TraitDo) {
		const {implementor, trait, statics, methods} = _
		verifyVal(implementor)
		verifyVal(trait)
		withMethods(() => {
			for (const _ of statics)
				verifyMethodImplLike(_)
			for (const _ of methods)
				verifyMethodImplLike(_)
		})

	} else
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

import Await from '../ast/Await'
import {Cond, Conditional} from '../ast/booleans'
import Call from '../ast/Call'
import Case from '../ast/Case'
import {SuperCall} from '../ast/Class'
import Del from '../ast/Del'
import {Except} from '../ast/errors'
import LineContent from '../ast/LineContent'
import {For, ForAsync} from '../ast/Loop'
import Switch from '../ast/Switch'
import With from '../ast/With'
import YieldLike from '../ast/YieldLike'
import SK from './SK'
import verifyAwait from './verifyAwait'
import {verifyCond, verifyConditional} from './verifyBooleans'
import verifyCall from './verifyCall'
import verifyCase from './verifyCase'
import {verifySuperCall} from './verifyClass'
import verifyDel from './verifyDel'
import {verifyExcept} from './verifyErrors'
import verifyLoop, {verifyForAsync} from './verifyLoop'
import verifySwitch from './verifySwitch'
import verifyWith from './verifyWith'
import verifyYieldLike from './verifyYieldLike'

/** This is a shared implementation for both [[verifyVal]] and [[verifyDo]]. */
export default function verifyValOrDo(_: LineContent, sk: SK): void {
	if (_ instanceof Await)
		verifyAwait(_)

	else if (_ instanceof Call)
		verifyCall(_)

	else if (_ instanceof Case)
		verifyCase(_, sk)

	else if (_ instanceof Cond)
		verifyCond(_, sk)

	else if (_ instanceof Conditional)
		verifyConditional(_, sk)

	else if (_ instanceof Del)
		verifyDel(_)

	else if (_ instanceof Except)
		verifyExcept(_, sk)

	else if (_ instanceof For)
		verifyLoop(_, sk)

	else if (_ instanceof ForAsync)
		verifyForAsync(_, sk)

	else if (_ instanceof SuperCall)
		verifySuperCall(_, sk)

	else if (_ instanceof Switch)
		verifySwitch(_, sk)

	else if (_ instanceof With)
		verifyWith(_, sk)

	else if (_ instanceof YieldLike)
		verifyYieldLike(_)

	else
		// Should have handled all types.
		throw new Error(_.constructor.name)
}

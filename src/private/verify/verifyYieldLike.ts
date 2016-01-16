import {Funs} from '../ast/Fun'
import YieldLike, {Yield, YieldTo} from '../ast/YieldLike'
import {check} from '../context'
import {Keywords} from '../token/Keyword'
import {funKind} from './context'
import verifyVal, {verifyOpVal} from './verifyVal'

export default function verifyYieldLike(_: YieldLike): void {
	if (_ instanceof Yield) {
		const {loc, opValue} = _
		check(funKind === Funs.Generator, loc, _ => _.misplacedYield(Keywords.Yield))
		verifyOpVal(opValue)

	} else if (_ instanceof YieldTo) {
		const {loc, value} = _
		check(funKind === Funs.Generator, loc, _ => _.misplacedYield(Keywords.YieldTo))
		verifyVal(value)

	} else
		throw new Error(_.constructor.name)
}

import Expression, {YieldExpression, YieldDelegateExpression} from 'esast/lib/Expression'
import {opMap} from 'op/Op'
import YieldLike, {Yield, YieldTo} from '../ast/YieldLike'
import transpileVal from './transpileVal'

export function transpileYieldLikeNoLoc(_: YieldLike): Expression {
	if (_ instanceof Yield)
		return new YieldExpression(opMap(_.opValue, transpileVal))
	else if (_ instanceof YieldTo)
		return new YieldDelegateExpression(transpileVal(_.value))
	else
		throw new Error(_.constructor.name)
}

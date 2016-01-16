import Expression, {YieldExpression} from 'esast/lib/Expression'
import Await from '../ast/Await'
import transpileVal from './transpileVal'

export function transpileAwaitNoLoc({value}: Await): Expression {
	return new YieldExpression(transpileVal(value))
}

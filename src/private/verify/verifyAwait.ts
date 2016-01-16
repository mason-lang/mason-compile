import Await from '../ast/Await'
import {Funs} from '../ast/Fun'
import {check} from '../context'
import {funKind} from './context'
import verifyVal from './verifyVal'

export default function verifyAwait({loc, value}: Await): void {
	check(funKind === Funs.Async, loc, _ => _.misplacedAwait)
	verifyVal(value)
}

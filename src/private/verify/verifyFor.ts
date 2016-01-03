import {caseOp} from 'op/Op'
import {For, ForBag, Iteratee} from '../ast/Loop'
import {withLoop} from './context'
import {verifyAndPlusLocal} from './locals'
import {verifyNotLazy} from './util'
import {verifyBlockDo} from './verifyBlock'
import verifyVal from './verifyVal'

export default function verifyFor(_: For | ForBag): void {
	const {opIteratee, block} = _
	function verifyForBlock(): void {
		withLoop(_, () => verifyBlockDo(block))
	}
	caseOp(opIteratee,
		_ => withVerifyIteratee(_, verifyForBlock),
		verifyForBlock)
}

export function withVerifyIteratee({element, bag}: Iteratee, action: () => void): void {
	verifyVal(bag)
	verifyNotLazy(element, _ => _.noLazyIteratee)
	verifyAndPlusLocal(element, action)
}

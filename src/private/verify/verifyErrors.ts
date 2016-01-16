import {caseOp, opEach} from 'op/Op'
import {warn} from '../context'
import {Assert, Catch, Except, Throw} from '../ast/errors'
import {isEmpty} from '../util'
import SK from './SK'
import {makeUseOptionalIfFocus, verifyNotLazy} from './util'
import {verifyBlockDo, verifyBlockSK} from './verifyBlock'
import {plusLocals, verifyAndPlusLocal} from './verifyLocals'
import verifyVal, {verifyOpVal} from './verifyVal'

export function verifyAssert({condition, opThrown}: Assert): void {
	verifyVal(condition)
	verifyOpVal(opThrown)
}

export function verifyExcept(_: Except, sk: SK): void {
	const {loc, tried, typedCatches, opCatchAll, allCatches, opElse, opFinally} = _

	caseOp(
		opElse,
		_ => {
			plusLocals(verifyBlockDo(tried), () => verifyBlockSK(_, sk))
			if (isEmpty(allCatches))
				warn(loc, _ => _.elseRequiresCatch)
		},
		() => verifyBlockSK(tried, sk))

	if (isEmpty(allCatches) && opFinally === null)
		warn(loc, _ => _.uselessExcept)

	for (const _ of typedCatches)
		verifyCatch(_, sk)
	opEach(opCatchAll, _ => verifyCatch(_, sk))
	opEach(opFinally, verifyBlockDo)
}

function verifyCatch({caught, block}: Catch, sk: SK): void {
	// No need to do anything with `sk` except pass it to my block.
	makeUseOptionalIfFocus(caught)
	verifyNotLazy(caught, _ => _.noLazyCatch)
	verifyAndPlusLocal(caught, () => {
		verifyBlockSK(block, sk)
	})
}

export function verifyThrow(_: Throw): void {
	verifyOpVal(_.opThrown)
}

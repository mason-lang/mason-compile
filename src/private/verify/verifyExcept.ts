import {caseOp, opEach} from 'op/Op'
import {warn} from '../context'
import {Catch, Except} from '../ast/errors'
import {isEmpty} from '../util'
import {plusLocals, verifyAndPlusLocal} from './locals'
import SK, {markStatement} from './SK'
import {makeUseOptionalIfFocus, verifyNotLazy} from './util'
import {verifyBlockDo, verifyBlockSK} from './verifyBlock'
import {verifyEachSK, verifyOpSK} from './verifySK'

export default function verifyExcept(_: Except, sk: SK): void {
	const {loc, try: _try, typedCatches, opCatchAll, allCatches, opElse, opFinally} = _

	markStatement(_, sk)
	caseOp(opElse,
		_ => {
			plusLocals(verifyBlockDo(_try), () => verifyBlockSK(_, sk))
			if (isEmpty(allCatches))
				warn(loc, _ => _.elseRequiresCatch)
		},
		() => verifyBlockSK(_try, sk))

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

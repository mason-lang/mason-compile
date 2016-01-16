import {caseOp, opEach} from 'op/Op'
import Case, {CasePart, Pattern} from '../ast/Case'
import {withIifeIfVal} from './context'
import SK from './SK'
import {verifyBlockSK} from './verifyBlock'
import verifyDo from './verifyDo'
import {verifyAndPlusLocal, verifyAndPlusLocals} from './verifyLocals'
import verifyVal from './verifyVal'

export default function verifyCase({opCased, parts, opElse}: Case, sk: SK): void {
	withIifeIfVal(sk, () => {
		const doIt = () => {
			for (const _ of parts)
				verifyCasePart(_, sk)
			opEach(opElse, _ => verifyBlockSK(_, sk))
		}
		caseOp(
			opCased,
			_ => {
				verifyDo(_)
				verifyAndPlusLocal(_.assignee, doIt)
			},
			doIt)
	})
}

function verifyCasePart({test, result}: CasePart, sk: SK): void {
	if (test instanceof Pattern) {
		verifyVal(test.type)
		verifyVal(test.patterned)
		verifyAndPlusLocals(test.locals, () => verifyBlockSK(result, sk))
	} else {
		verifyVal(test)
		verifyBlockSK(result, sk)
	}
}

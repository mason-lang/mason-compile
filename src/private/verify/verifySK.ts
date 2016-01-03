import Op, {nonNull} from 'op/Op'
import LineContent from '../ast/LineContent'
import SK from './SK'
import {ensureDoAndVerify} from './verifyDo'
import {ensureValAndVerify} from './verifyVal'

//see verifyValOrDo
export default function verifySK(_: LineContent, sk: SK): void {
	(sk === SK.Val ? ensureValAndVerify : ensureDoAndVerify)(_)
}

export function verifyOpSK(_: Op<LineContent>, sk: SK): void {
	if (nonNull(_))
		verifySK(_, sk)
}

export function verifyEachSK(asts: Array<LineContent>, sk: SK): void {
	for (const _ of asts)
		verifySK(_, sk)
}


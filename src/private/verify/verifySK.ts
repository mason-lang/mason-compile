import Op, {nonNull} from 'op/Op'
import {LineContent} from '../MsAst'
import SK from './SK'
import {verifyDoP} from './verifyDo'
import {verifyValP} from './verifyVal'

//see verifyValOrDo
export default function verifySK(_: LineContent, sk: SK) {
	if (sk === SK.Val)
		verifyValP(_)
	else
		verifyDoP(_)
}

export function verifyOpSK(_: Op<LineContent>, sk: SK) {
	if (nonNull(_))
		verifySK(_, sk)
}

export function verifyEachSK(asts: Array<LineContent>, sk: SK) {
	for (const _ of asts)
		verifySK(_, sk)
}


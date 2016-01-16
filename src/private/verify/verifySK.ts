import LineContent from '../ast/LineContent'
import SK from './SK'
import {ensureDoAndVerify} from './verifyDo'
import {ensureValAndVerify} from './verifyVal'

/** Verify as a Val or Do depending on `sk`. */
export default function verifySK(_: LineContent, sk: SK): void {
	(sk === SK.Val ? ensureValAndVerify : ensureDoAndVerify)(_)
}

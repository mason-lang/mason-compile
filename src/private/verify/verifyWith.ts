import With from '../ast/With'
import {withIifeIfVal} from './context'
import SK from './SK'
import {makeUseOptionalIfFocus} from './util'
import {verifyBlockDo} from './verifyBlock'
import {verifyAndPlusLocal} from './verifyLocals'
import verifyVal from './verifyVal'

export default function verifyWith({value, declare, block}: With, sk: SK): void {
	verifyVal(value)
	withIifeIfVal(sk, () => {
		if (sk === SK.Val)
			makeUseOptionalIfFocus(declare)
		verifyAndPlusLocal(declare, () => {
			verifyBlockDo(block)
		})
	})
}

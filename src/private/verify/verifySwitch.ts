import {opEach} from 'op/Op'
import Switch, {SwitchPart} from '../ast/Switch'
import {withIifeIfVal, withInSwitch} from './context'
import SK from './SK'
import {verifyBlockSK} from './verifyBlock'
import verifyVal, {verifyEachVal} from './verifyVal'

export default function verifySwitch({switched, parts, opElse}: Switch, sk: SK): void {
	withIifeIfVal(sk, () => {
		withInSwitch(true, () => {
			verifyVal(switched)
			for (const _ of parts)
				verifySwitchPart(_, sk)
			opEach(opElse, _ => verifyBlockSK(_, sk))
		})
	})
}

function verifySwitchPart(_: SwitchPart, sk: SK): void {
	const {values, result} = _
	verifyEachVal(values)
	verifyBlockSK(result, sk)
}

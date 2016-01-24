import Block from '../ast/Block'
import {Cond, Conditional} from '../ast/booleans'
import {withIifeIf} from './context'
import SK from './SK'
import {verifyBlockSK} from './verifyBlock'
import verifySK from './verifySK'
import verifyVal from './verifyVal'

export function verifyCond({test, ifTrue, ifFalse}: Cond, sk: SK): void {
	verifyVal(test)
	verifySK(ifTrue, sk)
	verifySK(ifFalse, sk)
}

export function verifyConditional({test, result}: Conditional, sk: SK): void {
	verifyVal(test)
	withIifeIf(result instanceof Block && sk === SK.Val, () => {
		if (result instanceof Block)
			verifyBlockSK(result, sk)
		else
			verifySK(result, sk)
	})
}

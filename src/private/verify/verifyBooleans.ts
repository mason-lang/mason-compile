import Block from '../ast/Block'
import {Cond, Conditional, Logic, Not} from '../ast/booleans'
import {check} from '../context'
import {withIifeIf} from './context'
import SK from './SK'
import {verifyBlockSK} from './verifyBlock'
import verifySK from './verifySK'
import verifyVal, {verifyEachVal} from './verifyVal'

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

export function verifyLogic({loc, args}: Logic): void {
	check(args.length > 1, loc, _ => _.argsLogic)
	verifyEachVal(args)
}

export function verifyNot({arg}: Not): void {
	verifyVal(arg)
}

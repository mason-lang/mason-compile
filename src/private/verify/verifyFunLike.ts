import {opEach} from 'op/Op'
import {check} from '../context'
import {Fun, FunAbstract, FunLike} from '../MsAst'
import {assert, cat} from '../util'
import {withFun} from './context'
import {verifyAndPlusLocals} from './locals'
import SK from './SK'
import {verifyBlockSK} from './verifyBlock'
import {justVerifyLocalDeclare} from './verifyLocalDeclare'
import {verifyOpVal} from './verifyVal'

export default function verifyFunLike(_: FunLike) {
	const {args, opRestArg, opReturnType} = _
	if (_ instanceof FunAbstract) {
		for (const _ of args)
			justVerifyLocalDeclare(_)
		opEach(opRestArg, justVerifyLocalDeclare)
		verifyOpVal(opReturnType)
	} else if (_ instanceof Fun) {
		verifyFun(_)
	} else
		throw new Error()
}

export function verifyFun({loc, opReturnType, isDo, opDeclareThis, args, opRestArg, kind, block}: Fun) {
	check(opReturnType === null || !isDo, loc, _ => _.doFuncCantHaveType)
	verifyOpVal(opReturnType)
	const allArgs = cat(opDeclareThis, args, opRestArg)
	withFun(kind, () => {
		verifyAndPlusLocals(allArgs, () => {
			verifyBlockSK(block, isDo ? SK.Do : SK.Val)
		})
	})
	// name set by AssignSingle
}

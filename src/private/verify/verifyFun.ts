import {check} from '../context'
import Fun, {FunBlock, FunGetter, FunOperator, FunMember, Funs, FunSimple, FunUnary
	} from '../ast/Fun'
import {LocalDeclare} from '../ast/locals'
import {cat} from '../util'
import {withFun} from './context'
import SK from './SK'
import {verifyBlockSK} from './verifyBlock'
import {registerAndPlusLocal, verifyAndPlusLocals} from './verifyLocals'
import verifyMemberName from './verifyMemberName'
import verifyVal, {verifyOpVal} from './verifyVal'

export default function verifyFun(_: Fun): void {
	if (_ instanceof FunBlock)
		verifyFunBlock(_)

	else if (_ instanceof FunGetter)
		verifyMemberName(_.name)

	else if (_ instanceof FunMember) {
		const {opObject, name} = _
		verifyOpVal(opObject)
		verifyMemberName(name)

	} else if (_ instanceof FunOperator || _ instanceof FunUnary) {
		// do nothing

	} else if (_ instanceof FunSimple) {
		const {loc, value} = _
		withFun(Funs.Plain, () => {
			registerAndPlusLocal(LocalDeclare.focus(loc), () => {
				verifyVal(value)
			})
		})

	} else
		throw new Error(_.constructor.name)
}

export function verifyFunBlock(
	{loc, opReturnType, isDo, opDeclareThis, args, opRestArg, kind, block}: FunBlock
	): void {
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

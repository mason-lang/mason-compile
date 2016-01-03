import {orThrow} from 'op/Op'
//rename this file to verifyClassTraitCommon
import {ClassTraitDo, MethodGetter, MethodImpl, MethodImplLike, MethodSetter} from '../ast/classTraitCommon'
import {assert} from '../util'
import {withMethod} from './context'
import {verifyAndPlusLocal, verifyAndPlusLocals} from './locals'
import {makeUseOptional, verifyMemberName} from './util'
import {verifyBlockDo, verifyBlockVal} from './verifyBlock'
import {verifyFun} from './verifyFunLike'
import verifyVal from './verifyVal'

export default function verifyMethodImplLike(_: MethodImplLike): void {
	function doit(doVerify: () => void): void {
		verifyMemberName(_.symbol)
		withMethod(_, doVerify)
	}

	if (_ instanceof MethodImpl) {
		const {fun} = _
		doit(() => {
			// fun always has opDeclareThis
			makeUseOptional(orThrow(fun.opDeclareThis))
			verifyFun(fun)
		})

	} else if (_ instanceof MethodGetter) {
		const {declareThis, block} = _
		doit(() => {
			makeUseOptional(declareThis)
			verifyAndPlusLocals([declareThis], () => {
				verifyBlockVal(block)
			})
		})

	} else if (_ instanceof MethodSetter) {
		const {declareThis, declareFocus, block} = _
		doit(() => {
			verifyAndPlusLocals([declareThis, declareFocus], () => {
				verifyBlockDo(block)
			})
		})

	} else
		throw new Error(_.constructor.name)
}

export function verifyClassTraitDo({declareFocus, block}: ClassTraitDo): void {
	verifyAndPlusLocal(declareFocus, () => verifyBlockDo(block))
}

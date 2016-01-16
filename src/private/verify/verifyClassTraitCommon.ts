import {orThrow} from 'op/Op'
import {ClassTraitDo, MethodGetter, MethodImpl, MethodImplLike, MethodSetter
	} from '../ast/classTraitCommon'
import {withIife, withMethod} from './context'
import {makeUseOptional} from './util'
import {verifyBlockDo, verifyBlockVal} from './verifyBlock'
import {verifyFunBlock} from './verifyFun'
import {verifyAndPlusLocal, verifyAndPlusLocals} from './verifyLocals'
import verifyMemberName from './verifyMemberName'

export function verifyMethodImplLike(_: MethodImplLike): void {
	function doit(doVerify: () => void): void {
		verifyMemberName(_.symbol)
		withMethod(_, doVerify)
	}

	if (_ instanceof MethodImpl) {
		const {fun} = _
		doit(() => {
			// fun always has opDeclareThis
			makeUseOptional(orThrow(fun.opDeclareThis))
			verifyFunBlock(fun)
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
	withIife(() => {
		verifyAndPlusLocal(declareFocus, () => verifyBlockDo(block))
	})
}

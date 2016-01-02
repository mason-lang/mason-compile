import {orThrow} from 'op/Op'
import {ClassTraitDo, MethodGetter, MethodImpl, MethodImplLike, MethodSetter} from '../MsAst'
import {assert} from '../util'
import {withMethod} from './context'
import {verifyAndPlusLocal, verifyAndPlusLocals} from './locals'
import {makeUseOptional, verifyName} from './util'
import {verifyBlockDo, verifyBlockVal} from './verifyBlock'
import verifyVal from './verifyVal'

export default function verifyMethodImplLike(_: MethodImplLike): void {
	function doit(doVerify: () => void): void {
		verifyName(_.symbol)
		withMethod(_, doVerify)
	}

	if (_ instanceof MethodImpl) {
		const {fun} = _
		doit(() => {
			//opDeclareThis always exists, let type system know this
			makeUseOptional(orThrow(fun.opDeclareThis))
			//verifyFun
			verifyVal(fun)
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
		throw new Error()
}

export function verifyClassTraitDo({declareFocus, block}: ClassTraitDo): void {
	verifyAndPlusLocal(declareFocus, () => verifyBlockDo(block))
}

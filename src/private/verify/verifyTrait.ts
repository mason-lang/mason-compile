import {opEach} from 'op/Op'
import {Trait} from '../MsAst'
import {withMethods} from './context'
import verifyMethodImplLike, {verifyClassTraitDo} from './verifyMethodImplLike'
import verifyVal, {verifyEachVal} from './verifyVal'

export default function verifyTrait({superTraits, opDo, statics, methods}: Trait) {
	verifyEachVal(superTraits)
	//withIife, like for class?
	opEach(opDo, verifyClassTraitDo)
	withMethods(() => {
		for (const _ of statics)
			verifyMethodImplLike(_)
		for (const _ of methods)
			verifyMethodImplLike(_)
	})
	// name set by AssignSingle
}

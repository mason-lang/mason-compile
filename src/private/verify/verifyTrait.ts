import {opEach} from 'op/Op'
import Trait, {TraitDo} from '../ast/Trait'
import {withMethods} from './context'
import {verifyClassTraitDo, verifyMethodImplLike} from './verifyClassTraitCommon'
import verifyVal, {verifyEachVal} from './verifyVal'

export default function verifyTrait({superTraits, opDo, statics, methods}: Trait): void {
	verifyEachVal(superTraits)
	opEach(opDo, verifyClassTraitDo)
	withMethods(() => {
		for (const _ of statics)
			verifyMethodImplLike(_)
		for (const _ of methods)
			verifyMethodImplLike(_)
	})
	// name set by AssignSingle
}

export function verifyTraitDo(_: TraitDo): void {
	const {implementor, trait, statics, methods} = _
	verifyVal(implementor)
	verifyVal(trait)
	withMethods(() => {
		for (const _ of statics)
			verifyMethodImplLike(_)
		for (const _ of methods)
			verifyMethodImplLike(_)
	})
}

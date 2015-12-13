import {ArrayExpression, Literal, ObjectExpression} from 'esast/dist/ast'
import {ifElse} from '../util'
import {IdFocus, ReturnFocus} from './ast-constants'
import {verifyResults} from './context'
import {transpileMethodToProperty} from './transpileMethod'
import {blockWrap, msCall, plainLet, t0, t3} from './util'

export default function() {
	const name = new Literal(verifyResults.name(this))
	const supers = new ArrayExpression(this.superTraits.map(t0))
	const trait = msCall('trait', name, supers, methods(this.statics), methods(this.methods))
	return ifElse(this.opDo,
		_ => blockWrap(t3(_.block, plainLet(IdFocus, trait), null, ReturnFocus)),
		() => trait)
}

export function transpileTraitDo() {
	return msCall('traitWithDefs',
		t0(this.implementor), t0(this.trait), methods(this.statics), methods(this.methods))
}

function methods(_) {
	return new ObjectExpression(_.map(transpileMethodToProperty))
}

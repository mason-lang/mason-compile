import {ArrayExpression, Literal, ObjectExpression} from 'esast/dist/ast'
import {ifElse} from '../util'
import {IdFocus, ReturnFocus} from './ast-constants'
import {verifyResults} from './context'
import {transpileMethodToProperty} from './transpileMethod'
import {blockWrap, msCall, plainLet, t0, t3} from './util'

export default function() {
	const name = new Literal(verifyResults.name(this))
	const supers = new ArrayExpression(this.superKinds.map(t0))
	const kind = msCall('kind', name, supers, methods(this.statics), methods(this.methods))
	return ifElse(this.opDo,
		_ => blockWrap(t3(_.block, plainLet(IdFocus, kind), null, ReturnFocus)),
		() => kind)
}

function methods(_) {
	return new ObjectExpression(_.map(transpileMethodToProperty))
}

import {ArrayExpression, Expression, LiteralString, ObjectExpression, Statement} from 'esast/lib/ast'
import {caseOp} from 'op/Op'
import {MethodImplLike} from '../MsAst'
import {IdFocus, ReturnFocus} from './ast-constants'
import {verifyResults} from './context'
import {transpileMethodToProperty} from './transpileMethod'
import {blockWrap, msCall, plainLet, t0, t3} from './util'

export default function(): Expression {
	const name = new LiteralString(verifyResults.name(this))
	const supers = new ArrayExpression(this.superTraits.map(t0))
	const trait = msCall('trait', name, supers, methods(this.statics), methods(this.methods))
	return caseOp(this.opDo,
		_ => blockWrap(<any> t3(_.block, plainLet(IdFocus, trait), null, ReturnFocus)),
		() => trait)
}

export function transpileTraitDo(): Statement {
	return msCall('traitWithDefs',
		t0(this.implementor), t0(this.trait), methods(this.statics), methods(this.methods))
}

function methods(_: Array<MethodImplLike>): ObjectExpression {
	return new ObjectExpression(_.map(transpileMethodToProperty))
}

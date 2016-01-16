import Expression, {ArrayExpression} from 'esast/lib/Expression'
import ObjectExpression from 'esast/lib/ObjectExpression'
import {LiteralString} from 'esast/lib/Literal'
import Statement, {ExpressionStatement} from 'esast/lib/Statement'
import {caseOp} from 'op/Op'
import {MethodImplLike} from '../ast/classTraitCommon'
import Trait, {TraitDo} from '../ast/Trait'
import {verifyResults} from './context'
import {idFocus, returnFocus} from './esast-constants'
import {msCall} from './ms'
import {transpileBlockVal} from './transpileBlock'
import {transpileMethodToProperty} from './transpileClassTraitCommon'
import {plainLet} from './transpileLocals'
import transpileVal from './transpileVal'

export function transpileTraitNoLoc(_: Trait): Expression {
	const {superTraits, opDo, statics, methods} = _
	const name = new LiteralString(verifyResults.name(_))
	const supers = new ArrayExpression(superTraits.map(transpileVal))
	const trait = msCall('trait', name, supers, methodsObject(statics), methodsObject(methods))
	return caseOp(
		opDo,
		_ => transpileBlockVal(_.block, {lead: plainLet(idFocus, trait), follow: returnFocus}),
		() => trait)
}

export function transpileTraitDoNoLoc(_: TraitDo): Statement {
	const {implementor, trait, statics, methods} = _
	return new ExpressionStatement(msCall(
		'traitWithDefs',
		transpileVal(implementor),
		transpileVal(trait),
		methodsObject(statics),
		methodsObject(methods)))
}

function methodsObject(_: Array<MethodImplLike>): ObjectExpression {
	return new ObjectExpression(_.map(transpileMethodToProperty))
}

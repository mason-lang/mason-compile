import Expression, {ArrayExpression, LiteralString} from 'esast/lib/Expression'
import ObjectExpression from 'esast/lib/ObjectExpression'
import Statement, {ExpressionStatement} from 'esast/lib/Statement'
import {caseOp} from 'op/Op'
import {MethodImplLike} from '../ast/classTraitCommon'
import Trait, {TraitDo} from '../ast/Trait'
import {verifyResults} from './context'
import {IdFocus, ReturnFocus} from './esast-constants'
import transpileBlock from './transpileBlock'
import {transpileMethodToProperty} from './transpileMethod'
import transpileVal from './transpileVal'
import {blockWrap, msCall, plainLet} from './util'

export function transpileTraitNoLoc(_: Trait): Expression {
	const {superTraits, opDo, statics, methods} = _
	const name = new LiteralString(verifyResults.name(_))
	const supers = new ArrayExpression(superTraits.map(transpileVal))
	const trait = msCall('trait', name, supers, methodsObject(statics), methodsObject(methods))
	return caseOp(opDo,
		_ => blockWrap(transpileBlock(_.block, plainLet(IdFocus, trait), null, ReturnFocus)),
		() => trait)
}

export function transpileTraitDoNoLoc(_: TraitDo): Statement {
	const {implementor, trait, statics, methods} = _
	return new ExpressionStatement(msCall('traitWithDefs',
		transpileVal(implementor), transpileVal(trait), methodsObject(statics), methodsObject(methods)))
}

function methodsObject(_: Array<MethodImplLike>): ObjectExpression {
	return new ObjectExpression(_.map(transpileMethodToProperty))
}

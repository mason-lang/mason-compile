import {MethodDefinitionGet, MethodDefinitionNonConstructor, MethodDefinitionPlain, MethodDefinitionSet} from 'esast/lib/Class'
import Expression from 'esast/lib/Expression'
import {FunctionExpression} from 'esast/lib/Function'
import {ComputedName, Property, PropertyGet, PropertyMethod, PropertyName, PropertySet} from 'esast/lib/ObjectExpression'
import {propertyIdOrLiteral} from 'esast-create-util/lib/util'
import {MethodGetter, MethodImpl, MethodImplLike, MethodSetter} from '../ast/classTraitCommon'
import {QuoteAbstract} from '../ast/Val'
import {DeclareLexicalThis, IdFocus} from './esast-constants'
import transpileBlock from './transpileBlock'
import transpileFun from './transpileFun'
import transpileVal from './transpileVal'
import {loc, msCall} from './util'

/** Transpile method to a MethodDefinition in a class. */
export function transpileMethodToDefinition(_: MethodImplLike, isStatic: boolean): MethodDefinitionNonConstructor {
	const {name, ctr, value} = methodParams(_, {method: MethodDefinitionPlain, get: MethodDefinitionGet, set: MethodDefinitionSet})
	const {params, body, generator, async} = value
	return loc(_, new ctr(name, value, {static: isStatic}))
}

/** Transpile method to a property of an object. */
export function transpileMethodToProperty(_: MethodImplLike): Property {
	const {name, ctr, value} = methodParams(_, {method: PropertyMethod, get: PropertyGet, set: PropertySet})
	return loc(_, new ctr(name, value))
}

function methodParams<A>(_: MethodImplLike, ctrs: {method: A, get: A, set: A})
	: {name: PropertyName, ctr: A, value: FunctionExpression} {
	const symbol = _.symbol
	return {
		name: typeof symbol === 'string' ?
			propertyIdOrLiteral(symbol) :
			new ComputedName(
				symbol instanceof QuoteAbstract ?
				//transpileQuoteAbstract
				transpileVal(symbol) :
				msCall('symbol', transpileVal(symbol))),
		ctr: _ instanceof MethodImpl ? ctrs.method : _ instanceof MethodGetter ? ctrs.get : ctrs.set,
		value: _ instanceof MethodImpl ?
			//this is never an ArrowFunctionExpression because fun always has `this`
			<FunctionExpression> transpileFun(_.fun) :
			//shouldn't need <>
			getSetFun(<MethodGetter | MethodSetter> _)
	}
}

function getSetFun(_: MethodGetter | MethodSetter): FunctionExpression {
	const args = _ instanceof MethodGetter ? [] : [IdFocus]
	return new FunctionExpression(null, args, transpileBlock(_.block, DeclareLexicalThis))
}

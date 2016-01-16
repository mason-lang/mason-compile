import {MethodDefinitionGet, MethodDefinitionNonConstructor, MethodDefinitionPlain,
	MethodDefinitionSet} from 'esast/lib/Class'
import {FunctionExpression} from 'esast/lib/Function'
import {ComputedName, Property, PropertyGet, PropertyMethod, PropertyName, PropertySet
	} from 'esast/lib/ObjectExpression'
import {propertyIdOrLiteral} from 'esast-create-util/lib/util'
import {MethodGetter, MethodImpl, MethodImplLike, MethodSetter} from '../ast/classTraitCommon'
import Quote from '../ast/Quote'
import {declareLexicalThis, idFocus} from './esast-constants'
import {msCall} from './ms'
import transpileBlock from './transpileBlock'
import {transpileFunBlock} from './transpileFun'
import transpileQuote from './transpileQuote'
import transpileVal from './transpileVal'
import {loc} from './util'

/** Transpile method to a MethodDefinition in a class. */
export function transpileMethodToDefinition(_: MethodImplLike, isStatic: boolean)
	: MethodDefinitionNonConstructor {
	const {name, ctr, value} = methodParams(
		_,
		{method: MethodDefinitionPlain, get: MethodDefinitionGet, set: MethodDefinitionSet})
	return loc(_, new ctr(name, value, {static: isStatic}))
}

/** Transpile method to a property of an object. */
export function transpileMethodToProperty(_: MethodImplLike): Property {
	const {name, ctr, value} =
		methodParams(_, {method: PropertyMethod, get: PropertyGet, set: PropertySet})
	return loc(_, new ctr(name, value))
}

function methodParams<A>(_: MethodImplLike, ctrs: {method: A, get: A, set: A})
	: {name: PropertyName, ctr: A, value: FunctionExpression} {
	const symbol = _.symbol
	return {
		name: typeof symbol === 'string' ?
			propertyIdOrLiteral(symbol) :
			new ComputedName(
				symbol instanceof Quote ?
				transpileQuote(symbol) :
				msCall('symbol', transpileVal(symbol))),
		ctr: _ instanceof MethodImpl ? ctrs.method : _ instanceof MethodGetter ? ctrs.get : ctrs.set,
		value: _ instanceof MethodImpl ?
			// This is never an ArrowFunctionExpression because fun always has `this`.
			<FunctionExpression> transpileFunBlock(_.fun) :
			getSetFun(<MethodGetter | MethodSetter> _)
	}
}

function getSetFun(_: MethodGetter | MethodSetter): FunctionExpression {
	const args = _ instanceof MethodGetter ? [] : [idFocus]
	return new FunctionExpression(null, args, transpileBlock(_.block, {lead: declareLexicalThis}))
}

import {Expression, FunctionExpression, MethodDefinitionPlain, Property, PropertyGet, PropertyMethod, PropertySet} from 'esast/lib/ast'
import {propertyIdOrLiteral} from 'esast-create-util/lib/util'
import {MethodGetter, MethodImpl, MethodImplLike, MethodSetter, QuoteAbstract} from '../MsAst'
import {DeclareLexicalThis, IdFocus} from './ast-constants'
import {msCall, t0, t1} from './util'

/** Transpile method to a MethodDefinition in a class. */
export function transpileMethodToDefinition(_: MethodImplLike, isStatic: boolean): MethodDefinitionPlain {
	const {computed, key, kind, value} = methodParams(_)
	return new MethodDefinitionPlain(key, value, kind, isStatic, computed)
}

/** Transpile method to a property of an object. */
export function transpileMethodToProperty(_: MethodImplLike): Property {
	const {computed, key, kind, value} = methodParams(_)
	switch (kind) {
		case 'method':
			return new PropertyMethod(key, value, computed)
		case 'get':
			return new PropertyGet(key, value, computed)
		case 'set':
			return new PropertySet(key, value, computed)
		default:
			throw new Error(String(kind))
	}
}

function methodParams(_: MethodImplLike)
	: {computed: boolean, isImpl: boolean, key: Expression, kind: any, value: FunctionExpression} {
	const symbol = _.symbol
	return {
		computed: !(typeof _.symbol === 'string'),
		isImpl: _ instanceof MethodImpl,
		key: typeof symbol === 'string' ?
			propertyIdOrLiteral(symbol) :
			symbol instanceof QuoteAbstract ? t0(symbol) : msCall('symbol', t0(symbol)),
		kind: _ instanceof MethodImpl ?
			'method' :
			_ instanceof MethodGetter ? 'get' : 'set',
		value: _ instanceof MethodImpl ?
			t0(_.fun) :
			getSetFun(<MethodGetter | MethodSetter> _)
	}
}

function getSetFun(_: MethodGetter | MethodSetter): FunctionExpression {
	const args = _ instanceof MethodGetter ? [] : [IdFocus]
	return new FunctionExpression(null, args, t1(_.block, DeclareLexicalThis))
}

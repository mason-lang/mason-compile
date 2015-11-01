import {FunctionExpression, MethodDefinition, Property} from 'esast/dist/ast'
import {propertyIdOrLiteral} from 'esast/dist/util'
import {MethodGetter, MethodImpl, QuoteAbstract} from '../MsAst'
import {DeclareLexicalThis, IdFocus} from './ast-constants'
import {msCall, t0, t1} from './util'

/** Transpile method to a MethodDefinition in a class. */
export function transpileMethodToDefinition(_, isStatic) {
	const {computed, key, kind, value} = methodParams(_, 'method')
	return new MethodDefinition(key, value, kind, isStatic, computed)
}

/** Transpile method to a property of an object. */
export function transpileMethodToProperty(_) {
	const {computed, isImpl, key, kind, value} = methodParams(_, 'init')
	return new Property(kind, key, value, computed, isImpl)
}

function methodParams(_, defaultKind) {
	const computed = !(typeof _.symbol === 'string')
	const isImpl = _ instanceof MethodImpl
	return {
		computed,
		isImpl,
		key: computed ?
			_.symbol instanceof QuoteAbstract ? t0(_.symbol) : msCall('symbol', t0(_.symbol)) :
			propertyIdOrLiteral(_.symbol),
		kind: isImpl ? defaultKind : _ instanceof MethodGetter ? 'get' : 'set',
		value: isImpl ? t0(_.fun) : getSetFun(_)
	}
}

function getSetFun(_) {
	const args = _ instanceof MethodGetter ? [] : [IdFocus]
	return new FunctionExpression(null, args, t1(_.block, DeclareLexicalThis))
}

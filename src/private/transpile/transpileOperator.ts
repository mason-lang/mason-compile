import Expression, {BinaryExpression, BinaryOperator, CallExpression, LogicalExpression,
	LogicalOperator, MemberExpressionPlain, UnaryExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import {FunOperator, FunUnary} from '../ast/Fun'
import {Operator, Operators, UnaryOperator, UnaryOperators} from '../ast/Val'
import {tail} from '../util'
import {idFocus} from './esast-constants'
import {msCall, msMember} from './ms'
import transpileVal from './transpileVal'

type Binary = (a: Expression, b: Expression) => Expression

export function transpileOperatorNoLoc({kind, args}: Operator): Expression {
	// Used for operators that apply to their arguments from left to right.
	// e.g. `/ a b c` compiles to `a / b / c`.
	function fold(binary: Binary): Expression {
		return tail(args).reduce(
			(acc, next) => binary(acc, transpileVal(next)),
			transpileVal(args[0]))
	}
	function logic(operator: LogicalOperator): Binary {
		return (a, b) => new LogicalExpression(operator, a, b)
	}
	function opr(operator: BinaryOperator): Binary {
		return (a, b) => new BinaryExpression(operator, a, b)
	}
	function call(called: Expression): Binary {
		return (a, b) => new CallExpression(called, [a, b])
	}
	// Used for tests that use logical conjunction for more than 2 arguments.
	// e.g. `<? a b` compiles to `a < b`, but `<? a b c` compiles to `_ms.lt(a, b, c)`,
	// which computes`a < b && b < c`..
	function conjunction(binary: Binary, msFunctionName: string): Expression {
		return args.length === 2 ?
			binary(transpileVal(args[0]), transpileVal(args[1])) :
			msCall(msFunctionName, ...args.map(transpileVal))
	}

	switch (kind) {
		case Operators.And:
			return fold(logic('&&'))
		case Operators.Div:
			return fold(opr('/'))
		case Operators.Eq:
			return conjunction(call(msMember('eq')), 'eqMany')
		case Operators.EqExact:
			return conjunction(call(objectIs), 'eqExact')
		case Operators.Exponent:
			return fold(call(mathPow))
		case Operators.Less:
			return conjunction(opr('<'), 'lt')
		case Operators.LessOrEqual:
			return conjunction(opr('<='), 'lte')
		case Operators.Greater:
			return conjunction(opr('>'), 'gt')
		case Operators.GreaterOrEqual:
			return conjunction(opr('>='), 'gte')
		case Operators.Minus:
			return fold(opr('-'))
		case Operators.Or:
			return fold(logic('||'))
		case Operators.Plus:
			return fold(opr('+'))
		case Operators.Remainder:
			return fold(opr('%'))
		case Operators.Times:
			return fold(opr('*'))
		default:
			throw new Error(String(kind))
	}
}

export function transpileFunOperatorNoLoc(_: FunOperator): Expression {
	return msMember((() => {
		switch (_.kind) {
			case Operators.And:
				return 'and'
			case Operators.Div:
				return 'div'
			case Operators.Eq:
				return 'eqMany'
			case Operators.EqExact:
				return 'eqExact'
			case Operators.Exponent:
				return 'exponent'
			case Operators.Less:
				return 'lt'
			case Operators.LessOrEqual:
				return 'lte'
			case Operators.Greater:
				return 'gt'
			case Operators.GreaterOrEqual:
				return 'gte'
			case Operators.Minus:
				return 'minus'
			case Operators.Or:
				return 'or'
			case Operators.Plus:
				return 'plus'
			case Operators.Remainder:
				return 'remainder'
			case Operators.Times:
				return 'times'
			default:
				throw new Error(String(_))
		}
	})())
}

export function transpileUnaryOperatorNoLoc({kind, arg}: UnaryOperator): Expression {
	return unaryExpression(kind, transpileVal(arg))
}

export function transpileFunUnaryNoLoc({kind}: FunUnary): Expression {
	return new ArrowFunctionExpression([idFocus], unaryExpression(kind, idFocus))
}

function unaryExpression(kind: UnaryOperators, arg: Expression): Expression {
	switch (kind) {
		case UnaryOperators.Neg:
			return new UnaryExpression('-', arg)
		case UnaryOperators.Not:
			return new UnaryExpression('!', arg)
		default:
			throw new Error(String(kind))
	}
}

const objectIs = new MemberExpressionPlain(new Identifier('Object'), new Identifier('is'))
const mathPow = new MemberExpressionPlain(new Identifier('Math'), new Identifier('pow'))

import Expression, {CallExpression, YieldDelegateExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression, FunctionExpression} from 'esast/lib/Function'
import {LiteralString} from 'esast/lib/Literal'
import Node from 'esast/lib/Node'
import Statement, {BlockStatement, ReturnStatement} from 'esast/lib/Statement'
import Op, {nonNull} from 'op/Op'
import {compileOptions} from '../context'
import {Funs} from '../ast/Fun'
import {Do, Val} from '../ast/LineContent'
import MsAst from '../ast/MsAst'
import {assert} from '../util'
import {idFocus} from './esast-constants'
import {funKind} from './context'
import {msCall} from './ms'
import transpileDo from './transpileDo'
import transpileVal from './transpileVal'

export function loc<A extends Node>(expr: MsAst, node: A): A {
	assert(node.loc === undefined)
	node.loc = expr.loc
	return node
}

export function transpileLines(exprs: Array<Do>): Array<Statement> {
	const out: Array<Statement> = []
	for (const expr of exprs) {
		const ast = transpileDo(expr)
		if (ast instanceof Array)
			for (const _ of ast)
				out.push(_)
		else
			out.push(ast)
	}
	return out
}

export function maybeWrapInCheckInstance(
	ast: Expression,
	opType: Op<Val>,
	name: string)
	: Expression {
	return compileOptions.checks && nonNull(opType) ?
		msCall('checkInstance', transpileVal(opType), ast, new LiteralString(name)) :
		ast
}

export function lazyWrap(value: Expression): Expression {
	return msCall('lazy', new ArrowFunctionExpression([], value))
}

/** Create a focus fun returning `value` and call it on `calledOn`, preserving generator/async. */
export function callFocusFun(value: Expression, calledOn: Expression): Expression {
	const fun = funKind === Funs.Plain ?
		new ArrowFunctionExpression([idFocus], value) :
		new FunctionExpression(
			null, [idFocus], new BlockStatement([new ReturnStatement(value)]), {generator: true})
	return callPreservingFunKind(new CallExpression(fun, [calledOn]))
}

/**
Call a function created by `blockWrap` or `callFocusFun`.
This looks like:
	Funs.Plain: `(_ => foo(_))(1)`.
	Funs.Generator, Funs.Async: `yield* function*(_) { return foo(_) }(1)`
*/
export function callPreservingFunKind(call: Expression): Expression {
	return funKind === Funs.Plain ? call : new YieldDelegateExpression(call)
}

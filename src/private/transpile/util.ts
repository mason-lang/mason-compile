import {VariableDeclarator, VariableDeclarationLet} from 'esast/lib/Declaration'
import Expression, {CallExpression, LiteralString, MemberExpression, MemberExpressionComputed, NewExpression, YieldDelegateExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression, FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import Node from 'esast/lib/Node'
import Statement, {BlockStatement, ExpressionStatement, ReturnStatement, ThrowStatement} from 'esast/lib/Statement'
import {identifier, loc, member} from 'esast-create-util/lib/util'
import Op, {nonNull, opIf, opMap} from 'op/Op'
import {options} from '../context'
import Block from '../ast/Block'
import {Funs} from '../ast/Fun'
import LineContent, {Do, Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import MemberName from '../ast/MemberName'
import MsAst from '../ast/MsAst'
import {QuoteAbstract} from '../ast/Val'
import {assert, cat, toArray} from '../util'
import {IdFocus, GlobalError} from './esast-constants'
import {funKind, getDestructuredId, verifyResults} from './context'
import transpileBlock from './transpileBlock'
import transpileDo from './transpileDo'
import transpileVal from './transpileVal'

//rename!
export function loc<A extends Node>(expr: MsAst, node: A): A {
	assert(node.loc === undefined)
	node.loc = expr.loc
	return node
}

//rename
export function tLines(exprs: Array<Do>): Array<Statement> {
	const out: Array<Statement> = []
	for (const expr of exprs) {
		const ast = transpileDo(expr)
		if (ast instanceof Array)
			for (const _ of ast)
				out.push(_)
		else
			out.push(ast) //was: loc(ast, expr.loc))
	}
	return out
}

export function accessLocalDeclare(localDeclare: LocalDeclare): Expression {
	const id = idForDeclareCached(localDeclare)
	return localDeclare.isLazy ? msCall('unlazy', id) : new Identifier(id.name)
}

export function makeDeclare(localDeclare: LocalDeclare, val: Expression): VariableDeclarationLet {
	return new VariableDeclarationLet(
		[new VariableDeclarator(idForDeclareCached(localDeclare), val)])
}

const declareToId: WeakMap<LocalDeclare, Identifier> = new WeakMap()
export function idForDeclareCached(localDeclare: LocalDeclare): Identifier {
	let _ = declareToId.get(localDeclare)
	if (_ === undefined) {
		_ = identifier(localDeclare.name)
		declareToId.set(localDeclare, _)
	}
	return _
}

export function opTypeCheckForLocalDeclare(localDeclare: LocalDeclare): Op<Statement> {
	// TODO: Way to typecheck lazies
	return opIf(!localDeclare.isLazy, () =>
		opMap(localDeclare.opType, type =>
			new ExpressionStatement(msCall(
				'checkInstance',
				transpileVal(type),
				accessLocalDeclare(localDeclare),
				new LiteralString(localDeclare.name)))))
}

export function makeDeclarator(assignee: LocalDeclare, value: Expression, valueIsAlreadyLazy: boolean): VariableDeclarator {
	const {name, opType} = assignee
	const isLazy = assignee.isLazy
	// TODO: assert(assignee.opType === null)
	// or TODO: Allow type check on lazy value?
	value = isLazy ? value : maybeWrapInCheckInstance(value, opType, name)
	const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value
	assert(isLazy || !valueIsAlreadyLazy)
	return new VariableDeclarator(idForDeclareCached(assignee), val)
}

export function maybeWrapInCheckInstance(ast: Expression, opType: Op<Val>, name: string): Expression {
	return options.checks && nonNull(opType) ?
		msCall('checkInstance', transpileVal(opType), ast, new LiteralString(name)) :
		ast
}

export function doThrow(thrown: Val): ThrowStatement {
	return new ThrowStatement(thrown instanceof QuoteAbstract ?
		new NewExpression(GlobalError, [transpileVal(thrown)]) :
		transpileVal(thrown))
}

export function memberStringOrVal(object: Expression, memberName: MemberName): MemberExpression {
	return typeof memberName === 'string' ?
		member(object, memberName) :
		new MemberExpressionComputed(object, transpileVal(memberName))
}

export function lazyWrap(value: Expression): Expression {
	return msCall('lazy', new ArrowFunctionExpression([], value))
}

const IdMs = new Identifier('_ms')
export function msCall(name: string, ...args: Array<Expression>): Expression {
	return new CallExpression(member(IdMs, name), args)
}

export function msMember(name: string): Expression {
	return member(IdMs, name)
}

export function makeDestructureDeclarators(
	assignees: Array<LocalDeclare>,
	isLazy: boolean,
	value: Expression,
	isModule: boolean): Array<VariableDeclarator> {
	const id = getDestructuredId()
	const destructuredName = `_$${id}`
	const idDestructured = new Identifier(destructuredName)
	const declarators = assignees.map(assignee => {
		const get = getMember(idDestructured, assignee.name, isLazy, isModule)
		return makeDeclarator(assignee, get, isLazy)
	})
	// Getting lazy module is done by ms.lazyGetModule.
	const val = isLazy && !isModule ? lazyWrap(value) : value
	return cat(new VariableDeclarator(idDestructured, val), declarators)
}
function getMember(astObject: Expression, gotName: string, isLazy: boolean, isModule: boolean): Expression {
	return isLazy ?
		msCall('lazyProp', astObject, new LiteralString(gotName)) :
		isModule && options.checks ?
		msCall('get', astObject, new LiteralString(gotName)) :
		member(astObject, gotName)
}

/** Wraps a block (with `return` statements in it) in an IIFE. */
export function blockWrap(block: BlockStatement): Expression {
	const thunk = funKind === Funs.Plain ?
		new ArrowFunctionExpression([], block) :
		new FunctionExpression(null, [], block, {generator: true})
	return callPreservingFunKind(new CallExpression(thunk, []))
}

/** Wrap a statement in an IIFE. */
export function blockWrapStatement(statement: Statement): Expression {
	return blockWrap(new BlockStatement([statement]))
}

/** Create a focus fun returning `value` and call it on `calledOn`, preserving generator/async. */
export function callFocusFun(value: Expression, calledOn: Expression): Expression {
	const fun = funKind === Funs.Plain ?
		new ArrowFunctionExpression([IdFocus], value) :
		new FunctionExpression(
			null, [IdFocus], new BlockStatement([new ReturnStatement(value)]), {generator: true})
	return callPreservingFunKind(new CallExpression(fun, [calledOn]))
}

/**
Call a function created by `blockWrap` or `callFocusFun`.
This looks like:
	Funs.Plain: `(_ => foo(_))(1)`.
	Funs.Generator, Funs.Async: `yield* function*(_) { return foo(_) }(1)`
*/
function callPreservingFunKind(call: Expression): Expression {
	return funKind === Funs.Plain ? call : new YieldDelegateExpression(call)
}

//check uses (loc)
export function blockWrapIfBlock(value: Block | Val): Expression {
	return value instanceof Block ? blockWrap(transpileBlock(value)) : (transpileVal(value))
}

export function focusFun(value: Expression): ArrowFunctionExpression {
	return new ArrowFunctionExpression([IdFocus], value)
}

export function plainLet(identifier: Identifier, value: Expression): VariableDeclarationLet {
	return new VariableDeclarationLet([new VariableDeclarator(identifier, value)])
}

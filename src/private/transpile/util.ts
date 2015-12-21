import Node, {ArrowFunctionExpression, BlockStatement, CallExpression, Expression, ExpressionStatement,
	FunctionExpression, Identifier, LiteralString, MemberExpression, MemberExpressionComputed, NewExpression, ReturnStatement, Statement,
	ThrowStatement, VariableDeclarator, VariableDeclaration, YieldExpression} from 'esast/lib/ast'
import {identifier, loc, member, toLineContent} from 'esast-create-util/lib/util'
import Op, {nonNull, opIf, opMap} from 'op/Op'
import {options} from '../context'
import MsAst, {Block, Val, Funs, LineContent, LocalDeclare, Name, QuoteAbstract, ValOrDo} from '../MsAst'
import {assert, cat, toArray} from '../util'
import {IdFocus, GlobalError} from './ast-constants'
import {funKind, getDestructuredId, verifyResults} from './context'

export function t0(expr: MsAst): any {
	return loc(expr.transpile(), expr.loc)
}
export function t1(expr: MsAst, arg: any): any {
	return loc(expr.transpile(arg), expr.loc)
}
export function t2(expr: MsAst, arg: any, arg2: any): any {
	return loc(expr.transpile(arg, arg2), expr.loc)
}
export function t3(expr: MsAst, arg: any, arg2: any, arg3: any): any {
	return loc(expr.transpile(arg, arg2, arg3), expr.loc)
}
export function tLines(exprs: Array<LineContent>): Array<Statement> {
	const out: Array<Statement> = []
	for (const expr of exprs) {
		const ast = expr.transpile()
		if (ast instanceof Array)
			// Ignore produces 0 statements and Region produces many.
			for (const _ of ast)
				out.push(toLineContent(_))
		else
			out.push(loc(toLineContent(ast), expr.loc))
	}
	return out
}

export function accessLocalDeclare(localDeclare: LocalDeclare): Expression {
	const id = idForDeclareCached(localDeclare)
	return localDeclare.isLazy ? msCall('unlazy', id) : new Identifier(id.name)
}

export function makeDeclare(localDeclare: LocalDeclare, val: Node): VariableDeclaration {
	return new VariableDeclaration('let',
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
				t0(type),
				accessLocalDeclare(localDeclare),
				new LiteralString(localDeclare.name)))))
}

export function throwErrorFromString(message: string): ThrowStatement {
	// TODO:ES6 Should be able to use IdError in ast-constants without recursive module problems
	return new ThrowStatement(
		new NewExpression(new Identifier('Error'), [new LiteralString(message)]))
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
		msCall('checkInstance', t0(opType), ast, new LiteralString(name)) :
		ast
}

export function doThrow(thrown: Val): ThrowStatement {
	return new ThrowStatement(thrown instanceof QuoteAbstract ?
		new NewExpression(GlobalError, [t0(thrown)]) :
		t0(thrown))
}

export function transpileName(name: Name): Expression {
	return typeof name === 'string' ? new LiteralString(name) : t0(name)
}

export function memberStringOrVal(object: Expression, memberName: Name): MemberExpression {
	return typeof memberName === 'string' ?
		member(object, memberName) :
		new MemberExpressionComputed(object, t0(memberName))
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
	return funKind === Funs.Plain ? call : new YieldExpression(call, true)
}

export function blockWrapIfBlock(value: Block | Val): Expression {
	// todo: in first case, block transpiles to BlockStatement
	// in second case, transpiles to Expression
	return value instanceof Block ? blockWrap(<any> t0(value)) : (<any> t0(value))
}

/** Wraps a statement in an IIFE if its MsAst is a value. */
export function blockWrapIfVal(ast: ValOrDo, statement: Statement | Array<Statement>): Expression | Statement | Array<Statement> {
	return verifyResults.isStatement(ast) ?
		statement :
		blockWrap(new BlockStatement(toArray(statement)))
}

export function focusFun(value: Expression): ArrowFunctionExpression {
	return new ArrowFunctionExpression([IdFocus], value)
}

export function plainLet(identifier: Identifier, value: Expression): VariableDeclaration {
	return new VariableDeclaration('let', [new VariableDeclarator(identifier, value)])
}

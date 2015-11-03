import {ArrowFunctionExpression, BlockStatement, CallExpression, ExpressionStatement,
	FunctionExpression, Identifier, Literal, MemberExpression, NewExpression, ThrowStatement,
	VariableDeclarator, VariableDeclaration, YieldExpression} from 'esast/dist/ast'
import mangleIdentifier from 'esast/dist/mangle-identifier'
import {loc, toStatement} from 'esast/dist/util'
import {member} from 'esast/dist/util'
import {options} from '../context'
import {QuoteAbstract} from '../MsAst'
import {assert, cat, opIf, opMap} from '../util'
import {GlobalError} from './ast-constants'
import {getDestructuredId, isInGenerator} from './context'

export function t0(expr) {
	return loc(expr.transpile(), expr.loc)
}
export function t1(expr, arg) {
	return loc(expr.transpile(arg), expr.loc)
}
export function t2(expr, arg, arg2) {
	return loc(expr.transpile(arg, arg2))
}
export function t3(expr, arg, arg2, arg3) {
	return loc(expr.transpile(arg, arg2, arg3), expr.loc)
}
export function tLines(exprs) {
	const out = []
	for (const expr of exprs) {
		const ast = expr.transpile()
		if (ast instanceof Array)
			// Ignore produces 0 statements and Region produces many.
			for (const _ of ast)
				out.push(toStatement(_))
		else
			out.push(loc(toStatement(ast), expr.loc))
	}
	return out
}

export function accessLocalDeclare(localDeclare) {
	const id = idForDeclareCached(localDeclare)
	return localDeclare.isLazy() ? msCall('unlazy', id) : new Identifier(id.name)
}

export function declare(localDeclare, val) {
	return new VariableDeclaration('const',
		[new VariableDeclarator(idForDeclareCached(localDeclare), val)])
}

const declareToId = new WeakMap()
export function idForDeclareCached(localDeclare) {
	let _ = declareToId.get(localDeclare)
	if (_ === undefined) {
		_ = new Identifier(mangleIdentifier(localDeclare.name))
		declareToId.set(localDeclare, _)
	}
	return _
}

export function opTypeCheckForLocalDeclare(localDeclare) {
	// TODO: Way to typecheck lazies
	return opIf(!localDeclare.isLazy(), () =>
		opMap(localDeclare.opType, type =>
			new ExpressionStatement(msCall(
				'checkContains',
				t0(type),
				accessLocalDeclare(localDeclare),
				new Literal(localDeclare.name)))))
}

export function throwErrorFromString(message) {
	// TODO:ES6 Should be able to use IdError
	return new ThrowStatement(
		new NewExpression(new Identifier('Error'), [new Literal(message)]))
}

export function makeDeclarator(assignee, value, valueIsAlreadyLazy) {
	const {name, opType} = assignee
	const isLazy = assignee.isLazy()
	// TODO: assert(assignee.opType === null)
	// or TODO: Allow type check on lazy value?
	value = isLazy ? value : maybeWrapInCheckContains(value, opType, name)
	const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value
	assert(isLazy || !valueIsAlreadyLazy)
	return new VariableDeclarator(idForDeclareCached(assignee), val)
}

export function maybeWrapInCheckContains(ast, opType, name) {
	return options.includeChecks() && opType !== null ?
		msCall('checkContains', t0(opType), ast, new Literal(name)) :
		ast
}

export function doThrow(thrown) {
	return new ThrowStatement(thrown instanceof QuoteAbstract ?
		new NewExpression(GlobalError, [t0(thrown)]) :
		t0(thrown))
}

export function transpileName(name) {
	return typeof name === 'string' ? new Literal(name) : t0(name)
}

export function memberStringOrVal(object, memberName) {
	return typeof memberName === 'string' ?
		member(object, memberName) :
		new MemberExpression(object, t0(memberName))
}

export function lazyWrap(value) {
	return msCall('lazy', new ArrowFunctionExpression([], value))
}

const IdMs = new Identifier('_ms')
export function msCall(name, ...args) {
	return new CallExpression(member(IdMs, name), args)
}

export function msMember(name) {
	return member(IdMs, name)
}

export function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
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
function getMember(astObject, gotName, isLazy, isModule) {
	return isLazy ?
		msCall('lazyProp', astObject, new Literal(gotName)) :
		isModule && options.includeChecks() ?
		msCall('get', astObject, new Literal(gotName)) :
		member(astObject, gotName)
}

/** Wraps a block (with `return` statements in it) in an IIFE. */
export function blockWrap(block) {
	const thunk = isInGenerator ?
		new FunctionExpression(null, [], block, true) :
		new ArrowFunctionExpression([], block)
	const invoke = new CallExpression(thunk, [])
	return isInGenerator ? new YieldExpression(invoke, true) : invoke
}
/** Wraps a statement in an IIFE is `isVal`. */
export function blockWrapIfVal(isVal, statement) {
	return isVal ? blockWrap(new BlockStatement([statement])) : statement
}
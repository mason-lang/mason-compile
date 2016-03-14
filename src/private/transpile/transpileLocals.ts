import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {AssignmentExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {LiteralString} from 'esast/lib/Literal'
import Statement, {ExpressionStatement} from 'esast/lib/Statement'
import {identifier, member} from 'esast-create-util/lib/util'
import Op, {opIf, opMap} from 'op/Op'
import {Assign, AssignDestructure, AssignSingle, LocalAccess, LocalDeclare, LocalDeclares,
	LocalMutate} from '../ast/locals'
import {compileOptions} from '../context'
import {assert, cat} from '../util'
import {getDestructuredId, verifyResults} from './context'
import {msCall} from './ms'
import transpileVal from './transpileVal'
import {lazyWrap, loc, maybeWrapInCheckInstance} from './util'

export function transpileLocalDeclare(_: LocalDeclare): Identifier {
	return loc(_, new Identifier(idForDeclareCached(_).name))
}

export function transpileLocalAccessNoLoc(_: LocalAccess): Expression {
	const {name} = _
	if (name === 'this')
		return new Identifier('_this')
	else {
		const ld = verifyResults.localDeclareForAccess(_)
		// If ld missing, this is a builtin, and builtins are never lazy
		return ld === undefined ? identifier(name) : accessLocalDeclare(ld)
	}
}

export function accessLocalDeclare(localDeclare: LocalDeclare): Expression {
	const id = idForDeclareCached(localDeclare)
	return localDeclare.isLazy ? msCall('unlazy', id) : new Identifier(id.name)
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

export function makeDeclare(localDeclare: LocalDeclare, val: Expression): VariableDeclarationLet {
	return new VariableDeclarationLet(
		[new VariableDeclarator(idForDeclareCached(localDeclare), val)])
}

export function plainLet(identifier: Identifier, value: Expression): VariableDeclarationLet {
	return new VariableDeclarationLet([new VariableDeclarator(identifier, value)])
}

export function plainLetForDeclare(declare: LocalDeclare, value: Expression
	): VariableDeclarationLet {
	return plainLet(transpileLocalDeclare(declare), value)
}

export function makeDeclarator(
	assignee: LocalDeclare,
	value: Expression,
	valueIsAlreadyLazy: boolean
	): VariableDeclarator {
	const {name, opType} = assignee
	const isLazy = assignee.isLazy
	// TODO: assert(assignee.opType === null)
	// or TODO: Allow type check on lazy value?
	value = isLazy ? value : maybeWrapInCheckInstance(value, opType, name)
	const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value
	assert(isLazy || !valueIsAlreadyLazy)
	return new VariableDeclarator(idForDeclareCached(assignee), val)
}

export function makeDestructureDeclarators(
	assignees: Array<LocalDeclare>,
	isLazy: boolean,
	value: Expression,
	isModule: boolean
	): Array<VariableDeclarator> {
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

function getMember(
	object: Expression,
	gotName: string,
	isLazy: boolean,
	isModule: boolean): Expression {
	return isLazy ?
		msCall('lazyProp', object, new LiteralString(gotName)) :
		isModule && compileOptions.checks ?
		msCall('get', object, new LiteralString(gotName)) :
		member(object, gotName)
}

export function transpileAssignNoLoc(_: Assign): Statement {
	if (_ instanceof AssignSingle)
		return transpileAssignSingleNoLoc(_)
	else if (_ instanceof AssignDestructure)
		return transpileAssignDestructureNoLoc(_)
	else
		throw new Error(_.constructor.name)
}

export function transpileAssignSingle(_: AssignSingle): Statement {
	return loc(_, transpileAssignSingleNoLoc(_))
}

export function transpileAssignSingleNoLoc(
		{assignee, value}: AssignSingle,
		valWrap?: (_: Expression) => Expression
		): Statement {
	const val = valWrap === undefined ? transpileVal(value) : valWrap(transpileVal(value))
	return new VariableDeclarationLet([makeDeclarator(assignee, val, false)])
}

function transpileAssignDestructureNoLoc({assignees, kind, value}: AssignDestructure): Statement {
	// TODO:ES6 Just use native destructuring assign
	return new VariableDeclarationLet(
		makeDestructureDeclarators(
			assignees,
			kind === LocalDeclares.Lazy,
			transpileVal(value),
			false))
}

export function transpileLocalMutateNoLoc({name, value}: LocalMutate): Statement {
		return new ExpressionStatement(
			new AssignmentExpression('=', identifier(name), transpileVal(value)))
}

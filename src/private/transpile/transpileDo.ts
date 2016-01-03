import {VariableDeclarationLet} from 'esast/lib/Declaration'
import Expression, {ArrayExpression, AssignmentExpression, CallExpression, LiteralString, UnaryExpression} from 'esast/lib/Expression'
import Statement, {BreakStatement, DebuggerStatement, ExpressionStatement, IfStatement, ReturnStatement} from 'esast/lib/Statement'
import {identifier, member} from 'esast-create-util/lib/util'
import {caseOp} from 'op/Op'
import Await from '../ast/Await'
import Block, {BagEntry, MapEntry, ObjEntryAssign, ObjEntryPlain} from '../ast/Block'
import {Cond, Conditional} from '../ast/booleans'
import Call from '../ast/Call'
import Case from '../ast/Case'
import Class, {Constructor, SuperCall} from '../ast/Class'
import Del from '../ast/Del'
import {Ignore, MemberSet, Pass, SetSub, Setters, SpecialDo, SpecialDos} from '../ast/Do'
import {Assert, Except, Throw} from '../ast/errors'
import Fun from '../ast/Fun'
import LineContent, {Do, isDo, isVal} from '../ast/LineContent'
import {AssignDestructure, AssignSingle, LocalDeclares, LocalMutate} from '../ast/locals'
import {Break, For, ForAsync, ForBag} from '../ast/Loop'
import Method from '../ast/Method'
import Switch from '../ast/Switch'
import Trait, {TraitDo} from '../ast/Trait'
import With from '../ast/With'
import {Yield, YieldTo} from '../ast/Yield'
import {cat} from '../util'
import {verifyResults} from './context'
import {IdBuilt, IdSuper, SetLexicalThis} from './esast-constants'
import transpileAssertNoLoc from './transpileAssertNoLoc'
import transpileBlock, {transpileBlockDo, transpileBlockNoLoc} from './transpileBlock'
import {transpileCaseDoNoLoc} from './transpileCase'
import {constructorSetMembers} from './transpileClass'
import {transpileExceptDoNoLoc} from './transpileExcept'
import {transpileBreakNoLoc, transpileForDoNoLoc, transpileForAsyncDoNoLoc} from './transpileFor'
import {transpileMemberName, transpileThrowNoLoc} from './transpileMisc'
import {exportNamedOrDefault} from './transpileModule'
import {transpileSwitchDoNoLoc} from './transpileSwitch'
import {transpileTraitDoNoLoc} from './transpileTrait'
import transpileVal from './transpileVal'
import {superCallCall, transpileAssignSingleNoLoc, transpileAwaitNoLoc, transpileCallNoLoc, transpileCondNoLoc, transpileDelNoLoc, transpileYieldNoLoc, transpileYieldToNoLoc, withParts} from './transpileX'
import {doThrow, idForDeclareCached, makeDestructureDeclarators, maybeWrapInCheckInstance, memberStringOrVal, msCall} from './util'

export default function transpileDo(_: Do): Statement | Array<Statement> {
	const ast: Statement | Array<Statement> = transpileDoNoLoc(_)
	if (ast instanceof Array)
		for (const part of ast)
			part.loc = _.loc
	else
		ast.loc = _.loc
	return ast
}

function transpileDoNoLoc(_: Do): Statement | Array<Statement> {
	if (_ instanceof Assert)
		return transpileAssertNoLoc(_)

	else if (_ instanceof AssignSingle) {
		return transpileAssignSingleNoLoc(_)

	} else if (_ instanceof AssignDestructure) {
		const {assignees, kind, value} = _
		// TODO:ES6 Just use native destructuring assign
		return new VariableDeclarationLet(
			makeDestructureDeclarators(
				assignees,
				kind === LocalDeclares.Lazy,
				transpileVal(value),
				false))

	} else if (_ instanceof Await)
		return  new ExpressionStatement(transpileAwaitNoLoc(_))

	else if (_ instanceof BagEntry) {
		const {isMany, value} = _
		return new ExpressionStatement(
			msCall(isMany ? 'addMany' : 'add', IdBuilt, transpileVal(value)))

	} else if (_ instanceof Break)
		return transpileBreakNoLoc(_)

	else if (_ instanceof Call)
		return new ExpressionStatement(transpileCallNoLoc(_))

	else if (_ instanceof Case)
		return transpileCaseDoNoLoc(_)

	else if (_ instanceof Cond)
		return new ExpressionStatement(transpileCondNoLoc(_))

	else if (_ instanceof Conditional) {
		const {test, result, isUnless} = _
		const testAst = transpileVal(test)
		return new IfStatement(
			isUnless ? new UnaryExpression('!', testAst) : testAst,
			result instanceof Block ? transpileBlockDo(result) : new ExpressionStatement(transpileVal(result)))

	} else if (_ instanceof Del)
		return new ExpressionStatement(transpileDelNoLoc(_))

	else if (_ instanceof Except)
		return transpileExceptDoNoLoc(_)

	else if (_ instanceof For)
		return transpileForDoNoLoc(_)

	else if (_ instanceof ForAsync)
		return transpileForAsyncDoNoLoc(_)

	else if (_ instanceof Ignore)
		return []

	else if (_ instanceof LocalMutate) {
		const {name, value} = _
		return new ExpressionStatement(
			new AssignmentExpression('=', identifier(name), transpileVal(value)))

	} else if (_ instanceof MapEntry) {
		const {key, val} = _
		return new ExpressionStatement(
			msCall('setSub', IdBuilt, transpileVal(key), transpileVal(val)))

	} else if (_ instanceof MemberSet) {
		const {object, name, opType, kind, value} = _
		const obj = transpileVal(object)
		//todo
		const strName = typeof name === 'string' ? name : 'computed member'
		const val = maybeWrapInCheckInstance(transpileVal(value), opType, strName)
		return new ExpressionStatement((() => {
			switch (kind) {
				case Setters.Init:
					return msCall('newProperty', obj, transpileMemberName(name), val)
				case Setters.Mutate:
					return new AssignmentExpression('=', memberStringOrVal(obj, name), val)
				default:
					throw new Error()
			}
		})())

	} else if (_ instanceof ObjEntryAssign) {
		const {assign} = _
		if (assign instanceof AssignSingle && !assign.assignee.isLazy) {
			const name = assign.assignee.name
			return transpileAssignSingleNoLoc(assign, val =>
				verifyResults.isObjEntryExport(_) ?
					exportNamedOrDefault(val, name) :
					new AssignmentExpression('=', member(IdBuilt, name), val))
		} else {
			const assigns = assign.allAssignees().map(_ =>
				new ExpressionStatement(msCall('setLazy', IdBuilt, new LiteralString(_.name), idForDeclareCached(_))))
			return cat(transpileDo(assign), assigns)
		}

	} else if (_ instanceof ObjEntryPlain) {
		const {name, value} = _
		const val = transpileVal(value)
		return new ExpressionStatement(
			verifyResults.isObjEntryExport(_) ?
				// We've verified that for module export, name must be a string.
				exportNamedOrDefault(val, <string> name) :
				new AssignmentExpression('=', memberStringOrVal(IdBuilt, name), val))

	} else if (_ instanceof Pass) {
		return new ExpressionStatement(transpileVal(_.ignored))

	} else if (_ instanceof SetSub) {
		const {object, subbeds, kind, opType, value} = _
		const kindStr = (() => {
			switch (kind) {
				case Setters.Init:
					return 'init'
				case Setters.Mutate:
					return 'mutate'
				default:
					throw new Error()
			}
		})()
		return new ExpressionStatement(msCall(
			'setSub',
			transpileVal(object),
			subbeds.length === 1 ? transpileVal(subbeds[0]) : new ArrayExpression(subbeds.map(transpileVal)),
			maybeWrapInCheckInstance(transpileVal(value), opType, 'value'),
			new LiteralString(kindStr)))

	} else if (_ instanceof SpecialDo)
		switch (_.kind) {
			case SpecialDos.Debugger:
				return new DebuggerStatement()
			default:
				throw new Error(String(_.kind))
		}

	else if (_ instanceof SuperCall) {
		const {args} = _
		const method = verifyResults.superCallToMethod.get(_)
		if (method instanceof Constructor) {
			// super must appear as a statement, so OK to declare `this`
			const call = new ExpressionStatement(new CallExpression(IdSuper, args.map(transpileVal)))
			const memberSets = constructorSetMembers(method)
			return cat(call, memberSets, SetLexicalThis)
		} else
			return new ExpressionStatement(superCallCall(_, method))
	}

	else if (_ instanceof Switch)
		return transpileSwitchDoNoLoc(_)

	else if (_ instanceof Throw) {
		return transpileThrowNoLoc(_)

	} else if (_ instanceof TraitDo)
		return transpileTraitDoNoLoc(_)

	else if (_ instanceof With) {
		const {idDeclare, val, lead} = withParts(_)
		return transpileBlockNoLoc(_.block, lead)

	} else if (_ instanceof Yield)
		return new ExpressionStatement(transpileYieldNoLoc(_))

	else if (_ instanceof YieldTo)
		return new ExpressionStatement(transpileYieldToNoLoc(_))

	else
		// Should have handled every case.
		throw new Error(_.constructor.name)
}

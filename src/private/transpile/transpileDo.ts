import {ArrayExpression, AssignmentExpression} from 'esast/lib/Expression'
import Statement, {DebuggerStatement, ExpressionStatement} from 'esast/lib/Statement'
import Await from '../ast/Await'
import {Cond, Conditional} from '../ast/booleans'
import BuildEntry from '../ast/BuildEntry'
import Call from '../ast/Call'
import Case from '../ast/Case'
import {SuperCall} from '../ast/Class'
import Del from '../ast/Del'
import {Ignore, MemberSet, Pass, SetSub, SpecialDo, SpecialDos} from '../ast/Do'
import {Assert, Except, Throw} from '../ast/errors'
import {Do} from '../ast/LineContent'
import {Assign, LocalMutate} from '../ast/locals'
import {Break, For, ForAsync} from '../ast/Loop'
import Switch from '../ast/Switch'
import {TraitDo} from '../ast/Trait'
import With from '../ast/With'
import YieldLike from '../ast/YieldLike'
import {msCall} from './ms'
import {transpileAwaitNoLoc} from './transpileAwait'
import {transpileConditionalDoNoLoc, transpileCondNoLoc} from './transpileBooleans'
import {transpileBuildEntryNoLoc} from './transpileBuildEntry'
import {transpileCallNoLoc} from './transpileCall'
import {transpileCaseDoNoLoc} from './transpileCase'
import {transpileSuperCallDoNoLoc} from './transpileClass'
import {transpileDelNoLoc} from './transpileDel'
import {transpileAssertNoLoc, transpileExceptDoNoLoc, transpileThrowNoLoc} from './transpileErrors'
import {transpileAssignNoLoc, transpileLocalMutateNoLoc} from './transpileLocals'
import {transpileBreakNoLoc, transpileForDoNoLoc, transpileForAsyncDoNoLoc} from './transpileLoop'
import {transpileMember} from './transpileMemberName'
import {transpileSwitchDoNoLoc} from './transpileSwitch'
import {transpileTraitDoNoLoc} from './transpileTrait'
import transpileVal from './transpileVal'
import {transpileWithDoNoLoc} from './transpileWith'
import {transpileYieldLikeNoLoc} from './transpileYieldLike'
import {maybeWrapInCheckInstance} from './util'

/**
Transpile to a [[Statement]].
Some [[MsAst]]s handled here have similar handlers in [[transpileVal]].
*/
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

	else if (_ instanceof Assign)
		return transpileAssignNoLoc(_)

	else if (_ instanceof Await)
		return  new ExpressionStatement(transpileAwaitNoLoc(_))

	else if (_ instanceof BuildEntry)
		return transpileBuildEntryNoLoc(_)

	else if (_ instanceof Break)
		return transpileBreakNoLoc(_)

	else if (_ instanceof Call)
		return new ExpressionStatement(transpileCallNoLoc(_))

	else if (_ instanceof Case)
		return transpileCaseDoNoLoc(_)

	else if (_ instanceof Cond)
		return new ExpressionStatement(transpileCondNoLoc(_))

	else if (_ instanceof Conditional)
		return transpileConditionalDoNoLoc(_)

	else if (_ instanceof Del)
		return new ExpressionStatement(transpileDelNoLoc(_))

	else if (_ instanceof Except)
		return transpileExceptDoNoLoc(_)

	else if (_ instanceof For)
		return transpileForDoNoLoc(_)

	else if (_ instanceof ForAsync)
		return transpileForAsyncDoNoLoc(_)

	else if (_ instanceof Ignore)
		return []

	else if (_ instanceof LocalMutate)
		return transpileLocalMutateNoLoc(_)

	else if (_ instanceof MemberSet) {
		const {object, name, opType, value} = _
		const obj = transpileVal(object)
		const strName = typeof name === 'string' ? name : '<computed member>'
		const val = maybeWrapInCheckInstance(transpileVal(value), opType, strName)
		return new ExpressionStatement(
			new AssignmentExpression('=', transpileMember(obj, name), val))

	} else if (_ instanceof Pass) {
		return new ExpressionStatement(transpileVal(_.ignored))

	} else if (_ instanceof SetSub) {
		const {object, subbeds, opType, value} = _
		return new ExpressionStatement(msCall(
			'setSub',
			transpileVal(object),
			subbeds.length === 1 ? transpileVal(subbeds[0]) : new ArrayExpression(subbeds.map(transpileVal)),
			maybeWrapInCheckInstance(transpileVal(value), opType, 'value')))

	} else if (_ instanceof SpecialDo)
		switch (_.kind) {
			case SpecialDos.Debugger:
				return new DebuggerStatement()
			default:
				throw new Error(String(_.kind))
		}

	else if (_ instanceof SuperCall)
		return transpileSuperCallDoNoLoc(_)

	else if (_ instanceof Switch)
		return transpileSwitchDoNoLoc(_)

	else if (_ instanceof Throw) {
		return transpileThrowNoLoc(_)

	} else if (_ instanceof TraitDo)
		return transpileTraitDoNoLoc(_)

	else if (_ instanceof With)
		return transpileWithDoNoLoc(_)

	else if (_ instanceof YieldLike)
		return new ExpressionStatement(transpileYieldLikeNoLoc(_))

	else
		// Should have handled every type.
		throw new Error(_.constructor.name)
}

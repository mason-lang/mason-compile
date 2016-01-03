import {VariableDeclarationLet} from 'esast/lib/Declaration'
import Expression, {CallExpression, ConditionalExpression, YieldDelegateExpression, YieldExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import Statement from 'esast/lib/Statement'
import {opMap} from 'op/Op'
import Await from '../ast/Await'
import Block from '../ast/Block'
import {Cond, Conditional} from '../ast/booleans'
import Call from '../ast/Call'
import Case, {CasePart, Pattern} from '../ast/Case'
import {Constructor, SuperCall} from '../ast/Class'
import {MethodImplLike} from '../ast/classTraitCommon'
import Del from '../ast/Del'
import {Catch, Except, Throw} from '../ast/errors'
import {Funs} from '../ast/Fun'
import LineContent, {Do, Val} from '../ast/LineContent'
import {AssignSingle} from '../ast/locals'
import {For, ForAsync} from '../ast/Loop'
import Switch, {SwitchPart} from '../ast/Switch'
import With from '../ast/With'
import {Yield, YieldTo} from '../ast/Yield'
import {IdSuper} from './esast-constants'
import transpileDo from './transpileDo'
import {transpileArguments, transpileLocalDeclare} from './transpileMisc'
import transpileVal from './transpileVal'
import {idForDeclareCached, loc, makeDeclarator, memberStringOrVal, msCall, plainLet} from './util'

//todo: rename everything! including the file name!

export function withParts({declare, value}: With): {idDeclare: Identifier, val: Expression, lead: Statement} {
	const idDeclare = idForDeclareCached(declare)
	const val = transpileVal(value)
	const lead = plainLet(idDeclare, val)
	return {idDeclare, val, lead}
}

export function transpileAssignSingle(_: AssignSingle): VariableDeclarationLet {
	return loc(_, transpileAssignSingleNoLoc(_))
}

//todo: use 2 different functions depending on whether `valWrap` exists
//move to transpileX
export function transpileAssignSingleNoLoc(
		{assignee, value}: AssignSingle,
		valWrap?: (_: Expression) => Expression)
		: VariableDeclarationLet {
	const val = valWrap === undefined ? transpileVal(value) : valWrap(transpileVal(value))
	return new VariableDeclarationLet([makeDeclarator(assignee, val, false)])
}

//inline some of these?

export function transpileAwaitNoLoc({value}: Await): Expression {
	return new YieldExpression(transpileVal(value))
}

export function transpileCallNoLoc({called, args}: Call): Expression {
	return new CallExpression(transpileVal(called), transpileArguments(args))
}

export function transpileCondNoLoc({test, ifTrue, ifFalse}: Cond): ConditionalExpression {
	return new ConditionalExpression(transpileVal(test), transpileVal(ifTrue), transpileVal(ifFalse))
}

export function transpileDelNoLoc({subbed, args}: Del): Expression {
	return msCall('del', transpileVal(subbed), ...args.map(transpileVal))
}

//rename (this is for non-Constructor case)
export function superCallCall({args}: SuperCall, method: MethodImplLike): Expression {
	return new CallExpression(memberStringOrVal(IdSuper, method.symbol), transpileArguments(args))
}

export function transpileYieldNoLoc({opValue}: Yield): YieldExpression {
	return new YieldExpression(opMap(opValue, transpileVal))
}

export function transpileYieldToNoLoc({value}: YieldTo): YieldDelegateExpression {
	return new YieldDelegateExpression(transpileVal(value))
}

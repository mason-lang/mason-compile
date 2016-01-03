import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {YieldExpression} from 'esast/lib/Expression'
import {FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import Node from 'esast/lib/Node'
import Statement, {BlockStatement, BreakStatement, ExpressionStatement, ForStatement,
	ForOfStatement, LabeledStatement, Loop as EsLoop, ReturnStatement} from 'esast/lib/Statement'
import Op, {caseOp} from 'op/Op'
import Block from '../ast/Block'
import {Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import Loop, {Break, For, ForAsync, ForBag, Iteratee} from '../ast/Loop'
import {verifyResults} from './context'
import {DeclareBuiltBag, IdBuilt} from './esast-constants'
import transpileBlock from './transpileBlock'
import {transpileLocalDeclare} from './transpileMisc'
import transpileVal from './transpileVal'
import {blockWrap, blockWrapStatement, msCall} from './util'

export function transpileForValNoLoc({opIteratee, block}: For): Expression {
	// use `return` instead of `break`, so no label needed
	return blockWrapStatement(forLoop(opIteratee, block))
}

export function transpileForDoNoLoc(_: For): Statement {
	const {opIteratee, block} = _
	return maybeLabelLoop(_, forLoop(opIteratee, block))
}

export function transpileForAsyncValNoLoc({iteratee: {element, bag}, block}: ForAsync): Expression {
	const func = new FunctionExpression(
		null,
		[transpileLocalDeclare(element)],
		transpileBlock(block),
		{generator: true})
	return msCall('$for', transpileVal(bag), func)
}

export function transpileForAsyncDoNoLoc(_: ForAsync): Statement {
	return new ExpressionStatement(new YieldExpression(transpileForAsyncValNoLoc(_)))
}

export function transpileForBagNoLoc(_: ForBag): Expression {
	const {opIteratee, block} = _
	const loop = maybeLabelLoop(_, forLoop(opIteratee, block))
	return blockWrap(new BlockStatement([DeclareBuiltBag, loop, ReturnBuilt]))
}

export function transpileBreakNoLoc(_: Break): Statement {
	return caseOp<Val, Statement>(_.opValue,
		_ => new ReturnStatement(transpileVal(_)),
		() => new BreakStatement(verifyResults.isBreakInSwitch(_) ? IdLoop : null))
}

function forLoop(opIteratee: Op<Iteratee>, block: Block): EsLoop {
	const blockAst = transpileBlock(block)
	return caseOp<{element: LocalDeclare, bag: Val}, EsLoop>(opIteratee,
		({element, bag}) =>
			new ForOfStatement(
				new VariableDeclarationLet(
					[new VariableDeclarator(transpileLocalDeclare(element))]),
				transpileVal(bag),
				blockAst),
		() => new ForStatement(null, null, null, blockAst))
}

function maybeLabelLoop(ast: Loop, loop: EsLoop): Statement {
	return verifyResults.loopNeedsLabel(ast) ? new LabeledStatement(IdLoop, loop) : loop
}

const IdLoop = new Identifier('loop')
const ReturnBuilt = new ReturnStatement(IdBuilt)

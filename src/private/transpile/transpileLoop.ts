import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {YieldExpression} from 'esast/lib/Expression'
import {FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import EsLoop, {BreakStatement, ForStatement, ForOfStatement, LabeledStatement
	} from 'esast/lib/Loop'
import Statement, {BlockStatement, ExpressionStatement, ReturnStatement} from 'esast/lib/Statement'
import Op, {caseOp} from 'op/Op'
import Block from '../ast/Block'
import {Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import Loop, {Break, For, ForAsync, ForBag, Iteratee} from '../ast/Loop'
import {verifyResults} from './context'
import {declareBuiltBag, idBuilt} from './esast-constants'
import {msCall} from './ms'
import transpileBlock, {blockWrap, blockWrapStatement} from './transpileBlock'
import {transpileLocalDeclare} from './transpileLocals'
import transpileVal from './transpileVal'

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
	return blockWrap(new BlockStatement([declareBuiltBag, loop, returnBuilt]))
}

export function transpileBreakNoLoc(_: Break): Statement {
	return caseOp<Val, Statement>(
		_.opValue,
		_ => new ReturnStatement(transpileVal(_)),
		() => new BreakStatement(verifyResults.isBreakInSwitch(_) ? idLoop : null))
}

function forLoop(opIteratee: Op<Iteratee>, block: Block): EsLoop {
	const blockAst = transpileBlock(block)
	return caseOp<{element: LocalDeclare, bag: Val}, EsLoop>(
		opIteratee,
		({element, bag}) =>
			new ForOfStatement(
				new VariableDeclarationLet(
					[new VariableDeclarator(transpileLocalDeclare(element))]),
				transpileVal(bag),
				blockAst),
		() => new ForStatement(null, null, null, blockAst))
}

function maybeLabelLoop(ast: Loop, loop: EsLoop): Statement {
	return verifyResults.loopNeedsLabel(ast) ? new LabeledStatement(idLoop, loop) : loop
}

const idLoop = new Identifier('loop')
const returnBuilt = new ReturnStatement(idBuilt)

import Node, {BlockStatement, BreakStatement, Expression, ForStatement, ForOfStatement, FunctionExpression,
	Identifier, LabeledStatement, Loop as EsLoop, ReturnStatement, Statement, VariableDeclaration, VariableDeclarator, YieldExpression} from 'esast/lib/ast'
import Op, {caseOp} from 'op/Op'
import {Block, Val, Iteratee, LocalDeclare, Loop} from '../MsAst'
import {DeclareBuiltBag, IdBuilt} from './ast-constants'
import {verifyResults} from './context'
import {blockWrap, msCall, t0} from './util'

export function transpileBreak(): Statement {
	return caseOp<Val, Statement>(this.opValue,
		_ => new ReturnStatement(t0(_)),
		() => new BreakStatement(verifyResults.isBreakInSwitch(this) ? IdLoop : null))
}

export function transpileFor(): Expression | Statement {
	const loop = forLoop(this.opIteratee, this.block)
	return verifyResults.isStatement(this) ?
		maybeLabelLoop(this, loop) :
		// use `return` instead of `break`, so no label needed
		blockWrap(new BlockStatement([loop]))
}

export function transpileForAsync(): Expression {
	const {element, bag} = this.iteratee
	const func = new FunctionExpression(null, [t0(element)], t0(this.block), {generator: true})
	const call = msCall('$for', t0(bag), func)
	return verifyResults.isStatement(this) ? new YieldExpression(call) : call
}

export function transpileForBag(): Expression {
	const loop = maybeLabelLoop(this, forLoop(this.opIteratee, this.block))
	return blockWrap(new BlockStatement([DeclareBuiltBag, loop, ReturnBuilt]))
}

function forLoop(opIteratee: Op<Iteratee>, block: Block): EsLoop {
	const jsBlock = t0(block)
	return caseOp<{element: LocalDeclare, bag: Val}, Statement>(opIteratee,
		({element, bag}) =>
			new ForOfStatement(
				new VariableDeclaration('let', [new VariableDeclarator(t0(element))]),
				t0(bag),
				jsBlock),
		() => new ForStatement(null, null, null, jsBlock))
}

function maybeLabelLoop(ast: Loop, loop: EsLoop): Statement {
	return verifyResults.loopNeedsLabel(ast) ? new LabeledStatement(IdLoop, loop) : loop
}

const IdLoop = new Identifier('loop')
const ReturnBuilt = new ReturnStatement(IdBuilt)

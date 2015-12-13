import {BlockStatement, BreakStatement, ForStatement, ForOfStatement, FunctionExpression,
	Identifier, LabeledStatement, ReturnStatement, VariableDeclaration, VariableDeclarator,
	YieldExpression} from 'esast/dist/ast'
import {ifElse} from '../util'
import {DeclareBuiltBag, IdBuilt} from './ast-constants'
import {verifyResults} from './context'
import {blockWrap, msCall, t0} from './util'

export function transpileBreak() {
	return ifElse(this.opValue,
		_ => new ReturnStatement(t0(_)),
		() => new BreakStatement(verifyResults.isBreakInSwitch(this) ? IdLoop : null))
}

export function transpileFor() {
	const loop = forLoop(this.opIteratee, this.block)
	return verifyResults.isStatement(this) ?
		maybeLabelLoop(this, loop) :
		// use `return` instead of `break`, so no label needed
		blockWrap(new BlockStatement([loop]))
}

export function transpileForAsync() {
	const {element, bag} = this.iteratee
	const func = new FunctionExpression(null, [t0(element)], t0(this.block), true)
	const call = msCall('$for', t0(bag), func)
	return verifyResults.isStatement(this) ? new YieldExpression(call) : call
}

export function transpileForBag() {
	const loop = maybeLabelLoop(this, forLoop(this.opIteratee, this.block))
	return blockWrap(new BlockStatement([DeclareBuiltBag, loop, ReturnBuilt]))
}

function forLoop(opIteratee, block) {
	const jsBlock = t0(block)
	return ifElse(opIteratee,
		({element, bag}) =>
			new ForOfStatement(
				new VariableDeclaration('let', [new VariableDeclarator(t0(element))]),
				t0(bag),
				jsBlock),
		() => new ForStatement(null, null, null, jsBlock))
}

function maybeLabelLoop(ast, loop) {
	return verifyResults.loopNeedsLabel(ast) ? new LabeledStatement(IdLoop, loop) : loop
}

const IdLoop = new Identifier('loop')
const ReturnBuilt = new ReturnStatement(IdBuilt)

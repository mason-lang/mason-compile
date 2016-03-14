import Expression, {CallExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression, FunctionExpression} from 'esast/lib/Function'
import Statement, {BlockStatement, ReturnStatement} from 'esast/lib/Statement'
import Op from 'op/Op'
import Block from '../ast/Block'
import {Throw} from '../ast/errors'
import {Funs} from '../ast/Fun'
import {Do, Val} from '../ast/LineContent'
import {assert, cat, last, rtail} from '../util'
import {Blocks} from '../VerifyResults'
import {funKind, verifyResults} from './context'
import {declareBuiltBag, declareBuiltMap, declareBuiltObj, idBuilt} from './esast-constants'
import {transpileThrow} from './transpileErrors'
import transpileVal from './transpileVal'
import {callPreservingFunKind, loc, maybeWrapInCheckInstance, transpileLines} from './util'

/** Transpiled block may have a return statement depending on the kind of block. */
export default function transpileBlock(_: Block, options: TranspileBlockOptions = {}
	): BlockStatement {
	return loc(_, transpileBlockNoLoc(_, options))
}

export type TranspileBlockOptions = {
	lead?: Op<Statement | Array<Statement>>,
	opReturnType?: Op<Val>,
	follow?: Op<Statement | Array<Statement>>,
}

export function transpileBlockNoLoc(_: Block, options: TranspileBlockOptions = {}): BlockStatement {
	const {lines} = _
	const kind = verifyResults.blockKind(_)

	const {lead = null, opReturnType: opReturnType = null, follow = null} = options

	function blockWithReturn(returned: Expression, lines: Array<Statement>): BlockStatement {
		const doReturn = new ReturnStatement(
			maybeWrapInCheckInstance(returned, opReturnType, 'returned value'))
		return new BlockStatement(cat(lead, lines, doReturn))
	}

	switch (kind) {
		case Blocks.Do:
			assert(opReturnType === null)
			return transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow)
		case Blocks.Throw:
			return new BlockStatement(
				cat(lead, transpileLines(rtail(<Array<Do>> lines)), transpileThrow(<Throw> last(lines))))
		case Blocks.Return:
			return blockWithReturn(transpileVal(<Val> last(lines)), transpileLines(<Array<Do>> rtail(lines)))
		case Blocks.Bag: case Blocks.Map: case Blocks.Obj: {
			const declare = kind === Blocks.Bag ?
				declareBuiltBag :
				kind === Blocks.Map ? declareBuiltMap : declareBuiltObj
			return blockWithReturn(idBuilt, cat(declare, transpileLines(<Array<Do>> lines)))
		}
		default:
			throw new Error(String(kind))
	}
}

export function transpileBlockVal(_: Block, options: TranspileBlockOptions = {}): Expression {
	return blockWrap(transpileBlock(_, options))
}

export function transpileBlockDo(_: Block): BlockStatement {
	return loc(_, new BlockStatement(transpileLines(<Array<Do>> _.lines)))
}

export function transpileBlockDoWithLeadAndFollow(
	_: Block,
	lead?: Op<Statement | Array<Statement>>,
	follow?: Op<Statement | Array<Statement>>
	): BlockStatement {
	return loc(_, transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow))
}

function transpileBlockDoWithLeadAndFollowNoLoc(
	_: Block,
	lead: Op<Statement | Array<Statement>>,
	follow: Op<Statement | Array<Statement>>
	): BlockStatement {
	return new BlockStatement(cat(lead, transpileLines(<Array<Do>> _.lines), follow))
}

/** Wraps a block (with `return` statements in it) in an IIFE. */
export function blockWrap(block: BlockStatement): Expression {
	const thunk = funKind === Funs.Plain ?
		new ArrowFunctionExpression([], block) :
		new FunctionExpression(null, [], block, {generator: true})
	return callPreservingFunKind(new CallExpression(thunk, []))
}

/** Wrap a statement in an IIFE. */
export function blockWrapStatement(statement: Statement): Expression {
	return blockWrap(new BlockStatement([statement]))
}

export function blockWrapIfBlock(_: Block | Val): Expression {
	return _ instanceof Block ? transpileBlockVal(_) : transpileVal(_)
}

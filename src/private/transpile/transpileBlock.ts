import Expression from 'esast/lib/Expression'
import Statement, {BlockStatement, ReturnStatement} from 'esast/lib/Statement'
import Op from 'op/Op'
import Block from '../ast/Block'
import {Throw} from '../ast/errors'
import {Do, Val} from '../ast/LineContent'
import {assert, cat, last, rtail} from '../util'
import {Blocks} from '../VerifyResults'
import {verifyResults} from './context'
import {DeclareBuiltBag, DeclareBuiltMap, DeclareBuiltObj, IdBuilt} from './esast-constants'
import transpileDo from './transpileDo'
import {transpileThrow} from './transpileMisc'
import transpileVal from './transpileVal'
import {loc, maybeWrapInCheckInstance, tLines} from './util'

//todo: lead, follow could be cleaned up
//todo: maybe some callers of this should be using transpileBlockVal or transpileBlockDo
export default function transpileBlock(
	_: Block,
	lead: Op<Statement | Array<Statement>> = null,
	opReturnType: Op<Val> = null,
	follow: Op<Statement | Array<Statement>> = null): BlockStatement {
	return loc(_, transpileBlockNoLoc(_, lead, opReturnType, follow))
}

//todo: cut back on params
export function transpileBlockNoLoc(_: Block,
	lead: Op<Statement | Array<Statement>> = null,
	opReturnType: Op<Val> = null,
	follow: Op<Statement | Array<Statement>> = null): BlockStatement {
	const {lines} = _
	const kind = verifyResults.blockKind(_)

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
				cat(lead, tLines(rtail(<Array<Do>> lines)), transpileThrow(<Throw> last(lines))))
		case Blocks.Return:
			return blockWithReturn(transpileVal(<Val> last(lines)), tLines(<Array<Do>> rtail(lines)))
		case Blocks.Bag: case Blocks.Map: case Blocks.Obj: {
			const declare = kind === Blocks.Bag ?
				DeclareBuiltBag :
				kind === Blocks.Map ? DeclareBuiltMap : DeclareBuiltObj
			return blockWithReturn(IdBuilt, cat(declare, tLines(<Array<Do>> lines)))
		}
		default:
			throw new Error(String(kind))
	}
}

//rename
function transpileBlockReturnNoLoc(
	returned: Expression,
	lines: Array<Statement>,
	lead: Op<Statement | Array<Statement>>,
	opReturnType: Op<Val>): BlockStatement {
	const ret = new ReturnStatement(
		maybeWrapInCheckInstance(returned, opReturnType, 'returned value'))
	return new BlockStatement(cat(lead, lines, ret))
}

export function transpileBlockDo(_: Block): BlockStatement {
	return loc(_, new BlockStatement(tLines(<Array<Do>> _.lines)))
}

export function transpileBlockDoWithLeadAndFollow(
	_: Block,
	lead?: Op<Statement | Array<Statement>>,
	follow?: Op<Statement | Array<Statement>>): BlockStatement {
	return loc(_, transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow))
}

//rename?
export function transpileBlockDoWithLeadAndFollowNoLoc(
	_: Block,
	lead?: Op<Statement | Array<Statement>>,
	follow?: Op<Statement | Array<Statement>>): BlockStatement {
	return new BlockStatement(cat(lead, tLines(<Array<Do>> _.lines), follow))
}

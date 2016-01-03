import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {AssignmentExpression, LiteralBoolean} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import Node from 'esast/lib/Node'
import Statement, {BlockStatement, CatchClause, ExpressionStatement, IfStatement, ThrowStatement, TryStatement} from 'esast/lib/Statement'
import Op, {caseOp, opMap} from 'op/Op'
import Block from '../ast/Block'
import {Catch, Except} from '../ast/errors'
import {Do, Val} from '../ast/LineContent'
import {allSame, cat, isEmpty, reverseIter, toArray} from '../util'
import transpileBlock, {transpileBlockDo, transpileBlockNoLoc} from './transpileBlock'
import {transpileLocalDeclare} from './transpileMisc'
import transpileVal from './transpileVal'
import {blockWrap, idForDeclareCached, loc, msCall, tLines} from './util'

export function transpileExceptValNoLoc(_: Except): Expression {
	return blockWrap(new BlockStatement(toArray(transpileExceptDoNoLoc(_))))
}

export function transpileExceptDoNoLoc(_: Except): Statement | Array<Statement> {
	const {try: _try, typedCatches, opCatchAll, opElse, opFinally} = _
	return caseOp<Block, Statement | Array<Statement>>(opElse,
		_else => transpileWithElse(_, _else),
		() => new TryStatement(
			transpileBlock(_try),
			transpileCatches(typedCatches, opCatchAll, false),
			opMap(opFinally, transpileBlockDo)))
}

/**
let exceptElse_ = false
try {
	{{try}}
	exceptElse_ = true
	{{opElse}}
} catch (_) {
	if (exceptElse_)
		throw _
	{{allCatches}}
}
*/
function transpileWithElse(_: Except, _else: Block): Array<Statement> {
	const {try: _try, typedCatches, opCatchAll, opFinally} = _
	//_try.lines must all be Do
	//(maybe just have a BlockDo ast type for this?)
	const tryAst = transpileBlock(_else, cat(tLines(<Array<Do>> _try.lines), SetExceptElse))
	const catchAst = transpileCatches(typedCatches, opCatchAll, true)
	return [LetExceptElse, new TryStatement(tryAst, catchAst, opMap(opFinally, transpileBlockDo))]
}

function transpileCatches(typedCatches: Array<Catch>, opCatchAll: Op<Catch>, hasElse: boolean): CatchClause {
	const allCatches = cat(typedCatches, opCatchAll)
	// If they all have the same name, we don't need individual declare for their errors.
	const needsErrorDeclare = !allSame(allCatches, _ => _.caught.name)
	const idError = needsErrorDeclare ? IdError : idForDeclareCached(allCatches[0].caught)
	const throwIfOnElse = () =>
		new IfStatement(IdExceptElse, new ThrowStatement(idError))

	const catchAll = caseOp(opCatchAll,
		_ => transpileCatch(_, needsErrorDeclare),
		() => new BlockStatement([new ThrowStatement(idError)]))

	const catchBlock = (() => {
		if (isEmpty(typedCatches)) {
			if (hasElse)
				catchAll.body.unshift(throwIfOnElse())
			return catchAll
		} else {
			let catches: Statement = catchAll
			for (const typedCatch of reverseIter(typedCatches)) {
				//todo: all typed catches have <Val>, can we let type system know?
				const type = <Val> typedCatch.caught.opType
				const cond = msCall('contains', transpileVal(type), idError)
				const then = transpileCatch(typedCatch, needsErrorDeclare)
				catches = new IfStatement(cond, then, catches)
			}
			return new BlockStatement(hasElse ? [throwIfOnElse(), catches] : [catches])
		}
	})()

	return new CatchClause(idError, catchBlock)
}

/**
@param needsErrorDeclare
	If there are multiple catches with different error names, each one must declare its own.
	The common error (used by the compiled `catch` block) is IdError.
*/
function transpileCatch(_: Catch, needsErrorDeclare: boolean): BlockStatement {
	const {caught, block} = _
	return loc(_, (() => {
		if (needsErrorDeclare) {
			const declareError = new VariableDeclarationLet(
				[new VariableDeclarator(transpileLocalDeclare(caught), IdError)])
			return transpileBlockNoLoc(block, declareError)
		} else
			return transpileBlockNoLoc(block)
	})())
}

const
	IdError = new Identifier('error_'),
	IdExceptElse = new Identifier('exceptElse_'),
	LetExceptElse = new VariableDeclarationLet(
		[new VariableDeclarator(IdExceptElse, new LiteralBoolean(false))]),
	SetExceptElse = new ExpressionStatement(new AssignmentExpression('=', IdExceptElse, new LiteralBoolean(true)))

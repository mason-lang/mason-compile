import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {AssignmentExpression, NewExpression, UnaryExpression
	} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {LiteralBoolean, LiteralString} from 'esast/lib/Literal'
import Statement, {BlockStatement, CatchClause, ExpressionStatement, IfStatement, ThrowStatement,
	TryStatement} from 'esast/lib/Statement'
import Op, {caseOp, opMap, orThrow} from 'op/Op'
import Block from '../ast/Block'
import Call from '../ast/Call'
import {Assert, Catch, Except, Throw} from '../ast/errors'
import {Do, Val} from '../ast/LineContent'
import Quote from '../ast/Quote'
import {Member} from '../ast/Val'
import {allSame, cat, isEmpty, reverseIter, toArray} from '../util'
import {esGlobalError} from './esast-constants'
import {msCall} from './ms'
import throwErrorFromString from './throwErrorFromString'
import transpileBlock, {blockWrap, transpileBlockDo, transpileBlockNoLoc} from './transpileBlock'
import {idForDeclareCached, plainLetForDeclare} from './transpileLocals'
import transpileMemberName from './transpileMemberName'
import transpileQuote from './transpileQuote'
import transpileVal from './transpileVal'
import {loc, transpileLines} from './util'

export function transpileAssertNoLoc({negate, condition, opThrown}: Assert): Statement {
	const failCond = () => {
		const cond = transpileVal(condition)
		return negate ? cond : new UnaryExpression('!', cond)
	}

	return caseOp(
		opThrown,
		_ => new IfStatement(failCond(), doThrow(_)),
		() => {
			if (condition instanceof Call) {
				const {called, args} = condition
				const argAsts = args.map(transpileVal)
				return new ExpressionStatement(called instanceof Member ?
					msCall(
						negate ? 'assertNotMember' : 'assertMember',
						transpileVal(called.object), transpileMemberName(called.name), ...argAsts) :
					msCall(negate ? 'assertNot' : 'assert', transpileVal(called), ...argAsts))
			} else
				return new IfStatement(failCond(), throwAssertFail)
		})
}

const throwAssertFail = throwErrorFromString('Assertion failed.')

export function transpileExceptValNoLoc(_: Except): Expression {
	return blockWrap(new BlockStatement(toArray(transpileExceptDoNoLoc(_))))
}

export function transpileExceptDoNoLoc({tried, typedCatches, opCatchAll, opElse, opFinally}: Except)
	: Statement | Array<Statement> {
	return caseOp<Block, Statement | Array<Statement>>(
		opElse,
		elseBlock => {
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
			// TODO: this would be a good reason to have a BlockDo type for `try`
			const lead = cat(transpileLines(<Array<Do>> tried.lines), setExceptElse)
			const tryAst = transpileBlock(elseBlock, {lead})
			const catchAst = transpileCatches(typedCatches, opCatchAll, true)
			return [letExceptElse, new TryStatement(tryAst, catchAst, opMap(opFinally, transpileBlockDo))]
		},
		() => new TryStatement(
			transpileBlock(tried),
			transpileCatches(typedCatches, opCatchAll, false),
			opMap(opFinally, transpileBlockDo)))
}

function transpileCatches(
	typedCatches: Array<Catch>,
	opCatchAll: Op<Catch>,
	hasElse: boolean)
	: CatchClause {
	const allCatches = cat(typedCatches, opCatchAll)
	// If they all have the same name, we don't need individual declare for their errors.
	const needsErrorDeclare = !allSame(allCatches, _ => _.caught.name)
	const idCaught = needsErrorDeclare ? idCaughtDefault : idForDeclareCached(allCatches[0].caught)
	const throwIfOnElse = () =>
		new IfStatement(idExceptElse, new ThrowStatement(idCaught))

	const catchAll = caseOp(
		opCatchAll,
		_ => transpileCatch(_, needsErrorDeclare),
		() => new BlockStatement([new ThrowStatement(idCaught)]))

	const catchBlock = (() => {
		if (isEmpty(typedCatches)) {
			if (hasElse)
				catchAll.body.unshift(throwIfOnElse())
			return catchAll
		} else {
			let catches: Statement = catchAll
			for (const typedCatch of reverseIter(typedCatches)) {
				// All typed catches have opType
				const type = orThrow(typedCatch.caught.opType)
				const cond = msCall('hasInstance', transpileVal(type), idCaught)
				const then = transpileCatch(typedCatch, needsErrorDeclare)
				catches = new IfStatement(cond, then, catches)
			}
			return new BlockStatement(hasElse ? [throwIfOnElse(), catches] : [catches])
		}
	})()

	return new CatchClause(idCaught, catchBlock)
}

/**
@param needsErrorDeclare
	If there are multiple catches with different error names, each one must declare its own.
	The common error (used by the compiled `catch` block) is idCaughtDefault.
*/
function transpileCatch(_: Catch, needsErrorDeclare: boolean): BlockStatement {
	const {caught, block} = _
	return loc(_, needsErrorDeclare ?
		transpileBlockNoLoc(block, {lead: plainLetForDeclare(caught, idCaughtDefault)}) :
		transpileBlockNoLoc(block))
}

const idCaughtDefault = new Identifier('error_')
const idExceptElse = new Identifier('exceptElse_')
const letExceptElse = new VariableDeclarationLet(
	[new VariableDeclarator(idExceptElse, new LiteralBoolean(false))])
const setExceptElse = new ExpressionStatement(
	new AssignmentExpression('=', idExceptElse, new LiteralBoolean(true)))

export function transpileThrow(_: Throw): ThrowStatement {
	return loc(_, transpileThrowNoLoc(_))
}

export function transpileThrowNoLoc(_: Throw): ThrowStatement {
	return caseOp(
		_.opThrown,
		doThrow,
		() => new ThrowStatement(new NewExpression(esGlobalError, [litStrThrow])))
}

const litStrThrow = new LiteralString('An error occurred.')

function doThrow(thrown: Val): ThrowStatement {
	return new ThrowStatement(thrown instanceof Quote ?
		new NewExpression(esGlobalError, [transpileQuote(thrown)]) :
		transpileVal(thrown))
}

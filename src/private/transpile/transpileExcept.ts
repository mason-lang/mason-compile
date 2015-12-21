import Op, {caseOp, opMap} from 'op/Op'
import Node, {AssignmentExpression, BlockStatement, CatchClause, Expression, Identifier, IfStatement, Literal, LiteralBoolean,
	Statement, ThrowStatement, TryStatement, VariableDeclaration, VariableDeclarator} from 'esast/lib/ast'
import {Block, Catch, Val, Except} from '../MsAst'
import {allSame, cat, isEmpty, reverseIter} from '../util'
import {blockWrapIfVal, idForDeclareCached, msCall, t0, t1, tLines} from './util'

export default function(): Expression | Statement | Array<Statement> {
	const block = this.opElse === null ?
		new TryStatement(
			t0(this.try),
			transpileCatches(this.typedCatches, this.opCatchAll, false),
			opMap(this.opFinally, t0)) :
		transpileWithElse(this, this.opElse)
	return blockWrapIfVal(this, block)
}

/**
@param needsErrorDeclare
	If there are multiple catches with different error names, each one must declare its own.
	The common error (used by the compiled `catch` block) is IdError.
*/
export function transpileCatch(needsErrorDeclare: boolean): BlockStatement {
	if (needsErrorDeclare) {
		const declareError = new VariableDeclaration('let', [
			new VariableDeclarator(t0(this.caught), IdError)])
		return t1(this.block, declareError)
	} else
		return t0(this.block)
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
	const _try = t1(_else, cat(tLines(_.try.lines), SetExceptElse))
	const _catch = transpileCatches(_.typedCatches, _.opCatchAll, true)
	return [LetExceptElse, new TryStatement(_try, _catch, opMap(_.opFinally, t0))]
}

function transpileCatches(typedCatches: Array<Catch>, opCatchAll: Op<Catch>, hasElse: boolean): CatchClause {
	const allCatches = cat(typedCatches, opCatchAll)
	// If they all have the same name, we don't need individual declare for their errors.
	const needsErrorDeclare = !allSame(allCatches, _ => _.caught.name)
	const idError = needsErrorDeclare ? IdError : idForDeclareCached(allCatches[0].caught)
	const throwIfOnElse = () =>
		new IfStatement(IdExceptElse, new ThrowStatement(idError))

	const catchAll = caseOp(opCatchAll,
		_ => t1(_, needsErrorDeclare),
		() => new ThrowStatement(idError))

	if (isEmpty(typedCatches)) {
		if (hasElse)
			catchAll.body.unshift(throwIfOnElse())
		return new CatchClause(idError, catchAll)
	} else {
		let catches = catchAll
		for (const typedCatch of reverseIter(typedCatches)) {
			const type = <Val> typedCatch.caught.opType
			const cond = msCall('contains', t0(type), idError)
			const then = t1(typedCatch, needsErrorDeclare)
			catches = new IfStatement(cond, then, catches)
		}
		return new CatchClause(idError,
			new BlockStatement(hasElse ? [throwIfOnElse(), catches] : [catches]))
	}
}

const
	IdError = new Identifier('error_'),
	IdExceptElse = new Identifier('exceptElse_'),
	LetExceptElse = new VariableDeclaration('let', [
		new VariableDeclarator(IdExceptElse, new LiteralBoolean(false))]),
	SetExceptElse = new AssignmentExpression('=', IdExceptElse, new LiteralBoolean(true))

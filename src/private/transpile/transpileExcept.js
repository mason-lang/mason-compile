import {AssignmentExpression, BlockStatement, CatchClause, Identifier, IfStatement, Literal,
	ThrowStatement, TryStatement, VariableDeclaration, VariableDeclarator} from 'esast/dist/ast'
import {allSame, cat, ifElse, isEmpty, opMap, reverseIter} from '../util'
import {accessLocalDeclare, blockWrapIfVal, msCall, t0, t1, tLines} from './util'

export default function() {
	const block = this.opElse === null ?
		new TryStatement(
			t0(this.try),
			transpileCatches(this.typedCatches, this.opCatchAll, false),
			opMap(this.opFinally, t0)) :
		transpileWithElse(this)
	return blockWrapIfVal(this, block)
}

/**
@param {boolean} needsErrorDeclare
	If there are multiple catches with different error names, each one must declare its own.
	The common error (used by the compiled `catch` block) is IdError.
*/
export function transpileCatch(needsErrorDeclare) {
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
function transpileWithElse(_) {
	const _try = t1(_.opElse, cat(tLines(_.try.lines), SetExceptElse))
	const _catch = transpileCatches(_.typedCatches, _.opCatchAll, true)
	return [LetExceptElse, new TryStatement(_try, _catch, opMap(_.opFinally, t0))]
}

function transpileCatches(typedCatches, opCatchAll, hasElse) {
	const allCatches = cat(typedCatches, opCatchAll)
	// If they all have the same name, we don't need individual declare for their errors.
	const needsErrorDeclare = !allSame(allCatches, _ => _.caught.name)
	const idError = needsErrorDeclare ? IdError : accessLocalDeclare(allCatches[0].caught)
	const throwIfOnElse = () =>
		new IfStatement(IdExceptElse, new ThrowStatement(idError))

	const catchAll = ifElse(opCatchAll,
		_ => t1(_, needsErrorDeclare),
		() => new ThrowStatement(idError))

	if (isEmpty(typedCatches)) {
		if (hasElse)
			catchAll.body.unshift(throwIfOnElse())
		return new CatchClause(idError, catchAll)
	} else {
		let catches = catchAll
		for (const typedCatch of reverseIter(typedCatches)) {
			const cond = msCall('contains', t0(typedCatch.caught.opType), idError)
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
		new VariableDeclarator(IdExceptElse, new Literal(false))]),
	SetExceptElse = new AssignmentExpression('=', IdExceptElse, new Literal(true))

import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {BinaryExpression, LiteralNumber, MemberExpressionComputed} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import Node from 'esast/lib/Node'
import Statement, {BlockStatement, IfStatement} from 'esast/lib/Statement'
import Op, {caseOp} from 'op/Op'
import Block from '../ast/Block'
import Case, {CasePart, Pattern} from '../ast/Case'
import {LocalDeclare} from '../ast/locals'
import {verifyResults} from './context'
import {IdFocus, LitNull} from './esast-constants'
import transpileBlock from './transpileBlock'
import transpileVal from './transpileVal'
import {transpileAssignSingle} from './transpileX'
import {blockWrap, idForDeclareCached, loc, msCall, plainLet} from './util'
import {throwErrorFromString} from './util2'

export function transpileCaseValNoLoc({opCased, parts, opElse}: Case): Expression {
	const body = caseBody(parts, opElse)
	const block = caseOp(opCased, _ => [transpileAssignSingle(_), body], () => [body])
	return blockWrap(new BlockStatement(block))
}

export function transpileCaseDoNoLoc({opCased, parts, opElse}: Case): Statement | Array<Statement> {
	const body = caseBody(parts, opElse)
	return caseOp(opCased, _ => new BlockStatement([transpileAssignSingle(_), body]), () => body)
}

function caseBody(parts: Array<CasePart>, opElse: Op<Block>): Statement {
	let acc = caseOp<Block, Statement>(opElse, transpileBlock, () => ThrowNoCaseMatch)
	for (let i = parts.length - 1; i >= 0; i = i - 1)
		acc = transpileCasePart(parts[i], acc)
	return acc
}

function transpileCasePart(_: CasePart, alternate: Statement): Statement {
	const {test, result} = _
	return loc(_, ((): Statement => {
		if (test instanceof Pattern) {
			const {type, patterned, locals} = test
			const decl = plainLet(IdExtract,
				msCall('extract', transpileVal(type), IdFocus, new LiteralNumber(locals.length)))
			const testExtract = new BinaryExpression('!==', IdExtract, LitNull)
			const extract = new VariableDeclarationLet(locals.map((_: LocalDeclare, index: number) =>
				new VariableDeclarator(
					idForDeclareCached(_),
					new MemberExpressionComputed(IdExtract, new LiteralNumber(index)))))
			const res = transpileBlock(result, extract)
			return new BlockStatement([decl, new IfStatement(testExtract, res, alternate)])
		} else
			// alternate written to by `caseBody`.
			return new IfStatement(transpileVal(test), transpileBlock(result), alternate)
	})())
}

const IdExtract = new Identifier('_$')
const ThrowNoCaseMatch = throwErrorFromString('No branch of `case` matches.')

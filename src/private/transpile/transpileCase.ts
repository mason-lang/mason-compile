import {VariableDeclarationLet, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {BinaryExpression, MemberExpressionComputed} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {LiteralNumber} from 'esast/lib/Literal'
import Statement, {BlockStatement, IfStatement} from 'esast/lib/Statement'
import Op, {caseOp} from 'op/Op'
import Block from '../ast/Block'
import Case, {CasePart, Pattern} from '../ast/Case'
import {LocalDeclare} from '../ast/locals'
import {idFocus, litNull} from './esast-constants'
import {msCall} from './ms'
import throwErrorFromString from './throwErrorFromString'
import transpileBlock, {blockWrap} from './transpileBlock'
import {idForDeclareCached, plainLet, transpileAssignSingle} from './transpileLocals'
import transpileVal from './transpileVal'
import {loc} from './util'

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
	let acc = caseOp<Block, Statement>(opElse, transpileBlock, () => throwNoCaseMatch)
	for (let i = parts.length - 1; i >= 0; i = i - 1)
		acc = transpileCasePart(parts[i], acc)
	return acc
}

function transpileCasePart(_: CasePart, alternate: Statement): Statement {
	const {test, result} = _
	return loc(_, ((): Statement => {
		if (test instanceof Pattern) {
			const {type, locals} = test
			const decl = plainLet(
				idExtract,
				msCall('extract', transpileVal(type), idFocus, new LiteralNumber(locals.length)))
			const testExtract = new BinaryExpression('!==', idExtract, litNull)
			const extract = new VariableDeclarationLet(locals.map((_: LocalDeclare, index: number) =>
				new VariableDeclarator(
					idForDeclareCached(_),
					new MemberExpressionComputed(idExtract, new LiteralNumber(index)))))
			const res = transpileBlock(result, {lead: extract})
			return new BlockStatement([decl, new IfStatement(testExtract, res, alternate)])
		} else
			// alternate written to by `caseBody`.
			return new IfStatement(transpileVal(test), transpileBlock(result), alternate)
	})())
}

const idExtract = new Identifier('_$')
const throwNoCaseMatch = throwErrorFromString('No branch of `case` matches.')

import {BinaryExpression, BlockStatement, Identifier, IfStatement, Literal, MemberExpression,
	VariableDeclaration, VariableDeclarator} from 'esast/dist/ast'
import {Pattern} from '../MsAst'
import {ifElse} from '../util'
import {LitNull} from './ast-constants'
import {verifyResults} from './context'
import {blockWrap, idForDeclareCached, msCall, plainLet, t0, t1, throwErrorFromString} from './util'

export default function() {
	const body = caseBody(this.parts, this.opElse)
	if (verifyResults.isStatement(this))
		return ifElse(this.opCased, _ => new BlockStatement([t0(_), body]), () => body)
	else {
		const block = ifElse(this.opCased, _ => [t0(_), body], () => [body])
		return blockWrap(new BlockStatement(block))
	}
}

export function transpileCasePart(alternate) {
	if (this.test instanceof Pattern) {
		const {type, patterned, locals} = this.test
		const decl = plainLet(IdExtract,
			msCall('extract', t0(type), t0(patterned), new Literal(locals.length)))
		const test = new BinaryExpression('!==', IdExtract, LitNull)
		const extract = new VariableDeclaration('let', locals.map((_, idx) =>
			new VariableDeclarator(
				idForDeclareCached(_),
				new MemberExpression(IdExtract, new Literal(idx)))))
		const res = t1(this.result, extract)
		return new BlockStatement([decl, new IfStatement(test, res, alternate)])
	} else
		// alternate written to by `caseBody`.
		return new IfStatement(t0(this.test), t0(this.result), alternate)
}

function caseBody(parts, opElse) {
	let acc = ifElse(opElse, t0, () => ThrowNoCaseMatch)
	for (let i = parts.length - 1; i >= 0; i = i - 1)
		acc = t1(parts[i], acc)
	return acc
}

const IdExtract = new Identifier('_$')
const ThrowNoCaseMatch = throwErrorFromString('No branch of `case` matches.')

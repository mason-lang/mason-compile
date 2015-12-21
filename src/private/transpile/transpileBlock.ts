import {BlockStatement, Expression, ReturnStatement, Statement} from 'esast/lib/ast'
import Op from 'op/Op'
import {Val} from '../MsAst'
import {assert, cat, last, rtail} from '../util'
import {Blocks} from '../VerifyResults'
import {DeclareBuiltBag, DeclareBuiltMap, DeclareBuiltObj, IdBuilt} from './ast-constants'
import {verifyResults} from './context'
import {maybeWrapInCheckInstance, t0, tLines} from './util'

export default function(
	lead: Op<Array<Statement>> = null,
	opReturnType: Op<Val> = null,
	follow: Op<Array<Statement>> = null) {
	const kind = verifyResults.blockKind(this)
	switch (kind) {
		case Blocks.Do:
			assert(opReturnType === null)
			return new BlockStatement(cat(lead, tLines(this.lines), follow))
		case Blocks.Throw:
			return new BlockStatement(
				// todo
				cat(<any> lead, <any> tLines(<any> rtail(this.lines)), <any> t0(<any> last(this.lines))))
		case Blocks.Return:
			return transpileBlockReturn(
				// todo
				<any> t0(<any> last(this.lines)), <any> tLines(<any> rtail(this.lines)), lead, opReturnType)
		case Blocks.Bag: case Blocks.Map: case Blocks.Obj: {
			const declare = kind === Blocks.Bag ?
				DeclareBuiltBag :
				kind === Blocks.Map ? DeclareBuiltMap : DeclareBuiltObj
			const body = cat(declare, tLines(this.lines))
			return transpileBlockReturn(IdBuilt, body, lead, opReturnType)
		}
		default:
			throw new Error(String(kind))
	}
}

function transpileBlockReturn(
	returned: Expression,
	lines: Array<Statement>,
	lead: Op<Array<Statement>>,
	opReturnType: Op<Val>) {
	const ret = new ReturnStatement(
		maybeWrapInCheckInstance(returned, opReturnType, 'returned value'))
	return new BlockStatement(cat(lead, lines, ret))
}

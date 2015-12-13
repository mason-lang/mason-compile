import {BlockStatement, ReturnStatement} from 'esast/dist/ast'
import {assert, cat, last, rtail} from '../util'
import {Blocks} from '../VerifyResults'
import {DeclareBuiltBag, DeclareBuiltMap, DeclareBuiltObj, IdBuilt} from './ast-constants'
import {verifyResults} from './context'
import {maybeWrapInCheckInstance, t0, tLines} from './util'

export default function(lead = null, opReturnType = null, follow = null) {
	const kind = verifyResults.blockKind(this)
	switch (kind) {
		case Blocks.Do:
			assert(opReturnType === null)
			return new BlockStatement(cat(lead, tLines(this.lines), follow))
		case Blocks.Throw:
			return new BlockStatement(
				cat(lead, tLines(rtail(this.lines)), t0(last(this.lines))))
		case Blocks.Return:
			return transpileBlockReturn(
				t0(last(this.lines)), tLines(rtail(this.lines)), lead, opReturnType)
		case Blocks.Bag: case Blocks.Map: case Blocks.Obj: {
			const declare = kind === Blocks.Bag ?
				DeclareBuiltBag :
				kind === Blocks.Map ? DeclareBuiltMap : DeclareBuiltObj
			const body = cat(declare, tLines(this.lines))
			return transpileBlockReturn(IdBuilt, body, lead, opReturnType)
		}
		default:
			throw new Error(kind)
	}
}

function transpileBlockReturn(returned, lines, lead, opReturnType) {
	const ret = new ReturnStatement(
		maybeWrapInCheckInstance(returned, opReturnType, 'returned value'))
	return new BlockStatement(cat(lead, lines, ret))
}

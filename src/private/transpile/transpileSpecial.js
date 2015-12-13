import {DebuggerStatement, Literal, UnaryExpression} from 'esast/dist/ast'
import {SpecialDos, SpecialVals} from '../MsAst'
import {verifyResults} from './context'

export function transpileSpecialDo() {
	switch (this.kind) {
		case SpecialDos.Debugger:
			return new DebuggerStatement()
		default:
			throw new Error(this.kind)
	}
}

export function transpileSpecialVal() {
	// Make new objects because we will assign `loc` to them.
	switch (this.kind) {
		case SpecialVals.False:
			return new Literal(false)
		case SpecialVals.Name:
			return new Literal(verifyResults.name(this))
		case SpecialVals.Null:
			return new Literal(null)
		case SpecialVals.True:
			return new Literal(true)
		case SpecialVals.Undefined:
			return new UnaryExpression('void', LitZero)
		default:
			throw new Error(this.kind)
	}
}

const LitZero = new Literal(0)

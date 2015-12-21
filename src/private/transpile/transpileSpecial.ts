import {DebuggerStatement, Expression, LiteralBoolean, LiteralNull, LiteralNumber, LiteralString, Statement, UnaryExpression} from 'esast/lib/ast'
import {SpecialDos, SpecialVals} from '../MsAst'
import {verifyResults} from './context'

export function transpileSpecialDo(): Statement {
	switch (this.kind) {
		case SpecialDos.Debugger:
			return new DebuggerStatement()
		default:
			throw new Error(this.kind)
	}
}

export function transpileSpecialVal(): Expression {
	// Make new objects because we will assign `loc` to them.
	switch (this.kind) {
		case SpecialVals.False:
			return new LiteralBoolean(false)
		case SpecialVals.Name:
			return new LiteralString(verifyResults.name(this))
		case SpecialVals.Null:
			return new LiteralNull()
		case SpecialVals.True:
			return new LiteralBoolean(true)
		case SpecialVals.Undefined:
			return new UnaryExpression('void', LitZero)
		default:
			throw new Error(String(this.kind))
	}
}

const LitZero = new LiteralNumber(0)

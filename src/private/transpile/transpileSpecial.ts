import Expression, {LiteralBoolean, LiteralNull, LiteralNumber, LiteralString, UnaryExpression} from 'esast/lib/Expression'
import Statement, {DebuggerStatement} from 'esast/lib/Statement'
import {SpecialVal, SpecialVals} from '../ast/Val'
import {verifyResults} from './context'

//just inline it...
export function transpileSpecialValNoLoc(_: SpecialVal): Expression {
	// Make new objects because we will assign `loc` to them.
	switch (_.kind) {
		case SpecialVals.False:
			return new LiteralBoolean(false)
		case SpecialVals.Name:
			return new LiteralString(verifyResults.name(_))
		case SpecialVals.Null:
			return new LiteralNull()
		case SpecialVals.True:
			return new LiteralBoolean(true)
		case SpecialVals.Undefined:
			return new UnaryExpression('void', LitZero)
		default:
			throw new Error(String(_.kind))
	}
}

const LitZero = new LiteralNumber(0)

import {caseOp, opIf} from 'op/Op'
import {BreakStatement, Expression, Statement, SwitchCase, SwitchStatement} from 'esast/lib/ast'
import {flatMap} from '../util'
import {verifyResults} from './context'
import {blockWrapIfVal, t0, t3, throwErrorFromString} from './util'

export default function(): Expression | Statement | Array<Statement> {
	// todo
	const parts: Array<SwitchCase> = <any> flatMap(this.parts, t0)
	parts.push(caseOp(this.opElse,
		_ => new SwitchCase(null, t0(_).body),
		() => SwitchCaseNoMatch))

	return blockWrapIfVal(this, new SwitchStatement(t0(this.switched), parts))
}

export function transpileSwitchPart():  Array<SwitchCase>{
	const follow = opIf(verifyResults.isStatement(this), () => new BreakStatement)
	/*
	We could just pass block.body for the switch lines, but instead
	enclose the body of the switch case in curly braces to ensure a new scope.
	That way this code works:
		switch (0) {
			case 0: {
				const a = 0
				return a
			}
			default: {
				// Without curly braces this would conflict with the other `a`.
				const a = 1
				a
			}
		}
	*/
	const block = t3(this.result, null, null, follow)
	// If switch has multiple values, build up a statement like: `case 1: case 2: { doBlock() }`
	const cases: Array<SwitchCase> = []
	for (let i = 0; i < this.values.length - 1; i = i + 1)
		// These cases fallthrough to the one at the end.
		cases.push(new SwitchCase(t0(this.values[i]), []))
	cases.push(new SwitchCase(t0(this.values[this.values.length - 1]), [block]))
	return cases
}

const SwitchCaseNoMatch = new SwitchCase(null, [
	throwErrorFromString('No branch of `switch` matches.')])

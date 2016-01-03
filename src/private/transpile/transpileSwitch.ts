import Expression from 'esast/lib/Expression'
import Statement, {BreakStatement, SwitchCase, SwitchStatement} from 'esast/lib/Statement'
import {caseOp, opIf} from 'op/Op'
import Switch, {SwitchPart} from '../ast/Switch'
import {flatMap} from '../util'
import {verifyResults} from './context'
import transpileBlock from './transpileBlock'
import transpileVal from './transpileVal'
import {blockWrapStatement, loc} from './util'
import {throwErrorFromString} from './util2'

export function transpileSwitchValNoLoc(_: Switch): Expression {
	return blockWrapStatement(transpileSwitchDoNoLoc(_))
}

export function transpileSwitchDoNoLoc({switched, parts, opElse}: Switch): Statement {
	const partAsts = flatMap(parts, transpileSwitchPart)
	partAsts.push(caseOp(opElse,
		//could use a loc (this would be additional)
		_ => new SwitchCase(null, transpileBlock(_).body),
		() => SwitchCaseNoMatch))
	return new SwitchStatement(transpileVal(switched), partAsts)
}

function transpileSwitchPart(_: SwitchPart):  Array<SwitchCase> {
	const {values, result} = _

	const follow = opIf(verifyResults.isStatement(_), () => new BreakStatement)
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
	const block = transpileBlock(result, null, null, follow)
	// If switch has multiple values, build up a statement like: `case 1: case 2: { doBlock() }`
	const cases: Array<SwitchCase> = []
	for (let i = 0; i < values.length - 1; i = i + 1)
		// These cases fallthrough to the one at the end.
		cases.push(loc(_, new SwitchCase(transpileVal(values[i]), [])))
	cases.push(loc(_, new SwitchCase(transpileVal(values[values.length - 1]), [block])))
	return cases
}

const SwitchCaseNoMatch = new SwitchCase(null, [
	throwErrorFromString('No branch of `switch` matches.')])

import Expression from 'esast/lib/Expression'
import {BreakStatement} from 'esast/lib/Loop'
import Statement, {SwitchCase, SwitchStatement} from 'esast/lib/Statement'
import {caseOp, opIf} from 'op/Op'
import Switch, {SwitchPart} from '../ast/Switch'
import {flatMap} from '../util'
import throwErrorFromString from './throwErrorFromString'
import transpileBlock, {blockWrapStatement} from './transpileBlock'
import transpileVal from './transpileVal'
import {loc} from './util'

export function transpileSwitchValNoLoc(_: Switch): Expression {
	return blockWrapStatement(transpileSwitchVDNoLoc(_, false))
}

export function transpileSwitchDoNoLoc(_: Switch): Statement {
	return transpileSwitchVDNoLoc(_, true)
}

function transpileSwitchVDNoLoc({switched, parts, opElse}: Switch, isDo: boolean): Statement {
	const partAsts = flatMap(parts, _ => transpileSwitchPart(_, isDo))
	partAsts.push(caseOp(
		opElse,
		_ => loc(_, new SwitchCase(null, transpileBlock(_).body)),
		() => switchCaseNoMatch))
	return new SwitchStatement(transpileVal(switched), partAsts)
}

function transpileSwitchPart(_: SwitchPart, isDo: boolean):  Array<SwitchCase> {
	const {values, result} = _

	const follow = opIf(isDo, () => new BreakStatement)
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
	const block = transpileBlock(result, {follow})
	// If switch has multiple values, build up a statement like: `case 1: case 2: { doBlock() }`
	const cases: Array<SwitchCase> = []
	for (let i = 0; i < values.length - 1; i = i + 1)
		// These cases fallthrough to the one at the end.
		cases.push(loc(_, new SwitchCase(transpileVal(values[i]), [])))
	cases.push(loc(_, new SwitchCase(transpileVal(values[values.length - 1]), [block])))
	return cases
}

const switchCaseNoMatch = new SwitchCase(
	null,
	[throwErrorFromString('No branch of `switch` matches.')])

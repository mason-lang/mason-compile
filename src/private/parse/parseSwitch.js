import {code} from '../../CompileError'
import {check} from '../context'
import {LocalAccess, SwitchDo, SwitchDoPart, SwitchVal, SwitchValPart} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {checkEmpty} from './checks'
import {parseExpr} from './parse*'
import {beforeAndBlock, parseJustBlockDo, parseJustBlockVal, parseBlockDo, parseBlockVal
	} from './parseBlock'
import parseSingle from './parseSingle'
import Slice from './Slice'

/** Parse a {@link SwitchDo} or {@link SwitchVal}. */
export default function parseSwitch(isVal, switchedFromFun, tokens) {
	const
		parseJustBlock = isVal ? parseJustBlockVal : parseJustBlockDo,
		Switch = isVal ? SwitchVal : SwitchDo

	const [before, block] = beforeAndBlock(tokens)

	let switched
	if (switchedFromFun) {
		checkEmpty(before, 'Value to switch on is `_`, the function\'s implicit argument.')
		switched = LocalAccess.focus(tokens.loc)
	} else
		switched = parseExpr(before)

	const lastLine = Slice.group(block.last())
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlock(Keywords.Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => parseSwitchLine(isVal, line))
	check(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${code('else')} test.`)

	return new Switch(tokens.loc, switched, parts, opElse)
}

function parseSwitchLine(isVal, line) {
	const [before, block] = beforeAndBlock(line)

	let values
	if (isKeyword(Keywords.Or, before.head()))
		values = before.tail().map(parseSingle)
	else
		values = [parseExpr(before)]

	const result = (isVal ? parseBlockVal : parseBlockDo)(block)
	return new (isVal ? SwitchValPart : SwitchDoPart)(line.loc, values, result)
}

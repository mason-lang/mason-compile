import {code} from '../../CompileError'
import {check} from '../context'
import {LocalAccess, SwitchDo, SwitchDoPart, SwitchVal, SwitchValPart} from '../MsAst'
import {isKeyword, KW_Else, KW_Or} from '../Token'
import {checkEmpty} from './checks'
import {parseExpr} from './parse*'
import {beforeAndBlock, justBlockDo, justBlockVal, parseBlockDo, parseBlockVal} from './parseBlock'
import parseSingle from './parseSingle'
import Slice from './Slice'

export default (isVal, switchedFromFun, tokens) => {
	const [before, block] = beforeAndBlock(tokens)

	let switched
	if (switchedFromFun) {
		checkEmpty(before, 'Value to switch on is `_`, the function\'s implicit argument.')
		switched = LocalAccess.focus(tokens.loc)
	} else
		switched = parseExpr(before)

	const lastLine = Slice.group(block.last())
	const [partLines, opElse] = isKeyword(KW_Else, lastLine.head()) ?
		[block.rtail(), (isVal ? justBlockVal : justBlockDo)(KW_Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(parseSwitchLine(isVal))
	check(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${code('else')} test.`)

	return new (isVal ? SwitchVal : SwitchDo)(tokens.loc, switched, parts, opElse)
}

const parseSwitchLine = isVal => line => {
	const [before, block] = beforeAndBlock(line)

	let values
	if (isKeyword(KW_Or, before.head()))
		values = before.tail().map(parseSingle)
	else
		values = [parseExpr(before)]

	const result = (isVal ? parseBlockVal : parseBlockDo)(block)
	return new (isVal ? SwitchValPart : SwitchDoPart)(line.loc, values, result)
}
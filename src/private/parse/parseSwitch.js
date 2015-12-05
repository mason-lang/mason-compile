import {check} from '../context'
import {LocalAccess, Switch, SwitchPart} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {checkEmpty} from './checks'
import {parseExpr, parseExprParts} from './parse*'
import parseBlock, {beforeAndBlock, parseJustBlock} from './parseBlock'
import Slice from './Slice'

/** Parse a {@link Switch}. */
export default function parseSwitch(switchedFromFun, tokens) {
	const [before, block] = beforeAndBlock(tokens)

	if (switchedFromFun)
		checkEmpty(before, 'switchArgIsImplicit')
	const switched = switchedFromFun ? LocalAccess.focus(tokens.loc) : parseExpr(before)

	const lastLine = Slice.group(block.last())
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlock(Keywords.Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => {
		const [before, block] = beforeAndBlock(line)
		return new SwitchPart(line.loc, parseExprParts(before), parseBlock(block))
	})
	check(parts.length > 0, tokens.loc, 'caseSwitchNeedsParts')
	return new Switch(tokens.loc, switched, parts, opElse)
}

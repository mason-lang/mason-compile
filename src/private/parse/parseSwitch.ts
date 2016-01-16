import {check} from '../context'
import {LocalAccess} from '../ast/locals'
import Switch, {SwitchPart} from '../ast/Switch'
import {isKeyword, Keywords} from '../token/Keyword'
import {checkEmpty} from './checks'
import parseBlock, {beforeAndBlock, parseJustBlock} from './parseBlock'
import parseExpr, {parseExprParts} from './parseExpr'
import {Tokens} from './Slice'

/** Parse a [[Switch]]. */
export default function parseSwitch(switchedFromFun: boolean, tokens: Tokens): Switch {
	const [before, block] = beforeAndBlock(tokens)

	if (switchedFromFun)
		checkEmpty(before, _ => _.switchArgIsImplicit)
	const switched = switchedFromFun ? LocalAccess.focus(tokens.loc) : parseExpr(before)

	const lastLine = block.lastSlice()
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlock(Keywords.Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => {
		const [before, block] = beforeAndBlock(line)
		return new SwitchPart(line.loc, parseExprParts(before), parseBlock(block))
	})
	check(parts.length > 0, tokens.loc, _ => _.caseSwitchNeedsParts)
	return new Switch(tokens.loc, switched, parts, opElse)
}

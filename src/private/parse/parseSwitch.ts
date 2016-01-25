import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import Block from '../ast/Block'
import {LocalAccess} from '../ast/locals'
import Switch, {SwitchPart} from '../ast/Switch'
import {beforeAndBlock} from './parseBlock'
import {parseCaseSwitchParts} from './parseCase'
import parseExpr, {parseExprParts} from './parseExpr'
import {Lines, Tokens} from './Slice'

export default function parseSwitch(tokens: Tokens): Switch {
	const [before, block] = beforeAndBlock(tokens)
	const switched = parseExpr(before)
	const {parts, opElse} = parseSwitchParts(block)
	return new Switch(tokens.loc, switched, parts, opElse)
}

export function parseSwitchFun(loc: Loc, block: Lines): Switch {
	const {parts, opElse} = parseSwitchParts(block)
	return new Switch(loc, LocalAccess.focus(loc), parts, opElse)
}

function parseSwitchParts(block: Lines): {parts: Array<SwitchPart>, opElse: Op<Block>} {
	return parseCaseSwitchParts(block, (loc, before, block) =>
		new SwitchPart(loc, parseExprParts(before), block))
}

import Loc from 'esast/lib/Loc'
import Op, {opMap} from 'op/Op'
import Block from '../ast/Block'
import Case, {CasePart, Pattern} from '../ast/Case'
import {Val} from '../ast/LineContent'
import {AssignSingle} from '../ast/locals'
import {GroupSpace} from '../token/Group'
import {isKeyword, Keywords} from '../token/Keyword'
import {checkNonEmpty} from './checks'
import parseBlock, {beforeAndBlock, parseJustBlock} from './parseBlock'
import parseExpr, {opParseExpr} from './parseExpr'
import parseLocalDeclares from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import {Lines, Tokens} from './Slice'

export default function parseCase(tokens: Tokens): Case {
	const [before, block] = beforeAndBlock(tokens)
	const opCased = opMap(opParseExpr(before), _ => AssignSingle.focus(_.loc, _))
	const {parts, opElse} = parseCaseParts(block)
	return new Case(tokens.loc, opCased, parts, opElse)
}

export function parseCaseFun(loc: Loc, lines: Lines): Case {
	const {parts, opElse} = parseCaseParts(lines)
	return new Case(loc, null, parts, opElse)
}

function parseCaseParts(block: Lines): {parts: Array<CasePart>, opElse: Op<Block>} {
	return parseCaseSwitchParts(block, (loc, before, block) =>
		new CasePart(loc, parseCaseTest(before), block))
}

function parseCaseTest(tokens: Tokens): Val | Pattern {
	const first = tokens.head()
	// Pattern match starts with type test and is followed by local declares.
	// E.g., `:Some val`
	if (first instanceof GroupSpace && tokens.size() > 1) {
		const ft = Tokens.of(first)
		if (isKeyword(Keywords.Colon, ft.head())) {
			const type = parseSpaced(ft.tail())
			const locals = parseLocalDeclares(tokens.tail())
			return new Pattern(tokens.loc, type, locals)
		}
	}
	return parseExpr(tokens)
}

export function parseCaseSwitchParts<A>(
	block: Lines, ctr: (loc: Loc, before: Tokens, block: Block) => A)
	: {parts: Array<A>, opElse: Block} {
	const [partLines, opElse] = takeOpElseFromEnd(block)
	const parts = partLines.mapSlices(line => {
		const [before, block] = beforeAndBlock(line)
		return ctr(line.loc, before, parseBlock(block))
	})
	return {parts, opElse}
}

function takeOpElseFromEnd(block: Lines): [Lines, Block]  {
	const lastLine = block.lastSlice()
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlock(Keywords.Else, lastLine.tail())] :
		[block, null]
	checkNonEmpty(partLines, _ => _.caseSwitchNeedsParts)
	return [partLines, opElse]
}

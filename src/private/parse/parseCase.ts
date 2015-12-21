import Op, {opMap} from 'op/Op'
import {check} from '../context'
import {AssignSingle, Case, CasePart, Val, Pattern} from '../MsAst'
import {Group, GroupSpace, isKeyword, Keywords} from '../Token'
import {checkEmpty} from './checks'
import {opParseExpr, parseExpr} from './parse*'
import parseBlock, {beforeAndBlock, parseJustBlock} from './parseBlock'
import parseLocalDeclares from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import {Tokens} from './Slice'

/** Parse a [[Case]]. */
export default function parseCase(casedFromFun: boolean, tokens: Tokens): Case {
	const [before, block] = beforeAndBlock(tokens)

	let opCased: Op<AssignSingle>
	if (casedFromFun) {
		checkEmpty(before, _ => _.caseFocusIsImplicit)
		opCased = null
	} else
		opCased = opMap(opParseExpr(before), _ => AssignSingle.focus(_.loc, _))

	const lastLine = Tokens.of(block.last())
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlock(Keywords.Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => {
		const [before, block] = beforeAndBlock(line)
		return new CasePart(line.loc, parseCaseTest(before), parseBlock(block))
	})
	check(parts.length > 0, tokens.loc, _ => _.caseSwitchNeedsParts)

	return new Case(tokens.loc, opCased, parts, opElse)
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

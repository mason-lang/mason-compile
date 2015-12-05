import {check} from '../context'
import {AssignSingle, Case, CasePart, Pattern} from '../MsAst'
import {Groups, isGroup, isKeyword, Keywords} from '../Token'
import {opMap} from '../util'
import {checkEmpty} from './checks'
import {opParseExpr, parseExpr} from './parse*'
import parseBlock, {beforeAndBlock, parseJustBlock} from './parseBlock'
import parseLocalDeclares from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import Slice from './Slice'

/** Parse a {@link Case}. */
export default function parseCase(casedFromFun, tokens) {
	const [before, block] = beforeAndBlock(tokens)

	let opCased
	if (casedFromFun) {
		checkEmpty(before, 'caseFocusIsImplicit')
		opCased = null
	} else
		opCased = opMap(opParseExpr(before), _ => AssignSingle.focus(_.loc, _))

	const lastLine = Slice.group(block.last())
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlock(Keywords.Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => {
		const [before, block] = beforeAndBlock(line)
		return new CasePart(line.loc, parseCaseTest(before), parseBlock(block))
	})
	check(parts.length > 0, tokens.loc, () => 'caseNeedsParts')

	return new Case(tokens.loc, opCased, parts, opElse)
}

function parseCaseTest(tokens) {
	const first = tokens.head()
	// Pattern match starts with type test and is followed by local declares.
	// E.g., `:Some val`
	if (isGroup(Groups.Space, first) && tokens.size() > 1) {
		const ft = Slice.group(first)
		if (isKeyword(Keywords.Colon, ft.head())) {
			const type = parseSpaced(ft.tail())
			const locals = parseLocalDeclares(tokens.tail())
			return new Pattern(tokens.loc, type, locals)
		}
	}
	return parseExpr(tokens)
}

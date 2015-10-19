import {code} from '../../CompileError'
import {check} from '../context'
import {AssignSingle, CaseDo, CaseDoPart, CaseVal, CaseValPart, Pattern} from '../MsAst'
import {Groups, isGroup, isKeyword, Keywords} from '../Token'
import {opIf} from '../util'
import {checkEmpty} from './checks'
import {parseExpr} from './parse*'
import {beforeAndBlock, parseBlockDo, parseBlockVal, parseJustBlockDo, parseJustBlockVal
	} from './parseBlock'
import parseLocalDeclares from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import Slice from './Slice'

/** Parse a {@link CaseDo} or {@link CaseVal}. */
export default function parseCase(isVal, casedFromFun, tokens) {
	const
		parseJustBlock = isVal ? parseJustBlockVal : parseJustBlockDo,
		Case = isVal ? CaseVal : CaseDo

	const [before, block] = beforeAndBlock(tokens)

	let opCased
	if (casedFromFun) {
		checkEmpty(before, 'Can\'t make focus — is implicitly provided as first argument.')
		opCased = null
	} else
		opCased = opIf(!before.isEmpty(), () => AssignSingle.focus(before.loc, parseExpr(before)))

	const lastLine = Slice.group(block.last())
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlock(Keywords.Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => parseCaseLine(isVal, line))
	check(parts.length > 0, tokens.loc, () =>
		`Must have at least 1 non-${code('else')} test.`)

	return new Case(tokens.loc, opCased, parts, opElse)
}

function parseCaseLine(isVal, line) {
	const [before, block] = beforeAndBlock(line)
	const test = parseCaseTest(before)
	const result = (isVal ? parseBlockVal : parseBlockDo)(block)
	return new (isVal ? CaseValPart : CaseDoPart)(line.loc, test, result)
}

function parseCaseTest(tokens) {
	const first = tokens.head()
	// Pattern match starts with type test and is followed by local declares.
	// E.g., `:Some val`
	if (isGroup(Groups.Space, first) && tokens.size() > 1) {
		const ft = Slice.group(first)
		if (isKeyword(Keywords.Type, ft.head())) {
			const type = parseSpaced(ft.tail())
			const locals = parseLocalDeclares(tokens.tail())
			return new Pattern(tokens.loc, type, locals)
		}
	}
	return parseExpr(tokens)
}

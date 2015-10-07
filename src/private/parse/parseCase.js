import {code} from '../../CompileError'
import {AssignSingle, CaseDo, CaseDoPart, CaseVal, CaseValPart, LocalAccess, Pattern
	} from '../MsAst'
import {G_Space, isGroup, isKeyword, KW_Else, KW_Type} from '../Token'
import {opIf} from '../util'
import {checkEmpty, context} from './context'
import {parseExpr} from './parse*'
import {beforeAndBlock, parseBlockDo, parseBlockVal, justBlockDo, justBlockVal} from './parseBlock'
import parseLocalDeclares from './parseLocalDeclares'
import parseSpaced from './parseSpaced'
import Slice from './Slice'

export default (isVal, casedFromFun, tokens) => {
	const [before, block] = beforeAndBlock(tokens)

	let opCased
	if (casedFromFun) {
		checkEmpty(before, 'Can\'t make focus — is implicitly provided as first argument.')
		opCased = null
	} else
		opCased = opIf(!before.isEmpty(), () => AssignSingle.focus(before.loc, parseExpr(before)))

	const lastLine = Slice.group(block.last())
	const [partLines, opElse] = isKeyword(KW_Else, lastLine.head()) ?
		[block.rtail(), (isVal ? justBlockVal : justBlockDo)(KW_Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => parseCaseLine(isVal, line))
	context.check(parts.length > 0, tokens.loc, () =>
		`Must have at least 1 non-${code('else')} test.`)

	return new (isVal ? CaseVal : CaseDo)(tokens.loc, opCased, parts, opElse)
}

const
	parseCaseLine = (isVal, line) => {
		const [before, block] = beforeAndBlock(line)
		const test = parseCaseTest(before)
		const result = (isVal ? parseBlockVal : parseBlockDo)(block)
		return new (isVal ? CaseValPart : CaseDoPart)(line.loc, test, result)
	},

	parseCaseTest = tokens => {
		const first = tokens.head()
		// Pattern match starts with type test and is followed by local declares.
		// E.g., `:Some val`
		if (isGroup(G_Space, first) && tokens.size() > 1) {
			const ft = Slice.group(first)
			if (isKeyword(KW_Type, ft.head())) {
				const type = parseSpaced(ft.tail())
				const locals = parseLocalDeclares(tokens.tail())
				return new Pattern(first.loc, type, locals, LocalAccess.focus(tokens.loc))
			}
		}
		return parseExpr(tokens)
	}
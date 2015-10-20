import {code} from '../../CompileError'
import {check} from '../context'
import {Catch, ExceptDo, ExceptVal, LocalDeclare} from '../MsAst'
import {opIf} from '../util'
import {isKeyword, keywordName, Keywords} from '../Token'
import {checkNonEmpty} from './checks'
import {beforeAndBlock, parseBlockVal, parseBlockDo, justBlock, parseJustBlockDo, parseJustBlockVal
	} from './parseBlock'
import parseLocalDeclares from './parseLocalDeclares'

/** Parse an {@link ExceptDo} or {@link ExceptVal}. */
export default function parseExcept(kwExcept, tokens) {
	const
		isVal = kwExcept === Keywords.ExceptVal,
		justDoValBlock = isVal ? parseJustBlockVal : parseJustBlockDo,
		parseBlock = isVal ? parseBlockVal : parseBlockDo,
		Except = isVal ? ExceptVal : ExceptDo,
		kwTry = isVal ? Keywords.TryVal : Keywords.TryDo,
		kwCatch = isVal ? Keywords.CatchVal : Keywords.CatchDo,
		nameTry = () => code(keywordName(kwTry)),
		nameCatch = () => code(keywordName(kwCatch)),
		nameFinally = () => code(keywordName(Keywords.Finally))

	const lines = justBlock(kwExcept, tokens)

	// `try` *must* come first.
	const firstLine = lines.headSlice()
	const tokenTry = firstLine.head()
	check(isKeyword(kwTry, tokenTry), tokenTry.loc, () =>
		`Must start with ${nameTry()}`)
	const _try = justDoValBlock(kwTry, firstLine.tail())

	const restLines = lines.tail()
	checkNonEmpty(restLines, () =>
		`Must have at least one of ${nameCatch()} or ${nameFinally()}`)

	const handleFinally = restLines => {
		const line = restLines.headSlice()
		const tokenFinally = line.head()
		check(isKeyword(Keywords.Finally, tokenFinally), tokenFinally.loc, () =>
			`Expected ${nameFinally()}`)
		check(restLines.size() === 1, restLines.loc, () =>
			`Nothing is allowed to come after ${nameFinally()}.`)
		return parseJustBlockDo(Keywords.Finally, line.tail())
	}

	let _catch, _finally

	const line2 = restLines.headSlice()
	const head2 = line2.head()
	if (isKeyword(kwCatch, head2)) {
		const [before2, block2] = beforeAndBlock(line2.tail())
		const caught = parseOneLocalDeclareOrFocus(before2)
		_catch = new Catch(line2.loc, caught, parseBlock(block2))
		_finally = opIf(restLines.size() > 1, () => handleFinally(restLines.tail()))
	} else {
		_catch = null
		_finally = handleFinally(restLines)
	}

	return new Except(tokens.loc, _try, _catch, _finally)
}

function parseOneLocalDeclareOrFocus(tokens) {
	if (tokens.isEmpty())
		return LocalDeclare.focus(tokens.loc)
	else {
		check(tokens.size() === 1, 'Expected only one local declare.')
		return parseLocalDeclares(tokens)[0]
	}
}

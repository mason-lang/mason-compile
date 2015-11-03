import {check} from '../context'
import {Catch, Except, LocalDeclare} from '../MsAst'
import {opIf} from '../util'
import {isKeyword, Keywords, showKeyword} from '../Token'
import {checkNonEmpty} from './checks'
import {beforeAndBlock, parseBlockDoOrVal, justBlock, parseJustBlockDoOrVal, parseJustBlockDo
	} from './parseBlock'
import parseLocalDeclares from './parseLocalDeclares'

/** Parse an {@link Except}. */
export default function parseExcept(isVal, tokens) {
	const lines = justBlock(Keywords.Except, tokens)

	// `try` *must* come first.
	const firstLine = lines.headSlice()
	const tokenTry = firstLine.head()
	check(isKeyword(Keywords.Try, tokenTry), tokenTry.loc, () =>
		`Must start with ${showKeyword(Keywords.Try)}`)
	const _try = parseJustBlockDoOrVal(isVal, Keywords.Try, firstLine.tail())

	const restLines = lines.tail()
	checkNonEmpty(restLines, () =>
		'Must have at least one of ' +
		`${showKeyword(Keywords.Catch)} or ${showKeyword(Keywords.Finally)}`)

	const handleFinally = restLines => {
		const line = restLines.headSlice()
		const tokenFinally = line.head()
		check(isKeyword(Keywords.Finally, tokenFinally), tokenFinally.loc, () =>
			`Expected ${showKeyword(Keywords.Finally)}`)
		check(restLines.size() === 1, restLines.loc, () =>
			`Nothing is allowed to come after ${showKeyword(Keywords.Finally)}.`)
		return parseJustBlockDo(Keywords.Finally, line.tail())
	}

	let _catch, _finally

	const line2 = restLines.headSlice()
	const head2 = line2.head()
	if (isKeyword(Keywords.Catch, head2)) {
		const [before2, block2] = beforeAndBlock(line2.tail())
		const caught = parseOneLocalDeclareOrFocus(before2)
		_catch = new Catch(line2.loc, caught, parseBlockDoOrVal(isVal, block2))
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

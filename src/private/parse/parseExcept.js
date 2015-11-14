import {check} from '../context'
import {Catch, Except} from '../MsAst'
import {isKeyword, Keywords, showKeyword} from '../Token'
import {checkKeyword} from './checks'
import parseBlock, {beforeAndBlock, justBlock, parseJustBlock} from './parseBlock'
import {parseLocalDeclareOrFocus} from './parseLocalDeclares'

/** Parse an {@link Except}. */
export default function parseExcept(tokens) {
	const lines = justBlock(Keywords.Except, tokens)
	const [_try, rest] = takeTry(lines)
	const [typedCatches, opCatchAll, rest2] = takeTypedCatches(rest)
	const [opElse, rest3] = opTakeElse(rest2)
	const opFinally = parseOpFinally(rest3)
	return new Except(tokens.loc, _try, typedCatches, opCatchAll, opElse, opFinally)
}

function takeTry(lines) {
	const line = lines.headSlice()
	checkKeyword(Keywords.Try, line.head())
	return [parseJustBlock(Keywords.Try, line.tail()), lines.tail()]
}

function takeTypedCatches(lines) {
	const typedCatches = []
	let opCatchAll = null

	while (!lines.isEmpty()) {
		const line = lines.headSlice()
		if (!isKeyword(Keywords.Catch, line.head()))
			break

		const [before, block] = beforeAndBlock(line.tail())
		const caught = parseLocalDeclareOrFocus(before)
		const _catch = new Catch(line.loc, caught, parseBlock(block))

		lines = lines.tail()

		if (caught.opType === null) {
			opCatchAll = _catch
			break
		} else
			typedCatches.push(_catch)
	}
	return [typedCatches, opCatchAll, lines]
}

function opTakeElse(lines) {
	if (lines.isEmpty())
		return [null, lines]

	const line = lines.headSlice()
	const tokenElse = line.head()
	return isKeyword(Keywords.Else, tokenElse) ?
		[parseJustBlock(Keywords.Else, line.tail()), lines.tail()] :
		[null, lines]
}

function parseOpFinally(lines) {
	if (lines.isEmpty())
		return null

	const line = lines.headSlice()
	checkKeyword(Keywords.Finally, line.head())
	check(lines.size() === 1, lines.loc, () =>
		`Nothing may come after ${showKeyword(Keywords.Finally)}.`)
	return parseJustBlock(Keywords.Finally, line.tail())
}

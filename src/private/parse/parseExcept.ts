import Op from 'op/Op'
import Block from '../ast/Block'
import {Catch, Except} from '../ast/errors'
import {check} from '../context'
import {isKeyword, Keywords} from '../token/Keyword'
import {checkKeyword} from './checks'
import parseBlock, {beforeAndBlock, justBlock, parseJustBlock} from './parseBlock'
import {parseLocalDeclareOrFocus} from './parseLocalDeclares'
import {Lines, Tokens} from './Slice'

/** Parse an [[Except]]. */
export default function parseExcept(tokens: Tokens): Except {
	const lines = justBlock(Keywords.Except, tokens)
	const [tried, rest] = takeTried(lines)
	const [typedCatches, opCatchAll, rest2] = takeCatches(rest)
	const [opElse, rest3] = opTakeElse(rest2)
	const opFinally = parseOpFinally(rest3)
	return new Except(tokens.loc, tried, typedCatches, opCatchAll, opElse, opFinally)
}

function takeTried(lines: Lines): [Block, Lines] {
	const line = lines.headSlice()
	checkKeyword(Keywords.Try, line.head())
	return [parseJustBlock(Keywords.Try, line.tail()), lines.tail()]
}

function takeCatches(lines: Lines): [Array<Catch>, Op<Catch>, Lines] {
	const typedCatches: Array<Catch> = []
	let opCatchAll: Op<Catch> = null

	while (!lines.isEmpty()) {
		const line = lines.headSlice()
		if (!isKeyword(Keywords.Catch, line.head()))
			break

		const [before, block] = beforeAndBlock(line.tail())
		const caught = parseLocalDeclareOrFocus(before)
		const catcher = new Catch(line.loc, caught, parseBlock(block))

		lines = lines.tail()

		if (caught.opType === null) {
			opCatchAll = catcher
			break
		} else
			typedCatches.push(catcher)
	}
	return [typedCatches, opCatchAll, lines]
}

function opTakeElse(lines: Lines): [Op<Block>, Lines] {
	if (lines.isEmpty())
		return [null, lines]

	const line = lines.headSlice()
	const tokenElse = line.head()
	return isKeyword(Keywords.Else, tokenElse) ?
		[parseJustBlock(Keywords.Else, line.tail()), lines.tail()] :
		[null, lines]
}

function parseOpFinally(lines: Lines): Op<Block> {
	if (lines.isEmpty())
		return null

	const line = lines.headSlice()
	checkKeyword(Keywords.Finally, line.head())
	check(lines.size() === 1, lines.loc, _ => _.nothingAfterFinally)
	return parseJustBlock(Keywords.Finally, line.tail())
}

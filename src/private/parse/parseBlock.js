import {check} from '../context'
import {Block, BlockWrap} from '../MsAst'
import {Groups, isGroup, showKeyword} from '../Token'
import {checkEmpty} from './checks'
import {parseLines} from './parseLine'
import tryTakeComment from './tryTakeComment'
import Slice from './Slice'

/** Parse lines in a block and leading doc comment. */
export default function parseBlock(lineTokens) {
	const [opComment, rest] = tryTakeComment(lineTokens)
	return new Block(lineTokens.loc, opComment, parseLines(rest))
}

/**
Tokens on the line before a block, and tokens for the block itself.
@return {[Slice, Slice]}
*/
export function beforeAndBlock(tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	check(opBlock !== null, tokens.loc, 'Expected an indented block at the end.')
	return [before, opBlock]
}

/**
`beforeAndBlock` that returns `null` for missing block.
@return {[Slice, ?Slice]}
*/
export function beforeAndOpBlock(tokens) {
	if (tokens.isEmpty())
		return [tokens, null]
	else {
		const block = tokens.last()
		return isGroup(Groups.Block, block) ? [tokens.rtail(), Slice.group(block)] : [tokens, null]
	}
}

/** Parse a Block as a single value. */
export function parseBlockWrap(tokens) {
	return new BlockWrap(tokens.loc, parseBlock(tokens))
}

/**
Parse a block, failing if there's something preceding it.
@param {Keywords} keywordKind Keyword that precedes the block. Used for error message.
@param {Slice} tokens Tokens which should have a block at the end.
*/
export function justBlock(keywordKind, tokens) {
	const [before, block] = beforeAndBlock(tokens)
	checkEmpty(before, () =>
		`Did not expect anything between ${showKeyword(keywordKind)} and block.`)
	return block
}

/** Parse a block from the end of `tokens`, failing if there's something preceding it. */
export function parseJustBlock(keywordKind, tokens) {
	return parseBlock(justBlock(keywordKind, tokens))
}

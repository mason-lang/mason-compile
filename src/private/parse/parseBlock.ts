import Op, {orThrow} from 'op/Op'
import Block, {BlockWrap} from '../ast/Block'
import {fail} from '../context'
import {GroupBlock} from '../token/Group'
import {Keywords} from '../token/Keyword'
import {checkEmpty} from './checks'
import {parseLines} from './parseLine'
import tryTakeComment from './tryTakeComment'
import {Lines, Tokens} from './Slice'

/** Parse lines in a block and leading doc comment. */
export default function parseBlock(lineTokens: Lines): Block {
	const [opComment, rest] = tryTakeComment(lineTokens)
	return new Block(lineTokens.loc, opComment, parseLines(rest))
}

/** Tokens on the line before a block, and tokens for the block itself. */
export function beforeAndBlock(tokens: Tokens): [Tokens, Lines] {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const block = orThrow(opBlock, () => fail(tokens.loc, _ => _.expectedBlock))
	return [before, block]
}

/** `beforeAndBlock` that returns `null` for missing block. */
export function beforeAndOpBlock(tokens: Tokens): [Tokens, Op<Lines>] {
	if (tokens.isEmpty())
		return [tokens, null]
	else {
		const block = tokens.last()
		return block instanceof GroupBlock ? [tokens.rtail(), Lines.of(block)] : [tokens, null]
	}
}

/** Parse a Block as a single value. */
export function parseBlockWrap(tokens: Lines): BlockWrap {
	return new BlockWrap(tokens.loc, parseBlock(tokens))
}

/**
Parse a block, failing if there's something preceding it.
@param keywordKind Keyword that precedes the block. Used for error message.
@param tokens Tokens which should have a block at the end.
*/
export function justBlock(keywordKind: Keywords, tokens: Tokens): Lines {
	const [before, block] = beforeAndBlock(tokens)
	checkEmpty(before, _ => _.unexpectedAfterKind(keywordKind))
	return block
}

/** Parse a block from the end of `tokens`, failing if there's something preceding it. */
export function parseJustBlock(keywordKind: Keywords, tokens: Tokens): Block {
	return parseBlock(justBlock(keywordKind, tokens))
}

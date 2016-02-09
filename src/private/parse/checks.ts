import CompileError from '../../CompileError'
import {check, fail} from '../context'
import Language from '../languages/Language'
import {isKeyword, KeywordReserved, Kw} from '../token/Keyword'
import Token from '../token/Token'
import Slice from './Slice'

/** Throw if `tokens` has content. */
export function checkEmpty(tokens: Slice<Token>, message: (_: Language) => string): void {
	check(tokens.isEmpty(), tokens.loc, message)
}

/** Throw if `tokens` is empty. */
export function checkNonEmpty(tokens: Slice<Token>, message: (_: Language) => string): void {
	check(!tokens.isEmpty(), tokens.loc, message)
}

/** Throw if the token is not the expected keyword. */
export function checkKeyword(keyword: Kw, token: Token): void {
	check(isKeyword(keyword, token), token.loc, _ => _.expectedKeyword(keyword))
}

/** CompileError about encountering an unparseable token. */
export function unexpected(token: Token): CompileError {
	return fail(token.loc, _ =>
		token instanceof KeywordReserved ? _.reservedWord(token.kind) : _.unexpected(token))
}

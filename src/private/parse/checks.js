import {check, fail} from '../context'
import {isKeyword, isReservedKeyword, showKeyword} from '../Token'

/** Throw a {@link CompileError} if `tokens` has content. */
export function checkEmpty(tokens, message) {
	check(tokens.isEmpty(), tokens.loc, message)
}

/** Throw a {@link CompileError} if `tokens` is empty. */
export function checkNonEmpty(tokens, message) {
	check(!tokens.isEmpty(), tokens.loc, message)
}

/** Throw a {@link CompileError} if the token is not the expected keyword. */
export function checkKeyword(keyword, token) {
	check(isKeyword(keyword, token), token.loc, () =>
		`Expected ${showKeyword(keyword)}`)
}

/** Throw a {@link CompileError} about encountering an unparseable token. */
export function unexpected(token) {
	const message = isReservedKeyword(token) ? `Reserved word ${token}.` : `Unexpected ${token}.`
	fail(token.loc, message)
}

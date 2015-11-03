import {fail} from '../context'
import {isReservedKeyword} from '../Token'

/** Throw a {@link CompileError} if `tokens` has content. */
export function checkEmpty(tokens, message) {
	if (!tokens.isEmpty())
		fail(tokens.loc, message)
}

/** Throw a {@link CompileError} if `tokens` is empty. */
export function checkNonEmpty(tokens, message) {
	if (tokens.isEmpty())
		fail(tokens.loc, message)
}

/** Throw a {@link CompileError} about encountering an unparseable token. */
export function unexpected(token) {
	const message = isReservedKeyword(token) ? `Reserved word ${token}.` : `Unexpected ${token}.`
	fail(token.loc, message)
}

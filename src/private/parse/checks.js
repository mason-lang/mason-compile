import {code} from '../../CompileError'
import {fail} from '../context'
import {isReservedKeyword, keywordName} from '../Token'

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
	const message = isReservedKeyword(token) ?
		`Reserved word ${code(keywordName(token.kind))}.` :
		`Unexpected ${token}.`
	fail(token.loc, message)
}

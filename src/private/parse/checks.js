import {check, fail} from '../context'
import {isKeyword, isReservedKeyword} from '../Token'

/** Throw a {@link CompileError} if `tokens` has content. */
export function checkEmpty(tokens, errorCode, ...args) {
	check(tokens.isEmpty(), tokens.loc, errorCode, ...args)
}

/** Throw a {@link CompileError} if `tokens` is empty. */
export function checkNonEmpty(tokens, errorCode, ...args) {
	check(!tokens.isEmpty(), tokens.loc, errorCode, ...args)
}

/** Throw a {@link CompileError} if the token is not the expected keyword. */
export function checkKeyword(keyword, token) {
	check(isKeyword(keyword, token), token.loc, 'expectedKeyword')
}

/** Throw a {@link CompileError} about encountering an unparseable token. */
export function unexpected(token) {
	fail(token.loc, isReservedKeyword(token) ? 'reservedWord' : 'unexpected', token)
}

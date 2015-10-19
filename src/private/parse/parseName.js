import {unexpected} from './checks'
import {isNameKeyword, keywordName, Name} from '../Token'

/**
Parse a {@link Name} or {@link Keyword} usable as one.
@return {string}
*/
export default function parseName(token) {
	const name = tryParseName(token)
	if (name === null)
		unexpected(token)
	return name
}

/**
Like {@link parseName} but returns `null` on failure.
@return {?string}
*/
export function tryParseName(token) {
	return token instanceof Name ?
		token.name :
		isNameKeyword(token) ?
		keywordName(token.kind) :
		null
}

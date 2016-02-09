import Op, {nonNull} from 'op/Op'
import {isNameKeyword} from '../token/Keyword'
import Token, {NameToken} from '../token/Token'
import {unexpected} from './checks'

/** Parse a [[Name]] or a [[Keyword]] usable as one. */
export default function parseName(token: Token): string {
	const name = tryParseName(token)
	if (nonNull(name))
		return name
	else
		throw unexpected(token)
}

/** Like [[parseName]] but returns `null` on failure. */
export function tryParseName(token: Token): Op<string> {
	return token instanceof NameToken ?
		token.name :
		isNameKeyword(token) ? token.name() : null
}

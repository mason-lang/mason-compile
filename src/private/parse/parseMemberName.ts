import {nonNull} from 'op/Op'
import {QuotePlain} from '../MsAst'
import Token, {GroupQuote} from '../Token'
import {unexpected} from './checks'
import {tryParseName} from './parseName'
import parseQuote from './parseQuote'
import Slice, {Tokens} from './Slice'

/** Parse a plain member (`a.b`) or computed member (`a."b"`). */
export default function parseMemberName(token: Token): string | QuotePlain {
	const name = tryParseName(token)
	if (nonNull(name))
		return name
	else if (token instanceof GroupQuote)
		return parseQuote(Slice.of(token))
	else
		throw unexpected(token)
}

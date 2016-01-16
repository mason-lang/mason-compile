import {nonNull} from 'op/Op'
import MemberName from '../ast/MemberName'
import {GroupParenthesis, GroupQuote} from '../token/Group'
import Token from '../token/Token'
import {unexpected} from './checks'
import parseExpr from './parseExpr'
import {tryParseName} from './parseName'
import parseQuote from './parseQuote'
import Slice, {Tokens} from './Slice'

/** Parse a plain member (`a.b`) or computed member (`a."b"`). */
export default function parseMemberName(token: Token): MemberName {
	const name = tryParseName(token)
	if (nonNull(name)) // .foo
		return name
	else if (token instanceof GroupQuote) // ."foo"
		return parseQuote(Slice.of(token))
	else if (token instanceof GroupParenthesis) // .(foo)
		return parseExpr(Tokens.of(token))
	else
		throw unexpected(token)
}

import {BagSimple, LocalAccess, NumberLiteral, SpecialVal} from '../MsAst'
import {Group, Groups, Name, opKeywordKindToSpecialValueKind, Keyword, Keywords} from '../Token'
import {ifElse} from '../util'
import {unexpected} from './checks'
import {parseBlockWrap} from './parseBlock'
import parseQuote, {parseRegExp} from './parseQuote'
import {parseExpr, parseExprParts, parseSpaced} from './parse*'
import Slice from './Slice'

/** Parse a single token. */
export default function parseSingle(token) {
	const {loc} = token
	if (token instanceof Name)
		return new LocalAccess(loc, token.name)
	else if (token instanceof Group) {
		const slice = Slice.group(token)
		switch (token.kind) {
			case Groups.Space:
				return parseSpaced(slice)
			case Groups.Parenthesis:
				return parseExpr(slice)
			case Groups.Bracket:
				return new BagSimple(loc, parseExprParts(slice))
			case Groups.Block:
				return parseBlockWrap(slice)
			case Groups.Quote:
				return parseQuote(slice)
			case Groups.RegExp:
				return parseRegExp(slice, token.flags)
			// Groups.Interpolation handled by parseQuote
			default:
				throw new Error(token.kind)
		}
	} else if (token instanceof NumberLiteral)
		return token
	else if (token instanceof Keyword)
		switch (token.kind) {
			case Keywords.Focus:
				return LocalAccess.focus(loc)
			default:
				return ifElse(opKeywordKindToSpecialValueKind(token.kind),
					_ => new SpecialVal(loc, _),
					() => unexpected(token))
		}
	else
		unexpected(token)
}

import {BagSimple, LocalAccess, NumberLiteral, SpecialVal} from '../MsAst'
import {Group, G_Block, G_Bracket, G_Parenthesis, G_Space, G_Quote, Name,
	opKeywordKindToSpecialValueKind, Keyword, KW_Focus} from '../Token'
import {ifElse} from '../util'
import {unexpected} from './checks'
import {blockWrap} from './parseBlock'
import parseQuote from './parseQuote'
import {parseExpr, parseExprParts, parseSpaced} from './parse*'
import Slice from './Slice'

export default token => {
	const {loc} = token
	if (token instanceof Name)
		return new LocalAccess(loc, token.name)
	else if (token instanceof Group) {
		const slice = Slice.group(token)
		switch (token.kind) {
			case G_Space:
				return parseSpaced(slice)
			case G_Parenthesis:
				return parseExpr(slice)
			case G_Bracket:
				return new BagSimple(loc, parseExprParts(slice))
			case G_Block:
				return blockWrap(slice)
			case G_Quote:
				return parseQuote(slice)
			default:
				throw new Error(token.kind)
		}
	} else if (token instanceof NumberLiteral)
		return token
	else if (token instanceof Keyword)
		switch (token.kind) {
			case KW_Focus:
				return LocalAccess.focus(loc)
			default:
				return ifElse(opKeywordKindToSpecialValueKind(token.kind),
					_ => new SpecialVal(loc, _),
					() => unexpected(token))
		}
	else
		unexpected(token)
}

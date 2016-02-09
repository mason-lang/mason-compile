import {Val} from '../ast/LineContent'
import {LocalAccess} from '../ast/locals'
import {BagSimple, NumberLiteral, SpecialVal} from '../ast/Val'
import {warn} from '../context'
import Group, {GroupBlock, GroupBrace, GroupBracket, GroupParenthesis, GroupQuote, GroupRegExp,
	GroupSpace} from '../token/Group'
import {isKeyword, KeywordSpecialVal, Kw} from '../token/Keyword'
import Token, {NameToken, NumberToken} from '../token/Token'
import {unexpected} from './checks'
import {parseBlockWrap} from './parseBlock'
import parseExpr, {parseExprParts} from './parseExpr'
import parseObjSimple from './parseObjSimple'
import parseQuote, {parseRegExp} from './parseQuote'
import parseSpaced from './parseSpaced'
import Slice, {Lines, Tokens} from './Slice'

/** Parse a single token. */
export default function parseSingle(token: Token, isInSpaced: boolean = false): Val {
	const {loc} = token
	if (token instanceof NameToken)
		return new LocalAccess(loc, token.name)
	else if (token instanceof Group) {
		if (token instanceof GroupSpace)
			return parseSpaced(Tokens.of(token))
		else if (token instanceof GroupParenthesis) {
			const slice = Tokens.of(token)
			// todo: `isInSpaced` is a kludge
			// Normally parens are unnecessary for `(1..10)`, but not for `(1..10).by 2`.
			// However, this kludge means we won't catch expressions like `(2):number`.
			if (slice.size() === 1 && !isInSpaced)
				warn(slice.loc, _ => _.extraParens)
			return parseExpr(slice)
		} else if (token instanceof GroupBracket)
			return new BagSimple(loc, parseExprParts(Tokens.of(token)))
		else if (token instanceof GroupBrace)
			return parseObjSimple(Tokens.of(token))
		else if (token instanceof GroupBlock)
			return parseBlockWrap(Lines.of(token))
		else if (token instanceof GroupQuote)
			return parseQuote(Slice.of(token))
		else if (token instanceof GroupRegExp)
			return parseRegExp(Slice.of(token), token.flags)
		else
			// GroupInterpolation handled by parseQuote
			throw new Error(String(token.type))
	} else if (token instanceof NumberToken)
		return new NumberLiteral(token.loc, token.value)
	else if (token instanceof KeywordSpecialVal)
		return new SpecialVal(loc, token.kind)
	else if (isKeyword(Kw.Focus, token))
		return LocalAccess.focus(loc)
	else
		throw unexpected(token)
}

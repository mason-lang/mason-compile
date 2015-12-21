import {caseOp, opMap, orThrow} from 'op/Op'
import {warn} from '../context'
import {BagSimple, Val, LocalAccess, NumberLiteral, SpecialVal} from '../MsAst'
import Token, {Group, GroupBlock, GroupBracket, GroupParenthesis, GroupQuote, GroupRegExp, GroupSpace, Keyword, Keywords, Name, NumberToken, opKeywordKindToSpecialValueKind} from '../Token'
import {unexpected} from './checks'
import {parseBlockWrap} from './parseBlock'
import parseQuote, {parseRegExp} from './parseQuote'
import {parseExpr, parseExprParts, parseSpaced} from './parse*'
import Slice, {Lines, Tokens} from './Slice'

/** Parse a single token. */
export default function parseSingle(token: Token, isInSpaced: boolean = false): Val {
	const {loc} = token
	if (token instanceof Name)
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
	else if (token instanceof Keyword)
		switch (token.kind) {
			case Keywords.Focus:
				return LocalAccess.focus(loc)
			default:
				return orThrow(
					opMap(opKeywordKindToSpecialValueKind(token.kind), _ => new SpecialVal(loc, _)),
					() => unexpected(token))
		}
	else
		throw unexpected(token)
}

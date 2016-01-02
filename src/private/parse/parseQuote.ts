import {LocalAccess, MsRegExp, QuotePart, QuotePlain} from '../MsAst'
import Token, {GroupInterpolation, Keyword, Keywords, Name, StringToken} from '../Token'
import {assert} from '../util'
import parseExpr from './parseExpr'
import {QuoteTokens, Tokens} from './Slice'

/** Parse a [[QuotePlain]] from a [[GroupQuote]]. */
export default function parseQuote(tokens: QuoteTokens): QuotePlain {
	return new QuotePlain(tokens.loc, parseParts(tokens))
}

/** Parse an [[MsRegExp]] from a [[GroupRegExp]]. */
export function parseRegExp(tokens: QuoteTokens, flags: string): MsRegExp {
	return new MsRegExp(tokens.loc, parseParts(tokens), flags)
}

function parseParts(tokens: QuoteTokens): Array<QuotePart> {
	return tokens.map(_ => {
		if (_ instanceof StringToken)
			return _.value
		else if (_ instanceof Name)
			return new LocalAccess(_.loc, _.name)
		else if (_ instanceof Keyword) {
			assert(_.kind === Keywords.Focus)
			return LocalAccess.focus(_.loc)
		} else
			// is GroupInterpolation
			return parseExpr(Tokens.of(_))
	})
}

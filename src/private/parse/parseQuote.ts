import {LocalAccess} from '../ast/locals'
import {MsRegExp, QuoteTemplate, TemplatePart} from '../ast/Quote'
import Keyword, {Keywords} from '../token/Keyword'
import {NameToken, StringToken} from '../token/Token'
import {assert} from '../util'
import parseExpr from './parseExpr'
import {QuoteTokens, Tokens} from './Slice'

export default function parseQuote(tokens: QuoteTokens): QuoteTemplate {
	return new QuoteTemplate(tokens.loc, parseParts(tokens))
}

/** Parse an [[MsRegExp]] from a [[GroupRegExp]]. */
export function parseRegExp(tokens: QuoteTokens, flags: string): MsRegExp {
	return new MsRegExp(tokens.loc, parseParts(tokens), flags)
}

function parseParts(tokens: QuoteTokens): Array<TemplatePart> {
	return tokens.map(_ => {
		if (_ instanceof StringToken)
			return _.value
		else if (_ instanceof NameToken)
			return new LocalAccess(_.loc, _.name)
		else if (_ instanceof Keyword) {
			assert(_.kind === Keywords.Focus)
			return LocalAccess.focus(_.loc)
		} else
			// is GroupInterpolation
			return parseExpr(Tokens.of(_))
	})
}
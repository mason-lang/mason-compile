import {LocalAccess, MsRegExp, QuotePlain} from '../MsAst'
import {Groups, isGroup, isKeyword, Name, Keywords} from '../Token'
import {assert} from '../util'
import {parseExpr} from './parse*'
import Slice from './Slice'

/** Parse a {@link QuotePlain} from a {@link Groups.Quote}. */
export default function parseQuote(tokens) {
	return new QuotePlain(tokens.loc, parseParts(tokens))
}

/** Parse an {@link MsRegExp} from a {@link Groups.RegExp}. */
export function parseRegExp(tokens, flags) {
	return new MsRegExp(tokens.loc, parseParts(tokens), flags)
}

function parseParts(tokens) {
	return tokens.map(_ => {
		if (typeof _ === 'string')
			return _
		else if (_ instanceof Name)
			return new LocalAccess(_.loc, _.name)
		else if (isKeyword(Keywords.Focus, _))
			return LocalAccess.focus(_.loc)
		else {
			assert(isGroup(Groups.Interpolation, _))
			return parseExpr(Slice.group(_))
		}
	})
}

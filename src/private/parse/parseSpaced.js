import {code} from '../../CompileError'
import {Call, Lazy, LocalAccess, Member, QuoteTemplate, SuperCall, SuperMember} from '../MsAst'
import {DotName, Group, G_Bracket, G_Parenthesis, G_Quote, isGroup, isKeyword, Keyword, KW_Focus,
	KW_Lazy, KW_SuperVal, KW_Type} from '../Token'
import {cat} from '../util'
import {checkEmpty, context} from './context'
import {parseExprParts} from './parse*'
import parseQuote from './parseQuote'
import parseSingle from './parseSingle'
import Slice from './Slice'

export default function parseSpaced(tokens) {
	const h = tokens.head(), rest = tokens.tail()
	if (isKeyword(KW_Type, h))
		return Call.contains(h.loc, parseSpaced(rest), LocalAccess.focus(h.loc))
	else if (isKeyword(KW_Lazy, h))
		return new Lazy(h.loc, parseSpaced(rest))
	else if (isKeyword(KW_SuperVal, h)) {
		// TODO: handle sub here as well
		const h2 = rest.head()
		if (h2 instanceof DotName) {
			context.check(h2.nDots === 1, h2.loc, 'Too many dots!')
			const x = new SuperMember(h2.loc, h2.name)
			return parseSpacedFold(x, rest.tail())
		} else if (isGroup(G_Parenthesis, h2) && Slice.group(h2).isEmpty()) {
			const x = new SuperCall(h2.loc, [])
			return parseSpacedFold(x, rest.tail())
		} else
			context.fail(`Expected ${code('.')} or ${code('()')} after ${code('super')}`)
	} else
		return parseSpacedFold(parseSingle(h), rest)
}

const parseSpacedFold = (start, rest) => {
	let acc = start
	for (let i = rest.start; i < rest.end; i = i + 1) {
		const token = rest.tokens[i]
		const loc = token.loc
		if (token instanceof DotName) {
			context.check(token.nDots === 1, token.loc, 'Too many dots!')
			acc = new Member(token.loc, acc, token.name)
			continue
		}
		if (token instanceof Keyword)
			switch (token.kind) {
				case KW_Focus:
					acc = new Call(token.loc, acc, [LocalAccess.focus(loc)])
					continue
				case KW_Type: {
					const type = parseSpaced(rest._chopStart(i + 1))
					return Call.contains(token.loc, type, acc)
				}
				default:
			}
		if (token instanceof Group) {
			const slice = Slice.group(token)
			switch (token.kind) {
				case G_Bracket:
					acc = Call.sub(loc, cat(acc, parseExprParts(slice)))
					continue
				case G_Parenthesis:
					checkEmpty(slice, () =>
						`Use ${code('(a b)')}, not ${code('a(b)')}`)
					acc = new Call(loc, acc, [])
					continue
				case G_Quote:
					acc = new QuoteTemplate(loc, acc, parseQuote(slice))
					continue
				default:
			}
		}
		context.fail(token.loc, `Expected member or sub, not ${token}`)
	}
	return acc
}

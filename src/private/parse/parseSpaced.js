import {code} from '../../CompileError'
import {Call, Lazy, LocalAccess, Member, QuoteTemplate, Splat, SuperCall, SuperMember
	} from '../MsAst'
import {Group, G_Bracket, G_Parenthesis, G_Quote, isGroup, isKeyword, Keyword, KW_Dot, KW_Ellipsis,
	KW_Focus, KW_Lazy, KW_SuperVal, KW_Type} from '../Token'
import {assert, cat} from '../util'
import {checkEmpty, context, unexpected} from './context'
import {parseExprParts} from './parse*'
import parseName, {tryParseName} from './parseName'
import parseQuote from './parseQuote'
import parseSingle from './parseSingle'
import Slice from './Slice'

export default function parseSpaced(tokens) {
	const h = tokens.head(), rest = tokens.tail()
	if (isKeyword(KW_Type, h))
		return Call.contains(h.loc, parseSpaced(rest), LocalAccess.focus(h.loc))
	else if (isKeyword(KW_Lazy, h))
		return new Lazy(h.loc, parseSpaced(rest))
	else if (isKeyword(KW_Dot, h)) {
		const name = parseName(rest.head())
		const rest2 = rest.tail()
		const member = new Member(h.loc, LocalAccess.this(h.loc), name)
		return rest2.isEmpty() ? member : parseSpacedFold(member, rest.tail())
	} else if (isKeyword(KW_Ellipsis, h))
		return new Splat(tokens.loc, parseSpacedFold(parseSingle(rest.head()), rest.tail))
	else if (isKeyword(KW_SuperVal, h)) {
		// TODO: handle sub here as well
		const h2 = rest.head()
		if (isKeyword(KW_Dot, h2)) {
			const tail = rest.tail()
			const sup = new SuperMember(h2.loc, parseMemberName(tail.head()))
			return parseSpacedFold(sup, tail.tail())
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
		if (isKeyword(KW_Dot, token)) {
			// If this was the last one, it would not be a KW_Dot but a KW_ObjAssign
			assert(i < rest.end - 1)
			i = i + 1
			const next = rest.tokens[i]
			acc = new Member(token.loc, acc, parseMemberName(next))
		} else if (token instanceof Keyword)
			switch (token.kind) {
				case KW_Focus:
					acc = new Call(token.loc, acc, [LocalAccess.focus(loc)])
					break
				case KW_Type: {
					const type = parseSpaced(rest._chopStart(i + 1))
					return Call.contains(token.loc, type, acc)
				}
				default:
					unexpected(token)
			}
		else if (token instanceof Group) {
			const slice = Slice.group(token)
			switch (token.kind) {
				case G_Bracket:
					acc = Call.sub(loc, cat(acc, parseExprParts(slice)))
					break
				case G_Parenthesis:
					checkEmpty(slice, () => `Use ${code('(a b)')}, not ${code('a(b)')}`)
					acc = new Call(loc, acc, [])
					break
				case G_Quote:
					acc = new QuoteTemplate(loc, acc, parseQuote(slice))
					break
				default:
					unexpected(token)
			}
		}
	}
	return acc
}

const parseMemberName = token => {
	const name = tryParseName(token)
	if (name !== null)
		return name
	else if (isGroup(G_Quote, token))
		return parseQuote(Slice.group(token))
	else
		unexpected(token)
}

import {code} from '../../CompileError'
import {fail} from '../context'
import {Call, Lazy, LocalAccess, Member, QuoteSimple, QuoteTaggedTemplate, Splat, SuperCall,
	SuperMember, ThisFun} from '../MsAst'
import {Group, Groups, isGroup, isKeyword, Keyword, Keywords} from '../Token'
import {assert} from '../util'
import {checkEmpty, checkNonEmpty, unexpected} from './checks'
import {parseExprParts} from './parse*'
import parseMemberName from './parseMemberName'
import parseName from './parseName'
import parseQuote from './parseQuote'
import parseSingle from './parseSingle'
import Slice from './Slice'

/**
Parse tokens in a {@link Groups.Space}.
@return {Val}
*/
export default function parseSpaced(tokens) {
	const h = tokens.head(), rest = tokens.tail()
	if (h instanceof Keyword)
		switch (h.kind) {
			case Keywords.Dot: {
				const name = parseName(rest.head())
				const rest2 = rest.tail()
				const member = new Member(h.loc, LocalAccess.this(h.loc), name)
				return rest2.isEmpty() ? member : parseSpacedFold(member, rest.tail())
			}
			case Keywords.Ellipsis:
				return new Splat(tokens.loc, parseSpacedFold(parseSingle(rest.head()), rest.tail))
			case Keywords.Lazy:
				return new Lazy(h.loc, parseSpaced(rest))
			case Keywords.SuperVal: {
				// TODO: handle sub here as well
				const h2 = rest.head()
				if (isKeyword(Keywords.Dot, h2)) {
					const tail = rest.tail()
					const sup = new SuperMember(h2.loc, parseMemberName(tail.head()))
					return parseSpacedFold(sup, tail.tail())
				} else if (isGroup(Groups.Parenthesis, h2) && Slice.group(h2).isEmpty()) {
					const x = new SuperCall(h2.loc, [])
					return parseSpacedFold(x, rest.tail())
				} else
					fail(`Expected ${code('.')} or ${code('()')} after ${code('super')}`)
			}
			case Keywords.Tick: {
				const h2 = rest.head()
				const tail = rest.tail()
				if (isKeyword(Keywords.Dot, h2)) {
					checkNonEmpty(tail, () => `Expected something after ${code('\'.')}.`)
					const h3 = tail.head()
					return parseSpacedFold(new ThisFun(h3.loc, parseName(h3)), tail.tail())
				} else
					return parseSpacedFold(new QuoteSimple(h2.loc, parseName(h2)), tail)
			}
			case Keywords.Type:
				return Call.contains(h.loc, parseSpaced(rest), LocalAccess.focus(h.loc))
			default:
				// fall through
		}
	return parseSpacedFold(parseSingle(h), rest)
}

function parseSpacedFold(start, rest) {
	let acc = start
	for (let i = rest._start; i < rest._end; i = i + 1) {
		const token = rest._tokens[i]
		const loc = token.loc
		if (isKeyword(Keywords.Dot, token)) {
			// If this was the last one, it would not be a Keywords.Dot but a Keywords.ObjAssign
			assert(i < rest._end - 1)
			i = i + 1
			const next = rest._tokens[i]
			acc = new Member(token.loc, acc, parseMemberName(next))
		} else if (token instanceof Keyword)
			switch (token.kind) {
				case Keywords.Focus:
					acc = new Call(token.loc, acc, [LocalAccess.focus(loc)])
					break
				case Keywords.Type: {
					const type = parseSpaced(rest._chopStart(i + 1))
					return Call.contains(token.loc, type, acc)
				}
				default:
					unexpected(token)
			}
		else if (token instanceof Group) {
			const slice = Slice.group(token)
			switch (token.kind) {
				case Groups.Bracket:
					acc = Call.sub(loc, acc, parseExprParts(slice))
					break
				case Groups.Parenthesis:
					checkEmpty(slice, () => `Use ${code('(a b)')}, not ${code('a(b)')}`)
					acc = new Call(loc, acc, [])
					break
				case Groups.Quote:
					acc = new QuoteTaggedTemplate(loc, acc, parseQuote(slice))
					break
				default:
					unexpected(token)
			}
		}
	}
	return acc
}

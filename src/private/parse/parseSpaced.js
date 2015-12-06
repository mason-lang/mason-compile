import {check, fail} from '../context'
import {Call, GetterFun, InstanceOf, Lazy, LocalAccess, Member, MemberFun, QuoteSimple,
	QuoteTaggedTemplate, Range, SimpleFun, Spread, Sub, SuperCall, SuperMember} from '../MsAst'
import {Group, Groups, isGroup, isKeyword, Keyword, Keywords} from '../Token'
import {assert, opIf} from '../util'
import {checkEmpty, unexpected} from './checks'
import {parseExpr, parseExprParts} from './parse*'
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
			case Keywords.Ampersand: {
				const h2 = rest.head()
				if (isGroup(Groups.Parenthesis, h2))
					return new SimpleFun(tokens.loc, parseExpr(Slice.group(h2)))
				else if (isKeyword(Keywords.Dot, h2)) {
					const tail = rest.tail()
					const h3 = tail.head()
					const fun = new GetterFun(h3.loc, parseMemberName(h3))
					return parseSpacedFold(fun, tail.tail())
				} else {
					const fun = new MemberFun(h2.loc, null, parseMemberName(h2))
					return parseSpacedFold(fun, rest.tail())
				}
			}
			case Keywords.Dot: {
				const h2 = rest.head()
				if (isKeyword(Keywords.Ampersand, h2)) {
					const tail = rest.tail()
					const h3 = tail.head()
					const name = parseMemberName(h3)
					const fun = new MemberFun(h2.loc, LocalAccess.this(h2.loc), name)
					return parseSpacedFold(fun, tail.tail())
				} else {
					const name = parseMemberName(rest.head())
					const member = new Member(h.loc, LocalAccess.this(h.loc), name)
					return parseSpacedFold(member, rest.tail())
				}
			}
			case Keywords.Dot3:
				return new Spread(tokens.loc, parseSpacedFold(parseSingle(rest.head()), rest.tail))
			case Keywords.Lazy:
				return new Lazy(h.loc, parseSpaced(rest))
			case Keywords.Super: {
				// TODO: handle sub here as well
				const h2 = rest.head()
				if (isKeyword(Keywords.Dot, h2)) {
					const tail = rest.tail()
					const sup = new SuperMember(h2.loc, parseMemberName(tail.head()))
					return parseSpacedFold(sup, tail.tail())
				} else if (isGroup(Groups.Parenthesis, h2) && Slice.group(h2).isEmpty()) {
					const x = new SuperCall(h2.loc, [], true)
					return parseSpacedFold(x, rest.tail())
				} else
					fail(h2.loc, 'tokenAfterSuper')
			}
			case Keywords.Tick: {
				const h2 = rest.head()
				const quote = new QuoteSimple(h2.loc, parseName(h2))
				return parseSpacedFold(quote, rest.tail())
			}
			case Keywords.Colon:
				return new InstanceOf(h.loc, LocalAccess.focus(h.loc), parseSpaced(rest))
			default:
				// fall through
		}
	return parseSpacedFold(parseSingle(h, true), rest)
}

function parseSpacedFold(start, rest) {
	let acc = start
	for (let i = rest._start; i < rest._end; i = i + 1) {
		function restVal() {
			return parseSpaced(rest._chopStart(i + 1))
		}

		const token = rest._tokens[i]
		const loc = token.loc
		if (token instanceof Keyword)
			switch (token.kind) {
				case Keywords.Ampersand:
					if (i === rest._end - 1)
						unexpected(token)
					i = i + 1
					acc = new MemberFun(token.loc, acc, parseMemberName(rest._tokens[i]))
					break
				case Keywords.Dot: {
					// If this were the last one,
					// it would not be a Keywords.Dot but a Keywords.ObjAssign
					assert(i < rest._end - 1)
					i = i + 1
					acc = new Member(token.loc, acc, parseMemberName(rest._tokens[i]))
					break
				}
				case Keywords.Dot2:
					check(i < rest._end - 1, token.loc, 'infiniteRange')
					return new Range(token.loc, acc, restVal(), false)
				case Keywords.Dot3:
					return new Range(token.loc, acc, opIf(i < rest._end - 1, restVal), true)
				case Keywords.Focus:
					acc = new Call(token.loc, acc, [LocalAccess.focus(loc)])
					break
				case Keywords.Colon:
					return new InstanceOf(token.loc, acc, restVal())
				default:
					unexpected(token)
			}
		else if (token instanceof Group) {
			const slice = Slice.group(token)
			switch (token.kind) {
				case Groups.Bracket:
					acc = new Sub(loc, acc, parseExprParts(slice))
					break
				case Groups.Parenthesis:
					checkEmpty(slice, 'parensOutsideCall')
					acc = new Call(loc, acc, [])
					break
				case Groups.Quote:
					acc = new QuoteTaggedTemplate(loc, acc, parseQuote(slice))
					break
				default:
					unexpected(token)
			}
		} else
			unexpected(token)
	}
	return acc
}

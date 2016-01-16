import {opIf} from 'op/Op'
import {check, fail} from '../context'
import Call, {Spread} from '../ast/Call'
import {Val} from '../ast/LineContent'
import {SuperCall, SuperMember} from '../ast/Class'
import {FunGetter, FunMember, FunSimple} from '../ast/Fun'
import {LocalAccess} from '../ast/locals'
import {QuoteSimple, QuoteTagged} from '../ast/Quote'
import {InstanceOf, Lazy, Member, Range, Sub} from '../ast/Val'
import {GroupBracket, GroupParenthesis, GroupQuote} from '../token/Group'
import Keyword, {isKeyword, Keywords} from '../token/Keyword'
import {assert} from '../util'
import {checkEmpty, unexpected} from './checks'
import parseExpr, {parseExprParts} from './parseExpr'
import parseMemberName from './parseMemberName'
import parseName from './parseName'
import parseQuote from './parseQuote'
import parseSingle from './parseSingle'
import Slice, {Tokens} from './Slice'

/** Parse tokens in a [[GroupSpace]]. */
export default function parseSpaced(tokens: Tokens): Val {
	const h = tokens.head(), rest = tokens.tail()
	if (h instanceof Keyword)
		switch (h.kind) {
			case Keywords.Ampersand: {
				const h2 = rest.head()
				if (h2 instanceof GroupParenthesis)
					return new FunSimple(tokens.loc, parseExpr(Tokens.of(h2)))
				else if (isKeyword(Keywords.Dot, h2)) {
					const tail = rest.tail()
					const h3 = tail.head()
					const fun = new FunGetter(h3.loc, parseMemberName(h3))
					return parseSpacedFold(fun, tail.tail())
				} else {
					const fun = new FunMember(h2.loc, null, parseMemberName(h2))
					return parseSpacedFold(fun, rest.tail())
				}
			}
			case Keywords.Dot: {
				const h2 = rest.head()
				if (isKeyword(Keywords.Ampersand, h2)) {
					const tail = rest.tail()
					const h3 = tail.head()
					const name = parseMemberName(h3)
					const fun = new FunMember(h2.loc, LocalAccess.this(h2.loc), name)
					return parseSpacedFold(fun, tail.tail())
				} else {
					const name = parseMemberName(rest.head())
					const member = new Member(h.loc, LocalAccess.this(h.loc), name)
					return parseSpacedFold(member, rest.tail())
				}
			}
			case Keywords.Dot3:
				return new Spread(tokens.loc, parseSpacedFold(parseSingle(rest.head()), rest.tail()))
			case Keywords.Lazy:
				return new Lazy(h.loc, parseSpaced(rest))
			case Keywords.Super: {
				// TODO: handle sub here as well
				const h2 = rest.head()
				if (isKeyword(Keywords.Dot, h2)) {
					const tail = rest.tail()
					const sup = new SuperMember(h2.loc, parseMemberName(tail.head()))
					return parseSpacedFold(sup, tail.tail())
				} else if (h2 instanceof GroupParenthesis && Tokens.of(h2).isEmpty()) {
					const x = new SuperCall(h2.loc, [])
					return parseSpacedFold(x, rest.tail())
				} else
					throw fail(h2.loc, _ => _.tokenAfterSuper)
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

function parseSpacedFold(start: Val, rest: Tokens): Val {
	let acc = start
	for (let i = rest.start; i < rest.end; i = i + 1) {
		function restVal(): Val {
			return parseSpaced(rest.chopStart(i + 1))
		}

		const token = rest.tokens[i]
		const loc = token.loc
		if (token instanceof Keyword)
			switch (token.kind) {
				case Keywords.Ampersand:
					if (i === rest.end - 1)
						throw unexpected(token)
					i = i + 1
					acc = new FunMember(token.loc, acc, parseMemberName(rest.tokens[i]))
					break
				case Keywords.Dot: {
					// If this were the last one,
					// it would not be a Keywords.Dot but a Keywords.ObjEntry
					assert(i < rest.end - 1)
					i = i + 1
					acc = new Member(token.loc, acc, parseMemberName(rest.tokens[i]))
					break
				}
				case Keywords.Dot2:
					check(i < rest.end - 1, token.loc, _ => _.infiniteRange)
					return new Range(token.loc, acc, restVal(), false)
				case Keywords.Dot3:
					return new Range(token.loc, acc, opIf(i < rest.end - 1, restVal), true)
				case Keywords.Focus:
					acc = new Call(token.loc, acc, [LocalAccess.focus(loc)])
					break
				case Keywords.Colon:
					return new InstanceOf(token.loc, acc, restVal())
				default:
					throw unexpected(token)
			}
		else if (token instanceof GroupBracket)
			acc = new Sub(loc, acc, parseExprParts(Tokens.of(token)))
		else if (token instanceof GroupParenthesis) {
			checkEmpty(Tokens.of(token), _ => _.parensOutsideCall)
			acc = new Call(loc, acc, [])
		} else if (token instanceof GroupQuote)
			acc = new QuoteTagged(loc, acc, parseQuote(Slice.of(token)))
		else
			throw unexpected(token)
	}
	return acc
}

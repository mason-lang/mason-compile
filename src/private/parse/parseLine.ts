import Loc from 'esast/lib/Loc'
import Op, {caseOp} from 'op/Op'
import {BagEntry, MapEntry, ObjEntry, ObjEntryAssign, ObjEntryPlain} from '../ast/BuildEntry'
import Call from '../ast/Call'
import {Ignore, MemberSet, Pass, SetSub, Setters, SpecialDo, SpecialDos} from '../ast/Do'
import {Assert, Throw} from '../ast/errors'
import LineContent, {Do, Val} from '../ast/LineContent'
import {Assign, AssignSingle, AssignDestructure, LocalAccess, LocalMutate} from '../ast/locals'
import {Break} from '../ast/Loop'
import {QuoteSimple} from '../ast/Quote'
import {SpecialVal, SpecialVals} from '../ast/Val'
import {check} from '../context'
import {GroupBracket, GroupQuote, GroupSpace} from '../token/Group'
import Keyword, {isAnyKeyword, isKeyword, keywordName, Keywords} from '../token/Keyword'
import Token from '../token/Token'
import {assert, tail} from '../util'
import {checkEmpty, checkNonEmpty, unexpected} from './checks'
import {justBlock} from './parseBlock'
import parseExpr, {opParseExpr, parseExprParts} from './parseExpr'
import parseLocalDeclares, {parseLocalDeclaresJustNames, parseLocalName} from './parseLocalDeclares'
import parseMemberName from './parseMemberName'
import parseName from './parseName'
import parseQuote from './parseQuote'
import parseSpaced from './parseSpaced'
import parseTraitDo from './parseTraitDo'
import Slice, {Lines, Tokens} from './Slice'

/** Parse the content of a line. */
export default function parseLine(tokens: Tokens): LineContent | Array<LineContent> {
	const loc = tokens.loc
	const head = tokens.head()
	const rest = () => tokens.tail()

	const noRest = () => {
		checkEmpty(rest(), _ => _.unexpectedAfter(head))
	}

	// We only deal with mutable expressions here, otherwise we fall back to parseExpr.
	if (head instanceof Keyword)
		switch (head.kind) {
			case Keywords.Assert: case Keywords.Forbid:
				return parseAssert(head.kind === Keywords.Forbid, rest())
			case Keywords.Break:
				return new Break(loc, opParseExpr(rest()))
			case Keywords.Debugger:
				noRest()
				return new SpecialDo(loc, SpecialDos.Debugger)
			case Keywords.Dot3:
				return new BagEntry(loc, parseExpr(rest()), true)
			case Keywords.Ignore:
				return new Ignore(loc, rest().map(parseLocalName))
			case Keywords.ObjEntry:
				return new BagEntry(loc, parseExpr(rest()))
			case Keywords.Pass:
				return caseOp<Val, LineContent | Array<LineContent>>(
					opParseExpr(rest()), _ => new Pass(tokens.loc, _), () => [])
			case Keywords.Region:
				return parseLines(justBlock(Keywords.Region, rest()))
			case Keywords.Throw:
				return new Throw(loc, opParseExpr(rest()))
			case Keywords.TraitDo:
				return parseTraitDo(rest())
			default:
				// fall through
		}

	return caseOp<{before: Tokens, at: Token, after: Tokens}, LineContent>(
		tokens.opSplitOnce(_ => isAnyKeyword(lineSplitKeywords, _)),
		({before, at: atToken, after}) => {
			const at = <Keyword> atToken
			switch (at.kind) {
				case Keywords.MapEntry:
					return new MapEntry(loc, parseExpr(before), parseExpr(after))
				case Keywords.ObjEntry:
					return parseObjEntry(before, after, loc)
				default:
					return parseAssignLike(before, at, parseExpr(after), loc)
			}
		},
		() => parseExpr(tokens))
}
const lineSplitKeywords = new Set<Keywords>(
	[Keywords.Assign, Keywords.LocalMutate, Keywords.MapEntry, Keywords.ObjEntry])

export function parseLines(lines: Lines): Array<LineContent> {
	const lineContents: Array<LineContent> = []
	for (const line of lines.slices()) {
		const _ = parseLine(line)
		if (_ instanceof Array)
			lineContents.push(..._)
		else
			lineContents.push(_)
	}
	return lineContents
}

function parseAssignLike(before: Tokens, at: Keyword, value: Val, loc: Loc): Do {
	const kind = at.kind

	if (before.size() === 1) {
		const token = before.head()
		// `a.b = c`, `.b = c`, `a."b" = c`, `."b" = c`, `a[b] = c`; and their `:=` variants.
		if (token instanceof GroupSpace) {
			const spaced = Tokens.of(token)
			const [assignee, opType] = caseOp<{before: Tokens, after: Tokens}, [Tokens, Op<Val>]>(
				spaced.opSplitOnce(_ => isKeyword(Keywords.Colon, _)),
				({before, after}) => [before, parseExpr(after)],
				() => [spaced, null])

			const last = assignee.last()
			const object = (obj: Tokens): Val =>
				obj.isEmpty() ? LocalAccess.this(obj.loc) : parseSpaced(obj)

			if (isKeyword(Keywords.Dot, assignee.nextToLast())) {
				const name = parseMemberName(last)
				const set = object(assignee.rtail().rtail())
				return new MemberSet(loc, set, name, opType, setKind(at), value)
			} else if (last instanceof GroupBracket) {
				const set = object(assignee.rtail())
				const subbeds = parseExprParts(Tokens.of(last))
				return new SetSub(loc, set, subbeds, opType, setKind(at), value)
			}
		}
	}

	if (kind === Keywords.LocalMutate)
		return parseLocalMutate(before, value, loc)
	else {
		assert(kind === Keywords.Assign)
		return parseAssign(before, value, loc)
	}
}

function parseObjEntry(before: Tokens, after: Tokens, loc: Loc): ObjEntry {
	if (before.size() === 1) {
		const token = before.head()
		const isName = isKeyword(Keywords.Name, token)
		const value = () => parseExpr(after)

		// Handle `a.` which moves an outer local into an ObjEntry.
		if (after.isEmpty())
			return isName ?
				ObjEntryPlain.nameEntry(loc, new SpecialVal(loc, SpecialVals.Name)) :
				ObjEntryPlain.access(loc, parseLocalName(token))
		else if (token instanceof Keyword)
			return new ObjEntryPlain(loc, keywordName(token.kind), value())
		// `"1". 1`
		else if (token instanceof GroupQuote)
			return new ObjEntryPlain(loc, parseQuote(Slice.of(token)), value())
		// 'foo. 1
		else if (token instanceof GroupSpace) {
			const slice = Tokens.of(token)
			if (slice.size() === 2 && isKeyword(Keywords.Tick, slice.head())) {
				const name = new QuoteSimple(loc, parseName(slice.second()))
				return new ObjEntryPlain(loc, name, value())
			}
		}
	}

	const assign = parseAssign(before, parseExpr(after), loc)
	return new ObjEntryAssign(loc, assign)
}

function setKind(keyword: Keyword): Setters {
	switch (keyword.kind) {
		case Keywords.Assign:
			return Setters.Init
		case Keywords.LocalMutate:
			return Setters.Mutate
		default:
			throw unexpected(keyword)
	}
}

function parseLocalMutate(localsTokens: Tokens, value: Val, loc: Loc): LocalMutate {
	const locals = parseLocalDeclaresJustNames(localsTokens)
	check(locals.length === 1, loc, _ => _.todoMutateDestructure)
	return new LocalMutate(loc, locals[0].name, value)
}

function parseAssign(localsTokens: Tokens, value: Val, loc: Loc): Assign {
	const locals = parseLocalDeclares(localsTokens)
	if (locals.length === 1)
		return new AssignSingle(loc, locals[0], value)
	else {
		check(locals.length > 1, localsTokens.loc, _ => _.assignNothing)
		const kind = locals[0].kind
		// todo: do in verify
		for (const _ of locals)
			check(_.kind === kind, _.loc, _ => _.destructureAllLazy)
		return new AssignDestructure(loc, locals, value)
	}
}

function parseAssert(negate: boolean, tokens: Tokens): Assert {
	checkNonEmpty(tokens, _ => _.expectedAfterAssert)
	const [condTokens, opThrown] = caseOp<{before: Tokens, after: Tokens}, [Tokens, Op<Val>]>(
		tokens.opSplitOnce(_ => isKeyword(Keywords.Throw, _)),
		({before, after}) => [before, parseExpr(after)],
		() => [tokens, null])
	const parts = parseExprParts(condTokens)
	const cond = parts.length === 1 ? parts[0] : new Call(condTokens.loc, parts[0], tail(parts))
	return new Assert(tokens.loc, negate, cond, opThrown)
}

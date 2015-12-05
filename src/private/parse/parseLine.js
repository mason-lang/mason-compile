import {check} from '../context'
import {Assert, AssignSingle, AssignDestructure, BagEntry, Break, Call, Ignore, LocalAccess,
	LocalMutate, MapEntry, MemberSet, ObjEntryAssign, ObjEntryPlain, QuoteSimple, SetSub, Setters,
	SpecialDo, SpecialDos, SpecialVal, SpecialVals, Throw} from '../MsAst'
import {Groups, isGroup, isAnyKeyword, isKeyword, Keyword, keywordName, Keywords} from '../Token'
import {ifElse, tail} from '../util'
import {checkEmpty, checkNonEmpty, unexpected} from './checks'
import {justBlock} from './parseBlock'
import parseLocalDeclares, {parseLocalDeclaresJustNames, parseLocalName} from './parseLocalDeclares'
import parseMemberName from './parseMemberName'
import parseName from './parseName'
import parseQuote from './parseQuote'
import {opParseExpr, parseExpr, parseExprParts, parseSpaced} from './parse*'
import Slice from './Slice'

/** Parse the content of a line. */
export default function parseLine(tokens) {
	const loc = tokens.loc
	const head = tokens.head()
	const rest = () => tokens.tail()

	const noRest = () => {
		checkEmpty(rest(), 'unexpectedAfter', head)
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
			case Keywords.ObjAssign:
				return new BagEntry(loc, parseExpr(rest()))
			case Keywords.Pass:
				noRest()
				return []
			case Keywords.Region:
				return parseLines(justBlock(Keywords.Region, rest()))
			case Keywords.Throw:
				return new Throw(loc, opParseExpr(rest()))
			default:
				// fall through
		}

	return ifElse(tokens.opSplitOnce(_ => isAnyKeyword(lineSplitKeywords, _)),
		({before, at, after}) => {
			switch (at.kind) {
				case Keywords.MapEntry:
					return new MapEntry(loc, parseExpr(before), parseExpr(after))
				case Keywords.ObjAssign:
					return parseObjEntry(before, after, loc)
				default:
					return parseAssignLike(before, at, parseExpr(after), loc)
			}
		},
		() => parseExpr(tokens))
}
const lineSplitKeywords = new Set(
	[Keywords.Assign, Keywords.LocalMutate, Keywords.MapEntry, Keywords.ObjAssign])

export function parseLines(lineTokens) {
	const lines = []
	for (const line of lineTokens.slices()) {
		const _ = parseLine(line)
		if (_ instanceof Array)
			lines.push(..._)
		else
			lines.push(_)
	}
	return lines
}

function parseAssignLike(before, at, value, loc) {
	const kind = at.kind

	if (before.size() === 1) {
		const token = before.head()
		// `a.b = c`, `.b = c`, `a."b" = c`, `."b" = c`, `a[b] = c`; and their `:=` variants.
		if (isGroup(Groups.Space, token)) {
			const spaced = Slice.group(token)
			const [assignee, opType] = ifElse(spaced.opSplitOnce(_ => isKeyword(Keywords.Colon, _)),
				({before, after}) => [before, parseExpr(after)],
				() => [spaced, null])

			const last = assignee.last()
			const object = obj =>
				obj.isEmpty() ? LocalAccess.this(obj.loc) : parseSpaced(obj)

			if (isKeyword(Keywords.Dot, assignee.nextToLast())) {
				const name = parseMemberName(last)
				const set = object(assignee.rtail().rtail())
				return new MemberSet(loc, set, name, opType, setKind(at), value)
			} else if (isGroup(Groups.Bracket, last)) {
				const set = object(assignee.rtail())
				const subbeds = parseExprParts(Slice.group(last))
				return new SetSub(loc, set, subbeds, opType, setKind(at), value, loc)
			}
		}
	}

	return kind === Keywords.LocalMutate ?
		parseLocalMutate(before, value, loc) :
		parseAssign(before, kind, value, loc)
}

function parseObjEntry(before, after, loc) {
	if (before.size() === 1) {
		const token = before.head()
		const isName = isKeyword(Keywords.Name, token)
		const value = () => parseExpr(after)

		// Handle `a.` which moves an outer local into an ObjEntry.
		if (after.isEmpty())
			return isName ?
				ObjEntryPlain.name(loc, new SpecialVal(loc, SpecialVals.Name)) :
				ObjEntryPlain.access(loc, parseLocalName(token))
		else if (token instanceof Keyword)
			return new ObjEntryPlain(loc, keywordName(token.kind), value())
		// `"1". 1`
		else if (isGroup(Groups.Quote, token))
			return new ObjEntryPlain(loc, parseQuote(Slice.group(token)), value())
		// 'foo. 1
		else if (isGroup(Groups.Space, token)) {
			const slice = Slice.group(token)
			if (slice.size() === 2 && isKeyword(Keywords.Tick, slice.head())) {
				const name = new QuoteSimple(loc, parseName(slice.second()))
				return new ObjEntryPlain(loc, name, value())
			}
		}
	}

	const assign = parseAssign(before, Keywords.ObjAssign, parseExpr(after), loc)
	return new ObjEntryAssign(loc, assign)
}

function setKind(keyword) {
	switch (keyword.kind) {
		case Keywords.Assign:
			return Setters.Init
		case Keywords.LocalMutate:
			return Setters.Mutate
		default:
			unexpected(keyword)
	}
}

function parseLocalMutate(localsTokens, value, loc) {
	const locals = parseLocalDeclaresJustNames(localsTokens)
	check(locals.length === 1, loc, 'todoMutateDestructure')
	return new LocalMutate(loc, locals[0].name, value)
}

function parseAssign(localsTokens, kind, value, loc) {
	const locals = parseLocalDeclares(localsTokens)
	if (locals.length === 1)
		return new AssignSingle(loc, locals[0], value)
	else {
		check(locals.length > 1, localsTokens.loc, 'assignNothing')
		const kind = locals[0].kind
		for (const _ of locals)
			check(_.kind === kind, _.loc, 'destructureAllLazy')
		return new AssignDestructure(loc, locals, value, kind)
	}
}

function parseAssert(negate, tokens) {
	checkNonEmpty(tokens, 'expectedAfterAssert')
	const [condTokens, opThrown] =
		ifElse(tokens.opSplitOnce(_ => isKeyword(Keywords.Throw, _)),
			({before, after}) => [before, parseExpr(after)],
			() => [tokens, null])

	const parts = parseExprParts(condTokens)
	const cond = parts.length === 1 ? parts[0] : new Call(condTokens.loc, parts[0], tail(parts))
	return new Assert(tokens.loc, negate, cond, opThrown)
}

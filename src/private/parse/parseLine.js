import {check} from '../context'
import {Assert, AssignSingle, AssignDestructure, BagEntry, BagEntryMany, Break, BreakWithVal, Call,
	ConditionalDo, Ignore, LocalAccess, LocalDeclares, LocalMutate, MapEntry, MemberSet,
	ObjEntryAssign, ObjEntryPlain, SetSub, Setters, SpecialDo, SpecialDos, SpecialVal, SpecialVals,
	SuperCallDo, Throw, Yield, YieldTo} from '../MsAst'
import {Groups, isGroup, isAnyKeyword, isKeyword, Keyword, keywordName, Keywords} from '../Token'
import {ifElse, isEmpty, opIf, tail} from '../util'
import {checkEmpty, checkNonEmpty, unexpected} from './checks'
import {beforeAndBlock, parseBlockDo, parseLinesFromBlock} from './parseBlock'
import parseCase from './parseCase'
import parseDel from './parseDel'
import parseExcept from './parseExcept'
import {parseForDo} from './parseFor'
import parseLocalDeclares, {parseLocalDeclaresJustNames, parseLocalName} from './parseLocalDeclares'
import parseMemberName from './parseMemberName'
import parseQuote from './parseQuote'
import {parseExpr, parseExprParts, parseSpaced, parseSwitch} from './parse*'
import Slice from './Slice'

/** Parse the content of a line. */
export default function parseLine(tokens) {
	const head = tokens.head()
	const rest = tokens.tail()

	const noRest = () =>
		checkEmpty(rest, () => `Did not expect anything after ${head}.`)

	// We only deal with mutable expressions here, otherwise we fall back to parseExpr.
	if (head instanceof Keyword)
		switch (head.kind) {
			case Keywords.Assert: case Keywords.AssertNot:
				return parseAssert(head.kind === Keywords.AssertNot, rest)
			case Keywords.ExceptDo:
				return parseExcept(Keywords.ExceptDo, rest)
			case Keywords.Break:
				noRest()
				return new Break(tokens.loc)
			case Keywords.BreakWithVal:
				return new BreakWithVal(tokens.loc, parseExpr(rest))
			case Keywords.CaseDo:
				return parseCase(false, false, rest)
			case Keywords.Debugger:
				noRest()
				return new SpecialDo(tokens.loc, SpecialDos.Debugger)
			case Keywords.DelDo:
				return parseDel(rest)
			case Keywords.Ellipsis:
				return new BagEntryMany(tokens.loc, parseExpr(rest))
			case Keywords.ForDo:
				return parseForDo(rest)
			case Keywords.Ignore:
				return new Ignore(tokens.loc, rest.map(parseLocalName))
			case Keywords.IfDo: case Keywords.UnlessDo: {
				const [before, block] = beforeAndBlock(rest)
				return new ConditionalDo(tokens.loc,
					parseExpr(before),
					parseBlockDo(block),
					head.kind === Keywords.UnlessDo)
			}
			case Keywords.ObjAssign:
				return new BagEntry(tokens.loc, parseExpr(rest))
			case Keywords.Pass:
				noRest()
				return []
			case Keywords.Region:
				return parseLinesFromBlock(tokens)
			case Keywords.SuperDo:
				return new SuperCallDo(tokens.loc, parseExprParts(rest))
			case Keywords.SwitchDo:
				return parseSwitch(false, false, rest)
			case Keywords.Throw:
				return new Throw(tokens.loc, opIf(!rest.isEmpty(), () => parseExpr(rest)))
			case Keywords.Name:
				if (isKeyword(Keywords.ObjAssign, rest.head())) {
					const r = rest.tail()
					const val = r.isEmpty() ?
						new SpecialVal(tokens.loc, SpecialVals.Name) :
						parseExpr(r)
					return ObjEntryPlain.name(tokens.loc, val)
				}
				// else fall through
			default:
				// fall through
		}

	return ifElse(tokens.opSplitOnce(_ => isAnyKeyword(lineSplitKeywords, _)),
		({before, at, after}) => parseAssignLike(before, at, after, tokens.loc),
		() => parseExpr(tokens))
}

export const parseLineOrLines = tokens => {
	const _ = parseLine(tokens)
	return _ instanceof Array ? _ : [_]
}

const lineSplitKeywords = new Set([
	Keywords.Assign, Keywords.AssignMutable, Keywords.LocalMutate, Keywords.MapEntry,
	Keywords.ObjAssign, Keywords.Yield, Keywords.YieldTo
])

function parseAssignLike(before, at, after, loc) {
	const kind = at.kind
	if (kind === Keywords.MapEntry)
		return new MapEntry(loc, parseExpr(before), parseExpr(after))

	if (before.size() === 1) {
		const token = before.head()
		// `a.b = c`, `.b = c`, `a."b" = c`, `."b" = c`, `a[b] = c`
		if (isGroup(Groups.Space, token)) {
			const spaced = Slice.group(token)
			const [value, opType] = ifElse(spaced.opSplitOnce(_ => isKeyword(Keywords.Type, _)),
				({before, after}) => [before, parseExpr(after)],
				() => [spaced, null])

			const last = value.last()
			const object = obj =>
				obj.isEmpty() ? LocalAccess.this(obj.loc) : parseSpaced(obj)

			if (isKeyword(Keywords.Dot, value.nextToLast())) {
				const name = parseMemberName(last)
				const set = object(value.rtail().rtail())
				return new MemberSet(loc, set, name, opType, setKind(at), parseExpr(after))
			} else if (isGroup(Groups.Bracket, last)) {
				const set = object(value.rtail())
				return parseSubSet(set, Slice.group(last), opType, at, after, loc)
			}
		// `"1". 1`
		} else if (isGroup(Groups.Quote, token) && kind === Keywords.ObjAssign)
			return new ObjEntryPlain(loc, parseQuote(Slice.group(token)), parseExpr(after))
	}

	return kind === Keywords.LocalMutate ?
		parseLocalMutate(before, after, loc) :
		parseAssign(before, kind, after, loc)
}

function setKind(keyword) {
	switch (keyword.kind) {
		case Keywords.Assign:
			return Setters.Init
		case Keywords.AssignMutable:
			return Setters.InitMutable
		case Keywords.LocalMutate:
			return Setters.Mutate
		default:
			unexpected(keyword)
	}
}

function parseSubSet(object, subbed, opType, at, after, loc) {
	const subbeds = parseExprParts(subbed)
	return new SetSub(loc, object, subbeds, opType, setKind(at), parseExpr(after))
}

function parseLocalMutate(localsTokens, valueTokens, loc) {
	const locals = parseLocalDeclaresJustNames(localsTokens)
	check(locals.length === 1, loc, 'TODO: LocalDestructureMutate')
	const name = locals[0].name
	const value = parseExpr(valueTokens)
	return new LocalMutate(loc, name, value)
}

function parseAssign(localsTokens, kind, valueTokens, loc) {
	const locals = parseLocalDeclares(localsTokens)

	// Handle `a.` which moves an outer local into an ObjEntry.
	if (kind === Keywords.ObjAssign && valueTokens.isEmpty() && locals.length === 1) {
		const local = locals[0]
		check(local.opType === null, local.loc, () =>
			`Type declaration should go with initial declaration of ${local.name}.`)
		return ObjEntryPlain.access(loc, local.name)
	}

	const value = parseAssignValue(kind, valueTokens)

	const isYield = kind === Keywords.Yield || kind === Keywords.YieldTo
	if (isEmpty(locals)) {
		check(isYield, localsTokens.loc, 'Assignment to nothing')
		return value
	} else {
		if (isYield)
			for (const _ of locals)
				check(!_.isLazy(), _.loc, 'Can not yield to lazy variable.')

		const isObjAssign = kind === Keywords.ObjAssign

		if (kind === Keywords.AssignMutable)
			for (let _ of locals) {
				check(!_.isLazy(), _.loc, 'Lazy local can not be mutable.')
				_.kind = LocalDeclares.Mutable
			}

		const wrap = _ => isObjAssign ? new ObjEntryAssign(loc, _) : _

		if (locals.length === 1) {
			const assignee = locals[0]
			const assign = new AssignSingle(loc, assignee, value)
			return wrap(assign)
		} else {
			const kind = locals[0].kind
			for (const _ of locals)
				check(_.kind === kind, _.loc,
					'All locals of destructuring assignment must be of the same kind.')
			return wrap(new AssignDestructure(loc, locals, value, kind))
		}
	}
}

function parseAssignValue(kind, valueTokens) {
	const value = () => parseExpr(valueTokens)
	const opValue = () => opIf(!valueTokens.isEmpty(), value)
	switch (kind) {
		case Keywords.Yield:
			return new Yield(valueTokens.loc, opValue())
		case Keywords.YieldTo:
			return new YieldTo(valueTokens.loc, opValue())
		default:
			return value()
	}
}

function parseAssert(negate, tokens) {
	checkNonEmpty(tokens, () => `Expected something after ${keywordName(Keywords.Assert)}.`)

	const [condTokens, opThrown] =
		ifElse(tokens.opSplitOnce(_ => isKeyword(Keywords.Throw, _)),
			({before, after}) => [before, parseExpr(after)],
			() => [tokens, null])

	const parts = parseExprParts(condTokens)
	const cond = parts.length === 1 ? parts[0] : new Call(condTokens.loc, parts[0], tail(parts))
	return new Assert(tokens.loc, negate, cond, opThrown)
}

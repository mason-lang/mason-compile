import {Assert, AssignSingle, AssignDestructure, BagEntry, BagEntryMany, Break, BreakWithVal, Call,
	ConditionalDo, Ignore, LD_Mutable, LocalAccess, LocalMutate, MapEntry, MemberSet,
	ObjEntryAssign, ObjEntryComputed, SD_Debugger, SET_Init, SET_InitMutable, SET_Mutate, SetSub,
	SpecialDo, SpecialVal, SuperCallDo, SV_Name, Throw, Yield, YieldTo} from '../MsAst'
import {G_Bracket, G_Quote, G_Space, isGroup, isKeyword, Keyword, keywordName, KW_Assert,
	KW_AssertNot, KW_Assign, KW_AssignMutable, KW_Break, KW_BreakWithVal, KW_CaseDo, KW_Debugger,
	KW_Dot, KW_Ellipsis, KW_ExceptDo, KW_Focus, KW_ForDo, KW_IfDo, KW_Ignore, KW_LocalMutate,
	KW_MapEntry, KW_Name, KW_ObjAssign, KW_Pass, KW_Region, KW_SuperDo, KW_SwitchDo, KW_Throw,
	KW_Type, KW_UnlessDo, KW_Yield, KW_YieldTo, Name} from '../Token'
import {ifElse, isEmpty, opIf, tail} from '../util'
import {checkEmpty, checkNonEmpty, context, unexpected} from './context'
import {beforeAndBlock, parseBlockDo, parseLinesFromBlock} from './parseBlock'
import parseCase from './parseCase'
import parseExcept from './parseExcept'
import {parseForDo} from './parseFor'
import parseLine from './parseLine'
import parseLocalDeclares, {parseLocalDeclaresJustNames} from './parseLocalDeclares'
import parseMemberName from './parseMemberName'
import parseQuote from './parseQuote'
import {parseExpr, parseExprParts, parseSpaced, parseSwitch} from './parse*'
import Slice from './Slice'

export default tokens => {
	const head = tokens.head()
	const rest = tokens.tail()

	const noRest = () =>
		checkEmpty(rest, () => `Did not expect anything after ${head}.`)

	// We only deal with mutable expressions here, otherwise we fall back to parseExpr.
	if (head instanceof Keyword)
		switch (head.kind) {
			case KW_Assert: case KW_AssertNot:
				return parseAssert(head.kind === KW_AssertNot, rest)
			case KW_ExceptDo:
				return parseExcept(KW_ExceptDo, rest)
			case KW_Break:
				noRest()
				return new Break(tokens.loc)
			case KW_BreakWithVal:
				return new BreakWithVal(tokens.loc, parseExpr(rest))
			case KW_CaseDo:
				return parseCase(false, false, rest)
			case KW_Debugger:
				noRest()
				return new SpecialDo(tokens.loc, SD_Debugger)
			case KW_Ellipsis:
				return new BagEntryMany(tokens.loc, parseExpr(rest))
			case KW_ForDo:
				return parseForDo(rest)
			case KW_Ignore:
				return parseIgnore(rest)
			case KW_IfDo: case KW_UnlessDo: {
				const [before, block] = beforeAndBlock(rest)
				return new ConditionalDo(tokens.loc,
					parseExpr(before),
					parseBlockDo(block),
					head.kind === KW_UnlessDo)
			}
			case KW_ObjAssign:
				return new BagEntry(tokens.loc, parseExpr(rest))
			case KW_Pass:
				noRest()
				return []
			case KW_Region:
				return parseLinesFromBlock(tokens)
			case KW_SuperDo:
				return new SuperCallDo(tokens.loc, parseExprParts(rest))
			case KW_SwitchDo:
				return parseSwitch(false, false, rest)
			case KW_Throw:
				return new Throw(tokens.loc, opIf(!rest.isEmpty(), () => parseExpr(rest)))
			case KW_Name:
				if (isKeyword(KW_ObjAssign, rest.head())) {
					const r = rest.tail()
					const val = r.isEmpty() ? new SpecialVal(tokens.loc, SV_Name) : parseExpr(r)
					return ObjEntryComputed.name(tokens.loc, val)
				}
				// else fall through
			default:
				// fall through
		}

	return ifElse(tokens.opSplitOnceWhere(isLineSplitKeyword),
		({before, at, after}) => parseAssignLike(before, at, after, tokens.loc),
		() => parseExpr(tokens))
}

export const parseLineOrLines = tokens => {
	const _ = parseLine(tokens)
	return _ instanceof Array ? _ : [_]
}

const
	isLineSplitKeyword = token => {
		if (token instanceof Keyword)
			switch (token.kind) {
				case KW_Assign: case KW_AssignMutable: case KW_LocalMutate:
				case KW_MapEntry: case KW_ObjAssign: case KW_Yield: case KW_YieldTo:
					return true
				default:
					return false
			}
		else
			return false
	},

	parseAssignLike = (before, at, after, loc) => {
		const kind = at.kind
		if (kind === KW_MapEntry)
			return new MapEntry(loc, parseExpr(before), parseExpr(after))

		if (before.size() === 1) {
			const token = before.head()
			// `a.b = c`, `.b = c`, `a."b" = c`, `."b" = c`, `a[b] = c`
			if (isGroup(G_Space, token)) {
				const spaced = Slice.group(token)
				const [value, opType] = ifElse(spaced.opSplitOnceWhere(_ => isKeyword(KW_Type, _)),
					({before, after}) => [before, parseExpr(after)],
					() => [spaced, null])

				const last = value.last()
				const object = obj =>
					obj.isEmpty() ? LocalAccess.this(obj.loc) : parseSpaced(obj)

				if (isKeyword(KW_Dot, value.nextToLast())) {
					const name = parseMemberName(last)
					const set = object(value.rtail().rtail())
					const kind = memberSetKind(at)
					return new MemberSet(loc, set, name, opType, kind, parseExpr(after))
				} else if (isGroup(G_Bracket, last)) {
					const set = object(value.rtail())
					return parseSubSet(set, Slice.group(last), opType, at, after, loc)
				}
			// `"1". 1`
			} else if (isGroup(G_Quote, token) && kind === KW_ObjAssign)
				return new ObjEntryComputed(loc, parseQuote(Slice.group(token)), parseExpr(after))
		}

		return kind === KW_LocalMutate ?
			parseLocalMutate(before, after, loc) :
			parseAssign(before, kind, after, loc)
	},

	memberSetKind = at => {
		switch (at.kind) {
			case KW_Assign:
				return SET_Init
			case KW_AssignMutable:
				return SET_InitMutable
			case KW_LocalMutate:
				return SET_Mutate
			default:
				unexpected(at)
		}
	},

	parseSubSet = (object, subbed, opType, at, after, loc) => {
		const subbeds = parseExprParts(subbed)
		return new SetSub(loc, object, subbeds, opType, memberSetKind(at), parseExpr(after))
	},

	parseLocalMutate = (localsTokens, valueTokens, loc) => {
		const locals = parseLocalDeclaresJustNames(localsTokens)
		context.check(locals.length === 1, loc, 'TODO: LocalDestructureMutate')
		const name = locals[0].name
		const value = parseExpr(valueTokens)
		return new LocalMutate(loc, name, value)
	},

	parseAssign = (localsTokens, kind, valueTokens, loc) => {
		const locals = parseLocalDeclares(localsTokens)
		const value = parseAssignValue(kind, valueTokens)

		const isYield = kind === KW_Yield || kind === KW_YieldTo
		if (isEmpty(locals)) {
			context.check(isYield, localsTokens.loc, 'Assignment to nothing')
			return value
		} else {
			if (isYield)
				for (const _ of locals)
					context.check(!_.isLazy(), _.loc, 'Can not yield to lazy variable.')

			const isObjAssign = kind === KW_ObjAssign

			if (kind === KW_AssignMutable)
				for (let _ of locals) {
					context.check(!_.isLazy(), _.loc, 'Lazy local can not be mutable.')
					_.kind = LD_Mutable
				}

			const wrap = _ => isObjAssign ? new ObjEntryAssign(loc, _) : _

			if (locals.length === 1) {
				const assignee = locals[0]
				const assign = new AssignSingle(loc, assignee, value)
				return wrap(assign)
			} else {
				const kind = locals[0].kind
				for (const _ of locals)
					context.check(_.kind === kind, _.loc,
						'All locals of destructuring assignment must be of the same kind.')
				return wrap(new AssignDestructure(loc, locals, value, kind))
			}
		}
	},

	parseAssignValue = (kind, valueTokens) => {
		const value = parseExpr(valueTokens)
		switch (kind) {
			case KW_Yield:
				return new Yield(value.loc, value)
			case KW_YieldTo:
				return new YieldTo(value.loc, value)
			default:
				return value
		}
	},

	parseAssert = (negate, tokens) => {
		checkNonEmpty(tokens, () => `Expected something after ${keywordName(KW_Assert)}.`)

		const [condTokens, opThrown] =
			ifElse(tokens.opSplitOnceWhere(_ => isKeyword(KW_Throw, _)),
				({before, after}) => [before, parseExpr(after)],
				() => [tokens, null])

		const parts = parseExprParts(condTokens)
		const cond = parts.length === 1 ? parts[0] : new Call(condTokens.loc, parts[0], tail(parts))
		return new Assert(tokens.loc, negate, cond, opThrown)
	},

	parseIgnore = tokens => {
		const ignored = tokens.map(_ => {
			if (isKeyword(KW_Focus, _))
				return '_'
			else {
				context.check(_ instanceof Name, _.loc, () => `Expected local name, not ${_}.`)
				return _.name
			}
		})
		return new Ignore(tokens.loc, ignored)
	}
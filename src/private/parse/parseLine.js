import {Assert, AssignSingle, AssignDestructure, BagEntry, BagEntryMany, Break, BreakWithVal, Call,
	ConditionalDo, Debug, Ignore, LD_Mutable, LocalAccess, LocalMutate, MapEntry, MemberSet,
	MS_New, MS_NewMutable, MS_Mutate, ObjEntryAssign, ObjEntryComputed, SD_Debugger, SpecialDo,
	SpecialVal, SuperCallDo, SV_Name, SV_Null, Throw, Yield, YieldTo} from '../MsAst'
import {DotName, G_Block, G_Space, isGroup, isKeyword, Keyword, keywordName, KW_Assert,
	KW_AssertNot, KW_Assign, KW_AssignMutable, KW_Break, KW_BreakWithVal, KW_CaseDo, KW_Debug,
	KW_Debugger, KW_Ellipsis, KW_ExceptDo, KW_Focus, KW_ForDo, KW_IfDo, KW_Ignore, KW_LocalMutate,
	KW_MapEntry, KW_Name, KW_ObjAssign, KW_Pass, KW_Region, KW_SuperDo, KW_SwitchDo, KW_Throw,
	KW_UnlessDo, KW_Yield, KW_YieldTo, Name} from '../Token'
import {ifElse, isEmpty, opIf, tail} from '../util'
import {checkEmpty, checkNonEmpty, context} from './context'
import {beforeAndBlock, parseBlockDo, parseLinesFromBlock} from './parseBlock'
import parseCase from './parseCase'
import parseExcept from './parseExcept'
import {parseForDo} from './parseFor'
import parseLine from './parseLine'
import parseLocalDeclares, {parseLocalDeclaresJustNames} from './parseLocalDeclares'
import {parseExpr, parseExprParts, parseSpaced, parseSwitch} from './parse*'
import Slice from './Slice'

export default tokens => {
	const head = tokens.head()
	const rest = tokens.tail()

	const noRest = () =>
		checkEmpty(rest, () => `Did not expect anything after ${head}`)

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
			case KW_Debug:
				return new Debug(tokens.loc,
					isGroup(G_Block, tokens.second()) ?
					// `debug`, then indented block
					parseLinesFromBlock() :
					// `debug`, then single line
					parseLineOrLines(rest))
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
				// else fallthrough
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
		if (at.kind === KW_MapEntry)
			return new MapEntry(loc, parseExpr(before), parseExpr(after))

		// TODO: This code is kind of ugly.
		// It parses `x.y = z` and the like.
		if (before.size() === 1) {
			const token = before.head()
			if (token instanceof DotName)
				return parseMemberSet(	LocalAccess.this(token.loc), token.name, at, after, loc)
			if (isGroup(G_Space, token)) {
				const spaced = Slice.group(token)
				const dot = spaced.last()
				if (dot instanceof DotName) {
					context.check(dot.nDots === 1, dot.loc, 'Must have only 1 `.`.')
					return parseMemberSet(parseSpaced(spaced.rtail()), dot.name, at, after, loc)
				}
			}
		}

		return at.kind === KW_LocalMutate ?
			parseLocalMutate(before, after, loc) :
			parseAssign(before, at, after, loc)
	},

	parseMemberSet = (object, name, at, after, loc) =>
		new MemberSet(loc, object, name, memberSetKind(at), parseExpr(after)),
	memberSetKind = at => {
		switch (at.kind) {
			case KW_Assign: return MS_New
			case KW_AssignMutable: return MS_NewMutable
			case KW_LocalMutate: return MS_Mutate
			default: throw new Error()
		}
	},

	parseLocalMutate = (localsTokens, valueTokens, loc) => {
		const locals = parseLocalDeclaresJustNames(localsTokens)
		context.check(locals.length === 1, loc, 'TODO: LocalDestructureMutate')
		const name = locals[0].name
		const value = parseExpr(valueTokens)
		return new LocalMutate(loc, name, value)
	},

	parseAssign = (localsTokens, assigner, valueTokens, loc) => {
		const kind = assigner.kind
		const locals = parseLocalDeclares(localsTokens)
		const opName = opIf(locals.length === 1, () => locals[0].name)
		const value = parseAssignValue(kind, opName, valueTokens)

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
				const isTest = isObjAssign && assignee.name.endsWith('test')
				return isTest ? new Debug(loc, [wrap(assign)]) : wrap(assign)
			} else {
				const kind = locals[0].kind
				for (const _ of locals)
					context.check(_.kind === kind, _.loc,
						'All locals of destructuring assignment must be of the same kind.')
				return wrap(new AssignDestructure(loc, locals, value, kind))
			}
		}
	},

	parseAssignValue = (kind, opName, valueTokens) => {
		const value = valueTokens.isEmpty() && kind === KW_ObjAssign ?
			new SpecialVal(valueTokens.loc, SV_Null) :
			parseExpr(valueTokens)
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
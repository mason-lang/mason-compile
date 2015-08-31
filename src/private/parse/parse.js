import Loc from 'esast/dist/Loc'
import { code } from '../../CompileError'
import { JsGlobals } from '../language'
import { Assert, AssignDestructure, AssignSingle, BagEntry, BagEntryMany, BagSimple, BlockBag,
	BlockDo, BlockMap, BlockObj, BlockValThrow, BlockWithReturn, BlockWrap, Break, BreakWithVal,
	Call, CaseDo, CaseDoPart, CaseVal, CaseValPart, Catch, Class, ClassDo, ConditionalDo,
	ConditionalVal, Debug, Ignore, Iteratee, NumberLiteral, ExceptDo, ExceptVal, ForBag, ForDo,
	ForVal, Fun, GlobalAccess, L_And, L_Or, Lazy, LD_Const, LD_Lazy, LD_Mutable, LocalAccess,
	LocalDeclare, LocalDeclareFocus, LocalDeclareName, LocalDeclareRes, LocalDeclareThis,
	LocalMutate, Logic, MapEntry, Member, MemberSet, MethodImpl, MI_Get, MI_Plain, MI_Set, Module,
	MS_Mutate, MS_New, MS_NewMutable, New, Not, ObjEntry, ObjPair, ObjSimple, Pattern, Quote,
	QuoteTemplate, SD_Debugger, SpecialDo, SpecialVal, SV_Null, Splat, SwitchDo, SwitchDoPart,
	SwitchVal, SwitchValPart, Throw, Val, Use, UseDo, With, Yield, YieldTo } from '../MsAst'
import { DotName, Group, G_Block, G_Bracket, G_Parenthesis, G_Space, G_Quote, isGroup, isKeyword,
	Keyword, KW_And, KW_As, KW_Assert, KW_AssertNot, KW_Assign, KW_AssignMutable, KW_Break,
	KW_BreakWithVal, KW_CaseVal, KW_CaseDo, KW_Class, KW_CatchDo, KW_CatchVal, KW_Construct,
	KW_Debug, KW_Debugger, KW_Do, KW_Ellipsis, KW_Else, KW_ExceptDo, KW_ExceptVal, KW_Finally,
	KW_ForBag, KW_ForDo, KW_ForVal, KW_Focus, KW_Fun, KW_FunDo, KW_FunGen, KW_FunGenDo, KW_FunThis,
	KW_FunThisDo, KW_FunThisGen, KW_FunThisGenDo, KW_Get, KW_IfDo, KW_IfVal, KW_Ignore, KW_In,
	KW_Lazy, KW_LocalMutate, KW_MapEntry, KW_New, KW_Not, KW_ObjAssign, KW_Or, KW_Pass, KW_Out,
	KW_Region, KW_Set, KW_Static, KW_SwitchDo, KW_SwitchVal, KW_Throw, KW_TryDo, KW_TryVal,
	KW_Type, KW_UnlessDo, KW_UnlessVal, KW_Use, KW_UseDebug, KW_UseDo, KW_UseLazy, KW_With,
	KW_Yield, KW_YieldTo, Name, keywordName, opKeywordKindToSpecialValueKind } from '../Token'
import { assert, head, ifElse, flatMap, isEmpty, last,
	opIf, opMap, push, repeat, rtail, tail, unshift } from '../util'
import Slice from './Slice'

// Since there are so many parsing functions,
// it's faster (as of node v0.11.14) to have them all close over this mutable variable once
// than to close over the parameter (as in lex.js, where that's much faster).
let context

/*
This converts a Token tree to a MsAst.
This is a recursive-descent parser, made easier by two facts:
	* We have already grouped tokens.
	* Most of the time, an ast's type is determined by the first token.

There are exceptions such as assignment statements (indicated by a `=` somewhere in the middle).
For those we must iterate through tokens and split.
(See Slice.opSplitOnceWhere and Slice.opSplitManyWhere.)
*/
export default (_context, rootToken) => {
	context = _context
	assert(isGroup(G_Block, rootToken))
	const msAst = parseModule(Slice.group(rootToken))
	// Release for garbage collections.
	context = undefined
	return msAst
}

const
	checkEmpty = (tokens, message) =>
		context.check(tokens.isEmpty(), tokens.loc, message),
	checkNonEmpty = (tokens, message) =>
		context.check(!tokens.isEmpty(), tokens.loc, message),
	unexpected = token => context.fail(token.loc, `Unexpected ${token}`)

const parseModule = tokens => {
	// Use statements must appear in order.
	const [ doUses, rest0 ] = tryParseUses(KW_UseDo, tokens)
	const [ plainUses, rest1 ] = tryParseUses(KW_Use, rest0)
	const [ lazyUses, rest2 ] = tryParseUses(KW_UseLazy, rest1)
	const [ debugUses, rest3 ] = tryParseUses(KW_UseDebug, rest2)
	const { lines, exports, opDefaultExport } = parseModuleBlock(rest3)

	if (context.opts.includeModuleName() && !exports.some(_ => _.name === 'name')) {
		const name = new LocalDeclareName(tokens.loc)
		lines.push(new AssignSingle(tokens.loc, name,
			Quote.forString(tokens.loc, context.opts.moduleName())))
		exports.push(name)
	}
	const uses = plainUses.concat(lazyUses)
	return new Module(tokens.loc, doUses, uses, debugUses, lines, exports, opDefaultExport)
}

// parseBlock
const
	// Tokens on the line before a block, and tokens for the block itself.
	beforeAndBlock = tokens => {
		checkNonEmpty(tokens, 'Expected an indented block.')
		const block = tokens.last()
		context.check(isGroup(G_Block, block), block.loc, 'Expected an indented block.')
		return [ tokens.rtail(), Slice.group(block) ]
	},

	blockWrap = tokens => new BlockWrap(tokens.loc, parseBlockVal(tokens)),

	justBlock = (keyword, tokens) => {
		const [ before, block ] = beforeAndBlock(tokens)
		checkEmpty(before, () =>
			`Did not expect anything between ${code(keywordName(keyword))} and block.`)
		return block
	},
	justBlockDo = (keyword, tokens) =>
		parseBlockDo(justBlock(keyword, tokens)),
	justBlockVal = (keyword, tokens) =>
		parseBlockVal(justBlock(keyword, tokens)),

	// Gets lines in a region or Debug.
	parseLinesFromBlock = tokens => {
		const h = tokens.head()
		context.check(tokens.size() > 1, h.loc, () => `Expected indented block after ${h}`)
		const block = tokens.second()
		assert(tokens.size() === 2 && isGroup(G_Block, block))
		return flatMap(block.subTokens, line => parseLineOrLines(Slice.group(line)))
	},

	parseBlockDo = tokens => {
		const lines = _plainBlockLines(tokens)
		return new BlockDo(tokens.loc, lines)
	},

	parseBlockVal = tokens => {
		const { lines, kReturn } = _parseBlockLines(tokens)
		switch (kReturn) {
			case KReturn_Bag:
				return BlockBag.of(tokens.loc, lines)
			case KReturn_Map:
				return BlockMap.of(tokens.loc, lines)
			case KReturn_Obj:
				const [ doLines, opVal ] = _tryTakeLastVal(lines)
				// opName written to by _tryAddName.
				return BlockObj.of(tokens.loc, doLines, opVal, null)
			default: {
				context.check(!isEmpty(lines), tokens.loc, 'Value block must end in a value.')
				const val = last(lines)
				if (val instanceof Throw)
					return new BlockValThrow(tokens.loc, rtail(lines), val)
				else {
					context.check(val instanceof Val, val.loc, 'Value block must end in a value.')
					return new BlockWithReturn(tokens.loc, rtail(lines), val)
				}
			}
		}
	},

	parseModuleBlock = tokens => {
		const { lines, kReturn } = _parseBlockLines(tokens)
		const loc = tokens.loc
		switch (kReturn) {
			case KReturn_Bag: case KReturn_Map: {
				const block = (kReturn === KReturn_Bag ? BlockBag : BlockMap).of(loc, lines)
				return { lines: [ ], exports: [ ], opDefaultExport: new BlockWrap(loc, block) }
			}
			default: {
				const exports = [ ]
				let opDefaultExport = null
				const moduleName = context.opts.moduleName()

				// Module exports look like a BlockObj,  but are really different.
				// In ES6, module exports must be completely static.
				// So we keep an array of exports attached directly to the Module ast.
				// If you write:
				//	if! cond
				//		a. b
				// in a module context, it will be an error. (The module creates no `built` local.)
				const getLineExports = line => {
					if (line instanceof ObjEntry) {
						for (const _ of line.assign.allAssignees())
							if (_.name === moduleName) {
								context.check(opDefaultExport === null, _.loc, () =>
									`Default export already declared at ${opDefaultExport.loc}`)
								opDefaultExport = new LocalAccess(_.loc, _.name)
							} else
								exports.push(_)
						return line.assign
					} else if (line instanceof Debug)
						line.lines = line.lines.map(getLineExports)
					return line
				}

				const moduleLines = lines.map(getLineExports)

				if (isEmpty(exports) && opDefaultExport === null) {
					const [ lines, opDefaultExport ] = _tryTakeLastVal(moduleLines)
					return { lines, exports, opDefaultExport }
				} else
					return { lines: moduleLines, exports, opDefaultExport }
			}
		}
	}

// parseBlock privates
const
	_tryTakeLastVal = lines =>
		(!isEmpty(lines) && last(lines) instanceof Val) ?
			[ rtail(lines), last(lines) ] :
			[ lines, null ],

	_plainBlockLines = lineTokens => {
		const lines = [ ]
		const addLine = line => {
			if (line instanceof Array)
				for (const _ of line)
					addLine(_)
			else
				lines.push(line)
		}
		lineTokens.each(_ => addLine(parseLine(Slice.group(_))))
		return lines
	},

	KReturn_Plain = 0,
	KReturn_Obj = 1,
	KReturn_Bag = 2,
	KReturn_Map = 3,
	_parseBlockLines = lineTokens => {
		let isBag = false, isMap = false, isObj = false
		const checkLine = line => {
			if (line instanceof Debug)
				for (const _ of line.lines)
					checkLine(_)
			else if (line instanceof BagEntry)
				isBag = true
			else if (line instanceof MapEntry)
				isMap = true
			else if (line instanceof ObjEntry)
				isObj = true
		}
		const lines = _plainBlockLines(lineTokens)
		for (const _ of lines)
			checkLine(_)

		context.check(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.')
		context.check(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.')
		context.check(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.')

		const kReturn =
			isObj ? KReturn_Obj : isBag ? KReturn_Bag : isMap ? KReturn_Map : KReturn_Plain
		return { lines, kReturn }
	}

const parseCase = (isVal, casedFromFun, tokens) => {
	const [ before, block ] = beforeAndBlock(tokens)

	let opCased
	if (casedFromFun) {
		checkEmpty(before, 'Can\'t make focus -- is implicitly provided as first argument.')
		opCased = null
	} else
		opCased = opIf(!before.isEmpty(), () => AssignSingle.focus(before.loc, parseExpr(before)))

	const lastLine = Slice.group(block.last())
	const [ partLines, opElse ] = isKeyword(KW_Else, lastLine.head()) ?
		[ block.rtail(), (isVal ? justBlockVal : justBlockDo)(KW_Else, lastLine.tail()) ] :
		[ block, null ]

	const parts = partLines.mapSlices(_parseCaseLine(isVal))
	context.check(parts.length > 0, tokens.loc, () =>
		`Must have at least 1 non-${code('else')} test.`)

	return new (isVal ? CaseVal : CaseDo)(tokens.loc, opCased, parts, opElse)
}
// parseCase privates
const
	_parseCaseLine = isVal => line => {
		const [ before, block ] = beforeAndBlock(line)
		const test = _parseCaseTest(before)
		const result = (isVal ? parseBlockVal : parseBlockDo)(block)
		return new (isVal ? CaseValPart : CaseDoPart)(line.loc, test, result)
	},
	_parseCaseTest = tokens => {
		const first = tokens.head()
		// Pattern match starts with type test and is followed by local declares.
		// E.g., `:Some val`
		if (isGroup(G_Space, first) && tokens.size() > 1) {
			const ft = Slice.group(first)
			if (isKeyword(KW_Type, ft.head())) {
				const type = parseSpaced(ft.tail())
				const locals = parseLocalDeclares(tokens.tail())
				return new Pattern(first.loc, type, locals, LocalAccess.focus(tokens.loc))
			}
		}
		return parseExpr(tokens)
	}

const parseSwitch = (isVal, tokens) => {
	const [ before, block ] = beforeAndBlock(tokens)
	const switched = parseExpr(before)
	const lastLine = Slice.group(block.last())
	const [ partLines, opElse ] = isKeyword(KW_Else, lastLine.head()) ?
		[ block.rtail(), (isVal ? justBlockVal : justBlockDo)(KW_Else, lastLine.tail()) ] :
		[ block, null ]

	const parts = partLines.mapSlices(_parseSwitchLine(isVal))
	context.check(parts.length > 0, tokens.loc, () =>
		`Must have at least 1 non-${code('else')} test.`)

	return new (isVal ? SwitchVal : SwitchDo)(tokens.loc, switched, parts, opElse)
}
const
	_parseSwitchLine = isVal => line => {
		const [ before, block ] = beforeAndBlock(line)
		const value = parseExpr(before)
		const result = (isVal ? parseBlockVal : parseBlockDo)(block)
		return new (isVal ? SwitchValPart : SwitchDoPart)(line.loc, value, result)
	}

const
	parseExpr = tokens => {
		return ifElse(tokens.opSplitManyWhere(_ => isKeyword(KW_ObjAssign, _)),
			splits => {
				// Short object form, such as (a. 1, b. 2)
				const first = splits[0].before
				checkNonEmpty(first, () => `Unexpected ${splits[0].at}`)
				const tokensCaller = first.rtail()

				const pairs = [ ]
				for (let i = 0; i < splits.length - 1; i = i + 1) {
					const name = splits[i].before.last()
					context.check(name instanceof Name, name.loc, () =>
						`Expected a name, not ${name}`)
					const tokensValue = i === splits.length - 2 ?
						splits[i + 1].before :
						splits[i + 1].before.rtail()
					const value = parseExprPlain(tokensValue)
					const loc = new Loc(name.loc.start, tokensValue.loc.end)
					pairs.push(new ObjPair(loc, name.name, value))
				}
				assert(last(splits).at === undefined)
				const val = new ObjSimple(tokens.loc, pairs)
				if (tokensCaller.isEmpty())
					return val
				else {
					const parts = parseExprParts(tokensCaller)
					return new Call(tokens.loc, head(parts), push(tail(parts), val))
				}
			},
			() => parseExprPlain(tokens)
		)
	},

	parseExprPlain = tokens => {
		const parts = parseExprParts(tokens)
		switch (parts.length) {
			case 0:
				context.fail(tokens.loc, 'Expected an expression, got nothing.')
			case 1:
				return head(parts)
			default:
				return new Call(tokens.loc, head(parts), tail(parts))
		}
	},

	parseExprParts = tokens => {
		const opSplit = tokens.opSplitOnceWhere(token => {
			if (token instanceof Keyword)
				switch (token.kind) {
					case KW_And: case KW_CaseVal: case KW_Class: case KW_ExceptVal: case KW_ForBag:
					case KW_ForVal: case KW_Fun: case KW_FunDo: case KW_FunGen: case KW_FunGenDo:
					case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen: case KW_FunThisGenDo:
					case KW_IfVal: case KW_New: case KW_Not: case KW_Or: case KW_SwitchVal:
					case KW_UnlessVal: case KW_With: case KW_Yield: case KW_YieldTo:
						return true
					default:
						return false
				}
			return false
		})
		return ifElse(opSplit,
			({ before, at, after }) => {
				const last = (() => {
					switch (at.kind) {
						case KW_And: case KW_Or:
							return new Logic(at.loc, at.kind === KW_And ? L_And : L_Or,
								parseExprParts(after))
						case KW_CaseVal:
							return parseCase(true, false, after)
						case KW_Class:
							return parseClass(after)
						case KW_ExceptVal:
							return parseExcept(KW_ExceptVal, after)
						case KW_ForBag:
							return parseForBag(after)
						case KW_ForVal:
							return parseForVal(after)
						case KW_Fun: case KW_FunDo: case KW_FunGen: case KW_FunGenDo:
						case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen:
						case KW_FunThisGenDo:
							return parseFun(at.kind, after)
						case KW_IfVal: case KW_UnlessVal: {
							const [ before, block ] = beforeAndBlock(after)
							return new ConditionalVal(tokens.loc,
								parseExprPlain(before),
								parseBlockVal(block),
								at.kind === KW_UnlessVal)
						}
						case KW_New: {
							const parts = parseExprParts(after)
							return new New(at.loc, parts[0], tail(parts))
						}
						case KW_Not:
							return new Not(at.loc, parseExprPlain(after))
						case KW_SwitchVal:
							return parseSwitch(true, after)
						case KW_With:
							return parseWith(after)
						case KW_Yield:
							return new Yield(at.loc,
								opIf(!after.isEmpty(), () => parseExprPlain(after)))
						case KW_YieldTo:
							return new YieldTo(at.loc, parseExprPlain(after))
						default: throw new Error(at.kind)
					}
				})()
				return push(before.map(parseSingle), last)
			},
			() => tokens.map(parseSingle))
	}

const parseFun = (kind, tokens) => {
	let isThis = false, isDo = false, isGen = false
	switch (kind) {
		case KW_Fun:
			break
		case KW_FunDo:
			isDo = true
			break
		case KW_FunGen:
			isGen = true
			break
		case KW_FunGenDo:
			isGen = true
			isDo = true
			break
		case KW_FunThis:
			isThis = true
			break
		case KW_FunThisDo:
			isThis = true
			isDo = true
			break
		case KW_FunThisGen:
			isThis = true
			isGen = true
			break
		case KW_FunThisGenDo:
			isThis = true
			isGen = true
			isDo = true
			break
		default: throw new Error()
	}
	const opDeclareThis = opIf(isThis, () => new LocalDeclareThis(tokens.loc))

	const { opReturnType, rest } = _tryTakeReturnType(tokens)
	const { args, opRestArg, block, opIn, opOut } = _funArgsAndBlock(isDo, rest)
	// Need res declare if there is a return type or out condition.
	const opDeclareRes = ifElse(opReturnType,
		_ => new LocalDeclareRes(_.loc, _),
		() => opMap(opOut, _ => new LocalDeclareRes(_.loc, null)))
	return new Fun(tokens.loc,
		opDeclareThis, isGen, args, opRestArg, block, opIn, opDeclareRes, opOut)
}

// parseFun privates
const
	_tryTakeReturnType = tokens => {
		if (!tokens.isEmpty()) {
			const h = tokens.head()
			if (isGroup(G_Space, h) && isKeyword(KW_Type, head(h.subTokens)))
				return {
					opReturnType: parseSpaced(Slice.group(h).tail()),
					rest: tokens.tail()
				}
		}
		return { opReturnType: null, rest: tokens }
	},

	_funArgsAndBlock = (isDo, tokens) => {
		checkNonEmpty(tokens, 'Expected an indented block.')
		const h = tokens.head()
		// Might be `|case`
		if (h instanceof Keyword && (h.kind === KW_CaseVal || h.kind === KW_CaseDo)) {
			const eCase = parseCase(h.kind === KW_CaseVal, true, tokens.tail())
			const args = [ new LocalDeclareFocus(h.loc) ]
			return h.kind === KW_CaseVal ?
				{
					args, opRestArg: null, opIn: null, opOut: null,
					block: new BlockWithReturn(tokens.loc, [ ], eCase)
				} :
				{
					args, opRestArg: null, opIn: null, opOut: null,
					block: new BlockDo(tokens.loc, [ eCase ])
				}
		} else {
			const [ before, blockLines ] = beforeAndBlock(tokens)
			const { args, opRestArg } = _parseFunLocals(before)
			for (const arg of args)
				if (!arg.isLazy())
					arg.kind = LD_Mutable
			const [ opIn, rest0 ] = _tryTakeInOrOut(KW_In, blockLines)
			const [ opOut, rest1 ] = _tryTakeInOrOut(KW_Out, rest0)
			const block = (isDo ? parseBlockDo : parseBlockVal)(rest1)
			return { args, opRestArg, block, opIn, opOut }
		}
	},

	_parseFunLocals = tokens => {
		if (tokens.isEmpty())
			return { args: [], opRestArg: null }
		else {
			const l = tokens.last()
			if (l instanceof DotName) {
				context.check(l.nDots === 3, l.loc, 'Splat argument must have exactly 3 dots')
				return {
					args: parseLocalDeclares(tokens.rtail()),
					opRestArg: LocalDeclare.plain(l.loc, l.name)
				}
			}
			else return { args: parseLocalDeclares(tokens), opRestArg: null }
		}
	},

	_tryTakeInOrOut = (inOrOut, tokens) => {
		if (!tokens.isEmpty()) {
			const firstLine = tokens.headSlice()
			if (isKeyword(inOrOut, firstLine.head())) {
				const inOut = new Debug(
					firstLine.loc,
					parseLinesFromBlock(firstLine))
				return [ inOut, tokens.tail() ]
			}
		}
		return [ null, tokens ]
	}

const
	parseLine = tokens => {
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
					const [ before, block ] = beforeAndBlock(rest)
					return new ConditionalDo(tokens.loc,
						parseExpr(before),
						parseBlockDo(block),
						head.kind === KW_UnlessDo)
				}
				case KW_ObjAssign:
					return new BagEntry(tokens.loc, parseExpr(rest))
				case KW_Pass:
					noRest()
					return [ ]
				case KW_Region:
					return parseLinesFromBlock(tokens)
				case KW_SwitchDo:
					return parseSwitch(false, rest)
				case KW_Throw:
					return new Throw(tokens.loc, opIf(!rest.isEmpty(), () => parseExpr(rest)))
				default:
					// fall through
			}

		return ifElse(tokens.opSplitOnceWhere(_isLineSplitKeyword),
			({ before, at, after }) => _parseAssignLike(before, at, after, tokens.loc),
			() => parseExpr(tokens))
	},

	parseLineOrLines = tokens => {
		const _ = parseLine(tokens)
		return _ instanceof Array ? _ : [ _ ]
	}

// parseLine privates
const
	_isLineSplitKeyword = token => {
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

	_parseAssignLike = (before, at, after, loc) => {
		if (at.kind === KW_MapEntry)
			return _parseMapEntry(before, after, loc)

		// TODO: This code is kind of ugly.
		if (before.size() === 1) {
			const token = before.head()
			if (token instanceof DotName)
				return _parseMemberSet(	LocalAccess.this(token.loc), token.name, at, after, loc)
			if (isGroup(G_Space, token)) {
				const spaced = Slice.group(token)
				const dot = spaced.last()
				if (dot instanceof DotName) {
					context.check(dot.nDots === 1, dot.loc, 'Must have only 1 `.`.')
					return _parseMemberSet(parseSpaced(spaced.rtail()), dot.name, at, after, loc)
				}
			}
		}

		return at.kind === KW_LocalMutate ?
			_parseLocalMutate(before, after, loc) :
			_parseAssign(before, at, after, loc)
	},

	_parseMemberSet = (object, name, at, after, loc) =>
		new MemberSet(loc, object, name, _memberSetKind(at), parseExpr(after)),
	_memberSetKind = at => {
		switch (at.kind) {
			case KW_Assign: return MS_New
			case KW_AssignMutable: return MS_NewMutable
			case KW_LocalMutate: return MS_Mutate
			default: throw new Error()
		}
	},

	_parseLocalMutate = (localsTokens, valueTokens, loc) => {
		const locals = parseLocalDeclaresJustNames(localsTokens)
		context.check(locals.length === 1, loc, 'TODO: LocalDestructureMutate')
		const name = locals[0].name
		const value = parseExpr(valueTokens)
		return new LocalMutate(loc, name, value)
	},

	_parseAssign = (localsTokens, assigner, valueTokens, loc) => {
		const kind = assigner.kind
		const locals = parseLocalDeclares(localsTokens)
		const opName = opIf(locals.length === 1, () => locals[0].name)
		const value = _parseAssignValue(kind, opName, valueTokens)

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

			const wrap = _ => isObjAssign ? new ObjEntry(loc, _) : _

			if (locals.length === 1) {
				const assignee = locals[0]
				const assign = new AssignSingle(loc, assignee, value)
				const isTest = isObjAssign && assignee.name.endsWith('test')
				return isTest ? new Debug(loc, [ wrap(assign) ]) : wrap(assign)
			} else {
				const kind = locals[0].kind
				for (const _ of locals)
					context.check(_.kind === kind, _.loc,
						'All locals of destructuring assignment must be of the same kind.')
				return wrap(new AssignDestructure(loc, locals, value, kind))
			}
		}
	},

	_parseAssignValue = (kind, opName, valueTokens) => {
		const value = valueTokens.isEmpty() && kind === KW_ObjAssign ?
			new SpecialVal(valueTokens.loc, SV_Null) :
			parseExpr(valueTokens)
		if (opName !== null)
			_tryAddName(value, opName)
		switch (kind) {
			case KW_Yield:
				return new Yield(value.loc, value)
			case KW_YieldTo:
				return new YieldTo(value.loc, value)
			default:
				return value
		}
	},

	// We give it a name if:
	// It's a function
	// It's an Obj block
	// It's an Obj block at the end of a call (as in `name = Obj-Type ...`)
	_tryAddName = (_, name) => {
		if (_ instanceof Fun || _ instanceof Class)
			_.opName = name
		else if ((_ instanceof Call || _ instanceof New) && !isEmpty(_.args))
			_tryAddObjName(last(_.args), name)
		else
			_tryAddObjName(_, name)
	},

	_tryAddObjName = (_, name) => {
		if (_ instanceof BlockWrap && _.block instanceof BlockObj)
			if (_.block.opObjed !== null && _.block.opObjed instanceof Fun)
				_.block.opObjed.opName = name
			else if (!_nameObjAssignSomewhere(_.block.lines))
				_.block.opName = name
	},
	_nameObjAssignSomewhere = lines =>
		lines.some(line =>
			line instanceof ObjEntry && line.assign.allAssignees().some(_ =>
				_.name === 'name')),

	_parseMapEntry = (before, after, loc) =>
		new MapEntry(loc, parseExpr(before), parseExpr(after))

const
	parseLocalDeclaresJustNames = tokens =>
		tokens.map(_ => LocalDeclare.plain(_.loc, _parseLocalName(_))),

	parseLocalDeclares = tokens => tokens.map(parseLocalDeclare),

	parseLocalDeclare = token => {
		if (isGroup(G_Space, token)) {
			const tokens = Slice.group(token)
			const [ rest, isLazy ] =
				isKeyword(KW_Lazy, tokens.head()) ? [ tokens.tail(), true ] : [ tokens, false ]
			const name = _parseLocalName(rest.head())
			const rest2 = rest.tail()
			const opType = opIf(!rest2.isEmpty(), () => {
				const colon = rest2.head()
				context.check(isKeyword(KW_Type, colon), colon.loc, () => `Expected ${code(':')}`)
				const tokensType = rest2.tail()
				checkNonEmpty(tokensType, () => `Expected something after ${colon}`)
				return parseSpaced(tokensType)
			})
			return new LocalDeclare(token.loc, name, opType, isLazy ? LD_Lazy : LD_Const)
		} else
			return LocalDeclare.plain(token.loc, _parseLocalName(token))
	}

// parseLocalDeclare privates
const
	_parseLocalName = t => {
		if (isKeyword(KW_Focus, t))
			return '_'
		else {
			context.check(t instanceof Name, t.loc, () => `Expected a local name, not ${t}`)
			context.check(!JsGlobals.has(t.name), t.loc, () =>
				`Can not shadow global ${code(t.name)}`)
			return t.name
		}
	}

const parseSingle = token => {
	const { loc } = token
	return token instanceof Name ?
	_access(token.name, loc) :
	token instanceof Group ? (() => {
		const slice = Slice.group(token)
		switch (token.kind) {
			case G_Space:
				return parseSpaced(slice)
			case G_Parenthesis:
				return parseExpr(slice)
			case G_Bracket:
				return new BagSimple(loc, parseExprParts(slice))
			case G_Block:
				return blockWrap(slice)
			case G_Quote:
				return parseQuote(slice)
			default:
				throw new Error(token.kind)
		}
	})() :
	token instanceof NumberLiteral ?
	token :
	token instanceof Keyword ?
		token.kind === KW_Focus ?
			LocalAccess.focus(loc) :
			ifElse(opKeywordKindToSpecialValueKind(token.kind),
				_ => new SpecialVal(loc, _),
				() => unexpected(token)) :
	token instanceof DotName ?
		token.nDots === 1 ? new Member(token.loc, LocalAccess.this(token.loc), token.name) :
		token.nDots === 3 ? new Splat(loc, new LocalAccess(loc, token.name)) :
		unexpected(token) :
	unexpected(token)
}

// parseSingle privates
const _access = (name, loc) =>
	JsGlobals.has(name) ? new GlobalAccess(loc, name) : new LocalAccess(loc, name)

const parseSpaced = tokens => {
	const h = tokens.head(), rest = tokens.tail()
	if (isKeyword(KW_Type, h))
		return Call.contains(h.loc, parseSpaced(rest), LocalAccess.focus(h.loc))
	else if (isKeyword(KW_Lazy, h))
		return new Lazy(h.loc, parseSpaced(rest))
	else {
		let acc = parseSingle(h)
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
						acc = new Call(token.loc, acc, [ LocalAccess.focus(loc) ])
						continue
					case KW_Type: {
						const type = parseSpaced(tokens._chopStart(i + 1))
						return Call.contains(token.loc, type, acc)
					}
					default:
				}
			if (token instanceof Group) {
				const slice = Slice.group(token)
				switch (token.kind) {
					case G_Bracket:
						acc = Call.sub(loc, unshift(acc, parseExprParts(slice)))
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
			context.fail(tokens.loc, `Expected member or sub, not ${token}`)
		}
		return acc
	}
}

const tryParseUses = (k, tokens) => {
	if (!tokens.isEmpty()) {
		const line0 = tokens.headSlice()
		if (isKeyword(k, line0.head()))
			return [ _parseUses(k, line0.tail()), tokens.tail() ]
	}
	return [ [ ], tokens ]
}

// tryParseUse privates
const
	_parseUses = (useKeywordKind, tokens) => {
		const [ before, lines ] = beforeAndBlock(tokens)
		checkEmpty(before, () =>
			`Did not expect anything after ${code(useKeywordKind)} other than a block`)
		return lines.mapSlices(line => {
			const { path, name } = _parseRequire(line.head())
			if (useKeywordKind === KW_UseDo) {
				if (line.size() > 1)
					unexpected(line.second())
				return new UseDo(line.loc, path)
			} else {
				const isLazy = useKeywordKind === KW_UseLazy ||
					useKeywordKind === KW_UseDebug
				const { used, opUseDefault } =
					_parseThingsUsed(name, isLazy, line.tail())
				return new Use(line.loc, path, used, opUseDefault)
			}
		})
	},

	_parseThingsUsed = (name, isLazy, tokens) => {
		const useDefault = () => LocalDeclare.untyped(tokens.loc, name, isLazy ? LD_Lazy : LD_Const)
		if (tokens.isEmpty())
			return { used: [ ], opUseDefault: useDefault() }
		else {
			const [ opUseDefault, rest ] =
				isKeyword(KW_Focus, tokens.head()) ?
					[ useDefault(), tokens.tail() ] :
					[ null, tokens ]
			const used = parseLocalDeclaresJustNames(rest).map(l => {
				context.check(l.name !== '_', l.pos,
					() => `${code('_')} not allowed as import name.`)
				if (isLazy)
					l.kind = LD_Lazy
				return l
			})
			return { used, opUseDefault }
		}
	},

	_parseRequire = t => {
		if (t instanceof Name)
			return { path: t.name, name: t.name }
		else if (t instanceof DotName)
			return { path: push(_partsFromDotName(t), t.name).join('/'), name: t.name }
		else {
			context.check(isGroup(G_Space, t), t.loc, 'Not a valid module name.')
			return _parseLocalRequire(Slice.group(t))
		}
	},

	_parseLocalRequire = tokens => {
		const first = tokens.head()
		let parts
		if (first instanceof DotName)
			parts = _partsFromDotName(first)
		else {
			context.check(first instanceof Name, first.loc, 'Not a valid part of module path.')
			parts = [ ]
		}
		parts.push(first.name)
		tokens.tail().each(token => {
			context.check(token instanceof DotName && token.nDots === 1, token.loc,
				'Not a valid part of module path.')
			parts.push(token.name)
		})
		return { path: parts.join('/'), name: tokens.last().name }
	},

	_partsFromDotName = dotName =>
		dotName.nDots === 1 ? [ '.' ] : repeat('..', dotName.nDots - 1)

const
	_parseFor = ctr => tokens => {
		const [ before, block ] = beforeAndBlock(tokens)
		return new ctr(tokens.loc, _parseOpIteratee(before), parseBlockDo(block))
	},
	_parseOpIteratee = tokens =>
		opIf(!tokens.isEmpty(), () => {
			const [ element, bag ] =
				ifElse(tokens.opSplitOnceWhere(_ => isKeyword(KW_In, _)),
					({ before, after }) => {
						context.check(before.size() === 1, before.loc, 'TODO: pattern in for')
						return [ parseLocalDeclaresJustNames(before)[0], parseExpr(after) ]
					},
					() => [ new LocalDeclareFocus(tokens.loc), parseExpr(tokens) ])
			return new Iteratee(tokens.loc, element, bag)
		})
const
	parseForDo = _parseFor(ForDo),
	parseForVal = _parseFor(ForVal),
	// TODO: -> out-type
	parseForBag = tokens => {
		const [ before, lines ] = beforeAndBlock(tokens)
		const block = parseBlockDo(lines)
		// TODO: Better way?
		if (block.lines.length === 1 && block.lines[0] instanceof Val)
			block.lines[0] = new BagEntry(block.lines[0].loc, block.lines[0])
		return ForBag.of(tokens.loc, _parseOpIteratee(before), block)
	}


const
	parseExcept = (kwExcept, tokens) => {
		const
			isVal = kwExcept === KW_ExceptVal,
			justDoValBlock = isVal ? justBlockVal : justBlockDo,
			parseBlock = isVal ? parseBlockVal : parseBlockDo,
			Except = isVal ? ExceptVal : ExceptDo,
			kwTry = isVal ? KW_TryVal : KW_TryDo,
			kwCatch = isVal ? KW_CatchVal : KW_CatchDo,
			nameTry = () => code(keywordName(kwTry)),
			nameCatch = () => code(keywordName(kwCatch)),
			nameFinally = () => code(keywordName(KW_Finally))

		const lines = justBlock(kwExcept, tokens)

		// `try` *must* come first.
		const firstLine = lines.headSlice()
		const tokenTry = firstLine.head()
		context.check(isKeyword(kwTry, tokenTry), tokenTry.loc, () =>
			`Must start with ${nameTry()}`)
		const _try = justDoValBlock(kwTry, firstLine.tail())

		const restLines = lines.tail()
		checkNonEmpty(restLines, () =>
			`Must have at least one of ${nameCatch()} or ${nameFinally()}`)

		const handleFinally = restLines => {
			const line = restLines.headSlice()
			const tokenFinally = line.head()
			context.check(isKeyword(KW_Finally, tokenFinally), tokenFinally.loc, () =>
				`Expected ${nameFinally()}`)
			context.check(restLines.size() === 1, restLines.loc, () =>
				`Nothing is allowed to come after ${nameFinally()}.`)
			return justBlockDo(KW_Finally, line.tail())
		}

		let _catch, _finally

		const line2 = restLines.headSlice()
		const head2 = line2.head()
		if (isKeyword(kwCatch, head2)) {
			const [ before2, block2 ] = beforeAndBlock(line2.tail())
			const caught = _parseOneLocalDeclareOrFocus(before2)
			_catch = new Catch(line2.loc, caught, parseBlock(block2))
			_finally = opIf(restLines.size() > 1, () => handleFinally(restLines.tail()))
		} else {
			_catch = null
			_finally = handleFinally(restLines)
		}

		return new Except(tokens.loc, _try, _catch, _finally)
	},
	_parseOneLocalDeclareOrFocus = tokens => {
		if (tokens.isEmpty())
			return new LocalDeclareFocus(tokens.loc)
		else {
			context.check(tokens.size() === 1, 'Expected only one local declare.')
			return parseLocalDeclares(tokens)[0]
		}
	}

const parseAssert = (negate, tokens) => {
	checkNonEmpty(tokens, () => `Expected something after ${keywordName(KW_Assert)}.`)

	const [ condTokens, opThrown ] =
		ifElse(tokens.opSplitOnceWhere(_ => isKeyword(KW_Throw, _)),
			({ before, after }) => [ before, parseExpr(after) ],
			() => [ tokens, null ])

	const parts = parseExprParts(condTokens)
	const cond = parts.length === 1 ? parts[0] : new Call(condTokens.loc, parts[0], tail(parts))
	return new Assert(tokens.loc, negate, cond, opThrown)
}

const parseClass = tokens => {
	const [ before, block ] = beforeAndBlock(tokens)
	const opExtended = opIf(!before.isEmpty(), () => parseExpr(before))

	let opDo = null, statics = [ ], opConstructor = null, methods = [ ]

	let rest = block
	const line1 = rest.headSlice()
	if (isKeyword(KW_Do, line1.head())) {
		const done = justBlockDo(KW_Do, line1.tail())
		opDo = new ClassDo(line1.loc, new LocalDeclareFocus(line1.loc, done), done)
		rest = block.tail()
	}
	if (!rest.isEmpty()) {
		const line2 = rest.headSlice()
		if (isKeyword(KW_Static, line2.head())) {
			statics = _parseStatics(line2.tail())
			rest = rest.tail()
		}
		if (!rest.isEmpty()) {
			const line3 = rest.headSlice()
			if (isKeyword(KW_Construct, line3.head())) {
				opConstructor = _parseConstructor(line3.tail())
				rest = rest.tail()
			}
			methods = _parseMethods(rest)
		}
	}

	return new Class(tokens.loc, opExtended, opDo, statics, opConstructor, methods)
}

const
	_parseConstructor = tokens => {
		const { args, opRestArg, block, opIn, opOut } = _funArgsAndBlock(true, tokens)
		const isGenerator = false, opDeclareRes = null
		return new Fun(tokens.loc,
			new LocalDeclareThis(tokens.loc),
			isGenerator,
			args, opRestArg,
			block, opIn, opDeclareRes, opOut)
	},
	_parseStatics = tokens => {
		const block = justBlock(KW_Static, tokens)
		return _parseMethods(block)
	},
	_parseMethods = tokens => tokens.mapSlices(_parseMethod),
	_parseMethod = tokens => {
		const head = tokens.head()

		let kind = MI_Plain
		if (isKeyword(KW_Get, head) || isKeyword(KW_Set, head)) {
			kind = head.kind === KW_Get ? MI_Get : MI_Set
			tokens = tokens.tail()
		}

		const baa = tokens.opSplitOnceWhere(_isFunKeyword)
		context.check(baa !== null, tokens.loc, 'Expected a function keyword somewhere.')
		const { before, at, after } = baa

		const fun = parseFun(_methodFunKind(at), after)
		assert(fun.opName === null)

		let symbol = parseExpr(before)
		// If symbol is just a literal string, store it as a string, which is handled specially.
		if (symbol instanceof Quote &&
			symbol.parts.length === 1 &&
			typeof symbol.parts[0] === 'string')
			symbol = symbol.parts[0]

		return new MethodImpl(tokens.loc, kind, symbol, fun)
	},
	_methodFunKind = funKindToken => {
		switch (funKindToken.kind) {
			case KW_Fun: return KW_FunThis
			case KW_FunDo: return KW_FunThisDo
			case KW_FunGen: return KW_FunThisGen
			case KW_FunGenDo: return KW_FunThisGenDo
			case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen: case KW_FunThisGenDo:
				context.fail(funKindToken.loc, 'Function `.` is implicit for methods.')
			default:
				context.fail(funKindToken.loc, `Expected function kind, got ${funKindToken}`)
		}
	},
	_isFunKeyword = funKindToken => {
		if (funKindToken instanceof Keyword)
			switch (funKindToken.kind) {
				case KW_Fun: case KW_FunDo: case KW_FunGen: case KW_FunGenDo:
				case KW_FunThis: case KW_FunThisDo: case KW_FunThisGen:
				case KW_FunThisGenDo:
					return true
				default:
					return false
			}
		else
			return false
	}

const parseQuote = tokens =>
	new Quote(tokens.loc, tokens.map(_ => (typeof _ === 'string') ? _ : parseSingle(_)))

const parseWith = tokens => {
	const [ before, block ] = beforeAndBlock(tokens)

	const [ val, declare ] = ifElse(before.opSplitOnceWhere(_ => isKeyword(KW_As, _)),
		({ before, after }) => {
			context.check(after.size() === 1, () => `Expected only 1 token after ${code('as')}.`)
			return [ parseExprPlain(before), parseLocalDeclare(after.head()) ]
		},
		() => [ parseExprPlain(before), new LocalDeclareFocus(tokens.loc) ])

	return new With(tokens.loc, declare, val, parseBlockDo(block))
}

const parseIgnore = tokens => {
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

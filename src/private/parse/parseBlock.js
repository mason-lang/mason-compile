import {check, options} from '../context'
import {AssignSingle, BagEntry, BagEntryMany, BlockBag, BlockDo, BlockObj, BlockMap,
	BlockValReturn, BlockValThrow, BlockWrap, MapEntry, ModuleExportDefault, ModuleExportNamed,
	ObjEntry, ObjEntryAssign, Throw, Val} from '../MsAst'
import {Groups, isGroup, isAnyKeyword, Keyword, Keywords, showKeyword} from '../Token'
import {ifElse} from '../util'
import {checkEmpty, checkNonEmpty} from './checks'
import {parseExpr} from './parse*'
import parseLine, {parseBagEntry, parseBagEntryMany, parseMapEntry, parseObjEntry, parseThrow,
	parseLineOrLines} from './parseLine'
import tryTakeComment from './tryTakeComment'
import Slice from './Slice'

/**
Tokens on the line before a block, and tokens for the block itself.
@return {[Slice, Slice]}
*/
export function beforeAndBlock(tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	check(opBlock !== null, opBlock.loc, 'Expected an indented block at the end.')
	return [before, opBlock]
}

export function beforeAndOpBlock(tokens) {
	if (tokens.isEmpty())
		return [tokens, null]
	else {
		const block = tokens.last()
		return isGroup(Groups.Block, block) ? [tokens.rtail(), Slice.group(block)] : [tokens, null]
	}
}

/** Parse a Block as a single value. */
export function parseBlockWrap(tokens) {
	return new BlockWrap(tokens.loc, parseBlockVal(tokens))
}

/**
Parse a block, throwing an error if there's anything before the block.
@param {Keywords} keywordKind Keyword that precedes the block. Used for error message.
@param {Slice} tokens
	Tokens which should contain a block.
	Unlike {@link parseBlockDo}, these are *not* the tokens *within* the block.
	These tokens are *expected* to just be a {@link Groups.Block}.
	(If there's anything else, a {@link CompileError} will be thrown.)
*/
export function justBlock(keywordKind, tokens) {
	const [before, block] = beforeAndBlock(tokens)
	checkEmpty(before, () =>
		`Did not expect anything between ${showKeyword(keywordKind)} and block.`)
	return block
}

/**
Parse a {@link BlockVal} if `isVal`, else a {@link BlockDo},
failing if there's something preciding it.
*/
export function parseJustBlockDoOrVal(isVal, keyword, tokens) {
	return (isVal ? parseJustBlockVal : parseJustBlockDo)(keyword, tokens)
}

/** Parse a {@link BlockDo}, failing if there's something preceding it. */
export function parseJustBlockDo(keyword, tokens) {
	return parseBlockDo(justBlock(keyword, tokens))
}

/** Parse a {@link BlockVal}, failing if there's something preceding it. */
function parseJustBlockVal(keyword, tokens) {
	return parseBlockVal(justBlock(keyword, tokens))
}

/**
Get lines in a region.
@return {Array<MsAst>}
*/
export function parseLinesFromBlock(tokens) {
	const h = tokens.head()
	check(tokens.size() > 1 && tokens.size() === 2 && isGroup(Groups.Block, tokens.second()),
		h.loc, () =>
		`Expected indented block after ${h}, and nothing else.`)
	const block = tokens.second()

	const lines = []
	for (const line of Slice.group(block).slices())
		lines.push(...parseLineOrLines(line))
	return lines
}

/** Parse a {@link BlockVal} if `isVal`, else a {@link BlockDo}. */
export function parseBlockDoOrVal(isVal, tokens) {
	return (isVal ? parseBlockVal : parseBlockDo)(tokens)
}

/** Parse a {@link BlockDo}. */
export function parseBlockDo(tokens) {
	const [opComment, rest] = tryTakeComment(tokens)
	const lines = plainBlockLines(rest)
	return new BlockDo(tokens.loc, opComment, lines)
}

/** Parse a {@link BlockVal}. */
export function parseBlockVal(tokens) {
	const [opComment, rest] = tryTakeComment(tokens)
	checkNonEmpty(rest, 'Value block needs at least one line.')
	const {kind, lines, lastLine} = parseBlockKind(rest)

	if (kind === Blocks.Plain) {
		const ctr = lastLine instanceof Throw ? BlockValThrow : BlockValReturn
		return new ctr(tokens.loc, opComment, lines, lastLine)
	} else
		return new (blockConstructor(kind))(tokens.loc, opComment, lines)
}

/**
Parse the body of a module.
@return {Array<MsAst>}
*/
export function parseModuleBlock(tokens) {
	if (tokens.isEmpty())
		return []

	const loc = tokens.loc
	const name = options.moduleName()
	const {kind, lines, lastLine} = parseBlockKind(tokens, true)
	switch (kind) {
		case Blocks.Bag: case Blocks.Map: {
			const val = new BlockWrap(loc, new (blockConstructor(kind))(loc, null, lines))
			return [ModuleExportDefault.forVal(loc, name, val)]
		}
		case Blocks.Obj:
			return lines.map(line => {
				if (line instanceof ObjEntry) {
					check(line instanceof ObjEntryAssign, line.loc,
						'Module exports can not be computed.')
					check(line.assign instanceof AssignSingle, line.loc,
						'Export AssignDestructure not yet supported.')
					return line.assign.assignee.name === name ?
						new ModuleExportDefault(line.loc, line.assign) :
						new ModuleExportNamed(line.loc, line.assign)
				} else
					// TODO: If Region, line.lines = line.lines.map(convertToExports)
					return line
			})
		case Blocks.Plain:
			if (lastLine instanceof Val)
				lines.push(ModuleExportDefault.forVal(loc, name, lastLine))
			else
				lines.push(lastLine)
			return lines
		default:
			throw new Error(kind)
	}
}

function plainBlockLines(lineTokens) {
	const lines = []
	for (const _ of lineTokens.slices())
		addLine(lines, parseLine(_))
	return lines
}

function addLine(lines, line) {
	if (line instanceof Array)
		for (const _ of line)
			addLine(lines, _)
	else
		lines.push(line)
}

const Blocks = {
	Bag: 0,
	Map: 1,
	Obj: 2,
	Plain: 3
}

function blockConstructor(kind) {
	switch (kind) {
		case Blocks.Bag:
			return BlockBag
		case Blocks.Map:
			return BlockMap
		case Blocks.Obj:
			return BlockObj
		default:
			throw new Error(kind)
	}
}

function parseBlockKind(tokens, allowLastStatement) {
	const lines = plainBlockLines(tokens.rtail())
	const last = Slice.group(tokens.last())
	let isBag = false, isMap = false, isObj = false
	const checkLine = line => {
		// TODO: if Region, loop over its lines
		if (line instanceof BagEntry || line instanceof BagEntryMany)
			isBag = true
		else if (line instanceof MapEntry)
			isMap = true
		else if (line instanceof ObjEntry)
			isObj = true
	}
	for (const _ of lines)
		checkLine(_)

	const lastLine = allowLastStatement || isObj || isBag || isMap ?
		parseLine(last) :
		parseBuilderOrVal(last)
	checkLine(lastLine)

	check(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.')
	check(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.')
	check(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.')

	const kind = isBag ? Blocks.Bag : isMap ? Blocks.Map : isObj ? Blocks.Obj : Blocks.Plain

	if (kind !== Blocks.Plain) {
		addLine(lines, lastLine)
		return {kind, lines}
	} else
		return {kind, lines, lastLine}
}

/*
Gets value or builder statement.
Does not get e.g. if statement; gets if value instead
*/
function parseBuilderOrVal(tokens) {
	const loc = tokens.loc
	const head = tokens.head()
	const rest = () => tokens.tail()

	if (head instanceof Keyword)
		switch (head.kind) {
			case Keywords.Dot3:
				return parseBagEntryMany(rest(), loc)
			case Keywords.ObjAssign:
				return parseBagEntry(rest(), loc)
			case Keywords.Throw:
				return parseThrow(rest(), loc)
			default:
				// fall through
		}

	return ifElse(tokens.opSplitOnce(_ => isAnyKeyword(builderSplitKeywords, _)),
		({before, at, after}) =>
			(at.kind === Keywords.MapEntry ? parseMapEntry : parseObjEntry)(before, after, loc),
		() => parseExpr(tokens))
}

const builderSplitKeywords = new Set([Keywords.MapEntry, Keywords.ObjAssign])


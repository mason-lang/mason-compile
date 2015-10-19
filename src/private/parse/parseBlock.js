import {code} from '../../CompileError'
import {check, options} from '../context'
import {AssignSingle, BagEntry, BlockBag, BlockDo, BlockObj, BlockMap, BlockValReturn,
	BlockValThrow, BlockWrap, LocalDeclare, MapEntry, ModuleExportDefault, ModuleExportNamed,
	ObjEntry, ObjEntryAssign, Throw, Val} from '../MsAst'
import {Groups, isGroup, keywordName} from '../Token'
import {isEmpty, last, rtail} from '../util'
import {checkEmpty, checkNonEmpty} from './checks'
import parseLine, {parseLineOrLines} from './parseLine'
import tryTakeComment from './tryTakeComment'
import Slice from './Slice'

/**
Tokens on the line before a block, and tokens for the block itself.
@return {[Slice, Slice]}
*/
export function beforeAndBlock(tokens) {
	checkNonEmpty(tokens, 'Expected an indented block.')
	const block = tokens.last()
	check(isGroup(Groups.Block, block), block.loc, 'Expected an indented block.')
	return [tokens.rtail(), Slice.group(block)]
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
		`Did not expect anything between ${code(keywordName(keywordKind))} and block.`)
	return block
}

/** Parse a {@link BlockDo}, failing if there's something preceding it. */
export function parseJustBlockDo(keyword, tokens) {
	return parseBlockDo(justBlock(keyword, tokens))
}

/** Parse a {@link BlockVal}, failing if there's something preceding it. */
export function parseJustBlockVal(keyword, tokens) {
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

/** Parse a {@link BlockDo}. */
export function parseBlockDo(tokens) {
	const [opComment, rest] = tryTakeComment(tokens)
	const lines = plainBlockLines(rest)
	return new BlockDo(tokens.loc, opComment, lines)
}

/** Parse a {@link BlockVal}. */
export function parseBlockVal(tokens) {
	const [opComment, rest] = tryTakeComment(tokens)
	const {lines, returnKind} = parseBlockLines(rest)
	switch (returnKind) {
		case Returns.Bag:
			return new BlockBag(tokens.loc, opComment, lines)
		case Returns.Map:
			return new BlockMap(tokens.loc, opComment, lines)
		case Returns.Obj:
			return new BlockObj(tokens.loc, opComment, lines)
		default: {
			check(!isEmpty(lines), tokens.loc, 'Value block must end in a value.')
			const val = last(lines)
			if (val instanceof Throw)
				return new BlockValThrow(tokens.loc, opComment, rtail(lines), val)
			else {
				check(val instanceof Val, val.loc, 'Value block must end in a value.')
				return new BlockValReturn(tokens.loc, opComment, rtail(lines), val)
			}
		}
	}
}

/**
Parse the body of a module.
@return {Array<MsAst>}
*/
export function parseModuleBlock(tokens) {
	const {lines, returnKind} = parseBlockLines(tokens, true)
	const opComment = null
	const loc = tokens.loc
	switch (returnKind) {
		case Returns.Bag: case Returns.Map: {
			const cls = returnKind === Returns.Bag ? BlockBag : BlockMap
			const block = new cls(loc, opComment, lines)
			const val = new BlockWrap(loc, block)
			const assignee = LocalDeclare.plain(loc, options.moduleName())
			const assign = new AssignSingle(loc, assignee, val)
			return [new ModuleExportDefault(loc, assign)]
		}
		case Returns.Obj: {
			const moduleName = options.moduleName()

			// Module exports look like a BlockObj,  but are really different.
			// In ES6, module exports must be completely static.
			// So we keep an array of exports attached directly to the Module ast.
			// If you write:
			//	if! cond
			//		a. b
			// in a module context, it will be an error. (The module creates no `built` local.)
			const convertToExports = line => {
				if (line instanceof ObjEntry) {
					check(line instanceof ObjEntryAssign, line.loc,
						'Module exports can not be computed.')
					check(line.assign instanceof AssignSingle, line.loc,
						'Export AssignDestructure not yet supported.')
					return line.assign.assignee.name === moduleName ?
						new ModuleExportDefault(line.loc, line.assign) :
						new ModuleExportNamed(line.loc, line.assign)
				}
				// TODO: If Region, line.lines = line.lines.map(convertToExports)
				return line
			}

			return lines.map(convertToExports)
		}
		default: {
			const [moduleLines, opDefaultExport] = tryTakeLastVal(lines)
			if (opDefaultExport !== null) {
				const _ = opDefaultExport
				moduleLines.push(new ModuleExportDefault(_.loc,
					new AssignSingle(_.loc,
						LocalDeclare.plain(opDefaultExport.loc, options.moduleName()),
						_)))
			}
			return moduleLines
		}
	}
}

function tryTakeLastVal(lines) {
	return !isEmpty(lines) && last(lines) instanceof Val ?
		[rtail(lines), last(lines)] :
		[lines, null]
}

function plainBlockLines(lineTokens) {
	const lines = []
	const addLine = line => {
		if (line instanceof Array)
			for (const _ of line)
				addLine(_)
		else
			lines.push(line)
	}
	for (const _ of lineTokens.slices())
		addLine(parseLine(_))
	return lines
}

const Returns = {
	Plain: 0,
	Obj: 1,
	Bag: 2,
	Map: 3
}

function parseBlockLines(lineTokens) {
		let isBag = false, isMap = false, isObj = false
	const checkLine = line => {
		// TODO: if Region, loop over its lines
		if (line instanceof BagEntry)
			isBag = true
		else if (line instanceof MapEntry)
			isMap = true
		else if (line instanceof ObjEntry)
			isObj = true
	}
	const lines = plainBlockLines(lineTokens)
	for (const _ of lines)
		checkLine(_)

	check(!(isObj && isBag), lines.loc, 'Block has both Bag and Obj lines.')
	check(!(isObj && isMap), lines.loc, 'Block has both Obj and Map lines.')
	check(!(isBag && isMap), lines.loc, 'Block has both Bag and Map lines.')

	const returnKind =
		isObj ? Returns.Obj : isBag ? Returns.Bag : isMap ? Returns.Map : Returns.Plain
	return {lines, returnKind}
}

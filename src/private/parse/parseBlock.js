import {code} from '../../CompileError'
import {check, options} from '../context'
import {AssignSingle, BagEntry, BlockBag, BlockDo, BlockObj, BlockMap, BlockValThrow,
	BlockWithReturn, BlockWrap, LocalDeclare, MapEntry, ModuleExportDefault, ModuleExportNamed,
	ObjEntry, ObjEntryAssign, Throw, Val} from '../MsAst'
import {G_Block, isGroup, keywordName} from '../Token'
import {isEmpty, last, rtail} from '../util'
import {checkEmpty, checkNonEmpty} from './checks'
import parseLine, {parseLineOrLines} from './parseLine'
import tryTakeComment from './tryTakeComment'
import Slice from './Slice'

export const
	// Tokens on the line before a block, and tokens for the block itself.
	beforeAndBlock = tokens => {
		checkNonEmpty(tokens, 'Expected an indented block.')
		const block = tokens.last()
		check(isGroup(G_Block, block), block.loc, 'Expected an indented block.')
		return [tokens.rtail(), Slice.group(block)]
	},

	blockWrap = tokens => new BlockWrap(tokens.loc, parseBlockVal(tokens)),

	justBlock = (keyword, tokens) => {
		const [before, block] = beforeAndBlock(tokens)
		checkEmpty(before, () =>
			`Did not expect anything between ${code(keywordName(keyword))} and block.`)
		return block
	},
	justBlockDo = (keyword, tokens) =>
		parseBlockDo(justBlock(keyword, tokens)),
	justBlockVal = (keyword, tokens) =>
		parseBlockVal(justBlock(keyword, tokens)),

	// Gets lines in a region.
	parseLinesFromBlock = tokens => {
		const h = tokens.head()
		check(tokens.size() > 1 && tokens.size() === 2 && isGroup(G_Block, tokens.second()),
			h.loc, () =>
			`Expected indented block after ${h}, and nothing else.`)
		const block = tokens.second()

		const lines = []
		for (const line of Slice.group(block).slices())
			lines.push(...parseLineOrLines(line))
		return lines
	},

	parseBlockDo = tokens => {
		const [opComment, rest] = tryTakeComment(tokens)
		const lines = plainBlockLines(rest)
		return new BlockDo(tokens.loc, opComment, lines)
	},

	parseBlockVal = tokens => {
		const [opComment, rest] = tryTakeComment(tokens)
		const {lines, kReturn} = parseBlockLines(rest)
		switch (kReturn) {
			case KReturn_Bag:
				return new BlockBag(tokens.loc, opComment, lines)
			case KReturn_Map:
				return new BlockMap(tokens.loc, opComment, lines)
			case KReturn_Obj:
				return new BlockObj(tokens.loc, opComment, lines)
			default: {
				check(!isEmpty(lines), tokens.loc, 'Value block must end in a value.')
				const val = last(lines)
				if (val instanceof Throw)
					return new BlockValThrow(tokens.loc, opComment, rtail(lines), val)
				else {
					check(val instanceof Val, val.loc, 'Value block must end in a value.')
					return new BlockWithReturn(tokens.loc, opComment, rtail(lines), val)
				}
			}
		}
	},

	parseModuleBlock = tokens => {
		const {lines, kReturn} = parseBlockLines(tokens, true)
		const opComment = null
		const loc = tokens.loc
		switch (kReturn) {
			case KReturn_Bag: case KReturn_Map: {
				const cls = kReturn === KReturn_Bag ? BlockBag : BlockMap
				const block = new cls(loc, opComment, lines)
				const val = new BlockWrap(loc, block)
				const assignee = LocalDeclare.plain(loc, options.moduleName())
				const assign = new AssignSingle(loc, assignee, val)
				return [new ModuleExportDefault(loc, assign)]
			}
			case KReturn_Obj: {
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

const
	tryTakeLastVal = lines =>
		!isEmpty(lines) && last(lines) instanceof Val ?
			[rtail(lines), last(lines)] :
			[lines, null],

	plainBlockLines = lineTokens => {
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
	},

	KReturn_Plain = 0,
	KReturn_Obj = 1,
	KReturn_Bag = 2,
	KReturn_Map = 3,
	parseBlockLines = lineTokens => {
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

		const kReturn =
			isObj ? KReturn_Obj : isBag ? KReturn_Bag : isMap ? KReturn_Map : KReturn_Plain
		return {lines, kReturn}
	}

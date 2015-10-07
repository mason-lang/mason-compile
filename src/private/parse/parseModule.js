import {code} from '../../CompileError'
import {AssignSingle, ImportDo, ImportGlobal, Import, LD_Const, LD_Lazy, LocalDeclare,
	LocalDeclareName, Module, ModuleExportNamed, Quote} from '../MsAst'
import {DotName, G_Space, isGroup, isKeyword, Name, KW_Focus, KW_Import, KW_ImportDebug,
		KW_ImportDo, KW_ImportLazy} from '../Token'
import {cat, repeat} from '../util'
import {context, unexpected} from './context'
import {justBlock, parseModuleBlock} from './parseBlock'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'
import Slice from './Slice'
import tryTakeComment from './tryTakeComment'

export default tokens => {
	// Module doc comment must come first.
	const [opComment, rest0] = tryTakeComment(tokens)
	// Import statements must appear in order.
	const {imports: doImports, rest: rest1} = tryParseImports(KW_ImportDo, rest0)
	const {imports: plainImports, opImportGlobal, rest: rest2} = tryParseImports(KW_Import, rest1)
	const {imports: lazyImports, rest: rest3} = tryParseImports(KW_ImportLazy, rest2)
	const {imports: debugImports, rest: rest4} = tryParseImports(KW_ImportDebug, rest3)

	const lines = parseModuleBlock(rest4)

	if (context.opts.includeModuleName()) {
		const name = new LocalDeclareName(tokens.loc)
		const assign = new AssignSingle(tokens.loc, name,
			Quote.forString(tokens.loc, context.opts.moduleName()))
		lines.push(new ModuleExportNamed(tokens.loc, assign))
	}

	const imports = plainImports.concat(lazyImports)
	return new Module(
		tokens.loc, opComment, doImports, imports, opImportGlobal, debugImports, lines)
}

const
	tryParseImports = (importKeywordKind, tokens) => {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice()
			if (isKeyword(importKeywordKind, line0.head())) {
				const {imports, opImportGlobal} = parseImports(importKeywordKind, line0.tail())
				if (importKeywordKind !== KW_Import)
					context.check(opImportGlobal === null, line0.loc, 'Can\'t use global here.')
				return {imports, opImportGlobal, rest: tokens.tail()}
			}
		}
		return {imports: [], opImportGlobal: null, rest: tokens}
	},

	parseImports = (importKeywordKind, tokens) => {
		const lines = justBlock(importKeywordKind, tokens)
		let opImportGlobal = null

		const imports = []

		for (const line of lines.slices()) {
			const {path, name} = parseRequire(line.head())
			if (importKeywordKind === KW_ImportDo) {
				if (line.size() > 1)
					unexpected(line.second())
				imports.push(new ImportDo(line.loc, path))
			} else
				if (path === 'global') {
					context.check(opImportGlobal === null, line.loc, 'Can\'t use global twice')
					const {imported, opImportDefault} =
						parseThingsImported(name, false, line.tail())
					opImportGlobal = new ImportGlobal(line.loc, imported, opImportDefault)
				} else {
					const isLazy =
						importKeywordKind === KW_ImportLazy || importKeywordKind === KW_ImportDebug
					const {imported, opImportDefault} =
						parseThingsImported(name, isLazy, line.tail())
					imports.push(new Import(line.loc, path, imported, opImportDefault))
				}
		}

		return {imports, opImportGlobal}
	},

	parseThingsImported = (name, isLazy, tokens) => {
		const importDefault = () =>
			LocalDeclare.untyped(tokens.loc, name, isLazy ? LD_Lazy : LD_Const)
		if (tokens.isEmpty())
			return {imported: [], opImportDefault: importDefault()}
		else {
			const [opImportDefault, rest] = isKeyword(KW_Focus, tokens.head()) ?
				[importDefault(), tokens.tail()] :
				[null, tokens]
			const imported = parseLocalDeclaresJustNames(rest).map(l => {
				context.check(l.name !== '_', l.pos,
					() => `${code('_')} not allowed as import name.`)
				if (isLazy)
					l.kind = LD_Lazy
				return l
			})
			return {imported, opImportDefault}
		}
	},

	parseRequire = t => {
		if (t instanceof Name)
			return {path: t.name, name: t.name}
		else if (t instanceof DotName)
			return {path: cat(partsFromDotName(t), t.name).join('/'), name: t.name}
		else {
			context.check(isGroup(G_Space, t), t.loc, 'Not a valid module name.')
			return parseSpacedRequire(Slice.group(t))
		}
	},

	parseSpacedRequire = tokens => {
		const first = tokens.head()
		let parts
		if (first instanceof DotName)
			parts = partsFromDotName(first)
		else {
			context.check(first instanceof Name, first.loc, 'Not a valid part of module path.')
			parts = []
		}
		parts.push(first.name)
		for (const token of tokens.tail()) {
			context.check(token instanceof DotName && token.nDots === 1, token.loc,
				'Not a valid part of module path.')
			parts.push(token.name)
		}
		return {path: parts.join('/'), name: tokens.last().name}
	},

	partsFromDotName = dotName =>
		dotName.nDots === 1 ? ['.'] : repeat('..', dotName.nDots - 1)

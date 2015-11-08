import {check, options} from '../context'
import {ImportDo, ImportGlobal, Import, LocalDeclare, LocalDeclares, Module} from '../MsAst'
import {Groups, isGroup, isKeyword, Keyword, Keywords, showKeyword} from '../Token'
import {checkNonEmpty, unexpected} from './checks'
import {justBlock} from './parseBlock'
import {parseLines} from './parseLine'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'
import parseName, {tryParseName} from './parseName'
import Slice from './Slice'
import tryTakeComment from './tryTakeComment'

/**
Parse the whole Token tree.
@param {Slice} tokens
@return {Module}
*/
export default function parseModule(tokens) {
	// Module doc comment must come first.
	const [opComment, rest0] = tryTakeComment(tokens)
	// Import statements must appear in order.
	const {imports: doImports, rest: rest1} = tryParseImports(Keywords.ImportDo, rest0)
	const {imports: plainImports, opImportGlobal, rest: rest2} =
		tryParseImports(Keywords.Import, rest1)
	const {imports: lazyImports, rest: rest3} = tryParseImports(Keywords.ImportLazy, rest2)
	const lines = parseLines(rest3)
	const imports = plainImports.concat(lazyImports)
	return new Module(
		tokens.loc, options.moduleName(), opComment, doImports, imports, opImportGlobal, lines)
}

function tryParseImports(importKeywordKind, tokens) {
	if (!tokens.isEmpty()) {
		const line0 = tokens.headSlice()
		if (isKeyword(importKeywordKind, line0.head())) {
			const {imports, opImportGlobal} = parseImports(importKeywordKind, line0.tail())
			if (importKeywordKind !== Keywords.Import)
				check(opImportGlobal === null, line0.loc, 'Can\'t use global here.')
			return {imports, opImportGlobal, rest: tokens.tail()}
		}
	}
	return {imports: [], opImportGlobal: null, rest: tokens}
}

function parseImports(importKeywordKind, tokens) {
	const lines = justBlock(importKeywordKind, tokens)
	let opImportGlobal = null

	const imports = []

	for (const line of lines.slices()) {
		const {path, name} = parseRequire(line.head())
		if (importKeywordKind === Keywords.ImportDo) {
			if (line.size() > 1)
				unexpected(line.second())
			imports.push(new ImportDo(line.loc, path))
		} else
			if (path === 'global') {
				check(opImportGlobal === null, line.loc, 'Can\'t use global twice')
				const {imported, opImportDefault} =
					parseThingsImported(name, false, line.tail())
				opImportGlobal = new ImportGlobal(line.loc, imported, opImportDefault)
			} else {
				const {imported, opImportDefault} =
					parseThingsImported(
						name,
						importKeywordKind === Keywords.ImportLazy,
						line.tail())
				imports.push(new Import(line.loc, path, imported, opImportDefault))
			}
	}

	return {imports, opImportGlobal}
}

function parseThingsImported(name, isLazy, tokens) {
	const importDefault = () =>
		LocalDeclare.untyped(
			tokens.loc,
			name,
			isLazy ? LocalDeclares.Lazy : LocalDeclares.Const)

	if (tokens.isEmpty())
		return {imported: [], opImportDefault: importDefault()}
	else {
		const [opImportDefault, rest] = isKeyword(Keywords.Focus, tokens.head()) ?
			[importDefault(), tokens.tail()] :
			[null, tokens]
		const imported = parseLocalDeclaresJustNames(rest).map(l => {
			check(l.name !== '_', l.pos, () =>
				`${showKeyword(Keywords.Focus)} not allowed as import name.`)
			if (isLazy)
				l.kind = LocalDeclares.Lazy
			return l
		})
		return {imported, opImportDefault}
	}
}

function parseRequire(token) {
	const name = tryParseName(token)
	if (name !== null)
		return {path: name, name}
	else {
		check(isGroup(Groups.Space, token), token.loc, 'Not a valid module name.')
		const tokens = Slice.group(token)

		// Take leading dots.
		let rest = tokens
		const parts = []
		const head = rest.head()
		const n = tryTakeNDots(head)
		if (n !== null) {
			parts.push('.')
			for (let i = 1; i < n; i = i + 1)
				parts.push('..')
			rest = rest.tail()
			while (!rest.isEmpty()) {
				const n = tryTakeNDots(rest.head())
				if (n === null)
					break
				for (let i = 0; i < n; i = i + 1)
					parts.push('..')
				rest = rest.tail()
			}
		}

		// Take name, then any number of dot-then-name (`.x`)
		for (;;) {
			checkNonEmpty(rest)
			parts.push(parseName(rest.head()))
			rest = rest.tail()

			if (rest.isEmpty())
				break

			// If there's something left, it should be a dot, followed by a name.
			if (!isKeyword(Keywords.Dot, rest.head()))
				unexpected(rest.head())
			rest = rest.tail()
		}

		return {path: parts.join('/'), name: parts[parts.length - 1]}
	}
}

function tryTakeNDots(token) {
	if (!(token instanceof Keyword))
		return null
	switch (token.kind) {
		case Keywords.Dot:
			return 1
		case Keywords.Dot2:
			return 2
		case Keywords.Dot3:
			return 3
		default:
			return null
	}
}

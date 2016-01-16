import Op, {caseOp, opEach} from 'op/Op'
import {LocalDeclare, LocalDeclares} from '../ast/locals'
import Module, {Import, ImportDo} from '../ast/Module'
import {check, fail, pathOptions} from '../context'
import {GroupSpace} from '../token/Group'
import Keyword, {isKeyword, Keywords} from '../token/Keyword'
import Token from '../token/Token'
import {checkEmpty, checkNonEmpty, checkKeyword} from './checks'
import {justBlock} from './parseBlock'
import {parseLines} from './parseLine'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'
import parseName, {tryParseName} from './parseName'
import {Lines, Tokens} from './Slice'
import tryTakeComment from './tryTakeComment'

/** Parse the whole Token tree. */
export default function parseModule(lines: Lines): Module {
	// Module doc comment must come first.
	const [opComment, rest0] = tryTakeComment(lines)
	// Import statements must appear in this order: `import!`, `import`, `import~`.
	const [doImports, rest1] = takeImportDos(rest0)
	const [plainImports, rest2] = takeImports(Keywords.Import, rest1)
	const [lazyImports, rest3] = takeImports(Keywords.ImportLazy, rest2)
	const moduleLines = parseLines(rest3)
	const imports = plainImports.concat(lazyImports)
	return new Module(lines.loc, pathOptions.moduleName, opComment, doImports, imports, moduleLines)
}

function takeImports(importKeywordKind: Keywords, lines: Lines): [Array<Import>, Lines] {
	if (!lines.isEmpty()) {
		const line = lines.headSlice()
		if (isKeyword(importKeywordKind, line.head()))
			return [parseImports(importKeywordKind, line.tail()), lines.tail()]
	}
	return [[], lines]
}

function parseImports(importKeywordKind: Keywords, tokens: Tokens): Array<Import> {
	const lines = justBlock(importKeywordKind, tokens)
	return lines.mapSlices(line => {
		const {path, name} = parseRequire(line.head())
		const rest = line.tail()
		const {imported, opImportDefault} =
			parseThingsImported(rest, name, importKeywordKind === Keywords.ImportLazy)
		return new Import(line.loc, path, imported, opImportDefault)
	})
}

function takeImportDos(lines: Lines): [Array<ImportDo>, Lines] {
	if (!lines.isEmpty()) {
		const line = lines.headSlice()
		if (isKeyword(Keywords.ImportDo, line.head()))
			return [parseImportDos(line.tail()), lines.tail()]
	}
	return [[], lines]
}

function parseImportDos(tokens: Tokens): Array<ImportDo> {
	const lines = justBlock(Keywords.ImportDo, tokens)
	return lines.mapSlices(line => {
		const [{path}, rest] = takeRequire(line)
		checkEmpty(rest, _ => _.unexpectedAfterImportDo)
		return new ImportDo(line.loc, path)
	})
}

function parseThingsImported(tokens: Tokens, name: string, isLazy: boolean)
	: {imported: Array<LocalDeclare>, opImportDefault: Op<LocalDeclare>} {
	const importDefault = () =>
		LocalDeclare.untyped(
			tokens.loc,
			name,
			isLazy ? LocalDeclares.Lazy : LocalDeclares.Eager)

	if (tokens.isEmpty())
		return {imported: [], opImportDefault: importDefault()}
	else {
		const [opImportDefault, rest] = isKeyword(Keywords.Focus, tokens.head()) ?
			[importDefault(), tokens.tail()] :
			[null, tokens]
		const imported = parseLocalDeclaresJustNames(rest).map(l => {
			check(l.name !== '_', l.loc, _ => _.noImportFocus)
			if (isLazy)
				l.kind = LocalDeclares.Lazy
			return l
		})
		return {imported, opImportDefault}
	}
}

function takeRequire(tokens: Tokens): [{path: string, name: string}, Tokens] {
	return [parseRequire(tokens.head()), tokens.tail()]
}

function parseRequire(token: Token): {path: string, name: string} {
	return caseOp(
		tryParseName(token),
		name => ({path: name, name}),
		() => {
			if (token instanceof GroupSpace) {
				const tokens = Tokens.of(token)

				// Take leading dots.
				let rest = tokens
				const parts: Array<string> = []
				const head = rest.head()
				opEach(tryTakeNDots(head), n => {
					parts.push('.')
					for (let i = 1; i < n; i = i + 1)
						parts.push('..')
					rest = rest.tail()
					while (!rest.isEmpty()) {
						const n = tryTakeNDots(rest.head())
						if (n === null)
							break
						else {
							for (let i = 0; i < n; i = i + 1)
								parts.push('..')
							rest = rest.tail()
						}
					}
				})

				// Take name, then any number of dot-then-name (`.x`)
				while (true) {
					checkNonEmpty(rest, _ => _.expectedImportModuleName)
					parts.push(parseName(rest.head()))
					rest = rest.tail()

					if (rest.isEmpty())
						break

					// If there's something left, it should be a dot, followed by a name.
					checkKeyword(Keywords.Dot, rest.head())
					rest = rest.tail()
				}

				return {path: parts.join('/'), name: parts[parts.length - 1]}
			} else
				fail(token.loc, _ => _.invalidImportModule)
		})
}

function tryTakeNDots(token: Token): Op<number> {
	if (token instanceof Keyword)
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
	else
		return null
}

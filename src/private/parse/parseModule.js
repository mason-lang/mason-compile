import {check, pathOptions} from '../context'
import {ImportDo, Import, LocalDeclare, LocalDeclares, Module} from '../MsAst'
import {Groups, isGroup, isKeyword, Keyword, Keywords, showKeyword} from '../Token'
import {ifElse} from '../util'
import {checkEmpty, checkNonEmpty, checkKeyword} from './checks'
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
	const [doImports, rest1] = takeImports(Keywords.ImportDo, rest0)
	const [plainImports, rest2] = takeImports(Keywords.Import, rest1)
	const [lazyImports, rest3] = takeImports(Keywords.ImportLazy, rest2)
	const lines = parseLines(rest3)
	const imports = plainImports.concat(lazyImports)
	return new Module(tokens.loc, pathOptions.moduleName(), opComment, doImports, imports, lines)
}

function takeImports(importKeywordKind, lines) {
	if (!lines.isEmpty()) {
		const line = lines.headSlice()
		if (isKeyword(importKeywordKind, line.head()))
			return [parseImports(importKeywordKind, line.tail()), lines.tail()]
	}
	return [[], lines]
}

function parseImports(importKeywordKind, tokens) {
	const lines = justBlock(importKeywordKind, tokens)
	return lines.mapSlices(line => {
		const {path, name} = parseRequire(line.head())
		const rest = line.tail()
		if (importKeywordKind === Keywords.ImportDo) {
			checkEmpty(rest, () =>
				`This is an ${showKeyword(Keywords.ImportDo)}, so you can't import any values.`)
			return new ImportDo(line.loc, path)
		} else {
			const {imported, opImportDefault} =
				parseThingsImported(name, importKeywordKind === Keywords.ImportLazy, rest)
			return new Import(line.loc, path, imported, opImportDefault)
		}
	})
}

function parseThingsImported(name, isLazy, tokens) {
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
	return ifElse(tryParseName(token),
		name => ({path: name, name}),
		() => {
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
				checkKeyword(Keywords.Dot, rest.head())
				rest = rest.tail()
			}

			return {path: parts.join('/'), name: parts[parts.length - 1]}
		})
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

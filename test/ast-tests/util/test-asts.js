import {BlockDo, BlockWithReturn, ModuleExportDefault, Val} from '../../../dist/private/MsAst'
import {parseAst} from '../../../dist/compile'
import {setContext} from '../../../dist/private/context'
import render from '../../../dist/private/render'
import transpile from '../../../dist/private/transpile/transpile'
import verify from '../../../dist/private/verify'
import {last, rtail} from '../../../dist/private/util'
import {loc} from './ast-util'

export const test = (ms, ast, js, opts) => {
	// TODO:ES6 Optional arguments
	opts = opts || {}

	const isMultiLineTest = ast instanceof Array
	ast = isMultiLineTest ?
		last(ast) instanceof Val ?
			new BlockWithReturn(loc, null, rtail(ast), last(ast)) :
			new BlockDo(loc, null, ast) :
		ast
	ms = dedent(ms)
	js = dedent(js)
	const expectedWarnings = opts.warnings || []
	const name = opts.name || `\`${ms.replace(/\n\t+/g, '; ')}\``

	it(name, () => {
		const {warnings: actualWarnings, result: moduleAst} = parseAst(ms, compileOptions)

		if (moduleAst instanceof Error)
			throw moduleAst

		// This mirrors getting `ast`. Convert lines to block.
		const lines = moduleAst.lines
		let parsedAst = lines.length === 1 ?
			lines[0] instanceof ModuleExportDefault ? lines[0].assign.value : lines[0] :
			last(lines) instanceof ModuleExportDefault ?
			new BlockWithReturn(loc, null, rtail(lines), last(lines).assign.value) :
			new BlockDo(loc, null, lines)

		if (!equalAsts(ast, parsedAst))
			throw new Error(`Different AST.\nExpected: ${ast}\nParsed: ${parsedAst}`)

		setContext(compileOptions)
		let rendered = render(transpile(ast, verify(ast)))
		if (rendered instanceof Error)
			throw rendered

		if (isMultiLineTest)
			// remove leading '{' and closing '\n}'
			rendered = dedent(rendered.slice(1, rendered.length - 2))

		if (expectedWarnings.length !== actualWarnings.length)
			throw new Error(
				`Different warnings.\nExpected ${expectedWarnings.length}.\nGot: ${actualWarnings}`)

		for (let i = 0; i < expectedWarnings.length; i = i + 1) {
			const expected = expectedWarnings[i]
			const got = actualWarnings[i].message
			if (expected !== got)
				throw new Error(`	Different warning.\nExpected: ${expected}\nGot: ${got}`)
		}

		if (js !== rendered)
			throw new Error(`Different render.\nExpected:\n${js}\nGot:\n${rendered}`)
	})
}

const compileOptions = {
	inFile: './test-compile.ms',
	includeSourceMap: false,
	includeModuleName: false,
	useStrict: false
}

const equalAsts = (a, b) => {
	if (a === b)
		return true

	if (typeof a !== 'object' || typeof b !== 'object')
		return false

	if (a === null)
		return b === null

	const keys = Object.keys(a)

	if (Object.keys(b).length !== keys.length)
		return false

	for (const _ of keys)
		if (_ !== 'loc')
			if (!equalAsts(a[_], b[_]))
				return false

	return true
}

const
	// multi-line string literals like:
	// `
	//	a
	//		b
	//	c`
	// have too much indentation.
	// This will change it to "a\n\tb\nc" by detecting the first line's indentation.
	dedent = str => {
		if (str[0] !== '\n')
			return str

		str = str.slice(1)

		let indent
		for (indent = 0; indent < str.length; indent = indent + 1)
			if (str[indent] !== '\t')
				break

		const dedentedLines = str.split('\n').map(line => line.slice(indent))
		return dedentedLines.join('\n')
	}

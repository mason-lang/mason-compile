import {Module} from '../../../dist/private/MsAst'
import {parseAst} from '../../../dist/compile'
import {setContext} from '../../../dist/private/context'
import render from '../../../dist/private/render'
import transpile from '../../../dist/private/transpile/transpile'
import verify from '../../../dist/private/verify/verify'
import {loc} from './ast-util'

export function test(ms, ast, js, opts = {}) {
	const isMultiLineTest = ast instanceof Array
	ast = new Module(loc, 'test-compile', null, [], [], isMultiLineTest ? ast : [ast])
	ms = `${dedent(ms)}\n`
	js = dedent(js)
	const expectedWarnings = opts.warnings || []
	const name = opts.name || `\`${ms.replace(/\n\t+/g, '; ')}\``

	it(name, () => {
		const {warnings: actualWarnings, result: parsedAst} = parseAst(ms, compileOptions)

		if (parsedAst instanceof Error)
			throw parsedAst

		function toJSON(_) {
			return JSON.stringify(_, null, '\t')
		}

		if (!equalAsts(ast, parsedAst))
			throw new Error(
				`Different AST.\nExpected: ${toJSON(ast)}\nParsed: ${toJSON(parsedAst)}`)

		setContext(compileOptions)
		const renderAst = ast.lines[0]
		let rendered = render(transpile(renderAst, verify(ast)))
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
	useStrict: false
}

function equalAsts(a, b) {
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

/*
multi-line string literals like:
`
	a
		b
	c`
have too much indentation.
This will change it to "a\n\tb\nc" by detecting the first line's indentation.
*/
function dedent(str) {
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

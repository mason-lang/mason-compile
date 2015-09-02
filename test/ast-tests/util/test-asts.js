import { BlockDo, BlockWithReturn, Val } from '../../../dist/private/MsAst'
import CompileContext from '../../../dist/private/CompileContext'
import CompileOptions from '../../../dist/private/CompileOptions'
import lex from '../../../dist/private/lex'
import parse from '../../../dist/private/parse/parse'
import render from '../../../dist/private/render'
import transpile from '../../../dist/private/transpile/transpile'
import { ifElse, isEmpty, last, rtail } from '../../../dist/private/util'
import verify from '../../../dist/private/verify'
import { loc } from './ast-util'

export const test = (ms, ast, js, opts) => {
	// TODO:ES6 Optional arguments
	opts = opts || { }

	const isMultiLineTest = ast instanceof Array
	ast = isMultiLineTest ?
		last(ast) instanceof Val ?
			new BlockWithReturn(loc, rtail(ast), last(ast)) :
			new BlockDo(loc, ast) :
		ast
	ms = dedent(ms)
	js = dedent(js)
	const warnings = opts.warnings || [ ]
	const name = opts.name || `\`${ms.replace(/\n\t+/g, '; ')}\``

	it(name, () => {
		const context = new CompileContext(options)

		const moduleAst = parse(context, lex(context, ms))

		const lines = moduleAst.lines

		// This mirrors getting `ast`. Convert lines to block.
		const parsedAst = ifElse(moduleAst.opDefaultExport,
			_ => isEmpty(lines) ? _ : new BlockWithReturn(loc, lines, _),
			() => lines.length === 1 ? lines[0] : new BlockDo(loc, lines))

		if (!equalAsts(ast, parsedAst))
			throw new Error(`Different AST.\nExpected: ${ast}\nParsed: ${parsedAst}`)

		const verifyResults = verify(context, ast)

		let rendered = render(context, transpile(context, ast, verifyResults))
		if (isMultiLineTest)
			// remove leading '{' and closing '\n}'
			rendered = dedent(rendered.slice(1, rendered.length - 2))

		if (warnings.length !== context.warnings.length)
			throw new Error(
				`Different warnings.\nExpected ${warnings.length}.\nGot: ${context.warnings}`)

		for (let i = 0; i < warnings.length; i = i + 1) {
			const got = context.warnings[i].message
			if (warnings[i] !== got)
				throw new Error(`	Different warning.\nExpected: ${warnings[i]}\nGot: ${got}`)
		}

		if (js !== rendered)
			throw new Error(`Different render.\nExpected:\n${js}\nGot:\n${rendered}`)
	})
}

const options = new CompileOptions({
	inFile: './test-compile.ms',
	inclideAmdefine: false,
	includeSourceMap: false,
	includeModuleName: false,
	forceNonLazyModule: true,
	useStrict: false
})

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

import LineContent from '../../../dist/private/ast/LineContent'
import Module from '../../../dist/private/ast/Module'
import MsAst from '../../../dist/private/ast/MsAst'
import Compiler from '../../../dist/Compiler'
import CompileError from '../../../dist/CompileError'
import CompileOptions from '../../../dist/private/CompileOptions'
import {withContext} from '../../../dist/private/context'
import render from '../../../dist/private/render'
import transpile from '../../../dist/private/transpile/transpile'
import verify from '../../../dist/private/verify/verify'
import {loc} from './ast-util'

export function test(
	ms: string,
	ast: LineContent | Array<LineContent>,
	js: string,
	opts: {warnings?: Array<string>, name?: string} = {}) {
	const isMultiLineTest = ast instanceof Array
	//rename
	const mdl = new Module(loc, 'test-compile', null, [], [], ast instanceof Array ? ast : [ast])
	ms = `${dedent(ms)}\n`
	js = dedent(js)
	const expectedWarnings = opts.warnings || []
	const name = opts.name || `\`${ms.replace(/\n\t+/g, '; ')}\``

	it(name, () => {
		const compiler = new Compiler(compileOptions)
		const {warnings: actualWarnings, result: parsedAst} = compiler.parse(ms, filename)

		if (parsedAst instanceof CompileError)
			throw parsedAst
		//make issue: shouldn't need 'else' to know that it's not a CompileError below here
		else {
			function toJSON(_: MsAst) {
				return JSON.stringify(_, null, '\t')
			}

			if (!equalAsts(mdl, parsedAst))
				throw new Error(
					`Different AST.\nExpected: ${toJSON(mdl)}\nParsed: ${toJSON(parsedAst)}`)

			// TODO:ES6 Just use regular compiler.render
			// (currently just renering lines[0] to avoid module boilerplate)
			let rendered: string
			withContext(new CompileOptions(compileOptions), filename, () => {
				//const renderAst = mdl.lines[0]
				rendered = render(transpile(mdl, verify(mdl))).code
			})

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
		}
	})
}

const compileOptions = {
	includeSourceMap: false,
	useStrict: false,
	noModuleBoilerplate: true
}
const filename = 'test-compile.ms'

function equalAsts(a: MsAst, b: MsAst) {
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
			if (!equalAsts((<any> a)[_], (<any> b)[_]))
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
function dedent(str: string): string {
	if (str[0] !== '\n')
		return str

	str = str.slice(1)

	let indent: number
	for (indent = 0; indent < str.length; indent = indent + 1)
		if (str[indent] !== '\t')
			break

	const dedentedLines = str.split('\n').map(line => line.slice(indent))
	return dedentedLines.join('\n')
}

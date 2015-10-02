import {Suite} from 'benchmark'
import {Node} from 'esast/dist/ast'
import {readFileSync} from 'fs'
import numeral from 'numeral'
import compile from '../dist/compile'
import MsAst from '../dist/private/MsAst'
import CompileContext from '../dist/private/CompileContext'
import CompileOptions from '../dist/private/CompileOptions'
import lex from '../dist/private/lex'
import parse from '../dist/private/parse/parse'
import render from '../dist/private/render'
import transpile from '../dist/private/transpile/transpile'
import verify from '../dist/private/verify'

export const
	test = () => doTest(false),
	perfTest = () => doTest(true)

const doTest = isPerfTest => {
	const source = readFileSync('test/test-compile.ms', 'utf-8')
	const opts = {
		inFile: './test-compile.ms',
		includeSourceMap: true,
		includeModuleName: false,
		useStrict: false,
		builtins: {
			global: ['Array', 'Boolean', 'Error', 'Function', 'Number', 'Object', 'Symbol']
		}
	}
	const context = new CompileContext(new CompileOptions(opts))

	try {
		const rootToken = lex(context, source)
		// console.log(`==>\n${rootToken}`)
		const msAst = parse(context, rootToken)
		// console.log(`==>\n${msAst}`)
		const verifyResults = verify(context, msAst)
		// console.log(`+++\n${verifyResults.___}`)
		const esAst = transpile(context, msAst, verifyResults)
		// console.log(`==>\n${esAst}`)
		const {code} = render(context, esAst)

		for (const _ of context.warnings)
			console.log(_)

		if (isPerfTest)
			benchmark({
				lex() { lex(context, source) },
				parse() { parse(context, rootToken) },
				verify() { verify(context, msAst) },
				transpile() { transpile(context, msAst, verifyResults) },
				render() { render(context, esAst) },
				all() { compile(source, opts) }
			})
		else {
			if (false) {
				console.log(`Expression tree size: ${treeSize(msAst, MsAst).size}.`)
				console.log(`ES AST size: ${treeSize(esAst, Node).size}.`)
				console.log(`Output size: ${code.length} characters.`)
			}
			console.log(`==>\n${code}`)
		}
	} catch (err) {
		if (err.warning)
			console.log(err.warning.loc)
		console.log(err.stack)
	}
}

const
	benchmark = tests => {
		const suite = new Suite()
		for (const name in tests)
			suite.add(name, tests[name])
		suite.on('complete', function() {
			this.forEach(_ => {
				const ms = numeral(_.stats.mean * 1000).format('0.00')
				console.log(`${_.name}: ${ms}ms`)
			})
		})
		suite.on('error', err => {
			throw err.target.error
		})
		suite.run()
	},

	treeSize = (tree, treeType) => {
		const visited = new Set()
		let nLeaves = 0
		const visit = node => {
			if (node != null && !visited.has(node))
				if (node instanceof treeType) {
					visited.add(node)
					for (const name in node) {
						const child = node[name]
						if (child instanceof Array)
							child.forEach(visit)
						else
							visit(child)
					}
				} else
					nLeaves = nLeaves + 1
		}
		visit(tree)
		return {size: visited.size, nLeaves}
	}

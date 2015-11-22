import {Suite} from 'benchmark'
import {Node} from 'esast/dist/ast'
import {readFileSync} from 'fs'
import numeral from 'numeral'
import {argv} from 'process'
import {install} from 'source-map-support'
import compile from '../dist/compile'
import {setContext, warnings} from '../dist/private/context'
import lex from '../dist/private/lex/lex'
import MsAst from '../dist/private/MsAst'
import parse from '../dist/private/parse/parse'
import render from '../dist/private/render'
import transpile from '../dist/private/transpile/transpile'
import verify from '../dist/private/verify/verify'
install()

if (!module.parent)
	doTest(argv[2] === 'perf')

function doTest(isPerfTest) {
	const source = readFileSync('test/test-compile.ms', 'utf-8')
	const opts = {
		inFile: './test-compile.ms',
		includeSourceMap: true,
		useStrict: false,
		builtins: {
			global: [
				'Array', 'Boolean', 'Error', 'Function',
				'Number', 'Object', 'Promise', 'String', 'Symbol'
			]
		}
	}

	setContext(opts)

	try {
		const rootToken = lex(source)
		// console.log(`==>\n${require('util').inspect(rootToken, {depth: null})}`)
		const msAst = parse(rootToken)
		// console.log(`==>\n${msAst}`)
		const verifyResults = verify(msAst)
		// console.log(`+++\n${verifyResults.___}`)
		const esAst = transpile(msAst, verifyResults)
		// console.log(`==>\n${esAst}`)
		const {code} = render(esAst)

		for (const _ of warnings)
			console.log(_)

		if (isPerfTest)
			benchmark({
				lex() { lex(source) },
				parse() { parse(rootToken) },
				verify() { verify(msAst) },
				transpile() { transpile(msAst, verifyResults) },
				render() { render(esAst) },
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

function benchmark(tests) {
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
}

function treeSize(tree, treeType) {
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

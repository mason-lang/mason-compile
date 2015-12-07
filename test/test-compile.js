import {Suite} from 'benchmark'
import {Node} from 'esast/dist/ast'
import {readFileSync} from 'fs'
import numeral from 'numeral'
import {argv} from 'process'
import {install} from 'source-map-support'
import CompileError from '../dist/CompileError'
import Compiler from '../dist/Compiler'
import CompileOptions from '../dist/private/CompileOptions'
import {withContext} from '../dist/private/context'
import lex from '../dist/private/lex/lex'
import MsAst from '../dist/private/MsAst'
import parse from '../dist/private/parse/parse'
import render from '../dist/private/render'
import transpile from '../dist/private/transpile/transpile'
import verify from '../dist/private/verify/verify'
install()

function doTest(isPerfTest) {
	const filename = 'test/test-compile.ms'
	const source = readFileSync(filename, 'utf-8')
	const opts = new CompileOptions({
		includeSourceMap: true,
		useStrict: false
	})

	const {warnings, result} = withContext(opts, filename, () => {
		const rootToken = lex(source)
		// console.log(`==>\n${require('util').inspect(rootToken, {depth: null})}`)
		const msAst = parse(rootToken)
		// console.log(`==>\n${msAst}`)
		const verifyResults = verify(msAst)
		// console.log(`+++\n${verifyResults.___}`)
		const esAst = transpile(msAst, verifyResults)
		// console.log(`==>\n${esAst}`)
		const {code} = render(esAst)
		return {rootToken, msAst, verifyResults, esAst, code}
	})

	if (result instanceof CompileError) {
		console.log(result.errorMessage.loc)
		throw result
	}

	const {rootToken, msAst, verifyResults, esAst, code} = result

	if (isPerfTest) {
		const compiler = new Compiler(opts)
		/* eslint-disable no-undef */
		Object.assign(global, {withContext, lex, parse, verify, transpile, render})

		benchmark({
			lex() {
				withContext(opts, filename, () => lex(source))
			},
			parse() {
				withContext(opts, filename, () => parse(rootToken))
			},
			verify() {
				withContext(opts, filename, () => verify(msAst))
			},
			transpile() {
				withContext(opts, filename, () => transpile(msAst, verifyResults))
			},
			render() {
				withContext(opts, filename, () => render(esAst))
			},
			all() {
				compiler.compile(source, filename)
			}
		})
	} else {
		const logSize = false
		if (logSize) {
			console.log(`Expression tree size: ${treeSize(msAst, MsAst).size}.`)
			console.log(`ES AST size: ${treeSize(esAst, Node).size}.`)
			console.log(`Output size: ${code.length} characters.`)
		}
		for (const _ of warnings)
			console.log(_)
		console.log(`==>\n${code}`)
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
	function visit(node) {
		if (node !== null && node !== undefined && !visited.has(node))
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

if (!module.parent)
	doTest(argv[2] === 'perf')

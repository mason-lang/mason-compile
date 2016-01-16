import {Suite} from 'benchmark'
import Node from 'esast/lib/Node'
import {readFileSync} from 'fs'
import {argv} from 'process'
import {install} from 'source-map-support'
import CompileError from '../lib/CompileError'
import Compiler from '../lib/Compiler'
import CompileOptions from '../lib/private/CompileOptions'
import {withContext} from '../lib/private/context'
import lex from '../lib/private/lex/lex'
import MsAst from '../lib/private/ast/MsAst'
import parse from '../lib/private/parse/parse'
import render from '../lib/private/render'
import transpile from '../lib/private/transpile/transpile'
import verify from '../lib/private/verify/verify'
install()

function doTest(isPerfTest: boolean): void {
	const filename = 'test/test-compile.ms'
	const source = readFileSync(filename, 'utf-8')
	const opts = {
		includeSourceMap: true,
		useStrict: false
	}
	const compileOptions = new CompileOptions(opts)

	const {warnings, result} = withContext(compileOptions, filename, () => {
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
	} else {
		const {rootToken, msAst, verifyResults, esAst, code} = result

		if (isPerfTest) {
			const compiler = new Compiler(opts)
			Object.assign(global, {withContext, lex, parse, verify, transpile, render})

			benchmark({
				lex(): void {
					withContext(compileOptions, filename, () => lex(source))
				},
				parse(): void {
					withContext(compileOptions, filename, () => parse(rootToken))
				},
				verify(): void {
					withContext(compileOptions, filename, () => verify(msAst))
				},
				transpile(): void {
					withContext(compileOptions, filename, () => transpile(msAst, verifyResults))
				},
				render(): void {
					withContext(compileOptions, filename, () => render(esAst))
				},
				all(): void {
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
}

function benchmark(tests: {[key: string]: () => void}): void {
	const suite = new Suite()
	for (const name in tests)
		suite.add(name, tests[name])
	suite.on('complete', function(): void {
		this.forEach((_: any) => {
			console.log(`${_.name}: ${_.stats.mean * 1000}ms`)
		})
	})
	suite.on('error', err => {
		throw err.target.error
	})
	suite.run()
}

function treeSize<A>(tree: A, treeType: any): {size: number, nLeaves: number} {
	const visited = new Set()
	let nLeaves = 0
	function visit(node: A): void {
		if (node !== null && node !== undefined && !visited.has(node))
			if (node instanceof treeType) {
				visited.add(node)
				for (const name in node) {
					const child = (<any> node)[name]
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

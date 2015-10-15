import CompileError from './CompileError'
import {setContext, unsetContext, warnings} from './private/context'
import lex from './private/lex'
import parse from './private/parse/parse'
import render from './private/render'
import transpile from './private/transpile/transpile'
import {type} from './private/util'
import verify from './private/verify'

// See private/CompileOptions for description of opts
export default (source, opts) => {
	type(source, String)
	setContext(opts)
	try {
		const ast = parse(lex(source))
		const esAst = transpile(ast, verify(ast))
		return {warnings, result: render(esAst)}
	} catch (error) {
		if (!(error instanceof CompileError))
			throw error
		return {warnings, result: error}
	} finally {
		unsetContext()
	}
}

export const parseAst = (source, opts) => {
	type(source, String)
	setContext(opts)
	try {
		const ast = parse(lex(source))
		verify(ast)
		return {warnings, result: ast}
	} catch (error) {
		if (!(error instanceof CompileError))
			throw error
		return {warnings, result: error}
	} finally {
		unsetContext()
	}
}

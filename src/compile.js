import CompileError from './CompileError'
import CompileContext from './private/CompileContext'
import CompileOptions from './private/CompileOptions'
import lex from './private/lex'
import parse from './private/parse/parse'
import render from './private/render'
import transpile from './private/transpile/transpile'
import { type } from './private/util'
import verify from './private/verify'

// See private/Opts.js for description of opts
export default (source, opts) => {
	type(source, String)
	const context = new CompileContext(new CompileOptions(opts))
	try {
		const ast = parse(context, lex(context, source))
		const esAst = transpile(context, ast, verify(context, ast))
		const result = render(context, esAst)
		return { warnings: context.warnings, result }
	} catch (error) {
		if (error instanceof CompileError)
			return { warnings: context.warnings, result: error }
		else
			throw error
	}
}

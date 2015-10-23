import CompileError from './CompileError'
import {setContext, unsetContext, warnings} from './private/context'
import lex from './private/lex'
import parse from './private/parse/parse'
import render from './private/render'
import transpile from './private/transpile/transpile'
import {type} from './private/util'
import verify from './private/verify'

/**
@param {string} source Mason source code for a single module.
@param {object} opts
@param {'\t'|Number} [opts.indent='\t']
	Mason does not allow mixed kinds of indentation,
	so indent type must be set once here and used consistently.
	If '\t', use tabs to indent.
	If a Number, indent with that many spaces. Should be an int 2 through 8.
@param {boolean} [opts.mslPath='msl']
	Path to `msl`. This may be `msl/dist`.
@param {boolean} [opts.checks=true]
	If false, leave out type checks and assertions.
@param {boolean} [opts.includeSourceMap=true] See @return for description.
@param {boolen} [opts.importBoot=true]
	Most mason modules include `msl/private/boot`, which `msl`.
	If you don't want to do this, much of the language will not work.
	This is only intended for compiling `msl` itself.
@return {{warnings: Array<Warning>, result: CompileError|string|{code: string, sourceMap: string}}}
	`CompileError`s are not thrown, but returned.
	This allows us to return `warnings` as well.

	If there is no error:
	`result` will be `{code: string, sourceMap: string}` if `opts.includeSourceMap`.
	Otherwise, it will just be the code (a string).
*/
export default function compile(source, opts={}) {
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

/**
Returns a {@link MsAst} rather than transpiling it to JavaScript.
Parameters are the same as `compile`.
*/
export function parseAst(source, opts={}) {
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

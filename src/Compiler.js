import CompileError from './CompileError'
import CompileOptions from './private/CompileOptions'
import {setContext, unsetContext, warnings} from './private/context'
import lex from './private/lex/lex'
import parse from './private/parse/parse'
import render from './private/render'
import transpile from './private/transpile/transpile'
import verify from './private/verify/verify'

export default class Compiler {
	/**
	@param {object} options
	@param {'\t'|Number} [options.indent='\t']
		Mason does not allow mixed kinds of indentation,
		so indent type must be set once here and used consistently.
		If '\t', use tabs to indent.
		If a Number, indent with that many spaces. Should be an int 2 through 8.
	@param {string} [options.mslPath='msl']
		Path to `msl`. This may be `msl/dist`.
	@param {boolean} [options.checks=true]
		If false, leave out type checks and assertions.
	@param {boolean} [options.includeSourceMap=true] See @return for description.
	@param {boolen} [options.importBoot=true]
		Most mason modules include `msl/private/boot`, which `msl`.
		If you don't want to do this, much of the language will not work.
		This is only intended for compiling `msl` itself.
	@param {string} language
		Language to use for errors and warnings.
		Currently must be `'english'`.
	*/
	constructor(options = {}) {
		this.options = new CompileOptions(options)
	}

	/**
	@param {string} source Mason source code for a single module.
	@param {string} filename Path of the source file.
	@return {{warnings: Array<Warning>, result: CompileError | {code: string, sourceMap: string}}}
		`CompileError`s are not thrown, but returned.
		This allows us to return `warnings` as well.
		`sourceMap` will be empty unless `opts.includeSourceMap`.
	*/
	compile(source, filename) {
		return this._doInContext(filename, () => {
			const ast = parse(lex(source))
			return render(transpile(ast, verify(ast)))
		})
	}

	/**
	Return a {@link MsAst} rather than transpiling it to JavaScript.
	Parameters are the same as `compile`.
	@return {{warnings: Array<Warning>, result: CompileError|MsAst}}
	*/
	parse(source, filename) {
		return this._doInContext(filename, () => {
			const ast = parse(lex(source))
			verify(ast)
			return ast
		})
	}

	/**
	Get the CompileError class associated with this compiler.
	This is used by mason-node-util to avoid depending on mason-compile directly.
	*/
	get CompileError() {
		return CompileError
	}

	_doInContext(filename, getResult) {
		setContext(this.options, filename)
		try {
			const result = getResult()
			return {warnings, result}
		} catch (error) {
			if (!(error instanceof CompileError))
				throw error
			return {warnings, result: error}
		} finally {
			unsetContext()
		}
	}
}

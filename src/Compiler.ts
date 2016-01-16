import CompileError, {ErrorMessage} from './CompileError'
import CompileOptions, {OptionsObject} from './private/CompileOptions'
import {withContext} from './private/context'
import lex from './private/lex/lex'
import Module from './private/ast/Module'
import parse from './private/parse/parse'
import render from './private/render'
import transpile from './private/transpile/transpile'
import verify from './private/verify/verify'

export default class Compiler {
	private options: CompileOptions

	constructor(options: OptionsObject = {}) {
		this.options = new CompileOptions(options)
	}

	/**
	@param source Mason source code for a single module.
	@param filename Path of the source file.
	@return
		`CompileError`s are not thrown, but returned.
		This allows us to return `warnings` as well.
		`sourceMap` will be empty unless `opts.includeSourceMap`.
	*/
	compile(source: string, filename: string): WarningsAnd<{code: string, sourceMap: string}> {
		return withContext(this.options, filename, () => {
			const ast = parse(lex(source))
			return render(transpile(ast, verify(ast)))
		})
	}

	/**
	Return a [[Module]] rather than transpiling it to JavaScript.
	Parameters are the same as `compile`.
	*/
	parse(source: string, filename: string): WarningsAnd<Module> {
		return withContext(this.options, filename, () => {
			const ast = parse(lex(source))
			verify(ast)
			return ast
		})
	}

	/**
	Get the CompileError class associated with this compiler.
	This is used by mason-node-util to avoid depending on mason-compile directly.
	*/
	private get CompileError(): any {
		return CompileError
	}
}

export interface WarningsAnd<A> {
	warnings: Array<ErrorMessage>,
	result: A | CompileError
}

import CompileError, {ErrorMessage} from './CompileError'
import CompileOptions, {OptionsObject} from './private/CompileOptions'
import {withContext} from './private/context'
import lex from './private/lex/lex'
import Module from './private/ast/Module'
import parse from './private/parse/parse'
import render from './private/render'
import transpile from './private/transpile/transpile'
import verify from './private/verify/verify'

/**
Public interface to the compiler.
This is an immutable object and never performs I/O.
(Filenames are passed in for source maps and because
a module's default export must share the filename.)

The compiler is a pipeline of immutable values. The pipes are:
	[[lex]]:
		Reads in [[Token]]s, identifies [[Keyword]]s, and creates [[Group]]s of tokens.
		This is more work than a lexer usually does. As a result, parsing is relatively simple.
	[[parse]]:
		Converts the [[Token]] tree to an [[MsAst]] tree.
	[[verify]]:
		Looks for errors in the [[MsAst]] tree.
		Also produces some information needed by [[transpile]], in the [[VerifyResults]].
		If just calling [[Compiler#parse]], the process ends here.
	[[transpile]]:
		Converts the [[MsAst]] to an esast tree.
	[[render]]:
		Outputs the esast tree to a string.

Most compiler steps need mutable state to do work.
These are handled by context modules such as `lex/sourceContext.ts`.
Context modules have their state reset at the end of the step, and are only used within the step,
so each step is a pure function.
(Context modules are more efficient and simpler than passing along a state object at each step.
It might be neater to make each step a class keeping the context as private state,
but that would require partial classes (not available yet) or to put the entire step in one file.)
*/
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

/**
Represents a failable value with warnings.
(Warnings will only be those reached before hitting a [[CompileError]], which stops compilation.)
*/
export interface WarningsAnd<A> {
	warnings: Array<ErrorMessage>,
	result: A | CompileError
}

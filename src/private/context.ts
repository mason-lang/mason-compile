import Loc, {Pos} from 'esast/lib/Loc'
import Op from 'op/Op'
import CompileError, {ErrorMessage} from '../CompileError'
import {WarningsAnd} from '../Compiler'
import Language from './languages/Language'
import CompileOptions from './CompileOptions'
import PathOptions from './PathOptions'
import {isEmpty} from './util'

export let options: CompileOptions
export let pathOptions: PathOptions

/** Array of all warnings produced during compilation. */
let warnings: Array<ErrorMessage>

/**
`options` and `pathOptions` will be set while running `getResult`.
When done, returns warnings along with the result.
*/
export function withContext<A>(
	_options: CompileOptions,
	filename: string,
	getResult: () => A)
	: WarningsAnd<A> {
	options = _options
	pathOptions = new PathOptions(filename)
	warnings = []

	try {
		let result: A
		try {
			result = getResult()
		} catch (error) {
			if (!(error instanceof CompileError))
				throw error
			result = error
		}

		// Sort warnings to make them easier to read.
		warnings.sort((a, b) => a.loc.compare(b.loc))
		return {warnings, result}
	} finally {
		// Release for garbage collection.
		options = pathOptions = warnings = null
	}
}

/**
If `cond` is false, [[fail]].
`loc` and `message` may also be Functions to to get them lazily.
*/
export function check(
	cond: boolean,
	loc: Pos | Loc | (() => Pos | Loc),
	message: (_: Language) => string): void {
	if (!cond)
		throw fail(loc instanceof Function ? loc() : loc, message)
}

/** Create a [[CompileError]]. Parameters are the same as for {@link warn}. */
export function fail(loc: Pos | Loc, message: (_: Language) => string): CompileError {
	return new CompileError(errorMessage(loc, message))
}

/**
Add a new warning.
@param code Message code. For a complete list, see [[english]].
@param args
	Arguments for rendering the message.
	When these are supplied, the message handler must be a function.
	See [[english]] for which messages are functions.
*/
export function warn(loc: Loc | Pos, message: (_: Language) => string): void {
	warnings.push(errorMessage(loc, message))
}

function errorMessage(loc: Loc | Pos, message: (_: Language) => string): ErrorMessage {
	const l = loc instanceof Pos ? Loc.singleChar(loc) : loc
	return new ErrorMessage(l, message(options.language))
}

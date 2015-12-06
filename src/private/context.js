import {Pos, singleCharLoc} from 'esast/dist/Loc'
import CompileError, {ErrorMessage} from '../CompileError'
import PathOptions from './PathOptions'
import {isEmpty} from './util'

/** @type {CompileOptions} */
export let options
/**
Array of all warnings produced during compilation.
(Please use {@warn} instead of writing to this directly.)
*/
let warnings
/** @type {PathOptions} */
export let pathOptions

/**
`options` and `pathOptions` will be set while running `getResult`.
When done, returns warnings along with the result.
@param {CompileOptions} _options
@param {string} filename
@param {function(): any} getResult
@return {{warnings, result}}
*/
export function withContext(_options, filename, getResult) {
	options = _options
	pathOptions = new PathOptions(filename)
	warnings = []

	try {
		let result
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
		options = null
		pathOptions = null
		warnings = null
	}
}

/**
If `cond` is false, {@link fail}.
`loc` and `message` may also be Functions to to get them lazily.
*/
export function check(cond, loc, code, ...args) {
	if (!cond) {
		if (loc instanceof Function)
			loc = loc()
		fail(loc, code, ...args)
	}
}

/**
Throw a {@link CompileError}.
Parameters are the same as for {@link warn}.
*/
export function fail(loc, code, ...args) {
	throw new CompileError(errorMessage(loc, code, args))
}

/**
Add a new warning.
@param {Loc|Pos} loc
@param {string} code
	Message code. For a complete list, see `languages/english`.
@param args
	Arguments for rendering the message.
	When these are supplied, the message handler must be a function.
	See `languages/english` for which messages are functions.
*/
export function warn(loc, code, ...args) {
	warnings.push(errorMessage(loc, code, args))
}

function errorMessage(loc, code, args) {
	if (loc instanceof Pos)
		loc = singleCharLoc(loc)
	const language = options.language()
	const message = isEmpty(args) ? language[code] : language[code](...args)
	return new ErrorMessage(loc, message)
}

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
export let warnings
/** @type {PathOptions} */
export let pathOptions

/**
Write to {@link options} and {@link warnings}.
Remember to call {@link unsetContext}!
*/
export function setContext(_options, filename) {
	options = _options
	pathOptions = new PathOptions(filename)
	warnings = []
}

/** Release {@link options} and {@link warnings} for garbage collection. */
export function unsetContext() {
	options = null
	warnings = null
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

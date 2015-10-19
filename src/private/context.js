import {Pos, singleCharLoc} from 'esast/dist/Loc'
import CompileError, {Warning} from '../CompileError'
import CompileOptions from './CompileOptions'

/**
Options that were passed in at the call to {@link compile}.
@type {CompileOptions}
*/
export let options
/**
Array of all warnings produced during compilation.
(Please use {@warn} instead of writing to this directly.)
*/
export let warnings

/**
Write to {@link options} and {@link warnings}.
Remember to call {@link unsetContext}!
*/
export function setContext(opts) {
	options = new CompileOptions(opts)
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
export function check(cond, loc, message) {
	if (!cond) {
		if (loc instanceof Function)
			loc = loc()
		if (message instanceof Function)
			message = message()
		fail(loc, message)
	}
}

/**
Throw a {@link CompileError}.
Parameters are the same as for {@link warn}.
*/
export function fail(loc, message) {
	throw new CompileError(warning(loc, message))
}

/**
Add a new warning.
@param {Loc|Pos} loc
@param {string} message
	Will often contain sequences created by {@link code}.
*/
export function warn(loc, message) {
	warnings.push(warning(loc, message))
}

const warning = (loc, message) => {
	if (loc instanceof Pos)
		loc = singleCharLoc(loc)
	return new Warning(loc, message)
}

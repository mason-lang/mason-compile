import {Pos, singleCharLoc} from 'esast/dist/Loc'
import CompileError, {Warning} from '../CompileError'
import CompileOptions from './CompileOptions'

export let options
export let warnings

export const setContext = opts => {
	options = new CompileOptions(opts)
	warnings = []
}

// Release for garbage collection.
export const unsetContext = () => {
	options = null
	warnings = null
}

export const check = (cond, loc, message) => {
	if (!cond)
		fail(loc, message)
}

export const fail = (loc, message) => {
	throw new CompileError(warning(loc, message))
}

export const warnIf = (cond, loc, message) => {
	if (cond)
		warn(loc, message)
}

export const warn = (loc, message) => {
	warnings.push(warning(loc, message))
}

const
	warning = (loc, message) => {
		loc = unlazy(loc)
		message = unlazy(message)
		if (loc instanceof Pos)
			loc = singleCharLoc(loc)
		return new Warning(loc, message)
	},
	unlazy = _ => _ instanceof Function ? _() : _

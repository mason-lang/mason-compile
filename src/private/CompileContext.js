import CompileError, {Warning} from '../CompileError'
import {Pos, singleCharLoc} from 'esast/dist/Loc'

export default class CompileContext {
	constructor(opts) {
		this.opts = opts
		this.warnings = []
	}

	check(cond, loc, message) {
		if (!cond)
			this.fail(loc, message)
	}

	fail(loc, message) {
		throw CompileError(warning(loc, message))
	}

	warn(loc, message) {
		this.warnings.push(warning(loc, message))
	}

	warnIf(cond, loc, message) {
		if (cond)
			this.warn(loc, message)
	}
}

const
	unlazy = _ => _ instanceof Function ? _() : _,

	warning = (loc, message) => {
		loc = unlazy(loc)
		message = unlazy(message)
		if (loc instanceof Pos)
			loc = singleCharLoc(loc)
		return new Warning(loc, message)
	}

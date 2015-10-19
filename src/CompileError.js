/**
Any error thrown by the compiler due to a problem with the input source code.
*/
export default class CompileError extends Error {
	constructor(warning) {
		super(warning.message)
		/** Location and description of the error. */
		this.warning = warning
	}
}

/**
Any problem with source code.
Despite the name, this is used for both warnings and errors.
*/
export class Warning {
	constructor(loc /* Loc */, message /* String */) {
		/** Source location of the problem. */
		this.loc = loc
		/** Text description of the problem. */
		this.message = message
	}
}

/** Used when generating warning messages to highlight a part of that message. */
export const code = str =>
	`{{${str}}}`

/**
Applies `formatter` to parts of `this.message` created by {@link code}.
@return
	Generator yielding strings (for non-`code`)
	and results of `formatter(code)` for parts made by {@link code}.
*/
export function* formatCode(message, formatter) {
	const codeRegex = /{{(.*?)}}/g
	let prevIdx = 0
	while (true) {
		const match = codeRegex.exec(message)
		if (match === null) {
			yield message.slice(prevIdx, message.length)
			break
		} else {
			yield message.slice(prevIdx, match.index)
			yield formatter(match[1])
			prevIdx = codeRegex.lastIndex
		}
	}
}

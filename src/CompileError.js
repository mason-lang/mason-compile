/**
Any error thrown by the compiler due to a problem with the input source code.
*/
export default class CompileError extends Error {
	constructor(errorMessage) {
		super(errorMessage.message)
		/** Location and description of the error. */
		this.errorMessage = errorMessage
	}
}

/**
Any problem with source code.
Used for both errors and warnings.
*/
export class ErrorMessage {
	constructor(loc, message) {
		/**
		Source location of the problem.
		@type {Loc}
		*/
		this.loc = loc
		/**
		Text description of the problem.
		@type {string}
		*/
		this.message = message
	}

	/**
	Applies `codeFormatter` to parts of `this.message` created by {@link code}.
	@param {function(code: string)} codeFormatter
	@return
		Generator yielding strings (for non-`code`)
		and results of `formatter(code)` for `code` parts.
	*/
	* messageParts(codeFormatter) {
		const message = this.message
		const codeRegex = /{{(.*?)}}/g
		let prevIdx = 0
		for (;;) {
			const match = codeRegex.exec(message)
			if (match === null) {
				yield message.slice(prevIdx, message.length)
				break
			} else {
				yield message.slice(prevIdx, match.index)
				yield codeFormatter(match[1])
				prevIdx = codeRegex.lastIndex
			}
		}
	}
}

/** Used when generating messages to highlight a part of that message. */
export const code = str =>
	`{{${str}}}`

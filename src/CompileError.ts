import Loc from 'esast/lib/Loc'

/**
Any error thrown by the compiler due to a problem with the input source code.
*/
export default class CompileError extends Error {
	errorMessage: ErrorMessage

	constructor(errorMessage: ErrorMessage) {
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
	/** Source location of the problem. */
	loc: Loc
	/** Text description of the problem. */
	message: string

	constructor(loc: Loc, message: string) {
		this.loc = loc
		this.message = message
	}

	/**
	Applies `codeFormatter` to parts of `this.message` created by [[code]].
	@return
		Generator yielding strings (for non-`code`)
		and results of `formatter(code)` for `code` parts.
	*/
	* messageParts<A>(codeFormatter: (code: string) => A): Iterator<A | string> {
		const message = this.message
		const codeRegex = /{{(.*?)}}/g
		let prevIdx = 0
		while (true) {
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

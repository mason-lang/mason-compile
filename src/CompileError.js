import {type} from './private/util'

export default class CompileError extends Error {
	constructor(warning) {
		type(warning, Warning)
		super(warning.message)
		this.warning = warning
	}
}

export class Warning {
	constructor(loc /* Loc */, message /* String */) {
		this.loc = loc
		this.message = message
	}
}

export const code = str =>
	`{{${str}}}`

export function* formatCode(str, formatter) {
	const codeRegex = /{{(.*?)}}/g
	let prevIdx = 0
	while (true) {
		const match = codeRegex.exec(str)
		if (match === null) {
			yield str.slice(prevIdx, str.length)
			break
		} else {
			yield str.slice(prevIdx, match.index)
			yield formatter(match[1])
			prevIdx = codeRegex.lastIndex
		}
	}
}

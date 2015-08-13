import CompileError, { Warning, formatCode } from '../CompileError'
import { type } from '../private/util'

export default (error, modulePath) => {
	type(error, CompileError)
	return format(error.warning, modulePath, 'error')
}

export const formatWarningForHtml = (warning, modulePath) => {
	type(warning, Warning, modulePath, String)
	// Extra space to match up with 'error'
	return format(warning, modulePath, 'warning')
}

const format = (warning, modulePath, kind) => {
	const locSpan = document.createElement('span')
	locSpan.className = 'loc'
	locSpan.textContent = warning.loc + ' '

	const messageSpan = document.createElement('message')
	messageSpan.className = 'message'
	const messageParts = formatCode(warning.message, code => {
		const _ = document.createElement('span')
		_.className = 'code'
		_.textContent = code
		return _
	})
	for (let part of messageParts)
		messageSpan.appendChild(typeof part === 'string' ? document.createTextNode(part) : part)

	const allSpan = document.createElement('span')
	allSpan.className = kind
	allSpan.appendChild(locSpan)
	allSpan.appendChild(messageSpan)
	return allSpan
}

import { blue, green, magenta, bold } from 'chalk'
import { Warning, formatCode } from '../CompileError'
import { iteratorToArray, type } from '../private/util'

export default (error, modulePath) => format(error.warning, modulePath, 'error')

export const formatWarningForConsole = (warning, modulePath) => {
	type(warning, Warning, modulePath, String)
	// Extra space to match up with 'error'
	return format(warning, modulePath, 'warn ')
}

const format = (warning, modulePath, kind) => {
	const message = iteratorToArray(formatCode(warning.message, green)).join('')
	return `${blue(modulePath)}\n${magenta(kind)} ${bold.red(warning.loc)} ${message}`
}

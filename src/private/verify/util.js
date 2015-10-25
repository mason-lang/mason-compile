import {name, results} from './context'

/** Verify if it exists. */
export function verifyOp(_) {
	if (_ !== null)
		_.verify()
}

/** Verify if it's not a string. */
export function verifyName(_) {
	if (typeof _ !== 'string')
		_.verify()
}

export function setName(expr) {
	results.names.set(expr, name)
}

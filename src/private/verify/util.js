import {check} from '../context'
import {name, okToNotUse, results} from './context'
import SK from './SK'

/** Verify if it exists. */
export function verifyOp(_, sk) {
	if (_ !== null)
		_.verify(sk)
}

/** Verify if it's not a string. */
export function verifyName(_) {
	if (typeof _ !== 'string')
		_.verify(SK.Val)
}

export function setName(expr) {
	results.names.set(expr, name)
}

export function okToNotUseIfFocus(localDeclare) {
	if (localDeclare.name === '_')
		okToNotUse.add(localDeclare)
}

export function verifyNotLazy(localDeclare, message) {
	check(!localDeclare.isLazy(), localDeclare.loc, message)
}

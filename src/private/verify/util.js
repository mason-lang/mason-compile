import {check} from '../context'
import {name, okToNotUse, results} from './context'
import SK from './SK'

/** Mark a LocalDeclare as OK to not use. */
export function makeUseOptional(localDeclare) {
	okToNotUse.add(localDeclare)
}

/**
For Asts that use the focus by default, make it OK to not use the variable when it's the focus.
(If the user specified a name, they intended to use it.)
*/
export function makeUseOptionalIfFocus(localDeclare) {
	if (localDeclare.name === '_')
		makeUseOptional(localDeclare)
}

/**
Verify each of asts.
@param {SK} [sk] Optional SK of each ast.
*/
export function verifyEach(asts, sk) {
	for (const _ of asts)
		_.verify(sk)
}

/**
Verify opAst if it exists.
@param [arg] Argument to pass to _.verify. Usually an {@link SK}.
*/
export function verifyOp(opAst, arg) {
	if (opAst !== null)
		opAst.verify(arg)
}

/** Verify if it's not a string. */
export function verifyName(_) {
	if (typeof _ !== 'string')
		_.verify(SK.Val)
}

export function setName(expr) {
	results.names.set(expr, name)
}

export function verifyNotLazy(localDeclare, message) {
	check(!localDeclare.isLazy(), localDeclare.loc, message)
}

import {LocalDeclare} from '../ast/locals'
import Named from '../ast/Named'
import {check} from '../context'
import Language from '../languages/Language'
import {name, okToNotUse, results} from './context'

/** Mark a LocalDeclare as OK to not use. */
export function makeUseOptional(localDeclare: LocalDeclare): void {
	okToNotUse.add(localDeclare)
}

/**
For Asts that use the focus by default, make it OK to not use the variable when it's the focus.
(If the user specified a name, they intended to use it.)
*/
export function makeUseOptionalIfFocus(localDeclare: LocalDeclare): void {
	if (localDeclare.name === '_')
		makeUseOptional(localDeclare)
}

export function setName(expr: Named): void {
	results.names.set(expr, name)
}

export function verifyNotLazy(declare: LocalDeclare, errorMessage: (_: Language) => string): void {
	check(!declare.isLazy, declare.loc, errorMessage)
}

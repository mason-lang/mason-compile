import Op, {nonNull} from 'op/Op'
import Language from '../languages/Language'
import {check} from '../context'
import MsAst, {Val, LocalDeclare, Name, Named, Spread} from '../MsAst'
import {name, okToNotUse, results} from './context'
import SK from './SK'

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

export function verifyEach(asts: Array<MsAst>, sk: SK): void {
	for (const _ of asts)
		_.verify(sk)
}

/** Verify values, accepting Spreads. */
export function verifyEachValOrSpread(asts: Array<Val | Spread>) {
	for (const _ of asts)
		// `null` signifies to Spread that we recognize it
		// todo: just have special function for verify spread
		_.verify(_ instanceof Spread ? null : SK.Val)
}

/**
Verify opAst if it exists.
@param opAst
@param [arg] Argument to pass to _.verify. Usually an [[SK]].
*/
export function verifyOp(opAst: Op<MsAst>, sk: SK): void {
	if (nonNull(opAst))
		opAst.verify(sk)
}

/** Verify if it's not a string. */
export function verifyName(_: Name): void {
	if (typeof _ !== 'string')
		_.verify(SK.Val)
}

export function setName(expr: Named): void {
	results.names.set(expr, name)
}

export function verifyNotLazy(localDeclare: LocalDeclare, errorMessage: (_: Language) => string): void {
	check(!localDeclare.isLazy, localDeclare.loc, errorMessage)
}

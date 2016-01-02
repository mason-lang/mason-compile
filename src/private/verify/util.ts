import Op, {nonNull} from 'op/Op'
import Language from '../languages/Language'
import {check} from '../context'
import MsAst, {Val, LocalDeclare, Name, Named, Spread} from '../MsAst'
import {name, okToNotUse, results} from './context'
import SK from './SK'
import verifyVal from './verifyVal'

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

/** Verify values, accepting Spreads. */
export function verifyEachValOrSpread(asts: Array<Val | Spread>) {
	for (const _ of asts)
		// `null` signifies to Spread that we recognize it
		// todo: just have special function for verify spread
		if (_ instanceof Spread)
			verifySpread(_)
		else
			verifyVal(_)
}
//move?
function verifySpread({spreaded}: Spread) {
	//check(sk === null, this.loc, _ => sk === SK.Val ? _.misplacedSpreadVal : _.misplacedSpreadDo)
	verifyVal(spreaded)
}

/** Verify if it's not a string. */
//move
export function verifyName(_: Name): void {
	if (typeof _ !== 'string')
		verifyVal(_)
}

export function setName(expr: Named): void {
	results.names.set(expr, name)
}

export function verifyNotLazy(localDeclare: LocalDeclare, errorMessage: (_: Language) => string): void {
	check(!localDeclare.isLazy, localDeclare.loc, errorMessage)
}

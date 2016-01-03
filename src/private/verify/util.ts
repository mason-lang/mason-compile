import Op, {nonNull} from 'op/Op'
import {Spread} from '../ast/Call'
import {Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import MemberName from '../ast/MemberName'
import MsAst from '../ast/MsAst'
import Named from '../ast/Named'
import {check} from '../context'
import Language from '../languages/Language'
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
export function verifyEachValOrSpread(asts: Array<Val | Spread>): void {
	for (const _ of asts)
		// `null` signifies to Spread that we recognize it
		// todo: just have special function for verify spread
		if (_ instanceof Spread)
			verifySpread(_)
		else
			verifyVal(_)
}
//move?
function verifySpread({spreaded}: Spread): void {
	//check(sk === null, this.loc, _ => sk === SK.Val ? _.misplacedSpreadVal : _.misplacedSpreadDo)
	verifyVal(spreaded)
}

/** Verify if it's not a string. */
//move
export function verifyMemberName(_: MemberName): void {
	if (typeof _ !== 'string')
		verifyVal(_)
}

export function setName(expr: Named): void {
	results.names.set(expr, name)
}

export function verifyNotLazy(localDeclare: LocalDeclare, errorMessage: (_: Language) => string): void {
	check(!localDeclare.isLazy, localDeclare.loc, errorMessage)
}

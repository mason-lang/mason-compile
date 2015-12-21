import Loc from 'esast/lib/Loc'
import Op, {caseOp, orDefault} from 'op/Op'
import {check, warn} from '../context'
import Language from '../languages/Language'
import MsAst, {Block, Case, CasePart, Catch, DoOnly, Switch, SwitchPart, ValOnly, ValOrDo} from '../MsAst'
import * as MsAstTypes from '../MsAst'
import {cat, implementMany, isEmpty, last} from '../util'
import {Blocks} from '../VerifyResults'
import autoBlockKind from './autoBlockKind'
import {results} from './context'

/** Statement Kind. */
const enum SK {
	/** Must be a statement. */
	Do,
	/** Must be an expression. */
	Val
}
export default SK

/** This MsAst must be a statement. */
export function checkDo(_: DoOnly, sk: SK) {
	check(sk === SK.Do, _.loc, _ => _.statementAsValue)
}

/** This MsAst must be a value. */
export function checkVal(_: ValOnly, sk: SK) {
	if (sk === SK.Do)
		warn(_.loc, _ => _.valueAsStatement)
}

/**
This is an MsAst that is sometimes a statement, sometimes an expression.
Mark it using `sk` so that it can transpile correctly.
*/
export function markStatement(_: ValOrDo, sk: SK) {
	if (sk === SK.Do)
		results.statements.add(_)
}

/**
Infers whether the last line of a module is a statement or a value.
Prefers to make it a value, such as in the case of a Call.
*/
export function getSK(_: MsAst) {
	return orDefault(_.opSK(), () => SK.Val)
}

// `null` means can't determine whether this must be a statement or value.
implementMany(MsAstTypes, 'opSK', {
	DoOnly(): Op<SK> {
		return SK.Do
	},
	ValOnly(): Op<SK> {
		return SK.Val
	},
	Call(): Op<SK> {
		return null
	},
	Del(): Op<SK> {
		return null
	},
	Yield(): Op<SK> {
		return null
	},
	YieldTo(): Op<SK> {
		return null
	},
	Block(): Op<SK> {
		// todo
		const {lines, loc} = <Block> this
		return autoBlockKind(lines, loc) === Blocks.Return ?
			isEmpty(lines) ? SK.Do : last(lines).opSK() :
			SK.Val
	},
	Conditional(): Op<SK> {
		return this.result.opSK()
	},
	Except(): Op<SK> {
		const catches = this.allCatches.map((_: Catch) => _.block)
		// If there's opElse, `try` is always SK.Do and `else` may be SK.Val.
		const parts = caseOp(this.opElse, _ => cat(_, catches), () => cat(this.try, catches))
		// opFinally is always SK.Do.
		return compositeSK(this.loc, parts)
	},
	For(): Op<SK> {
		// If opForSK is null, there are no breaks, so this is an infinite loop.
		return orDefault(this.block.opForSK(), () => SK.Do)
	},
	Case: caseSwitchSK,
	Switch: caseSwitchSK
})

function caseSwitchSK() {
	return compositeSK(this.loc, caseSwitchParts(this))
}

implementMany(MsAstTypes, 'opForSK', {
	default(): Op<SK> {
		return null
	},
	Break(): Op<SK> {
		return this.opValue === null ? SK.Do : SK.Val
	},
	Block(): Op<SK> {
		return isEmpty(this.lines) ? null : compositeForSK(this.loc, this.lines)
	},
	Conditional(): Op<SK> {
		return this.result.opForSK()
	},
	Case: caseSwitchForSK,
	Except(): Op<SK> {
		const catches = this.allCatches.map((_: Catch) => _.block)
		// Do look at opFinally for break statements.
		return compositeForSK(this.loc, cat(this.try, catches, this.opElse, this.opFinally))
	},
	Switch: caseSwitchForSK
})

function caseSwitchForSK(): Op<SK> {
	return compositeForSK(this.loc, caseSwitchParts(this))
}

function caseSwitchParts(_: {parts: Array<{result: MsAst}>, opElse: MsAst}): Array<MsAst> {
	return cat(
		(<any> _.parts).map((_: CasePart | SwitchPart) => _.result),
		_.opElse)
}

function compositeSK(loc: Loc, parts: Array<MsAst>): Op<SK> {
	return composite(loc, _ => _.opSK(), parts, _ => _.ambiguousSK)
}

/**
This handles the rare case where a 'for' loop is the last line of a module.
The error occurs if it looks like:

	for
		switch 0
			0
				break 1
			else
				break

Meaning that it can't be determined whether it's a statement or value.
*/
function compositeForSK(loc: Loc, parts: Array<MsAst>): Op<SK> {
	return composite(loc, _ => _.opForSK(), parts, _ => _.ambiguousForSK)
}

function composite(loc: Loc, method: (_: MsAst) => Op<SK>, parts: Array<MsAst>, errorMessage: (_: Language) => string): Op<SK> {
	let opSk = method(parts[0])
	for (let i = 1; i < parts.length; i = i + 1) {
		const otherSK: Op<SK> = method(parts[i])
		if (opSk === null)
			opSk = otherSK
		else
			check(otherSK === null || otherSK === opSk, loc, errorMessage)
	}
	return opSk
}

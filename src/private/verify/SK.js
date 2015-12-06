import {check, warn} from '../context'
import * as MsAstTypes from '../MsAst'
import {cat, ifElse, implementMany, isEmpty, last, opOr} from '../util'
import {Blocks} from '../VerifyResults'
import autoBlockKind from './autoBlockKind'
import {results} from './context'

const SK = {
	/** Must be a statement. */
	Do: 0,
	/** Must be an expression. */
	Val: 1
}
/** Statement Kind. */
export default SK

/** This MsAst must be a statement. */
export function checkDo(_, sk) {
	check(sk === SK.Do, _.loc, 'statementAsValue')
}

/** This MsAst must be a value. */
export function checkVal(_, sk) {
	if (sk === SK.Do)
		warn(_.loc, 'valueAsStatement')
}

/**
This is an MsAst that is sometimes a statement, sometimes an expression.
Mark it using `sk` so that it can transpile correctly.
*/
export function markStatement(_, sk) {
	if (sk === SK.Do)
		results.statements.add(_)
}

/**
Infers whether the last line of a module is a statement or a value.
Prefers to make it a value, such as in the case of a Call.
*/
export function getSK(_) {
	return opOr(_.opSK(), () => SK.Val)
}

// `null` means can't determine whether this must be a statement or value.
implementMany(MsAstTypes, 'opSK', {
	Do() {
		return SK.Do
	},
	Val() {
		return SK.Val
	},
	Call() {
		return null
	},
	Del() {
		return null
	},
	Yield() {
		return null
	},
	YieldTo() {
		return null
	},
	Block() {
		return autoBlockKind(this.lines, this.loc) === Blocks.Return ?
			isEmpty(this.lines) ? SK.Do : last(this.lines).opSK() :
			SK.Val
	},
	Conditional() {
		return this.result.opSK()
	},
	Except() {
		const catches = this.allCatches.map(_ => _.block)
		// If there's opElse, `try` is always SK.Do and `else` may be SK.Val.
		const parts = ifElse(this.opElse, _ => cat(_, catches), () => cat(this.try, catches))
		// opFinally is always SK.Do.
		return compositeSK(this.loc, parts)
	},
	For() {
		// If opForSK is null, there are no breaks, so this is an infinite loop.
		return opOr(this.block.opForSK(), () => SK.Do)
	},
	Case: caseSwitchSK,
	Switch: caseSwitchSK
})

function caseSwitchSK() {
	return compositeSK(this.loc, caseSwitchParts(this))
}

implementMany(MsAstTypes, 'opForSK', {
	default() {
		return null
	},
	Break() {
		return this.opValue === null ? SK.Do : SK.Val
	},
	Block() {
		return isEmpty(this.lines) ? null : compositeForSK(this.loc, this.lines)
	},
	Conditional() {
		return this.result.opForSK()
	},
	Case: caseSwitchForSK,
	Except() {
		const catches = this.allCatches.map(_ => _.block)
		// Do look at opFinally for break statements.
		return compositeForSK(this.loc, cat(this.try, catches, this.opElse, this.opFinally))
	},
	Switch: caseSwitchForSK
})

function caseSwitchForSK() {
	return compositeForSK(this.loc, caseSwitchParts(this))
}

function caseSwitchParts(_) {
	return cat(_.parts.map(_ => _.result), _.opElse)
}

function compositeSK(loc, parts) {
	return composite(loc, 'opSK', parts, 'ambiguousSK')
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
function compositeForSK(loc, parts) {
	return composite(loc, 'opForSK', parts, 'ambiguousForSK')
}

function composite(loc, method, parts, errorCode) {
	let sk = parts[0][method]()
	for (let i = 1; i < parts.length; i = i + 1) {
		const otherSK = parts[i][method]()
		if (sk === null)
			sk = otherSK
		else
			check(otherSK === null || otherSK === sk, loc, errorCode)
	}
	return sk
}

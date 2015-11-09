import {check, warn} from '../context'
import * as MsAstTypes from '../MsAst'
import {Keywords, showKeyword} from '../Token'
import {cat, implementMany, isEmpty, last, opMap, opOr} from '../util'
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
	check(sk === SK.Do, _.loc,
		'This can only be used as a statement, but appears in expression context.')
}

/** This MsAst must be a value. */
export function checkVal(_, sk) {
	if (sk === SK.Do)
		warn(_.loc, 'Value appears in statement context, so it does nothing.')
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
	return opOr(_.opGetSK(), () => SK.Val)
}

// `null` means can't determine whether this must be a statement or value.
implementMany(MsAstTypes, 'opGetSK', {
	Do() { return SK.Do },
	Val() { return SK.Val },
	Call() { return null },
	Yield() { return null },
	YieldTo() { return null },
	Block() {
		return autoBlockKind(this.lines, this.loc) === Blocks.Return ?
			isEmpty(this.lines) ? SK.Do : last(this.lines).opGetSK() :
			SK.Val
	},
	Conditional() { return this.result.opGetSK() },
	Except() {
		// Don't look at opFinally because that's always a Do
		return compositeSK(this.loc, cat(this.try, opMap(this.opCatch, _ => _.block)))
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

implementMany(MsAstTypes, 'opForSK',{
	default() { return null },
	Break() {
		return this.opValue === null ? SK.Do : SK.Val
	},
	Block() { return isEmpty(this.lines) ? null : composite(this.loc, 'opForSK', this.lines) },
	Conditional() { return this.result.opForSK() },
	Case: caseSwitchForSK,
	Except() {
		// Do look at opFinally for break statements.
		return compositeForSK(this.loc,
			cat(this.try, opMap(this.opCatch, _ => _.block), this.opFinally))
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
	return composite(loc, 'opGetSK', parts,
		'Can\'t tell if this is a statement. Some parts are statements but others are values.')
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
	return composite(loc, 'opForSK', parts, () =>
		`Can't tell if ${showKeyword(Keywords.For)} is a statement. ` +
		`Some ${showKeyword(Keywords.Break)}s have a value, others don't.`)
}

function composite(loc, method, parts, errorMessage) {
	let sk = parts[0][method]()
	for (let i = 1; i < parts.length; i = i + 1) {
		const otherSK = parts[i][method]()
		if (sk === null)
			sk = otherSK
		else
			check(otherSK === null || otherSK === sk, loc, errorMessage)
	}
	return sk
}

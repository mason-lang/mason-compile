import Loc from 'esast/lib/Loc'
import Op, {caseOp, orDefault} from 'op/Op'
import Block from '../ast/Block'
import {Conditional} from '../ast/booleans'
import Case, {CasePart} from '../ast/Case'
import {Catch, Except} from '../ast/errors'
import LineContent, {DoOnly, ValOnly, ValOrDo} from '../ast/LineContent'
import {For, ForAsync, Break} from '../ast/Loop'
import MsAst from '../ast/MsAst'
import Switch, {SwitchPart} from '../ast/Switch'
import With from '../ast/With'
import {check, warn} from '../context'
import Language from '../languages/Language'
import {cat, isEmpty, last} from '../util'
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

/**
This is an MsAst that is sometimes a statement, sometimes an expression.
Mark it using `sk` so that it can transpile correctly.
*/
export function markStatement(_: ValOrDo | CasePart | SwitchPart | ForAsync, sk: SK): void {
	if (sk === SK.Do)
		results.statements.add(_)
}

/**
Infer whether a block has a value.
Prefer to make it a value, such as in the case of a Call.
*/
export function getBlockSK(_: Block): SK {
	return orDefault(opBlockSK(_), () => SK.Val)
}

/**
Infer whether the last line of a module is a statement or a value.
Prefer to make it a value, such as in the case of a Call.
*/
export function getLineSK(_: LineContent): SK {
	return orDefault(opSK(_), () => SK.Val)
}

// `null` means: can't determine whether this must be a statement or value.
function opBlockSK({lines, loc}: Block): Op<SK> {
	return autoBlockKind(lines, loc) === Blocks.Return ?
		isEmpty(lines) ? SK.Do : opSK(last(lines)) :
		SK.Val
}

function opSK(_: LineContent): Op<SK> {
	if (_ instanceof DoOnly)
		return SK.Do
	else if (_ instanceof ValOnly)
		return SK.Val
	else if (_ instanceof Conditional) {
		const {result} = _
		return result instanceof Block ? opBlockSK(result) : opSK(result)
	} else if (_ instanceof Except) {
		const {loc, try: _try, allCatches, opElse} = _
		const catches = allCatches.map((_: Catch) => _.block)
		// If there's opElse, `try` is always SK.Do and `else` may be SK.Val.
		const parts = caseOp(opElse, _ => cat(_, catches), () => cat(_try, catches))
		// opFinally is always SK.Do.
		return compositeSK(loc, parts.map(opBlockSK))
	} else if (_ instanceof For)
		// If opForSK is null, there are no breaks, so this is an infinite loop.
		return orDefault(opForSKBlock(_.block), () => SK.Do)
	else if (_ instanceof Case || _ instanceof Switch)
		return compositeSK(_.loc, caseSwitchParts(_).map(opBlockSK))
	else
		//_ instanceof Call || _ instanceof Del || _ instanceof With || _ instanceof Yield || _ instanceof YieldTo
		return null
}

function opForSKBlock({loc, lines}: Block): Op<SK> {
	return isEmpty(lines) ? null : compositeForSK(loc, lines.map(opForSK))
}

function opForSK(_: LineContent): Op<SK> {
	if (_ instanceof Break)
		return _.opValue === null ? SK.Do : SK.Val
	else if (_ instanceof Conditional) {
		const {result} = _
		return result instanceof Block ? opForSKBlock(result) : opForSK(result)
	} else if (_ instanceof Except) {
		const {loc, try: _try, allCatches, opElse, opFinally} = _
		const catches = allCatches.map(_ => _.block)
		// Do look at opFinally for break statements.
		return compositeForSK(loc, cat(_try, catches, opElse, opFinally).map(opForSKBlock))
	} else if (_ instanceof With)
		return opForSKBlock(_.block)
	else if (_ instanceof Case || _ instanceof Switch)
		return compositeForSK(_.loc, caseSwitchParts(_).map(opForSKBlock))
	else
		return null
}

function caseSwitchParts({parts, opElse}: Case | Switch): Array<Block> {
	//todo: should not be necessary
	const prts: Array<CasePart | SwitchPart> = parts
	return cat(prts.map(_ => _.result), opElse)
}

function compositeSK(loc: Loc, parts: Array<Op<SK>>): Op<SK> {
	return composite(loc, parts, _ => _.ambiguousSK)
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
function compositeForSK(loc: Loc, parts: Array<Op<SK>>): Op<SK> {
	return composite(loc, parts, _ => _.ambiguousForSK)
}

function composite(loc: Loc, sks: Array<Op<SK>>, errorMessage: (_: Language) => string): Op<SK> {
	let opSk = sks[0]
	for (let i = 1; i < sks.length; i = i + 1) {
		const otherSK = sks[i]
		if (opSk === null)
			opSk = otherSK
		else
			check(otherSK === null || otherSK === opSk, loc, errorMessage)
	}
	return opSk
}

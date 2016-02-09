import Loc from 'esast/lib/Loc'
import Op, {opMap} from 'op/Op'
import {Funs} from '../ast/Fun'
import {Operators, SpecialVals, UnaryOperators} from '../ast/Val'
import {kwToName, operatorToName, specialValToName, unaryOperatorToName, reservedWords
	} from './keywordNames'
import Token from './Token'

/**
A "keyword" is any set of characters with a particular meaning.
It doensn't necessarily have to be something that might have been a [[Name]].
For example, see [[Kw.ObjEntry]].

This can even include ones like `. ` (defines an object property, as in `key. value`).
Kind is a ***. See the full list below.
*/
abstract class Keyword extends Token {
	abstract name(): string
}
export default Keyword

export class KeywordReserved extends Keyword {
	constructor(loc: Loc, public kind: string) {
		super(loc)
	}

	name(): string {
		return this.kind
	}
}

export class KeywordPlain extends Keyword {
	constructor(loc: Loc, public kind: Kw) {
		super(loc)
	}

	name(): string {
		return keywordName(this.kind)
	}
}
/** Kind of [[KeywordPlain]]. */
export const enum Kw {
	// isExprSplitKeyword
	Await,
	Case,
	Class,
	Cond,
	Del,
	Except,
	For,
	ForAsync,
	ForBag,
	If,
	New,
	Poly,
	Pipe,
	Super,
	Switch,
	Trait,
	Unless,
	With,
	Yield,
	YieldTo,

	// isLineSplitKeyword
	Assign,
	AssignMutate,
	MapEntry,
	// Also works as BagEntry
	ObjEntry,

	// isLineStartKeyword (overlaps to include ObjEntry)
	Assert,
	Break,
	Debugger,
	Dot3,
	Forbid,
	Ignore,
	Pass,
	Throw,
	TraitDo,

	Abstract,
	Ampersand,
	As,
	Built,
	Catch,
	Colon,
	Construct,
	Do,
	Dot,
	Dot2,
	Else,
	Extends,
	Finally,
	Focus,
	Get,
	Import,
	ImportDo,
	ImportLazy,
	Lazy,
	My,
	Of,
	Override,
	Region,
	Set,
	Static,
	Tick,
	Try,
	Virtual
}

export class KeywordOperator extends Keyword {
	constructor(loc: Loc, public kind: Operators) {
		super(loc)
	}

	name(): string {
		return operatorToName.get(this.kind)
	}
}

export class KeywordUnaryOperator extends Keyword {
	constructor(loc: Loc, public kind: UnaryOperators) {
		super(loc)
	}

	name(): string {
		return unaryOperatorToName.get(this.kind)
	}
}

export class KeywordSpecialVal extends Keyword {
	constructor(loc: Loc, public kind: SpecialVals) {
		super(loc)
	}

	name(): string {
		return specialValToName.get(this.kind)
	}
}

export class KeywordFun extends Keyword {
	constructor(loc: Loc, public options: KeywordFunOptions) {
		super(loc)
	}

	name(): string {
		const {isDo, isThisFun, kind} = this.options

		let s = isThisFun ? '.' : ''

		switch (kind) {
			case Funs.Async:
				s = `${s}$`
				break
			case Funs.Generator:
				s = `${s}*`
				break
			default:
		}

		if (isDo)
			s = `${s}!`

		return `${s}\\`
	}
}
export type KeywordFunOptions = {isDo: boolean, isThisFun: boolean, kind: Funs}

export class KeywordComment extends Keyword {
	constructor(loc: Loc, public kind: 'todo' | 'region') {
		super(loc)
	}

	name(): string {
		return this.kind
	}
}

export function isExprSplitKeyword(_: Token): boolean {
	return _ instanceof Keyword &&
		(_ instanceof KeywordFun || _ instanceof KeywordOperator ||
		_ instanceof KeywordUnaryOperator ||
		_ instanceof KeywordPlain && _.kind <= Kw.YieldTo)
}

export function isLineSplitKeyword(_: Token): boolean {
	return _ instanceof KeywordPlain && Kw.Assign <= _.kind && _.kind <= Kw.ObjEntry
}

export function isLineStartKeyword(_: Token): _ is KeywordPlain {
	return _ instanceof KeywordPlain && Kw.ObjEntry <= _.kind && _.kind <= Kw.TraitDo
}

export function keywordName(_: Kw): string {
	return kwToName.get(_)
}

export function isKeyword(kind: Kw, token: Token): token is KeywordPlain {
	return token instanceof KeywordPlain && token.kind === kind
}

// Keywords that don't look like regular identifiers
const notNameKeywords = new Set<Kw>([
	Kw.Ampersand, Kw.AssignMutate, Kw.Colon, Kw.Dot, Kw.Dot2, Kw.Dot3, Kw.Lazy, Kw.ObjEntry, Kw.Tick
])

export function isNameKeyword(_: Token): _ is Keyword {
	return _ instanceof Keyword &&
		!(_ instanceof KeywordFun || _ instanceof KeywordPlain && notNameKeywords.has(_.kind))
}

export function opKeywordFromName(loc: Loc, name: string): Op<Keyword> {
	// I tried a switch statement, but using a map of closures was actually faster.
	return opMap(nameToKeywordCreator.get(name), _ => _(loc))
}

const nameToKeywordCreator = (() => {
	const m = new Map<string, (loc: Loc) => Keyword>()
	for (const _ of reservedWords)
		m.set(_, loc => new KeywordReserved(loc, _))
	for (const [operator, name] of operatorToName)
		m.set(name, loc => new KeywordOperator(loc, operator))
	for (const [unaryOperator, name] of unaryOperatorToName)
		m.set(name, loc => new KeywordUnaryOperator(loc, unaryOperator))
	for (const [specialVal, name] of specialValToName)
		m.set(name, loc => new KeywordSpecialVal(loc, specialVal))

	for (const kw of kwToName.keys())
		if (!notNameKeywords.has(kw)) {
			const name = kwToName.get(kw)
			m.set(name, loc => new KeywordPlain(loc, kw))
		}

	m.set('region', loc => new KeywordComment(loc, 'region'))
	m.set('todo', loc => new KeywordComment(loc, 'todo'))
	return m
})()

// For info.ts.
// Not really *all* keywords, just the ones with names. Includes 'assert' but not '&'.
export const allKeywords = nameToKeywordCreator.keys()

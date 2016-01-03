import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {Val, ValOnly, ValOrDo} from './LineContent'
import MsAst from './MsAst'
import MemberName from './MemberName'

/** One-line @ expression, such as `[ 1 2 3 ]`. */
export class BagSimple extends ValOnly {
	// todo: parts: Args
	constructor(loc: Loc, public parts: Array<Val>) {
		super(loc)
	}
}

/** One-line object expression, such as `(a. 1 b. 2)`. */
export class ObjSimple extends ValOnly {
	constructor(loc: Loc, public pairs: Array<ObjPair>) {
		super(loc)
	}
}
/** Part of an [[ObjSimple]]. */
export class ObjPair extends MsAst {
	constructor(loc: Loc, public key: string, public value: Val) {
		super(loc)
	}
}

/** Literal number value. */
export class NumberLiteral extends ValOnly {
	// value is stored as a string so we can distinguish `0xf` and `15`.
	constructor(loc: Loc, public value: string) {
		super(loc)
	}

	/**
	@override
	Since this is used as a Token, it must implement toString.
	*/
	toString(): string {
		return this.value.toString()
	}
}

/** `{object}.{name}` or `{object}."{name}"`. */
export class Member extends ValOnly {
	constructor(loc: Loc, public object: Val, public name: MemberName) {
		super(loc)
	}
}

export type QuotePart = string | Val

/**
RegExp expression, like `\`foo\``..
Like QuotePlain, may contain interpolation.
*/
export class MsRegExp extends ValOnly {
	constructor(loc: Loc,
		public parts: Array<QuotePart>,
		/** Some selection of the letters in 'gimy' (in that order). */
		public flags: string = '') {
		super(loc)
	}
}

/** [[Quote]] or [[QuoteSimple]]. */
export class QuoteAbstract extends ValOnly {}

/**
Quoted text. Always compiles to a template string.
For tagged templates, use [[QuoteTaggedTemplate]].
*/
export class QuotePlain extends QuoteAbstract {
	// `parts` are Strings interleaved with Vals.
	// part Strings are raw values, meaning "\n" is two characters.
	constructor(loc: Loc, public parts: Array<QuotePart>) {
		super(loc)
	}
}

/** `{tag}"{quote}"` */
export class QuoteTaggedTemplate extends ValOnly {
	constructor(loc: Loc, public tag: Val, public quote: QuotePlain) {
		super(loc)
	}
}

/**
`'{name}`.
Quote consisting of a single name.
*/
export class QuoteSimple extends QuoteAbstract {
	constructor(loc: Loc, public value: string) {
		super(loc)
	}
}

/**
```pipe {value}
	{pipes}```
*/
export class Pipe extends ValOnly {
	constructor(loc: Loc, public startValue: Val, public pipes: Array<Val>) {
		super(loc)
	}
}

/** `{start}..{end}` or `{start}...{end}`. */
export class Range extends ValOnly {
	constructor(loc: Loc,
		public start: Val,
		/** If null, this is an infinite Range. */
		public opEnd: Op<Val>,
		public isExclusive: boolean) {
		super(loc)
	}
}

/** `~{value}` */
export class Lazy extends ValOnly {
	constructor(loc: Loc, public value: Val) {
		super(loc)
	}
}

/** `{instance}:{type}` */
export class InstanceOf extends ValOnly {
	constructor(loc: Loc, public instance: Val, public type: Val) {
		super(loc)
	}
}

/** `{subbed}[{args}]` */
export class Sub extends ValOnly {
	constructor(loc: Loc, public subbed: Val, public args: Array<Val>) {
		super(loc)
	}
}

/**
A special expression.
All SpecialVals are atomic and do not rely on context.
*/
export class SpecialVal extends ValOnly {
	constructor(loc: Loc, public kind: SpecialVals) {
		super(loc)
	}
}

/** Kind of [[SpecialVal]]. */
export const enum SpecialVals {
	/** `false` literal */
	False,
	/**
	`name` value is the name of the nearest assigned value. In:

		x = new Method
			name.

	`name` will be "x".
	*/
	Name,
	/** `null` literal */
	Null,
	/** `true` literal */
	True,
	/** `void 0` */
	Undefined
}

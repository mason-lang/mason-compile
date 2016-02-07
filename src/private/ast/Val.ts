import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {Val, ValOnly} from './LineContent'
import MsAst from './MsAst'
import MemberName from './MemberName'
import Named from './Named'

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
	constructor(loc: Loc, public key: MemberName, public value: Val) {
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
	constructor(
		loc: Loc,
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
export class SpecialVal extends ValOnly implements Named {
	constructor(loc: Loc, public kind: SpecialVals) {
		super(loc)
	}

	isNamed(): void {}
}

/** Kind of [[SpecialVal]]. */
export const enum SpecialVals {
	/** `false` literal */
	False,
	/**
	`name` value is the name of the nearest assigned value. In:

		x = new Foo
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

/** n-ary operator. */
export class Operator extends ValOnly {
	constructor(loc: Loc, public kind: Operators, public args: Array<Val>) {
		super(loc)
	}
}

// Must be kept in sync with Keywords.Op* keywords.
export const enum Operators {
	And,
	Div,
	Eq,
	EqExact,
	Exponent,
	Greater,
	GreaterOrEqual,
	Less,
	LessOrEqual,
	Minus,
	Or,
	Plus,
	Remainder,
	Times
}

/** `neg arg` or `not arg`. */
export class UnaryOperator extends ValOnly {
	constructor(loc: Loc, public kind: UnaryOperators, public arg: Val) {
		super(loc)
	}
}

// Must be in sync with Keywords.Unary* keywords.
export const enum UnaryOperators {
	Neg,
	Not
}

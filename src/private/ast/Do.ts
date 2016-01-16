import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {DoOnly, Val} from './LineContent'
import MemberName from './MemberName'

/**
`ignore` statement.
Keeps the compiler from complaining about an unused local.
*/
export class Ignore extends DoOnly {
	constructor(loc: Loc, public ignoredNames: Array<string>) {
		super(loc)
	}
}

/**
`pass` statement.
Keeps the compiler from complaining about Vals used as Dos.
*/
export class Pass extends DoOnly {
	constructor(loc: Loc, public ignored: Val) {
		super(loc)
	}
}

/**
A special action.
All SpecialDos are atomic and do not rely on context.
*/
export class SpecialDo extends DoOnly {
	constructor(loc: Loc, public kind: SpecialDos) {
		super(loc)
	}
}

/** Kinds of [[SpecialDo]]. */
export const enum SpecialDos {
	Debugger
}

/** Kind of [[MemberSet]] or [[SetSub]]. */
export const enum Setters {
	/** `=` */
	Init,
	/** `:=` */
	Mutate
}

/**
`{object}.{name}:{opType} =/:=/::= {value}`
Also handles `{object}."{name}"`.
*/
export class MemberSet extends DoOnly {
	constructor(
		loc: Loc,
		public object: Val,
		public name: MemberName,
		public opType: Op<Val>,
		public kind: Setters,
		public value: Val) {
		super(loc)
	}
}

/** `{object}[{subbeds}]:{opType} =/:=/::= {value}` */
export class SetSub extends DoOnly {
	constructor(
		loc: Loc,
		public object: Val,
		public subbeds: Array<Val>,
		public opType: Op<Val>,
		public kind: Setters,
		public value: Val) {
		super(loc)
	}
}

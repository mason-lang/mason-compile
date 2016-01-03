import Loc from 'esast/lib/Loc'
import Block from './Block'
import {Val, ValOnly, ValOrDo} from './LineContent'

/**
```if/unless {test}
	{result}```
*/
export class Conditional extends ValOrDo {
	constructor(loc: Loc,
		public test: Val,
		public result: Block | Val,
		public isUnless: boolean) {
		super(loc)
	}
}

/** `cond {test} {ifTrue} {ifFalse}` */
export class Cond extends ValOrDo {
	constructor(loc: Loc, public test: Val, public ifTrue: Val, public ifFalse: Val) {
		super(loc)
	}
}

/** `and` or `or` expression. */
export class Logic extends ValOnly {
	// todo: `args: Args` (support varargs using `any?`/`all?`)
	constructor(loc: Loc, public kind: Logics, public args: Array<Val>) {
		super(loc)
	}
}

/** Kind of [[Logic]]. */
export const enum Logics {
	/** `and` keyword */
	And,
	/** `or` keyword */
	Or
}

/** `not` keyword */
export class Not extends ValOnly {
	constructor(loc: Loc, public arg: Val) {
		super(loc)
	}
}

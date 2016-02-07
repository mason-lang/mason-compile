import Loc from 'esast/lib/Loc'
import Op, {opIf} from 'op/Op'
import {applyDefaults} from '../util'
import Block from './Block'
import {Val, ValOnly} from './LineContent'
import {Operators, UnaryOperators} from './Val'
import {LocalDeclare} from './locals'
import MemberName from './MemberName'
import Named from './Named'

abstract class Fun extends ValOnly {
	// Make this a nominal type
	isFun(): void {}
}
export default Fun

/**
```|:{opDeclareRes} {args} ...{opRestArg}
	{block}```
*/
export class FunBlock extends Fun implements Named {
	kind: Funs
	opDeclareThis: Op<LocalDeclare>
	isDo: boolean
	opReturnType: Op<Val>

	constructor(
		loc: Loc,
		public args: Array<LocalDeclare>,
		public opRestArg: Op<LocalDeclare>,
		public block: Block,
		opts: FunBlockOptions = {}) {
		super(loc)
		const {kind, isThisFun, isDo, opReturnType} = applyDefaults(opts, {
			kind: Funs.Plain,
			isThisFun: false,
			isDo: false,
			opReturnType: null
		})
		this.kind = kind
		this.opDeclareThis = opIf(isThisFun, () => LocalDeclare.this(this.loc))
		this.isDo = isDo
		this.opReturnType = opReturnType
	}

	isNamed(): void {}
}
/** Kind of [[Fun]]. */
export const enum Funs {
	/** Regular function (`|`) */
	Plain,
	/** `$|` */
	Async,
	/** `~|` */
	Generator
}

export type FunBlockOptions = {
	kind?: Funs,
	isThisFun?: boolean,
	isDo?: boolean,
	opReturnType?: Op<Val>
}

/** `&{name}` or `.&{name}` or `{object}.&{name}` */
export class FunMember extends Fun {
	constructor(loc: Loc, public opObject: Op<Val>, public name: MemberName) {
		super(loc)
	}
}

/** `&.{name}` */
export class FunGetter extends Fun {
	constructor(loc: Loc, public name: MemberName) {
		super(loc)
	}
}

/** Function of an n-ary operator, e.g. `&+`. */
export class FunOperator extends Fun {
	constructor(loc: Loc, public kind: Operators) {
		super(loc)
	}
}

/** Function of a unary operator, e.g. `&not`. */
export class FunUnary extends Fun {
	constructor(loc: Loc, public kind: UnaryOperators) {
		super(loc)
	}
}

/** `&({value})` */
export class FunSimple extends Fun {
	constructor(loc: Loc, public value: Val) {
		super(loc)
	}
}

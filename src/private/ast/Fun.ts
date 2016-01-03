import Loc from 'esast/lib/Loc'
import Op, {opIf} from 'op/Op'
import {applyDefaults} from '../util'
import Block from './Block'
import {Val, ValOnly} from './LineContent'
import {LocalDeclare} from './locals'
import MsAst from './MsAst'
import MemberName from './MemberName'

export interface FunLike extends MsAst {
	args: Array<LocalDeclare>
	opRestArg: Op<LocalDeclare>
	opReturnType: Op<Val>
}

/**
```|:{opDeclareRes} {args} ...{opRestArg}
	{block}```
*/
export default class Fun extends ValOnly implements FunLike {
	kind: Funs
	opDeclareThis: Op<LocalDeclare>
	isDo: boolean
	opReturnType: Op<Val>

	constructor(
		loc: Loc,
		public args: Array<LocalDeclare>,
		public opRestArg: Op<LocalDeclare>,
		public block: Block,
		opts: FunOptions = {}) {
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

export type FunOptions = {
	kind?: Funs,
	isThisFun?: boolean,
	isDo?: boolean,
	opReturnType?: Op<Val>
}

export class FunAbstract extends MsAst implements FunLike {
	constructor(
		loc: Loc,
		public args: Array<LocalDeclare>,
		public opRestArg: Op<LocalDeclare>,
		public opReturnType: Op<Val>,
		public opComment: Op<string>) {
		super(loc)
		this.opReturnType = opReturnType
	}
}

/** `&{name}` or `.&{name}` or `{object}.&{name}` */
export class MemberFun extends ValOnly {
	constructor(loc: Loc, public opObject: Op<Val>, public name: MemberName) {
		super(loc)
	}
}

/** `&.{name}` */
export class GetterFun extends ValOnly {
	constructor(loc: Loc, public name: MemberName) {
		super(loc)
	}
}

/** `&({value})` */
export class SimpleFun extends ValOnly {
	constructor(loc: Loc, public value: Val) {
		super(loc)
	}
}

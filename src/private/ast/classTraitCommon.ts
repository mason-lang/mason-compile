import Loc from 'esast/lib/Loc'
import Block from './Block'
import {FunBlock} from './Fun'
import {LocalDeclare} from './locals'
import MemberName from './MemberName'
import MsAst from './MsAst'

/** `do!` part of [[Class]] or [[Trait]]. */
export class ClassTraitDo extends MsAst {
	// todo: create declare in verify
	declareFocus: LocalDeclare

	constructor(loc: Loc, public block: Block) {
		super(loc)
		this.declareFocus = LocalDeclare.focus(loc)
	}
}

export enum MethodImplKind {
	Plain = 0b000,
	My = 0b100,
	Virtual = 0b010,
	Override = 0b001
}

/** Any part of [[Class.statics]] or [[Class.methods]]. */
export abstract class MethodImplLike extends MsAst {
	constructor(loc: Loc, public symbol: MemberName, public kind: MethodImplKind) {
		super(loc)
	}
}

/** `{symbol} {fun}` */
export class MethodImpl extends MethodImplLike {
	constructor(loc: Loc, symbol: MemberName, public fun: FunBlock, kind: MethodImplKind) {
		super(loc, symbol, kind)
	}
}

/**
```get {symbol}
	{block}```
*/
export class MethodGetter extends MethodImplLike {
	// TODO: don't declare here, do it in verify
	declareThis: LocalDeclare

	constructor(loc: Loc, symbol: MemberName, public block: Block, kind: MethodImplKind) {
		super(loc, symbol, kind)
		this.declareThis = LocalDeclare.this(loc)
	}
}

/**
```set {symbol}
	{block}```
*/
export class MethodSetter extends MethodImplLike {
	// TODO: don't declare here, do it in verify
	declareThis: LocalDeclare
	declareFocus: LocalDeclare

	constructor(loc: Loc, symbol: MemberName, public block: Block, kind: MethodImplKind) {
		super(loc, symbol, kind)
		this.block = block
		this.declareThis = LocalDeclare.this(loc)
		this.declareFocus = LocalDeclare.focus(loc)
	}
}

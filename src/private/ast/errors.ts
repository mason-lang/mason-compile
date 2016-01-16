import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {assert, cat} from '../util'
import Block from './Block'
import {DoOnly, Val, ValOrDo} from './LineContent'
import {LocalDeclare} from './locals'
import MsAst from './MsAst'

/** `throw! {opThrown}` */
export class Throw extends DoOnly {
	constructor(loc: Loc, public opThrown: Op<Val>) {
		super(loc)
	}
}

/** `assert!/forbid! {condition} throw! {opThrown}` */
export class Assert extends DoOnly {
	constructor(
		loc: Loc,
		/** If true, this is a `forbid!`. */
		public negate: boolean,
		/** Compiled specially if a [[Call]]. */
		public condition: Val,
		public opThrown: Op<Val>) {
		super(loc)
	}
}

/**
```except
	try
		{try}
	catch
		{opCatch}
	else
		{opElse}
	finally
		{opFinally}```
*/
export class Except extends ValOrDo {
	constructor(
		loc: Loc,
		public tried: Block,
		/** These all have types for their LocalDeclares. */
		public typedCatches: Array<Catch>,
		/** opCatchAll.caught should have no type. */
		public opCatchAll: Op<Catch>,
		public opElse: Op<Block>,
		public opFinally: Op<Block>) {
		super(loc)
	}

	get allCatches(): Array<Catch> {
		return cat(this.typedCatches, this.opCatchAll)
	}
}

/**
```catch {caught}
	{block}```
*/
export class Catch extends MsAst {
	constructor(loc: Loc, public caught: LocalDeclare, public block: Block) {
		super(loc)
		assert(!(caught.isLazy))
	}
}

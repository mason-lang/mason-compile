import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import LineContent, {DoOnly, Val, ValOnly} from './LineContent'
import {Assign, LocalAccess} from './locals'
import MemberName from './MemberName'
import MsAst from './MsAst'

/** Lines in an indented block. */
export default class Block extends MsAst {
	constructor(loc: Loc, public opComment: Op<string>, public lines: Array<LineContent>) {
		super(loc)
	}
}

/**
A block appearing on its own (not as the block to an `if` or the like)
is put into one of these.
e.g.:

	x =
		y = 1
		y
*/
export class BlockWrap extends ValOnly {
	constructor(loc: Loc, public block: Block) {
		super(loc)
	}
}

/** Part of a builder. */
export abstract class BuildEntry extends DoOnly {
	// Make this a nominal type
	isBuildEntry() {}
}

/** Part of a [[BlockObj]]. */
export abstract class ObjEntry extends BuildEntry {
	// Make this a nominal type
	isObjEntry() {}
}

/**
`a. b`
ObjEntry that produces a new local.
*/
export class ObjEntryAssign extends ObjEntry {
	constructor(loc: Loc, public assign: Assign) {
		super(loc)
	}
}

/** ObjEntry that does not introduce a new local. */
export class ObjEntryPlain extends ObjEntry {
	/**
	`{name}.` with no value.
	Takes a local of the same name from outside.
	*/
	static access(loc: Loc, name: string): ObjEntryPlain {
		return new ObjEntryPlain(loc, name, new LocalAccess(loc, name))
	}

	static nameEntry(loc: Loc, value: Val): ObjEntryPlain {
		return new ObjEntryPlain(loc, 'name', value)
	}

	constructor(loc: Loc, public name: MemberName, public value: Val) {
		super(loc)
	}
}

/** `. {value}` or `... {value}` */
export class BagEntry extends BuildEntry {
	constructor(loc: Loc, public value: Val, public isMany: boolean = false) {
		super(loc)
	}
}

/** `key` -> `val` */
export class MapEntry extends BuildEntry {
	constructor(loc: Loc, public key: Val, public val: Val) {
		super(loc)
	}
}

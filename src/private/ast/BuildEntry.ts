import Loc from 'esast/lib/Loc'
import {DoOnly, Val} from './LineContent'
import {Assign, LocalAccess} from './locals'
import MemberName from './MemberName'

/** Part of a builder. */
abstract class BuildEntry extends DoOnly {
	// Make this a nominal type
	isBuildEntry(): void {}
}
export default BuildEntry

/** Part of a [[BlockObj]]. */
export abstract class ObjEntry extends BuildEntry {
	// Make this a nominal type
	isObjEntry(): void {}
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

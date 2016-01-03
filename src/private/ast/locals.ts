import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {DoOnly, Val, ValOnly} from './LineContent'
import MsAst from './MsAst'

/**
All [[LocalAccess]]es must have some LocalDeclare to access.
All accessible identifiers are therefore LocalDeclares.
This includes imports, `this`, the focus, etc.
*/
export class LocalDeclare extends MsAst {
	/** LocalDeclare with no type. */
	static untyped(loc: Loc, name: string, kind: LocalDeclares): LocalDeclare {
		return new LocalDeclare(loc, name, null, kind)
	}

	/** LocalDeclare of just a name. */
	static plain(loc: Loc, name: string): LocalDeclare {
		return new LocalDeclare(loc, name, null, LocalDeclares.Eager)
	}

	static built(loc: Loc): LocalDeclare {
		return this.plain(loc, 'built')
	}
	static focus(loc: Loc): LocalDeclare {
		return this.plain(loc, '_')
	}
	static typedFocus(loc: Loc, type: Val): LocalDeclare {
		return new LocalDeclare(loc, '_', type, LocalDeclares.Eager)
	}
	static this(loc: Loc): LocalDeclare {
		return this.plain(loc, 'this')
	}

	constructor(
		loc: Loc,
		public name: string,
		public opType: Op<Val>,
		public kind: LocalDeclares) {
		super(loc)
	}

	get isLazy(): boolean {
		return this.kind === LocalDeclares.Lazy
	}
}
/** Kind of [[NocalDeclare]]. */
export const enum LocalDeclares {
	/** Declared normally. */
	Eager,
	/** Declared with `~a`. */
	Lazy
}

/** Access the local `name`. */
export class LocalAccess extends ValOnly {
	static focus(loc: Loc): LocalAccess {
		return new LocalAccess(loc, '_')
	}

	static this(loc: Loc): LocalAccess {
		return new LocalAccess(loc, 'this')
	}

	constructor(loc: Loc, public name: string) {
		super(loc)
	}
}

/** `{name} := {value}` */
export class LocalMutate extends DoOnly {
	constructor(loc: Loc, public name: string, public value: Val) {
		super(loc)
	}
}

/** Any expression creating new locals. */
export abstract class Assign extends DoOnly {
	/**
	All locals created by the assign.
	@abstract
	*/
	// todo: abstract getter
	abstract allAssignees(): Array<LocalDeclare>
}

/** `{assignee} =/:=/::= {value}` */
export class AssignSingle extends Assign {
	/** Assign to `_`. */
	static focus(loc: Loc, value: Val): AssignSingle {
		return new AssignSingle(loc, LocalDeclare.focus(loc), value)
	}

	constructor(loc: Loc, public assignee: LocalDeclare, public value: Val) {
		super(loc)
	}

	/** @override */
	allAssignees(): Array<LocalDeclare> {
		return [this.assignee]
	}
}

/** `{assignees} =/:=/::= {value}` */
export class AssignDestructure extends Assign {
	constructor(loc: Loc, public assignees: Array<LocalDeclare>, public value: Val) {
		super(loc)
	}

	/** Kind of locals this assigns to. */
	get kind(): LocalDeclares {
		return this.assignees[0].kind
	}

	/** @override */
	allAssignees(): Array<LocalDeclare> {
		return this.assignees
	}
}

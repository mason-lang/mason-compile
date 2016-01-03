import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import Block from './Block'
import {Val, ValOrDo} from './LineContent'
import {AssignSingle, LocalAccess, LocalDeclare} from './locals'
import MsAst from './MsAst'

/** `case` */
export default class Case extends ValOrDo {
	// todo: create declare in verify for opCased (use Val instead of AssignSingle)
	// opCased: Assignee is always a LocalDeclareFocus.
	constructor(loc: Loc,
		public opCased: Op<AssignSingle>,
		public parts: Array<CasePart>,
		public opElse: Op<Block>) {
		super(loc)
	}
}

/** Single case in a [[Case]]. */
export class CasePart extends MsAst {
	constructor(loc: Loc, public test: Val | Pattern, public result: Block) {
		super(loc)
	}
}

/** `:{type} {locals}` */
export class Pattern extends MsAst {
	// todo: create declare in verify
	patterned: LocalAccess

	constructor(loc: Loc, public type: Val, public locals: Array<LocalDeclare>) {
		super(loc)
		this.patterned = LocalAccess.focus(loc)
	}
}

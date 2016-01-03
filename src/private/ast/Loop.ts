import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import Block from './Block'
import {DoOnly, Val, ValOnly, ValOrDo} from './LineContent'
import {LocalDeclare} from './locals'
import MsAst from './MsAst'

type Loop = For | ForAsync | ForBag
export default Loop

/** `for` */
export class For extends ValOrDo {
	constructor(loc: Loc, public opIteratee: Op<Iteratee>, public block: Block) {
		super(loc)
	}
}

/**
```$for {opIteratee}
*/
export class ForAsync extends ValOrDo {
	constructor(loc: Loc, public iteratee: Iteratee, public block: Block) {
		super(loc)
	}
}

/**
`@for`
Contains many [[BagEntry]] and [[BagEntryMany]].
*/
export class ForBag extends ValOnly {
	// todo: create declare in verify
	built: LocalDeclare

	constructor(loc: Loc, public opIteratee: Op<Iteratee>, public block: Block) {
		super(loc)
		this.built = LocalDeclare.built(loc)
	}
}

/** `x in y` or just `y` (where the local is implicitly `_`). */
export class Iteratee extends MsAst {
	constructor(loc: Loc, public element: LocalDeclare, public bag: Val) {
		super(loc)
	}
}

/** `break` */
export class Break extends DoOnly {
	constructor(loc: Loc, public opValue: Op<Val> = null) {
		super(loc)
	}
}

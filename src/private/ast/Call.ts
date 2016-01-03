import Loc from 'esast/lib/Loc'
import {Val, ValOnly, ValOrDo} from './LineContent'

/** `{called} {args}` */
export default class Call extends ValOrDo {
	constructor(loc: Loc, public called: Val, public args: Arguments) {
		super(loc)
	}
}

export type Argument = Val | Spread
export type Arguments = Array<Argument>

/** `new {type} {args}` */
export class New extends ValOnly {
	constructor(loc: Loc, public type: Val, public args: Arguments) {
		super(loc)
	}
}

/**
`...{spreaded}`
This can only be used in Call, New, or BagSimple.
*/
export class Spread extends ValOnly {
	constructor(loc: Loc, public spreaded: Val) {
		super(loc)
	}
}

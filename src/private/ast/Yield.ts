import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {Val, ValOrDo} from './LineContent'

/** `yield {opValue}` */
export class Yield extends ValOrDo {
	constructor(loc: Loc, public opValue: Op<Val> = null) {
		super(loc)
	}
}

/** `yield* {value}` */
export class YieldTo extends ValOrDo {
	constructor(loc: Loc, public value: Val) {
		super(loc)
	}
}

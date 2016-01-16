import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {Val, ValOrDo} from './LineContent'

export default class YieldLike extends ValOrDo {
	// Make this a nominal type
	isYieldLike(): void { }
}

/** `yield {opValue}` */
export class Yield extends YieldLike {
	constructor(loc: Loc, public opValue: Op<Val> = null) {
		super(loc)
	}
}

/** `yield* {value}` */
export class YieldTo extends YieldLike {
	constructor(loc: Loc, public value: Val) {
		super(loc)
	}
}

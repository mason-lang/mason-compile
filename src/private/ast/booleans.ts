import Loc from 'esast/lib/Loc'
import Block from './Block'
import {Val, ValOrDo} from './LineContent'

/**
```if/unless {test}
	{result}```
*/
export class Conditional extends ValOrDo {
	constructor(
		loc: Loc,
		public test: Val,
		public result: Block | Val,
		public isUnless: boolean) {
		super(loc)
	}
}

/** `cond {test} {ifTrue} {ifFalse}` */
export class Cond extends ValOrDo {
	constructor(loc: Loc, public test: Val, public ifTrue: Val, public ifFalse: Val) {
		super(loc)
	}
}

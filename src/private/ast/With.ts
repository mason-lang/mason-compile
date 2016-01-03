import Loc from 'esast/lib/Loc'
import Block from './Block'
import {Val, ValOrDo} from './LineContent'
import {LocalDeclare} from './locals'

/**
```with {value} [as {declare}]
	{block}```
*/
//todo: not ValOnly, move!
export default class With extends ValOrDo {
	constructor(loc: Loc, public declare: LocalDeclare, public value: Val, public block: Block) {
		super(loc)
	}
}

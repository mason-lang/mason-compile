import Loc from 'esast/lib/Loc'
import {Val, ValOrDo} from './LineContent'

/** `$ {value} `*/
export default class Await extends ValOrDo {
	constructor(loc: Loc, public value: Val) {
		super(loc)
	}
}

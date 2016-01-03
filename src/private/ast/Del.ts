import Loc from 'esast/lib/Loc'
import {Val, ValOrDo} from './LineContent'

/** `del {subbed}[{args}]` */
export default class Del extends ValOrDo {
	constructor(loc: Loc, public subbed: Val, public args: Array<Val>) {
		super(loc)
	}
}

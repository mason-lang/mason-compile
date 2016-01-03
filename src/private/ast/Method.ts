import Loc from 'esast/lib/Loc'
import {FunLike} from './Fun'
import {ValOnly} from './LineContent'

export default class Method extends ValOnly {
	constructor(loc: Loc, public fun: FunLike) {
		super(loc)
	}
}

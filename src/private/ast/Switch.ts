import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import Block from './Block'
import {Val, ValOrDo} from './LineContent'
import MsAst from './MsAst'

/** `switch` */
export default class Switch extends ValOrDo {
	constructor(loc: Loc,
		public switched: Val,
		public parts: Array<SwitchPart>,
		public opElse: Op<Block>) {
		super(loc)
	}
}

/**
Single case in a [[Switch]].
Multiple values are specified with `or`.
*/
export class SwitchPart extends MsAst {
	constructor(loc: Loc, public values: Array<Val>, public result: Block) {
		super(loc)
	}
}

import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import LineContent, {ValOnly} from './LineContent'
import MsAst from './MsAst'

/** Lines in an indented block. */
export default class Block extends MsAst {
	constructor(loc: Loc, public opComment: Op<string>, public lines: Array<LineContent>) {
		super(loc)
	}
}

/**
A block appearing on its own (not as the block to an `if` or the like)
is put into one of these.
e.g.:

	x =
		y = 1
		y
*/
export class BlockWrap extends ValOnly {
	constructor(loc: Loc, public block: Block) {
		super(loc)
	}
}

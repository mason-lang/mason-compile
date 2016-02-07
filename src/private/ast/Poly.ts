import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {FunBlock} from './Fun'
import {Val, ValOnly} from './LineContent'
import {LocalDeclare} from './locals'
import MsAst from './MsAst'

export default class Poly extends ValOnly {
	constructor(loc: Loc, public value: PolyValue) {
		super(loc)
	}
}

export type PolyValue = FunAbstract | FunBlock

export class FunAbstract extends MsAst {
	constructor(
		loc: Loc,
		public args: Array<LocalDeclare>,
		public opRestArg: Op<LocalDeclare>,
		public opReturnType: Op<Val>,
		public opComment: Op<string>) {
		super(loc)
		this.opReturnType = opReturnType
	}
}

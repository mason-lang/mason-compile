import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {ClassTraitDo, MethodImplLike} from './classTraitCommon'
import {DoOnly, Val, ValOnly} from './LineContent'
import Named from './Named'

/** `trait`: create a new trait. */
export default class Trait extends ValOnly implements Named {
	constructor(
		loc: Loc,
		public superTraits: Array<Val>,
		public opComment: Op<string> = null,
		public opDo: Op<ClassTraitDo> = null,
		public statics: Array<MethodImplLike> = [],
		public methods: Array<MethodImplLike> = []) {
		super(loc)
	}

	isNamed(): void {}
}

/** `trait!`: implement a trait for an existing type. */
export class TraitDo extends DoOnly {
	constructor(
		loc: Loc,
		public implementor: Val,
		public trait: Val,
		public statics: Array<MethodImplLike> = [],
		public methods: Array<MethodImplLike> = []) {
		super(loc)
	}
}

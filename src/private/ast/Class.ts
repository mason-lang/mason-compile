import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {Arguments} from './Call'
import {ClassTraitDo, MethodImplLike} from './classTraitCommon'
import {FunBlock} from './Fun'
import {Val, ValOnly, ValOrDo} from './LineContent'
import {LocalDeclare} from './locals'
import MemberName from './MemberName'
import MsAst from './MsAst'
import Named from './Named'

/**
```class {opSuperClass}
	{opComment}
	do!
		{opDo}
	static
		{statics}
	{opConstructor}
	{methods}```
*/
export default class Class extends ValOnly implements Named {
	constructor(
		loc: Loc,
		public opFields: Op<Array<Field>>,
		public opSuperClass: Op<Val>,
		public traits: Array<Val>,
		public opComment: Op<string> = null,
		public opDo: Op<ClassTraitDo> = null,
		public statics: Array<MethodImplLike> = [],
		public opConstructor: Op<Constructor> = null,
		public methods: Array<MethodImplLike> = []) {
		super(loc)
	}

	get isRecord(): boolean {
		return this.opFields !== null
	}

	isNamed(): void {}
}

/** Single field specification for a record class. */
export class Field extends MsAst {
	constructor(loc: Loc, public name: string, public opType: Op<Val> = null) {
		super(loc)
	}
}

/** `construct! {fun}` */
export class Constructor extends MsAst {
	constructor(loc: Loc, public fun: FunBlock, public memberArgs: Array<LocalDeclare>) {
		super(loc)
	}
}

/**
`super {args}`.
Never a [[SuperMember]].
*/
export class SuperCall extends ValOrDo {
	constructor(loc: Loc, public args: Arguments) {
		super(loc)
	}
}

/** `super.{name}` or `super."{name}"`. */
export class SuperMember extends ValOnly {
	constructor(loc: Loc, public name: MemberName) {
		super(loc)
	}
}

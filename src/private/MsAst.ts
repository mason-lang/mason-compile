/* eslint-disable indent */

import Loc from 'esast/lib/Loc'
import Op, {opIf} from 'op/Op'
import {applyDefaults, assert, cat} from './util'
import SK from './verify/SK'

// todo: Would like `export default abstract class MsAst`
// https://github.com/Microsoft/TypeScript/issues/3792
abstract class MsAst {
	constructor(public loc: Loc) {}
}
export default MsAst
interface MsAst {
	//todo
	transpile(arg1?: any, arg2?: any, arg3?: any): any
}

// LineContent
	/**
	Any valid part of a Block.
	Note that some [[Val]]s will still cause warnings if they appear as a line.
	*/
	export abstract class LineContent extends MsAst {
		// Make this a nominal type
		isLineContent(): void {}
	}

	export interface Val extends LineContent {
		// Make this a nominal type
		isVal(): void
	}
	export function isVal(_: LineContent): _ is Val {
		return 'isVal' in _
	}

	export interface Do extends LineContent {
		// Make this a nominal type
		isDo(): void
	}
	export function isDo(_: LineContent): _ is Do {
		return 'isDo' in _
	}

	/** Could act as either a Val or Do. */
	export abstract class ValOrDo extends LineContent implements Val, Do {
		isVal() {}
		isDo() {}
	}

	/** Can only appear as a line of a Block. */
	export abstract class DoOnly extends LineContent implements Do {
		isDo() {}
		// Make this a nominal type
		private isDoOnly() {}
	}

	/** Can only appear as an expression. */
	export abstract class ValOnly extends LineContent implements Val {
		isVal() {}
		// Make this a nominal type
		private isValOnly() {}
	}

	export type Named = Class | Fun | Method | Trait | SpecialVal

// Module
	/** Whole source file. */
	export class Module extends MsAst {
		constructor(
			loc: Loc,
			/** Not used for compilation, but useful for tools. */
			public name: string,
			public opComment: Op<string>,
			public doImports: Array<ImportDo>,
			public imports: Array<Import>,
			public lines: Array<LineContent>) {
			super(loc)
		}
	}

	/** Single import in an `import!` block. */
	export class ImportDo extends MsAst {
		constructor(loc: Loc, public path: string) {
			super(loc)
		}
	}

	/**
	Single import in an `import` block.
	If path is 'global', this is transpiled specially because there's no actual 'global' module.
	*/
	export class Import extends MsAst {
		constructor(loc: Loc,
			public path: string,
			public imported: Array<LocalDeclare>,
			public opImportDefault: Op<LocalDeclare>) {
			super(loc)
		}
	}

// Locals
	/**
	All [[LocalAccess]]es must have some LocalDeclare to access.
	All accessible identifiers are therefore LocalDeclares.
	This includes imports, `this`, the focus, etc.
	*/
	export class LocalDeclare extends MsAst {
		/** LocalDeclare with no type. */
		static untyped(loc: Loc, name: string, kind: LocalDeclares): LocalDeclare {
			return new LocalDeclare(loc, name, null, kind)
		}

		/** LocalDeclare of just a name. */
		static plain(loc: Loc, name: string): LocalDeclare {
			return new LocalDeclare(loc, name, null, LocalDeclares.Eager)
		}

		static built(loc: Loc): LocalDeclare {
			return this.plain(loc, 'built')
		}
		static focus(loc: Loc): LocalDeclare {
			return this.plain(loc, '_')
		}
		static typedFocus(loc: Loc, type: Val): LocalDeclare {
			return new LocalDeclare(loc, '_', type, LocalDeclares.Eager)
		}
		static this(loc: Loc): LocalDeclare {
			return this.plain(loc, 'this')
		}

		constructor(
			loc: Loc,
			public name: string,
			public opType: Op<Val>,
			public kind: LocalDeclares) {
			super(loc)
		}

		get isLazy(): boolean {
			return this.kind === LocalDeclares.Lazy
		}
	}
	/** Kind of [[NocalDeclare]]. */
	export const enum LocalDeclares {
		/** Declared normally. */
		Eager,
		/** Declared with `~a`. */
		Lazy
	}

	/** Access the local `name`. */
	export class LocalAccess extends ValOnly {
		static focus(loc: Loc): LocalAccess {
			return new LocalAccess(loc, '_')
		}

		static this(loc: Loc): LocalAccess {
			return new LocalAccess(loc, 'this')
		}

		constructor(loc: Loc, public name: string) {
			super(loc)
		}
	}

	/** `{name} := {value}` */
	export class LocalMutate extends DoOnly {
		constructor(loc: Loc, public name: string, public value: Val) {
			super(loc)
		}
	}

// Assign
	/** Any expression creating new locals. */
	export abstract class Assign extends DoOnly {
		/**
		All locals created by the assign.
		@abstract
		*/
		// todo: abstract getter
		abstract allAssignees(): Array<LocalDeclare>
	}

	/** `{assignee} =/:=/::= {value}` */
	export class AssignSingle extends Assign {
		/** Assign to `_`. */
		static focus(loc: Loc, value: Val): AssignSingle {
			return new AssignSingle(loc, LocalDeclare.focus(loc), value)
		}

		constructor(loc: Loc, public assignee: LocalDeclare, public value: Val) {
			super(loc)
		}

		/** @override */
		allAssignees(): Array<LocalDeclare> {
			return [this.assignee]
		}
	}

	/** `{assignees} =/:=/::= {value}` */
	export class AssignDestructure extends Assign {
		constructor(loc: Loc, public assignees: Array<LocalDeclare>, public value: Val) {
			super(loc)
		}

		/** Kind of locals this assigns to. */
		get kind(): LocalDeclares {
			return this.assignees[0].kind
		}

		/** @override */
		allAssignees(): Array<LocalDeclare> {
			return this.assignees
		}
	}

	/** Kind of [[MemberSet]] or [[SetSub]]. */
	export const enum Setters {
		/** `=` */
		Init,
		/** `:=` */
		Mutate
	}

	export type Name = string | Val

	/**
	`{object}.{name}:{opType} =/:=/::= {value}`
	Also handles `{object}."{name}"`.
	*/
	export class MemberSet extends DoOnly {
		constructor(loc: Loc,
			public object: Val,
			public name: Name,
			public opType: Op<Val>,
			public kind: Setters,
			public value: Val) {
			super(loc)
		}
	}

	/** `{object}[{subbeds}]:{opType} =/:=/::= {value}` */
	export class SetSub extends DoOnly {
		constructor(loc: Loc,
			public object: Val,
			public subbeds: Array<Val>,
			public opType: Op<Val>,
			public kind: Setters,
			public value: Val) {
			super(loc)
		}
	}

// Errors
	/** `throw! {opThrown}` */
	export class Throw extends DoOnly {
		constructor(loc: Loc, public opThrown: Op<Val>) {
			super(loc)
		}
	}

	/** `assert!/forbid! {condition} throw! {opThrown}` */
	export class Assert extends DoOnly {
		constructor(loc: Loc,
			/** If true, this is a `forbid!`. */
			public negate: boolean,
			/** Compiled specially if a [[Call]]. */
			public condition: Val,
			public opThrown: Op<Val>) {
			super(loc)
		}
	}

	/**
	```except
		try
			{try}
		catch
			{opCatch}
		else
			{opElse}
		finally
			{opFinally}```
	*/
	export class Except extends ValOrDo {
		try: Block

		constructor(
			loc: Loc,
			_try: Block,
			/** These all have types for their LocalDeclares. */
			public typedCatches: Array<Catch>,
			/** opCatchAll.caught should have no type. */
			public opCatchAll: Op<Catch>,
			public opElse: Op<Block>,
			public opFinally: Op<Block>) {
			super(loc)
			this.try = _try
		}

		get allCatches(): Array<Catch> {
			return cat(this.typedCatches, this.opCatchAll)
		}
	}

	/**
	```catch {caught}
		{block}```
	*/
	export class Catch extends MsAst {
		constructor(loc: Loc, public caught: LocalDeclare, public block: Block) {
			super(loc)
			assert(!(caught.isLazy))
		}
	}

// Block
	/** Lines in an indented block. */
	export class Block extends MsAst {
		constructor(loc: Loc, public opComment: Op<string>, public lines: Array<LineContent>) {
			super(loc)
		}
	}

	/** Part of a builder. */
	export abstract class BuildEntry extends DoOnly {}

	/** Part of a [[BlockObj]]. */
	export abstract class ObjEntry extends BuildEntry {}

	/**
	`a. b`
	ObjEntry that produces a new local.
	*/
	export class ObjEntryAssign extends ObjEntry {
		constructor(loc: Loc, public assign: Assign) {
			super(loc)
		}
	}

	/** ObjEntry that does not introduce a new local. */
	export class ObjEntryPlain extends ObjEntry {
		/**
		`{name}.` with no value.
		Takes a local of the same name from outside.
		*/
		static access(loc: Loc, name: string): ObjEntryPlain {
			return new ObjEntryPlain(loc, name, new LocalAccess(loc, name))
		}

		static nameEntry(loc: Loc, value: Val): ObjEntryPlain {
			return new ObjEntryPlain(loc, 'name', value)
		}

		constructor(loc: Loc, public name: Name, public value: Val) {
			super(loc)
		}
	}

	/** `. {value}` or `... {value}` */
	export class BagEntry extends BuildEntry {
		constructor(loc: Loc, public value: Val, public isMany: boolean = false) {
			super(loc)
		}
	}

	/** `key` -> `val` */
	export class MapEntry extends BuildEntry {
		constructor(loc: Loc, public key: Val, public val: Val) {
			super(loc)
		}
	}

// Conditionals
	/**
	```if/unless {test}
		{result}```
	*/
	export class Conditional extends ValOrDo {
		constructor(loc: Loc,
			public test: Val,
			public result: Block | Val,
			public isUnless: boolean) {
			super(loc)
		}
	}

	/** `cond {test} {ifTrue} {ifFalse}` */
	export class Cond extends ValOnly {
		constructor(loc: Loc, public test: Val, public ifTrue: Val, public ifFalse: Val) {
			super(loc)
		}
	}

// Fun
	/*export abstract class FunLike extends ValOnly {
		opReturnType: Op<Val>

		constructor(loc: Loc, public args: Array<LocalDeclare>, public opRestArg: Op<LocalDeclare>) {
			super(loc)
			// TODO: opReturnType should be common too
		}
	}*/
	export interface FunLike extends MsAst {
		args: Array<LocalDeclare>
		opRestArg: Op<LocalDeclare>
		opReturnType: Op<Val>
	}

	/**
	```|:{opDeclareRes} {args} ...{opRestArg}
		{block}```
	*/
	export class Fun extends ValOnly implements FunLike {
		kind: Funs
		opDeclareThis: Op<LocalDeclare>
		isDo: boolean
		opReturnType: Op<Val>

		constructor(
			loc: Loc,
			public args: Array<LocalDeclare>,
			public opRestArg: Op<LocalDeclare>,
			public block: Block,
			opts: {kind?: Funs, isThisFun?: boolean, isDo?: boolean, opReturnType?: Op<Val>} = {}) {
			super(loc)
			const {kind, isThisFun, isDo, opReturnType} = applyDefaults(opts, {
				kind: Funs.Plain,
				isThisFun: false,
				isDo: false,
				opReturnType: null
			})
			this.block = block
			this.kind = kind
			this.opDeclareThis = opIf(isThisFun, () => LocalDeclare.this(this.loc))
			this.isDo = isDo
			this.opReturnType = opReturnType
		}
	}
	/** Kind of [[Fun]]. */
	export const enum Funs {
		/** Regular function (`|`) */
		Plain,
		/** `$|` */
		Async,
		/** `~|` */
		Generator
	}

	export class FunAbstract extends MsAst implements FunLike {
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

	export class Method extends ValOnly {
		constructor(loc: Loc, public fun: FunLike) {
			super(loc)
		}
	}

// Async / Generator

	/** `$ {value} `*/
	export class Await extends ValOrDo {
		constructor(loc: Loc, public value: Val) {
			super(loc)
		}
	}

	/** `yield {opValue}` */
	export class Yield extends ValOrDo {
		constructor(loc: Loc, public opValue: Op<Val> = null) {
			super(loc)
		}
	}

	/** `yield* {value}` */
	export class YieldTo extends ValOrDo {
		constructor(loc: Loc, public value: Val) {
			super(loc)
		}
	}

// Class
	/** `trait`: create a new trait. */
	export class Trait extends ValOnly {
		constructor(
			loc: Loc,
			public superTraits: Array<Val>,
			public opComment: Op<string> = null,
			public opDo: Op<ClassTraitDo> = null,
			public statics: Array<MethodImplLike> = [],
			public methods: Array<MethodImplLike> = []) {
			super(loc)
		}
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
	export class Class extends ValOnly {
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
	}

	/** Single field specification for a record class. */
	export class Field extends MsAst {
		constructor(loc: Loc, public name: string, public opType: Op<Val> = null) {
			super(loc)
		}
	}

	/** `do!` part of [[Class]] or [[Trait]]. */
	export class ClassTraitDo extends MsAst {
		// todo: create declare in verify
		declareFocus: LocalDeclare

		constructor(loc: Loc, public block: Block) {
			super(loc)
			this.declareFocus = LocalDeclare.focus(loc)
		}
	}

	/** `construct! {fun}` */
	export class Constructor extends MsAst {
		constructor(loc: Loc, public fun: Fun, public memberArgs: Array<LocalDeclare>) {
			super(loc)
		}
	}

	/** Any part of [[Class.statics]] or [[Class.methods]]. */
	export abstract class MethodImplLike extends MsAst {
		constructor(loc: Loc, public isMy: boolean, public symbol: Name) {
			super(loc)
		}
	}

	/** `{symbol} {fun}` */
	export class MethodImpl extends MethodImplLike {
		constructor(loc: Loc, isMy: boolean, symbol: Name, public fun: Fun) {
			super(loc, isMy, symbol)
		}
	}

	/**
	```get {symbol}
		{block}```
	*/
	export class MethodGetter extends MethodImplLike {
		// TODO: don't declare here, do it in verify
		declareThis: LocalDeclare

		constructor(loc: Loc, isMy: boolean, symbol: Name, public block: Block) {
			super(loc, isMy, symbol)
			this.declareThis = LocalDeclare.this(loc)
		}
	}

	/**
	```set {symbol}
		{block}```
	*/
	export class MethodSetter extends MethodImplLike {
		// TODO: don't declare here, do it in verify
		declareThis: LocalDeclare
		declareFocus: LocalDeclare

		constructor(loc: Loc, isMy: boolean, symbol: Name, public block: Block) {
			super(loc, isMy, symbol)
			this.block = block
			this.declareThis = LocalDeclare.this(loc)
			this.declareFocus = LocalDeclare.focus(loc)
		}
	}

	export type Args = Array<Val | Spread>

	/**
	`super {args}`.
	Never a [[SuperMember]].
	*/
	export class SuperCall extends ValOrDo {
		constructor(loc: Loc, public args: Args) {
			super(loc)
		}
	}

	/** `super.{name}` or `super."{name}"`. */
	export class SuperMember extends ValOnly {
		constructor(loc: Loc, public name: Name) {
			super(loc)
		}
	}

// Calls
	/** `{called} {args}` */
	export class Call extends ValOrDo {
		constructor(loc: Loc, public called: Val, public args: Args) {
			super(loc)
		}
	}

	/** `new {type} {args}` */
	export class New extends ValOnly {
		constructor(loc: Loc, public type: Val, public args: Args) {
			super(loc)
		}
	}

	/**
	`...{spreaded}`
	This can only be used in Call, New, or BagSimple.
	*/
	export class Spread extends ValOnly {
		constructor(loc: Loc, public spreaded: Val) {
			super(loc)
		}
	}

	/** `~{value}` */
	export class Lazy extends ValOnly {
		constructor(loc: Loc, public value: Val) {
			super(loc)
		}
	}

// Case
	/** `case` */
	export class Case extends ValOrDo {
		// todo: create declare in verify for opCased (use Val instead of AssignSingle)
		// opCased: Assignee is always a LocalDeclareFocus.
		constructor(loc: Loc,
			public opCased: Op<AssignSingle>,
			public parts: Array<CasePart>,
			public opElse: Op<Block>) {
			super(loc)
		}
	}

	/** Single case in a [[Case]]. */
	export class CasePart extends MsAst {
		constructor(loc: Loc, public test: Val | Pattern, public result: Block) {
			super(loc)
		}
	}

	/** `:{type} {locals}` */
	export class Pattern extends MsAst {
		// todo: create declare in verify
		patterned: LocalAccess

		constructor(loc: Loc, public type: Val, public locals: Array<LocalDeclare>) {
			super(loc)
			this.patterned = LocalAccess.focus(loc)
		}
	}

// Switch
	/** `switch` */
	export class Switch extends ValOrDo {
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

// For
	export type Loop = For | ForAsync | ForBag

	/** `for` */
	export class For extends ValOrDo {
		constructor(loc: Loc, public opIteratee: Op<Iteratee>, public block: Block) {
			super(loc)
		}
	}

	/**
	```$for {opIteratee}
	*/
	export class ForAsync extends ValOnly {
		constructor(loc: Loc, public iteratee: Iteratee, public block: Block) {
			super(loc)
		}
	}

	/**
	`@for`
	Contains many [[BagEntry]] and [[BagEntryMany]].
	*/
	export class ForBag extends ValOnly {
		// todo: create declare in verify
		built: LocalDeclare

		constructor(loc: Loc, public opIteratee: Op<Iteratee>, public block: Block) {
			super(loc)
			this.built = LocalDeclare.built(loc)
		}
	}

	/** `x in y` or just `y` (where the local is implicitly `_`). */
	export class Iteratee extends MsAst {
		constructor(loc: Loc, public element: LocalDeclare, public bag: Val) {
			super(loc)
		}
	}

	/** `break` */
	export class Break extends DoOnly {
		constructor(loc: Loc, public opValue: Op<Val> = null) {
			super(loc)
		}
	}

// Miscellaneous Vals
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

	/** One-line @ expression, such as `[ 1 2 3 ]`. */
	export class BagSimple extends ValOnly {
		// todo: parts: Args
		constructor(loc: Loc, public parts: Array<Val>) {
			super(loc)
		}
	}

	/** One-line object expression, such as `(a. 1 b. 2)`. */
	export class ObjSimple extends ValOnly {
		constructor(loc: Loc, public pairs: Array<ObjPair>) {
			super(loc)
		}
	}
	/** Part of an [[ObjSimple]]. */
	export class ObjPair extends MsAst {
		constructor(loc: Loc, public key: string, public value: Val) {
			super(loc)
		}
	}

	/** `and` or `or` expression. */
	export class Logic extends ValOnly {
		// todo: `args: Args` (support varargs using `any?`/`all?`)
		constructor(loc: Loc, public kind: Logics, public args: Array<Val>) {
			super(loc)
		}
	}

	/** Kind of [[Logic]]. */
	export const enum Logics {
		/** `and` keyword */
		And,
		/** `or` keyword */
		Or
	}

	/** `not` keyword */
	export class Not extends ValOnly {
		constructor(loc: Loc, public arg: Val) {
			super(loc)
		}
	}

	/** Literal number value. */
	export class NumberLiteral extends ValOnly {
		// value is stored as a string so we can distinguish `0xf` and `15`.
		constructor(loc: Loc, public value: string) {
			super(loc)
		}

		/**
		@override
		Since this is used as a Token, it must implement toString.
		*/
		toString(): string {
			return this.value.toString()
		}
	}

	/** `{object}.{name}` or `{object}."{name}"`. */
	export class Member extends ValOnly {
		constructor(loc: Loc, public object: Val, public name: Name) {
			super(loc)
		}
	}

	export type QuotePart = string | Val

	/**
	RegExp expression, like `\`foo\``..
	Like QuotePlain, may contain interpolation.
	*/
	export class MsRegExp extends ValOnly {
		constructor(loc: Loc,
			public parts: Array<QuotePart>,
			/** Some selection of the letters in 'gimy' (in that order). */
			public flags: string = '') {
			super(loc)
		}
	}

	/** [[Quote]] or [[QuoteSimple]]. */
	export class QuoteAbstract extends ValOnly {}

	/**
	Quoted text. Always compiles to a template string.
	For tagged templates, use [[QuoteTaggedTemplate]].
	*/
	export class QuotePlain extends QuoteAbstract {
		// `parts` are Strings interleaved with Vals.
		// part Strings are raw values, meaning "\n" is two characters.
		constructor(loc: Loc, public parts: Array<QuotePart>) {
			super(loc)
		}
	}

	/** `{tag}"{quote}"` */
	export class QuoteTaggedTemplate extends ValOnly {
		constructor(loc: Loc, public tag: Val, public quote: QuotePlain) {
			super(loc)
		}
	}

	/**
	`'{name}`.
	Quote consisting of a single name.
	*/
	export class QuoteSimple extends QuoteAbstract {
		constructor(loc: Loc, public value: string) {
			super(loc)
		}
	}

	/**
	```pipe {value}
		{pipes}```
	*/
	export class Pipe extends ValOnly {
		constructor(loc: Loc, public startValue: Val, public pipes: Array<Val>) {
			super(loc)
		}
	}

	/**
	```with {value} [as {declare}]
		{block}```
	*/
	//not ValOnly, so move?
	export class With extends ValOrDo {
		constructor(loc: Loc, public declare: LocalDeclare, public value: Val, public block: Block) {
			super(loc)
		}
	}

	/** `&{name}` or `.&{name}` or `{object}.&{name}` */
	export class MemberFun extends ValOnly {
		constructor(loc: Loc, public opObject: Op<Val>, public name: Name) {
			super(loc)
		}
	}

	/** `&.{name}` */
	export class GetterFun extends ValOnly {
		constructor(loc: Loc, public name: Name) {
			super(loc)
		}
	}

	/** `&({value})` */
	export class SimpleFun extends ValOnly {
		constructor(loc: Loc, public value: Val) {
			super(loc)
		}
	}

	/** `{start}..{end}` or `{start}...{end}`. */
	export class Range extends ValOnly {
		constructor(loc: Loc,
			public start: Val,
			/** If null, this is an infinite Range. */
			//opEnd
			public end: Op<Val>,
			public isExclusive: boolean) {
			super(loc)
		}
	}

// Special
	/** `{instance}:{type}` */
	export class InstanceOf extends ValOnly {
		constructor(loc: Loc, public instance: Val, public type: Val) {
			super(loc)
		}
	}

	/** `{subbed}[{args}]` */
	export class Sub extends ValOnly {
		constructor(loc: Loc, public subbed: Val, public args: Array<Val>) {
			super(loc)
		}
	}

	/** `del {subbed}[{args}]` */
	export class Del extends ValOrDo {
		constructor(loc: Loc, public subbed: Val, public args: Array<Val>) {
			super(loc)
		}
	}

	/**
	A special action.
	All SpecialDos are atomic and do not rely on context.
	*/
	export class SpecialDo extends DoOnly {
		constructor(loc: Loc, public kind: SpecialDos) {
			super(loc)
		}
	}

	/** Kinds of [[SpecialDo]]. */
	export const enum SpecialDos {
		Debugger
	}

	/**
	A special expression.
	All SpecialVals are atomic and do not rely on context.
	*/
	export class SpecialVal extends ValOnly {
		constructor(loc: Loc, public kind: SpecialVals) {
			super(loc)
		}
	}

	/** Kind of [[SpecialVal]]. */
	export const enum SpecialVals {
		/** `false` literal */
		False,
		/**
		`name` value is the name of the nearest assigned value. In:

			x = new Method
				name.

		`name` will be "x".
		*/
		Name,
		/** `null` literal */
		Null,
		/** `true` literal */
		True,
		/** `void 0` */
		Undefined
	}

	/**
	`ignore` statement.
	Keeps the compiler from complaining about an unused local.
	*/
	export class Ignore extends DoOnly {
		constructor(loc: Loc, public ignoredNames: Array<string>) {
			super(loc)
		}
	}

	/**
	`pass` statement.
	Keeps the compiler from complaining about Vals used as Dos.
	*/
	export class Pass extends DoOnly {
		constructor(loc: Loc, public ignored: Val) {
			super(loc)
		}
	}

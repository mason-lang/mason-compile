/* eslint-disable indent */

import {applyDefaults, cat, opIf} from './util'

/**
Any Mason AST.
All ASTs have a `loc` that they pass on to the esast during {@link transpile}.
*/
export default class MsAst {
	constructor(loc) {
		/** @type {Loc} */
		this.loc = loc
	}
}

// LineContent
	/**
	Any valid part of a Block.
	Note that some {@link Val}s will still cause warnings if they appear as a line.
	*/
	export class LineContent extends MsAst {}

	/** Can only appear as lines in a Block. */
	export class Do extends LineContent {}

	/** Can appear in any expression. */
	export class Val extends LineContent {}

// Module
	/** Whole source file. */
	export class Module extends MsAst {
		constructor(loc, name, opComment, doImports, imports, lines) {
			super(loc)
			/**
			Not used for compilation, but useful for tools.
			@type {string}
			*/
			this.name = name
			/** @type {?string} */
			this.opComment = opComment
			/** @type {Array<ImportDo>} */
			this.doImports = doImports
			/** @type {Array<Import>} */
			this.imports = imports
			/** @type {Array<Do>} */
			this.lines = lines
		}
	}

	/** Single import in an `import!` block. */
	export class ImportDo extends MsAst {
		constructor(loc, path) {
			super(loc)
			/** @type {string} */
			this.path = path
		}
	}

	/**
	Single import in an `import` block.
	If path is 'global', this is transpiled specially because there's no actual 'global' module.
	*/
	export class Import extends MsAst {
		constructor(loc, path, imported, opImportDefault) {
			super(loc)
			/** @type {string} */
			this.path = path
			/** @type {Array<LocalDeclare>} */
			this.imported = imported
			/** @type {?LocalDeclare} */
			this.opImportDefault = opImportDefault
		}
	}

// Locals
	/**
	All {@link LocalAccess}es must have some LocalDeclare to access.
	All accessible identifiers are therefore LocalDeclares.
	This includes imports, `this`, the focus, etc.
	*/
	export class LocalDeclare extends MsAst {
		/** LocalDeclare with no type. */
		static untyped(loc, name, kind) {
			return new LocalDeclare(loc, name, null, kind)
		}

		/** LocalDeclare of just a name. */
		static plain(loc, name) {
			return new LocalDeclare(loc, name, null, LocalDeclares.Eager)
		}

		static built(loc) {
			return this.plain(loc, 'built')
		}
		static focus(loc) {
			return this.plain(loc, '_')
		}
		static typedFocus(loc, type) {
			return new LocalDeclare(loc, '_', type, LocalDeclares.Eager)
		}
		static this(loc) {
			return this.plain(loc, 'this')
		}

		constructor(loc, name, opType, kind) {
			super(loc)
			/** @type {string} */
			this.name = name
			/** @type {?Val} */
			this.opType = opType
			/** @type {LocalDeclares} */
			this.kind = kind
		}

		isLazy() {
			return this.kind === LocalDeclares.Lazy
		}
	}
	/**
	Kind of {@link LocalDeclare}.
	@enum {number}
	*/
	export const LocalDeclares = {
		/** Declared normally. */
		Eager: 0,
		/** Declared with `~a`. */
		Lazy: 1
	}

	/** Access the local `name`. */
	export class LocalAccess extends Val {
		static focus(loc) {
			return new LocalAccess(loc, '_')
		}

		static this(loc) {
			return new LocalAccess(loc, 'this')
		}

		constructor(loc, name) {
			super(loc)
			/** @type {string} */
			this.name = name
		}
	}

	/** `{name} := {value}` */
	export class LocalMutate extends Do {
		constructor(loc, name, value) {
			super(loc)
			/** @type {string} */
			this.name = name
			/** @type {Val} */
			this.value = value
		}
	}

// Assign
	/** Any expression creating new locals. */
	export class Assign extends Do {
		/**
		All locals created by the assign.
		@abstract
		*/
		allAssignees() {}
	}

	/** `{assignee} =/:=/::= {value}` */
	export class AssignSingle extends Assign {
		/** Assign to `_`. */
		static focus(loc, value) {
			return new AssignSingle(loc, LocalDeclare.focus(loc), value)
		}

		constructor(loc, assignee, value) {
			super(loc)
			/** @type {LocalDeclare} */
			this.assignee = assignee
			/** @type {Val} */
			this.value = value
		}

		/** @override */
		allAssignees() {
			return [this.assignee]
		}
	}

	/** `{assignees} =/:=/::= {value}` */
	export class AssignDestructure extends Assign {
		constructor(loc, assignees, value) {
			super(loc)
			/** @type {Array<LocalDeclare>} */
			this.assignees = assignees
			/** @type {Val} */
			this.value = value
		}

		/**
		Kind of locals this assigns to.
		@return {LocalDeclares}
		*/
		kind() {
			return this.assignees[0].kind
		}

		/** @override */
		allAssignees() {
			return this.assignees
		}
	}

	/** Kinds of {@link MemberSet} and {@link SetSub}. */
	export const Setters = {
		Init: 0,
		Mutate: 1
	}

	/**
	`{object}.{name}:{opType} =/:=/::= {value}`
	Also handles `{object}."{name}"`.
	*/
	export class MemberSet extends Do {
		constructor(loc, object, name, opType, kind, value) {
			super(loc)
			/** @type {Val} */
			this.object = object
			/** @type {string | Val} */
			this.name = name
			/** @type {?Val} */
			this.opType = opType
			/** @type {Setters} */
			this.kind = kind
			/** @type {Val} */
			this.value = value
		}
	}

	/** `{object}[{subbeds}]:{opType} =/:=/::= {value}` */
	export class SetSub extends Do {
		constructor(loc, object, subbeds, opType, kind, value) {
			super(loc)
			/** @type {Val} */
			this.object = object
			/** @type {Array<Val>} */
			this.subbeds = subbeds
			/** @type {?Val} */
			this.opType = opType
			/** @type {Setters} */
			this.kind = kind
			/** @type {Val} */
			this.value = value
		}
	}

// Errors
	/** `throw! {opThrown}` */
	export class Throw extends Do {
		constructor(loc, opThrown) {
			super(loc)
			/** @type {?Val} */
			this.opThrown = opThrown
		}
	}

	/** `assert!/forbid! {condition} throw! {opThrown}` */
	export class Assert extends Do {
		constructor(loc, negate, condition, opThrown) {
			super(loc)
			/**
			If true, this is a `forbid!`.
			@type {boolean}
			*/
			this.negate = negate
			/**
			Compiled specially if a {@link Call}.
			@type {Val}
			*/
			this.condition = condition
			/** @type {?Val} */
			this.opThrown = opThrown
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
	export class Except extends LineContent {
		constructor(loc, _try, typedCatches, opCatchAll, opElse, opFinally) {
			super(loc)
			/** @type {Block} */
			this.try = _try
			/** @type {Array<Catch>} */
			this.typedCatches = typedCatches
			/**
			opCatchAll.caught should have no type.
			@type {?Catch}
			*/
			this.opCatchAll = opCatchAll
			/** @type {?Block} */
			this.opElse = opElse
			/** @type {?Block} */
			this.opFinally = opFinally
		}

		get allCatches() {
			return cat(this.typedCatches, this.opCatchAll)
		}
	}

	/**
	```catch {caught}
		{block}```
	*/
	export class Catch extends MsAst {
		constructor(loc, caught, block) {
			super(loc)
			/** @type {LocalDeclare} */
			this.caught = caught
			/** @type {Block} */
			this.block = block
		}
	}

// Block
	/** Lines in an indented block. */
	export class Block extends MsAst {
		constructor(loc, opComment, lines) {
			super(loc)
			/** @type {?string} */
			this.opComment = opComment
			/** @type {Array<LineContent>} */
			this.lines = lines
		}
	}

	/** Part of a builder. */
	export class BuildEntry extends MsAst {}

	/** Part of a {@link BlockObj}. */
	export class ObjEntry extends BuildEntry {
		constructor(loc) {
			super(loc)
		}
	}

	/**
	`a. b`
	ObjEntry that produces a new local.
	*/
	export class ObjEntryAssign extends ObjEntry {
		constructor(loc, assign) {
			super(loc)
			/** @type {Assign} */
			this.assign = assign
		}
	}

	/** ObjEntry that does not introduce a new local. */
	export class ObjEntryPlain extends ObjEntry {
		/**
		`{name}.` with no value.
		Takes a local of the same name from outside.
		*/
		static access(loc, name) {
			return new ObjEntryPlain(loc, name, new LocalAccess(loc, name))
		}

		static name(loc, value) {
			return new ObjEntryPlain(loc, 'name', value)
		}

		constructor(loc, name, value) {
			super(loc)
			/** @type {string | Val} */
			this.name = name
			/** @type {Val} */
			this.value = value
		}
	}

	/** `. {value}` or `... {value}` */
	export class BagEntry extends BuildEntry {
		constructor(loc, value, isMany) {
			super(loc)
			/** @type {Val} */
			this.value = value
			/** @type {boolean} */
			this.isMany = isMany
		}
	}

	/** `key` -> `val` */
	export class MapEntry extends BuildEntry {
		constructor(loc, key, val) {
			super(loc)
			/** @type {Val} */
			this.key = key
			/** @type {Val} */
			this.val = val
		}
	}

// Conditionals
	/**
	```if/unless {test}
		{result}```
	*/
	export class Conditional extends LineContent {
		constructor(loc, test, result, isUnless) {
			super(loc)
			/** @type {Val} */
			this.test = test
			/** @type {Block|Val} */
			this.result = result
			/** @type {boolean} */
			this.isUnless = isUnless
		}
	}

	/** `cond {test} {ifTrue} {ifFalse}` */
	export class Cond extends Val {
		constructor(loc, test, ifTrue, ifFalse) {
			super(loc)
			/** @type {Val} */
			this.test = test
			/** @type {Val} */
			this.ifTrue = ifTrue
			/** @type {Val} */
			this.ifFalse = ifFalse
		}
	}

// Fun
	export class FunLike extends Val {
		constructor(loc, args, opRestArg) {
			super(loc)
			/** @type {Array<LocalDeclare>} */
			this.args = args
			/** @type {?LocalDeclare} */
			this.opRestArg = opRestArg
			// TODO: opReturnType should be common too
		}
	}

	/**
	```|:{opDeclareRes} {args} ...{opRestArg}
		{block}```
	*/
	export class Fun extends FunLike {
		constructor(loc, args, opRestArg, block, opts = {}) {
			const {kind, isThisFun, isDo, opReturnType} = applyDefaults(opts, {
				kind: Funs.Plain,
				isThisFun: false,
				isDo: false,
				opReturnType: null
			})

			super(loc, args, opRestArg)
			/** @type {Block} */
			this.block = block
			/** @type {Funs} */
			this.kind = kind
			/** @type {?LocalDeclareThis} */
			this.opDeclareThis = opIf(isThisFun, () => LocalDeclare.this(this.loc))
			/** @type {boolean} */
			this.isDo = isDo || false
			/** @type {?Val} */
			this.opReturnType = opReturnType
		}
	}
	/**
	Kinds of {@link Fun}.
	@enum {number}
	*/
	export const Funs = {
		/** Regular function (`|`) */
		Plain: 0,
		/** `$|` */
		Async: 1,
		/** `~|` */
		Generator: 2
	}

	export class FunAbstract extends FunLike {
		constructor(loc, args, opRestArg, opReturnType, opComment) {
			super(loc, args, opRestArg)
			/** @type {?Val} */
			this.opReturnType = opReturnType
			/** @type {?string} */
			this.opComment = opComment
		}
	}

	export class Method extends Val {
		constructor(loc, fun) {
			super(loc)
			/** @type {FunLike} */
			this.fun = fun
		}
	}

// Async / Generator

	/** `$ {value} `*/
	export class Await extends Val {
		constructor(loc, value) {
			super(loc)
			/** @type {Val} */
			this.value = value
		}
	}

	/** `yield {opValue}` */
	export class Yield extends Val {
		constructor(loc, opValue = null) {
			super(loc)
			/** @type {?Val} */
			this.opValue = opValue
		}
	}

	/** `yield* {value}` */
	export class YieldTo extends Val {
		constructor(loc, value) {
			super(loc)
			/** @type {Val} */
			this.value = value
		}
	}

// Class
	export class Trait extends Val {
		constructor(loc, superTraits, opComment = null, opDo = null, statics = [], methods = []) {
			super(loc)
			/** @type {Array<Val>} */
			this.superTraits = superTraits
			/** @type {?string} */
			this.opComment = opComment
			/** @type {?ClassTraitDo} */
			this.opDo = opDo
			/** @type {Array<MethodImplLike>} */
			this.statics = statics
			/** @type {Array<MethodImplLike>} */
			this.methods = methods
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
	export class Class extends Val {
		constructor(
			loc, opFields, opSuperClass, traits,
			opComment = null, opDo = null, statics = [], opConstructor = null, methods = []) {
			super(loc)
			/** @type {?Array<LocalDeclare>} */
			this.opFields = opFields
			/** @type {?Val} */
			this.opSuperClass = opSuperClass
			/** @type {Array<Val>} */
			this.traits = traits
			/** @type {?string} */
			this.opComment = opComment
			/** @type {?ClassTraitDo} */
			this.opDo = opDo
			/** @type {Array<MethodImplLike>} */
			this.statics = statics
			/** @type {?Constructor} */
			this.opConstructor = opConstructor
			/** @type {Array<MethodImplLike>} */
			this.methods = methods
		}

		get isRecord() {
			return this.opFields !== null
		}
	}

	/** Single field specification for a record class. */
	export class Field extends MsAst {
		constructor(loc, name, opType = null) {
			super(loc)
			/** @type {string} */
			this.name = name
			/** @type {?Val} */
			this.opType = opType
		}
	}

	/** `do!` part of {@link Class} or {@link Trait}. */
	export class ClassTraitDo extends MsAst {
		constructor(loc, block) {
			super(loc)
			/** @type {Block} */
			this.block = block
			/** @type {LocalDeclareFocus} */
			this.declareFocus = LocalDeclare.focus(loc)
		}
	}

	/** `construct! {fun}` */
	export class Constructor extends MsAst {
		constructor(loc, fun, memberArgs) {
			super(loc)
			/** @type {Fun} */
			this.fun = fun
			/** @type {Array<LocalDeclare>} */
			this.memberArgs = memberArgs
		}
	}

	/** Any part of {@link Class.statics} or {@link Class.methods}. */
	export class MethodImplLike extends MsAst {
		constructor(loc, isMy, symbol) {
			super(loc)
			/**
			Used by tools.
			@type {boolean}
			*/
			this.isMy = isMy
			/** @type {string | Val} */
			this.symbol = symbol
		}
	}
	/** `{symbol} {fun}` */
	export class MethodImpl extends MethodImplLike {
		constructor(loc, isMy, symbol, fun) {
			super(loc, isMy, symbol)
			/** @type {Fun} */
			this.fun = fun
		}
	}
	/**
	```get {symbol}
		{block}```
	*/
	export class MethodGetter extends MethodImplLike {
		constructor(loc, isMy, symbol, block) {
			super(loc, isMy, symbol)
			/** @type {Block} */
			this.block = block
			this.declareThis = LocalDeclare.this(loc)
		}
	}
	/**
	```set {symbol}
		{block}```
	*/
	export class MethodSetter extends MethodImplLike {
		constructor(loc, isMy, symbol, block) {
			super(loc, isMy, symbol)
			/** @type {Block} */
			this.block = block
			this.declareThis = LocalDeclare.this(loc)
			this.declareFocus = LocalDeclare.focus(loc)
		}
	}

	/**
	`super {args}`.
	Never a {@link SuperMember}.
	*/
	export class SuperCall extends LineContent {
		constructor(loc, args) {
			super(loc)
			/** @type {Array<Val | Spread>} */
			this.args = args
		}
	}

	/** `super.{name}` or `super."{name}"`. */
	export class SuperMember extends Val {
		constructor(loc, name) {
			super(loc)
			/** @type {string | Val} */
			this.name = name
		}
	}

// Calls
	/** `{called} {args}` */
	export class Call extends Val {
		constructor(loc, called, args) {
			super(loc)
			/** @type {Val} */
			this.called = called
			/** @type {Array<Val | Spread>} */
			this.args = args
		}
	}

	/** `new {type} {args}` */
	export class New extends Val {
		constructor(loc, type, args) {
			super(loc)
			/** @type {Val} */
			this.type = type
			/** @type {Val | Spread} */
			this.args = args
		}
	}

	/**
	`...{spreaded}`
	This can only be used in Call, New, or BagSimple.
	*/
	export class Spread extends Val {
		constructor(loc, spreaded) {
			super(loc)
			/** @type {Val} */
			this.spreaded = spreaded
		}
	}

	/** `~{value}` */
	export class Lazy extends Val {
		constructor(loc, value) {
			super(loc)
			/** @type {Val} */
			this.value = value
		}
	}

// Case
	/** `case` */
	export class Case extends LineContent {
		constructor(loc, opCased, parts, opElse) {
			super(loc)
			/**
			Assignee is always a LocalDeclareFocus.
			@type {?AssignSingle}
			*/
			this.opCased = opCased
			/** @type {Array<CasePart>} */
			this.parts = parts
			/** @type {?Block} */
			this.opElse = opElse
		}
	}
	/** Single case in a {@link Case}. */
	export class CasePart extends MsAst {
		constructor(loc, test, result) {
			super(loc)
			/** @type {Val | Pattern} */
			this.test = test
			/** @type {Block} */
			this.result = result
		}
	}

	/** `:{type} {locals}` */
	export class Pattern extends MsAst {
		constructor(loc, type, locals) {
			super(loc)
			/** @type {Val} */
			this.type = type
			/** @type {Array<LocalDeclare>} */
			this.locals = locals
			/** @type {LocalAccess} */
			this.patterned = LocalAccess.focus(loc)
		}
	}

// Switch
	/** `switch` */
	export class Switch extends LineContent {
		constructor(loc, switched, parts, opElse) {
			super(loc)
			/** @type {Val} */
			this.switched = switched
			/** @type {Array<SwitchPart>} */
			this.parts = parts
			/** @type {?Block} */
			this.opElse = opElse
		}
	}
	/**
	Single case in a {@link Switch}.
	Multiple values are specified with `or`.
	*/
	export class SwitchPart extends MsAst {
		constructor(loc, values, result) {
			super(loc)
			/** @type {Array<Val>} */
			this.values = values
			/** @type {Block} */
			this.result = result
		}
	}

// For
	/** `for` */
	export class For extends LineContent {
		constructor(loc, opIteratee, block) {
			super(loc)
			/** @type {?Iteratee} */
			this.opIteratee = opIteratee
			/** @type {Block} */
			this.block = block
		}
	}

	/**
	```$for {opIteratee}
	*/
	export class ForAsync extends Val {
		constructor(loc, iteratee, block) {
			super(loc)
			/** @type {Iteratee} */
			this.iteratee = iteratee
			/** @type {Block} */
			this.block = block
		}
	}

	/**
	`@for`
	Contains many {@link BagEntry} and {@link BagEntryMany}.
	*/
	export class ForBag extends Val {
		constructor(loc, opIteratee, block) {
			super(loc)
			/** @type {?Iteratee} */
			this.opIteratee = opIteratee
			/** @type {Block} */
			this.block = block
			this.built = LocalDeclare.built(loc)
		}
	}

	/** `x in y` or just `y` (where the local is implicitly `_`). */
	export class Iteratee extends MsAst {
		constructor(loc, element, bag) {
			super(loc)
			/** @type {LocalDeclare} */
			this.element = element
			/** @type {Val} */
			this.bag = bag
		}
	}

	/** `break` */
	export class Break extends Do {
		constructor(loc, opValue = null) {
			super(loc)
			/** @type {?Val} */
			this.opValue = opValue
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
	export class BlockWrap extends Val {
		constructor(loc, block) {
			super(loc)
			/** @type {Block} */
			this.block = block
		}
	}

	/** One-line @ expression, such as `[ 1 2 3 ]`. */
	export class BagSimple extends Val {
		constructor(loc, parts) {
			super(loc)
			/** @type {Array<Val>} */
			this.parts = parts
		}
	}

	/** One-line object expression, such as `(a. 1 b. 2)`. */
	export class ObjSimple extends Val {
		constructor(loc, pairs) {
			super(loc)
			/** @type {Array<ObjPair>} */
			this.pairs = pairs
		}
	}
	/** Part of an {@link ObjSimple}. */
	export class ObjPair extends MsAst {
		constructor(loc, key, value) {
			super(loc)
			/** @type {string} */
			this.key = key
			/** @type {Val} */
			this.value = value
		}
	}

	/** `and` or `or` expression. */
	export class Logic extends Val {
		constructor(loc, kind, args) {
			super(loc)
			/** @type {Logics} */
			this.kind = kind
			/** @type {Array<Val>} */
			this.args = args
		}
	}
	/**
	Kinds of {@link Logic}.
	@enum {number}
	*/
	export const Logics = {
		/** `and` keyword*/
		And: 0,
		/** `or` keyword */
		Or: 1
	}

	/** `not` keyword */
	export class Not extends Val {
		constructor(loc, arg) {
			super(loc)
			/** @type {Val} */
			this.arg = arg
		}
	}

	/**
	Literal number value.
	This is both a Token and MsAst.
	*/
	export class NumberLiteral extends Val {
		constructor(loc, value) {
			super(loc)
			/**
			Store as a string so we can distinguish `0xf` and `15`.
			@type {string}
			*/
			this.value = value
		}

		/**
		@override
		Since this is used as a Token, it must implement toString.
		*/
		toString() {
			return this.value.toString()
		}
	}

	/** `{object}.{name}` or `{object}."{name}"`. */
	export class Member extends Val {
		constructor(loc, object, name) {
			super(loc)
			/** @type {Val} */
			this.object = object
			/**
			If a string, could still be any string, so may still compile to `a['string']`.
			@type {string | Val}
			*/
			this.name = name
		}
	}

	/**
	RegExp expression, like `\`foo\``..
	Like QuotePlain, may contain interpolation.
	*/
	export class MsRegExp extends Val {
		constructor(loc, parts, flags = '') {
			super(loc)
			/** @type {Array<string | Val>} */
			this.parts = parts
			/**
			Some selection of the letters in 'gimy' (in that order).
			@type {string}
			*/
			this.flags = flags
		}
	}

	/** {@link Quote} or {@link QuoteSimple}. */
	export class QuoteAbstract extends Val {}

	/**
	Quoted text. Always compiles to a template string.
	For tagged templates, use {@link QuoteTaggedTemplate}.
	*/
	export class QuotePlain extends QuoteAbstract {
		constructor(loc, parts) {
			super(loc)
			/**
			`parts` are Strings interleaved with Vals.
			part Strings are raw values, meaning "\n" is two characters.
			@type {Array<string | Val>}
			*/
			this.parts = parts
		}
	}

	/** `{tag}"{quote}"` */
	export class QuoteTaggedTemplate extends Val {
		constructor(loc, tag, quote) {
			super(loc)
			/** @type {Val} */
			this.tag = tag
			/** @type {Quote} */
			this.quote = quote
		}
	}

	/**
	`'{name}`.
	Quote consisting of a single name.
	*/
	export class QuoteSimple extends QuoteAbstract {
		constructor(loc, name) {
			super(loc)
			/** @type {string} */
			this.name = name
		}
	}

	/**
	```pipe {value}
		{pipes}```
	*/
	export class Pipe extends Val {
		constructor(loc, value, pipes) {
			super(loc)
			/** @type {Val} */
			this.value = value
			/** @type {Array<Val>} */
			this.pipes = pipes
		}
	}

	/**
	```with {value} [as {declare}]
		{block}```
	*/
	export class With extends Val {
		constructor(loc, declare, value, block) {
			super(loc)
			/** @type {LocalDeclare} */
			this.declare = declare
			/** @type {Val} */
			this.value = value
			/** @type {Block} */
			this.block = block
		}
	}

	/** `&{name}` or `.&{name}` or `{object}.&{name}` */
	export class MemberFun extends Val {
		constructor(loc, opObject, name) {
			super(loc)
			/** @type {?Val} */
			this.opObject = opObject
			/** @type {string | Val} */
			this.name = name
		}
	}

	/** `&.{name}` */
	export class GetterFun extends Val {
		constructor(loc, name) {
			super(loc)
			/** @type {string | Val} */
			this.name = name
		}
	}

	/** `&({value})` */
	export class SimpleFun extends Val {
		constructor(loc, value) {
			super(loc)
			/** @type {Val} */
			this.value = value
		}
	}

	/** `{start}..{end}` or `{start}...{end}`. */
	export class Range extends Val {
		constructor(loc, start, end, isExclusive) {
			super(loc)
			/** @type {Val} */
			this.start = start
			/**
			If null, this is an infinite Range.
			@type {?Val}
			*/
			this.end = end
			/** @type {boolean} */
			this.isExclusive = isExclusive
		}
	}

// Special
	/** `{instance}:{type}` */
	export class InstanceOf extends Val {
		constructor(loc, instance, type) {
			super(loc)
			/** @type {Val} */
			this.instance = instance
			/** @type {Val} */
			this.type = type
		}
	}

	/** `{subbed}[{args}]` */
	export class Sub extends Val {
		constructor(loc, subbed, args) {
			super(loc)
			/** @type {Val} */
			this.subbed = subbed
			/** @type {Array<Val>} */
			this.args = args
		}
	}

	/** `del {subbed}[{args}]` */
	export class Del extends LineContent {
		constructor(loc, subbed, args) {
			super(loc)
			/** @type {Val} */
			this.subbed = subbed
			/** @type {Array<Val>} */
			this.args = args
		}
	}

	/**
	A special action.
	All SpecialDos are atomic and do not rely on context.
	*/
	export class SpecialDo extends Do {
		constructor(loc, kind) {
			super(loc)
			/** @type {SpecialDos} */
			this.kind = kind
		}
	}
	/**
	Kinds of {@link SpecialDo}.
	@enum {number}
	*/
	export const SpecialDos = {
		Debugger: 0
	}

	/**
	A special expression.
	All SpecialVals are atomic and do not rely on context.
	*/
	export class SpecialVal extends Val {
		constructor(loc, kind) {
			super(loc)
			/** @type {SpecialVals} */
			this.kind = kind
		}
	}

	/**
	Kinds of {@link SpecialVal}.
	@enum {number}
	*/
	export const SpecialVals = {
		/** `false` literal */
		False: 0,
		/**
		`name` value is the name of the nearest assigned value. In:

			x = new Method
				name.

		`name` will be "x".
		*/
		Name: 1,
		/** `null` literal */
		Null: 2,
		/** `true` literal */
		True: 3,
		/** `void 0` */
		Undefined: 4
	}

	/**
	`ignore` statement.
	Keeps the compiler from complaining about an unused local.
	*/
	export class Ignore extends Do {
		constructor(loc, ignoredNames) {
			super(loc)
			/** @type {Array<string>} */
			this.ignoredNames = ignoredNames
		}
	}

	/**
	`pass` statement.
	Keeps the compiler from complaining about Vals used as Dos.
	*/
	export class Pass extends Do {
		constructor(loc, ignored) {
			super(loc)
			/** @type {?Val} */
			this.ignored = ignored
		}
	}

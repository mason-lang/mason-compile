import {cat, opIf} from './util'

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
	export class LineContent extends MsAst { }

	/** Can only appear as lines in a Block. */
	export class Do extends LineContent { }

	/** Can appear in any expression. */
	export class Val extends LineContent { }

// Module
	/** Whole source file. */
	export class Module extends MsAst {
		constructor(loc, name, opComment, doImports, imports, opImportGlobal, lines) {
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
			/** @type {?ImportGlobal} */
			this.opImportGlobal = opImportGlobal
			/** @type {Array<Do>} */
			this.lines = lines
		}
	}

	/** Single export. */
	export class ModuleExport extends Do {
		constructor(loc, assign) {
			super(loc)
			/** @type {AssignSingle} */
			this.assign = assign
		}
	}
	/** Created with an ObjAssign in root. */
	export class ModuleExportNamed extends ModuleExport { }
	/** Created by assigning to the module's name. */
	export class ModuleExportDefault extends ModuleExport { }

	/** Single import in an `import!` block. */
	export class ImportDo extends MsAst {
		constructor(loc, path) {
			super(loc)
			/** @type {string} */
			this.path = path
		}
	}

	/** Single import in an `import` block. */
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

	/**
	Imports from 'global' are handled specially because there's no module to import from.
	Other than that, same as {@link Import}.
	*/
	export class ImportGlobal extends MsAst {
		constructor(loc, imported, opImportDefault) {
			super(loc)
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
			return new LocalDeclare(loc, name, null, LocalDeclares.Const)
		}

		static built(loc) {
			return this.plain(loc, 'built')
		}
		static focus(loc) {
			return this.plain(loc, '_')
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

		isMutable() {
			return this.kind === LocalDeclares.Mutable
		}
	}
	/**
	Kind of {@link LocalDeclare}.
	@enum {number}
	*/
	export const LocalDeclares = {
		/** Declared normally. */
		Const: 0,
		/** Declared with `~a`. */
		Lazy: 1,
		/** Declared with `::=`. */
		Mutable: 2
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
		allAssignees() { return [this.assignee] }
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

	export const Setters = {
		Init: 0,
		Mutate: 1,
		InitMutable: 2
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
	```except!
		try!
			{try}
		catch!
			{catch}
		finally!
			{finally}```
	*/
	export class ExceptDo extends Do {
		constructor(loc, _try, _catch, _finally) {
			super(loc)
			/** @type {BlockDo} */
			this.try = _try
			/** @type {?Catch} */
			this.catch = _catch
			/** @type {?BlockDo} */
			this.finally = _finally
		}
	}

	/**
	```except
		try
			{try}
		catch
			{catch}
		finally!
			{finally}```
	*/
	export class ExceptVal extends Val {
		constructor(loc, _try, _catch, _finally) {
			super(loc)
			/** @type {BlockVal} */
			this.try = _try
			/** @type {?Catch} */
			this.catch = _catch
			/** @type {BlockDo} */
			this.finally = _finally
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
	/**
	Code in an indented block.
	See {@link BlockWrap} for the kind that appears where a Val is expected.
	*/
	export class Block extends MsAst {
		constructor(loc, opComment /* Opt[String] */) {
			super(loc)
			/** @type {?string} */
			this.opComment = opComment
		}
	}

	/** Block that just performs actions and doesn't have any value. */
	export class BlockDo extends Block {
		constructor(loc, opComment, lines) {
			super(loc, opComment)
			/** @type {Array<LineContent>} */
			this.lines = lines
		}
	}

	/** Block having a value. */
	export class BlockVal extends Block { }

	/**
	BlockVal that actually returns a value at the end.
	(The most common kind by far.)
	*/
	export class BlockValReturn extends BlockVal {
		constructor(loc, opComment, lines, returned) {
			super(loc, opComment)
			/** @type {Array<LineContent>} */
			this.lines = lines
			/** @type {Val} */
			this.returned = returned
		}
	}

	/** Takes the place of a BlockVal, but doesn't actually return a value — throws. */
	export class BlockValThrow extends BlockVal {
		constructor(loc, opComment, lines, _throw) {
			super(loc, opComment)
			/** @type {Array<LineContent>} */
			this.lines = lines
			/** @type {Throw} */
			this.throw = _throw
		}
	}

	// TODO: BlockBag, BlockMap, BlockObj => BlockBuild(kind, ...)
	/**
	Block returning an Object.
	Contains many {@link ObjEntry}.
	*/
	export class BlockObj extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment)
			this.built = LocalDeclare.built(loc)
			/** @type {Array<LineContent | ObjEntry>} */
			this.lines = lines
		}
	}

	/** Part of a {@link BlockObj */
	export class ObjEntry extends Do {
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

	/**
	Bag-building block.
	Contains many {@link BagEntry} and {@link BagEntryMany}.
	*/
	export class BlockBag extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment)
			this.built = LocalDeclare.built(loc)
			/** @type {Array<LineContent | BagEntry>} */
			this.lines = lines
		}
	}

	/** `. {value}` */
	export class BagEntry extends Do {
		constructor(loc, value) {
			super(loc)
			/** @type {Val} */
			this.value = value
		}
	}

	/** `... {value}` */
	export class BagEntryMany extends Do {
		constructor(loc, value) {
			super(loc)
			/** @type {Val} */
			this.value = value
		}
	}

	/**
	Map-building block.
	Contains many {@link MapEntry}.
	*/
	export class BlockMap extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment)
			this.built = LocalDeclare.built(loc)
			/** @type {LineContent | MapEntry} */
			this.lines = lines
		}
	}

	/** `key` -> `val` */
	export class MapEntry extends Do {
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
	```if!/unless! {test}
		{result}```
	*/
	export class ConditionalDo extends Do {
		constructor(loc, test, result, isUnless) {
			super(loc)
			/** @type {Val} */
			this.test = test
			/** @type {BlockDo} */
			this.result = result
			/** @type {boolean} */
			this.isUnless = isUnless
		}
	}

	/**
	```if/unless {test}
		{result}```
	*/
	export class ConditionalVal extends Val {
		constructor(loc, test, result, isUnless) {
			super(loc)
			/** @type {Val} */
			this.test = test
			/** @type {BlockVal} */
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
	/**
	```|:{opDeclareRes} {args} ...{opRestArg}
		{block}```
	*/
	export class Fun extends Val {
		constructor(loc, args, opRestArg, block, kind=Funs.Plain, isThisFun=false, opReturnType=null) {
			super(loc)
			/** @type {Array<LocalDeclare>} */
			this.args = args
			/** @type {?LocalDeclare} */
			this.opRestArg = opRestArg
			/** @type {Block} */
			this.block = block
			/** @type {Funs} */
			this.kind = kind
			/** @type {?LocalDeclareThis} */
			this.opDeclareThis = opIf(isThisFun, () => LocalDeclare.this(this.loc))
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

// Generator
	/**
	`<~ {opYielded}`
	These are also the value part of `a <~ b` assignments.
	*/
	export class Yield extends Val {
		constructor(loc, opYielded=null) {
			super(loc)
			/** @type {?Val} */
			this.opYielded = opYielded
		}
	}

	/**
	`<~~ {yieldedTo}`
	These are also the value part of `a <~~ b` assignments.
	*/
	export class YieldTo extends Val {
		constructor(loc, yieldedTo) {
			super(loc)
			/** @type {Val} */
			this.yieldedTo = yieldedTo
		}
	}

// Class
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
		constructor(loc, opSuperClass, opComment, opDo, statics, opConstructor, methods) {
			super(loc)
			/** @type {?Val} */
			this.opSuperClass = opSuperClass
			/** @type {?string} */
			this.opComment = opComment
			/** @type {?ClassDo} */
			this.opDo = opDo
			/** @type {Array<MethodImplLike>} */
			this.statics = statics
			/** @type {?Constructor} */
			this.opConstructor = opConstructor
			/** @type {Array<MethodImplLike>} */
			this.methods = methods
		}
	}

	/** `construct! {fun}` */
	export class Constructor extends MsAst {
		constructor(loc, fun, memberArgs) {
			super(loc)
			/**
			This will always have a {@link BlockDo}.
			@type {Fun}
			*/
			this.fun = fun
			/** @type {Array<LocalDeclare>} */
			this.memberArgs = memberArgs
		}
	}

	/** Any part of {@link Class.statics} or {@link Class.methods}. */
	export class MethodImplLike extends MsAst {
		constructor(loc, symbol) {
			super(loc)
			/** @type {string | Val} */
			this.symbol = symbol
		}
	}
	/** `{symbol} {fun}` */
	export class MethodImpl extends MethodImplLike {
		constructor(loc, symbol, fun) {
			super(loc, symbol)
			/** @type {Fun} */
			this.fun = fun
		}
	}
	/**
	```get {symbol}
		{block}```
	*/
	export class MethodGetter extends MethodImplLike {
		constructor(loc, symbol, block) {
			super(loc, symbol)
			/** @type {BlockVal} */
			this.block = block
			this.declareThis = LocalDeclare.this(loc)
		}
	}
	/**
	```set {symbol}
		{block}```
	*/
	export class MethodSetter extends MethodImplLike {
		constructor(loc, symbol, block /* BlockDo */) {
			super(loc, symbol)
			/** @type {BlockDo} */
			this.block = block
			this.declareThis = LocalDeclare.this(loc)
			this.declareFocus = LocalDeclare.focus(loc)
		}
	}

	/** `do!` part of {@link Class}. */
	export class ClassDo extends MsAst {
		constructor(loc, block) {
			super(loc)
			/** @type {BlockDo} */
			this.block = block
			/** @type {LocalDeclareFocus} */
			this.declareFocus = LocalDeclare.focus(loc)
		}
	}

	/**
	`super {args}`.
	Never a {@link SuperMember}.
	*/
	export class SuperCall extends Val {
		constructor(loc, args) {
			super(loc)
			/** @type {Array<Val | Splat>} */
			this.args = args
		}
	}

	/**
	`super! {args}`
	Never a {@link SuperMember}.
	*/
	export class SuperCallDo extends Do {
		constructor(loc, args) {
			super(loc)
			/** @type {Array<Val | Splat>} */
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
		/** `{tested}:{testType}` */
		static contains(loc, testType, tested) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.Contains), [testType, tested])
		}

		/** `{subbed}[{args}]` */
		static sub(loc, subbed, args) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.Sub), cat(subbed, args))
		}

		/** `del! {subbed}[{args}]` */
		static delSub(loc, subbed, args) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.DelSub), cat(subbed, args))
		}

		constructor(loc, called, args) {
			super(loc)
			/** @type {Val} */
			this.called = called
			/** @type {Array<Val | Splat>} */
			this.args = args
		}
	}

	/** `new {type} {args}` */
	export class New extends Val {
		constructor(loc, type, args) {
			super(loc)
			/** @type {Val} */
			this.type = type
			/** @type {Val | Splat} */
			this.args = args
		}
	}

	/** `...{splatted}` */
	export class Splat extends MsAst {
		constructor(loc, splatted) {
			super(loc)
			/** @type {Val} */
			this.splatted = splatted
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
	/** `case!` statement. */
	export class CaseDo extends Do {
		constructor(loc, opCased, parts, opElse) {
			super(loc)
			/**
			Assignee is always a LocalDeclareFocus.
			@type {?AssignSingle}
			*/
			this.opCased = opCased
			/** @type {Array<CaseDoPart>} */
			this.parts = parts
			/** @type {?BlockDo} */
			this.opElse = opElse
		}
	}
	/** Single case in a {@link CaseDo}. */
	export class CaseDoPart extends MsAst {
		constructor(loc, test, result) {
			super(loc)
			/** @type {Val | Pattern} */
			this.test = test
			/** @type {BlockDo} */
			this.result = result
		}
	}

	/** `case` expression. */
	export class CaseVal extends Val {
		constructor(loc, opCased, parts, opElse) {
			super(loc)
			/** @type {?AssignSingle} */
			this.opCased = opCased
			/** @type {Array<CaseValPart>} */
			this.parts = parts
			/** @type {?BlockVal} */
			this.opElse = opElse
		}
	}
	/** Single case in a {@link CaseVal}. */
	export class CaseValPart extends MsAst {
		constructor(loc, test, result) {
			super(loc)
			/** @type {Val | Pattern} */
			this.test = test
			/** @type {BlockVal} */
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
	/** `switch!` statement. */
	export class SwitchDo extends Do {
		constructor(loc, switched, parts, opElse) {
			super(loc)
			/** @type {Val} */
			this.switched = switched
			/** @type {Array<SwitchDoPart>} */
			this.parts =  parts
			/** @type {?BlockDo} */
			this.opElse = opElse
		}
	}
	/**
	Single case in a {@link SwitchDo}.
	Multiple values are specified with `or`.
	*/
	export class SwitchDoPart extends MsAst {
		constructor(loc, values, result) {
			super(loc)
			/** @type {Array<Val>} */
			this.values = values
			/** @type {BlockDo} */
			this.result = result
		}
	}

	/** `switch` expression. */
	export class SwitchVal extends Val {
		constructor(loc, switched, parts, opElse) {
			super(loc)
			/** @type {Val} */
			this.switched = switched
			/** @type {Array<SwitchValPart>} */
			this.parts = parts
			/** @type {?BlockVal} */
			this.opElse = opElse
		}
	}
	/**
	Single case in a {@link SwitchVal}.
	Multiple values are specified with `or`.
	*/
	export class SwitchValPart extends MsAst {
		constructor(loc, values, result) {
			super(loc)
			/** @type {Array<Val>} */
			this.values = values
			/** @type {BlockVal} */
			this.result = result
		}
	}

// For
	/** `for! */
	export class ForDo extends Do {
		constructor(loc, opIteratee, block) {
			super(loc)
			/** @type {?Iteratee} */
			this.opIteratee = opIteratee
			/** @type {BlockDo} */
			this.block = block
		}
	}

	/** `for` */
	export class ForVal extends Val {
		constructor(loc, opIteratee, block) {
			super(loc)
			/** @type {?Iteratee} */
			this.opIteratee = opIteratee
			/** @type {BlockDo} */
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
			/** @type {BlockDo} */
			this.block = block
			this.built = LocalDeclare.built(loc)
		}
	}

	/** `x in y` or just `y` (where the local is implicitly `_`). */
	export class Iteratee extends MsAst {
		constructor(loc, element /* LocalDeclare */, bag /* Val */) {
			super(loc)
			/** @type {LocalDeclare} */
			this.element = element
			/** @type {Val} */
			this.bag = bag
		}
	}

	/** `break!` */
	export class Break extends Do { }

	/** `break {val}` */
	export class BreakWithVal extends Do {
		constructor(loc, value) {
			super(loc)
			/** @type {Val} */
			this.value = value
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
			/** @type {BlockVal} */
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
	Quoted text.
	Mason uses template strings for all strings.
	For tagged templates, use {@link QuoteTemplate}.
	*/
	export class Quote extends Val {
		/** Quote that is just a simple string literal. */
		static forString(loc, str) {
			return new Quote(loc, [str])
		}

		// parts are Strings interleaved with Vals.
		// part Strings are raw values, meaning "\n" is two characters.
		// Since "\{" is special to Mason, that's only one character.
		constructor(loc, parts) {
			super(loc)
			/** @type {Array<string | Val>} */
			this.parts = parts
		}
	}

	/** `{tag}"{quote}"` */
	export class QuoteTemplate extends Val {
		constructor(loc, tag, quote) {
			super(loc)
			/** @type {Val} */
			this.tag = tag
			/** @type {Quote} */
			this.quote = quote
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
			/** @type {BlockDo} */
			this.block = block
		}
	}

// Special
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
		/** `_ms.contains` used for {@link Call.contains} */
		Contains: 0,
		/** `_ms.delSub` used for {@link Call.delSub} */
		DelSub: 1,
		/** `false` literal */
		False: 2,
		/** `null` literal */
		Null: 3,
		/** `_ms.sub` used for {@link Call.sub} */
		Sub: 4,
		/** `true` literal */
		True: 5,
		/** `void 0` */
		Undefined: 6,
		/**
		`name` value is the name of the nearest assigned value. In:

			x = new Method
				name.

		`name` will be "x".
		*/
		Name: 7
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

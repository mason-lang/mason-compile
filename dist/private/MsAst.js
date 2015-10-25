(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', './util'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.util);
		global.MsAst = mod.exports;
	}
})(this, function (exports, _util) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	/**
 Any Mason AST.
 All ASTs have a `loc` that they pass on to the esast during {@link transpile}.
 */

	class MsAst {
		constructor(loc) {
			/** @type {Loc} */
			this.loc = loc;
		}
	}

	// LineContent
	/**
 Any valid part of a Block.
 Note that some {@link Val}s will still cause warnings if they appear as a line.
 */
	exports.default = MsAst;

	class LineContent extends MsAst {}

	/** Can only appear as lines in a Block. */
	exports.LineContent = LineContent;

	class Do extends LineContent {}

	/** Can appear in any expression. */
	exports.Do = Do;

	class Val extends LineContent {}

	// Module
	/** Whole source file. */
	exports.Val = Val;

	class Module extends MsAst {
		constructor(loc, name, opComment, doImports, imports, opImportGlobal, lines) {
			super(loc);
			/**
   Not used for compilation, but useful for tools.
   @type {string}
   */
			this.name = name;
			/** @type {?string} */
			this.opComment = opComment;
			/** @type {Array<ImportDo>} */
			this.doImports = doImports;
			/** @type {Array<Import>} */
			this.imports = imports;
			/** @type {?ImportGlobal} */
			this.opImportGlobal = opImportGlobal;
			/** @type {Array<Do>} */
			this.lines = lines;
		}
	}

	/** Single export. */
	exports.Module = Module;

	class ModuleExport extends Do {
		constructor(loc, assign) {
			super(loc);
			/** @type {AssignSingle} */
			this.assign = assign;
		}
	}

	/** Created with an ObjAssign in root. */
	exports.ModuleExport = ModuleExport;

	class ModuleExportNamed extends ModuleExport {}

	/** Created by assigning to the module's name. */
	exports.ModuleExportNamed = ModuleExportNamed;

	class ModuleExportDefault extends ModuleExport {}

	/** Single import in an `import!` block. */
	exports.ModuleExportDefault = ModuleExportDefault;

	class ImportDo extends MsAst {
		constructor(loc, path) {
			super(loc);
			/** @type {string} */
			this.path = path;
		}
	}

	/** Single import in an `import` block. */
	exports.ImportDo = ImportDo;

	class Import extends MsAst {
		constructor(loc, path, imported, opImportDefault) {
			super(loc);
			/** @type {string} */
			this.path = path;
			/** @type {Array<LocalDeclare>} */
			this.imported = imported;
			/** @type {?LocalDeclare} */
			this.opImportDefault = opImportDefault;
		}
	}

	/**
 Imports from 'global' are handled specially because there's no module to import from.
 Other than that, same as {@link Import}.
 */
	exports.Import = Import;

	class ImportGlobal extends MsAst {
		constructor(loc, imported, opImportDefault) {
			super(loc);
			/** @type {Array<LocalDeclare>} */
			this.imported = imported;
			/** @type {?LocalDeclare} */
			this.opImportDefault = opImportDefault;
		}
	}

	// Locals
	/**
 All {@link LocalAccess}es must have some LocalDeclare to access.
 All accessible identifiers are therefore LocalDeclares.
 This includes imports, `this`, the focus, etc.
 */
	exports.ImportGlobal = ImportGlobal;

	class LocalDeclare extends MsAst {
		/** LocalDeclare with no type. */
		static untyped(loc, name, kind) {
			return new LocalDeclare(loc, name, null, kind);
		}

		/** LocalDeclare of just a name. */
		static plain(loc, name) {
			return new LocalDeclare(loc, name, null, LocalDeclares.Const);
		}

		static built(loc) {
			return this.plain(loc, 'built');
		}
		static focus(loc) {
			return this.plain(loc, '_');
		}
		static this(loc) {
			return this.plain(loc, 'this');
		}

		constructor(loc, name, opType, kind) {
			super(loc);
			/** @type {string} */
			this.name = name;
			/** @type {?Val} */
			this.opType = opType;
			/** @type {LocalDeclares} */
			this.kind = kind;
		}

		isLazy() {
			return this.kind === LocalDeclares.Lazy;
		}

		isMutable() {
			return this.kind === LocalDeclares.Mutable;
		}
	}

	/**
 Kind of {@link LocalDeclare}.
 @enum {number}
 */
	exports.LocalDeclare = LocalDeclare;
	const LocalDeclares = {
		/** Declared normally. */
		Const: 0,
		/** Declared with `~a`. */
		Lazy: 1,
		/** Declared with `::=`. */
		Mutable: 2
	};

	exports.LocalDeclares = LocalDeclares;
	/** Access the local `name`. */

	class LocalAccess extends Val {
		static focus(loc) {
			return new LocalAccess(loc, '_');
		}

		static this(loc) {
			return new LocalAccess(loc, 'this');
		}

		constructor(loc, name) {
			super(loc);
			/** @type {string} */
			this.name = name;
		}
	}

	/** `{name} := {value}` */
	exports.LocalAccess = LocalAccess;

	class LocalMutate extends Do {
		constructor(loc, name, value) {
			super(loc);
			/** @type {string} */
			this.name = name;
			/** @type {Val} */
			this.value = value;
		}
	}

	// Assign
	/** Any expression creating new locals. */
	exports.LocalMutate = LocalMutate;

	class Assign extends Do {
		/**
  All locals created by the assign.
  @abstract
  */
		allAssignees() {}
	}

	/** `{assignee} =/:=/::= {value}` */
	exports.Assign = Assign;

	class AssignSingle extends Assign {
		/** Assign to `_`. */
		static focus(loc, value) {
			return new AssignSingle(loc, LocalDeclare.focus(loc), value);
		}

		constructor(loc, assignee, value) {
			super(loc);
			/** @type {LocalDeclare} */
			this.assignee = assignee;
			/** @type {Val} */
			this.value = value;
		}

		/** @override */
		allAssignees() {
			return [this.assignee];
		}
	}

	/** `{assignees} =/:=/::= {value}` */
	exports.AssignSingle = AssignSingle;

	class AssignDestructure extends Assign {
		constructor(loc, assignees, value) {
			super(loc);
			/** @type {Array<LocalDeclare>} */
			this.assignees = assignees;
			/** @type {Val} */
			this.value = value;
		}

		/**
  Kind of locals this assigns to.
  @return {LocalDeclares}
  */
		kind() {
			return this.assignees[0].kind;
		}

		/** @override */
		allAssignees() {
			return this.assignees;
		}
	}

	exports.AssignDestructure = AssignDestructure;
	const Setters = {
		Init: 0,
		Mutate: 1,
		InitMutable: 2
	};

	exports.Setters = Setters;
	/**
 `{object}.{name}:{opType} =/:=/::= {value}`
 Also handles `{object}."{name}"`.
 */

	class MemberSet extends Do {
		constructor(loc, object, name, opType, kind, value) {
			super(loc);
			/** @type {Val} */
			this.object = object;
			/** @type {string | Val} */
			this.name = name;
			/** @type {?Val} */
			this.opType = opType;
			/** @type {Setters} */
			this.kind = kind;
			/** @type {Val} */
			this.value = value;
		}
	}

	/** `{object}[{subbeds}]:{opType} =/:=/::= {value}` */
	exports.MemberSet = MemberSet;

	class SetSub extends Do {
		constructor(loc, object, subbeds, opType, kind, value) {
			super(loc);
			/** @type {Val} */
			this.object = object;
			/** @type {Array<Val>} */
			this.subbeds = subbeds;
			/** @type {?Val} */
			this.opType = opType;
			/** @type {Setters} */
			this.kind = kind;
			/** @type {Val} */
			this.value = value;
		}
	}

	// Errors
	/** `throw! {opThrown}` */
	exports.SetSub = SetSub;

	class Throw extends Do {
		constructor(loc, opThrown) {
			super(loc);
			/** @type {?Val} */
			this.opThrown = opThrown;
		}
	}

	/** `assert!/forbid! {condition} throw! {opThrown}` */
	exports.Throw = Throw;

	class Assert extends Do {
		constructor(loc, negate, condition, opThrown) {
			super(loc);
			/**
   If true, this is a `forbid!`.
   @type {boolean}
   */
			this.negate = negate;
			/**
   Compiled specially if a {@link Call}.
   @type {Val}
   */
			this.condition = condition;
			/** @type {?Val} */
			this.opThrown = opThrown;
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
	exports.Assert = Assert;

	class ExceptDo extends Do {
		constructor(loc, _try, _catch, _finally) {
			super(loc);
			/** @type {BlockDo} */
			this.try = _try;
			/** @type {?Catch} */
			this.catch = _catch;
			/** @type {?BlockDo} */
			this.finally = _finally;
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
	exports.ExceptDo = ExceptDo;

	class ExceptVal extends Val {
		constructor(loc, _try, _catch, _finally) {
			super(loc);
			/** @type {BlockVal} */
			this.try = _try;
			/** @type {?Catch} */
			this.catch = _catch;
			/** @type {BlockDo} */
			this.finally = _finally;
		}
	}

	/**
 ```catch {caught}
 	{block}```
 */
	exports.ExceptVal = ExceptVal;

	class Catch extends MsAst {
		constructor(loc, caught, block) {
			super(loc);
			/** @type {LocalDeclare} */
			this.caught = caught;
			/** @type {Block} */
			this.block = block;
		}
	}

	// Block
	/**
 Code in an indented block.
 See {@link BlockWrap} for the kind that appears where a Val is expected.
 */
	exports.Catch = Catch;

	class Block extends MsAst {
		constructor(loc, opComment /* Opt[String] */) {
			super(loc);
			/** @type {?string} */
			this.opComment = opComment;
		}
	}

	/** Block that just performs actions and doesn't have any value. */
	exports.Block = Block;

	class BlockDo extends Block {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			/** @type {Array<LineContent>} */
			this.lines = lines;
		}
	}

	/** Block having a value. */
	exports.BlockDo = BlockDo;

	class BlockVal extends Block {}

	/**
 BlockVal that actually returns a value at the end.
 (The most common kind by far.)
 */
	exports.BlockVal = BlockVal;

	class BlockValReturn extends BlockVal {
		constructor(loc, opComment, lines, returned) {
			super(loc, opComment);
			/** @type {Array<LineContent>} */
			this.lines = lines;
			/** @type {Val} */
			this.returned = returned;
		}
	}

	/** Takes the place of a BlockVal, but doesn't actually return a value — throws. */
	exports.BlockValReturn = BlockValReturn;

	class BlockValThrow extends BlockVal {
		constructor(loc, opComment, lines, _throw) {
			super(loc, opComment);
			/** @type {Array<LineContent>} */
			this.lines = lines;
			/** @type {Throw} */
			this.throw = _throw;
		}
	}

	// TODO: BlockBag, BlockMap, BlockObj => BlockBuild(kind, ...)
	/**
 Block returning an Object.
 Contains many {@link ObjEntry}.
 */
	exports.BlockValThrow = BlockValThrow;

	class BlockObj extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			this.built = LocalDeclare.built(loc);
			/** @type {Array<LineContent | ObjEntry>} */
			this.lines = lines;
		}
	}

	/** Part of a {@link BlockObj */
	exports.BlockObj = BlockObj;

	class ObjEntry extends Do {
		constructor(loc) {
			super(loc);
		}
	}

	/**
 `a. b`
 ObjEntry that produces a new local.
 */
	exports.ObjEntry = ObjEntry;

	class ObjEntryAssign extends ObjEntry {
		constructor(loc, assign) {
			super(loc);
			/** @type {Assign} */
			this.assign = assign;
		}
	}

	/** ObjEntry that does not introduce a new local. */
	exports.ObjEntryAssign = ObjEntryAssign;

	class ObjEntryPlain extends ObjEntry {
		/**
  `{name}.` with no value.
  Takes a local of the same name from outside.
  */
		static access(loc, name) {
			return new ObjEntryPlain(loc, name, new LocalAccess(loc, name));
		}

		static name(loc, value) {
			return new ObjEntryPlain(loc, 'name', value);
		}

		constructor(loc, name, value) {
			super(loc);
			/** @type {string | Val} */
			this.name = name;
			/** @type {Val} */
			this.value = value;
		}
	}

	/**
 Bag-building block.
 Contains many {@link BagEntry} and {@link BagEntryMany}.
 */
	exports.ObjEntryPlain = ObjEntryPlain;

	class BlockBag extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			this.built = LocalDeclare.built(loc);
			/** @type {Array<LineContent | BagEntry>} */
			this.lines = lines;
		}
	}

	/** `. {value}` */
	exports.BlockBag = BlockBag;

	class BagEntry extends Do {
		constructor(loc, value) {
			super(loc);
			/** @type {Val} */
			this.value = value;
		}
	}

	/** `... {value}` */
	exports.BagEntry = BagEntry;

	class BagEntryMany extends Do {
		constructor(loc, value) {
			super(loc);
			/** @type {Val} */
			this.value = value;
		}
	}

	/**
 Map-building block.
 Contains many {@link MapEntry}.
 */
	exports.BagEntryMany = BagEntryMany;

	class BlockMap extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			this.built = LocalDeclare.built(loc);
			/** @type {LineContent | MapEntry} */
			this.lines = lines;
		}
	}

	/** `key` -> `val` */
	exports.BlockMap = BlockMap;

	class MapEntry extends Do {
		constructor(loc, key, val) {
			super(loc);
			/** @type {Val} */
			this.key = key;
			/** @type {Val} */
			this.val = val;
		}
	}

	// Conditionals
	/**
 ```if!/unless! {test}
 	{result}```
 */
	exports.MapEntry = MapEntry;

	class ConditionalDo extends Do {
		constructor(loc, test, result, isUnless) {
			super(loc);
			/** @type {Val} */
			this.test = test;
			/** @type {BlockDo} */
			this.result = result;
			/** @type {boolean} */
			this.isUnless = isUnless;
		}
	}

	/**
 ```if/unless {test}
 	{result}```
 */
	exports.ConditionalDo = ConditionalDo;

	class ConditionalVal extends Val {
		constructor(loc, test, result, isUnless) {
			super(loc);
			/** @type {Val} */
			this.test = test;
			/** @type {BlockVal} */
			this.result = result;
			/** @type {boolean} */
			this.isUnless = isUnless;
		}
	}

	/** `cond {test} {ifTrue} {ifFalse}` */
	exports.ConditionalVal = ConditionalVal;

	class Cond extends Val {
		constructor(loc, test, ifTrue, ifFalse) {
			super(loc);
			/** @type {Val} */
			this.test = test;
			/** @type {Val} */
			this.ifTrue = ifTrue;
			/** @type {Val} */
			this.ifFalse = ifFalse;
		}
	}

	// Fun
	/**
 ```|:{opDeclareRes} {args} ...{opRestArg}
 	{block}```
 */
	exports.Cond = Cond;

	class Fun extends Val {
		constructor(loc, args, opRestArg, block) {
			let kind = arguments.length <= 4 || arguments[4] === undefined ? Funs.Plain : arguments[4];
			let isThisFun = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];
			let opReturnType = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];

			super(loc);
			/** @type {Array<LocalDeclare>} */
			this.args = args;
			/** @type {?LocalDeclare} */
			this.opRestArg = opRestArg;
			/** @type {Block} */
			this.block = block;
			/** @type {Funs} */
			this.kind = kind;
			/** @type {?LocalDeclareThis} */
			this.opDeclareThis = (0, _util.opIf)(isThisFun, () => LocalDeclare.this(this.loc));
			/** @type {?Val} */
			this.opReturnType = opReturnType;
		}
	}

	/**
 Kinds of {@link Fun}.
 @enum {number}
 */
	exports.Fun = Fun;
	const Funs = {
		/** Regular function (`|`) */
		Plain: 0,
		/** `$|` */
		Async: 1,
		/** `~|` */
		Generator: 2
	};

	exports.Funs = Funs;
	// Generator
	/**
 `<~ {opYielded}`
 These are also the value part of `a <~ b` assignments.
 */

	class Yield extends Val {
		constructor(loc) {
			let opYielded = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			super(loc);
			/** @type {?Val} */
			this.opYielded = opYielded;
		}
	}

	/**
 `<~~ {yieldedTo}`
 These are also the value part of `a <~~ b` assignments.
 */
	exports.Yield = Yield;

	class YieldTo extends Val {
		constructor(loc, yieldedTo) {
			super(loc);
			/** @type {Val} */
			this.yieldedTo = yieldedTo;
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
	exports.YieldTo = YieldTo;

	class Class extends Val {
		constructor(loc, opSuperClass, opComment, opDo, statics, opConstructor, methods) {
			super(loc);
			/** @type {?Val} */
			this.opSuperClass = opSuperClass;
			/** @type {?string} */
			this.opComment = opComment;
			/** @type {?ClassDo} */
			this.opDo = opDo;
			/** @type {Array<MethodImplLike>} */
			this.statics = statics;
			/** @type {?Constructor} */
			this.opConstructor = opConstructor;
			/** @type {Array<MethodImplLike>} */
			this.methods = methods;
		}
	}

	/** `construct! {fun}` */
	exports.Class = Class;

	class Constructor extends MsAst {
		constructor(loc, fun, memberArgs) {
			super(loc);
			/**
   This will always have a {@link BlockDo}.
   @type {Fun}
   */
			this.fun = fun;
			/** @type {Array<LocalDeclare>} */
			this.memberArgs = memberArgs;
		}
	}

	/** Any part of {@link Class.statics} or {@link Class.methods}. */
	exports.Constructor = Constructor;

	class MethodImplLike extends MsAst {
		constructor(loc, symbol) {
			super(loc);
			/** @type {string | Val} */
			this.symbol = symbol;
		}
	}

	/** `{symbol} {fun}` */
	exports.MethodImplLike = MethodImplLike;

	class MethodImpl extends MethodImplLike {
		constructor(loc, symbol, fun) {
			super(loc, symbol);
			/** @type {Fun} */
			this.fun = fun;
		}
	}

	/**
 ```get {symbol}
 	{block}```
 */
	exports.MethodImpl = MethodImpl;

	class MethodGetter extends MethodImplLike {
		constructor(loc, symbol, block) {
			super(loc, symbol);
			/** @type {BlockVal} */
			this.block = block;
			this.declareThis = LocalDeclare.this(loc);
		}
	}

	/**
 ```set {symbol}
 	{block}```
 */
	exports.MethodGetter = MethodGetter;

	class MethodSetter extends MethodImplLike {
		constructor(loc, symbol, block /* BlockDo */) {
			super(loc, symbol);
			/** @type {BlockDo} */
			this.block = block;
			this.declareThis = LocalDeclare.this(loc);
			this.declareFocus = LocalDeclare.focus(loc);
		}
	}

	/** `do!` part of {@link Class}. */
	exports.MethodSetter = MethodSetter;

	class ClassDo extends MsAst {
		constructor(loc, block) {
			super(loc);
			/** @type {BlockDo} */
			this.block = block;
			/** @type {LocalDeclareFocus} */
			this.declareFocus = LocalDeclare.focus(loc);
		}
	}

	/**
 `super {args}`.
 Never a {@link SuperMember}.
 */
	exports.ClassDo = ClassDo;

	class SuperCall extends Val {
		constructor(loc, args) {
			super(loc);
			/** @type {Array<Val | Splat>} */
			this.args = args;
		}
	}

	/**
 `super! {args}`
 Never a {@link SuperMember}.
 */
	exports.SuperCall = SuperCall;

	class SuperCallDo extends Do {
		constructor(loc, args) {
			super(loc);
			/** @type {Array<Val | Splat>} */
			this.args = args;
		}
	}

	/** `super.{name}` or `super."{name}"`. */
	exports.SuperCallDo = SuperCallDo;

	class SuperMember extends Val {
		constructor(loc, name) {
			super(loc);
			/** @type {string | Val} */
			this.name = name;
		}
	}

	// Calls
	/** `{called} {args}` */
	exports.SuperMember = SuperMember;

	class Call extends Val {
		/** `{tested}:{testType}` */
		static contains(loc, testType, tested) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.Contains), [testType, tested]);
		}

		/** `{subbed}[{args}]` */
		static sub(loc, subbed, args) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.Sub), (0, _util.cat)(subbed, args));
		}

		/** `del! {subbed}[{args}]` */
		static delSub(loc, subbed, args) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.DelSub), (0, _util.cat)(subbed, args));
		}

		constructor(loc, called, args) {
			super(loc);
			/** @type {Val} */
			this.called = called;
			/** @type {Array<Val | Splat>} */
			this.args = args;
		}
	}

	/** `new {type} {args}` */
	exports.Call = Call;

	class New extends Val {
		constructor(loc, type, args) {
			super(loc);
			/** @type {Val} */
			this.type = type;
			/** @type {Val | Splat} */
			this.args = args;
		}
	}

	/** `...{splatted}` */
	exports.New = New;

	class Splat extends MsAst {
		constructor(loc, splatted) {
			super(loc);
			/** @type {Val} */
			this.splatted = splatted;
		}
	}

	/** `~{value}` */
	exports.Splat = Splat;

	class Lazy extends Val {
		constructor(loc, value) {
			super(loc);
			/** @type {Val} */
			this.value = value;
		}
	}

	// Case
	/** `case!` statement. */
	exports.Lazy = Lazy;

	class CaseDo extends Do {
		constructor(loc, opCased, parts, opElse) {
			super(loc);
			/**
   Assignee is always a LocalDeclareFocus.
   @type {?AssignSingle}
   */
			this.opCased = opCased;
			/** @type {Array<CaseDoPart>} */
			this.parts = parts;
			/** @type {?BlockDo} */
			this.opElse = opElse;
		}
	}

	/** Single case in a {@link CaseDo}. */
	exports.CaseDo = CaseDo;

	class CaseDoPart extends MsAst {
		constructor(loc, test, result) {
			super(loc);
			/** @type {Val | Pattern} */
			this.test = test;
			/** @type {BlockDo} */
			this.result = result;
		}
	}

	/** `case` expression. */
	exports.CaseDoPart = CaseDoPart;

	class CaseVal extends Val {
		constructor(loc, opCased, parts, opElse) {
			super(loc);
			/** @type {?AssignSingle} */
			this.opCased = opCased;
			/** @type {Array<CaseValPart>} */
			this.parts = parts;
			/** @type {?BlockVal} */
			this.opElse = opElse;
		}
	}

	/** Single case in a {@link CaseVal}. */
	exports.CaseVal = CaseVal;

	class CaseValPart extends MsAst {
		constructor(loc, test, result) {
			super(loc);
			/** @type {Val | Pattern} */
			this.test = test;
			/** @type {BlockVal} */
			this.result = result;
		}
	}

	/** `:{type} {locals}` */
	exports.CaseValPart = CaseValPart;

	class Pattern extends MsAst {
		constructor(loc, type, locals) {
			super(loc);
			/** @type {Val} */
			this.type = type;
			/** @type {Array<LocalDeclare>} */
			this.locals = locals;
			/** @type {LocalAccess} */
			this.patterned = LocalAccess.focus(loc);
		}
	}

	// Switch
	/** `switch!` statement. */
	exports.Pattern = Pattern;

	class SwitchDo extends Do {
		constructor(loc, switched, parts, opElse) {
			super(loc);
			/** @type {Val} */
			this.switched = switched;
			/** @type {Array<SwitchDoPart>} */
			this.parts = parts;
			/** @type {?BlockDo} */
			this.opElse = opElse;
		}
	}

	/**
 Single case in a {@link SwitchDo}.
 Multiple values are specified with `or`.
 */
	exports.SwitchDo = SwitchDo;

	class SwitchDoPart extends MsAst {
		constructor(loc, values, result) {
			super(loc);
			/** @type {Array<Val>} */
			this.values = values;
			/** @type {BlockDo} */
			this.result = result;
		}
	}

	/** `switch` expression. */
	exports.SwitchDoPart = SwitchDoPart;

	class SwitchVal extends Val {
		constructor(loc, switched, parts, opElse) {
			super(loc);
			/** @type {Val} */
			this.switched = switched;
			/** @type {Array<SwitchValPart>} */
			this.parts = parts;
			/** @type {?BlockVal} */
			this.opElse = opElse;
		}
	}

	/**
 Single case in a {@link SwitchVal}.
 Multiple values are specified with `or`.
 */
	exports.SwitchVal = SwitchVal;

	class SwitchValPart extends MsAst {
		constructor(loc, values, result) {
			super(loc);
			/** @type {Array<Val>} */
			this.values = values;
			/** @type {BlockVal} */
			this.result = result;
		}
	}

	// For
	/** `for! */
	exports.SwitchValPart = SwitchValPart;

	class ForDo extends Do {
		constructor(loc, opIteratee, block) {
			super(loc);
			/** @type {?Iteratee} */
			this.opIteratee = opIteratee;
			/** @type {BlockDo} */
			this.block = block;
		}
	}

	/** `for` */
	exports.ForDo = ForDo;

	class ForVal extends Val {
		constructor(loc, opIteratee, block) {
			super(loc);
			/** @type {?Iteratee} */
			this.opIteratee = opIteratee;
			/** @type {BlockDo} */
			this.block = block;
		}
	}

	/**
 `@for`
 Contains many {@link BagEntry} and {@link BagEntryMany}.
 */
	exports.ForVal = ForVal;

	class ForBag extends Val {
		constructor(loc, opIteratee, block) {
			super(loc);
			/** @type {?Iteratee} */
			this.opIteratee = opIteratee;
			/** @type {BlockDo} */
			this.block = block;
			this.built = LocalDeclare.built(loc);
		}
	}

	/** `x in y` or just `y` (where the local is implicitly `_`). */
	exports.ForBag = ForBag;

	class Iteratee extends MsAst {
		constructor(loc, element, /* LocalDeclare */bag /* Val */) {
			super(loc);
			/** @type {LocalDeclare} */
			this.element = element;
			/** @type {Val} */
			this.bag = bag;
		}
	}

	/** `break!` */
	exports.Iteratee = Iteratee;

	class Break extends Do {}

	/** `break {val}` */
	exports.Break = Break;

	class BreakWithVal extends Do {
		constructor(loc, value) {
			super(loc);
			/** @type {Val} */
			this.value = value;
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
	exports.BreakWithVal = BreakWithVal;

	class BlockWrap extends Val {
		constructor(loc, block) {
			super(loc);
			/** @type {BlockVal} */
			this.block = block;
		}
	}

	/** One-line @ expression, such as `[ 1 2 3 ]`. */
	exports.BlockWrap = BlockWrap;

	class BagSimple extends Val {
		constructor(loc, parts) {
			super(loc);
			/** @type {Array<Val>} */
			this.parts = parts;
		}
	}

	/** One-line object expression, such as `(a. 1 b. 2)`. */
	exports.BagSimple = BagSimple;

	class ObjSimple extends Val {
		constructor(loc, pairs) {
			super(loc);
			/** @type {Array<ObjPair>} */
			this.pairs = pairs;
		}
	}

	/** Part of an {@link ObjSimple}. */
	exports.ObjSimple = ObjSimple;

	class ObjPair extends MsAst {
		constructor(loc, key, value) {
			super(loc);
			/** @type {string} */
			this.key = key;
			/** @type {Val} */
			this.value = value;
		}
	}

	/** `and` or `or` expression. */
	exports.ObjPair = ObjPair;

	class Logic extends Val {
		constructor(loc, kind, args) {
			super(loc);
			/** @type {Logics} */
			this.kind = kind;
			/** @type {Array<Val>} */
			this.args = args;
		}
	}

	/**
 Kinds of {@link Logic}.
 @enum {number}
 */
	exports.Logic = Logic;
	const Logics = {
		/** `and` keyword*/
		And: 0,
		/** `or` keyword */
		Or: 1
	};

	exports.Logics = Logics;
	/** `not` keyword */

	class Not extends Val {
		constructor(loc, arg) {
			super(loc);
			/** @type {Val} */
			this.arg = arg;
		}
	}

	/**
 Literal number value.
 This is both a Token and MsAst.
 */
	exports.Not = Not;

	class NumberLiteral extends Val {
		constructor(loc, value) {
			super(loc);
			/**
   Store as a string so we can distinguish `0xf` and `15`.
   @type {string}
   */
			this.value = value;
		}

		/**
  @override
  Since this is used as a Token, it must implement toString.
  */
		toString() {
			return this.value.toString();
		}
	}

	/** `{object}.{name}` or `{object}."{name}"`. */
	exports.NumberLiteral = NumberLiteral;

	class Member extends Val {
		constructor(loc, object, name) {
			super(loc);
			/** @type {Val} */
			this.object = object;
			/**
   If a string, could still be any string, so may still compile to `a['string']`.
   @type {string | Val}
   */
			this.name = name;
		}
	}

	/**
 Quoted text.
 Mason uses template strings for all strings.
 For tagged templates, use {@link QuoteTemplate}.
 */
	exports.Member = Member;

	class Quote extends Val {
		/** Quote that is just a simple string literal. */
		static forString(loc, str) {
			return new Quote(loc, [str]);
		}

		// parts are Strings interleaved with Vals.
		// part Strings are raw values, meaning "\n" is two characters.
		// Since "\{" is special to Mason, that's only one character.
		constructor(loc, parts) {
			super(loc);
			/** @type {Array<string | Val>} */
			this.parts = parts;
		}
	}

	/** `{tag}"{quote}"` */
	exports.Quote = Quote;

	class QuoteTemplate extends Val {
		constructor(loc, tag, quote) {
			super(loc);
			/** @type {Val} */
			this.tag = tag;
			/** @type {Quote} */
			this.quote = quote;
		}
	}

	/**
 ```with {value} [as {declare}]
 	{block}```
 */
	exports.QuoteTemplate = QuoteTemplate;

	class With extends Val {
		constructor(loc, declare, value, block) {
			super(loc);
			/** @type {LocalDeclare} */
			this.declare = declare;
			/** @type {Val} */
			this.value = value;
			/** @type {BlockDo} */
			this.block = block;
		}
	}

	// Special
	/**
 A special action.
 All SpecialDos are atomic and do not rely on context.
 */
	exports.With = With;

	class SpecialDo extends Do {
		constructor(loc, kind) {
			super(loc);
			/** @type {SpecialDos} */
			this.kind = kind;
		}
	}

	/**
 Kinds of {@link SpecialDo}.
 @enum {number}
 */
	exports.SpecialDo = SpecialDo;
	const SpecialDos = {
		Debugger: 0
	};

	exports.SpecialDos = SpecialDos;
	/**
 A special expression.
 All SpecialVals are atomic and do not rely on context.
 */

	class SpecialVal extends Val {
		constructor(loc, kind) {
			super(loc);
			/** @type {SpecialVals} */
			this.kind = kind;
		}
	}

	/**
 Kinds of {@link SpecialVal}.
 @enum {number}
 */
	exports.SpecialVal = SpecialVal;
	const SpecialVals = {
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
	};

	exports.SpecialVals = SpecialVals;
	/**
 `ignore` statement.
 Keeps the compiler from complaining about an unused local.
 */

	class Ignore extends Do {
		constructor(loc, ignoredNames) {
			super(loc);
			/** @type {Array<string>} */
			this.ignoredNames = ignoredNames;
		}
	}

	exports.Ignore = Ignore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU1lLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7O0FBRWhCLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0dBQ2Q7RUFDRDs7Ozs7OzttQkFMb0IsS0FBSzs7QUFZbEIsT0FBTSxXQUFXLFNBQVMsS0FBSyxDQUFDLEVBQUc7Ozs7O0FBR25DLE9BQU0sRUFBRSxTQUFTLFdBQVcsQ0FBQyxFQUFHOzs7OztBQUdoQyxPQUFNLEdBQUcsU0FBUyxXQUFXLENBQUMsRUFBRzs7Ozs7O0FBSWpDLE9BQU0sTUFBTSxTQUFTLEtBQUssQ0FBQztBQUNqQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFO0FBQzVFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7Ozs7QUFLVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTs7QUFFaEIsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7O0FBRTFCLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBOztBQUUxQixPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdEIsT0FBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7O0FBRXBDLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxZQUFZLFNBQVMsRUFBRSxDQUFDO0FBQ3BDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ3hCLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7OztBQUVNLE9BQU0saUJBQWlCLFNBQVMsWUFBWSxDQUFD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QVMsR0FBRyxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3RCLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7Ozs7O0FBTU0sT0FBTSxXQUFXLEdBQUc7O0FBRTFCLFVBQVEsRUFBRSxDQUFDOztBQUVYLFFBQU0sRUFBRSxDQUFDOztBQUVULE9BQUssRUFBRSxDQUFDOztBQUVSLE1BQUksRUFBRSxDQUFDOztBQUVQLEtBQUcsRUFBRSxDQUFDOztBQUVOLE1BQUksRUFBRSxDQUFDOztBQUVQLFdBQVMsRUFBRSxDQUFDOzs7Ozs7O0FBU1osTUFBSSxFQUFFLENBQUM7RUFDUCxDQUFBOzs7Ozs7OztBQU1NLE9BQU0sTUFBTSxTQUFTLEVBQUUsQ0FBQztBQUM5QixhQUFXLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRTtBQUM5QixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRVYsT0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7R0FDaEM7RUFDRCIsImZpbGUiOiJNc0FzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2F0LCBvcElmfSBmcm9tICcuL3V0aWwnXG5cbi8qKlxuQW55IE1hc29uIEFTVC5cbkFsbCBBU1RzIGhhdmUgYSBgbG9jYCB0aGF0IHRoZXkgcGFzcyBvbiB0byB0aGUgZXNhc3QgZHVyaW5nIHtAbGluayB0cmFuc3BpbGV9LlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0LyoqIEB0eXBlIHtMb2N9ICovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vLyBMaW5lQ29udGVudFxuXHQvKipcblx0QW55IHZhbGlkIHBhcnQgb2YgYSBCbG9jay5cblx0Tm90ZSB0aGF0IHNvbWUge0BsaW5rIFZhbH1zIHdpbGwgc3RpbGwgY2F1c2Ugd2FybmluZ3MgaWYgdGhleSBhcHBlYXIgYXMgYSBsaW5lLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7IH1cblxuXHQvKiogQ2FuIG9ubHkgYXBwZWFyIGFzIGxpbmVzIGluIGEgQmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBEbyBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG5cdC8qKiBDYW4gYXBwZWFyIGluIGFueSBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgVmFsIGV4dGVuZHMgTGluZUNvbnRlbnQgeyB9XG5cbi8vIE1vZHVsZVxuXHQvKiogV2hvbGUgc291cmNlIGZpbGUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdE5vdCB1c2VkIGZvciBjb21waWxhdGlvbiwgYnV0IHVzZWZ1bCBmb3IgdG9vbHMuXG5cdFx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydERvPn0gKi9cblx0XHRcdHRoaXMuZG9JbXBvcnRzID0gZG9JbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydD59ICovXG5cdFx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUgez9JbXBvcnRHbG9iYWx9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0R2xvYmFsID0gb3BJbXBvcnRHbG9iYWxcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8RG8+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBleHBvcnQuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXNzaWduU2luZ2xlfSAqL1xuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblx0LyoqIENyZWF0ZWQgd2l0aCBhbiBPYmpBc3NpZ24gaW4gcm9vdC4gKi9cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZUV4cG9ydE5hbWVkIGV4dGVuZHMgTW9kdWxlRXhwb3J0IHsgfVxuXHQvKiogQ3JlYXRlZCBieSBhc3NpZ25pbmcgdG8gdGhlIG1vZHVsZSdzIG5hbWUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnREZWZhdWx0IGV4dGVuZHMgTW9kdWxlRXhwb3J0IHsgfVxuXG5cdC8qKiBTaW5nbGUgaW1wb3J0IGluIGFuIGBpbXBvcnQhYCBibG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydERvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGF0aCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBpbXBvcnQgaW4gYW4gYGltcG9ydGAgYmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0ZWQgPSBpbXBvcnRlZFxuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5vcEltcG9ydERlZmF1bHQgPSBvcEltcG9ydERlZmF1bHRcblx0XHR9XG5cdH1cblxuXHQvKipcblx0SW1wb3J0cyBmcm9tICdnbG9iYWwnIGFyZSBoYW5kbGVkIHNwZWNpYWxseSBiZWNhdXNlIHRoZXJlJ3Mgbm8gbW9kdWxlIHRvIGltcG9ydCBmcm9tLlxuXHRPdGhlciB0aGFuIHRoYXQsIHNhbWUgYXMge0BsaW5rIEltcG9ydH0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnRHbG9iYWwgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmltcG9ydGVkID0gaW1wb3J0ZWRcblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMub3BJbXBvcnREZWZhdWx0ID0gb3BJbXBvcnREZWZhdWx0XG5cdFx0fVxuXHR9XG5cbi8vIExvY2Fsc1xuXHQvKipcblx0QWxsIHtAbGluayBMb2NhbEFjY2Vzc31lcyBtdXN0IGhhdmUgc29tZSBMb2NhbERlY2xhcmUgdG8gYWNjZXNzLlxuXHRBbGwgYWNjZXNzaWJsZSBpZGVudGlmaWVycyBhcmUgdGhlcmVmb3JlIExvY2FsRGVjbGFyZXMuXG5cdFRoaXMgaW5jbHVkZXMgaW1wb3J0cywgYHRoaXNgLCB0aGUgZm9jdXMsIGV0Yy5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZSBleHRlbmRzIE1zQXN0IHtcblx0XHQvKiogTG9jYWxEZWNsYXJlIHdpdGggbm8gdHlwZS4gKi9cblx0XHRzdGF0aWMgdW50eXBlZChsb2MsIG5hbWUsIGtpbmQpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwga2luZClcblx0XHR9XG5cblx0XHQvKiogTG9jYWxEZWNsYXJlIG9mIGp1c3QgYSBuYW1lLiAqL1xuXHRcdHN0YXRpYyBwbGFpbihsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwgTG9jYWxEZWNsYXJlcy5Db25zdClcblx0XHR9XG5cblx0XHRzdGF0aWMgYnVpbHQobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICdidWlsdCcpXG5cdFx0fVxuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ18nKVxuXHRcdH1cblx0XHRzdGF0aWMgdGhpcyhsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgb3BUeXBlLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZXN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXG5cdFx0aXNMYXp5KCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5XG5cdFx0fVxuXG5cdFx0aXNNdXRhYmxlKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kIG9mIHtAbGluayBMb2NhbERlY2xhcmV9LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgTG9jYWxEZWNsYXJlcyA9IHtcblx0XHQvKiogRGVjbGFyZWQgbm9ybWFsbHkuICovXG5cdFx0Q29uc3Q6IDAsXG5cdFx0LyoqIERlY2xhcmVkIHdpdGggYH5hYC4gKi9cblx0XHRMYXp5OiAxLFxuXHRcdC8qKiBEZWNsYXJlZCB3aXRoIGA6Oj1gLiAqL1xuXHRcdE11dGFibGU6IDJcblx0fVxuXG5cdC8qKiBBY2Nlc3MgdGhlIGxvY2FsIGBuYW1lYC4gKi9cblx0ZXhwb3J0IGNsYXNzIExvY2FsQWNjZXNzIGV4dGVuZHMgVmFsIHtcblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ18nKVxuXHRcdH1cblxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge25hbWV9IDo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbE11dGF0ZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIEFzc2lnblxuXHQvKiogQW55IGV4cHJlc3Npb24gY3JlYXRpbmcgbmV3IGxvY2Fscy4gKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbiBleHRlbmRzIERvIHtcblx0XHQvKipcblx0XHRBbGwgbG9jYWxzIGNyZWF0ZWQgYnkgdGhlIGFzc2lnbi5cblx0XHRAYWJzdHJhY3Rcblx0XHQqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHt9XG5cdH1cblxuXHQvKiogYHthc3NpZ25lZX0gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnblNpbmdsZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0LyoqIEFzc2lnbiB0byBgX2AuICovXG5cdFx0c3RhdGljIGZvY3VzKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgQXNzaWduU2luZ2xlKGxvYywgTG9jYWxEZWNsYXJlLmZvY3VzKGxvYyksIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuYXNzaWduZWUgPSBhc3NpZ25lZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKiogQG92ZXJyaWRlICovXG5cdFx0YWxsQXNzaWduZWVzKCkgeyByZXR1cm4gW3RoaXMuYXNzaWduZWVdIH1cblx0fVxuXG5cdC8qKiBge2Fzc2lnbmVlc30gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbkRlc3RydWN0dXJlIGV4dGVuZHMgQXNzaWduIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlcywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuYXNzaWduZWVzID0gYXNzaWduZWVzXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdEtpbmQgb2YgbG9jYWxzIHRoaXMgYXNzaWducyB0by5cblx0XHRAcmV0dXJuIHtMb2NhbERlY2xhcmVzfVxuXHRcdCovXG5cdFx0a2luZCgpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1swXS5raW5kXG5cdFx0fVxuXG5cdFx0LyoqIEBvdmVycmlkZSAqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdCBTZXR0ZXJzID0ge1xuXHRcdEluaXQ6IDAsXG5cdFx0TXV0YXRlOiAxLFxuXHRcdEluaXRNdXRhYmxlOiAyXG5cdH1cblxuXHQvKipcblx0YHtvYmplY3R9LntuYW1lfTp7b3BUeXBlfSA9Lzo9Lzo6PSB7dmFsdWV9YFxuXHRBbHNvIGhhbmRsZXMgYHtvYmplY3R9Llwie25hbWV9XCJgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyU2V0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBuYW1lLCBvcFR5cGUsIGtpbmQsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge1NldHRlcnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge29iamVjdH1be3N1YmJlZHN9XTp7b3BUeXBlfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgU2V0U3ViIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBzdWJiZWRzLCBvcFR5cGUsIGtpbmQsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnN1YmJlZHMgPSBzdWJiZWRzXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtTZXR0ZXJzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gRXJyb3JzXG5cdC8qKiBgdGhyb3chIHtvcFRocm93bn1gICovXG5cdGV4cG9ydCBjbGFzcyBUaHJvdyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVGhyb3duKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVGhyb3duID0gb3BUaHJvd25cblx0XHR9XG5cdH1cblxuXHQvKiogYGFzc2VydCEvZm9yYmlkISB7Y29uZGl0aW9ufSB0aHJvdyEge29wVGhyb3dufWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2VydCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5lZ2F0ZSwgY29uZGl0aW9uLCBvcFRocm93bikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRJZiB0cnVlLCB0aGlzIGlzIGEgYGZvcmJpZCFgLlxuXHRcdFx0QHR5cGUge2Jvb2xlYW59XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uZWdhdGUgPSBuZWdhdGVcblx0XHRcdC8qKlxuXHRcdFx0Q29tcGlsZWQgc3BlY2lhbGx5IGlmIGEge0BsaW5rIENhbGx9LlxuXHRcdFx0QHR5cGUge1ZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvblxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFRocm93biA9IG9wVGhyb3duXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGV4Y2VwdCFcblx0XHR0cnkhXG5cdFx0XHR7dHJ5fVxuXHRcdGNhdGNoIVxuXHRcdFx0e2NhdGNofVxuXHRcdGZpbmFsbHkhXG5cdFx0XHR7ZmluYWxseX1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEV4Y2VwdERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy50cnkgPSBfdHJ5XG5cdFx0XHQvKiogQHR5cGUgez9DYXRjaH0gKi9cblx0XHRcdHRoaXMuY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBleGNlcHRcblx0XHR0cnlcblx0XHRcdHt0cnl9XG5cdFx0Y2F0Y2hcblx0XHRcdHtjYXRjaH1cblx0XHRmaW5hbGx5IVxuXHRcdFx0e2ZpbmFsbHl9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHRWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMudHJ5ID0gX3RyeVxuXHRcdFx0LyoqIEB0eXBlIHs/Q2F0Y2h9ICovXG5cdFx0XHR0aGlzLmNhdGNoID0gX2NhdGNoXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBjYXRjaCB7Y2F1Z2h0fVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENhdGNoIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2F1Z2h0LCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmNhdWdodCA9IGNhdWdodFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG4vLyBCbG9ja1xuXHQvKipcblx0Q29kZSBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0U2VlIHtAbGluayBCbG9ja1dyYXB9IGZvciB0aGUga2luZCB0aGF0IGFwcGVhcnMgd2hlcmUgYSBWYWwgaXMgZXhwZWN0ZWQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9jayBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCAvKiBPcHRbU3RyaW5nXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHR9XG5cdH1cblxuXHQvKiogQmxvY2sgdGhhdCBqdXN0IHBlcmZvcm1zIGFjdGlvbnMgYW5kIGRvZXNuJ3QgaGF2ZSBhbnkgdmFsdWUuICovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0RvIGV4dGVuZHMgQmxvY2sge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBCbG9jayBoYXZpbmcgYSB2YWx1ZS4gKi9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsIGV4dGVuZHMgQmxvY2sgeyB9XG5cblx0LyoqXG5cdEJsb2NrVmFsIHRoYXQgYWN0dWFsbHkgcmV0dXJucyBhIHZhbHVlIGF0IHRoZSBlbmQuXG5cdChUaGUgbW9zdCBjb21tb24ga2luZCBieSBmYXIuKVxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWxSZXR1cm4gZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzLCByZXR1cm5lZCkge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnJldHVybmVkID0gcmV0dXJuZWRcblx0XHR9XG5cdH1cblxuXHQvKiogVGFrZXMgdGhlIHBsYWNlIG9mIGEgQmxvY2tWYWwsIGJ1dCBkb2Vzbid0IGFjdHVhbGx5IHJldHVybiBhIHZhbHVlIOKAlCB0aHJvd3MuICovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbFRocm93IGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcywgX3Rocm93KSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQ+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHQvKiogQHR5cGUge1Rocm93fSAqL1xuXHRcdFx0dGhpcy50aHJvdyA9IF90aHJvd1xuXHRcdH1cblx0fVxuXG5cdC8vIFRPRE86IEJsb2NrQmFnLCBCbG9ja01hcCwgQmxvY2tPYmogPT4gQmxvY2tCdWlsZChraW5kLCAuLi4pXG5cdC8qKlxuXHRCbG9jayByZXR1cm5pbmcgYW4gT2JqZWN0LlxuXHRDb250YWlucyBtYW55IHtAbGluayBPYmpFbnRyeX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja09iaiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50IHwgT2JqRW50cnk+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFBhcnQgb2YgYSB7QGxpbmsgQmxvY2tPYmogKi9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYS4gYmBcblx0T2JqRW50cnkgdGhhdCBwcm9kdWNlcyBhIG5ldyBsb2NhbC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5QXNzaWduIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Fzc2lnbn0gKi9cblx0XHRcdHRoaXMuYXNzaWduID0gYXNzaWduXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9iakVudHJ5IHRoYXQgZG9lcyBub3QgaW50cm9kdWNlIGEgbmV3IGxvY2FsLiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlQbGFpbiBleHRlbmRzIE9iakVudHJ5IHtcblx0XHQvKipcblx0XHRge25hbWV9LmAgd2l0aCBubyB2YWx1ZS5cblx0XHRUYWtlcyBhIGxvY2FsIG9mIHRoZSBzYW1lIG5hbWUgZnJvbSBvdXRzaWRlLlxuXHRcdCovXG5cdFx0c3RhdGljIGFjY2Vzcyhsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIG5hbWUsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIG5hbWUpKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBuYW1lKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsICduYW1lJywgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRCYWctYnVpbGRpbmcgYmxvY2suXG5cdENvbnRhaW5zIG1hbnkge0BsaW5rIEJhZ0VudHJ5fSBhbmQge0BsaW5rIEJhZ0VudHJ5TWFueX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0JhZyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50IHwgQmFnRW50cnk+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAuIHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgLi4uIHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeU1hbnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0TWFwLWJ1aWxkaW5nIGJsb2NrLlxuXHRDb250YWlucyBtYW55IHtAbGluayBNYXBFbnRyeX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja01hcCBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xpbmVDb250ZW50IHwgTWFwRW50cnl9ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogYGtleWAgLT4gYHZhbGAgKi9cblx0ZXhwb3J0IGNsYXNzIE1hcEVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5LCB2YWwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWwgPSB2YWxcblx0XHR9XG5cdH1cblxuLy8gQ29uZGl0aW9uYWxzXG5cdC8qKlxuXHRgYGBpZiEvdW5sZXNzISB7dGVzdH1cblx0XHR7cmVzdWx0fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCwgaXNVbmxlc3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBpZi91bmxlc3Mge3Rlc3R9XG5cdFx0e3Jlc3VsdH1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCwgaXNVbmxlc3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbmQge3Rlc3R9IHtpZlRydWV9IHtpZkZhbHNlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENvbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgaWZUcnVlLCBpZkZhbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZlRydWUgPSBpZlRydWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZkZhbHNlID0gaWZGYWxzZVxuXHRcdH1cblx0fVxuXG4vLyBGdW5cblx0LyoqXG5cdGBgYHw6e29wRGVjbGFyZVJlc30ge2FyZ3N9IC4uLntvcFJlc3RBcmd9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIGtpbmQ9RnVucy5QbGFpbiwgaXNUaGlzRnVuPWZhbHNlLCBvcFJldHVyblR5cGU9bnVsbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5vcFJlc3RBcmcgPSBvcFJlc3RBcmdcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdC8qKiBAdHlwZSB7RnVuc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZVRoaXN9ICovXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVRoaXMgPSBvcElmKGlzVGhpc0Z1biwgKCkgPT4gTG9jYWxEZWNsYXJlLnRoaXModGhpcy5sb2MpKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFJldHVyblR5cGUgPSBvcFJldHVyblR5cGVcblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBGdW59LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgRnVucyA9IHtcblx0XHQvKiogUmVndWxhciBmdW5jdGlvbiAoYHxgKSAqL1xuXHRcdFBsYWluOiAwLFxuXHRcdC8qKiBgJHxgICovXG5cdFx0QXN5bmM6IDEsXG5cdFx0LyoqIGB+fGAgKi9cblx0XHRHZW5lcmF0b3I6IDJcblx0fVxuXG4vLyBHZW5lcmF0b3Jcblx0LyoqXG5cdGA8fiB7b3BZaWVsZGVkfWBcblx0VGhlc2UgYXJlIGFsc28gdGhlIHZhbHVlIHBhcnQgb2YgYGEgPH4gYmAgYXNzaWdubWVudHMuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBZaWVsZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFlpZWxkZWQ9bnVsbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFlpZWxkZWQgPSBvcFlpZWxkZWRcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YDx+fiB7eWllbGRlZFRvfWBcblx0VGhlc2UgYXJlIGFsc28gdGhlIHZhbHVlIHBhcnQgb2YgYGEgPH5+IGJgIGFzc2lnbm1lbnRzLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgWWllbGRUbyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB5aWVsZGVkVG8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy55aWVsZGVkVG8gPSB5aWVsZGVkVG9cblx0XHR9XG5cdH1cblxuLy8gQ2xhc3Ncblx0LyoqXG5cdGBgYGNsYXNzIHtvcFN1cGVyQ2xhc3N9XG5cdFx0e29wQ29tbWVudH1cblx0XHRkbyFcblx0XHRcdHtvcERvfVxuXHRcdHN0YXRpY1xuXHRcdFx0e3N0YXRpY3N9XG5cdFx0e29wQ29uc3RydWN0b3J9XG5cdFx0e21ldGhvZHN9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDbGFzcyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFN1cGVyQ2xhc3MsIG9wQ29tbWVudCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFN1cGVyQ2xhc3MgPSBvcFN1cGVyQ2xhc3Ncblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUgez9DbGFzc0RvfSAqL1xuXHRcdFx0dGhpcy5vcERvID0gb3BEb1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLnN0YXRpY3MgPSBzdGF0aWNzXG5cdFx0XHQvKiogQHR5cGUgez9Db25zdHJ1Y3Rvcn0gKi9cblx0XHRcdHRoaXMub3BDb25zdHJ1Y3RvciA9IG9wQ29uc3RydWN0b3Jcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgY29uc3RydWN0ISB7ZnVufWAgKi9cblx0ZXhwb3J0IGNsYXNzIENvbnN0cnVjdG9yIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZnVuLCBtZW1iZXJBcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdFRoaXMgd2lsbCBhbHdheXMgaGF2ZSBhIHtAbGluayBCbG9ja0RvfS5cblx0XHRcdEB0eXBlIHtGdW59XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubWVtYmVyQXJncyA9IG1lbWJlckFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogQW55IHBhcnQgb2Yge0BsaW5rIENsYXNzLnN0YXRpY3N9IG9yIHtAbGluayBDbGFzcy5tZXRob2RzfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGxMaWtlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMuc3ltYm9sID0gc3ltYm9sXG5cdFx0fVxuXHR9XG5cdC8qKiBge3N5bWJvbH0ge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBmdW4pIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW59ICovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgZ2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kR2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gTG9jYWxEZWNsYXJlLnRoaXMobG9jKVxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgc2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kU2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5kZWNsYXJlVGhpcyA9IExvY2FsRGVjbGFyZS50aGlzKGxvYylcblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gTG9jYWxEZWNsYXJlLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuXHQvKiogYGRvIWAgcGFydCBvZiB7QGxpbmsgQ2xhc3N9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3NEbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlRm9jdXN9ICovXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBzdXBlciB7YXJnc31gLlxuXHROZXZlciBhIHtAbGluayBTdXBlck1lbWJlcn0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcGxhdD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBzdXBlciEge2FyZ3N9YFxuXHROZXZlciBhIHtAbGluayBTdXBlck1lbWJlcn0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsIHwgU3BsYXQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgc3VwZXIue25hbWV9YCBvciBgc3VwZXIuXCJ7bmFtZX1cImAuICovXG5cdGV4cG9ydCBjbGFzcyBTdXBlck1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuLy8gQ2FsbHNcblx0LyoqIGB7Y2FsbGVkfSB7YXJnc31gICovXG5cdGV4cG9ydCBjbGFzcyBDYWxsIGV4dGVuZHMgVmFsIHtcblx0XHQvKiogYHt0ZXN0ZWR9Ont0ZXN0VHlwZX1gICovXG5cdFx0c3RhdGljIGNvbnRhaW5zKGxvYywgdGVzdFR5cGUsIHRlc3RlZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5Db250YWlucyksIFt0ZXN0VHlwZSwgdGVzdGVkXSlcblx0XHR9XG5cblx0XHQvKiogYHtzdWJiZWR9W3thcmdzfV1gICovXG5cdFx0c3RhdGljIHN1Yihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5TdWIpLCBjYXQoc3ViYmVkLCBhcmdzKSlcblx0XHR9XG5cblx0XHQvKiogYGRlbCEge3N1YmJlZH1be2FyZ3N9XWAgKi9cblx0XHRzdGF0aWMgZGVsU3ViKGxvYywgc3ViYmVkLCBhcmdzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNwZWNpYWxWYWxzLkRlbFN1YiksIGNhdChzdWJiZWQsIGFyZ3MpKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2FsbGVkLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwbGF0Pn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYG5ldyB7dHlwZX0ge2FyZ3N9YCAqL1xuXHRleHBvcnQgY2xhc3MgTmV3IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHR5cGUsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWwgfCBTcGxhdH0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYC4uLntzcGxhdHRlZH1gICovXG5cdGV4cG9ydCBjbGFzcyBTcGxhdCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHNwbGF0dGVkKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3BsYXR0ZWQgPSBzcGxhdHRlZFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgfnt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMYXp5IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdC8qKiBgY2FzZSFgIHN0YXRlbWVudC4gKi9cblx0ZXhwb3J0IGNsYXNzIENhc2VEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0QXNzaWduZWUgaXMgYWx3YXlzIGEgTG9jYWxEZWNsYXJlRm9jdXMuXG5cdFx0XHRAdHlwZSB7P0Fzc2lnblNpbmdsZX1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm9wQ2FzZWQgPSBvcENhc2VkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PENhc2VEb1BhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqIFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIENhc2VEb30uICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFBhdHRlcm59ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgY2FzZWAgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIENhc2VWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDYXNlZCwgcGFydHMsIG9wRWxzZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/QXNzaWduU2luZ2xlfSAqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlVmFsUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqIFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIENhc2VWYWx9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2FzZVZhbFBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgUGF0dGVybn0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgOnt0eXBlfSB7bG9jYWxzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFBhdHRlcm4gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBsb2NhbHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5sb2NhbHMgPSBsb2NhbHNcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxBY2Nlc3N9ICovXG5cdFx0XHR0aGlzLnBhdHRlcm5lZCA9IExvY2FsQWNjZXNzLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuLy8gU3dpdGNoXG5cdC8qKiBgc3dpdGNoIWAgc3RhdGVtZW50LiAqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzd2l0Y2hlZCwgcGFydHMsIG9wRWxzZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnN3aXRjaGVkID0gc3dpdGNoZWRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8U3dpdGNoRG9QYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSAgcGFydHNcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXHQvKipcblx0U2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgU3dpdGNoRG99LlxuXHRNdWx0aXBsZSB2YWx1ZXMgYXJlIHNwZWNpZmllZCB3aXRoIGBvcmAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTd2l0Y2hEb1BhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZXMsIHJlc3VsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy52YWx1ZXMgPSB2YWx1ZXNcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cblx0LyoqIGBzd2l0Y2hgIGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBTd2l0Y2hWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFN3aXRjaFZhbFBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBTd2l0Y2hWYWx9LlxuXHRNdWx0aXBsZSB2YWx1ZXMgYXJlIHNwZWNpZmllZCB3aXRoIGBvcmAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTd2l0Y2hWYWxQYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzLCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuLy8gRm9yXG5cdC8qKiBgZm9yISAqL1xuXHRleHBvcnQgY2xhc3MgRm9yRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcEl0ZXJhdGVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/SXRlcmF0ZWV9ICovXG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKiogYGZvcmAgKi9cblx0ZXhwb3J0IGNsYXNzIEZvclZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcEl0ZXJhdGVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/SXRlcmF0ZWV9ICovXG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YEBmb3JgXG5cdENvbnRhaW5zIG1hbnkge0BsaW5rIEJhZ0VudHJ5fSBhbmQge0BsaW5rIEJhZ0VudHJ5TWFueX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBGb3JCYWcgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHR9XG5cdH1cblxuXHQvKiogYHggaW4geWAgb3IganVzdCBgeWAgKHdoZXJlIHRoZSBsb2NhbCBpcyBpbXBsaWNpdGx5IGBfYCkuICovXG5cdGV4cG9ydCBjbGFzcyBJdGVyYXRlZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGVsZW1lbnQgLyogTG9jYWxEZWNsYXJlICovLCBiYWcgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5iYWcgPSBiYWdcblx0XHR9XG5cdH1cblxuXHQvKiogYGJyZWFrIWAgKi9cblx0ZXhwb3J0IGNsYXNzIEJyZWFrIGV4dGVuZHMgRG8geyB9XG5cblx0LyoqIGBicmVhayB7dmFsfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEJyZWFrV2l0aFZhbCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBNaXNjZWxsYW5lb3VzIFZhbHNcblx0LyoqXG5cdEEgYmxvY2sgYXBwZWFyaW5nIG9uIGl0cyBvd24gKG5vdCBhcyB0aGUgYmxvY2sgdG8gYW4gYGlmYCBvciB0aGUgbGlrZSlcblx0aXMgcHV0IGludG8gb25lIG9mIHRoZXNlLlxuXHRlLmcuOlxuXG5cdFx0eCA9XG5cdFx0XHR5ID0gMVxuXHRcdFx0eVxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tXcmFwIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9uZS1saW5lIEAgZXhwcmVzc2lvbiwgc3VjaCBhcyBgWyAxIDIgMyBdYC4gKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ1NpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9uZS1saW5lIG9iamVjdCBleHByZXNzaW9uLCBzdWNoIGFzIGAoYS4gMSBiLiAyKWAuICovXG5cdGV4cG9ydCBjbGFzcyBPYmpTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFpcnMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8T2JqUGFpcj59ICovXG5cdFx0XHR0aGlzLnBhaXJzID0gcGFpcnNcblx0XHR9XG5cdH1cblx0LyoqIFBhcnQgb2YgYW4ge0BsaW5rIE9ialNpbXBsZX0uICovXG5cdGV4cG9ydCBjbGFzcyBPYmpQYWlyIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5LCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYGFuZGAgb3IgYG9yYCBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgTG9naWMgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2dpY3N9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgTG9naWN9LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgTG9naWNzID0ge1xuXHRcdC8qKiBgYW5kYCBrZXl3b3JkKi9cblx0XHRBbmQ6IDAsXG5cdFx0LyoqIGBvcmAga2V5d29yZCAqL1xuXHRcdE9yOiAxXG5cdH1cblxuXHQvKiogYG5vdGAga2V5d29yZCAqL1xuXHRleHBvcnQgY2xhc3MgTm90IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmFyZyA9IGFyZ1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRMaXRlcmFsIG51bWJlciB2YWx1ZS5cblx0VGhpcyBpcyBib3RoIGEgVG9rZW4gYW5kIE1zQXN0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTnVtYmVyTGl0ZXJhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRTdG9yZSBhcyBhIHN0cmluZyBzbyB3ZSBjYW4gZGlzdGluZ3Vpc2ggYDB4ZmAgYW5kIGAxNWAuXG5cdFx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdEBvdmVycmlkZVxuXHRcdFNpbmNlIHRoaXMgaXMgdXNlZCBhcyBhIFRva2VuLCBpdCBtdXN0IGltcGxlbWVudCB0b1N0cmluZy5cblx0XHQqL1xuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsdWUudG9TdHJpbmcoKVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge29iamVjdH0ue25hbWV9YCBvciBge29iamVjdH0uXCJ7bmFtZX1cImAuICovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKipcblx0XHRcdElmIGEgc3RyaW5nLCBjb3VsZCBzdGlsbCBiZSBhbnkgc3RyaW5nLCBzbyBtYXkgc3RpbGwgY29tcGlsZSB0byBgYVsnc3RyaW5nJ11gLlxuXHRcdFx0QHR5cGUge3N0cmluZyB8IFZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdFF1b3RlZCB0ZXh0LlxuXHRNYXNvbiB1c2VzIHRlbXBsYXRlIHN0cmluZ3MgZm9yIGFsbCBzdHJpbmdzLlxuXHRGb3IgdGFnZ2VkIHRlbXBsYXRlcywgdXNlIHtAbGluayBRdW90ZVRlbXBsYXRlfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlIGV4dGVuZHMgVmFsIHtcblx0XHQvKiogUXVvdGUgdGhhdCBpcyBqdXN0IGEgc2ltcGxlIHN0cmluZyBsaXRlcmFsLiAqL1xuXHRcdHN0YXRpYyBmb3JTdHJpbmcobG9jLCBzdHIpIHtcblx0XHRcdHJldHVybiBuZXcgUXVvdGUobG9jLCBbc3RyXSlcblx0XHR9XG5cblx0XHQvLyBwYXJ0cyBhcmUgU3RyaW5ncyBpbnRlcmxlYXZlZCB3aXRoIFZhbHMuXG5cdFx0Ly8gcGFydCBTdHJpbmdzIGFyZSByYXcgdmFsdWVzLCBtZWFuaW5nIFwiXFxuXCIgaXMgdHdvIGNoYXJhY3RlcnMuXG5cdFx0Ly8gU2luY2UgXCJcXHtcIiBpcyBzcGVjaWFsIHRvIE1hc29uLCB0aGF0J3Mgb25seSBvbmUgY2hhcmFjdGVyLlxuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdC8qKiBge3RhZ31cIntxdW90ZX1cImAgKi9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlVGVtcGxhdGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGFnLCBxdW90ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRhZyA9IHRhZ1xuXHRcdFx0LyoqIEB0eXBlIHtRdW90ZX0gKi9cblx0XHRcdHRoaXMucXVvdGUgPSBxdW90ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGB3aXRoIHt2YWx1ZX0gW2FzIHtkZWNsYXJlfV1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBXaXRoIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGRlY2xhcmUsIHZhbHVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmRlY2xhcmUgPSBkZWNsYXJlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cbi8vIFNwZWNpYWxcblx0LyoqXG5cdEEgc3BlY2lhbCBhY3Rpb24uXG5cdEFsbCBTcGVjaWFsRG9zIGFyZSBhdG9taWMgYW5kIGRvIG5vdCByZWx5IG9uIGNvbnRleHQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxEb3N9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbERvfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IFNwZWNpYWxEb3MgPSB7XG5cdFx0RGVidWdnZXI6IDBcblx0fVxuXG5cdC8qKlxuXHRBIHNwZWNpYWwgZXhwcmVzc2lvbi5cblx0QWxsIFNwZWNpYWxWYWxzIGFyZSBhdG9taWMgYW5kIGRvIG5vdCByZWx5IG9uIGNvbnRleHQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7U3BlY2lhbFZhbHN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBTcGVjaWFsVmFsfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IFNwZWNpYWxWYWxzID0ge1xuXHRcdC8qKiBgX21zLmNvbnRhaW5zYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5jb250YWluc30gKi9cblx0XHRDb250YWluczogMCxcblx0XHQvKiogYF9tcy5kZWxTdWJgIHVzZWQgZm9yIHtAbGluayBDYWxsLmRlbFN1Yn0gKi9cblx0XHREZWxTdWI6IDEsXG5cdFx0LyoqIGBmYWxzZWAgbGl0ZXJhbCAqL1xuXHRcdEZhbHNlOiAyLFxuXHRcdC8qKiBgbnVsbGAgbGl0ZXJhbCAqL1xuXHRcdE51bGw6IDMsXG5cdFx0LyoqIGBfbXMuc3ViYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5zdWJ9ICovXG5cdFx0U3ViOiA0LFxuXHRcdC8qKiBgdHJ1ZWAgbGl0ZXJhbCAqL1xuXHRcdFRydWU6IDUsXG5cdFx0LyoqIGB2b2lkIDBgICovXG5cdFx0VW5kZWZpbmVkOiA2LFxuXHRcdC8qKlxuXHRcdGBuYW1lYCB2YWx1ZSBpcyB0aGUgbmFtZSBvZiB0aGUgbmVhcmVzdCBhc3NpZ25lZCB2YWx1ZS4gSW46XG5cblx0XHRcdHggPSBuZXcgTWV0aG9kXG5cdFx0XHRcdG5hbWUuXG5cblx0XHRgbmFtZWAgd2lsbCBiZSBcInhcIi5cblx0XHQqL1xuXHRcdE5hbWU6IDdcblx0fVxuXG5cdC8qKlxuXHRgaWdub3JlYCBzdGF0ZW1lbnQuXG5cdEtlZXBzIHRoZSBjb21waWxlciBmcm9tIGNvbXBsYWluaW5nIGFib3V0IGFuIHVudXNlZCBsb2NhbC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIElnbm9yZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGlnbm9yZWROYW1lcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxzdHJpbmc+fSAqL1xuXHRcdFx0dGhpcy5pZ25vcmVkTmFtZXMgPSBpZ25vcmVkTmFtZXNcblx0XHR9XG5cdH1cbiJdfQ==
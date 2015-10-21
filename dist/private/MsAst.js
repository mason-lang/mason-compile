if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './util'], function (exports, _util) {
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
			let isGenerator = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
			let opDeclareThis = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
			let opReturnType = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];

			super(loc);
			/** @type {?LocalDeclareThis} */
			this.opDeclareThis = opDeclareThis;
			/** @type {boolean} */
			this.isGenerator = isGenerator;
			/** @type {Array<LocalDeclare>} */
			this.args = args;
			/** @type {?LocalDeclare} */
			this.opRestArg = opRestArg;
			/** @type {Block} */
			this.block = block;
			/** @type {?Val} */
			this.opReturnType = opReturnType;
		}
	}

	// Generator
	/**
 `<~ {opYielded}`
 These are also the value part of `a <~ b` assignments.
 */
	exports.Fun = Fun;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1zQXN0LmpzIiwicHJpdmF0ZS9Nc0FzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O0FDTWUsT0FBTSxLQUFLLENBQUM7QUFDMUIsYUFBVyxDQUFDLEdBQUcsRUFBRTs7QUFFaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDtFQUNEOzs7Ozs7O21CQUxvQixLQUFLOztBQVlsQixPQUFNLFdBQVcsU0FBUyxLQUFLLENBQUMsRUFBRzs7Ozs7QUFHbkMsT0FBTSxFQUFFLFNBQVMsV0FBVyxDQUFDLEVBQUc7Ozs7O0FBR2hDLE9BQU0sR0FBRyxTQUFTLFdBQVcsQ0FBQyxFQUFHOzs7Ozs7QUFJakMsT0FBTSxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBQ2pDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUU7QUFDNUUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOzs7OztBQUtWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBOztBQUVoQixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTs7QUFFMUIsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7O0FBRTFCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBOztBQUV0QixPQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQTs7QUFFcEMsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7Ozs7QUFHTSxPQUFNLFlBQVksU0FBUyxFQUFFLENBQUM7QUFDcEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFDeEIsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVWLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0dBQ3BCO0VBQ0Q7Ozs7O0FBRU0sT0FBTSxpQkFBaUIsU0FBUyxZQUFZLENBQUMsRUFBRzs7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Q0FBQzs7QUFFVCxPQUFLLEVBQUUsQ0FBQzs7QUFFUixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxLQUFHLEVBQUUsQ0FBQzs7QUFFTixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxXQUFTLEVBQUUsQ0FBQzs7Ozs7OztBQVNaLE1BQUksRUFBRSxDQUFDO0VBQ1AsQ0FBQTs7Ozs7Ozs7QUFNTSxPQUFNLE1BQU0sU0FBUyxFQUFFLENBQUM7QUFDOUIsYUFBVyxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUU7QUFDOUIsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVWLE9BQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0dBQ2hDO0VBQ0QiLCJmaWxlIjoicHJpdmF0ZS9Nc0FzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjYXR9IGZyb20gJy4vdXRpbCdcblxuLyoqXG5BbnkgTWFzb24gQVNULlxuQWxsIEFTVHMgaGF2ZSBhIGBsb2NgIHRoYXQgdGhleSBwYXNzIG9uIHRvIHRoZSBlc2FzdCBkdXJpbmcge0BsaW5rIHRyYW5zcGlsZX0uXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXNBc3Qge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHQvKiogQHR5cGUge0xvY30gKi9cblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8vIExpbmVDb250ZW50XG5cdC8qKlxuXHRBbnkgdmFsaWQgcGFydCBvZiBhIEJsb2NrLlxuXHROb3RlIHRoYXQgc29tZSB7QGxpbmsgVmFsfXMgd2lsbCBzdGlsbCBjYXVzZSB3YXJuaW5ncyBpZiB0aGV5IGFwcGVhciBhcyBhIGxpbmUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBMaW5lQ29udGVudCBleHRlbmRzIE1zQXN0IHsgfVxuXG5cdC8qKiBDYW4gb25seSBhcHBlYXIgYXMgbGluZXMgaW4gYSBCbG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIERvIGV4dGVuZHMgTGluZUNvbnRlbnQgeyB9XG5cblx0LyoqIENhbiBhcHBlYXIgaW4gYW55IGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBWYWwgZXh0ZW5kcyBMaW5lQ29udGVudCB7IH1cblxuLy8gTW9kdWxlXG5cdC8qKiBXaG9sZSBzb3VyY2UgZmlsZS4gKi9cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIG9wQ29tbWVudCwgZG9JbXBvcnRzLCBpbXBvcnRzLCBvcEltcG9ydEdsb2JhbCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0Tm90IHVzZWQgZm9yIGNvbXBpbGF0aW9uLCBidXQgdXNlZnVsIGZvciB0b29scy5cblx0XHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8SW1wb3J0RG8+fSAqL1xuXHRcdFx0dGhpcy5kb0ltcG9ydHMgPSBkb0ltcG9ydHNcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8SW1wb3J0Pn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0cyA9IGltcG9ydHNcblx0XHRcdC8qKiBAdHlwZSB7P0ltcG9ydEdsb2JhbH0gKi9cblx0XHRcdHRoaXMub3BJbXBvcnRHbG9iYWwgPSBvcEltcG9ydEdsb2JhbFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxEbz59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogU2luZ2xlIGV4cG9ydC4gKi9cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZUV4cG9ydCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBc3NpZ25TaW5nbGV9ICovXG5cdFx0XHR0aGlzLmFzc2lnbiA9IGFzc2lnblxuXHRcdH1cblx0fVxuXHQvKiogQ3JlYXRlZCB3aXRoIGFuIE9iakFzc2lnbiBpbiByb290LiAqL1xuXHRleHBvcnQgY2xhc3MgTW9kdWxlRXhwb3J0TmFtZWQgZXh0ZW5kcyBNb2R1bGVFeHBvcnQgeyB9XG5cdC8qKiBDcmVhdGVkIGJ5IGFzc2lnbmluZyB0byB0aGUgbW9kdWxlJ3MgbmFtZS4gKi9cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZUV4cG9ydERlZmF1bHQgZXh0ZW5kcyBNb2R1bGVFeHBvcnQgeyB9XG5cblx0LyoqIFNpbmdsZSBpbXBvcnQgaW4gYW4gYGltcG9ydCFgIGJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0RG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHR9XG5cdH1cblxuXHQvKiogU2luZ2xlIGltcG9ydCBpbiBhbiBgaW1wb3J0YCBibG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5pbXBvcnRlZCA9IGltcG9ydGVkXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0RGVmYXVsdCA9IG9wSW1wb3J0RGVmYXVsdFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRJbXBvcnRzIGZyb20gJ2dsb2JhbCcgYXJlIGhhbmRsZWQgc3BlY2lhbGx5IGJlY2F1c2UgdGhlcmUncyBubyBtb2R1bGUgdG8gaW1wb3J0IGZyb20uXG5cdE90aGVyIHRoYW4gdGhhdCwgc2FtZSBhcyB7QGxpbmsgSW1wb3J0fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydEdsb2JhbCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0ZWQgPSBpbXBvcnRlZFxuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5vcEltcG9ydERlZmF1bHQgPSBvcEltcG9ydERlZmF1bHRcblx0XHR9XG5cdH1cblxuLy8gTG9jYWxzXG5cdC8qKlxuXHRBbGwge0BsaW5rIExvY2FsQWNjZXNzfWVzIG11c3QgaGF2ZSBzb21lIExvY2FsRGVjbGFyZSB0byBhY2Nlc3MuXG5cdEFsbCBhY2Nlc3NpYmxlIGlkZW50aWZpZXJzIGFyZSB0aGVyZWZvcmUgTG9jYWxEZWNsYXJlcy5cblx0VGhpcyBpbmNsdWRlcyBpbXBvcnRzLCBgdGhpc2AsIHRoZSBmb2N1cywgZXRjLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdC8qKiBMb2NhbERlY2xhcmUgd2l0aCBubyB0eXBlLiAqL1xuXHRcdHN0YXRpYyB1bnR5cGVkKGxvYywgbmFtZSwga2luZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBraW5kKVxuXHRcdH1cblxuXHRcdC8qKiBMb2NhbERlY2xhcmUgb2YganVzdCBhIG5hbWUuICovXG5cdFx0c3RhdGljIHBsYWluKGxvYywgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBMb2NhbERlY2xhcmVzLkNvbnN0KVxuXHRcdH1cblxuXHRcdHN0YXRpYyBidWlsdChsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ2J1aWx0Jylcblx0XHR9XG5cdFx0c3RhdGljIGZvY3VzKGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAnXycpXG5cdFx0fVxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAndGhpcycpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcFR5cGUsIGtpbmQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cblx0XHRpc0xhenkoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMb2NhbERlY2xhcmVzLkxhenlcblx0XHR9XG5cblx0XHRpc011dGFibGUoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmQgb2Yge0BsaW5rIExvY2FsRGVjbGFyZX0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBMb2NhbERlY2xhcmVzID0ge1xuXHRcdC8qKiBEZWNsYXJlZCBub3JtYWxseS4gKi9cblx0XHRDb25zdDogMCxcblx0XHQvKiogRGVjbGFyZWQgd2l0aCBgfmFgLiAqL1xuXHRcdExhenk6IDEsXG5cdFx0LyoqIERlY2xhcmVkIHdpdGggYDo6PWAuICovXG5cdFx0TXV0YWJsZTogMlxuXHR9XG5cblx0LyoqIEFjY2VzcyB0aGUgbG9jYWwgYG5hbWVgLiAqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxBY2Nlc3MgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAnXycpXG5cdFx0fVxuXG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7bmFtZX0gOj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIExvY2FsTXV0YXRlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQXNzaWduXG5cdC8qKiBBbnkgZXhwcmVzc2lvbiBjcmVhdGluZyBuZXcgbG9jYWxzLiAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduIGV4dGVuZHMgRG8ge1xuXHRcdC8qKlxuXHRcdEFsbCBsb2NhbHMgY3JlYXRlZCBieSB0aGUgYXNzaWduLlxuXHRcdEBhYnN0cmFjdFxuXHRcdCovXG5cdFx0YWxsQXNzaWduZWVzKCkge31cblx0fVxuXG5cdC8qKiBge2Fzc2lnbmVlfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduU2luZ2xlIGV4dGVuZHMgQXNzaWduIHtcblx0XHQvKiogQXNzaWduIHRvIGBfYC4gKi9cblx0XHRzdGF0aWMgZm9jdXMobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25TaW5nbGUobG9jLCBMb2NhbERlY2xhcmUuZm9jdXMobG9jKSwgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZSA9IGFzc2lnbmVlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKiBAb3ZlcnJpZGUgKi9cblx0XHRhbGxBc3NpZ25lZXMoKSB7IHJldHVybiBbdGhpcy5hc3NpZ25lZV0gfVxuXHR9XG5cblx0LyoqIGB7YXNzaWduZWVzfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduRGVzdHJ1Y3R1cmUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWVzLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZXMgPSBhc3NpZ25lZXNcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0S2luZCBvZiBsb2NhbHMgdGhpcyBhc3NpZ25zIHRvLlxuXHRcdEByZXR1cm4ge0xvY2FsRGVjbGFyZXN9XG5cdFx0Ki9cblx0XHRraW5kKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzWzBdLmtpbmRcblx0XHR9XG5cblx0XHQvKiogQG92ZXJyaWRlICovXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0IFNldHRlcnMgPSB7XG5cdFx0SW5pdDogMCxcblx0XHRNdXRhdGU6IDEsXG5cdFx0SW5pdE11dGFibGU6IDJcblx0fVxuXG5cdC8qKlxuXHRge29iamVjdH0ue25hbWV9OntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gXG5cdEFsc28gaGFuZGxlcyBge29iamVjdH0uXCJ7bmFtZX1cImAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJTZXQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIG5hbWUsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7U2V0dGVyc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7b2JqZWN0fVt7c3ViYmVkc31dOntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBTZXRTdWIgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIHN1YmJlZHMsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuc3ViYmVkcyA9IHN1YmJlZHNcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge1NldHRlcnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBFcnJvcnNcblx0LyoqIGB0aHJvdyEge29wVGhyb3dufWAgKi9cblx0ZXhwb3J0IGNsYXNzIFRocm93IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUaHJvd24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdC8qKiBgYXNzZXJ0IS9mb3JiaWQhIHtjb25kaXRpb259IHRocm93ISB7b3BUaHJvd259YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzZXJ0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmVnYXRlLCBjb25kaXRpb24sIG9wVGhyb3duKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdElmIHRydWUsIHRoaXMgaXMgYSBgZm9yYmlkIWAuXG5cdFx0XHRAdHlwZSB7Ym9vbGVhbn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5lZ2F0ZSA9IG5lZ2F0ZVxuXHRcdFx0LyoqXG5cdFx0XHRDb21waWxlZCBzcGVjaWFsbHkgaWYgYSB7QGxpbmsgQ2FsbH0uXG5cdFx0XHRAdHlwZSB7VmFsfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVGhyb3duID0gb3BUaHJvd25cblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgZXhjZXB0IVxuXHRcdHRyeSFcblx0XHRcdHt0cnl9XG5cdFx0Y2F0Y2ghXG5cdFx0XHR7Y2F0Y2h9XG5cdFx0ZmluYWxseSFcblx0XHRcdHtmaW5hbGx5fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRXhjZXB0RG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLnRyeSA9IF90cnlcblx0XHRcdC8qKiBAdHlwZSB7P0NhdGNofSAqL1xuXHRcdFx0dGhpcy5jYXRjaCA9IF9jYXRjaFxuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuZmluYWxseSA9IF9maW5hbGx5XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGV4Y2VwdFxuXHRcdHRyeVxuXHRcdFx0e3RyeX1cblx0XHRjYXRjaFxuXHRcdFx0e2NhdGNofVxuXHRcdGZpbmFsbHkhXG5cdFx0XHR7ZmluYWxseX1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEV4Y2VwdFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy50cnkgPSBfdHJ5XG5cdFx0XHQvKiogQHR5cGUgez9DYXRjaH0gKi9cblx0XHRcdHRoaXMuY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuZmluYWxseSA9IF9maW5hbGx5XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGNhdGNoIHtjYXVnaHR9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2F0Y2ggZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBjYXVnaHQsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuY2F1Z2h0ID0gY2F1Z2h0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cbi8vIEJsb2NrXG5cdC8qKlxuXHRDb2RlIGluIGFuIGluZGVudGVkIGJsb2NrLlxuXHRTZWUge0BsaW5rIEJsb2NrV3JhcH0gZm9yIHRoZSBraW5kIHRoYXQgYXBwZWFycyB3aGVyZSBhIFZhbCBpcyBleHBlY3RlZC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50IC8qIE9wdFtTdHJpbmddICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdH1cblx0fVxuXG5cdC8qKiBCbG9jayB0aGF0IGp1c3QgcGVyZm9ybXMgYWN0aW9ucyBhbmQgZG9lc24ndCBoYXZlIGFueSB2YWx1ZS4gKi9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrRG8gZXh0ZW5kcyBCbG9jayB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQ+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIEJsb2NrIGhhdmluZyBhIHZhbHVlLiAqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWwgZXh0ZW5kcyBCbG9jayB7IH1cblxuXHQvKipcblx0QmxvY2tWYWwgdGhhdCBhY3R1YWxseSByZXR1cm5zIGEgdmFsdWUgYXQgdGhlIGVuZC5cblx0KFRoZSBtb3N0IGNvbW1vbiBraW5kIGJ5IGZhci4pXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbFJldHVybiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMsIHJldHVybmVkKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQ+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMucmV0dXJuZWQgPSByZXR1cm5lZFxuXHRcdH1cblx0fVxuXG5cdC8qKiBUYWtlcyB0aGUgcGxhY2Ugb2YgYSBCbG9ja1ZhbCwgYnV0IGRvZXNuJ3QgYWN0dWFsbHkgcmV0dXJuIGEgdmFsdWUg4oCUIHRocm93cy4gKi9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsVGhyb3cgZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzLCBfdGhyb3cpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudD59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHRcdC8qKiBAdHlwZSB7VGhyb3d9ICovXG5cdFx0XHR0aGlzLnRocm93ID0gX3Rocm93XG5cdFx0fVxuXHR9XG5cblx0Ly8gVE9ETzogQmxvY2tCYWcsIEJsb2NrTWFwLCBCbG9ja09iaiA9PiBCbG9ja0J1aWxkKGtpbmQsIC4uLilcblx0LyoqXG5cdEJsb2NrIHJldHVybmluZyBhbiBPYmplY3QuXG5cdENvbnRhaW5zIG1hbnkge0BsaW5rIE9iakVudHJ5fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrT2JqIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQgfCBPYmpFbnRyeT59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogUGFydCBvZiBhIHtAbGluayBCbG9ja09iaiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBhLiBiYFxuXHRPYmpFbnRyeSB0aGF0IHByb2R1Y2VzIGEgbmV3IGxvY2FsLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlBc3NpZ24gZXh0ZW5kcyBPYmpFbnRyeSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXNzaWdufSAqL1xuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblxuXHQvKiogT2JqRW50cnkgdGhhdCBkb2VzIG5vdCBpbnRyb2R1Y2UgYSBuZXcgbG9jYWwuICovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeVBsYWluIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdC8qKlxuXHRcdGB7bmFtZX0uYCB3aXRoIG5vIHZhbHVlLlxuXHRcdFRha2VzIGEgbG9jYWwgb2YgdGhlIHNhbWUgbmFtZSBmcm9tIG91dHNpZGUuXG5cdFx0Ki9cblx0XHRzdGF0aWMgYWNjZXNzKGxvYywgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgbmFtZSwgbmV3IExvY2FsQWNjZXNzKGxvYywgbmFtZSkpXG5cdFx0fVxuXG5cdFx0c3RhdGljIG5hbWUobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgJ25hbWUnLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdEJhZy1idWlsZGluZyBibG9jay5cblx0Q29udGFpbnMgbWFueSB7QGxpbmsgQmFnRW50cnl9IGFuZCB7QGxpbmsgQmFnRW50cnlNYW55fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrQmFnIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQgfCBCYWdFbnRyeT59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogYC4ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAuLi4ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5TWFueSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRNYXAtYnVpbGRpbmcgYmxvY2suXG5cdENvbnRhaW5zIG1hbnkge0BsaW5rIE1hcEVudHJ5fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrTWFwIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TGluZUNvbnRlbnQgfCBNYXBFbnRyeX0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBga2V5YCAtPiBgdmFsYCAqL1xuXHRleHBvcnQgY2xhc3MgTWFwRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXksIHZhbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbCA9IHZhbFxuXHRcdH1cblx0fVxuXG4vLyBDb25kaXRpb25hbHNcblx0LyoqXG5cdGBgYGlmIS91bmxlc3MhIHt0ZXN0fVxuXHRcdHtyZXN1bHR9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDb25kaXRpb25hbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0LCBpc1VubGVzcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc1VubGVzcyA9IGlzVW5sZXNzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGlmL3VubGVzcyB7dGVzdH1cblx0XHR7cmVzdWx0fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0LCBpc1VubGVzcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgY29uZCB7dGVzdH0ge2lmVHJ1ZX0ge2lmRmFsc2V9YCAqL1xuXHRleHBvcnQgY2xhc3MgQ29uZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCBpZlRydWUsIGlmRmFsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmlmVHJ1ZSA9IGlmVHJ1ZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmlmRmFsc2UgPSBpZkZhbHNlXG5cdFx0fVxuXHR9XG5cbi8vIEZ1blxuXHQvKipcblx0YGBgfDp7b3BEZWNsYXJlUmVzfSB7YXJnc30gLi4ue29wUmVzdEFyZ31cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBGdW4gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jayxcblx0XHRcdGlzR2VuZXJhdG9yPWZhbHNlLCBvcERlY2xhcmVUaGlzPW51bGwsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmVUaGlzfSAqL1xuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID0gb3BEZWNsYXJlVGhpc1xuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc0dlbmVyYXRvciA9IGlzR2VuZXJhdG9yXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wUmVzdEFyZyA9IG9wUmVzdEFyZ1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFJldHVyblR5cGUgPSBvcFJldHVyblR5cGVcblx0XHR9XG5cdH1cblxuLy8gR2VuZXJhdG9yXG5cdC8qKlxuXHRgPH4ge29wWWllbGRlZH1gXG5cdFRoZXNlIGFyZSBhbHNvIHRoZSB2YWx1ZSBwYXJ0IG9mIGBhIDx+IGJgIGFzc2lnbm1lbnRzLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgWWllbGQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BZaWVsZGVkPW51bGwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BZaWVsZGVkID0gb3BZaWVsZGVkXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGA8fn4ge3lpZWxkZWRUb31gXG5cdFRoZXNlIGFyZSBhbHNvIHRoZSB2YWx1ZSBwYXJ0IG9mIGBhIDx+fiBiYCBhc3NpZ25tZW50cy5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFlpZWxkVG8gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgeWllbGRlZFRvKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMueWllbGRlZFRvID0geWllbGRlZFRvXG5cdFx0fVxuXHR9XG5cbi8vIENsYXNzXG5cdC8qKlxuXHRgYGBjbGFzcyB7b3BTdXBlckNsYXNzfVxuXHRcdHtvcENvbW1lbnR9XG5cdFx0ZG8hXG5cdFx0XHR7b3BEb31cblx0XHRzdGF0aWNcblx0XHRcdHtzdGF0aWNzfVxuXHRcdHtvcENvbnN0cnVjdG9yfVxuXHRcdHttZXRob2RzfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BTdXBlckNsYXNzLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BTdXBlckNsYXNzID0gb3BTdXBlckNsYXNzXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHs/Q2xhc3NEb30gKi9cblx0XHRcdHRoaXMub3BEbyA9IG9wRG9cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5zdGF0aWNzID0gc3RhdGljc1xuXHRcdFx0LyoqIEB0eXBlIHs/Q29uc3RydWN0b3J9ICovXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IgPSBvcENvbnN0cnVjdG9yXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMubWV0aG9kcyA9IG1ldGhvZHNcblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbnN0cnVjdCEge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBDb25zdHJ1Y3RvciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1biwgbWVtYmVyQXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRUaGlzIHdpbGwgYWx3YXlzIGhhdmUgYSB7QGxpbmsgQmxvY2tEb30uXG5cdFx0XHRAdHlwZSB7RnVufVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLm1lbWJlckFyZ3MgPSBtZW1iZXJBcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIEFueSBwYXJ0IG9mIHtAbGluayBDbGFzcy5zdGF0aWNzfSBvciB7QGxpbmsgQ2xhc3MubWV0aG9kc30uICovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsTGlrZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLnN5bWJvbCA9IHN5bWJvbFxuXHRcdH1cblx0fVxuXHQvKiogYHtzeW1ib2x9IHtmdW59YCAqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbCBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgZnVuKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7RnVufSAqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHR9XG5cdH1cblx0LyoqXG5cdGBgYGdldCB7c3ltYm9sfVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEdldHRlciBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5kZWNsYXJlVGhpcyA9IExvY2FsRGVjbGFyZS50aGlzKGxvYylcblx0XHR9XG5cdH1cblx0LyoqXG5cdGBgYHNldCB7c3ltYm9sfVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZFNldHRlciBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBMb2NhbERlY2xhcmUudGhpcyhsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBkbyFgIHBhcnQgb2Yge0BsaW5rIENsYXNzfS4gKi9cblx0ZXhwb3J0IGNsYXNzIENsYXNzRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZUZvY3VzfSAqL1xuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBMb2NhbERlY2xhcmUuZm9jdXMobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgc3VwZXIge2FyZ3N9YC5cblx0TmV2ZXIgYSB7QGxpbmsgU3VwZXJNZW1iZXJ9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3VwZXJDYWxsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsIHwgU3BsYXQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgc3VwZXIhIHthcmdzfWBcblx0TmV2ZXIgYSB7QGxpbmsgU3VwZXJNZW1iZXJ9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3VwZXJDYWxsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwbGF0Pn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYHN1cGVyLntuYW1lfWAgb3IgYHN1cGVyLlwie25hbWV9XCJgLiAqL1xuXHRleHBvcnQgY2xhc3MgU3VwZXJNZW1iZXIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cbi8vIENhbGxzXG5cdC8qKiBge2NhbGxlZH0ge2FyZ3N9YCAqL1xuXHRleHBvcnQgY2xhc3MgQ2FsbCBleHRlbmRzIFZhbCB7XG5cdFx0LyoqIGB7dGVzdGVkfTp7dGVzdFR5cGV9YCAqL1xuXHRcdHN0YXRpYyBjb250YWlucyhsb2MsIHRlc3RUeXBlLCB0ZXN0ZWQpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuQ29udGFpbnMpLCBbdGVzdFR5cGUsIHRlc3RlZF0pXG5cdFx0fVxuXG5cdFx0LyoqIGB7c3ViYmVkfVt7YXJnc31dYCAqL1xuXHRcdHN0YXRpYyBzdWIobG9jLCBzdWJiZWQsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuU3ViKSwgY2F0KHN1YmJlZCwgYXJncykpXG5cdFx0fVxuXG5cdFx0LyoqIGBkZWwhIHtzdWJiZWR9W3thcmdzfV1gICovXG5cdFx0c3RhdGljIGRlbFN1Yihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5EZWxTdWIpLCBjYXQoc3ViYmVkLCBhcmdzKSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmNhbGxlZCA9IGNhbGxlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcGxhdD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBuZXcge3R5cGV9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgU3BsYXR9ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAuLi57c3BsYXR0ZWR9YCAqL1xuXHRleHBvcnQgY2xhc3MgU3BsYXQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzcGxhdHRlZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnNwbGF0dGVkID0gc3BsYXR0ZWRcblx0XHR9XG5cdH1cblxuXHQvKiogYH57dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQ2FzZVxuXHQvKiogYGNhc2UhYCBzdGF0ZW1lbnQuICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdEFzc2lnbmVlIGlzIGFsd2F5cyBhIExvY2FsRGVjbGFyZUZvY3VzLlxuXHRcdFx0QHR5cGUgez9Bc3NpZ25TaW5nbGV9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlRG9QYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2tEb30gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKiBTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBDYXNlRG99LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2FzZURvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWwgfCBQYXR0ZXJufSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHQvKiogYGNhc2VgIGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0Fzc2lnblNpbmdsZX0gKi9cblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8Q2FzZVZhbFBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKiBTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBDYXNlVmFsfS4gKi9cblx0ZXhwb3J0IGNsYXNzIENhc2VWYWxQYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFBhdHRlcm59ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHQvKiogYDp7dHlwZX0ge2xvY2Fsc31gICovXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgbG9jYWxzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsQWNjZXNzfSAqL1xuXHRcdFx0dGhpcy5wYXR0ZXJuZWQgPSBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cbi8vIFN3aXRjaFxuXHQvKiogYHN3aXRjaCFgIHN0YXRlbWVudC4gKi9cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFN3aXRjaERvUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gIHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqXG5cdFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIFN3aXRjaERvfS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzLCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgc3dpdGNoYCBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3dpdGNoZWQgPSBzd2l0Y2hlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxTd2l0Y2hWYWxQYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXHQvKipcblx0U2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgU3dpdGNoVmFsfS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcywgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cbi8vIEZvclxuXHQvKiogYGZvciEgKi9cblx0ZXhwb3J0IGNsYXNzIEZvckRvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBmb3JgICovXG5cdGV4cG9ydCBjbGFzcyBGb3JWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBAZm9yYFxuXHRDb250YWlucyBtYW55IHtAbGluayBCYWdFbnRyeX0gYW5kIHtAbGluayBCYWdFbnRyeU1hbnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQmFnIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB4IGluIHlgIG9yIGp1c3QgYHlgICh3aGVyZSB0aGUgbG9jYWwgaXMgaW1wbGljaXRseSBgX2ApLiAqL1xuXHRleHBvcnQgY2xhc3MgSXRlcmF0ZWUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBlbGVtZW50IC8qIExvY2FsRGVjbGFyZSAqLywgYmFnIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuYmFnID0gYmFnXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBicmVhayFgICovXG5cdGV4cG9ydCBjbGFzcyBCcmVhayBleHRlbmRzIERvIHsgfVxuXG5cdC8qKiBgYnJlYWsge3ZhbH1gICovXG5cdGV4cG9ydCBjbGFzcyBCcmVha1dpdGhWYWwgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gTWlzY2VsbGFuZW91cyBWYWxzXG5cdC8qKlxuXHRBIGJsb2NrIGFwcGVhcmluZyBvbiBpdHMgb3duIChub3QgYXMgdGhlIGJsb2NrIHRvIGFuIGBpZmAgb3IgdGhlIGxpa2UpXG5cdGlzIHB1dCBpbnRvIG9uZSBvZiB0aGVzZS5cblx0ZS5nLjpcblxuXHRcdHggPVxuXHRcdFx0eSA9IDFcblx0XHRcdHlcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrV3JhcCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKiBPbmUtbGluZSBAIGV4cHJlc3Npb24sIHN1Y2ggYXMgYFsgMSAyIDMgXWAuICovXG5cdGV4cG9ydCBjbGFzcyBCYWdTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdC8qKiBPbmUtbGluZSBvYmplY3QgZXhwcmVzc2lvbiwgc3VjaCBhcyBgKGEuIDEgYi4gMilgLiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhaXJzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE9ialBhaXI+fSAqL1xuXHRcdFx0dGhpcy5wYWlycyA9IHBhaXJzXG5cdFx0fVxuXHR9XG5cdC8qKiBQYXJ0IG9mIGFuIHtAbGluayBPYmpTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqUGFpciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBhbmRgIG9yIGBvcmAgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIExvZ2ljIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9naWNzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIExvZ2ljfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IExvZ2ljcyA9IHtcblx0XHQvKiogYGFuZGAga2V5d29yZCovXG5cdFx0QW5kOiAwLFxuXHRcdC8qKiBgb3JgIGtleXdvcmQgKi9cblx0XHRPcjogMVxuXHR9XG5cblx0LyoqIGBub3RgIGtleXdvcmQgKi9cblx0ZXhwb3J0IGNsYXNzIE5vdCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmcpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5hcmcgPSBhcmdcblx0XHR9XG5cdH1cblxuXHQvKipcblx0TGl0ZXJhbCBudW1iZXIgdmFsdWUuXG5cdFRoaXMgaXMgYm90aCBhIFRva2VuIGFuZCBNc0FzdC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE51bWJlckxpdGVyYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0U3RvcmUgYXMgYSBzdHJpbmcgc28gd2UgY2FuIGRpc3Rpbmd1aXNoIGAweGZgIGFuZCBgMTVgLlxuXHRcdFx0QHR5cGUge3N0cmluZ31cblx0XHRcdCovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKipcblx0XHRAb3ZlcnJpZGVcblx0XHRTaW5jZSB0aGlzIGlzIHVzZWQgYXMgYSBUb2tlbiwgaXQgbXVzdCBpbXBsZW1lbnQgdG9TdHJpbmcuXG5cdFx0Ki9cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiB0aGlzLnZhbHVlLnRvU3RyaW5nKClcblx0XHR9XG5cdH1cblxuXHQvKiogYHtvYmplY3R9LntuYW1lfWAgb3IgYHtvYmplY3R9Llwie25hbWV9XCJgLiAqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCwgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0LyoqXG5cdFx0XHRJZiBhIHN0cmluZywgY291bGQgc3RpbGwgYmUgYW55IHN0cmluZywgc28gbWF5IHN0aWxsIGNvbXBpbGUgdG8gYGFbJ3N0cmluZyddYC5cblx0XHRcdEB0eXBlIHtzdHJpbmcgfCBWYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRRdW90ZWQgdGV4dC5cblx0TWFzb24gdXNlcyB0ZW1wbGF0ZSBzdHJpbmdzIGZvciBhbGwgc3RyaW5ncy5cblx0Rm9yIHRhZ2dlZCB0ZW1wbGF0ZXMsIHVzZSB7QGxpbmsgUXVvdGVUZW1wbGF0ZX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZSBleHRlbmRzIFZhbCB7XG5cdFx0LyoqIFF1b3RlIHRoYXQgaXMganVzdCBhIHNpbXBsZSBzdHJpbmcgbGl0ZXJhbC4gKi9cblx0XHRzdGF0aWMgZm9yU3RyaW5nKGxvYywgc3RyKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFF1b3RlKGxvYywgW3N0cl0pXG5cdFx0fVxuXG5cdFx0Ly8gcGFydHMgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdC8vIHBhcnQgU3RyaW5ncyBhcmUgcmF3IHZhbHVlcywgbWVhbmluZyBcIlxcblwiIGlzIHR3byBjaGFyYWN0ZXJzLlxuXHRcdC8vIFNpbmNlIFwiXFx7XCIgaXMgc3BlY2lhbCB0byBNYXNvbiwgdGhhdCdzIG9ubHkgb25lIGNoYXJhY3Rlci5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PHN0cmluZyB8IFZhbD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogYHt0YWd9XCJ7cXVvdGV9XCJgICovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZywgcXVvdGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdC8qKiBAdHlwZSB7UXVvdGV9ICovXG5cdFx0XHR0aGlzLnF1b3RlID0gcXVvdGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgd2l0aCB7dmFsdWV9IFthcyB7ZGVjbGFyZX1dXG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgV2l0aCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBkZWNsYXJlLCB2YWx1ZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5kZWNsYXJlID0gZGVjbGFyZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG4vLyBTcGVjaWFsXG5cdC8qKlxuXHRBIHNwZWNpYWwgYWN0aW9uLlxuXHRBbGwgU3BlY2lhbERvcyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtTcGVjaWFsRG9zfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIFNwZWNpYWxEb30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsRG9zID0ge1xuXHRcdERlYnVnZ2VyOiAwXG5cdH1cblxuXHQvKipcblx0QSBzcGVjaWFsIGV4cHJlc3Npb24uXG5cdEFsbCBTcGVjaWFsVmFscyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxWYWxzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbFZhbH0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsVmFscyA9IHtcblx0XHQvKiogYF9tcy5jb250YWluc2AgdXNlZCBmb3Ige0BsaW5rIENhbGwuY29udGFpbnN9ICovXG5cdFx0Q29udGFpbnM6IDAsXG5cdFx0LyoqIGBfbXMuZGVsU3ViYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5kZWxTdWJ9ICovXG5cdFx0RGVsU3ViOiAxLFxuXHRcdC8qKiBgZmFsc2VgIGxpdGVyYWwgKi9cblx0XHRGYWxzZTogMixcblx0XHQvKiogYG51bGxgIGxpdGVyYWwgKi9cblx0XHROdWxsOiAzLFxuXHRcdC8qKiBgX21zLnN1YmAgdXNlZCBmb3Ige0BsaW5rIENhbGwuc3VifSAqL1xuXHRcdFN1YjogNCxcblx0XHQvKiogYHRydWVgIGxpdGVyYWwgKi9cblx0XHRUcnVlOiA1LFxuXHRcdC8qKiBgdm9pZCAwYCAqL1xuXHRcdFVuZGVmaW5lZDogNixcblx0XHQvKipcblx0XHRgbmFtZWAgdmFsdWUgaXMgdGhlIG5hbWUgb2YgdGhlIG5lYXJlc3QgYXNzaWduZWQgdmFsdWUuIEluOlxuXG5cdFx0XHR4ID0gbmV3IE1ldGhvZFxuXHRcdFx0XHRuYW1lLlxuXG5cdFx0YG5hbWVgIHdpbGwgYmUgXCJ4XCIuXG5cdFx0Ki9cblx0XHROYW1lOiA3XG5cdH1cblxuXHQvKipcblx0YGlnbm9yZWAgc3RhdGVtZW50LlxuXHRLZWVwcyB0aGUgY29tcGlsZXIgZnJvbSBjb21wbGFpbmluZyBhYm91dCBhbiB1bnVzZWQgbG9jYWwuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJZ25vcmUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpZ25vcmVkTmFtZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cblx0XHRcdHRoaXMuaWdub3JlZE5hbWVzID0gaWdub3JlZE5hbWVzXG5cdFx0fVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

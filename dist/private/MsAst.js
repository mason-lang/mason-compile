'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.util);
		global.MsAst = mod.exports;
	}
})(this, function (exports, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Ignore = exports.SpecialVals = exports.SpecialVal = exports.SpecialDos = exports.SpecialDo = exports.Range = exports.GetterFun = exports.MemberFun = exports.With = exports.QuoteSimple = exports.QuoteTaggedTemplate = exports.QuotePlain = exports.QuoteAbstract = exports.Member = exports.NumberLiteral = exports.Not = exports.Logics = exports.Logic = exports.ObjPair = exports.ObjSimple = exports.BagSimple = exports.BlockWrap = exports.BreakWithVal = exports.Break = exports.Iteratee = exports.ForBag = exports.For = exports.SwitchPart = exports.Switch = exports.Pattern = exports.CasePart = exports.Case = exports.Lazy = exports.Spread = exports.New = exports.Call = exports.SuperMember = exports.SuperCall = exports.MethodSetter = exports.MethodGetter = exports.MethodImpl = exports.MethodImplLike = exports.Constructor = exports.ClassKindDo = exports.Class = exports.Kind = exports.YieldTo = exports.Yield = exports.Funs = exports.Fun = exports.Cond = exports.Conditional = exports.MapEntry = exports.BlockMap = exports.BagEntryMany = exports.BagEntry = exports.BlockBag = exports.ObjEntryPlain = exports.ObjEntryAssign = exports.ObjEntry = exports.BlockObj = exports.BlockValThrow = exports.BlockValReturn = exports.BlockVal = exports.BlockDo = exports.Block = exports.Catch = exports.Except = exports.Assert = exports.Throw = exports.SetSub = exports.MemberSet = exports.Setters = exports.AssignDestructure = exports.AssignSingle = exports.Assign = exports.LocalMutate = exports.LocalAccess = exports.LocalDeclares = exports.LocalDeclare = exports.ImportGlobal = exports.Import = exports.ImportDo = exports.ModuleExportDefault = exports.ModuleExportNamed = exports.ModuleExport = exports.Module = exports.Val = exports.Do = exports.LineContent = undefined;

	class MsAst {
		constructor(loc) {
			this.loc = loc;
		}

	}

	exports.default = MsAst;

	class LineContent extends MsAst {
		canBeStatement() {
			return true;
		}

	}

	exports.LineContent = LineContent;

	class Do extends LineContent {}

	exports.Do = Do;

	class Val extends LineContent {
		canBeStatement() {
			return false;
		}

	}

	exports.Val = Val;

	class Module extends MsAst {
		constructor(loc, name, opComment, doImports, imports, opImportGlobal, lines) {
			super(loc);
			this.name = name;
			this.opComment = opComment;
			this.doImports = doImports;
			this.imports = imports;
			this.opImportGlobal = opImportGlobal;
			this.lines = lines;
		}

	}

	exports.Module = Module;

	class ModuleExport extends Do {
		constructor(loc, assign) {
			super(loc);
			this.assign = assign;
		}

	}

	exports.ModuleExport = ModuleExport;

	class ModuleExportNamed extends ModuleExport {}

	exports.ModuleExportNamed = ModuleExportNamed;

	class ModuleExportDefault extends ModuleExport {
		static forVal(loc, name, value) {
			const assignee = LocalDeclare.plain(loc, name);
			const assign = new AssignSingle(loc, assignee, value);
			return new ModuleExportDefault(loc, assign);
		}

	}

	exports.ModuleExportDefault = ModuleExportDefault;

	class ImportDo extends MsAst {
		constructor(loc, path) {
			super(loc);
			this.path = path;
		}

	}

	exports.ImportDo = ImportDo;

	class Import extends MsAst {
		constructor(loc, path, imported, opImportDefault) {
			super(loc);
			this.path = path;
			this.imported = imported;
			this.opImportDefault = opImportDefault;
		}

	}

	exports.Import = Import;

	class ImportGlobal extends MsAst {
		constructor(loc, imported, opImportDefault) {
			super(loc);
			this.imported = imported;
			this.opImportDefault = opImportDefault;
		}

	}

	exports.ImportGlobal = ImportGlobal;

	class LocalDeclare extends MsAst {
		static untyped(loc, name, kind) {
			return new LocalDeclare(loc, name, null, kind);
		}

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
			this.name = name;
			this.opType = opType;
			this.kind = kind;
		}

		isLazy() {
			return this.kind === LocalDeclares.Lazy;
		}

		isMutable() {
			return this.kind === LocalDeclares.Mutable;
		}

	}

	exports.LocalDeclare = LocalDeclare;
	const LocalDeclares = exports.LocalDeclares = {
		/** Declared normally. */
		Const: 0,
		/** Declared with `~a`. */
		Lazy: 1,
		/** Declared with `::=`. */
		Mutable: 2
	};

	class LocalAccess extends Val {
		static focus(loc) {
			return new LocalAccess(loc, '_');
		}

		static this(loc) {
			return new LocalAccess(loc, 'this');
		}

		constructor(loc, name) {
			super(loc);
			this.name = name;
		}

	}

	exports.LocalAccess = LocalAccess;

	class LocalMutate extends Do {
		constructor(loc, name, value) {
			super(loc);
			this.name = name;
			this.value = value;
		}

	}

	exports.LocalMutate = LocalMutate;

	class Assign extends Do {
		allAssignees() {}

	}

	exports.Assign = Assign;

	class AssignSingle extends Assign {
		static focus(loc, value) {
			return new AssignSingle(loc, LocalDeclare.focus(loc), value);
		}

		constructor(loc, assignee, value) {
			super(loc);
			this.assignee = assignee;
			this.value = value;
		}

		allAssignees() {
			return [this.assignee];
		}

	}

	exports.AssignSingle = AssignSingle;

	class AssignDestructure extends Assign {
		constructor(loc, assignees, value) {
			super(loc);
			this.assignees = assignees;
			this.value = value;
		}

		kind() {
			return this.assignees[0].kind;
		}

		allAssignees() {
			return this.assignees;
		}

	}

	exports.AssignDestructure = AssignDestructure;
	const Setters = exports.Setters = {
		Init: 0,
		Mutate: 1,
		InitMutable: 2
	};

	class MemberSet extends Do {
		constructor(loc, object, name, opType, kind, value) {
			super(loc);
			this.object = object;
			this.name = name;
			this.opType = opType;
			this.kind = kind;
			this.value = value;
		}

	}

	exports.MemberSet = MemberSet;

	class SetSub extends Do {
		constructor(loc, object, subbeds, opType, kind, value) {
			super(loc);
			this.object = object;
			this.subbeds = subbeds;
			this.opType = opType;
			this.kind = kind;
			this.value = value;
		}

	}

	exports.SetSub = SetSub;

	class Throw extends Do {
		constructor(loc, opThrown) {
			super(loc);
			this.opThrown = opThrown;
		}

	}

	exports.Throw = Throw;

	class Assert extends Do {
		constructor(loc, negate, condition, opThrown) {
			super(loc);
			this.negate = negate;
			this.condition = condition;
			this.opThrown = opThrown;
		}

	}

	exports.Assert = Assert;

	class Except extends LineContent {
		constructor(loc, _try, _catch, _finally) {
			super(loc);
			this.try = _try;
			this.catch = _catch;
			this.finally = _finally;
		}

		get isVal() {
			return this.try instanceof BlockVal;
		}

	}

	exports.Except = Except;

	class Catch extends MsAst {
		constructor(loc, caught, block) {
			super(loc);
			this.caught = caught;
			this.block = block;
		}

	}

	exports.Catch = Catch;

	class Block extends MsAst {
		constructor(loc, opComment) {
			super(loc);
			this.opComment = opComment;
		}

	}

	exports.Block = Block;

	class BlockDo extends Block {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			this.lines = lines;
		}

	}

	exports.BlockDo = BlockDo;

	class BlockVal extends Block {}

	exports.BlockVal = BlockVal;

	class BlockValReturn extends BlockVal {
		constructor(loc, opComment, lines, returned) {
			super(loc, opComment);
			this.lines = lines;
			this.returned = returned;
		}

	}

	exports.BlockValReturn = BlockValReturn;

	class BlockValThrow extends BlockVal {
		constructor(loc, opComment, lines, _throw) {
			super(loc, opComment);
			this.lines = lines;
			this.throw = _throw;
		}

	}

	exports.BlockValThrow = BlockValThrow;

	class BlockObj extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			this.built = LocalDeclare.built(loc);
			this.lines = lines;
		}

	}

	exports.BlockObj = BlockObj;

	class ObjEntry extends Do {
		constructor(loc) {
			super(loc);
		}

	}

	exports.ObjEntry = ObjEntry;

	class ObjEntryAssign extends ObjEntry {
		constructor(loc, assign) {
			super(loc);
			this.assign = assign;
		}

	}

	exports.ObjEntryAssign = ObjEntryAssign;

	class ObjEntryPlain extends ObjEntry {
		static access(loc, name) {
			return new ObjEntryPlain(loc, name, new LocalAccess(loc, name));
		}

		static name(loc, value) {
			return new ObjEntryPlain(loc, 'name', value);
		}

		constructor(loc, name, value) {
			super(loc);
			this.name = name;
			this.value = value;
		}

	}

	exports.ObjEntryPlain = ObjEntryPlain;

	class BlockBag extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			this.built = LocalDeclare.built(loc);
			this.lines = lines;
		}

	}

	exports.BlockBag = BlockBag;

	class BagEntry extends Do {
		constructor(loc, value) {
			super(loc);
			this.value = value;
		}

	}

	exports.BagEntry = BagEntry;

	class BagEntryMany extends Do {
		constructor(loc, value) {
			super(loc);
			this.value = value;
		}

	}

	exports.BagEntryMany = BagEntryMany;

	class BlockMap extends BlockVal {
		constructor(loc, opComment, lines) {
			super(loc, opComment);
			this.built = LocalDeclare.built(loc);
			this.lines = lines;
		}

	}

	exports.BlockMap = BlockMap;

	class MapEntry extends Do {
		constructor(loc, key, val) {
			super(loc);
			this.key = key;
			this.val = val;
		}

	}

	exports.MapEntry = MapEntry;

	class Conditional extends LineContent {
		constructor(loc, test, result, isUnless) {
			super(loc);
			this.test = test;
			this.result = result;
			this.isUnless = isUnless;
		}

		get isVal() {
			return this.result instanceof BlockVal;
		}

	}

	exports.Conditional = Conditional;

	class Cond extends Val {
		constructor(loc, test, ifTrue, ifFalse) {
			super(loc);
			this.test = test;
			this.ifTrue = ifTrue;
			this.ifFalse = ifFalse;
		}

	}

	exports.Cond = Cond;

	class Fun extends Val {
		constructor(loc, args, opRestArg, block) {
			let kind = arguments.length <= 4 || arguments[4] === undefined ? Funs.Plain : arguments[4];
			let isThisFun = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];
			let opReturnType = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];
			super(loc);
			this.args = args;
			this.opRestArg = opRestArg;
			this.block = block;
			this.kind = kind;
			this.opDeclareThis = (0, _util.opIf)(isThisFun, () => LocalDeclare.this(this.loc));
			this.opReturnType = opReturnType;
		}

	}

	exports.Fun = Fun;
	const Funs = exports.Funs = {
		/** Regular function (`|`) */
		Plain: 0,
		/** `$|` */
		Async: 1,
		/** `~|` */
		Generator: 2
	};

	class Yield extends Val {
		constructor(loc) {
			let opYielded = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			super(loc);
			this.opYielded = opYielded;
		}

		canBeStatement() {
			return true;
		}

	}

	exports.Yield = Yield;

	class YieldTo extends Val {
		constructor(loc, yieldedTo) {
			super(loc);
			this.yieldedTo = yieldedTo;
		}

		canBeStatement() {
			return true;
		}

	}

	exports.YieldTo = YieldTo;

	class Kind extends Val {
		constructor(loc, superKinds) {
			let opComment = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
			let opDo = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
			let statics = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];
			let methods = arguments.length <= 5 || arguments[5] === undefined ? [] : arguments[5];
			super(loc);
			this.superKinds = superKinds;
			this.opComment = opComment;
			this.opDo = opDo;
			this.statics = statics;
			this.methods = methods;
		}

	}

	exports.Kind = Kind;

	class Class extends Val {
		constructor(loc, opSuperClass, kinds) {
			let opComment = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
			let opDo = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
			let statics = arguments.length <= 5 || arguments[5] === undefined ? [] : arguments[5];
			let opConstructor = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];
			let methods = arguments.length <= 7 || arguments[7] === undefined ? [] : arguments[7];
			super(loc);
			this.opSuperClass = opSuperClass;
			this.kinds = kinds;
			this.opComment = opComment;
			this.opDo = opDo;
			this.statics = statics;
			this.opConstructor = opConstructor;
			this.methods = methods;
		}

	}

	exports.Class = Class;

	class ClassKindDo extends MsAst {
		constructor(loc, block) {
			super(loc);
			this.block = block;
			this.declareFocus = LocalDeclare.focus(loc);
		}

	}

	exports.ClassKindDo = ClassKindDo;

	class Constructor extends MsAst {
		constructor(loc, fun, memberArgs) {
			super(loc);
			this.fun = fun;
			this.memberArgs = memberArgs;
		}

	}

	exports.Constructor = Constructor;

	class MethodImplLike extends MsAst {
		constructor(loc, symbol) {
			super(loc);
			this.symbol = symbol;
		}

	}

	exports.MethodImplLike = MethodImplLike;

	class MethodImpl extends MethodImplLike {
		constructor(loc, symbol, fun) {
			super(loc, symbol);
			this.fun = fun;
		}

	}

	exports.MethodImpl = MethodImpl;

	class MethodGetter extends MethodImplLike {
		constructor(loc, symbol, block) {
			super(loc, symbol);
			this.block = block;
			this.declareThis = LocalDeclare.this(loc);
		}

	}

	exports.MethodGetter = MethodGetter;

	class MethodSetter extends MethodImplLike {
		constructor(loc, symbol, block) {
			super(loc, symbol);
			this.block = block;
			this.declareThis = LocalDeclare.this(loc);
			this.declareFocus = LocalDeclare.focus(loc);
		}

	}

	exports.MethodSetter = MethodSetter;

	class SuperCall extends LineContent {
		constructor(loc, args, isVal) {
			super(loc);
			this.args = args;
			this.isVal = isVal;
		}

	}

	exports.SuperCall = SuperCall;

	class SuperMember extends Val {
		constructor(loc, name) {
			super(loc);
			this.name = name;
		}

	}

	exports.SuperMember = SuperMember;

	class Call extends Val {
		static contains(loc, testType, tested) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.Contains), [testType, tested]);
		}

		static sub(loc, subbed, args) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.Sub), (0, _util.cat)(subbed, args));
		}

		static delSub(loc, subbed, args) {
			return new Call(loc, new SpecialVal(loc, SpecialVals.DelSub), (0, _util.cat)(subbed, args));
		}

		constructor(loc, called, args) {
			super(loc);
			this.called = called;
			this.args = args;
		}

		canBeStatement() {
			return true;
		}

	}

	exports.Call = Call;

	class New extends Val {
		constructor(loc, type, args) {
			super(loc);
			this.type = type;
			this.args = args;
		}

	}

	exports.New = New;

	class Spread extends MsAst {
		constructor(loc, spreaded) {
			super(loc);
			this.spreaded = spreaded;
		}

	}

	exports.Spread = Spread;

	class Lazy extends Val {
		constructor(loc, value) {
			super(loc);
			this.value = value;
		}

	}

	exports.Lazy = Lazy;

	class Case extends LineContent {
		constructor(loc, opCased, parts, opElse) {
			super(loc);
			this.opCased = opCased;
			this.parts = parts;
			this.opElse = opElse;
		}

		get isVal() {
			return this.parts[0].isVal;
		}

	}

	exports.Case = Case;

	class CasePart extends MsAst {
		constructor(loc, test, result) {
			super(loc);
			this.test = test;
			this.result = result;
		}

		get isVal() {
			return this.result instanceof BlockVal;
		}

	}

	exports.CasePart = CasePart;

	class Pattern extends MsAst {
		constructor(loc, type, locals) {
			super(loc);
			this.type = type;
			this.locals = locals;
			this.patterned = LocalAccess.focus(loc);
		}

	}

	exports.Pattern = Pattern;

	class Switch extends LineContent {
		constructor(loc, switched, parts, opElse) {
			super(loc);
			this.switched = switched;
			this.parts = parts;
			this.opElse = opElse;
		}

		get isVal() {
			return this.parts[0].isVal;
		}

	}

	exports.Switch = Switch;

	class SwitchPart extends MsAst {
		constructor(loc, values, result) {
			super(loc);
			this.values = values;
			this.result = result;
		}

		get isVal() {
			return this.result instanceof BlockVal;
		}

	}

	exports.SwitchPart = SwitchPart;

	class For extends Do {
		constructor(loc, opIteratee, block, isVal) {
			super(loc);
			this.opIteratee = opIteratee;
			this.block = block;
			this.isVal = isVal;
		}

	}

	exports.For = For;

	class ForBag extends Val {
		constructor(loc, opIteratee, block) {
			super(loc);
			this.opIteratee = opIteratee;
			this.block = block;
			this.built = LocalDeclare.built(loc);
		}

	}

	exports.ForBag = ForBag;

	class Iteratee extends MsAst {
		constructor(loc, element, bag) {
			super(loc);
			this.element = element;
			this.bag = bag;
		}

	}

	exports.Iteratee = Iteratee;

	class Break extends Do {}

	exports.Break = Break;

	class BreakWithVal extends Do {
		constructor(loc, value) {
			super(loc);
			this.value = value;
		}

	}

	exports.BreakWithVal = BreakWithVal;

	class BlockWrap extends Val {
		constructor(loc, block) {
			super(loc);
			this.block = block;
		}

	}

	exports.BlockWrap = BlockWrap;

	class BagSimple extends Val {
		constructor(loc, parts) {
			super(loc);
			this.parts = parts;
		}

	}

	exports.BagSimple = BagSimple;

	class ObjSimple extends Val {
		constructor(loc, pairs) {
			super(loc);
			this.pairs = pairs;
		}

	}

	exports.ObjSimple = ObjSimple;

	class ObjPair extends MsAst {
		constructor(loc, key, value) {
			super(loc);
			this.key = key;
			this.value = value;
		}

	}

	exports.ObjPair = ObjPair;

	class Logic extends Val {
		constructor(loc, kind, args) {
			super(loc);
			this.kind = kind;
			this.args = args;
		}

	}

	exports.Logic = Logic;
	const Logics = exports.Logics = {
		/** `and` keyword*/
		And: 0,
		/** `or` keyword */
		Or: 1
	};

	class Not extends Val {
		constructor(loc, arg) {
			super(loc);
			this.arg = arg;
		}

	}

	exports.Not = Not;

	class NumberLiteral extends Val {
		constructor(loc, value) {
			super(loc);
			this.value = value;
		}

		toString() {
			return this.value.toString();
		}

	}

	exports.NumberLiteral = NumberLiteral;

	class Member extends Val {
		constructor(loc, object, name) {
			super(loc);
			this.object = object;
			this.name = name;
		}

	}

	exports.Member = Member;

	class QuoteAbstract extends Val {}

	exports.QuoteAbstract = QuoteAbstract;

	class QuotePlain extends QuoteAbstract {
		constructor(loc, parts) {
			super(loc);
			this.parts = parts;
		}

	}

	exports.QuotePlain = QuotePlain;

	class QuoteTaggedTemplate extends Val {
		constructor(loc, tag, quote) {
			super(loc);
			this.tag = tag;
			this.quote = quote;
		}

	}

	exports.QuoteTaggedTemplate = QuoteTaggedTemplate;

	class QuoteSimple extends QuoteAbstract {
		constructor(loc, name) {
			super(loc);
			this.name = name;
		}

	}

	exports.QuoteSimple = QuoteSimple;

	class With extends Val {
		constructor(loc, declare, value, block) {
			super(loc);
			this.declare = declare;
			this.value = value;
			this.block = block;
		}

	}

	exports.With = With;

	class MemberFun extends Val {
		constructor(loc, opObject, name) {
			super(loc);
			this.opObject = opObject;
			this.name = name;
		}

	}

	exports.MemberFun = MemberFun;

	class GetterFun extends Val {
		constructor(loc, name) {
			super(loc);
			this.name = name;
		}

	}

	exports.GetterFun = GetterFun;

	class Range extends Val {
		constructor(loc, start, end, isExclusive) {
			super(loc);
			this.start = start;
			this.end = end;
			this.isExclusive = isExclusive;
		}

	}

	exports.Range = Range;

	class SpecialDo extends Do {
		constructor(loc, kind) {
			super(loc);
			this.kind = kind;
		}

	}

	exports.SpecialDo = SpecialDo;
	const SpecialDos = exports.SpecialDos = {
		Debugger: 0
	};

	class SpecialVal extends Val {
		constructor(loc, kind) {
			super(loc);
			this.kind = kind;
		}

	}

	exports.SpecialVal = SpecialVal;
	const SpecialVals = exports.SpecialVals = {
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

	class Ignore extends Do {
		constructor(loc, ignoredNames) {
			super(loc);
			this.ignoredNames = ignoredNames;
		}

	}

	exports.Ignore = Ignore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BTXFCLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FZWixXQUFXOzs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BT1gsRUFBRTs7U0FBRixFQUFFLEdBQUYsRUFBRTs7T0FHRixHQUFHOzs7Ozs7O1NBQUgsR0FBRyxHQUFILEdBQUc7O09BU0gsTUFBTTs7Ozs7Ozs7Ozs7OztTQUFOLE1BQU0sR0FBTixNQUFNOztPQXNCTixZQUFZOzs7Ozs7OztTQUFaLFlBQVksR0FBWixZQUFZOztPQVFaLGlCQUFpQjs7U0FBakIsaUJBQWlCLEdBQWpCLGlCQUFpQjs7T0FFakIsbUJBQW1COzs7Ozs7Ozs7U0FBbkIsbUJBQW1CLEdBQW5CLG1CQUFtQjs7T0FTbkIsUUFBUTs7Ozs7Ozs7U0FBUixRQUFRLEdBQVIsUUFBUTs7T0FTUixNQUFNOzs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09BZ0JOLFlBQVk7Ozs7Ozs7OztTQUFaLFlBQVksR0FBWixZQUFZOztPQWdCWixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUFaLFlBQVksR0FBWixZQUFZO09BMkNaLGFBQWEsV0FBYixhQUFhLEdBQUc7O0FBRTVCLE9BQUssRUFBRSxDQUFDOztBQUVSLE1BQUksRUFBRSxDQUFDOztBQUVQLFNBQU8sRUFBRSxDQUFDO0VBQ1Y7O09BR1ksV0FBVzs7Ozs7Ozs7Ozs7Ozs7OztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQWlCWCxXQUFXOzs7Ozs7Ozs7U0FBWCxXQUFXLEdBQVgsV0FBVzs7T0FZWCxNQUFNOzs7OztTQUFOLE1BQU0sR0FBTixNQUFNOztPQVNOLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQVosWUFBWSxHQUFaLFlBQVk7O09BbUJaLGlCQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBakIsaUJBQWlCLEdBQWpC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QUFDOztBQUVOLElBQUUsRUFBRSxDQUFDO0VBQ0w7O09BR1ksR0FBRzs7Ozs7Ozs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FZSCxhQUFhOzs7Ozs7Ozs7Ozs7U0FBYixhQUFhLEdBQWIsYUFBYTs7T0FvQmIsTUFBTTs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09BY04sYUFBYTs7U0FBYixhQUFhLEdBQWIsYUFBYTs7T0FNYixVQUFVOzs7Ozs7OztTQUFWLFVBQVUsR0FBVixVQUFVOztPQWNWLG1CQUFtQjs7Ozs7Ozs7O1NBQW5CLG1CQUFtQixHQUFuQixtQkFBbUI7O09BY25CLFdBQVc7Ozs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BWVgsSUFBSTs7Ozs7Ozs7OztTQUFKLElBQUksR0FBSixJQUFJOztPQWFKLFNBQVM7Ozs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTOztPQVdULFNBQVM7Ozs7Ozs7O1NBQVQsU0FBUyxHQUFULFNBQVM7O09BU1QsS0FBSzs7Ozs7Ozs7OztTQUFMLEtBQUssR0FBTCxLQUFLOztPQW9CTCxTQUFTOzs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTO09BV1QsVUFBVSxXQUFWLFVBQVUsR0FBRztBQUN6QixVQUFRLEVBQUUsQ0FBQztFQUNYOztPQU1ZLFVBQVU7Ozs7Ozs7O1NBQVYsVUFBVSxHQUFWLFVBQVU7T0FZVixXQUFXLFdBQVgsV0FBVyxHQUFHOztBQUUxQixVQUFRLEVBQUUsQ0FBQzs7QUFFWCxRQUFNLEVBQUUsQ0FBQzs7QUFFVCxPQUFLLEVBQUUsQ0FBQzs7QUFFUixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxLQUFHLEVBQUUsQ0FBQzs7QUFFTixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxXQUFTLEVBQUUsQ0FBQzs7Ozs7OztBQVNaLE1BQUksRUFBRSxDQUFDO0VBQ1A7O09BTVksTUFBTTs7Ozs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTSIsImZpbGUiOiJNc0FzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2F0LCBvcElmfSBmcm9tICcuL3V0aWwnXG5cbi8qKlxuQW55IE1hc29uIEFTVC5cbkFsbCBBU1RzIGhhdmUgYSBgbG9jYCB0aGF0IHRoZXkgcGFzcyBvbiB0byB0aGUgZXNhc3QgZHVyaW5nIHtAbGluayB0cmFuc3BpbGV9LlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0LyoqIEB0eXBlIHtMb2N9ICovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vLyBMaW5lQ29udGVudFxuXHQvKipcblx0QW55IHZhbGlkIHBhcnQgb2YgYSBCbG9jay5cblx0Tm90ZSB0aGF0IHNvbWUge0BsaW5rIFZhbH1zIHdpbGwgc3RpbGwgY2F1c2Ugd2FybmluZ3MgaWYgdGhleSBhcHBlYXIgYXMgYSBsaW5lLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y2FuQmVTdGF0ZW1lbnQoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBDYW4gb25seSBhcHBlYXIgYXMgbGluZXMgaW4gYSBCbG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIERvIGV4dGVuZHMgTGluZUNvbnRlbnQge31cblxuXHQvKiogQ2FuIGFwcGVhciBpbiBhbnkgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIFZhbCBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHQvLyBvdmVycmlkYWJsZVxuXHRcdGNhbkJlU3RhdGVtZW50KCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG5cbi8vIE1vZHVsZVxuXHQvKiogV2hvbGUgc291cmNlIGZpbGUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdE5vdCB1c2VkIGZvciBjb21waWxhdGlvbiwgYnV0IHVzZWZ1bCBmb3IgdG9vbHMuXG5cdFx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydERvPn0gKi9cblx0XHRcdHRoaXMuZG9JbXBvcnRzID0gZG9JbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydD59ICovXG5cdFx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUgez9JbXBvcnRHbG9iYWx9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0R2xvYmFsID0gb3BJbXBvcnRHbG9iYWxcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8RG8+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBleHBvcnQuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXNzaWduU2luZ2xlfSAqL1xuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblx0LyoqIENyZWF0ZWQgd2l0aCBhbiBPYmpBc3NpZ24gaW4gcm9vdC4gKi9cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZUV4cG9ydE5hbWVkIGV4dGVuZHMgTW9kdWxlRXhwb3J0IHsgfVxuXHQvKiogQ3JlYXRlZCBieSBhc3NpZ25pbmcgdG8gdGhlIG1vZHVsZSdzIG5hbWUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnREZWZhdWx0IGV4dGVuZHMgTW9kdWxlRXhwb3J0IHtcblx0XHRzdGF0aWMgZm9yVmFsKGxvYywgbmFtZSwgdmFsdWUpIHtcblx0XHRcdGNvbnN0IGFzc2lnbmVlID0gTG9jYWxEZWNsYXJlLnBsYWluKGxvYywgbmFtZSlcblx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsdWUpXG5cdFx0XHRyZXR1cm4gbmV3IE1vZHVsZUV4cG9ydERlZmF1bHQobG9jLCBhc3NpZ24pXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBpbXBvcnQgaW4gYW4gYGltcG9ydCFgIGJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0RG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHR9XG5cdH1cblxuXHQvKiogU2luZ2xlIGltcG9ydCBpbiBhbiBgaW1wb3J0YCBibG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5pbXBvcnRlZCA9IGltcG9ydGVkXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0RGVmYXVsdCA9IG9wSW1wb3J0RGVmYXVsdFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRJbXBvcnRzIGZyb20gJ2dsb2JhbCcgYXJlIGhhbmRsZWQgc3BlY2lhbGx5IGJlY2F1c2UgdGhlcmUncyBubyBtb2R1bGUgdG8gaW1wb3J0IGZyb20uXG5cdE90aGVyIHRoYW4gdGhhdCwgc2FtZSBhcyB7QGxpbmsgSW1wb3J0fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydEdsb2JhbCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0ZWQgPSBpbXBvcnRlZFxuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5vcEltcG9ydERlZmF1bHQgPSBvcEltcG9ydERlZmF1bHRcblx0XHR9XG5cdH1cblxuLy8gTG9jYWxzXG5cdC8qKlxuXHRBbGwge0BsaW5rIExvY2FsQWNjZXNzfWVzIG11c3QgaGF2ZSBzb21lIExvY2FsRGVjbGFyZSB0byBhY2Nlc3MuXG5cdEFsbCBhY2Nlc3NpYmxlIGlkZW50aWZpZXJzIGFyZSB0aGVyZWZvcmUgTG9jYWxEZWNsYXJlcy5cblx0VGhpcyBpbmNsdWRlcyBpbXBvcnRzLCBgdGhpc2AsIHRoZSBmb2N1cywgZXRjLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdC8qKiBMb2NhbERlY2xhcmUgd2l0aCBubyB0eXBlLiAqL1xuXHRcdHN0YXRpYyB1bnR5cGVkKGxvYywgbmFtZSwga2luZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBraW5kKVxuXHRcdH1cblxuXHRcdC8qKiBMb2NhbERlY2xhcmUgb2YganVzdCBhIG5hbWUuICovXG5cdFx0c3RhdGljIHBsYWluKGxvYywgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBMb2NhbERlY2xhcmVzLkNvbnN0KVxuXHRcdH1cblxuXHRcdHN0YXRpYyBidWlsdChsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ2J1aWx0Jylcblx0XHR9XG5cdFx0c3RhdGljIGZvY3VzKGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAnXycpXG5cdFx0fVxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAndGhpcycpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcFR5cGUsIGtpbmQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cblx0XHRpc0xhenkoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMb2NhbERlY2xhcmVzLkxhenlcblx0XHR9XG5cblx0XHRpc011dGFibGUoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmQgb2Yge0BsaW5rIExvY2FsRGVjbGFyZX0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBMb2NhbERlY2xhcmVzID0ge1xuXHRcdC8qKiBEZWNsYXJlZCBub3JtYWxseS4gKi9cblx0XHRDb25zdDogMCxcblx0XHQvKiogRGVjbGFyZWQgd2l0aCBgfmFgLiAqL1xuXHRcdExhenk6IDEsXG5cdFx0LyoqIERlY2xhcmVkIHdpdGggYDo6PWAuICovXG5cdFx0TXV0YWJsZTogMlxuXHR9XG5cblx0LyoqIEFjY2VzcyB0aGUgbG9jYWwgYG5hbWVgLiAqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxBY2Nlc3MgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAnXycpXG5cdFx0fVxuXG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7bmFtZX0gOj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIExvY2FsTXV0YXRlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQXNzaWduXG5cdC8qKiBBbnkgZXhwcmVzc2lvbiBjcmVhdGluZyBuZXcgbG9jYWxzLiAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduIGV4dGVuZHMgRG8ge1xuXHRcdC8qKlxuXHRcdEFsbCBsb2NhbHMgY3JlYXRlZCBieSB0aGUgYXNzaWduLlxuXHRcdEBhYnN0cmFjdFxuXHRcdCovXG5cdFx0YWxsQXNzaWduZWVzKCkge31cblx0fVxuXG5cdC8qKiBge2Fzc2lnbmVlfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduU2luZ2xlIGV4dGVuZHMgQXNzaWduIHtcblx0XHQvKiogQXNzaWduIHRvIGBfYC4gKi9cblx0XHRzdGF0aWMgZm9jdXMobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25TaW5nbGUobG9jLCBMb2NhbERlY2xhcmUuZm9jdXMobG9jKSwgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZSA9IGFzc2lnbmVlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKiBAb3ZlcnJpZGUgKi9cblx0XHRhbGxBc3NpZ25lZXMoKSB7IHJldHVybiBbdGhpcy5hc3NpZ25lZV0gfVxuXHR9XG5cblx0LyoqIGB7YXNzaWduZWVzfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduRGVzdHJ1Y3R1cmUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWVzLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZXMgPSBhc3NpZ25lZXNcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0S2luZCBvZiBsb2NhbHMgdGhpcyBhc3NpZ25zIHRvLlxuXHRcdEByZXR1cm4ge0xvY2FsRGVjbGFyZXN9XG5cdFx0Ki9cblx0XHRraW5kKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzWzBdLmtpbmRcblx0XHR9XG5cblx0XHQvKiogQG92ZXJyaWRlICovXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0IFNldHRlcnMgPSB7XG5cdFx0SW5pdDogMCxcblx0XHRNdXRhdGU6IDEsXG5cdFx0SW5pdE11dGFibGU6IDJcblx0fVxuXG5cdC8qKlxuXHRge29iamVjdH0ue25hbWV9OntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gXG5cdEFsc28gaGFuZGxlcyBge29iamVjdH0uXCJ7bmFtZX1cImAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJTZXQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIG5hbWUsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7U2V0dGVyc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7b2JqZWN0fVt7c3ViYmVkc31dOntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBTZXRTdWIgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIHN1YmJlZHMsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuc3ViYmVkcyA9IHN1YmJlZHNcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge1NldHRlcnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBFcnJvcnNcblx0LyoqIGB0aHJvdyEge29wVGhyb3dufWAgKi9cblx0ZXhwb3J0IGNsYXNzIFRocm93IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUaHJvd24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdC8qKiBgYXNzZXJ0IS9mb3JiaWQhIHtjb25kaXRpb259IHRocm93ISB7b3BUaHJvd259YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzZXJ0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmVnYXRlLCBjb25kaXRpb24sIG9wVGhyb3duKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdElmIHRydWUsIHRoaXMgaXMgYSBgZm9yYmlkIWAuXG5cdFx0XHRAdHlwZSB7Ym9vbGVhbn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5lZ2F0ZSA9IG5lZ2F0ZVxuXHRcdFx0LyoqXG5cdFx0XHRDb21waWxlZCBzcGVjaWFsbHkgaWYgYSB7QGxpbmsgQ2FsbH0uXG5cdFx0XHRAdHlwZSB7VmFsfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVGhyb3duID0gb3BUaHJvd25cblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgZXhjZXB0XG5cdFx0dHJ5XG5cdFx0XHR7dHJ5fVxuXHRcdGNhdGNoXG5cdFx0XHR7Y2F0Y2h9XG5cdFx0ZmluYWxseVxuXHRcdFx0e2ZpbmFsbHl9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHQgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBfdHJ5LCBfY2F0Y2gsIF9maW5hbGx5KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy50cnkgPSBfdHJ5XG5cdFx0XHQvKiogQHR5cGUgez9DYXRjaH0gKi9cblx0XHRcdHRoaXMuY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblxuXHRcdGdldCBpc1ZhbCgpIHtcblx0XHRcdHJldHVybiB0aGlzLnRyeSBpbnN0YW5jZW9mIEJsb2NrVmFsXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGNhdGNoIHtjYXVnaHR9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2F0Y2ggZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBjYXVnaHQsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuY2F1Z2h0ID0gY2F1Z2h0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cbi8vIEJsb2NrXG5cdC8qKlxuXHRDb2RlIGluIGFuIGluZGVudGVkIGJsb2NrLlxuXHRTZWUge0BsaW5rIEJsb2NrV3JhcH0gZm9yIHRoZSBraW5kIHRoYXQgYXBwZWFycyB3aGVyZSBhIFZhbCBpcyBleHBlY3RlZC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdH1cblx0fVxuXG5cdC8qKiBCbG9jayB0aGF0IGp1c3QgcGVyZm9ybXMgYWN0aW9ucyBhbmQgZG9lc24ndCBoYXZlIGFueSB2YWx1ZS4gKi9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrRG8gZXh0ZW5kcyBCbG9jayB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQ+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIEJsb2NrIGhhdmluZyBhIHZhbHVlLiAqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWwgZXh0ZW5kcyBCbG9jayB7IH1cblxuXHQvKipcblx0QmxvY2tWYWwgdGhhdCBhY3R1YWxseSByZXR1cm5zIGEgdmFsdWUgYXQgdGhlIGVuZC5cblx0KFRoZSBtb3N0IGNvbW1vbiBraW5kIGJ5IGZhci4pXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbFJldHVybiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMsIHJldHVybmVkKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQ+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMucmV0dXJuZWQgPSByZXR1cm5lZFxuXHRcdH1cblx0fVxuXG5cdC8qKiBUYWtlcyB0aGUgcGxhY2Ugb2YgYSBCbG9ja1ZhbCwgYnV0IGRvZXNuJ3QgYWN0dWFsbHkgcmV0dXJuIGEgdmFsdWUg4oCUIHRocm93cy4gKi9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsVGhyb3cgZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzLCBfdGhyb3cpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudD59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHRcdC8qKiBAdHlwZSB7VGhyb3d9ICovXG5cdFx0XHR0aGlzLnRocm93ID0gX3Rocm93XG5cdFx0fVxuXHR9XG5cblx0Ly8gVE9ETzogQmxvY2tCYWcsIEJsb2NrTWFwLCBCbG9ja09iaiA9PiBCbG9ja0J1aWxkKGtpbmQsIC4uLilcblx0LyoqXG5cdEJsb2NrIHJldHVybmluZyBhbiBPYmplY3QuXG5cdENvbnRhaW5zIG1hbnkge0BsaW5rIE9iakVudHJ5fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrT2JqIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQgfCBPYmpFbnRyeT59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogUGFydCBvZiBhIHtAbGluayBCbG9ja09iaiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBhLiBiYFxuXHRPYmpFbnRyeSB0aGF0IHByb2R1Y2VzIGEgbmV3IGxvY2FsLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlBc3NpZ24gZXh0ZW5kcyBPYmpFbnRyeSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXNzaWdufSAqL1xuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblxuXHQvKiogT2JqRW50cnkgdGhhdCBkb2VzIG5vdCBpbnRyb2R1Y2UgYSBuZXcgbG9jYWwuICovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeVBsYWluIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdC8qKlxuXHRcdGB7bmFtZX0uYCB3aXRoIG5vIHZhbHVlLlxuXHRcdFRha2VzIGEgbG9jYWwgb2YgdGhlIHNhbWUgbmFtZSBmcm9tIG91dHNpZGUuXG5cdFx0Ki9cblx0XHRzdGF0aWMgYWNjZXNzKGxvYywgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgbmFtZSwgbmV3IExvY2FsQWNjZXNzKGxvYywgbmFtZSkpXG5cdFx0fVxuXG5cdFx0c3RhdGljIG5hbWUobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgJ25hbWUnLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdEJhZy1idWlsZGluZyBibG9jay5cblx0Q29udGFpbnMgbWFueSB7QGxpbmsgQmFnRW50cnl9IGFuZCB7QGxpbmsgQmFnRW50cnlNYW55fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrQmFnIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQgfCBCYWdFbnRyeT59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogYC4ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAuLi4ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5TWFueSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRNYXAtYnVpbGRpbmcgYmxvY2suXG5cdENvbnRhaW5zIG1hbnkge0BsaW5rIE1hcEVudHJ5fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrTWFwIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TGluZUNvbnRlbnQgfCBNYXBFbnRyeX0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBga2V5YCAtPiBgdmFsYCAqL1xuXHRleHBvcnQgY2xhc3MgTWFwRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXksIHZhbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbCA9IHZhbFxuXHRcdH1cblx0fVxuXG4vLyBDb25kaXRpb25hbHNcblx0LyoqXG5cdGBgYGlmL3VubGVzcyB7dGVzdH1cblx0XHR7cmVzdWx0fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWwgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQsIGlzVW5sZXNzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc1VubGVzcyA9IGlzVW5sZXNzXG5cdFx0fVxuXG5cdFx0Z2V0IGlzVmFsKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzdWx0IGluc3RhbmNlb2YgQmxvY2tWYWxcblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbmQge3Rlc3R9IHtpZlRydWV9IHtpZkZhbHNlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENvbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgaWZUcnVlLCBpZkZhbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZlRydWUgPSBpZlRydWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZkZhbHNlID0gaWZGYWxzZVxuXHRcdH1cblx0fVxuXG4vLyBGdW5cblx0LyoqXG5cdGBgYHw6e29wRGVjbGFyZVJlc30ge2FyZ3N9IC4uLntvcFJlc3RBcmd9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBraW5kPUZ1bnMuUGxhaW4sIGlzVGhpc0Z1bj1mYWxzZSwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMub3BSZXN0QXJnID0gb3BSZXN0QXJnXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHQvKiogQHR5cGUge0Z1bnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmVUaGlzfSAqL1xuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXNGdW4sICgpID0+IExvY2FsRGVjbGFyZS50aGlzKHRoaXMubG9jKSlcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BSZXR1cm5UeXBlID0gb3BSZXR1cm5UeXBlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgRnVufS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IEZ1bnMgPSB7XG5cdFx0LyoqIFJlZ3VsYXIgZnVuY3Rpb24gKGB8YCkgKi9cblx0XHRQbGFpbjogMCxcblx0XHQvKiogYCR8YCAqL1xuXHRcdEFzeW5jOiAxLFxuXHRcdC8qKiBgfnxgICovXG5cdFx0R2VuZXJhdG9yOiAyXG5cdH1cblxuLy8gR2VuZXJhdG9yXG5cdC8qKlxuXHRgPH4ge29wWWllbGRlZH1gXG5cdFRoZXNlIGFyZSBhbHNvIHRoZSB2YWx1ZSBwYXJ0IG9mIGBhIDx+IGJgIGFzc2lnbm1lbnRzLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgWWllbGQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BZaWVsZGVkPW51bGwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BZaWVsZGVkID0gb3BZaWVsZGVkXG5cdFx0fVxuXG5cdFx0Y2FuQmVTdGF0ZW1lbnQoKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgPH5+IHt5aWVsZGVkVG99YFxuXHRUaGVzZSBhcmUgYWxzbyB0aGUgdmFsdWUgcGFydCBvZiBgYSA8fn4gYmAgYXNzaWdubWVudHMuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBZaWVsZFRvIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHlpZWxkZWRUbykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnlpZWxkZWRUbyA9IHlpZWxkZWRUb1xuXHRcdH1cblxuXHRcdGNhbkJlU3RhdGVtZW50KCkge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cdH1cblxuLy8gQ2xhc3Ncblx0ZXhwb3J0IGNsYXNzIEtpbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3VwZXJLaW5kcywgb3BDb21tZW50PW51bGwsIG9wRG89bnVsbCwgc3RhdGljcz1bXSwgbWV0aG9kcz1bXSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5zdXBlcktpbmRzID0gc3VwZXJLaW5kc1xuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7P0NsYXNzS2luZERvfSAqL1xuXHRcdFx0dGhpcy5vcERvID0gb3BEb1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLnN0YXRpY3MgPSBzdGF0aWNzXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMubWV0aG9kcyA9IG1ldGhvZHNcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgY2xhc3Mge29wU3VwZXJDbGFzc31cblx0XHR7b3BDb21tZW50fVxuXHRcdGRvIVxuXHRcdFx0e29wRG99XG5cdFx0c3RhdGljXG5cdFx0XHR7c3RhdGljc31cblx0XHR7b3BDb25zdHJ1Y3Rvcn1cblx0XHR7bWV0aG9kc31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENsYXNzIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihcblx0XHRcdGxvYywgb3BTdXBlckNsYXNzLCBraW5kcyxcblx0XHRcdG9wQ29tbWVudD1udWxsLCBvcERvPW51bGwsIHN0YXRpY3M9W10sIG9wQ29uc3RydWN0b3I9bnVsbCwgbWV0aG9kcz1bXSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFN1cGVyQ2xhc3MgPSBvcFN1cGVyQ2xhc3Ncblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMua2luZHMgPSBraW5kc1xuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7P0NsYXNzS2luZERvfSAqL1xuXHRcdFx0dGhpcy5vcERvID0gb3BEb1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLnN0YXRpY3MgPSBzdGF0aWNzXG5cdFx0XHQvKiogQHR5cGUgez9Db25zdHJ1Y3Rvcn0gKi9cblx0XHRcdHRoaXMub3BDb25zdHJ1Y3RvciA9IG9wQ29uc3RydWN0b3Jcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgZG8hYCBwYXJ0IG9mIHtAbGluayBDbGFzc30gb3Ige0BsaW5rIEtpbmR9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3NLaW5kRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZUZvY3VzfSAqL1xuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBMb2NhbERlY2xhcmUuZm9jdXMobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgY29uc3RydWN0ISB7ZnVufWAgKi9cblx0ZXhwb3J0IGNsYXNzIENvbnN0cnVjdG9yIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZnVuLCBtZW1iZXJBcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdFRoaXMgd2lsbCBhbHdheXMgaGF2ZSBhIHtAbGluayBCbG9ja0RvfS5cblx0XHRcdEB0eXBlIHtGdW59XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubWVtYmVyQXJncyA9IG1lbWJlckFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogQW55IHBhcnQgb2Yge0BsaW5rIENsYXNzLnN0YXRpY3N9IG9yIHtAbGluayBDbGFzcy5tZXRob2RzfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGxMaWtlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMuc3ltYm9sID0gc3ltYm9sXG5cdFx0fVxuXHR9XG5cdC8qKiBge3N5bWJvbH0ge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBmdW4pIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW59ICovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgZ2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kR2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gTG9jYWxEZWNsYXJlLnRoaXMobG9jKVxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgc2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kU2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBMb2NhbERlY2xhcmUudGhpcyhsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBzdXBlciB7YXJnc31gLlxuXHROZXZlciBhIHtAbGluayBTdXBlck1lbWJlcn0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGwgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzLCBpc1ZhbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcHJlYWQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc1ZhbCA9IGlzVmFsXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBzdXBlci57bmFtZX1gIG9yIGBzdXBlci5cIntuYW1lfVwiYC4gKi9cblx0ZXhwb3J0IGNsYXNzIFN1cGVyTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG4vLyBDYWxsc1xuXHQvKiogYHtjYWxsZWR9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdC8qKiBge3Rlc3RlZH06e3Rlc3RUeXBlfWAgKi9cblx0XHRzdGF0aWMgY29udGFpbnMobG9jLCB0ZXN0VHlwZSwgdGVzdGVkKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNwZWNpYWxWYWxzLkNvbnRhaW5zKSwgW3Rlc3RUeXBlLCB0ZXN0ZWRdKVxuXHRcdH1cblxuXHRcdC8qKiBge3N1YmJlZH1be2FyZ3N9XWAgKi9cblx0XHRzdGF0aWMgc3ViKGxvYywgc3ViYmVkLCBhcmdzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNwZWNpYWxWYWxzLlN1YiksIGNhdChzdWJiZWQsIGFyZ3MpKVxuXHRcdH1cblxuXHRcdC8qKiBgZGVsISB7c3ViYmVkfVt7YXJnc31dYCAqL1xuXHRcdHN0YXRpYyBkZWxTdWIobG9jLCBzdWJiZWQsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuRGVsU3ViKSwgY2F0KHN1YmJlZCwgYXJncykpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBjYWxsZWQsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5jYWxsZWQgPSBjYWxsZWRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsIHwgU3ByZWFkPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cblx0XHRjYW5CZVN0YXRlbWVudCgpIHtcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBuZXcge3R5cGV9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgU3ByZWFkfSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgLi4ue3NwcmVhZGVkfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFNwcmVhZCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHNwcmVhZGVkKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3ByZWFkZWQgPSBzcHJlYWRlZFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgfnt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMYXp5IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdC8qKiBgY2FzZWAgKi9cblx0ZXhwb3J0IGNsYXNzIENhc2UgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdEFzc2lnbmVlIGlzIGFsd2F5cyBhIExvY2FsRGVjbGFyZUZvY3VzLlxuXHRcdFx0QHR5cGUgez9Bc3NpZ25TaW5nbGV9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cblx0XHRnZXQgaXNWYWwoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wYXJ0c1swXS5pc1ZhbFxuXHRcdH1cblx0fVxuXHQvKiogU2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgQ2FzZX0uICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWwgfCBQYXR0ZXJufSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXG5cdFx0Z2V0IGlzVmFsKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzdWx0IGluc3RhbmNlb2YgQmxvY2tWYWxcblx0XHR9XG5cdH1cblxuXHQvKiogYDp7dHlwZX0ge2xvY2Fsc31gICovXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgbG9jYWxzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsQWNjZXNzfSAqL1xuXHRcdFx0dGhpcy5wYXR0ZXJuZWQgPSBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cbi8vIFN3aXRjaFxuXHQvKiogYHN3aXRjaGAgKi9cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaCBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3dpdGNoZWQgPSBzd2l0Y2hlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxTd2l0Y2hQYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSAgcGFydHNcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cblx0XHRnZXQgaXNWYWwoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wYXJ0c1swXS5pc1ZhbFxuXHRcdH1cblx0fVxuXHQvKipcblx0U2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgU3dpdGNofS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcywgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXG5cdFx0Z2V0IGlzVmFsKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucmVzdWx0IGluc3RhbmNlb2YgQmxvY2tWYWxcblx0XHR9XG5cdH1cblxuLy8gRm9yXG5cdC8qKiBgZm9yYCAqL1xuXHRleHBvcnQgY2xhc3MgRm9yIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2ssIGlzVmFsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc1ZhbCA9IGlzVmFsXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBAZm9yYFxuXHRDb250YWlucyBtYW55IHtAbGluayBCYWdFbnRyeX0gYW5kIHtAbGluayBCYWdFbnRyeU1hbnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQmFnIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB4IGluIHlgIG9yIGp1c3QgYHlgICh3aGVyZSB0aGUgbG9jYWwgaXMgaW1wbGljaXRseSBgX2ApLiAqL1xuXHRleHBvcnQgY2xhc3MgSXRlcmF0ZWUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBlbGVtZW50LCBiYWcpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmJhZyA9IGJhZ1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgYnJlYWtgICovXG5cdGV4cG9ydCBjbGFzcyBCcmVhayBleHRlbmRzIERvIHsgfVxuXG5cdC8qKiBgYnJlYWsge3ZhbH1gICovXG5cdGV4cG9ydCBjbGFzcyBCcmVha1dpdGhWYWwgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gTWlzY2VsbGFuZW91cyBWYWxzXG5cdC8qKlxuXHRBIGJsb2NrIGFwcGVhcmluZyBvbiBpdHMgb3duIChub3QgYXMgdGhlIGJsb2NrIHRvIGFuIGBpZmAgb3IgdGhlIGxpa2UpXG5cdGlzIHB1dCBpbnRvIG9uZSBvZiB0aGVzZS5cblx0ZS5nLjpcblxuXHRcdHggPVxuXHRcdFx0eSA9IDFcblx0XHRcdHlcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrV3JhcCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKiBPbmUtbGluZSBAIGV4cHJlc3Npb24sIHN1Y2ggYXMgYFsgMSAyIDMgXWAuICovXG5cdGV4cG9ydCBjbGFzcyBCYWdTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdC8qKiBPbmUtbGluZSBvYmplY3QgZXhwcmVzc2lvbiwgc3VjaCBhcyBgKGEuIDEgYi4gMilgLiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhaXJzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE9ialBhaXI+fSAqL1xuXHRcdFx0dGhpcy5wYWlycyA9IHBhaXJzXG5cdFx0fVxuXHR9XG5cdC8qKiBQYXJ0IG9mIGFuIHtAbGluayBPYmpTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqUGFpciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBhbmRgIG9yIGBvcmAgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIExvZ2ljIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9naWNzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIExvZ2ljfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IExvZ2ljcyA9IHtcblx0XHQvKiogYGFuZGAga2V5d29yZCovXG5cdFx0QW5kOiAwLFxuXHRcdC8qKiBgb3JgIGtleXdvcmQgKi9cblx0XHRPcjogMVxuXHR9XG5cblx0LyoqIGBub3RgIGtleXdvcmQgKi9cblx0ZXhwb3J0IGNsYXNzIE5vdCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmcpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5hcmcgPSBhcmdcblx0XHR9XG5cdH1cblxuXHQvKipcblx0TGl0ZXJhbCBudW1iZXIgdmFsdWUuXG5cdFRoaXMgaXMgYm90aCBhIFRva2VuIGFuZCBNc0FzdC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE51bWJlckxpdGVyYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0U3RvcmUgYXMgYSBzdHJpbmcgc28gd2UgY2FuIGRpc3Rpbmd1aXNoIGAweGZgIGFuZCBgMTVgLlxuXHRcdFx0QHR5cGUge3N0cmluZ31cblx0XHRcdCovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKipcblx0XHRAb3ZlcnJpZGVcblx0XHRTaW5jZSB0aGlzIGlzIHVzZWQgYXMgYSBUb2tlbiwgaXQgbXVzdCBpbXBsZW1lbnQgdG9TdHJpbmcuXG5cdFx0Ki9cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiB0aGlzLnZhbHVlLnRvU3RyaW5nKClcblx0XHR9XG5cdH1cblxuXHQvKiogYHtvYmplY3R9LntuYW1lfWAgb3IgYHtvYmplY3R9Llwie25hbWV9XCJgLiAqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCwgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0LyoqXG5cdFx0XHRJZiBhIHN0cmluZywgY291bGQgc3RpbGwgYmUgYW55IHN0cmluZywgc28gbWF5IHN0aWxsIGNvbXBpbGUgdG8gYGFbJ3N0cmluZyddYC5cblx0XHRcdEB0eXBlIHtzdHJpbmcgfCBWYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiB7QGxpbmsgUXVvdGV9IG9yIHtAbGluayBRdW90ZVNpbXBsZX0uICovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZUFic3RyYWN0IGV4dGVuZHMgVmFsIHt9XG5cblx0LyoqXG5cdFF1b3RlZCB0ZXh0LiBBbHdheXMgY29tcGlsZXMgdG8gYSB0ZW1wbGF0ZSBzdHJpbmcuXG5cdEZvciB0YWdnZWQgdGVtcGxhdGVzLCB1c2Uge0BsaW5rIFF1b3RlVGFnZ2VkVGVtcGxhdGV9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVQbGFpbiBleHRlbmRzIFF1b3RlQWJzdHJhY3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0YHBhcnRzYCBhcmUgU3RyaW5ncyBpbnRlcmxlYXZlZCB3aXRoIFZhbHMuXG5cdFx0XHRwYXJ0IFN0cmluZ3MgYXJlIHJhdyB2YWx1ZXMsIG1lYW5pbmcgXCJcXG5cIiBpcyB0d28gY2hhcmFjdGVycy5cblx0XHRcdFNpbmNlIFwiXFx7XCIgaXMgc3BlY2lhbCB0byBNYXNvbiwgdGhhdCdzIG9ubHkgb25lIGNoYXJhY3Rlci5cblx0XHRcdEB0eXBlIHtBcnJheTxzdHJpbmcgfCBWYWw+fVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdC8qKiBge3RhZ31cIntxdW90ZX1cImAgKi9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlVGFnZ2VkVGVtcGxhdGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGFnLCBxdW90ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRhZyA9IHRhZ1xuXHRcdFx0LyoqIEB0eXBlIHtRdW90ZX0gKi9cblx0XHRcdHRoaXMucXVvdGUgPSBxdW90ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgJ3tuYW1lfWAuXG5cdFF1b3RlIGNvbnNpc3Rpbmcgb2YgYSBzaW5nbGUgbmFtZS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlU2ltcGxlIGV4dGVuZHMgUXVvdGVBYnN0cmFjdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgd2l0aCB7dmFsdWV9IFthcyB7ZGVjbGFyZX1dXG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgV2l0aCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBkZWNsYXJlLCB2YWx1ZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5kZWNsYXJlID0gZGVjbGFyZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgJntuYW1lfWAgb3IgYC4me25hbWV9YCBvciBge29iamVjdH0uJntuYW1lfWAgKi9cblx0ZXhwb3J0IGNsYXNzIE1lbWJlckZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcE9iamVjdCwgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcE9iamVjdCA9IG9wT2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKiogYCYue25hbWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgR2V0dGVyRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge3N0YXJ0fS4ue2VuZH1gIG9yIGB7c3RhcnR9Li4ue2VuZH1gLiAqL1xuXHRleHBvcnQgY2xhc3MgUmFuZ2UgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3RhcnQsIGVuZCwgaXNFeGNsdXNpdmUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zdGFydCA9IHN0YXJ0XG5cdFx0XHQvKipcblx0XHRcdElmIG51bGwsIHRoaXMgaXMgYW4gaW5maW5pdGUgUmFuZ2UuXG5cdFx0XHRAdHlwZSB7P1ZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmVuZCA9IGVuZFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc0V4Y2x1c2l2ZSA9IGlzRXhjbHVzaXZlXG5cdFx0fVxuXHR9XG5cbi8vIFNwZWNpYWxcblx0LyoqXG5cdEEgc3BlY2lhbCBhY3Rpb24uXG5cdEFsbCBTcGVjaWFsRG9zIGFyZSBhdG9taWMgYW5kIGRvIG5vdCByZWx5IG9uIGNvbnRleHQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxEb3N9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbERvfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IFNwZWNpYWxEb3MgPSB7XG5cdFx0RGVidWdnZXI6IDBcblx0fVxuXG5cdC8qKlxuXHRBIHNwZWNpYWwgZXhwcmVzc2lvbi5cblx0QWxsIFNwZWNpYWxWYWxzIGFyZSBhdG9taWMgYW5kIGRvIG5vdCByZWx5IG9uIGNvbnRleHQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7U3BlY2lhbFZhbHN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBTcGVjaWFsVmFsfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IFNwZWNpYWxWYWxzID0ge1xuXHRcdC8qKiBgX21zLmNvbnRhaW5zYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5jb250YWluc30gKi9cblx0XHRDb250YWluczogMCxcblx0XHQvKiogYF9tcy5kZWxTdWJgIHVzZWQgZm9yIHtAbGluayBDYWxsLmRlbFN1Yn0gKi9cblx0XHREZWxTdWI6IDEsXG5cdFx0LyoqIGBmYWxzZWAgbGl0ZXJhbCAqL1xuXHRcdEZhbHNlOiAyLFxuXHRcdC8qKiBgbnVsbGAgbGl0ZXJhbCAqL1xuXHRcdE51bGw6IDMsXG5cdFx0LyoqIGBfbXMuc3ViYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5zdWJ9ICovXG5cdFx0U3ViOiA0LFxuXHRcdC8qKiBgdHJ1ZWAgbGl0ZXJhbCAqL1xuXHRcdFRydWU6IDUsXG5cdFx0LyoqIGB2b2lkIDBgICovXG5cdFx0VW5kZWZpbmVkOiA2LFxuXHRcdC8qKlxuXHRcdGBuYW1lYCB2YWx1ZSBpcyB0aGUgbmFtZSBvZiB0aGUgbmVhcmVzdCBhc3NpZ25lZCB2YWx1ZS4gSW46XG5cblx0XHRcdHggPSBuZXcgTWV0aG9kXG5cdFx0XHRcdG5hbWUuXG5cblx0XHRgbmFtZWAgd2lsbCBiZSBcInhcIi5cblx0XHQqL1xuXHRcdE5hbWU6IDdcblx0fVxuXG5cdC8qKlxuXHRgaWdub3JlYCBzdGF0ZW1lbnQuXG5cdEtlZXBzIHRoZSBjb21waWxlciBmcm9tIGNvbXBsYWluaW5nIGFib3V0IGFuIHVudXNlZCBsb2NhbC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIElnbm9yZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGlnbm9yZWROYW1lcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxzdHJpbmc+fSAqL1xuXHRcdFx0dGhpcy5pZ25vcmVkTmFtZXMgPSBpZ25vcmVkTmFtZXNcblx0XHR9XG5cdH1cbiJdfQ==
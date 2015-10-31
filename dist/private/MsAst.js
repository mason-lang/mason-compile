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
	exports.Ignore = exports.SpecialVals = exports.SpecialVal = exports.SpecialDos = exports.SpecialDo = exports.Range = exports.GetterFun = exports.MemberFun = exports.With = exports.QuoteSimple = exports.QuoteTaggedTemplate = exports.QuotePlain = exports.QuoteAbstract = exports.Member = exports.NumberLiteral = exports.Not = exports.Logics = exports.Logic = exports.ObjPair = exports.ObjSimple = exports.BagSimple = exports.BlockWrap = exports.BreakWithVal = exports.Break = exports.Iteratee = exports.ForBag = exports.ForVal = exports.ForDo = exports.SwitchValPart = exports.SwitchVal = exports.SwitchDoPart = exports.SwitchDo = exports.Pattern = exports.CaseValPart = exports.CaseVal = exports.CaseDoPart = exports.CaseDo = exports.Lazy = exports.Spread = exports.New = exports.Call = exports.SuperMember = exports.SuperCallDo = exports.SuperCall = exports.ClassDo = exports.MethodSetter = exports.MethodGetter = exports.MethodImpl = exports.MethodImplLike = exports.Constructor = exports.Class = exports.YieldTo = exports.Yield = exports.Funs = exports.Fun = exports.Cond = exports.ConditionalVal = exports.ConditionalDo = exports.MapEntry = exports.BlockMap = exports.BagEntryMany = exports.BagEntry = exports.BlockBag = exports.ObjEntryPlain = exports.ObjEntryAssign = exports.ObjEntry = exports.BlockObj = exports.BlockValThrow = exports.BlockValReturn = exports.BlockVal = exports.BlockDo = exports.Block = exports.Catch = exports.ExceptVal = exports.ExceptDo = exports.Assert = exports.Throw = exports.SetSub = exports.MemberSet = exports.Setters = exports.AssignDestructure = exports.AssignSingle = exports.Assign = exports.LocalMutate = exports.LocalAccess = exports.LocalDeclares = exports.LocalDeclare = exports.ImportGlobal = exports.Import = exports.ImportDo = exports.ModuleExportDefault = exports.ModuleExportNamed = exports.ModuleExport = exports.Module = exports.Val = exports.Do = exports.LineContent = undefined;

	class MsAst {
		constructor(loc) {
			this.loc = loc;
		}

	}

	exports.default = MsAst;

	class LineContent extends MsAst {}

	exports.LineContent = LineContent;

	class Do extends LineContent {}

	exports.Do = Do;

	class Val extends LineContent {}

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

	class ModuleExportDefault extends ModuleExport {}

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

	class ExceptDo extends Do {
		constructor(loc, _try, _catch, _finally) {
			super(loc);
			this.try = _try;
			this.catch = _catch;
			this.finally = _finally;
		}

	}

	exports.ExceptDo = ExceptDo;

	class ExceptVal extends Val {
		constructor(loc, _try, _catch, _finally) {
			super(loc);
			this.try = _try;
			this.catch = _catch;
			this.finally = _finally;
		}

	}

	exports.ExceptVal = ExceptVal;

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

	class ConditionalDo extends Do {
		constructor(loc, test, result, isUnless) {
			super(loc);
			this.test = test;
			this.result = result;
			this.isUnless = isUnless;
		}

	}

	exports.ConditionalDo = ConditionalDo;

	class ConditionalVal extends Val {
		constructor(loc, test, result, isUnless) {
			super(loc);
			this.test = test;
			this.result = result;
			this.isUnless = isUnless;
		}

	}

	exports.ConditionalVal = ConditionalVal;

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

	}

	exports.Yield = Yield;

	class YieldTo extends Val {
		constructor(loc, yieldedTo) {
			super(loc);
			this.yieldedTo = yieldedTo;
		}

	}

	exports.YieldTo = YieldTo;

	class Class extends Val {
		constructor(loc, opSuperClass, opComment, opDo, statics, opConstructor, methods) {
			super(loc);
			this.opSuperClass = opSuperClass;
			this.opComment = opComment;
			this.opDo = opDo;
			this.statics = statics;
			this.opConstructor = opConstructor;
			this.methods = methods;
		}

	}

	exports.Class = Class;

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

	class ClassDo extends MsAst {
		constructor(loc, block) {
			super(loc);
			this.block = block;
			this.declareFocus = LocalDeclare.focus(loc);
		}

	}

	exports.ClassDo = ClassDo;

	class SuperCall extends Val {
		constructor(loc, args) {
			super(loc);
			this.args = args;
		}

	}

	exports.SuperCall = SuperCall;

	class SuperCallDo extends Do {
		constructor(loc, args) {
			super(loc);
			this.args = args;
		}

	}

	exports.SuperCallDo = SuperCallDo;

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

	class CaseDo extends Do {
		constructor(loc, opCased, parts, opElse) {
			super(loc);
			this.opCased = opCased;
			this.parts = parts;
			this.opElse = opElse;
		}

	}

	exports.CaseDo = CaseDo;

	class CaseDoPart extends MsAst {
		constructor(loc, test, result) {
			super(loc);
			this.test = test;
			this.result = result;
		}

	}

	exports.CaseDoPart = CaseDoPart;

	class CaseVal extends Val {
		constructor(loc, opCased, parts, opElse) {
			super(loc);
			this.opCased = opCased;
			this.parts = parts;
			this.opElse = opElse;
		}

	}

	exports.CaseVal = CaseVal;

	class CaseValPart extends MsAst {
		constructor(loc, test, result) {
			super(loc);
			this.test = test;
			this.result = result;
		}

	}

	exports.CaseValPart = CaseValPart;

	class Pattern extends MsAst {
		constructor(loc, type, locals) {
			super(loc);
			this.type = type;
			this.locals = locals;
			this.patterned = LocalAccess.focus(loc);
		}

	}

	exports.Pattern = Pattern;

	class SwitchDo extends Do {
		constructor(loc, switched, parts, opElse) {
			super(loc);
			this.switched = switched;
			this.parts = parts;
			this.opElse = opElse;
		}

	}

	exports.SwitchDo = SwitchDo;

	class SwitchDoPart extends MsAst {
		constructor(loc, values, result) {
			super(loc);
			this.values = values;
			this.result = result;
		}

	}

	exports.SwitchDoPart = SwitchDoPart;

	class SwitchVal extends Val {
		constructor(loc, switched, parts, opElse) {
			super(loc);
			this.switched = switched;
			this.parts = parts;
			this.opElse = opElse;
		}

	}

	exports.SwitchVal = SwitchVal;

	class SwitchValPart extends MsAst {
		constructor(loc, values, result) {
			super(loc);
			this.values = values;
			this.result = result;
		}

	}

	exports.SwitchValPart = SwitchValPart;

	class ForDo extends Do {
		constructor(loc, opIteratee, block) {
			super(loc);
			this.opIteratee = opIteratee;
			this.block = block;
		}

	}

	exports.ForDo = ForDo;

	class ForVal extends Val {
		constructor(loc, opIteratee, block) {
			super(loc);
			this.opIteratee = opIteratee;
			this.block = block;
		}

	}

	exports.ForVal = ForVal;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BTXFCLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FZWixXQUFXOztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQUdYLEVBQUU7O1NBQUYsRUFBRSxHQUFGLEVBQUU7O09BR0YsR0FBRzs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FJSCxNQUFNOzs7Ozs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Bc0JOLFlBQVk7Ozs7Ozs7O1NBQVosWUFBWSxHQUFaLFlBQVk7O09BUVosaUJBQWlCOztTQUFqQixpQkFBaUIsR0FBakIsaUJBQWlCOztPQUVqQixtQkFBbUI7O1NBQW5CLG1CQUFtQixHQUFuQixtQkFBbUI7O09BR25CLFFBQVE7Ozs7Ozs7O1NBQVIsUUFBUSxHQUFSLFFBQVE7O09BU1IsTUFBTTs7Ozs7Ozs7OztTQUFOLE1BQU0sR0FBTixNQUFNOztPQWdCTixZQUFZOzs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTs7T0FnQlosWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTtPQTJDWixhQUFhLFdBQWIsYUFBYSxHQUFHOztBQUU1QixPQUFLLEVBQUUsQ0FBQzs7QUFFUixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxTQUFPLEVBQUUsQ0FBQztFQUNWOztPQUdZLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWCxXQUFXLEdBQVgsV0FBVzs7T0FpQlgsV0FBVzs7Ozs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BWVgsTUFBTTs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTTs7T0FTTixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7OztTQUFaLFlBQVksR0FBWixZQUFZOztPQW1CWixpQkFBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQWpCLGlCQUFpQixHQUFqQixpQkFBaUI7T0F1QmpCLE9B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Y2F0LCBvcElmfSBmcm9tICcuL3V0aWwnXG5cbi8qKlxuQW55IE1hc29uIEFTVC5cbkFsbCBBU1RzIGhhdmUgYSBgbG9jYCB0aGF0IHRoZXkgcGFzcyBvbiB0byB0aGUgZXNhc3QgZHVyaW5nIHtAbGluayB0cmFuc3BpbGV9LlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0LyoqIEB0eXBlIHtMb2N9ICovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vLyBMaW5lQ29udGVudFxuXHQvKipcblx0QW55IHZhbGlkIHBhcnQgb2YgYSBCbG9jay5cblx0Tm90ZSB0aGF0IHNvbWUge0BsaW5rIFZhbH1zIHdpbGwgc3RpbGwgY2F1c2Ugd2FybmluZ3MgaWYgdGhleSBhcHBlYXIgYXMgYSBsaW5lLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7IH1cblxuXHQvKiogQ2FuIG9ubHkgYXBwZWFyIGFzIGxpbmVzIGluIGEgQmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBEbyBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG5cdC8qKiBDYW4gYXBwZWFyIGluIGFueSBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgVmFsIGV4dGVuZHMgTGluZUNvbnRlbnQgeyB9XG5cbi8vIE1vZHVsZVxuXHQvKiogV2hvbGUgc291cmNlIGZpbGUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgb3BJbXBvcnRHbG9iYWwsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdE5vdCB1c2VkIGZvciBjb21waWxhdGlvbiwgYnV0IHVzZWZ1bCBmb3IgdG9vbHMuXG5cdFx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydERvPn0gKi9cblx0XHRcdHRoaXMuZG9JbXBvcnRzID0gZG9JbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydD59ICovXG5cdFx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUgez9JbXBvcnRHbG9iYWx9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0R2xvYmFsID0gb3BJbXBvcnRHbG9iYWxcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8RG8+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBleHBvcnQuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXNzaWduU2luZ2xlfSAqL1xuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblx0LyoqIENyZWF0ZWQgd2l0aCBhbiBPYmpBc3NpZ24gaW4gcm9vdC4gKi9cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZUV4cG9ydE5hbWVkIGV4dGVuZHMgTW9kdWxlRXhwb3J0IHsgfVxuXHQvKiogQ3JlYXRlZCBieSBhc3NpZ25pbmcgdG8gdGhlIG1vZHVsZSdzIG5hbWUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnREZWZhdWx0IGV4dGVuZHMgTW9kdWxlRXhwb3J0IHsgfVxuXG5cdC8qKiBTaW5nbGUgaW1wb3J0IGluIGFuIGBpbXBvcnQhYCBibG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydERvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGF0aCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBpbXBvcnQgaW4gYW4gYGltcG9ydGAgYmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0ZWQgPSBpbXBvcnRlZFxuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5vcEltcG9ydERlZmF1bHQgPSBvcEltcG9ydERlZmF1bHRcblx0XHR9XG5cdH1cblxuXHQvKipcblx0SW1wb3J0cyBmcm9tICdnbG9iYWwnIGFyZSBoYW5kbGVkIHNwZWNpYWxseSBiZWNhdXNlIHRoZXJlJ3Mgbm8gbW9kdWxlIHRvIGltcG9ydCBmcm9tLlxuXHRPdGhlciB0aGFuIHRoYXQsIHNhbWUgYXMge0BsaW5rIEltcG9ydH0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnRHbG9iYWwgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmltcG9ydGVkID0gaW1wb3J0ZWRcblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMub3BJbXBvcnREZWZhdWx0ID0gb3BJbXBvcnREZWZhdWx0XG5cdFx0fVxuXHR9XG5cbi8vIExvY2Fsc1xuXHQvKipcblx0QWxsIHtAbGluayBMb2NhbEFjY2Vzc31lcyBtdXN0IGhhdmUgc29tZSBMb2NhbERlY2xhcmUgdG8gYWNjZXNzLlxuXHRBbGwgYWNjZXNzaWJsZSBpZGVudGlmaWVycyBhcmUgdGhlcmVmb3JlIExvY2FsRGVjbGFyZXMuXG5cdFRoaXMgaW5jbHVkZXMgaW1wb3J0cywgYHRoaXNgLCB0aGUgZm9jdXMsIGV0Yy5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZSBleHRlbmRzIE1zQXN0IHtcblx0XHQvKiogTG9jYWxEZWNsYXJlIHdpdGggbm8gdHlwZS4gKi9cblx0XHRzdGF0aWMgdW50eXBlZChsb2MsIG5hbWUsIGtpbmQpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwga2luZClcblx0XHR9XG5cblx0XHQvKiogTG9jYWxEZWNsYXJlIG9mIGp1c3QgYSBuYW1lLiAqL1xuXHRcdHN0YXRpYyBwbGFpbihsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwgTG9jYWxEZWNsYXJlcy5Db25zdClcblx0XHR9XG5cblx0XHRzdGF0aWMgYnVpbHQobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICdidWlsdCcpXG5cdFx0fVxuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ18nKVxuXHRcdH1cblx0XHRzdGF0aWMgdGhpcyhsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgb3BUeXBlLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZXN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXG5cdFx0aXNMYXp5KCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5XG5cdFx0fVxuXG5cdFx0aXNNdXRhYmxlKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kIG9mIHtAbGluayBMb2NhbERlY2xhcmV9LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgTG9jYWxEZWNsYXJlcyA9IHtcblx0XHQvKiogRGVjbGFyZWQgbm9ybWFsbHkuICovXG5cdFx0Q29uc3Q6IDAsXG5cdFx0LyoqIERlY2xhcmVkIHdpdGggYH5hYC4gKi9cblx0XHRMYXp5OiAxLFxuXHRcdC8qKiBEZWNsYXJlZCB3aXRoIGA6Oj1gLiAqL1xuXHRcdE11dGFibGU6IDJcblx0fVxuXG5cdC8qKiBBY2Nlc3MgdGhlIGxvY2FsIGBuYW1lYC4gKi9cblx0ZXhwb3J0IGNsYXNzIExvY2FsQWNjZXNzIGV4dGVuZHMgVmFsIHtcblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ18nKVxuXHRcdH1cblxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge25hbWV9IDo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbE11dGF0ZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIEFzc2lnblxuXHQvKiogQW55IGV4cHJlc3Npb24gY3JlYXRpbmcgbmV3IGxvY2Fscy4gKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbiBleHRlbmRzIERvIHtcblx0XHQvKipcblx0XHRBbGwgbG9jYWxzIGNyZWF0ZWQgYnkgdGhlIGFzc2lnbi5cblx0XHRAYWJzdHJhY3Rcblx0XHQqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHt9XG5cdH1cblxuXHQvKiogYHthc3NpZ25lZX0gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnblNpbmdsZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0LyoqIEFzc2lnbiB0byBgX2AuICovXG5cdFx0c3RhdGljIGZvY3VzKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgQXNzaWduU2luZ2xlKGxvYywgTG9jYWxEZWNsYXJlLmZvY3VzKGxvYyksIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuYXNzaWduZWUgPSBhc3NpZ25lZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKiogQG92ZXJyaWRlICovXG5cdFx0YWxsQXNzaWduZWVzKCkgeyByZXR1cm4gW3RoaXMuYXNzaWduZWVdIH1cblx0fVxuXG5cdC8qKiBge2Fzc2lnbmVlc30gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbkRlc3RydWN0dXJlIGV4dGVuZHMgQXNzaWduIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlcywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuYXNzaWduZWVzID0gYXNzaWduZWVzXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdEtpbmQgb2YgbG9jYWxzIHRoaXMgYXNzaWducyB0by5cblx0XHRAcmV0dXJuIHtMb2NhbERlY2xhcmVzfVxuXHRcdCovXG5cdFx0a2luZCgpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1swXS5raW5kXG5cdFx0fVxuXG5cdFx0LyoqIEBvdmVycmlkZSAqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdCBTZXR0ZXJzID0ge1xuXHRcdEluaXQ6IDAsXG5cdFx0TXV0YXRlOiAxLFxuXHRcdEluaXRNdXRhYmxlOiAyXG5cdH1cblxuXHQvKipcblx0YHtvYmplY3R9LntuYW1lfTp7b3BUeXBlfSA9Lzo9Lzo6PSB7dmFsdWV9YFxuXHRBbHNvIGhhbmRsZXMgYHtvYmplY3R9Llwie25hbWV9XCJgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyU2V0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBuYW1lLCBvcFR5cGUsIGtpbmQsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge1NldHRlcnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge29iamVjdH1be3N1YmJlZHN9XTp7b3BUeXBlfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgU2V0U3ViIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBzdWJiZWRzLCBvcFR5cGUsIGtpbmQsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnN1YmJlZHMgPSBzdWJiZWRzXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtTZXR0ZXJzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gRXJyb3JzXG5cdC8qKiBgdGhyb3chIHtvcFRocm93bn1gICovXG5cdGV4cG9ydCBjbGFzcyBUaHJvdyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVGhyb3duKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVGhyb3duID0gb3BUaHJvd25cblx0XHR9XG5cdH1cblxuXHQvKiogYGFzc2VydCEvZm9yYmlkISB7Y29uZGl0aW9ufSB0aHJvdyEge29wVGhyb3dufWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2VydCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5lZ2F0ZSwgY29uZGl0aW9uLCBvcFRocm93bikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRJZiB0cnVlLCB0aGlzIGlzIGEgYGZvcmJpZCFgLlxuXHRcdFx0QHR5cGUge2Jvb2xlYW59XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uZWdhdGUgPSBuZWdhdGVcblx0XHRcdC8qKlxuXHRcdFx0Q29tcGlsZWQgc3BlY2lhbGx5IGlmIGEge0BsaW5rIENhbGx9LlxuXHRcdFx0QHR5cGUge1ZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvblxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFRocm93biA9IG9wVGhyb3duXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGV4Y2VwdCFcblx0XHR0cnkhXG5cdFx0XHR7dHJ5fVxuXHRcdGNhdGNoIVxuXHRcdFx0e2NhdGNofVxuXHRcdGZpbmFsbHkhXG5cdFx0XHR7ZmluYWxseX1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEV4Y2VwdERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy50cnkgPSBfdHJ5XG5cdFx0XHQvKiogQHR5cGUgez9DYXRjaH0gKi9cblx0XHRcdHRoaXMuY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBleGNlcHRcblx0XHR0cnlcblx0XHRcdHt0cnl9XG5cdFx0Y2F0Y2hcblx0XHRcdHtjYXRjaH1cblx0XHRmaW5hbGx5IVxuXHRcdFx0e2ZpbmFsbHl9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHRWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgX3RyeSwgX2NhdGNoLCBfZmluYWxseSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMudHJ5ID0gX3RyeVxuXHRcdFx0LyoqIEB0eXBlIHs/Q2F0Y2h9ICovXG5cdFx0XHR0aGlzLmNhdGNoID0gX2NhdGNoXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBjYXRjaCB7Y2F1Z2h0fVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENhdGNoIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2F1Z2h0LCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmNhdWdodCA9IGNhdWdodFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG4vLyBCbG9ja1xuXHQvKipcblx0Q29kZSBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0U2VlIHtAbGluayBCbG9ja1dyYXB9IGZvciB0aGUga2luZCB0aGF0IGFwcGVhcnMgd2hlcmUgYSBWYWwgaXMgZXhwZWN0ZWQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9jayBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHR9XG5cdH1cblxuXHQvKiogQmxvY2sgdGhhdCBqdXN0IHBlcmZvcm1zIGFjdGlvbnMgYW5kIGRvZXNuJ3QgaGF2ZSBhbnkgdmFsdWUuICovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0RvIGV4dGVuZHMgQmxvY2sge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBCbG9jayBoYXZpbmcgYSB2YWx1ZS4gKi9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsIGV4dGVuZHMgQmxvY2sgeyB9XG5cblx0LyoqXG5cdEJsb2NrVmFsIHRoYXQgYWN0dWFsbHkgcmV0dXJucyBhIHZhbHVlIGF0IHRoZSBlbmQuXG5cdChUaGUgbW9zdCBjb21tb24ga2luZCBieSBmYXIuKVxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWxSZXR1cm4gZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzLCByZXR1cm5lZCkge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnJldHVybmVkID0gcmV0dXJuZWRcblx0XHR9XG5cdH1cblxuXHQvKiogVGFrZXMgdGhlIHBsYWNlIG9mIGEgQmxvY2tWYWwsIGJ1dCBkb2Vzbid0IGFjdHVhbGx5IHJldHVybiBhIHZhbHVlIOKAlCB0aHJvd3MuICovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbFRocm93IGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcywgX3Rocm93KSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQ+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHQvKiogQHR5cGUge1Rocm93fSAqL1xuXHRcdFx0dGhpcy50aHJvdyA9IF90aHJvd1xuXHRcdH1cblx0fVxuXG5cdC8vIFRPRE86IEJsb2NrQmFnLCBCbG9ja01hcCwgQmxvY2tPYmogPT4gQmxvY2tCdWlsZChraW5kLCAuLi4pXG5cdC8qKlxuXHRCbG9jayByZXR1cm5pbmcgYW4gT2JqZWN0LlxuXHRDb250YWlucyBtYW55IHtAbGluayBPYmpFbnRyeX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja09iaiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50IHwgT2JqRW50cnk+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFBhcnQgb2YgYSB7QGxpbmsgQmxvY2tPYmogKi9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYS4gYmBcblx0T2JqRW50cnkgdGhhdCBwcm9kdWNlcyBhIG5ldyBsb2NhbC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5QXNzaWduIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Fzc2lnbn0gKi9cblx0XHRcdHRoaXMuYXNzaWduID0gYXNzaWduXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9iakVudHJ5IHRoYXQgZG9lcyBub3QgaW50cm9kdWNlIGEgbmV3IGxvY2FsLiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlQbGFpbiBleHRlbmRzIE9iakVudHJ5IHtcblx0XHQvKipcblx0XHRge25hbWV9LmAgd2l0aCBubyB2YWx1ZS5cblx0XHRUYWtlcyBhIGxvY2FsIG9mIHRoZSBzYW1lIG5hbWUgZnJvbSBvdXRzaWRlLlxuXHRcdCovXG5cdFx0c3RhdGljIGFjY2Vzcyhsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIG5hbWUsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIG5hbWUpKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBuYW1lKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsICduYW1lJywgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRCYWctYnVpbGRpbmcgYmxvY2suXG5cdENvbnRhaW5zIG1hbnkge0BsaW5rIEJhZ0VudHJ5fSBhbmQge0BsaW5rIEJhZ0VudHJ5TWFueX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0JhZyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50IHwgQmFnRW50cnk+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAuIHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgLi4uIHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeU1hbnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0TWFwLWJ1aWxkaW5nIGJsb2NrLlxuXHRDb250YWlucyBtYW55IHtAbGluayBNYXBFbnRyeX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja01hcCBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xpbmVDb250ZW50IHwgTWFwRW50cnl9ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogYGtleWAgLT4gYHZhbGAgKi9cblx0ZXhwb3J0IGNsYXNzIE1hcEVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5LCB2YWwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWwgPSB2YWxcblx0XHR9XG5cdH1cblxuLy8gQ29uZGl0aW9uYWxzXG5cdC8qKlxuXHRgYGBpZiEvdW5sZXNzISB7dGVzdH1cblx0XHR7cmVzdWx0fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCwgaXNVbmxlc3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBpZi91bmxlc3Mge3Rlc3R9XG5cdFx0e3Jlc3VsdH1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCwgaXNVbmxlc3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbmQge3Rlc3R9IHtpZlRydWV9IHtpZkZhbHNlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENvbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgaWZUcnVlLCBpZkZhbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZlRydWUgPSBpZlRydWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZkZhbHNlID0gaWZGYWxzZVxuXHRcdH1cblx0fVxuXG4vLyBGdW5cblx0LyoqXG5cdGBgYHw6e29wRGVjbGFyZVJlc30ge2FyZ3N9IC4uLntvcFJlc3RBcmd9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBraW5kPUZ1bnMuUGxhaW4sIGlzVGhpc0Z1bj1mYWxzZSwgb3BSZXR1cm5UeXBlPW51bGwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMub3BSZXN0QXJnID0gb3BSZXN0QXJnXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHQvKiogQHR5cGUge0Z1bnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmVUaGlzfSAqL1xuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXNGdW4sICgpID0+IExvY2FsRGVjbGFyZS50aGlzKHRoaXMubG9jKSlcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BSZXR1cm5UeXBlID0gb3BSZXR1cm5UeXBlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgRnVufS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IEZ1bnMgPSB7XG5cdFx0LyoqIFJlZ3VsYXIgZnVuY3Rpb24gKGB8YCkgKi9cblx0XHRQbGFpbjogMCxcblx0XHQvKiogYCR8YCAqL1xuXHRcdEFzeW5jOiAxLFxuXHRcdC8qKiBgfnxgICovXG5cdFx0R2VuZXJhdG9yOiAyXG5cdH1cblxuLy8gR2VuZXJhdG9yXG5cdC8qKlxuXHRgPH4ge29wWWllbGRlZH1gXG5cdFRoZXNlIGFyZSBhbHNvIHRoZSB2YWx1ZSBwYXJ0IG9mIGBhIDx+IGJgIGFzc2lnbm1lbnRzLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgWWllbGQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BZaWVsZGVkPW51bGwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BZaWVsZGVkID0gb3BZaWVsZGVkXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGA8fn4ge3lpZWxkZWRUb31gXG5cdFRoZXNlIGFyZSBhbHNvIHRoZSB2YWx1ZSBwYXJ0IG9mIGBhIDx+fiBiYCBhc3NpZ25tZW50cy5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFlpZWxkVG8gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgeWllbGRlZFRvKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMueWllbGRlZFRvID0geWllbGRlZFRvXG5cdFx0fVxuXHR9XG5cbi8vIENsYXNzXG5cdC8qKlxuXHRgYGBjbGFzcyB7b3BTdXBlckNsYXNzfVxuXHRcdHtvcENvbW1lbnR9XG5cdFx0ZG8hXG5cdFx0XHR7b3BEb31cblx0XHRzdGF0aWNcblx0XHRcdHtzdGF0aWNzfVxuXHRcdHtvcENvbnN0cnVjdG9yfVxuXHRcdHttZXRob2RzfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BTdXBlckNsYXNzLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BTdXBlckNsYXNzID0gb3BTdXBlckNsYXNzXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHs/Q2xhc3NEb30gKi9cblx0XHRcdHRoaXMub3BEbyA9IG9wRG9cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5zdGF0aWNzID0gc3RhdGljc1xuXHRcdFx0LyoqIEB0eXBlIHs/Q29uc3RydWN0b3J9ICovXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IgPSBvcENvbnN0cnVjdG9yXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMubWV0aG9kcyA9IG1ldGhvZHNcblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbnN0cnVjdCEge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBDb25zdHJ1Y3RvciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1biwgbWVtYmVyQXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRUaGlzIHdpbGwgYWx3YXlzIGhhdmUgYSB7QGxpbmsgQmxvY2tEb30uXG5cdFx0XHRAdHlwZSB7RnVufVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLm1lbWJlckFyZ3MgPSBtZW1iZXJBcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIEFueSBwYXJ0IG9mIHtAbGluayBDbGFzcy5zdGF0aWNzfSBvciB7QGxpbmsgQ2xhc3MubWV0aG9kc30uICovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsTGlrZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLnN5bWJvbCA9IHN5bWJvbFxuXHRcdH1cblx0fVxuXHQvKiogYHtzeW1ib2x9IHtmdW59YCAqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbCBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgZnVuKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7RnVufSAqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHR9XG5cdH1cblx0LyoqXG5cdGBgYGdldCB7c3ltYm9sfVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEdldHRlciBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5kZWNsYXJlVGhpcyA9IExvY2FsRGVjbGFyZS50aGlzKGxvYylcblx0XHR9XG5cdH1cblx0LyoqXG5cdGBgYHNldCB7c3ltYm9sfVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZFNldHRlciBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gTG9jYWxEZWNsYXJlLnRoaXMobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBMb2NhbERlY2xhcmUuZm9jdXMobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgZG8hYCBwYXJ0IG9mIHtAbGluayBDbGFzc30uICovXG5cdGV4cG9ydCBjbGFzcyBDbGFzc0RvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmVGb2N1c30gKi9cblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gTG9jYWxEZWNsYXJlLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YHN1cGVyIHthcmdzfWAuXG5cdE5ldmVyIGEge0BsaW5rIFN1cGVyTWVtYmVyfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFN1cGVyQ2FsbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwcmVhZD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBzdXBlciEge2FyZ3N9YFxuXHROZXZlciBhIHtAbGluayBTdXBlck1lbWJlcn0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsIHwgU3ByZWFkPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYHN1cGVyLntuYW1lfWAgb3IgYHN1cGVyLlwie25hbWV9XCJgLiAqL1xuXHRleHBvcnQgY2xhc3MgU3VwZXJNZW1iZXIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cbi8vIENhbGxzXG5cdC8qKiBge2NhbGxlZH0ge2FyZ3N9YCAqL1xuXHRleHBvcnQgY2xhc3MgQ2FsbCBleHRlbmRzIFZhbCB7XG5cdFx0LyoqIGB7dGVzdGVkfTp7dGVzdFR5cGV9YCAqL1xuXHRcdHN0YXRpYyBjb250YWlucyhsb2MsIHRlc3RUeXBlLCB0ZXN0ZWQpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuQ29udGFpbnMpLCBbdGVzdFR5cGUsIHRlc3RlZF0pXG5cdFx0fVxuXG5cdFx0LyoqIGB7c3ViYmVkfVt7YXJnc31dYCAqL1xuXHRcdHN0YXRpYyBzdWIobG9jLCBzdWJiZWQsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuU3ViKSwgY2F0KHN1YmJlZCwgYXJncykpXG5cdFx0fVxuXG5cdFx0LyoqIGBkZWwhIHtzdWJiZWR9W3thcmdzfV1gICovXG5cdFx0c3RhdGljIGRlbFN1Yihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5EZWxTdWIpLCBjYXQoc3ViYmVkLCBhcmdzKSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmNhbGxlZCA9IGNhbGxlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcHJlYWQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgbmV3IHt0eXBlfSB7YXJnc31gICovXG5cdGV4cG9ydCBjbGFzcyBOZXcgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFNwcmVhZH0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYC4uLntzcHJlYWRlZH1gICovXG5cdGV4cG9ydCBjbGFzcyBTcHJlYWQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzcHJlYWRlZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnNwcmVhZGVkID0gc3ByZWFkZWRcblx0XHR9XG5cdH1cblxuXHQvKiogYH57dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQ2FzZVxuXHQvKiogYGNhc2UhYCBzdGF0ZW1lbnQuICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdEFzc2lnbmVlIGlzIGFsd2F5cyBhIExvY2FsRGVjbGFyZUZvY3VzLlxuXHRcdFx0QHR5cGUgez9Bc3NpZ25TaW5nbGV9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlRG9QYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2tEb30gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKiBTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBDYXNlRG99LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2FzZURvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWwgfCBQYXR0ZXJufSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHQvKiogYGNhc2VgIGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0Fzc2lnblNpbmdsZX0gKi9cblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8Q2FzZVZhbFBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKiBTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBDYXNlVmFsfS4gKi9cblx0ZXhwb3J0IGNsYXNzIENhc2VWYWxQYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFBhdHRlcm59ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHQvKiogYDp7dHlwZX0ge2xvY2Fsc31gICovXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgbG9jYWxzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsQWNjZXNzfSAqL1xuXHRcdFx0dGhpcy5wYXR0ZXJuZWQgPSBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cbi8vIFN3aXRjaFxuXHQvKiogYHN3aXRjaCFgIHN0YXRlbWVudC4gKi9cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFN3aXRjaERvUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gIHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqXG5cdFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIFN3aXRjaERvfS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzLCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgc3dpdGNoYCBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3dpdGNoZWQgPSBzd2l0Y2hlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxTd2l0Y2hWYWxQYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXHQvKipcblx0U2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgU3dpdGNoVmFsfS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcywgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cbi8vIEZvclxuXHQvKiogYGZvciEgKi9cblx0ZXhwb3J0IGNsYXNzIEZvckRvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBmb3JgICovXG5cdGV4cG9ydCBjbGFzcyBGb3JWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBAZm9yYFxuXHRDb250YWlucyBtYW55IHtAbGluayBCYWdFbnRyeX0gYW5kIHtAbGluayBCYWdFbnRyeU1hbnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQmFnIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB4IGluIHlgIG9yIGp1c3QgYHlgICh3aGVyZSB0aGUgbG9jYWwgaXMgaW1wbGljaXRseSBgX2ApLiAqL1xuXHRleHBvcnQgY2xhc3MgSXRlcmF0ZWUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBlbGVtZW50LCBiYWcpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmJhZyA9IGJhZ1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgYnJlYWshYCAqL1xuXHRleHBvcnQgY2xhc3MgQnJlYWsgZXh0ZW5kcyBEbyB7IH1cblxuXHQvKiogYGJyZWFrIHt2YWx9YCAqL1xuXHRleHBvcnQgY2xhc3MgQnJlYWtXaXRoVmFsIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIE1pc2NlbGxhbmVvdXMgVmFsc1xuXHQvKipcblx0QSBibG9jayBhcHBlYXJpbmcgb24gaXRzIG93biAobm90IGFzIHRoZSBibG9jayB0byBhbiBgaWZgIG9yIHRoZSBsaWtlKVxuXHRpcyBwdXQgaW50byBvbmUgb2YgdGhlc2UuXG5cdGUuZy46XG5cblx0XHR4ID1cblx0XHRcdHkgPSAxXG5cdFx0XHR5XG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1dyYXAgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKiogT25lLWxpbmUgQCBleHByZXNzaW9uLCBzdWNoIGFzIGBbIDEgMiAzIF1gLiAqL1xuXHRleHBvcnQgY2xhc3MgQmFnU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogT25lLWxpbmUgb2JqZWN0IGV4cHJlc3Npb24sIHN1Y2ggYXMgYChhLiAxIGIuIDIpYC4gKi9cblx0ZXhwb3J0IGNsYXNzIE9ialNpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYWlycykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxPYmpQYWlyPn0gKi9cblx0XHRcdHRoaXMucGFpcnMgPSBwYWlyc1xuXHRcdH1cblx0fVxuXHQvKiogUGFydCBvZiBhbiB7QGxpbmsgT2JqU2ltcGxlfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE9ialBhaXIgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXksIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgYW5kYCBvciBgb3JgIGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBMb2dpYyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvZ2ljc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBMb2dpY30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBMb2dpY3MgPSB7XG5cdFx0LyoqIGBhbmRgIGtleXdvcmQqL1xuXHRcdEFuZDogMCxcblx0XHQvKiogYG9yYCBrZXl3b3JkICovXG5cdFx0T3I6IDFcblx0fVxuXG5cdC8qKiBgbm90YCBrZXl3b3JkICovXG5cdGV4cG9ydCBjbGFzcyBOb3QgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuYXJnID0gYXJnXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdExpdGVyYWwgbnVtYmVyIHZhbHVlLlxuXHRUaGlzIGlzIGJvdGggYSBUb2tlbiBhbmQgTXNBc3QuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBOdW1iZXJMaXRlcmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdFN0b3JlIGFzIGEgc3RyaW5nIHNvIHdlIGNhbiBkaXN0aW5ndWlzaCBgMHhmYCBhbmQgYDE1YC5cblx0XHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0QG92ZXJyaWRlXG5cdFx0U2luY2UgdGhpcyBpcyB1c2VkIGFzIGEgVG9rZW4sIGl0IG11c3QgaW1wbGVtZW50IHRvU3RyaW5nLlxuXHRcdCovXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWx1ZS50b1N0cmluZygpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7b2JqZWN0fS57bmFtZX1gIG9yIGB7b2JqZWN0fS5cIntuYW1lfVwiYC4gKi9cblx0ZXhwb3J0IGNsYXNzIE1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKlxuXHRcdFx0SWYgYSBzdHJpbmcsIGNvdWxkIHN0aWxsIGJlIGFueSBzdHJpbmcsIHNvIG1heSBzdGlsbCBjb21waWxlIHRvIGBhWydzdHJpbmcnXWAuXG5cdFx0XHRAdHlwZSB7c3RyaW5nIHwgVmFsfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKioge0BsaW5rIFF1b3RlfSBvciB7QGxpbmsgUXVvdGVTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVBYnN0cmFjdCBleHRlbmRzIFZhbCB7fVxuXG5cdC8qKlxuXHRRdW90ZWQgdGV4dC4gQWx3YXlzIGNvbXBpbGVzIHRvIGEgdGVtcGxhdGUgc3RyaW5nLlxuXHRGb3IgdGFnZ2VkIHRlbXBsYXRlcywgdXNlIHtAbGluayBRdW90ZVRhZ2dlZFRlbXBsYXRlfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlUGxhaW4gZXh0ZW5kcyBRdW90ZUFic3RyYWN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdGBwYXJ0c2AgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdFx0cGFydCBTdHJpbmdzIGFyZSByYXcgdmFsdWVzLCBtZWFuaW5nIFwiXFxuXCIgaXMgdHdvIGNoYXJhY3RlcnMuXG5cdFx0XHRTaW5jZSBcIlxce1wiIGlzIHNwZWNpYWwgdG8gTWFzb24sIHRoYXQncyBvbmx5IG9uZSBjaGFyYWN0ZXIuXG5cdFx0XHRAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogYHt0YWd9XCJ7cXVvdGV9XCJgICovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRhZ2dlZFRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZywgcXVvdGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdC8qKiBAdHlwZSB7UXVvdGV9ICovXG5cdFx0XHR0aGlzLnF1b3RlID0gcXVvdGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YCd7bmFtZX1gLlxuXHRRdW90ZSBjb25zaXN0aW5nIG9mIGEgc2luZ2xlIG5hbWUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVNpbXBsZSBleHRlbmRzIFF1b3RlQWJzdHJhY3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHdpdGgge3ZhbHVlfSBbYXMge2RlY2xhcmV9XVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFdpdGggZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZSwgdmFsdWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZGVjbGFyZSA9IGRlY2xhcmVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKiogYCZ7bmFtZX1gIG9yIGAuJntuYW1lfWAgb3IgYHtvYmplY3R9LiZ7bmFtZX1gICovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJGdW4gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BPYmplY3QsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BPYmplY3QgPSBvcE9iamVjdFxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAmLntuYW1lfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEdldHRlckZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtzdGFydH0uLntlbmR9YCBvciBge3N0YXJ0fS4uLntlbmR9YC4gKi9cblx0ZXhwb3J0IGNsYXNzIFJhbmdlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN0YXJ0LCBlbmQsIGlzRXhjbHVzaXZlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3RhcnQgPSBzdGFydFxuXHRcdFx0LyoqXG5cdFx0XHRJZiBudWxsLCB0aGlzIGlzIGFuIGluZmluaXRlIFJhbmdlLlxuXHRcdFx0QHR5cGUgez9WYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5lbmQgPSBlbmRcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNFeGNsdXNpdmUgPSBpc0V4Y2x1c2l2ZVxuXHRcdH1cblx0fVxuXG4vLyBTcGVjaWFsXG5cdC8qKlxuXHRBIHNwZWNpYWwgYWN0aW9uLlxuXHRBbGwgU3BlY2lhbERvcyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtTcGVjaWFsRG9zfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIFNwZWNpYWxEb30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsRG9zID0ge1xuXHRcdERlYnVnZ2VyOiAwXG5cdH1cblxuXHQvKipcblx0QSBzcGVjaWFsIGV4cHJlc3Npb24uXG5cdEFsbCBTcGVjaWFsVmFscyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxWYWxzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbFZhbH0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsVmFscyA9IHtcblx0XHQvKiogYF9tcy5jb250YWluc2AgdXNlZCBmb3Ige0BsaW5rIENhbGwuY29udGFpbnN9ICovXG5cdFx0Q29udGFpbnM6IDAsXG5cdFx0LyoqIGBfbXMuZGVsU3ViYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5kZWxTdWJ9ICovXG5cdFx0RGVsU3ViOiAxLFxuXHRcdC8qKiBgZmFsc2VgIGxpdGVyYWwgKi9cblx0XHRGYWxzZTogMixcblx0XHQvKiogYG51bGxgIGxpdGVyYWwgKi9cblx0XHROdWxsOiAzLFxuXHRcdC8qKiBgX21zLnN1YmAgdXNlZCBmb3Ige0BsaW5rIENhbGwuc3VifSAqL1xuXHRcdFN1YjogNCxcblx0XHQvKiogYHRydWVgIGxpdGVyYWwgKi9cblx0XHRUcnVlOiA1LFxuXHRcdC8qKiBgdm9pZCAwYCAqL1xuXHRcdFVuZGVmaW5lZDogNixcblx0XHQvKipcblx0XHRgbmFtZWAgdmFsdWUgaXMgdGhlIG5hbWUgb2YgdGhlIG5lYXJlc3QgYXNzaWduZWQgdmFsdWUuIEluOlxuXG5cdFx0XHR4ID0gbmV3IE1ldGhvZFxuXHRcdFx0XHRuYW1lLlxuXG5cdFx0YG5hbWVgIHdpbGwgYmUgXCJ4XCIuXG5cdFx0Ki9cblx0XHROYW1lOiA3XG5cdH1cblxuXHQvKipcblx0YGlnbm9yZWAgc3RhdGVtZW50LlxuXHRLZWVwcyB0aGUgY29tcGlsZXIgZnJvbSBjb21wbGFpbmluZyBhYm91dCBhbiB1bnVzZWQgbG9jYWwuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJZ25vcmUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpZ25vcmVkTmFtZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cblx0XHRcdHRoaXMuaWdub3JlZE5hbWVzID0gaWdub3JlZE5hbWVzXG5cdFx0fVxuXHR9XG4iXX0=
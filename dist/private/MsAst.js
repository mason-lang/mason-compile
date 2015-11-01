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
	exports.Ignore = exports.SpecialVals = exports.SpecialVal = exports.SpecialDos = exports.SpecialDo = exports.Range = exports.GetterFun = exports.MemberFun = exports.With = exports.QuoteSimple = exports.QuoteTaggedTemplate = exports.QuotePlain = exports.QuoteAbstract = exports.Member = exports.NumberLiteral = exports.Not = exports.Logics = exports.Logic = exports.ObjPair = exports.ObjSimple = exports.BagSimple = exports.BlockWrap = exports.BreakWithVal = exports.Break = exports.Iteratee = exports.ForBag = exports.ForVal = exports.ForDo = exports.SwitchValPart = exports.SwitchVal = exports.SwitchDoPart = exports.SwitchDo = exports.Pattern = exports.CaseValPart = exports.CaseVal = exports.CaseDoPart = exports.CaseDo = exports.Lazy = exports.Spread = exports.New = exports.Call = exports.SuperMember = exports.SuperCallDo = exports.SuperCall = exports.MethodSetter = exports.MethodGetter = exports.MethodImpl = exports.MethodImplLike = exports.Constructor = exports.ClassKindDo = exports.Class = exports.Kind = exports.YieldTo = exports.Yield = exports.Funs = exports.Fun = exports.Cond = exports.ConditionalVal = exports.ConditionalDo = exports.MapEntry = exports.BlockMap = exports.BagEntryMany = exports.BagEntry = exports.BlockBag = exports.ObjEntryPlain = exports.ObjEntryAssign = exports.ObjEntry = exports.BlockObj = exports.BlockValThrow = exports.BlockValReturn = exports.BlockVal = exports.BlockDo = exports.Block = exports.Catch = exports.ExceptVal = exports.ExceptDo = exports.Assert = exports.Throw = exports.SetSub = exports.MemberSet = exports.Setters = exports.AssignDestructure = exports.AssignSingle = exports.Assign = exports.LocalMutate = exports.LocalAccess = exports.LocalDeclares = exports.LocalDeclare = exports.ImportGlobal = exports.Import = exports.ImportDo = exports.ModuleExportDefault = exports.ModuleExportNamed = exports.ModuleExport = exports.Module = exports.Val = exports.Do = exports.LineContent = undefined;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BTXFCLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FZWixXQUFXOztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQUdYLEVBQUU7O1NBQUYsRUFBRSxHQUFGLEVBQUU7O09BR0YsR0FBRzs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FJSCxNQUFNOzs7Ozs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Bc0JOLFlBQVk7Ozs7Ozs7O1NBQVosWUFBWSxHQUFaLFlBQVk7O09BUVosaUJBQWlCOztTQUFqQixpQkFBaUIsR0FBakIsaUJBQWlCOztPQUVqQixtQkFBbUI7O1NBQW5CLG1CQUFtQixHQUFuQixtQkFBbUI7O09BR25CLFFBQVE7Ozs7Ozs7O1NBQVIsUUFBUSxHQUFSLFFBQVE7O09BU1IsTUFBTTs7Ozs7Ozs7OztTQUFOLE1BQU0sR0FBTixNQUFNOztPQWdCTixZQUFZOzs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTs7T0FnQlosWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTtPQTJDWixhQUFhLFdBQWIsYUFBYSxHQUFHOztBQUU1QixPQUFLLEVBQUUsQ0FBQzs7QUFFUixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxTQUFPLEVBQUUsQ0FBQztFQUNWOztPQUdZLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWCxXQUFXLEdBQVgsV0FBVzs7T0FpQlgsV0FBVzs7Ozs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BWVgsTUFBTTs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTTs7T0FTTixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7OztTQUFaLFlBQVksR0FBWixZQUFZOztPQW1CWixpQkFBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQWpCLGlCQUFpQixHQUFqQixpQkFBaUI7T0F1QmpCLE9B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UUFBTSxFQUFFLENBQUM7O0FBRVQsT0FBSyxFQUFFLENBQUM7O0FBRVIsTUFBSSxFQUFFLENBQUM7O0FBRVAsS0FBRyxFQUFFLENBQUM7O0FBRU4sTUFBSSxFQUFFLENBQUM7O0FBRVAsV0FBUyxFQUFFLENBQUM7Ozs7Ozs7QUFTWixNQUFJLEVBQUUsQ0FBQztFQUNQOztPQU1ZLE1BQU07Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU0iLCJmaWxlIjoiTXNBc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NhdCwgb3BJZn0gZnJvbSAnLi91dGlsJ1xuXG4vKipcbkFueSBNYXNvbiBBU1QuXG5BbGwgQVNUcyBoYXZlIGEgYGxvY2AgdGhhdCB0aGV5IHBhc3Mgb24gdG8gdGhlIGVzYXN0IGR1cmluZyB7QGxpbmsgdHJhbnNwaWxlfS5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNc0FzdCB7XG5cdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdC8qKiBAdHlwZSB7TG9jfSAqL1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cbn1cblxuLy8gTGluZUNvbnRlbnRcblx0LyoqXG5cdEFueSB2YWxpZCBwYXJ0IG9mIGEgQmxvY2suXG5cdE5vdGUgdGhhdCBzb21lIHtAbGluayBWYWx9cyB3aWxsIHN0aWxsIGNhdXNlIHdhcm5pbmdzIGlmIHRoZXkgYXBwZWFyIGFzIGEgbGluZS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIExpbmVDb250ZW50IGV4dGVuZHMgTXNBc3QgeyB9XG5cblx0LyoqIENhbiBvbmx5IGFwcGVhciBhcyBsaW5lcyBpbiBhIEJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgRG8gZXh0ZW5kcyBMaW5lQ29udGVudCB7IH1cblxuXHQvKiogQ2FuIGFwcGVhciBpbiBhbnkgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIFZhbCBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG4vLyBNb2R1bGVcblx0LyoqIFdob2xlIHNvdXJjZSBmaWxlLiAqL1xuXHRleHBvcnQgY2xhc3MgTW9kdWxlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIG9wSW1wb3J0R2xvYmFsLCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHROb3QgdXNlZCBmb3IgY29tcGlsYXRpb24sIGJ1dCB1c2VmdWwgZm9yIHRvb2xzLlxuXHRcdFx0QHR5cGUge3N0cmluZ31cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxJbXBvcnREbz59ICovXG5cdFx0XHR0aGlzLmRvSW1wb3J0cyA9IGRvSW1wb3J0c1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxJbXBvcnQ+fSAqL1xuXHRcdFx0dGhpcy5pbXBvcnRzID0gaW1wb3J0c1xuXHRcdFx0LyoqIEB0eXBlIHs/SW1wb3J0R2xvYmFsfSAqL1xuXHRcdFx0dGhpcy5vcEltcG9ydEdsb2JhbCA9IG9wSW1wb3J0R2xvYmFsXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PERvPn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBTaW5nbGUgZXhwb3J0LiAqL1xuXHRleHBvcnQgY2xhc3MgTW9kdWxlRXhwb3J0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Fzc2lnblNpbmdsZX0gKi9cblx0XHRcdHRoaXMuYXNzaWduID0gYXNzaWduXG5cdFx0fVxuXHR9XG5cdC8qKiBDcmVhdGVkIHdpdGggYW4gT2JqQXNzaWduIGluIHJvb3QuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnROYW1lZCBleHRlbmRzIE1vZHVsZUV4cG9ydCB7IH1cblx0LyoqIENyZWF0ZWQgYnkgYXNzaWduaW5nIHRvIHRoZSBtb2R1bGUncyBuYW1lLiAqL1xuXHRleHBvcnQgY2xhc3MgTW9kdWxlRXhwb3J0RGVmYXVsdCBleHRlbmRzIE1vZHVsZUV4cG9ydCB7IH1cblxuXHQvKiogU2luZ2xlIGltcG9ydCBpbiBhbiBgaW1wb3J0IWAgYmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnREbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGgpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdH1cblx0fVxuXG5cdC8qKiBTaW5nbGUgaW1wb3J0IGluIGFuIGBpbXBvcnRgIGJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGF0aCwgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmltcG9ydGVkID0gaW1wb3J0ZWRcblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMub3BJbXBvcnREZWZhdWx0ID0gb3BJbXBvcnREZWZhdWx0XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdEltcG9ydHMgZnJvbSAnZ2xvYmFsJyBhcmUgaGFuZGxlZCBzcGVjaWFsbHkgYmVjYXVzZSB0aGVyZSdzIG5vIG1vZHVsZSB0byBpbXBvcnQgZnJvbS5cblx0T3RoZXIgdGhhbiB0aGF0LCBzYW1lIGFzIHtAbGluayBJbXBvcnR9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0R2xvYmFsIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5pbXBvcnRlZCA9IGltcG9ydGVkXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0RGVmYXVsdCA9IG9wSW1wb3J0RGVmYXVsdFxuXHRcdH1cblx0fVxuXG4vLyBMb2NhbHNcblx0LyoqXG5cdEFsbCB7QGxpbmsgTG9jYWxBY2Nlc3N9ZXMgbXVzdCBoYXZlIHNvbWUgTG9jYWxEZWNsYXJlIHRvIGFjY2Vzcy5cblx0QWxsIGFjY2Vzc2libGUgaWRlbnRpZmllcnMgYXJlIHRoZXJlZm9yZSBMb2NhbERlY2xhcmVzLlxuXHRUaGlzIGluY2x1ZGVzIGltcG9ydHMsIGB0aGlzYCwgdGhlIGZvY3VzLCBldGMuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0LyoqIExvY2FsRGVjbGFyZSB3aXRoIG5vIHR5cGUuICovXG5cdFx0c3RhdGljIHVudHlwZWQobG9jLCBuYW1lLCBraW5kKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIGtpbmQpXG5cdFx0fVxuXG5cdFx0LyoqIExvY2FsRGVjbGFyZSBvZiBqdXN0IGEgbmFtZS4gKi9cblx0XHRzdGF0aWMgcGxhaW4obG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIExvY2FsRGVjbGFyZXMuQ29uc3QpXG5cdFx0fVxuXG5cdFx0c3RhdGljIGJ1aWx0KGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAnYnVpbHQnKVxuXHRcdH1cblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICdfJylcblx0XHR9XG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIG9wVHlwZSwga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmVzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblxuXHRcdGlzTGF6eSgpIHtcblx0XHRcdHJldHVybiB0aGlzLmtpbmQgPT09IExvY2FsRGVjbGFyZXMuTGF6eVxuXHRcdH1cblxuXHRcdGlzTXV0YWJsZSgpIHtcblx0XHRcdHJldHVybiB0aGlzLmtpbmQgPT09IExvY2FsRGVjbGFyZXMuTXV0YWJsZVxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZCBvZiB7QGxpbmsgTG9jYWxEZWNsYXJlfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IExvY2FsRGVjbGFyZXMgPSB7XG5cdFx0LyoqIERlY2xhcmVkIG5vcm1hbGx5LiAqL1xuXHRcdENvbnN0OiAwLFxuXHRcdC8qKiBEZWNsYXJlZCB3aXRoIGB+YWAuICovXG5cdFx0TGF6eTogMSxcblx0XHQvKiogRGVjbGFyZWQgd2l0aCBgOjo9YC4gKi9cblx0XHRNdXRhYmxlOiAyXG5cdH1cblxuXHQvKiogQWNjZXNzIHRoZSBsb2NhbCBgbmFtZWAuICovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbEFjY2VzcyBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGZvY3VzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICdfJylcblx0XHR9XG5cblx0XHRzdGF0aWMgdGhpcyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAndGhpcycpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtuYW1lfSA6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxNdXRhdGUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBBc3NpZ25cblx0LyoqIEFueSBleHByZXNzaW9uIGNyZWF0aW5nIG5ldyBsb2NhbHMuICovXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ24gZXh0ZW5kcyBEbyB7XG5cdFx0LyoqXG5cdFx0QWxsIGxvY2FscyBjcmVhdGVkIGJ5IHRoZSBhc3NpZ24uXG5cdFx0QGFic3RyYWN0XG5cdFx0Ki9cblx0XHRhbGxBc3NpZ25lZXMoKSB7fVxuXHR9XG5cblx0LyoqIGB7YXNzaWduZWV9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25TaW5nbGUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdC8qKiBBc3NpZ24gdG8gYF9gLiAqL1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmFzc2lnbmVlID0gYXNzaWduZWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqIEBvdmVycmlkZSAqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHsgcmV0dXJuIFt0aGlzLmFzc2lnbmVlXSB9XG5cdH1cblxuXHQvKiogYHthc3NpZ25lZXN9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25EZXN0cnVjdHVyZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZXMsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmFzc2lnbmVlcyA9IGFzc2lnbmVlc1xuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKipcblx0XHRLaW5kIG9mIGxvY2FscyB0aGlzIGFzc2lnbnMgdG8uXG5cdFx0QHJldHVybiB7TG9jYWxEZWNsYXJlc31cblx0XHQqL1xuXHRcdGtpbmQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hc3NpZ25lZXNbMF0ua2luZFxuXHRcdH1cblxuXHRcdC8qKiBAb3ZlcnJpZGUgKi9cblx0XHRhbGxBc3NpZ25lZXMoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hc3NpZ25lZXNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY29uc3QgU2V0dGVycyA9IHtcblx0XHRJbml0OiAwLFxuXHRcdE11dGF0ZTogMSxcblx0XHRJbml0TXV0YWJsZTogMlxuXHR9XG5cblx0LyoqXG5cdGB7b2JqZWN0fS57bmFtZX06e29wVHlwZX0gPS86PS86Oj0ge3ZhbHVlfWBcblx0QWxzbyBoYW5kbGVzIGB7b2JqZWN0fS5cIntuYW1lfVwiYC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE1lbWJlclNldCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCwgbmFtZSwgb3BUeXBlLCBraW5kLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtTZXR0ZXJzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtvYmplY3R9W3tzdWJiZWRzfV06e29wVHlwZX0gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFNldFN1YiBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCwgc3ViYmVkcywgb3BUeXBlLCBraW5kLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5zdWJiZWRzID0gc3ViYmVkc1xuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7U2V0dGVyc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIEVycm9yc1xuXHQvKiogYHRocm93ISB7b3BUaHJvd259YCAqL1xuXHRleHBvcnQgY2xhc3MgVGhyb3cgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFRocm93bikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFRocm93biA9IG9wVGhyb3duXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBhc3NlcnQhL2ZvcmJpZCEge2NvbmRpdGlvbn0gdGhyb3chIHtvcFRocm93bn1gICovXG5cdGV4cG9ydCBjbGFzcyBBc3NlcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuZWdhdGUsIGNvbmRpdGlvbiwgb3BUaHJvd24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0SWYgdHJ1ZSwgdGhpcyBpcyBhIGBmb3JiaWQhYC5cblx0XHRcdEB0eXBlIHtib29sZWFufVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmVnYXRlID0gbmVnYXRlXG5cdFx0XHQvKipcblx0XHRcdENvbXBpbGVkIHNwZWNpYWxseSBpZiBhIHtAbGluayBDYWxsfS5cblx0XHRcdEB0eXBlIHtWYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5jb25kaXRpb24gPSBjb25kaXRpb25cblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBleGNlcHQhXG5cdFx0dHJ5IVxuXHRcdFx0e3RyeX1cblx0XHRjYXRjaCFcblx0XHRcdHtjYXRjaH1cblx0XHRmaW5hbGx5IVxuXHRcdFx0e2ZpbmFsbHl9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHREbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIF90cnksIF9jYXRjaCwgX2ZpbmFsbHkpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMudHJ5ID0gX3RyeVxuXHRcdFx0LyoqIEB0eXBlIHs/Q2F0Y2h9ICovXG5cdFx0XHR0aGlzLmNhdGNoID0gX2NhdGNoXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5maW5hbGx5ID0gX2ZpbmFsbHlcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgZXhjZXB0XG5cdFx0dHJ5XG5cdFx0XHR7dHJ5fVxuXHRcdGNhdGNoXG5cdFx0XHR7Y2F0Y2h9XG5cdFx0ZmluYWxseSFcblx0XHRcdHtmaW5hbGx5fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRXhjZXB0VmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIF90cnksIF9jYXRjaCwgX2ZpbmFsbHkpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLnRyeSA9IF90cnlcblx0XHRcdC8qKiBAdHlwZSB7P0NhdGNofSAqL1xuXHRcdFx0dGhpcy5jYXRjaCA9IF9jYXRjaFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5maW5hbGx5ID0gX2ZpbmFsbHlcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgY2F0Y2gge2NhdWdodH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDYXRjaCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhdWdodCwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5jYXVnaHQgPSBjYXVnaHRcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gQmxvY2tcblx0LyoqXG5cdENvZGUgaW4gYW4gaW5kZW50ZWQgYmxvY2suXG5cdFNlZSB7QGxpbmsgQmxvY2tXcmFwfSBmb3IgdGhlIGtpbmQgdGhhdCBhcHBlYXJzIHdoZXJlIGEgVmFsIGlzIGV4cGVjdGVkLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2sgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0fVxuXHR9XG5cblx0LyoqIEJsb2NrIHRoYXQganVzdCBwZXJmb3JtcyBhY3Rpb25zIGFuZCBkb2Vzbid0IGhhdmUgYW55IHZhbHVlLiAqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tEbyBleHRlbmRzIEJsb2NrIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudD59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogQmxvY2sgaGF2aW5nIGEgdmFsdWUuICovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbCBleHRlbmRzIEJsb2NrIHsgfVxuXG5cdC8qKlxuXHRCbG9ja1ZhbCB0aGF0IGFjdHVhbGx5IHJldHVybnMgYSB2YWx1ZSBhdCB0aGUgZW5kLlxuXHQoVGhlIG1vc3QgY29tbW9uIGtpbmQgYnkgZmFyLilcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsUmV0dXJuIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcywgcmV0dXJuZWQpIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudD59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5yZXR1cm5lZCA9IHJldHVybmVkXG5cdFx0fVxuXHR9XG5cblx0LyoqIFRha2VzIHRoZSBwbGFjZSBvZiBhIEJsb2NrVmFsLCBidXQgZG9lc24ndCBhY3R1YWxseSByZXR1cm4gYSB2YWx1ZSDigJQgdGhyb3dzLiAqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWxUaHJvdyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMsIF90aHJvdykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdFx0LyoqIEB0eXBlIHtUaHJvd30gKi9cblx0XHRcdHRoaXMudGhyb3cgPSBfdGhyb3dcblx0XHR9XG5cdH1cblxuXHQvLyBUT0RPOiBCbG9ja0JhZywgQmxvY2tNYXAsIEJsb2NrT2JqID0+IEJsb2NrQnVpbGQoa2luZCwgLi4uKVxuXHQvKipcblx0QmxvY2sgcmV0dXJuaW5nIGFuIE9iamVjdC5cblx0Q29udGFpbnMgbWFueSB7QGxpbmsgT2JqRW50cnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tPYmogZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdHRoaXMuYnVpbHQgPSBMb2NhbERlY2xhcmUuYnVpbHQobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudCB8IE9iakVudHJ5Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBQYXJ0IG9mIGEge0BsaW5rIEJsb2NrT2JqICovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGEuIGJgXG5cdE9iakVudHJ5IHRoYXQgcHJvZHVjZXMgYSBuZXcgbG9jYWwuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeUFzc2lnbiBleHRlbmRzIE9iakVudHJ5IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBc3NpZ259ICovXG5cdFx0XHR0aGlzLmFzc2lnbiA9IGFzc2lnblxuXHRcdH1cblx0fVxuXG5cdC8qKiBPYmpFbnRyeSB0aGF0IGRvZXMgbm90IGludHJvZHVjZSBhIG5ldyBsb2NhbC4gKi9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5UGxhaW4gZXh0ZW5kcyBPYmpFbnRyeSB7XG5cdFx0LyoqXG5cdFx0YHtuYW1lfS5gIHdpdGggbm8gdmFsdWUuXG5cdFx0VGFrZXMgYSBsb2NhbCBvZiB0aGUgc2FtZSBuYW1lIGZyb20gb3V0c2lkZS5cblx0XHQqL1xuXHRcdHN0YXRpYyBhY2Nlc3MobG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBuYW1lLCBuZXcgTG9jYWxBY2Nlc3MobG9jLCBuYW1lKSlcblx0XHR9XG5cblx0XHRzdGF0aWMgbmFtZShsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCAnbmFtZScsIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0QmFnLWJ1aWxkaW5nIGJsb2NrLlxuXHRDb250YWlucyBtYW55IHtAbGluayBCYWdFbnRyeX0gYW5kIHtAbGluayBCYWdFbnRyeU1hbnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tCYWcgZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdHRoaXMuYnVpbHQgPSBMb2NhbERlY2xhcmUuYnVpbHQobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudCB8IEJhZ0VudHJ5Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgLiB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQmFnRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYC4uLiB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQmFnRW50cnlNYW55IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdE1hcC1idWlsZGluZyBibG9jay5cblx0Q29udGFpbnMgbWFueSB7QGxpbmsgTWFwRW50cnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tNYXAgZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdHRoaXMuYnVpbHQgPSBMb2NhbERlY2xhcmUuYnVpbHQobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMaW5lQ29udGVudCB8IE1hcEVudHJ5fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBrZXlgIC0+IGB2YWxgICovXG5cdGV4cG9ydCBjbGFzcyBNYXBFbnRyeSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSwgdmFsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsID0gdmFsXG5cdFx0fVxuXHR9XG5cbi8vIENvbmRpdGlvbmFsc1xuXHQvKipcblx0YGBgaWYhL3VubGVzcyEge3Rlc3R9XG5cdFx0e3Jlc3VsdH1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQsIGlzVW5sZXNzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgaWYvdW5sZXNzIHt0ZXN0fVxuXHRcdHtyZXN1bHR9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDb25kaXRpb25hbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQsIGlzVW5sZXNzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc1VubGVzcyA9IGlzVW5sZXNzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBjb25kIHt0ZXN0fSB7aWZUcnVlfSB7aWZGYWxzZX1gICovXG5cdGV4cG9ydCBjbGFzcyBDb25kIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIGlmVHJ1ZSwgaWZGYWxzZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuaWZUcnVlID0gaWZUcnVlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuaWZGYWxzZSA9IGlmRmFsc2Vcblx0XHR9XG5cdH1cblxuLy8gRnVuXG5cdC8qKlxuXHRgYGB8OntvcERlY2xhcmVSZXN9IHthcmdzfSAuLi57b3BSZXN0QXJnfVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0YXJncywgb3BSZXN0QXJnLCBibG9jaywga2luZD1GdW5zLlBsYWluLCBpc1RoaXNGdW49ZmFsc2UsIG9wUmV0dXJuVHlwZT1udWxsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wUmVzdEFyZyA9IG9wUmVzdEFyZ1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0LyoqIEB0eXBlIHtGdW5zfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlVGhpc30gKi9cblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzRnVuLCAoKSA9PiBMb2NhbERlY2xhcmUudGhpcyh0aGlzLmxvYykpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wUmV0dXJuVHlwZSA9IG9wUmV0dXJuVHlwZVxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIEZ1bn0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBGdW5zID0ge1xuXHRcdC8qKiBSZWd1bGFyIGZ1bmN0aW9uIChgfGApICovXG5cdFx0UGxhaW46IDAsXG5cdFx0LyoqIGAkfGAgKi9cblx0XHRBc3luYzogMSxcblx0XHQvKiogYH58YCAqL1xuXHRcdEdlbmVyYXRvcjogMlxuXHR9XG5cbi8vIEdlbmVyYXRvclxuXHQvKipcblx0YDx+IHtvcFlpZWxkZWR9YFxuXHRUaGVzZSBhcmUgYWxzbyB0aGUgdmFsdWUgcGFydCBvZiBgYSA8fiBiYCBhc3NpZ25tZW50cy5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFlpZWxkIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wWWllbGRlZD1udWxsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wWWllbGRlZCA9IG9wWWllbGRlZFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgPH5+IHt5aWVsZGVkVG99YFxuXHRUaGVzZSBhcmUgYWxzbyB0aGUgdmFsdWUgcGFydCBvZiBgYSA8fn4gYmAgYXNzaWdubWVudHMuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBZaWVsZFRvIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHlpZWxkZWRUbykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnlpZWxkZWRUbyA9IHlpZWxkZWRUb1xuXHRcdH1cblx0fVxuXG4vLyBDbGFzc1xuXHRleHBvcnQgY2xhc3MgS2luZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzdXBlcktpbmRzLCBvcENvbW1lbnQ9bnVsbCwgb3BEbz1udWxsLCBzdGF0aWNzPVtdLCBtZXRob2RzPVtdKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnN1cGVyS2luZHMgPSBzdXBlcktpbmRzXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHs/Q2xhc3NLaW5kRG99ICovXG5cdFx0XHR0aGlzLm9wRG8gPSBvcERvXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMuc3RhdGljcyA9IHN0YXRpY3Ncblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBjbGFzcyB7b3BTdXBlckNsYXNzfVxuXHRcdHtvcENvbW1lbnR9XG5cdFx0ZG8hXG5cdFx0XHR7b3BEb31cblx0XHRzdGF0aWNcblx0XHRcdHtzdGF0aWNzfVxuXHRcdHtvcENvbnN0cnVjdG9yfVxuXHRcdHttZXRob2RzfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0bG9jLCBvcFN1cGVyQ2xhc3MsIGtpbmRzLFxuXHRcdFx0b3BDb21tZW50PW51bGwsIG9wRG89bnVsbCwgc3RhdGljcz1bXSwgb3BDb25zdHJ1Y3Rvcj1udWxsLCBtZXRob2RzPVtdKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wU3VwZXJDbGFzcyA9IG9wU3VwZXJDbGFzc1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5raW5kcyA9IGtpbmRzXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHs/Q2xhc3NLaW5kRG99ICovXG5cdFx0XHR0aGlzLm9wRG8gPSBvcERvXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMuc3RhdGljcyA9IHN0YXRpY3Ncblx0XHRcdC8qKiBAdHlwZSB7P0NvbnN0cnVjdG9yfSAqL1xuXHRcdFx0dGhpcy5vcENvbnN0cnVjdG9yID0gb3BDb25zdHJ1Y3RvclxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLm1ldGhvZHMgPSBtZXRob2RzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBkbyFgIHBhcnQgb2Yge0BsaW5rIENsYXNzfSBvciB7QGxpbmsgS2luZH0uICovXG5cdGV4cG9ydCBjbGFzcyBDbGFzc0tpbmREbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlRm9jdXN9ICovXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBjb25zdHJ1Y3QhIHtmdW59YCAqL1xuXHRleHBvcnQgY2xhc3MgQ29uc3RydWN0b3IgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBmdW4sIG1lbWJlckFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0VGhpcyB3aWxsIGFsd2F5cyBoYXZlIGEge0BsaW5rIEJsb2NrRG99LlxuXHRcdFx0QHR5cGUge0Z1bn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5tZW1iZXJBcmdzID0gbWVtYmVyQXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBBbnkgcGFydCBvZiB7QGxpbmsgQ2xhc3Muc3RhdGljc30gb3Ige0BsaW5rIENsYXNzLm1ldGhvZHN9LiAqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbExpa2UgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5zeW1ib2wgPSBzeW1ib2xcblx0XHR9XG5cdH1cblx0LyoqIGB7c3ltYm9sfSB7ZnVufWAgKi9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGwgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wsIGZ1bikge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Z1bn0gKi9cblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRgYGBnZXQge3N5bWJvbH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RHZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBMb2NhbERlY2xhcmUudGhpcyhsb2MpXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRgYGBzZXQge3N5bWJvbH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RTZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5kZWNsYXJlVGhpcyA9IExvY2FsRGVjbGFyZS50aGlzKGxvYylcblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gTG9jYWxEZWNsYXJlLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YHN1cGVyIHthcmdzfWAuXG5cdE5ldmVyIGEge0BsaW5rIFN1cGVyTWVtYmVyfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFN1cGVyQ2FsbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwcmVhZD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBzdXBlciEge2FyZ3N9YFxuXHROZXZlciBhIHtAbGluayBTdXBlck1lbWJlcn0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsIHwgU3ByZWFkPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYHN1cGVyLntuYW1lfWAgb3IgYHN1cGVyLlwie25hbWV9XCJgLiAqL1xuXHRleHBvcnQgY2xhc3MgU3VwZXJNZW1iZXIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cbi8vIENhbGxzXG5cdC8qKiBge2NhbGxlZH0ge2FyZ3N9YCAqL1xuXHRleHBvcnQgY2xhc3MgQ2FsbCBleHRlbmRzIFZhbCB7XG5cdFx0LyoqIGB7dGVzdGVkfTp7dGVzdFR5cGV9YCAqL1xuXHRcdHN0YXRpYyBjb250YWlucyhsb2MsIHRlc3RUeXBlLCB0ZXN0ZWQpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuQ29udGFpbnMpLCBbdGVzdFR5cGUsIHRlc3RlZF0pXG5cdFx0fVxuXG5cdFx0LyoqIGB7c3ViYmVkfVt7YXJnc31dYCAqL1xuXHRcdHN0YXRpYyBzdWIobG9jLCBzdWJiZWQsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuU3ViKSwgY2F0KHN1YmJlZCwgYXJncykpXG5cdFx0fVxuXG5cdFx0LyoqIGBkZWwhIHtzdWJiZWR9W3thcmdzfV1gICovXG5cdFx0c3RhdGljIGRlbFN1Yihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5EZWxTdWIpLCBjYXQoc3ViYmVkLCBhcmdzKSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmNhbGxlZCA9IGNhbGxlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcHJlYWQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgbmV3IHt0eXBlfSB7YXJnc31gICovXG5cdGV4cG9ydCBjbGFzcyBOZXcgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFNwcmVhZH0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYC4uLntzcHJlYWRlZH1gICovXG5cdGV4cG9ydCBjbGFzcyBTcHJlYWQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzcHJlYWRlZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnNwcmVhZGVkID0gc3ByZWFkZWRcblx0XHR9XG5cdH1cblxuXHQvKiogYH57dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQ2FzZVxuXHQvKiogYGNhc2UhYCBzdGF0ZW1lbnQuICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdEFzc2lnbmVlIGlzIGFsd2F5cyBhIExvY2FsRGVjbGFyZUZvY3VzLlxuXHRcdFx0QHR5cGUgez9Bc3NpZ25TaW5nbGV9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlRG9QYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2tEb30gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKiBTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBDYXNlRG99LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2FzZURvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWwgfCBQYXR0ZXJufSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHQvKiogYGNhc2VgIGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ2FzZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0Fzc2lnblNpbmdsZX0gKi9cblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8Q2FzZVZhbFBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKiBTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBDYXNlVmFsfS4gKi9cblx0ZXhwb3J0IGNsYXNzIENhc2VWYWxQYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFBhdHRlcm59ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrVmFsfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHQvKiogYDp7dHlwZX0ge2xvY2Fsc31gICovXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgbG9jYWxzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsQWNjZXNzfSAqL1xuXHRcdFx0dGhpcy5wYXR0ZXJuZWQgPSBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cbi8vIFN3aXRjaFxuXHQvKiogYHN3aXRjaCFgIHN0YXRlbWVudC4gKi9cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFN3aXRjaERvUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gIHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqXG5cdFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIFN3aXRjaERvfS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzLCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgc3dpdGNoYCBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3dpdGNoZWQgPSBzd2l0Y2hlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxTd2l0Y2hWYWxQYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXHQvKipcblx0U2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgU3dpdGNoVmFsfS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcywgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja1ZhbH0gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cbi8vIEZvclxuXHQvKiogYGZvciEgKi9cblx0ZXhwb3J0IGNsYXNzIEZvckRvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBmb3JgICovXG5cdGV4cG9ydCBjbGFzcyBGb3JWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja0RvfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBAZm9yYFxuXHRDb250YWlucyBtYW55IHtAbGluayBCYWdFbnRyeX0gYW5kIHtAbGluayBCYWdFbnRyeU1hbnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQmFnIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tEb30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5idWlsdCA9IExvY2FsRGVjbGFyZS5idWlsdChsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB4IGluIHlgIG9yIGp1c3QgYHlgICh3aGVyZSB0aGUgbG9jYWwgaXMgaW1wbGljaXRseSBgX2ApLiAqL1xuXHRleHBvcnQgY2xhc3MgSXRlcmF0ZWUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBlbGVtZW50LCBiYWcpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmJhZyA9IGJhZ1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgYnJlYWshYCAqL1xuXHRleHBvcnQgY2xhc3MgQnJlYWsgZXh0ZW5kcyBEbyB7IH1cblxuXHQvKiogYGJyZWFrIHt2YWx9YCAqL1xuXHRleHBvcnQgY2xhc3MgQnJlYWtXaXRoVmFsIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIE1pc2NlbGxhbmVvdXMgVmFsc1xuXHQvKipcblx0QSBibG9jayBhcHBlYXJpbmcgb24gaXRzIG93biAobm90IGFzIHRoZSBibG9jayB0byBhbiBgaWZgIG9yIHRoZSBsaWtlKVxuXHRpcyBwdXQgaW50byBvbmUgb2YgdGhlc2UuXG5cdGUuZy46XG5cblx0XHR4ID1cblx0XHRcdHkgPSAxXG5cdFx0XHR5XG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1dyYXAgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2tWYWx9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKiogT25lLWxpbmUgQCBleHByZXNzaW9uLCBzdWNoIGFzIGBbIDEgMiAzIF1gLiAqL1xuXHRleHBvcnQgY2xhc3MgQmFnU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogT25lLWxpbmUgb2JqZWN0IGV4cHJlc3Npb24sIHN1Y2ggYXMgYChhLiAxIGIuIDIpYC4gKi9cblx0ZXhwb3J0IGNsYXNzIE9ialNpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYWlycykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxPYmpQYWlyPn0gKi9cblx0XHRcdHRoaXMucGFpcnMgPSBwYWlyc1xuXHRcdH1cblx0fVxuXHQvKiogUGFydCBvZiBhbiB7QGxpbmsgT2JqU2ltcGxlfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE9ialBhaXIgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXksIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgYW5kYCBvciBgb3JgIGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBMb2dpYyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvZ2ljc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBMb2dpY30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBMb2dpY3MgPSB7XG5cdFx0LyoqIGBhbmRgIGtleXdvcmQqL1xuXHRcdEFuZDogMCxcblx0XHQvKiogYG9yYCBrZXl3b3JkICovXG5cdFx0T3I6IDFcblx0fVxuXG5cdC8qKiBgbm90YCBrZXl3b3JkICovXG5cdGV4cG9ydCBjbGFzcyBOb3QgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuYXJnID0gYXJnXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdExpdGVyYWwgbnVtYmVyIHZhbHVlLlxuXHRUaGlzIGlzIGJvdGggYSBUb2tlbiBhbmQgTXNBc3QuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBOdW1iZXJMaXRlcmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdFN0b3JlIGFzIGEgc3RyaW5nIHNvIHdlIGNhbiBkaXN0aW5ndWlzaCBgMHhmYCBhbmQgYDE1YC5cblx0XHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0QG92ZXJyaWRlXG5cdFx0U2luY2UgdGhpcyBpcyB1c2VkIGFzIGEgVG9rZW4sIGl0IG11c3QgaW1wbGVtZW50IHRvU3RyaW5nLlxuXHRcdCovXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWx1ZS50b1N0cmluZygpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7b2JqZWN0fS57bmFtZX1gIG9yIGB7b2JqZWN0fS5cIntuYW1lfVwiYC4gKi9cblx0ZXhwb3J0IGNsYXNzIE1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKlxuXHRcdFx0SWYgYSBzdHJpbmcsIGNvdWxkIHN0aWxsIGJlIGFueSBzdHJpbmcsIHNvIG1heSBzdGlsbCBjb21waWxlIHRvIGBhWydzdHJpbmcnXWAuXG5cdFx0XHRAdHlwZSB7c3RyaW5nIHwgVmFsfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKioge0BsaW5rIFF1b3RlfSBvciB7QGxpbmsgUXVvdGVTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVBYnN0cmFjdCBleHRlbmRzIFZhbCB7fVxuXG5cdC8qKlxuXHRRdW90ZWQgdGV4dC4gQWx3YXlzIGNvbXBpbGVzIHRvIGEgdGVtcGxhdGUgc3RyaW5nLlxuXHRGb3IgdGFnZ2VkIHRlbXBsYXRlcywgdXNlIHtAbGluayBRdW90ZVRhZ2dlZFRlbXBsYXRlfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlUGxhaW4gZXh0ZW5kcyBRdW90ZUFic3RyYWN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdGBwYXJ0c2AgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdFx0cGFydCBTdHJpbmdzIGFyZSByYXcgdmFsdWVzLCBtZWFuaW5nIFwiXFxuXCIgaXMgdHdvIGNoYXJhY3RlcnMuXG5cdFx0XHRTaW5jZSBcIlxce1wiIGlzIHNwZWNpYWwgdG8gTWFzb24sIHRoYXQncyBvbmx5IG9uZSBjaGFyYWN0ZXIuXG5cdFx0XHRAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogYHt0YWd9XCJ7cXVvdGV9XCJgICovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRhZ2dlZFRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZywgcXVvdGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdC8qKiBAdHlwZSB7UXVvdGV9ICovXG5cdFx0XHR0aGlzLnF1b3RlID0gcXVvdGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YCd7bmFtZX1gLlxuXHRRdW90ZSBjb25zaXN0aW5nIG9mIGEgc2luZ2xlIG5hbWUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVNpbXBsZSBleHRlbmRzIFF1b3RlQWJzdHJhY3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHdpdGgge3ZhbHVlfSBbYXMge2RlY2xhcmV9XVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFdpdGggZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZSwgdmFsdWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZGVjbGFyZSA9IGRlY2xhcmVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrRG99ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKiogYCZ7bmFtZX1gIG9yIGAuJntuYW1lfWAgb3IgYHtvYmplY3R9LiZ7bmFtZX1gICovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJGdW4gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BPYmplY3QsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BPYmplY3QgPSBvcE9iamVjdFxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAmLntuYW1lfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEdldHRlckZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtzdGFydH0uLntlbmR9YCBvciBge3N0YXJ0fS4uLntlbmR9YC4gKi9cblx0ZXhwb3J0IGNsYXNzIFJhbmdlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN0YXJ0LCBlbmQsIGlzRXhjbHVzaXZlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3RhcnQgPSBzdGFydFxuXHRcdFx0LyoqXG5cdFx0XHRJZiBudWxsLCB0aGlzIGlzIGFuIGluZmluaXRlIFJhbmdlLlxuXHRcdFx0QHR5cGUgez9WYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5lbmQgPSBlbmRcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNFeGNsdXNpdmUgPSBpc0V4Y2x1c2l2ZVxuXHRcdH1cblx0fVxuXG4vLyBTcGVjaWFsXG5cdC8qKlxuXHRBIHNwZWNpYWwgYWN0aW9uLlxuXHRBbGwgU3BlY2lhbERvcyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtTcGVjaWFsRG9zfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIFNwZWNpYWxEb30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsRG9zID0ge1xuXHRcdERlYnVnZ2VyOiAwXG5cdH1cblxuXHQvKipcblx0QSBzcGVjaWFsIGV4cHJlc3Npb24uXG5cdEFsbCBTcGVjaWFsVmFscyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxWYWxzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbFZhbH0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsVmFscyA9IHtcblx0XHQvKiogYF9tcy5jb250YWluc2AgdXNlZCBmb3Ige0BsaW5rIENhbGwuY29udGFpbnN9ICovXG5cdFx0Q29udGFpbnM6IDAsXG5cdFx0LyoqIGBfbXMuZGVsU3ViYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5kZWxTdWJ9ICovXG5cdFx0RGVsU3ViOiAxLFxuXHRcdC8qKiBgZmFsc2VgIGxpdGVyYWwgKi9cblx0XHRGYWxzZTogMixcblx0XHQvKiogYG51bGxgIGxpdGVyYWwgKi9cblx0XHROdWxsOiAzLFxuXHRcdC8qKiBgX21zLnN1YmAgdXNlZCBmb3Ige0BsaW5rIENhbGwuc3VifSAqL1xuXHRcdFN1YjogNCxcblx0XHQvKiogYHRydWVgIGxpdGVyYWwgKi9cblx0XHRUcnVlOiA1LFxuXHRcdC8qKiBgdm9pZCAwYCAqL1xuXHRcdFVuZGVmaW5lZDogNixcblx0XHQvKipcblx0XHRgbmFtZWAgdmFsdWUgaXMgdGhlIG5hbWUgb2YgdGhlIG5lYXJlc3QgYXNzaWduZWQgdmFsdWUuIEluOlxuXG5cdFx0XHR4ID0gbmV3IE1ldGhvZFxuXHRcdFx0XHRuYW1lLlxuXG5cdFx0YG5hbWVgIHdpbGwgYmUgXCJ4XCIuXG5cdFx0Ki9cblx0XHROYW1lOiA3XG5cdH1cblxuXHQvKipcblx0YGlnbm9yZWAgc3RhdGVtZW50LlxuXHRLZWVwcyB0aGUgY29tcGlsZXIgZnJvbSBjb21wbGFpbmluZyBhYm91dCBhbiB1bnVzZWQgbG9jYWwuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJZ25vcmUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpZ25vcmVkTmFtZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cblx0XHRcdHRoaXMuaWdub3JlZE5hbWVzID0gaWdub3JlZE5hbWVzXG5cdFx0fVxuXHR9XG4iXX0=
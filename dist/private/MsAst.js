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
	exports.Ignore = exports.SpecialVals = exports.SpecialVal = exports.SpecialDos = exports.SpecialDo = exports.Range = exports.SimpleFun = exports.GetterFun = exports.MemberFun = exports.With = exports.Pipe = exports.QuoteSimple = exports.QuoteTaggedTemplate = exports.QuotePlain = exports.QuoteAbstract = exports.Member = exports.NumberLiteral = exports.Not = exports.Logics = exports.Logic = exports.ObjPair = exports.ObjSimple = exports.BagSimple = exports.BlockWrap = exports.Break = exports.Iteratee = exports.ForBag = exports.ForAsync = exports.For = exports.SwitchPart = exports.Switch = exports.Pattern = exports.CasePart = exports.Case = exports.Lazy = exports.Spread = exports.New = exports.Call = exports.SuperMember = exports.SuperCall = exports.MethodSetter = exports.MethodGetter = exports.MethodImpl = exports.MethodImplLike = exports.Constructor = exports.ClassKindDo = exports.Class = exports.Kind = exports.YieldTo = exports.Yield = exports.Await = exports.Method = exports.FunAbstract = exports.Funs = exports.Fun = exports.FunLike = exports.Cond = exports.Conditional = exports.MapEntry = exports.BagEntry = exports.ObjEntryPlain = exports.ObjEntryAssign = exports.ObjEntry = exports.BuildEntry = exports.Block = exports.Catch = exports.Except = exports.Assert = exports.Throw = exports.SetSub = exports.MemberSet = exports.Setters = exports.AssignDestructure = exports.AssignSingle = exports.Assign = exports.LocalMutate = exports.LocalAccess = exports.LocalDeclares = exports.LocalDeclare = exports.Import = exports.ImportDo = exports.Module = exports.Val = exports.Do = exports.LineContent = undefined;

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
		constructor(loc, name, opComment, doImports, imports, lines) {
			super(loc);
			this.name = name;
			this.opComment = opComment;
			this.doImports = doImports;
			this.imports = imports;
			this.lines = lines;
		}

	}

	exports.Module = Module;

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

	class LocalDeclare extends MsAst {
		static untyped(loc, name, kind) {
			return new LocalDeclare(loc, name, null, kind);
		}

		static plain(loc, name) {
			return new LocalDeclare(loc, name, null, LocalDeclares.Eager);
		}

		static built(loc) {
			return this.plain(loc, 'built');
		}

		static focus(loc) {
			return this.plain(loc, '_');
		}

		static typedFocus(loc, type) {
			return new LocalDeclare(loc, '_', type, LocalDeclares.Eager);
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

	}

	exports.LocalDeclare = LocalDeclare;
	const LocalDeclares = exports.LocalDeclares = {
		/** Declared normally. */
		Eager: 0,
		/** Declared with `~a`. */
		Lazy: 1
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
		Mutate: 1
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
		constructor(loc, _try, typedCatches, opCatchAll, opElse, opFinally) {
			super(loc);
			this.try = _try;
			this.typedCatches = typedCatches;
			this.opCatchAll = opCatchAll;
			this.opElse = opElse;
			this.opFinally = opFinally;
		}

		get allCatches() {
			return (0, _util.cat)(this.typedCatches, this.opCatchAll);
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
		constructor(loc, opComment, lines) {
			super(loc);
			this.opComment = opComment;
			this.lines = lines;
		}

	}

	exports.Block = Block;

	class BuildEntry extends MsAst {}

	exports.BuildEntry = BuildEntry;

	class ObjEntry extends BuildEntry {
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

	class BagEntry extends BuildEntry {
		constructor(loc, value, isMany) {
			super(loc);
			this.value = value;
			this.isMany = isMany;
		}

	}

	exports.BagEntry = BagEntry;

	class MapEntry extends BuildEntry {
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

	class FunLike extends Val {
		constructor(loc, args, opRestArg) {
			super(loc);
			this.args = args;
			this.opRestArg = opRestArg;
		}

	}

	exports.FunLike = FunLike;

	class Fun extends FunLike {
		constructor(loc, args, opRestArg, block) {
			let opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
			super(loc, args, opRestArg);
			this.block = block;
			this.kind = opts.kind || Funs.Plain;
			this.opDeclareThis = (0, _util.opIf)(opts.isThisFun, () => LocalDeclare.this(this.loc));
			this.isDo = opts.isDo || false;
			this.opReturnType = opts.opReturnType || null;
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

	class FunAbstract extends FunLike {
		constructor(loc, args, opRestArg, opReturnType, opComment) {
			super(loc, args, opRestArg);
			this.opReturnType = opReturnType;
			this.opComment = opComment;
		}

	}

	exports.FunAbstract = FunAbstract;

	class Method extends Val {
		constructor(loc, fun) {
			super(loc);
			this.fun = fun;
		}

	}

	exports.Method = Method;

	class Await extends Val {
		constructor(loc, value) {
			super(loc);
			this.value = value;
		}

	}

	exports.Await = Await;

	class Yield extends Val {
		constructor(loc) {
			let opValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			super(loc);
			this.opValue = opValue;
		}

	}

	exports.Yield = Yield;

	class YieldTo extends Val {
		constructor(loc, value) {
			super(loc);
			this.value = value;
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
		constructor(loc, isMy, symbol) {
			super(loc);
			this.isMy = isMy;
			this.symbol = symbol;
		}

	}

	exports.MethodImplLike = MethodImplLike;

	class MethodImpl extends MethodImplLike {
		constructor(loc, isMy, symbol, fun) {
			super(loc, isMy, symbol);
			this.fun = fun;
		}

	}

	exports.MethodImpl = MethodImpl;

	class MethodGetter extends MethodImplLike {
		constructor(loc, isMy, symbol, block) {
			super(loc, isMy, symbol);
			this.block = block;
			this.declareThis = LocalDeclare.this(loc);
		}

	}

	exports.MethodGetter = MethodGetter;

	class MethodSetter extends MethodImplLike {
		constructor(loc, isMy, symbol, block) {
			super(loc, isMy, symbol);
			this.block = block;
			this.declareThis = LocalDeclare.this(loc);
			this.declareFocus = LocalDeclare.focus(loc);
		}

	}

	exports.MethodSetter = MethodSetter;

	class SuperCall extends LineContent {
		constructor(loc, args) {
			super(loc);
			this.args = args;
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

	}

	exports.Case = Case;

	class CasePart extends MsAst {
		constructor(loc, test, result) {
			super(loc);
			this.test = test;
			this.result = result;
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

	}

	exports.Switch = Switch;

	class SwitchPart extends MsAst {
		constructor(loc, values, result) {
			super(loc);
			this.values = values;
			this.result = result;
		}

	}

	exports.SwitchPart = SwitchPart;

	class For extends LineContent {
		constructor(loc, opIteratee, block) {
			super(loc);
			this.opIteratee = opIteratee;
			this.block = block;
		}

	}

	exports.For = For;

	class ForAsync extends Val {
		constructor(loc, iteratee, block) {
			super(loc);
			this.iteratee = iteratee;
			this.block = block;
		}

	}

	exports.ForAsync = ForAsync;

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

	class Break extends Do {
		constructor(loc) {
			let opValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			super(loc);
			this.opValue = opValue;
		}

	}

	exports.Break = Break;

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

	class Pipe extends Val {
		constructor(loc, value, pipes) {
			super(loc);
			this.value = value;
			this.pipes = pipes;
		}

	}

	exports.Pipe = Pipe;

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

	class SimpleFun extends Val {
		constructor(loc, value) {
			super(loc);
			this.value = value;
		}

	}

	exports.SimpleFun = SimpleFun;

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
		/**
  `name` value is the name of the nearest assigned value. In:
  		x = new Method
  		name.
  	`name` will be "x".
  */
		Name: 3,
		/** `null` literal */
		Null: 4,
		/** `_ms.sub` used for {@link Call.sub} */
		Sub: 5,
		/** `true` literal */
		True: 6,
		/** `void 0` */
		Undefined: 7
	};

	class Ignore extends Do {
		constructor(loc, ignoredNames) {
			super(loc);
			this.ignoredNames = ignoredNames;
		}

	}

	exports.Ignore = Ignore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BTXFCLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FZWixXQUFXOztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQUdYLEVBQUU7O1NBQUYsRUFBRSxHQUFGLEVBQUU7O09BR0YsR0FBRzs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FJSCxNQUFNOzs7Ozs7Ozs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTTs7T0FvQk4sUUFBUTs7Ozs7Ozs7U0FBUixRQUFRLEdBQVIsUUFBUTs7T0FZUixNQUFNOzs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQVosWUFBWSxHQUFaLFlBQVk7T0EwQ1osYUFBYSxXQUFiLGFBQWEsR0FBRzs7QUFFNUIsT0FBSyxFQUFFLENBQUM7O0FBRVIsTUFBSSxFQUFFLENBQUM7RUFDUDs7T0FHWSxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BaUJYLFdBQVc7Ozs7Ozs7OztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQVlYLE1BQU07Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09BU04sWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTs7T0FtQlosaUJBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztTQUFqQixpQkFBaUIsR0FBakIsaUJBQWlCO09Bd0JqQixPQUFPLFdBQVAsT0FBTyxHQUFHO0FBQ3RCLE1BQUksRUFBRSxDQUFDO0FBQ1AsUUFBTSxFQUFFLENBQUM7RUFDVDs7T0FNWSxTQUFTOzs7Ozs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FpQlQsTUFBTTs7Ozs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLEtBQUs7Ozs7Ozs7O1NBQUwsS0FBSyxHQUFM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Ozs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FXVCxTQUFTOzs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTOztPQVNULFNBQVM7Ozs7Ozs7O1NBQVQsU0FBUyxHQUFULFNBQVM7O09BU1QsS0FBSzs7Ozs7Ozs7OztTQUFMLEtBQUssR0FBTCxLQUFLOztPQW9CTCxTQUFTOzs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTO09BV1QsVUFBVSxXQUFWLFVBQVUsR0FBRztBQUN6QixVQUFRLEVBQUUsQ0FBQztFQUNYOztPQU1ZLFVBQVU7Ozs7Ozs7O1NBQVYsVUFBVSxHQUFWLFVBQVU7T0FZVixXQUFXLFdBQVgsV0FBVyxHQUFHOztBQUUxQixVQUFRLEVBQUUsQ0FBQzs7QUFFWCxRQUFNLEVBQUUsQ0FBQzs7QUFFVCxPQUFLLEVBQUUsQ0FBQzs7Ozs7OztBQVNSLE1BQUksRUFBRSxDQUFDOztBQUVQLE1BQUksRUFBRSxDQUFDOztBQUVQLEtBQUcsRUFBRSxDQUFDOztBQUVOLE1BQUksRUFBRSxDQUFDOztBQUVQLFdBQVMsRUFBRSxDQUFDO0VBQ1o7O09BTVksTUFBTTs7Ozs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTSIsImZpbGUiOiJNc0FzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2F0LCBvcElmfSBmcm9tICcuL3V0aWwnXG5cbi8qKlxuQW55IE1hc29uIEFTVC5cbkFsbCBBU1RzIGhhdmUgYSBgbG9jYCB0aGF0IHRoZXkgcGFzcyBvbiB0byB0aGUgZXNhc3QgZHVyaW5nIHtAbGluayB0cmFuc3BpbGV9LlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0LyoqIEB0eXBlIHtMb2N9ICovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vLyBMaW5lQ29udGVudFxuXHQvKipcblx0QW55IHZhbGlkIHBhcnQgb2YgYSBCbG9jay5cblx0Tm90ZSB0aGF0IHNvbWUge0BsaW5rIFZhbH1zIHdpbGwgc3RpbGwgY2F1c2Ugd2FybmluZ3MgaWYgdGhleSBhcHBlYXIgYXMgYSBsaW5lLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7fVxuXG5cdC8qKiBDYW4gb25seSBhcHBlYXIgYXMgbGluZXMgaW4gYSBCbG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIERvIGV4dGVuZHMgTGluZUNvbnRlbnQge31cblxuXHQvKiogQ2FuIGFwcGVhciBpbiBhbnkgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIFZhbCBleHRlbmRzIExpbmVDb250ZW50IHt9XG5cbi8vIE1vZHVsZVxuXHQvKiogV2hvbGUgc291cmNlIGZpbGUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0Tm90IHVzZWQgZm9yIGNvbXBpbGF0aW9uLCBidXQgdXNlZnVsIGZvciB0b29scy5cblx0XHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8SW1wb3J0RG8+fSAqL1xuXHRcdFx0dGhpcy5kb0ltcG9ydHMgPSBkb0ltcG9ydHNcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8SW1wb3J0Pn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0cyA9IGltcG9ydHNcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8RG8+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBpbXBvcnQgaW4gYW4gYGltcG9ydCFgIGJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0RG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHR9XG5cdH1cblxuXHQvKipcblx0U2luZ2xlIGltcG9ydCBpbiBhbiBgaW1wb3J0YCBibG9jay5cblx0SWYgcGF0aCBpcyAnZ2xvYmFsJywgdGhpcyBpcyB0cmFuc3BpbGVkIHNwZWNpYWxseSBiZWNhdXNlIHRoZXJlJ3Mgbm8gYWN0dWFsICdnbG9iYWwnIG1vZHVsZS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5pbXBvcnRlZCA9IGltcG9ydGVkXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0RGVmYXVsdCA9IG9wSW1wb3J0RGVmYXVsdFxuXHRcdH1cblx0fVxuXG4vLyBMb2NhbHNcblx0LyoqXG5cdEFsbCB7QGxpbmsgTG9jYWxBY2Nlc3N9ZXMgbXVzdCBoYXZlIHNvbWUgTG9jYWxEZWNsYXJlIHRvIGFjY2Vzcy5cblx0QWxsIGFjY2Vzc2libGUgaWRlbnRpZmllcnMgYXJlIHRoZXJlZm9yZSBMb2NhbERlY2xhcmVzLlxuXHRUaGlzIGluY2x1ZGVzIGltcG9ydHMsIGB0aGlzYCwgdGhlIGZvY3VzLCBldGMuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0LyoqIExvY2FsRGVjbGFyZSB3aXRoIG5vIHR5cGUuICovXG5cdFx0c3RhdGljIHVudHlwZWQobG9jLCBuYW1lLCBraW5kKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIGtpbmQpXG5cdFx0fVxuXG5cdFx0LyoqIExvY2FsRGVjbGFyZSBvZiBqdXN0IGEgbmFtZS4gKi9cblx0XHRzdGF0aWMgcGxhaW4obG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIExvY2FsRGVjbGFyZXMuRWFnZXIpXG5cdFx0fVxuXG5cdFx0c3RhdGljIGJ1aWx0KGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAnYnVpbHQnKVxuXHRcdH1cblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICdfJylcblx0XHR9XG5cdFx0c3RhdGljIHR5cGVkRm9jdXMobG9jLCB0eXBlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsICdfJywgdHlwZSwgTG9jYWxEZWNsYXJlcy5FYWdlcilcblx0XHR9XG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIG9wVHlwZSwga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmVzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblxuXHRcdGlzTGF6eSgpIHtcblx0XHRcdHJldHVybiB0aGlzLmtpbmQgPT09IExvY2FsRGVjbGFyZXMuTGF6eVxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZCBvZiB7QGxpbmsgTG9jYWxEZWNsYXJlfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IExvY2FsRGVjbGFyZXMgPSB7XG5cdFx0LyoqIERlY2xhcmVkIG5vcm1hbGx5LiAqL1xuXHRcdEVhZ2VyOiAwLFxuXHRcdC8qKiBEZWNsYXJlZCB3aXRoIGB+YWAuICovXG5cdFx0TGF6eTogMVxuXHR9XG5cblx0LyoqIEFjY2VzcyB0aGUgbG9jYWwgYG5hbWVgLiAqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxBY2Nlc3MgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAnXycpXG5cdFx0fVxuXG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7bmFtZX0gOj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIExvY2FsTXV0YXRlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQXNzaWduXG5cdC8qKiBBbnkgZXhwcmVzc2lvbiBjcmVhdGluZyBuZXcgbG9jYWxzLiAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduIGV4dGVuZHMgRG8ge1xuXHRcdC8qKlxuXHRcdEFsbCBsb2NhbHMgY3JlYXRlZCBieSB0aGUgYXNzaWduLlxuXHRcdEBhYnN0cmFjdFxuXHRcdCovXG5cdFx0YWxsQXNzaWduZWVzKCkge31cblx0fVxuXG5cdC8qKiBge2Fzc2lnbmVlfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduU2luZ2xlIGV4dGVuZHMgQXNzaWduIHtcblx0XHQvKiogQXNzaWduIHRvIGBfYC4gKi9cblx0XHRzdGF0aWMgZm9jdXMobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25TaW5nbGUobG9jLCBMb2NhbERlY2xhcmUuZm9jdXMobG9jKSwgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZSA9IGFzc2lnbmVlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKiBAb3ZlcnJpZGUgKi9cblx0XHRhbGxBc3NpZ25lZXMoKSB7IHJldHVybiBbdGhpcy5hc3NpZ25lZV0gfVxuXHR9XG5cblx0LyoqIGB7YXNzaWduZWVzfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduRGVzdHJ1Y3R1cmUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWVzLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZXMgPSBhc3NpZ25lZXNcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0S2luZCBvZiBsb2NhbHMgdGhpcyBhc3NpZ25zIHRvLlxuXHRcdEByZXR1cm4ge0xvY2FsRGVjbGFyZXN9XG5cdFx0Ki9cblx0XHRraW5kKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzWzBdLmtpbmRcblx0XHR9XG5cblx0XHQvKiogQG92ZXJyaWRlICovXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIEtpbmRzIG9mIHtAbGluayBNZW1iZXJTZXR9IGFuZCB7QGxpbmsgU2V0U3VifS4gKi9cblx0ZXhwb3J0IGNvbnN0IFNldHRlcnMgPSB7XG5cdFx0SW5pdDogMCxcblx0XHRNdXRhdGU6IDFcblx0fVxuXG5cdC8qKlxuXHRge29iamVjdH0ue25hbWV9OntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gXG5cdEFsc28gaGFuZGxlcyBge29iamVjdH0uXCJ7bmFtZX1cImAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJTZXQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIG5hbWUsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7U2V0dGVyc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7b2JqZWN0fVt7c3ViYmVkc31dOntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBTZXRTdWIgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIHN1YmJlZHMsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuc3ViYmVkcyA9IHN1YmJlZHNcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge1NldHRlcnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBFcnJvcnNcblx0LyoqIGB0aHJvdyEge29wVGhyb3dufWAgKi9cblx0ZXhwb3J0IGNsYXNzIFRocm93IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUaHJvd24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdC8qKiBgYXNzZXJ0IS9mb3JiaWQhIHtjb25kaXRpb259IHRocm93ISB7b3BUaHJvd259YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzZXJ0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmVnYXRlLCBjb25kaXRpb24sIG9wVGhyb3duKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdElmIHRydWUsIHRoaXMgaXMgYSBgZm9yYmlkIWAuXG5cdFx0XHRAdHlwZSB7Ym9vbGVhbn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5lZ2F0ZSA9IG5lZ2F0ZVxuXHRcdFx0LyoqXG5cdFx0XHRDb21waWxlZCBzcGVjaWFsbHkgaWYgYSB7QGxpbmsgQ2FsbH0uXG5cdFx0XHRAdHlwZSB7VmFsfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVGhyb3duID0gb3BUaHJvd25cblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgZXhjZXB0XG5cdFx0dHJ5XG5cdFx0XHR7dHJ5fVxuXHRcdGNhdGNoXG5cdFx0XHR7b3BDYXRjaH1cblx0XHRlbHNlXG5cdFx0XHR7b3BFbHNlfVxuXHRcdGZpbmFsbHlcblx0XHRcdHtvcEZpbmFsbHl9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHQgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBfdHJ5LCB0eXBlZENhdGNoZXMsIG9wQ2F0Y2hBbGwsIG9wRWxzZSwgb3BGaW5hbGx5KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy50cnkgPSBfdHJ5XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PENhdGNoPn0gKi9cblx0XHRcdHRoaXMudHlwZWRDYXRjaGVzID0gdHlwZWRDYXRjaGVzXG5cdFx0XHQvKipcblx0XHRcdG9wQ2F0Y2hBbGwuY2F1Z2h0IHNob3VsZCBoYXZlIG5vIHR5cGUuXG5cdFx0XHRAdHlwZSB7P0NhdGNofVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMub3BDYXRjaEFsbCA9IG9wQ2F0Y2hBbGxcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEZpbmFsbHkgPSBvcEZpbmFsbHlcblx0XHR9XG5cblx0XHRnZXQgYWxsQ2F0Y2hlcygpIHtcblx0XHRcdHJldHVybiBjYXQodGhpcy50eXBlZENhdGNoZXMsIHRoaXMub3BDYXRjaEFsbClcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgY2F0Y2gge2NhdWdodH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDYXRjaCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhdWdodCwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5jYXVnaHQgPSBjYXVnaHRcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gQmxvY2tcblx0LyoqIExpbmVzIGluIGFuIGluZGVudGVkIGJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2sgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudD59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogUGFydCBvZiBhIGJ1aWxkZXIuICovXG5cdGV4cG9ydCBjbGFzcyBCdWlsZEVudHJ5IGV4dGVuZHMgTXNBc3Qge31cblxuXHQvKiogUGFydCBvZiBhIHtAbGluayBCbG9ja09ian0uICovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeSBleHRlbmRzIEJ1aWxkRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYS4gYmBcblx0T2JqRW50cnkgdGhhdCBwcm9kdWNlcyBhIG5ldyBsb2NhbC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5QXNzaWduIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Fzc2lnbn0gKi9cblx0XHRcdHRoaXMuYXNzaWduID0gYXNzaWduXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9iakVudHJ5IHRoYXQgZG9lcyBub3QgaW50cm9kdWNlIGEgbmV3IGxvY2FsLiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlQbGFpbiBleHRlbmRzIE9iakVudHJ5IHtcblx0XHQvKipcblx0XHRge25hbWV9LmAgd2l0aCBubyB2YWx1ZS5cblx0XHRUYWtlcyBhIGxvY2FsIG9mIHRoZSBzYW1lIG5hbWUgZnJvbSBvdXRzaWRlLlxuXHRcdCovXG5cdFx0c3RhdGljIGFjY2Vzcyhsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIG5hbWUsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIG5hbWUpKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBuYW1lKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsICduYW1lJywgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgLiB7dmFsdWV9YCBvciBgLi4uIHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeSBleHRlbmRzIEJ1aWxkRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUsIGlzTWFueSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNNYW55ID0gaXNNYW55XG5cdFx0fVxuXHR9XG5cblx0LyoqIGBrZXlgIC0+IGB2YWxgICovXG5cdGV4cG9ydCBjbGFzcyBNYXBFbnRyeSBleHRlbmRzIEJ1aWxkRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5LCB2YWwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWwgPSB2YWxcblx0XHR9XG5cdH1cblxuLy8gQ29uZGl0aW9uYWxzXG5cdC8qKlxuXHRgYGBpZi91bmxlc3Mge3Rlc3R9XG5cdFx0e3Jlc3VsdH1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0LCBpc1VubGVzcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfFZhbH0gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbmQge3Rlc3R9IHtpZlRydWV9IHtpZkZhbHNlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENvbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgaWZUcnVlLCBpZkZhbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZlRydWUgPSBpZlRydWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZkZhbHNlID0gaWZGYWxzZVxuXHRcdH1cblx0fVxuXG4vLyBGdW5cblx0ZXhwb3J0IGNsYXNzIEZ1bkxpa2UgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncywgb3BSZXN0QXJnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wUmVzdEFyZyA9IG9wUmVzdEFyZ1xuXHRcdFx0Ly8gVE9ETzogb3BSZXR1cm5UeXBlIHNob3VsZCBiZSBjb21tb24gdG9vXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHw6e29wRGVjbGFyZVJlc30ge2FyZ3N9IC4uLntvcFJlc3RBcmd9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRnVuIGV4dGVuZHMgRnVuTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcHRzPXt9KSB7XG5cdFx0XHRzdXBlcihsb2MsIGFyZ3MsIG9wUmVzdEFyZylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdC8qKiBAdHlwZSB7RnVuc30gKi9cblx0XHRcdHRoaXMua2luZCA9IG9wdHMua2luZCB8fCBGdW5zLlBsYWluXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmVUaGlzfSAqL1xuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID0gb3BJZihvcHRzLmlzVGhpc0Z1biwgKCkgPT4gTG9jYWxEZWNsYXJlLnRoaXModGhpcy5sb2MpKVxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc0RvID0gb3B0cy5pc0RvIHx8IGZhbHNlXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wUmV0dXJuVHlwZSA9IG9wdHMub3BSZXR1cm5UeXBlIHx8IG51bGxcblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBGdW59LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgRnVucyA9IHtcblx0XHQvKiogUmVndWxhciBmdW5jdGlvbiAoYHxgKSAqL1xuXHRcdFBsYWluOiAwLFxuXHRcdC8qKiBgJHxgICovXG5cdFx0QXN5bmM6IDEsXG5cdFx0LyoqIGB+fGAgKi9cblx0XHRHZW5lcmF0b3I6IDJcblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBGdW5BYnN0cmFjdCBleHRlbmRzIEZ1bkxpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncywgb3BSZXN0QXJnLCBvcFJldHVyblR5cGUsIG9wQ29tbWVudCkge1xuXHRcdFx0c3VwZXIobG9jLCBhcmdzLCBvcFJlc3RBcmcpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wUmV0dXJuVHlwZSA9IG9wUmV0dXJuVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTWV0aG9kIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1bikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW5MaWtlfSAqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHR9XG5cdH1cblxuLy8gQXN5bmMgLyBHZW5lcmF0b3JcblxuXHQvKiogYCQge3ZhbHVlfSBgKi9cblx0ZXhwb3J0IGNsYXNzIEF3YWl0IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgeWllbGQge29wVmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgWWllbGQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BWYWx1ZT1udWxsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVmFsdWUgPSBvcFZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB5aWVsZCoge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFlpZWxkVG8gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIENsYXNzXG5cdGV4cG9ydCBjbGFzcyBLaW5kIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN1cGVyS2luZHMsIG9wQ29tbWVudD1udWxsLCBvcERvPW51bGwsIHN0YXRpY3M9W10sIG1ldGhvZHM9W10pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuc3VwZXJLaW5kcyA9IHN1cGVyS2luZHNcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUgez9DbGFzc0tpbmREb30gKi9cblx0XHRcdHRoaXMub3BEbyA9IG9wRG9cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5zdGF0aWNzID0gc3RhdGljc1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLm1ldGhvZHMgPSBtZXRob2RzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGNsYXNzIHtvcFN1cGVyQ2xhc3N9XG5cdFx0e29wQ29tbWVudH1cblx0XHRkbyFcblx0XHRcdHtvcERvfVxuXHRcdHN0YXRpY1xuXHRcdFx0e3N0YXRpY3N9XG5cdFx0e29wQ29uc3RydWN0b3J9XG5cdFx0e21ldGhvZHN9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDbGFzcyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRsb2MsIG9wU3VwZXJDbGFzcywga2luZHMsXG5cdFx0XHRvcENvbW1lbnQ9bnVsbCwgb3BEbz1udWxsLCBzdGF0aWNzPVtdLCBvcENvbnN0cnVjdG9yPW51bGwsIG1ldGhvZHM9W10pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BTdXBlckNsYXNzID0gb3BTdXBlckNsYXNzXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLmtpbmRzID0ga2luZHNcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUgez9DbGFzc0tpbmREb30gKi9cblx0XHRcdHRoaXMub3BEbyA9IG9wRG9cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5zdGF0aWNzID0gc3RhdGljc1xuXHRcdFx0LyoqIEB0eXBlIHs/Q29uc3RydWN0b3J9ICovXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IgPSBvcENvbnN0cnVjdG9yXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMubWV0aG9kcyA9IG1ldGhvZHNcblx0XHR9XG5cdH1cblxuXHQvKiogYGRvIWAgcGFydCBvZiB7QGxpbmsgQ2xhc3N9IG9yIHtAbGluayBLaW5kfS4gKi9cblx0ZXhwb3J0IGNsYXNzIENsYXNzS2luZERvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlRm9jdXN9ICovXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBjb25zdHJ1Y3QhIHtmdW59YCAqL1xuXHRleHBvcnQgY2xhc3MgQ29uc3RydWN0b3IgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBmdW4sIG1lbWJlckFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7RnVufSAqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubWVtYmVyQXJncyA9IG1lbWJlckFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogQW55IHBhcnQgb2Yge0BsaW5rIENsYXNzLnN0YXRpY3N9IG9yIHtAbGluayBDbGFzcy5tZXRob2RzfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGxMaWtlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdFVzZWQgYnkgdG9vbHMuXG5cdFx0XHRAdHlwZSB7Ym9vbGVhbn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmlzTXkgPSBpc015XG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMuc3ltYm9sID0gc3ltYm9sXG5cdFx0fVxuXHR9XG5cdC8qKiBge3N5bWJvbH0ge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sLCBmdW4pIHtcblx0XHRcdHN1cGVyKGxvYywgaXNNeSwgc3ltYm9sKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW59ICovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgZ2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kR2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jLCBpc015LCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gTG9jYWxEZWNsYXJlLnRoaXMobG9jKVxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgc2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kU2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jLCBpc015LCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gTG9jYWxEZWNsYXJlLnRoaXMobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBMb2NhbERlY2xhcmUuZm9jdXMobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgc3VwZXIge2FyZ3N9YC5cblx0TmV2ZXIgYSB7QGxpbmsgU3VwZXJNZW1iZXJ9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3VwZXJDYWxsIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcHJlYWQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgc3VwZXIue25hbWV9YCBvciBgc3VwZXIuXCJ7bmFtZX1cImAuICovXG5cdGV4cG9ydCBjbGFzcyBTdXBlck1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuLy8gQ2FsbHNcblx0LyoqIGB7Y2FsbGVkfSB7YXJnc31gICovXG5cdGV4cG9ydCBjbGFzcyBDYWxsIGV4dGVuZHMgVmFsIHtcblx0XHQvKiogYHt0ZXN0ZWR9Ont0ZXN0VHlwZX1gICovXG5cdFx0c3RhdGljIGNvbnRhaW5zKGxvYywgdGVzdFR5cGUsIHRlc3RlZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5Db250YWlucyksIFt0ZXN0VHlwZSwgdGVzdGVkXSlcblx0XHR9XG5cblx0XHQvKiogYHtzdWJiZWR9W3thcmdzfV1gICovXG5cdFx0c3RhdGljIHN1Yihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5TdWIpLCBjYXQoc3ViYmVkLCBhcmdzKSlcblx0XHR9XG5cblx0XHQvKiogYGRlbCEge3N1YmJlZH1be2FyZ3N9XWAgKi9cblx0XHRzdGF0aWMgZGVsU3ViKGxvYywgc3ViYmVkLCBhcmdzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNwZWNpYWxWYWxzLkRlbFN1YiksIGNhdChzdWJiZWQsIGFyZ3MpKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2FsbGVkLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwcmVhZD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBuZXcge3R5cGV9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgU3ByZWFkfSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgLi4ue3NwcmVhZGVkfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFNwcmVhZCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHNwcmVhZGVkKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3ByZWFkZWQgPSBzcHJlYWRlZFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgfnt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMYXp5IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdC8qKiBgY2FzZWAgKi9cblx0ZXhwb3J0IGNsYXNzIENhc2UgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdEFzc2lnbmVlIGlzIGFsd2F5cyBhIExvY2FsRGVjbGFyZUZvY3VzLlxuXHRcdFx0QHR5cGUgez9Bc3NpZ25TaW5nbGV9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqIFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIENhc2V9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2FzZVBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgUGF0dGVybn0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgOnt0eXBlfSB7bG9jYWxzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFBhdHRlcm4gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBsb2NhbHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5sb2NhbHMgPSBsb2NhbHNcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxBY2Nlc3N9ICovXG5cdFx0XHR0aGlzLnBhdHRlcm5lZCA9IExvY2FsQWNjZXNzLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuLy8gU3dpdGNoXG5cdC8qKiBgc3dpdGNoYCAqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFN3aXRjaFBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9ICBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2t9ICovXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXHQvKipcblx0U2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgU3dpdGNofS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcywgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cbi8vIEZvclxuXHQvKiogYGZvcmAgKi9cblx0ZXhwb3J0IGNsYXNzIEZvciBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgJGZvciB7b3BJdGVyYXRlZX1cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEZvckFzeW5jIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGl0ZXJhdGVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtJdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMuaXRlcmF0ZWUgPSBpdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgQGZvcmBcblx0Q29udGFpbnMgbWFueSB7QGxpbmsgQmFnRW50cnl9IGFuZCB7QGxpbmsgQmFnRW50cnlNYW55fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEZvckJhZyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcEl0ZXJhdGVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/SXRlcmF0ZWV9ICovXG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHR9XG5cdH1cblxuXHQvKiogYHggaW4geWAgb3IganVzdCBgeWAgKHdoZXJlIHRoZSBsb2NhbCBpcyBpbXBsaWNpdGx5IGBfYCkuICovXG5cdGV4cG9ydCBjbGFzcyBJdGVyYXRlZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGVsZW1lbnQsIGJhZykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuYmFnID0gYmFnXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBicmVha2AgKi9cblx0ZXhwb3J0IGNsYXNzIEJyZWFrIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BWYWx1ZT1udWxsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVmFsdWUgPSBvcFZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIE1pc2NlbGxhbmVvdXMgVmFsc1xuXHQvKipcblx0QSBibG9jayBhcHBlYXJpbmcgb24gaXRzIG93biAobm90IGFzIHRoZSBibG9jayB0byBhbiBgaWZgIG9yIHRoZSBsaWtlKVxuXHRpcyBwdXQgaW50byBvbmUgb2YgdGhlc2UuXG5cdGUuZy46XG5cblx0XHR4ID1cblx0XHRcdHkgPSAxXG5cdFx0XHR5XG5cdCovXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1dyYXAgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKiogT25lLWxpbmUgQCBleHByZXNzaW9uLCBzdWNoIGFzIGBbIDEgMiAzIF1gLiAqL1xuXHRleHBvcnQgY2xhc3MgQmFnU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogT25lLWxpbmUgb2JqZWN0IGV4cHJlc3Npb24sIHN1Y2ggYXMgYChhLiAxIGIuIDIpYC4gKi9cblx0ZXhwb3J0IGNsYXNzIE9ialNpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYWlycykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxPYmpQYWlyPn0gKi9cblx0XHRcdHRoaXMucGFpcnMgPSBwYWlyc1xuXHRcdH1cblx0fVxuXHQvKiogUGFydCBvZiBhbiB7QGxpbmsgT2JqU2ltcGxlfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE9ialBhaXIgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXksIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgYW5kYCBvciBgb3JgIGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBMb2dpYyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvZ2ljc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBMb2dpY30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBMb2dpY3MgPSB7XG5cdFx0LyoqIGBhbmRgIGtleXdvcmQqL1xuXHRcdEFuZDogMCxcblx0XHQvKiogYG9yYCBrZXl3b3JkICovXG5cdFx0T3I6IDFcblx0fVxuXG5cdC8qKiBgbm90YCBrZXl3b3JkICovXG5cdGV4cG9ydCBjbGFzcyBOb3QgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuYXJnID0gYXJnXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdExpdGVyYWwgbnVtYmVyIHZhbHVlLlxuXHRUaGlzIGlzIGJvdGggYSBUb2tlbiBhbmQgTXNBc3QuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBOdW1iZXJMaXRlcmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdFN0b3JlIGFzIGEgc3RyaW5nIHNvIHdlIGNhbiBkaXN0aW5ndWlzaCBgMHhmYCBhbmQgYDE1YC5cblx0XHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0QG92ZXJyaWRlXG5cdFx0U2luY2UgdGhpcyBpcyB1c2VkIGFzIGEgVG9rZW4sIGl0IG11c3QgaW1wbGVtZW50IHRvU3RyaW5nLlxuXHRcdCovXG5cdFx0dG9TdHJpbmcoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy52YWx1ZS50b1N0cmluZygpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7b2JqZWN0fS57bmFtZX1gIG9yIGB7b2JqZWN0fS5cIntuYW1lfVwiYC4gKi9cblx0ZXhwb3J0IGNsYXNzIE1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKlxuXHRcdFx0SWYgYSBzdHJpbmcsIGNvdWxkIHN0aWxsIGJlIGFueSBzdHJpbmcsIHNvIG1heSBzdGlsbCBjb21waWxlIHRvIGBhWydzdHJpbmcnXWAuXG5cdFx0XHRAdHlwZSB7c3RyaW5nIHwgVmFsfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKioge0BsaW5rIFF1b3RlfSBvciB7QGxpbmsgUXVvdGVTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVBYnN0cmFjdCBleHRlbmRzIFZhbCB7fVxuXG5cdC8qKlxuXHRRdW90ZWQgdGV4dC4gQWx3YXlzIGNvbXBpbGVzIHRvIGEgdGVtcGxhdGUgc3RyaW5nLlxuXHRGb3IgdGFnZ2VkIHRlbXBsYXRlcywgdXNlIHtAbGluayBRdW90ZVRhZ2dlZFRlbXBsYXRlfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlUGxhaW4gZXh0ZW5kcyBRdW90ZUFic3RyYWN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdGBwYXJ0c2AgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdFx0cGFydCBTdHJpbmdzIGFyZSByYXcgdmFsdWVzLCBtZWFuaW5nIFwiXFxuXCIgaXMgdHdvIGNoYXJhY3RlcnMuXG5cdFx0XHRTaW5jZSBcIlxce1wiIGlzIHNwZWNpYWwgdG8gTWFzb24sIHRoYXQncyBvbmx5IG9uZSBjaGFyYWN0ZXIuXG5cdFx0XHRAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogYHt0YWd9XCJ7cXVvdGV9XCJgICovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRhZ2dlZFRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZywgcXVvdGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdC8qKiBAdHlwZSB7UXVvdGV9ICovXG5cdFx0XHR0aGlzLnF1b3RlID0gcXVvdGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YCd7bmFtZX1gLlxuXHRRdW90ZSBjb25zaXN0aW5nIG9mIGEgc2luZ2xlIG5hbWUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVNpbXBsZSBleHRlbmRzIFF1b3RlQWJzdHJhY3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHBpcGUge3ZhbHVlfVxuXHRcdHtwaXBlc31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFBpcGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUsIHBpcGVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5waXBlcyA9IHBpcGVzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHdpdGgge3ZhbHVlfSBbYXMge2RlY2xhcmV9XVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFdpdGggZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZSwgdmFsdWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZGVjbGFyZSA9IGRlY2xhcmVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAme25hbWV9YCBvciBgLiZ7bmFtZX1gIG9yIGB7b2JqZWN0fS4me25hbWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wT2JqZWN0LCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wT2JqZWN0ID0gb3BPYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgJi57bmFtZX1gICovXG5cdGV4cG9ydCBjbGFzcyBHZXR0ZXJGdW4gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAmKHt2YWx1ZX0pYCAqL1xuXHRleHBvcnQgY2xhc3MgU2ltcGxlRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge3N0YXJ0fS4ue2VuZH1gIG9yIGB7c3RhcnR9Li4ue2VuZH1gLiAqL1xuXHRleHBvcnQgY2xhc3MgUmFuZ2UgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3RhcnQsIGVuZCwgaXNFeGNsdXNpdmUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zdGFydCA9IHN0YXJ0XG5cdFx0XHQvKipcblx0XHRcdElmIG51bGwsIHRoaXMgaXMgYW4gaW5maW5pdGUgUmFuZ2UuXG5cdFx0XHRAdHlwZSB7P1ZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmVuZCA9IGVuZFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc0V4Y2x1c2l2ZSA9IGlzRXhjbHVzaXZlXG5cdFx0fVxuXHR9XG5cbi8vIFNwZWNpYWxcblx0LyoqXG5cdEEgc3BlY2lhbCBhY3Rpb24uXG5cdEFsbCBTcGVjaWFsRG9zIGFyZSBhdG9taWMgYW5kIGRvIG5vdCByZWx5IG9uIGNvbnRleHQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxEb3N9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbERvfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IFNwZWNpYWxEb3MgPSB7XG5cdFx0RGVidWdnZXI6IDBcblx0fVxuXG5cdC8qKlxuXHRBIHNwZWNpYWwgZXhwcmVzc2lvbi5cblx0QWxsIFNwZWNpYWxWYWxzIGFyZSBhdG9taWMgYW5kIGRvIG5vdCByZWx5IG9uIGNvbnRleHQuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7U3BlY2lhbFZhbHN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBTcGVjaWFsVmFsfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IFNwZWNpYWxWYWxzID0ge1xuXHRcdC8qKiBgX21zLmNvbnRhaW5zYCB1c2VkIGZvciB7QGxpbmsgQ2FsbC5jb250YWluc30gKi9cblx0XHRDb250YWluczogMCxcblx0XHQvKiogYF9tcy5kZWxTdWJgIHVzZWQgZm9yIHtAbGluayBDYWxsLmRlbFN1Yn0gKi9cblx0XHREZWxTdWI6IDEsXG5cdFx0LyoqIGBmYWxzZWAgbGl0ZXJhbCAqL1xuXHRcdEZhbHNlOiAyLFxuXHRcdC8qKlxuXHRcdGBuYW1lYCB2YWx1ZSBpcyB0aGUgbmFtZSBvZiB0aGUgbmVhcmVzdCBhc3NpZ25lZCB2YWx1ZS4gSW46XG5cblx0XHRcdHggPSBuZXcgTWV0aG9kXG5cdFx0XHRcdG5hbWUuXG5cblx0XHRgbmFtZWAgd2lsbCBiZSBcInhcIi5cblx0XHQqL1xuXHRcdE5hbWU6IDMsXG5cdFx0LyoqIGBudWxsYCBsaXRlcmFsICovXG5cdFx0TnVsbDogNCxcblx0XHQvKiogYF9tcy5zdWJgIHVzZWQgZm9yIHtAbGluayBDYWxsLnN1Yn0gKi9cblx0XHRTdWI6IDUsXG5cdFx0LyoqIGB0cnVlYCBsaXRlcmFsICovXG5cdFx0VHJ1ZTogNixcblx0XHQvKiogYHZvaWQgMGAgKi9cblx0XHRVbmRlZmluZWQ6IDdcblx0fVxuXG5cdC8qKlxuXHRgaWdub3JlYCBzdGF0ZW1lbnQuXG5cdEtlZXBzIHRoZSBjb21waWxlciBmcm9tIGNvbXBsYWluaW5nIGFib3V0IGFuIHVudXNlZCBsb2NhbC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIElnbm9yZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGlnbm9yZWROYW1lcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxzdHJpbmc+fSAqL1xuXHRcdFx0dGhpcy5pZ25vcmVkTmFtZXMgPSBpZ25vcmVkTmFtZXNcblx0XHR9XG5cdH1cbiJdfQ==
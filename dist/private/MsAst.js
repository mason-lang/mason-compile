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
	exports.Ignore = exports.SpecialVals = exports.SpecialVal = exports.SpecialDos = exports.SpecialDo = exports.Del = exports.Sub = exports.InstanceOf = exports.Range = exports.SimpleFun = exports.GetterFun = exports.MemberFun = exports.With = exports.Pipe = exports.QuoteSimple = exports.QuoteTaggedTemplate = exports.QuotePlain = exports.QuoteAbstract = exports.MsRegExp = exports.Member = exports.NumberLiteral = exports.Not = exports.Logics = exports.Logic = exports.ObjPair = exports.ObjSimple = exports.BagSimple = exports.BlockWrap = exports.Break = exports.Iteratee = exports.ForBag = exports.ForAsync = exports.For = exports.SwitchPart = exports.Switch = exports.Pattern = exports.CasePart = exports.Case = exports.Lazy = exports.Spread = exports.New = exports.Call = exports.SuperMember = exports.SuperCall = exports.MethodSetter = exports.MethodGetter = exports.MethodImpl = exports.MethodImplLike = exports.Constructor = exports.ClassKindDo = exports.Class = exports.Kind = exports.YieldTo = exports.Yield = exports.Await = exports.Method = exports.FunAbstract = exports.Funs = exports.Fun = exports.FunLike = exports.Cond = exports.Conditional = exports.MapEntry = exports.BagEntry = exports.ObjEntryPlain = exports.ObjEntryAssign = exports.ObjEntry = exports.BuildEntry = exports.Block = exports.Catch = exports.Except = exports.Assert = exports.Throw = exports.SetSub = exports.MemberSet = exports.Setters = exports.AssignDestructure = exports.AssignSingle = exports.Assign = exports.LocalMutate = exports.LocalAccess = exports.LocalDeclares = exports.LocalDeclare = exports.Import = exports.ImportDo = exports.Module = exports.Val = exports.Do = exports.LineContent = undefined;

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

			var _applyDefaults = (0, _util.applyDefaults)(opts, {
				kind: Funs.Plain,
				isThisFun: false,
				isDo: false,
				opReturnType: null
			});

			const kind = _applyDefaults.kind;
			const isThisFun = _applyDefaults.isThisFun;
			const isDo = _applyDefaults.isDo;
			const opReturnType = _applyDefaults.opReturnType;
			super(loc, args, opRestArg);
			this.block = block;
			this.kind = kind;
			this.opDeclareThis = (0, _util.opIf)(isThisFun, () => LocalDeclare.this(this.loc));
			this.isDo = isDo || false;
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

	class MsRegExp extends Val {
		constructor(loc, parts) {
			let flags = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
			super(loc);
			this.parts = parts;
			this.flags = flags;
		}

	}

	exports.MsRegExp = MsRegExp;

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

	class InstanceOf extends Val {
		constructor(loc, instance, type) {
			super(loc);
			this.instance = instance;
			this.type = type;
		}

	}

	exports.InstanceOf = InstanceOf;

	class Sub extends Val {
		constructor(loc, subbed, args) {
			super(loc);
			this.subbed = subbed;
			this.args = args;
		}

	}

	exports.Sub = Sub;

	class Del extends LineContent {
		constructor(loc, subbed, args) {
			super(loc);
			this.subbed = subbed;
			this.args = args;
		}

	}

	exports.Del = Del;

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
	};

	class Ignore extends Do {
		constructor(loc, ignoredNames) {
			super(loc);
			this.ignoredNames = ignoredNames;
		}

	}

	exports.Ignore = Ignore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BUXFCLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FZWixXQUFXOztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQUdYLEVBQUU7O1NBQUYsRUFBRSxHQUFGLEVBQUU7O09BR0YsR0FBRzs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FJSCxNQUFNOzs7Ozs7Ozs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTTs7T0FvQk4sUUFBUTs7Ozs7Ozs7U0FBUixRQUFRLEdBQVIsUUFBUTs7T0FZUixNQUFNOzs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQVosWUFBWSxHQUFaLFlBQVk7T0EwQ1osYUFBYSxXQUFiLGFBQWEsR0FBRzs7QUFFNUIsT0FBSyxFQUFFLENBQUM7O0FBRVIsTUFBSSxFQUFFLENBQUM7RUFDUDs7T0FHWSxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BaUJYLFdBQVc7Ozs7Ozs7OztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQVlYLE1BQU07Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09BU04sWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTs7T0FxQlosaUJBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztTQUFqQixpQkFBaUIsR0FBakIsaUJBQWlCO09Bd0JqQixPQUFPLFdBQVAsT0FBTyxHQUFHO0FBQ3RCLE1BQUksRUFBRSxDQUFDO0FBQ1AsUUFBTSxFQUFFLENBQUM7RUFDVDs7T0FNWSxTQUFTOzs7Ozs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FpQlQsTUFBTTs7Ozs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLEtBQUs7Ozs7Ozs7O1NBQUwsS0FBSyxHQUFM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LEdBQUosSUFBSTs7T0FjSixJQUFJOzs7Ozs7Ozs7O1NBQUosSUFBSSxHQUFKLElBQUk7O09BYUosU0FBUzs7Ozs7Ozs7O1NBQVQsU0FBUyxHQUFULFNBQVM7O09BV1QsU0FBUzs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FTVCxTQUFTOzs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTOztPQVNULEtBQUs7Ozs7Ozs7Ozs7U0FBTCxLQUFLLEdBQUwsS0FBSzs7T0FpQkwsVUFBVTs7Ozs7Ozs7O1NBQVYsVUFBVSxHQUFWLFVBQVU7O09BV1YsR0FBRzs7Ozs7Ozs7O1NBQUgsR0FBRyxHQUFILEdBQUc7O09BV0gsR0FBRzs7Ozs7Ozs7O1NBQUgsR0FBRyxHQUFILEdBQUc7O09BY0gsU0FBUzs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUztPQVdULFVBQVUsV0FBVixVQUFVLEdBQUc7QUFDekIsVUFBUSxFQUFFLENBQUM7RUFDWDs7T0FNWSxVQUFVOzs7Ozs7OztTQUFWLFVBQVUsR0FBVixVQUFVO09BWVYsV0FBVyxXQUFYLFdBQVcsR0FBRzs7QUFFMUIsT0FBSyxFQUFFLENBQUM7Ozs7Ozs7QUFTUixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxNQUFJLEVBQUUsQ0FBQzs7QUFFUCxNQUFJLEVBQUUsQ0FBQzs7QUFFUCxXQUFTLEVBQUUsQ0FBQztFQUNaOztPQU1ZLE1BQU07Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU0iLCJmaWxlIjoiTXNBc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBpbmRlbnQgKi9cblxuaW1wb3J0IHthcHBseURlZmF1bHRzLCBjYXQsIG9wSWZ9IGZyb20gJy4vdXRpbCdcblxuLyoqXG5BbnkgTWFzb24gQVNULlxuQWxsIEFTVHMgaGF2ZSBhIGBsb2NgIHRoYXQgdGhleSBwYXNzIG9uIHRvIHRoZSBlc2FzdCBkdXJpbmcge0BsaW5rIHRyYW5zcGlsZX0uXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXNBc3Qge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHQvKiogQHR5cGUge0xvY30gKi9cblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8vIExpbmVDb250ZW50XG5cdC8qKlxuXHRBbnkgdmFsaWQgcGFydCBvZiBhIEJsb2NrLlxuXHROb3RlIHRoYXQgc29tZSB7QGxpbmsgVmFsfXMgd2lsbCBzdGlsbCBjYXVzZSB3YXJuaW5ncyBpZiB0aGV5IGFwcGVhciBhcyBhIGxpbmUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBMaW5lQ29udGVudCBleHRlbmRzIE1zQXN0IHt9XG5cblx0LyoqIENhbiBvbmx5IGFwcGVhciBhcyBsaW5lcyBpbiBhIEJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgRG8gZXh0ZW5kcyBMaW5lQ29udGVudCB7fVxuXG5cdC8qKiBDYW4gYXBwZWFyIGluIGFueSBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgVmFsIGV4dGVuZHMgTGluZUNvbnRlbnQge31cblxuLy8gTW9kdWxlXG5cdC8qKiBXaG9sZSBzb3VyY2UgZmlsZS4gKi9cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIG9wQ29tbWVudCwgZG9JbXBvcnRzLCBpbXBvcnRzLCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHROb3QgdXNlZCBmb3IgY29tcGlsYXRpb24sIGJ1dCB1c2VmdWwgZm9yIHRvb2xzLlxuXHRcdFx0QHR5cGUge3N0cmluZ31cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxJbXBvcnREbz59ICovXG5cdFx0XHR0aGlzLmRvSW1wb3J0cyA9IGRvSW1wb3J0c1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxJbXBvcnQ+fSAqL1xuXHRcdFx0dGhpcy5pbXBvcnRzID0gaW1wb3J0c1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxEbz59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogU2luZ2xlIGltcG9ydCBpbiBhbiBgaW1wb3J0IWAgYmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnREbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGgpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRTaW5nbGUgaW1wb3J0IGluIGFuIGBpbXBvcnRgIGJsb2NrLlxuXHRJZiBwYXRoIGlzICdnbG9iYWwnLCB0aGlzIGlzIHRyYW5zcGlsZWQgc3BlY2lhbGx5IGJlY2F1c2UgdGhlcmUncyBubyBhY3R1YWwgJ2dsb2JhbCcgbW9kdWxlLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGF0aCwgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmltcG9ydGVkID0gaW1wb3J0ZWRcblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMub3BJbXBvcnREZWZhdWx0ID0gb3BJbXBvcnREZWZhdWx0XG5cdFx0fVxuXHR9XG5cbi8vIExvY2Fsc1xuXHQvKipcblx0QWxsIHtAbGluayBMb2NhbEFjY2Vzc31lcyBtdXN0IGhhdmUgc29tZSBMb2NhbERlY2xhcmUgdG8gYWNjZXNzLlxuXHRBbGwgYWNjZXNzaWJsZSBpZGVudGlmaWVycyBhcmUgdGhlcmVmb3JlIExvY2FsRGVjbGFyZXMuXG5cdFRoaXMgaW5jbHVkZXMgaW1wb3J0cywgYHRoaXNgLCB0aGUgZm9jdXMsIGV0Yy5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZSBleHRlbmRzIE1zQXN0IHtcblx0XHQvKiogTG9jYWxEZWNsYXJlIHdpdGggbm8gdHlwZS4gKi9cblx0XHRzdGF0aWMgdW50eXBlZChsb2MsIG5hbWUsIGtpbmQpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwga2luZClcblx0XHR9XG5cblx0XHQvKiogTG9jYWxEZWNsYXJlIG9mIGp1c3QgYSBuYW1lLiAqL1xuXHRcdHN0YXRpYyBwbGFpbihsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwgTG9jYWxEZWNsYXJlcy5FYWdlcilcblx0XHR9XG5cblx0XHRzdGF0aWMgYnVpbHQobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICdidWlsdCcpXG5cdFx0fVxuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ18nKVxuXHRcdH1cblx0XHRzdGF0aWMgdHlwZWRGb2N1cyhsb2MsIHR5cGUpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgJ18nLCB0eXBlLCBMb2NhbERlY2xhcmVzLkVhZ2VyKVxuXHRcdH1cblx0XHRzdGF0aWMgdGhpcyhsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgb3BUeXBlLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZXN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXG5cdFx0aXNMYXp5KCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTG9jYWxEZWNsYXJlcy5MYXp5XG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kIG9mIHtAbGluayBMb2NhbERlY2xhcmV9LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgTG9jYWxEZWNsYXJlcyA9IHtcblx0XHQvKiogRGVjbGFyZWQgbm9ybWFsbHkuICovXG5cdFx0RWFnZXI6IDAsXG5cdFx0LyoqIERlY2xhcmVkIHdpdGggYH5hYC4gKi9cblx0XHRMYXp5OiAxXG5cdH1cblxuXHQvKiogQWNjZXNzIHRoZSBsb2NhbCBgbmFtZWAuICovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbEFjY2VzcyBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGZvY3VzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICdfJylcblx0XHR9XG5cblx0XHRzdGF0aWMgdGhpcyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAndGhpcycpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtuYW1lfSA6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxNdXRhdGUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBBc3NpZ25cblx0LyoqIEFueSBleHByZXNzaW9uIGNyZWF0aW5nIG5ldyBsb2NhbHMuICovXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ24gZXh0ZW5kcyBEbyB7XG5cdFx0LyoqXG5cdFx0QWxsIGxvY2FscyBjcmVhdGVkIGJ5IHRoZSBhc3NpZ24uXG5cdFx0QGFic3RyYWN0XG5cdFx0Ki9cblx0XHRhbGxBc3NpZ25lZXMoKSB7fVxuXHR9XG5cblx0LyoqIGB7YXNzaWduZWV9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25TaW5nbGUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdC8qKiBBc3NpZ24gdG8gYF9gLiAqL1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmFzc2lnbmVlID0gYXNzaWduZWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqIEBvdmVycmlkZSAqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHtcblx0XHRcdHJldHVybiBbdGhpcy5hc3NpZ25lZV1cblx0XHR9XG5cdH1cblxuXHQvKiogYHthc3NpZ25lZXN9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25EZXN0cnVjdHVyZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZXMsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmFzc2lnbmVlcyA9IGFzc2lnbmVlc1xuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKipcblx0XHRLaW5kIG9mIGxvY2FscyB0aGlzIGFzc2lnbnMgdG8uXG5cdFx0QHJldHVybiB7TG9jYWxEZWNsYXJlc31cblx0XHQqL1xuXHRcdGtpbmQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hc3NpZ25lZXNbMF0ua2luZFxuXHRcdH1cblxuXHRcdC8qKiBAb3ZlcnJpZGUgKi9cblx0XHRhbGxBc3NpZ25lZXMoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hc3NpZ25lZXNcblx0XHR9XG5cdH1cblxuXHQvKiogS2luZHMgb2Yge0BsaW5rIE1lbWJlclNldH0gYW5kIHtAbGluayBTZXRTdWJ9LiAqL1xuXHRleHBvcnQgY29uc3QgU2V0dGVycyA9IHtcblx0XHRJbml0OiAwLFxuXHRcdE11dGF0ZTogMVxuXHR9XG5cblx0LyoqXG5cdGB7b2JqZWN0fS57bmFtZX06e29wVHlwZX0gPS86PS86Oj0ge3ZhbHVlfWBcblx0QWxzbyBoYW5kbGVzIGB7b2JqZWN0fS5cIntuYW1lfVwiYC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE1lbWJlclNldCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCwgbmFtZSwgb3BUeXBlLCBraW5kLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtTZXR0ZXJzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtvYmplY3R9W3tzdWJiZWRzfV06e29wVHlwZX0gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFNldFN1YiBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCwgc3ViYmVkcywgb3BUeXBlLCBraW5kLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5zdWJiZWRzID0gc3ViYmVkc1xuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7U2V0dGVyc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIEVycm9yc1xuXHQvKiogYHRocm93ISB7b3BUaHJvd259YCAqL1xuXHRleHBvcnQgY2xhc3MgVGhyb3cgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFRocm93bikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFRocm93biA9IG9wVGhyb3duXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBhc3NlcnQhL2ZvcmJpZCEge2NvbmRpdGlvbn0gdGhyb3chIHtvcFRocm93bn1gICovXG5cdGV4cG9ydCBjbGFzcyBBc3NlcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuZWdhdGUsIGNvbmRpdGlvbiwgb3BUaHJvd24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0SWYgdHJ1ZSwgdGhpcyBpcyBhIGBmb3JiaWQhYC5cblx0XHRcdEB0eXBlIHtib29sZWFufVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmVnYXRlID0gbmVnYXRlXG5cdFx0XHQvKipcblx0XHRcdENvbXBpbGVkIHNwZWNpYWxseSBpZiBhIHtAbGluayBDYWxsfS5cblx0XHRcdEB0eXBlIHtWYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5jb25kaXRpb24gPSBjb25kaXRpb25cblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBleGNlcHRcblx0XHR0cnlcblx0XHRcdHt0cnl9XG5cdFx0Y2F0Y2hcblx0XHRcdHtvcENhdGNofVxuXHRcdGVsc2Vcblx0XHRcdHtvcEVsc2V9XG5cdFx0ZmluYWxseVxuXHRcdFx0e29wRmluYWxseX1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEV4Y2VwdCBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIF90cnksIHR5cGVkQ2F0Y2hlcywgb3BDYXRjaEFsbCwgb3BFbHNlLCBvcEZpbmFsbHkpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLnRyeSA9IF90cnlcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8Q2F0Y2g+fSAqL1xuXHRcdFx0dGhpcy50eXBlZENhdGNoZXMgPSB0eXBlZENhdGNoZXNcblx0XHRcdC8qKlxuXHRcdFx0b3BDYXRjaEFsbC5jYXVnaHQgc2hvdWxkIGhhdmUgbm8gdHlwZS5cblx0XHRcdEB0eXBlIHs/Q2F0Y2h9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhdGNoQWxsID0gb3BDYXRjaEFsbFxuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2t9ICovXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2t9ICovXG5cdFx0XHR0aGlzLm9wRmluYWxseSA9IG9wRmluYWxseVxuXHRcdH1cblxuXHRcdGdldCBhbGxDYXRjaGVzKCkge1xuXHRcdFx0cmV0dXJuIGNhdCh0aGlzLnR5cGVkQ2F0Y2hlcywgdGhpcy5vcENhdGNoQWxsKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBjYXRjaCB7Y2F1Z2h0fVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENhdGNoIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2F1Z2h0LCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmNhdWdodCA9IGNhdWdodFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG4vLyBCbG9ja1xuXHQvKiogTGluZXMgaW4gYW4gaW5kZW50ZWQgYmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBCbG9jayBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExpbmVDb250ZW50Pn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBQYXJ0IG9mIGEgYnVpbGRlci4gKi9cblx0ZXhwb3J0IGNsYXNzIEJ1aWxkRW50cnkgZXh0ZW5kcyBNc0FzdCB7fVxuXG5cdC8qKiBQYXJ0IG9mIGEge0BsaW5rIEJsb2NrT2JqfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5IGV4dGVuZHMgQnVpbGRFbnRyeSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBhLiBiYFxuXHRPYmpFbnRyeSB0aGF0IHByb2R1Y2VzIGEgbmV3IGxvY2FsLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlBc3NpZ24gZXh0ZW5kcyBPYmpFbnRyeSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXNzaWdufSAqL1xuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblxuXHQvKiogT2JqRW50cnkgdGhhdCBkb2VzIG5vdCBpbnRyb2R1Y2UgYSBuZXcgbG9jYWwuICovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeVBsYWluIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdC8qKlxuXHRcdGB7bmFtZX0uYCB3aXRoIG5vIHZhbHVlLlxuXHRcdFRha2VzIGEgbG9jYWwgb2YgdGhlIHNhbWUgbmFtZSBmcm9tIG91dHNpZGUuXG5cdFx0Ki9cblx0XHRzdGF0aWMgYWNjZXNzKGxvYywgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgbmFtZSwgbmV3IExvY2FsQWNjZXNzKGxvYywgbmFtZSkpXG5cdFx0fVxuXG5cdFx0c3RhdGljIG5hbWUobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgJ25hbWUnLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAuIHt2YWx1ZX1gIG9yIGAuLi4ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5IGV4dGVuZHMgQnVpbGRFbnRyeSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSwgaXNNYW55KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc01hbnkgPSBpc01hbnlcblx0XHR9XG5cdH1cblxuXHQvKiogYGtleWAgLT4gYHZhbGAgKi9cblx0ZXhwb3J0IGNsYXNzIE1hcEVudHJ5IGV4dGVuZHMgQnVpbGRFbnRyeSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXksIHZhbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbCA9IHZhbFxuXHRcdH1cblx0fVxuXG4vLyBDb25kaXRpb25hbHNcblx0LyoqXG5cdGBgYGlmL3VubGVzcyB7dGVzdH1cblx0XHR7cmVzdWx0fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWwgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQsIGlzVW5sZXNzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t8VmFsfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgY29uZCB7dGVzdH0ge2lmVHJ1ZX0ge2lmRmFsc2V9YCAqL1xuXHRleHBvcnQgY2xhc3MgQ29uZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCBpZlRydWUsIGlmRmFsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmlmVHJ1ZSA9IGlmVHJ1ZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmlmRmFsc2UgPSBpZkZhbHNlXG5cdFx0fVxuXHR9XG5cbi8vIEZ1blxuXHRleHBvcnQgY2xhc3MgRnVuTGlrZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzLCBvcFJlc3RBcmcpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMub3BSZXN0QXJnID0gb3BSZXN0QXJnXG5cdFx0XHQvLyBUT0RPOiBvcFJldHVyblR5cGUgc2hvdWxkIGJlIGNvbW1vbiB0b29cblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgfDp7b3BEZWNsYXJlUmVzfSB7YXJnc30gLi4ue29wUmVzdEFyZ31cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBGdW4gZXh0ZW5kcyBGdW5MaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIG9wdHMgPSB7fSkge1xuXHRcdFx0Y29uc3Qge2tpbmQsIGlzVGhpc0Z1biwgaXNEbywgb3BSZXR1cm5UeXBlfSA9IGFwcGx5RGVmYXVsdHMob3B0cywge1xuXHRcdFx0XHRraW5kOiBGdW5zLlBsYWluLFxuXHRcdFx0XHRpc1RoaXNGdW46IGZhbHNlLFxuXHRcdFx0XHRpc0RvOiBmYWxzZSxcblx0XHRcdFx0b3BSZXR1cm5UeXBlOiBudWxsXG5cdFx0XHR9KVxuXG5cdFx0XHRzdXBlcihsb2MsIGFyZ3MsIG9wUmVzdEFyZylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdC8qKiBAdHlwZSB7RnVuc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7P0xvY2FsRGVjbGFyZVRoaXN9ICovXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVRoaXMgPSBvcElmKGlzVGhpc0Z1biwgKCkgPT4gTG9jYWxEZWNsYXJlLnRoaXModGhpcy5sb2MpKVxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc0RvID0gaXNEbyB8fCBmYWxzZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFJldHVyblR5cGUgPSBvcFJldHVyblR5cGVcblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBGdW59LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgRnVucyA9IHtcblx0XHQvKiogUmVndWxhciBmdW5jdGlvbiAoYHxgKSAqL1xuXHRcdFBsYWluOiAwLFxuXHRcdC8qKiBgJHxgICovXG5cdFx0QXN5bmM6IDEsXG5cdFx0LyoqIGB+fGAgKi9cblx0XHRHZW5lcmF0b3I6IDJcblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBGdW5BYnN0cmFjdCBleHRlbmRzIEZ1bkxpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncywgb3BSZXN0QXJnLCBvcFJldHVyblR5cGUsIG9wQ29tbWVudCkge1xuXHRcdFx0c3VwZXIobG9jLCBhcmdzLCBvcFJlc3RBcmcpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wUmV0dXJuVHlwZSA9IG9wUmV0dXJuVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTWV0aG9kIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1bikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW5MaWtlfSAqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHR9XG5cdH1cblxuLy8gQXN5bmMgLyBHZW5lcmF0b3JcblxuXHQvKiogYCQge3ZhbHVlfSBgKi9cblx0ZXhwb3J0IGNsYXNzIEF3YWl0IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgeWllbGQge29wVmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgWWllbGQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BWYWx1ZSA9IG51bGwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BWYWx1ZSA9IG9wVmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHlpZWxkKiB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgWWllbGRUbyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQ2xhc3Ncblx0ZXhwb3J0IGNsYXNzIEtpbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3VwZXJLaW5kcywgb3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgbWV0aG9kcyA9IFtdKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnN1cGVyS2luZHMgPSBzdXBlcktpbmRzXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHs/Q2xhc3NLaW5kRG99ICovXG5cdFx0XHR0aGlzLm9wRG8gPSBvcERvXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMuc3RhdGljcyA9IHN0YXRpY3Ncblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBjbGFzcyB7b3BTdXBlckNsYXNzfVxuXHRcdHtvcENvbW1lbnR9XG5cdFx0ZG8hXG5cdFx0XHR7b3BEb31cblx0XHRzdGF0aWNcblx0XHRcdHtzdGF0aWNzfVxuXHRcdHtvcENvbnN0cnVjdG9yfVxuXHRcdHttZXRob2RzfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0bG9jLCBvcFN1cGVyQ2xhc3MsIGtpbmRzLFxuXHRcdFx0b3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFN1cGVyQ2xhc3MgPSBvcFN1cGVyQ2xhc3Ncblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMua2luZHMgPSBraW5kc1xuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7P0NsYXNzS2luZERvfSAqL1xuXHRcdFx0dGhpcy5vcERvID0gb3BEb1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLnN0YXRpY3MgPSBzdGF0aWNzXG5cdFx0XHQvKiogQHR5cGUgez9Db25zdHJ1Y3Rvcn0gKi9cblx0XHRcdHRoaXMub3BDb25zdHJ1Y3RvciA9IG9wQ29uc3RydWN0b3Jcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgZG8hYCBwYXJ0IG9mIHtAbGluayBDbGFzc30gb3Ige0BsaW5rIEtpbmR9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3NLaW5kRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmVGb2N1c30gKi9cblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gTG9jYWxEZWNsYXJlLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbnN0cnVjdCEge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBDb25zdHJ1Y3RvciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1biwgbWVtYmVyQXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW59ICovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5tZW1iZXJBcmdzID0gbWVtYmVyQXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBBbnkgcGFydCBvZiB7QGxpbmsgQ2xhc3Muc3RhdGljc30gb3Ige0BsaW5rIENsYXNzLm1ldGhvZHN9LiAqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbExpa2UgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0VXNlZCBieSB0b29scy5cblx0XHRcdEB0eXBlIHtib29sZWFufVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuaXNNeSA9IGlzTXlcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5zeW1ib2wgPSBzeW1ib2xcblx0XHR9XG5cdH1cblx0LyoqIGB7c3ltYm9sfSB7ZnVufWAgKi9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGwgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wsIGZ1bikge1xuXHRcdFx0c3VwZXIobG9jLCBpc015LCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Z1bn0gKi9cblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRgYGBnZXQge3N5bWJvbH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RHZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MsIGlzTXksIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBMb2NhbERlY2xhcmUudGhpcyhsb2MpXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRgYGBzZXQge3N5bWJvbH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RTZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MsIGlzTXksIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBMb2NhbERlY2xhcmUudGhpcyhsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBzdXBlciB7YXJnc31gLlxuXHROZXZlciBhIHtAbGluayBTdXBlck1lbWJlcn0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGwgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwcmVhZD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBzdXBlci57bmFtZX1gIG9yIGBzdXBlci5cIntuYW1lfVwiYC4gKi9cblx0ZXhwb3J0IGNsYXNzIFN1cGVyTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG4vLyBDYWxsc1xuXHQvKiogYHtjYWxsZWR9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2FsbGVkLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwcmVhZD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBuZXcge3R5cGV9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgU3ByZWFkfSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgLi4ue3NwcmVhZGVkfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFNwcmVhZCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHNwcmVhZGVkKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3ByZWFkZWQgPSBzcHJlYWRlZFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgfnt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMYXp5IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdC8qKiBgY2FzZWAgKi9cblx0ZXhwb3J0IGNsYXNzIENhc2UgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdEFzc2lnbmVlIGlzIGFsd2F5cyBhIExvY2FsRGVjbGFyZUZvY3VzLlxuXHRcdFx0QHR5cGUgez9Bc3NpZ25TaW5nbGV9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqIFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIENhc2V9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2FzZVBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgUGF0dGVybn0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgOnt0eXBlfSB7bG9jYWxzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFBhdHRlcm4gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBsb2NhbHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5sb2NhbHMgPSBsb2NhbHNcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxBY2Nlc3N9ICovXG5cdFx0XHR0aGlzLnBhdHRlcm5lZCA9IExvY2FsQWNjZXNzLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuLy8gU3dpdGNoXG5cdC8qKiBgc3dpdGNoYCAqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFN3aXRjaFBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja30gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBTd2l0Y2h9LlxuXHRNdWx0aXBsZSB2YWx1ZXMgYXJlIHNwZWNpZmllZCB3aXRoIGBvcmAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTd2l0Y2hQYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzLCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuLy8gRm9yXG5cdC8qKiBgZm9yYCAqL1xuXHRleHBvcnQgY2xhc3MgRm9yIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGAkZm9yIHtvcEl0ZXJhdGVlfVxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQXN5bmMgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5pdGVyYXRlZSA9IGl0ZXJhdGVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBAZm9yYFxuXHRDb250YWlucyBtYW55IHtAbGluayBCYWdFbnRyeX0gYW5kIHtAbGluayBCYWdFbnRyeU1hbnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQmFnIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuYnVpbHQgPSBMb2NhbERlY2xhcmUuYnVpbHQobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgeCBpbiB5YCBvciBqdXN0IGB5YCAod2hlcmUgdGhlIGxvY2FsIGlzIGltcGxpY2l0bHkgYF9gKS4gKi9cblx0ZXhwb3J0IGNsYXNzIEl0ZXJhdGVlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZWxlbWVudCwgYmFnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5iYWcgPSBiYWdcblx0XHR9XG5cdH1cblxuXHQvKiogYGJyZWFrYCAqL1xuXHRleHBvcnQgY2xhc3MgQnJlYWsgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFZhbHVlID0gbnVsbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFZhbHVlID0gb3BWYWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBNaXNjZWxsYW5lb3VzIFZhbHNcblx0LyoqXG5cdEEgYmxvY2sgYXBwZWFyaW5nIG9uIGl0cyBvd24gKG5vdCBhcyB0aGUgYmxvY2sgdG8gYW4gYGlmYCBvciB0aGUgbGlrZSlcblx0aXMgcHV0IGludG8gb25lIG9mIHRoZXNlLlxuXHRlLmcuOlxuXG5cdFx0eCA9XG5cdFx0XHR5ID0gMVxuXHRcdFx0eVxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tXcmFwIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9uZS1saW5lIEAgZXhwcmVzc2lvbiwgc3VjaCBhcyBgWyAxIDIgMyBdYC4gKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ1NpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9uZS1saW5lIG9iamVjdCBleHByZXNzaW9uLCBzdWNoIGFzIGAoYS4gMSBiLiAyKWAuICovXG5cdGV4cG9ydCBjbGFzcyBPYmpTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFpcnMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8T2JqUGFpcj59ICovXG5cdFx0XHR0aGlzLnBhaXJzID0gcGFpcnNcblx0XHR9XG5cdH1cblx0LyoqIFBhcnQgb2YgYW4ge0BsaW5rIE9ialNpbXBsZX0uICovXG5cdGV4cG9ydCBjbGFzcyBPYmpQYWlyIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5LCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYGFuZGAgb3IgYG9yYCBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgTG9naWMgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2dpY3N9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgTG9naWN9LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgTG9naWNzID0ge1xuXHRcdC8qKiBgYW5kYCBrZXl3b3JkKi9cblx0XHRBbmQ6IDAsXG5cdFx0LyoqIGBvcmAga2V5d29yZCAqL1xuXHRcdE9yOiAxXG5cdH1cblxuXHQvKiogYG5vdGAga2V5d29yZCAqL1xuXHRleHBvcnQgY2xhc3MgTm90IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmFyZyA9IGFyZ1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRMaXRlcmFsIG51bWJlciB2YWx1ZS5cblx0VGhpcyBpcyBib3RoIGEgVG9rZW4gYW5kIE1zQXN0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTnVtYmVyTGl0ZXJhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRTdG9yZSBhcyBhIHN0cmluZyBzbyB3ZSBjYW4gZGlzdGluZ3Vpc2ggYDB4ZmAgYW5kIGAxNWAuXG5cdFx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdEBvdmVycmlkZVxuXHRcdFNpbmNlIHRoaXMgaXMgdXNlZCBhcyBhIFRva2VuLCBpdCBtdXN0IGltcGxlbWVudCB0b1N0cmluZy5cblx0XHQqL1xuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsdWUudG9TdHJpbmcoKVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge29iamVjdH0ue25hbWV9YCBvciBge29iamVjdH0uXCJ7bmFtZX1cImAuICovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKipcblx0XHRcdElmIGEgc3RyaW5nLCBjb3VsZCBzdGlsbCBiZSBhbnkgc3RyaW5nLCBzbyBtYXkgc3RpbGwgY29tcGlsZSB0byBgYVsnc3RyaW5nJ11gLlxuXHRcdFx0QHR5cGUge3N0cmluZyB8IFZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdFJlZ0V4cCBleHByZXNzaW9uLCBsaWtlIGBcXGBmb29cXGBgLi5cblx0TGlrZSBRdW90ZVBsYWluLCBtYXkgY29udGFpbiBpbnRlcnBvbGF0aW9uLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTXNSZWdFeHAgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMsIGZsYWdzID0gJycpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqXG5cdFx0XHRTb21lIHNlbGVjdGlvbiBvZiB0aGUgbGV0dGVycyBpbiAnZ2lteScgKGluIHRoYXQgb3JkZXIpLlxuXHRcdFx0QHR5cGUge3N0cmluZ31cblx0XHRcdCovXG5cdFx0XHR0aGlzLmZsYWdzID0gZmxhZ3Ncblx0XHR9XG5cdH1cblxuXHQvKioge0BsaW5rIFF1b3RlfSBvciB7QGxpbmsgUXVvdGVTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVBYnN0cmFjdCBleHRlbmRzIFZhbCB7fVxuXG5cdC8qKlxuXHRRdW90ZWQgdGV4dC4gQWx3YXlzIGNvbXBpbGVzIHRvIGEgdGVtcGxhdGUgc3RyaW5nLlxuXHRGb3IgdGFnZ2VkIHRlbXBsYXRlcywgdXNlIHtAbGluayBRdW90ZVRhZ2dlZFRlbXBsYXRlfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlUGxhaW4gZXh0ZW5kcyBRdW90ZUFic3RyYWN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdGBwYXJ0c2AgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdFx0cGFydCBTdHJpbmdzIGFyZSByYXcgdmFsdWVzLCBtZWFuaW5nIFwiXFxuXCIgaXMgdHdvIGNoYXJhY3RlcnMuXG5cdFx0XHRAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogYHt0YWd9XCJ7cXVvdGV9XCJgICovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRhZ2dlZFRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZywgcXVvdGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdC8qKiBAdHlwZSB7UXVvdGV9ICovXG5cdFx0XHR0aGlzLnF1b3RlID0gcXVvdGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YCd7bmFtZX1gLlxuXHRRdW90ZSBjb25zaXN0aW5nIG9mIGEgc2luZ2xlIG5hbWUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVNpbXBsZSBleHRlbmRzIFF1b3RlQWJzdHJhY3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHBpcGUge3ZhbHVlfVxuXHRcdHtwaXBlc31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFBpcGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUsIHBpcGVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5waXBlcyA9IHBpcGVzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHdpdGgge3ZhbHVlfSBbYXMge2RlY2xhcmV9XVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFdpdGggZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZSwgdmFsdWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZGVjbGFyZSA9IGRlY2xhcmVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAme25hbWV9YCBvciBgLiZ7bmFtZX1gIG9yIGB7b2JqZWN0fS4me25hbWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wT2JqZWN0LCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wT2JqZWN0ID0gb3BPYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgJi57bmFtZX1gICovXG5cdGV4cG9ydCBjbGFzcyBHZXR0ZXJGdW4gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAmKHt2YWx1ZX0pYCAqL1xuXHRleHBvcnQgY2xhc3MgU2ltcGxlRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge3N0YXJ0fS4ue2VuZH1gIG9yIGB7c3RhcnR9Li4ue2VuZH1gLiAqL1xuXHRleHBvcnQgY2xhc3MgUmFuZ2UgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3RhcnQsIGVuZCwgaXNFeGNsdXNpdmUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zdGFydCA9IHN0YXJ0XG5cdFx0XHQvKipcblx0XHRcdElmIG51bGwsIHRoaXMgaXMgYW4gaW5maW5pdGUgUmFuZ2UuXG5cdFx0XHRAdHlwZSB7P1ZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmVuZCA9IGVuZFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc0V4Y2x1c2l2ZSA9IGlzRXhjbHVzaXZlXG5cdFx0fVxuXHR9XG5cbi8vIFNwZWNpYWxcblx0LyoqIGB7aW5zdGFuY2V9Ont0eXBlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEluc3RhbmNlT2YgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaW5zdGFuY2UsIHR5cGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IGluc3RhbmNlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtzdWJiZWR9W3thcmdzfV1gICovXG5cdGV4cG9ydCBjbGFzcyBTdWIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ViYmVkLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3ViYmVkID0gc3ViYmVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBkZWwge3N1YmJlZH1be2FyZ3N9XWAgKi9cblx0ZXhwb3J0IGNsYXNzIERlbCBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnN1YmJlZCA9IHN1YmJlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRBIHNwZWNpYWwgYWN0aW9uLlxuXHRBbGwgU3BlY2lhbERvcyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtTcGVjaWFsRG9zfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIFNwZWNpYWxEb30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsRG9zID0ge1xuXHRcdERlYnVnZ2VyOiAwXG5cdH1cblxuXHQvKipcblx0QSBzcGVjaWFsIGV4cHJlc3Npb24uXG5cdEFsbCBTcGVjaWFsVmFscyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxWYWxzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbFZhbH0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsVmFscyA9IHtcblx0XHQvKiogYGZhbHNlYCBsaXRlcmFsICovXG5cdFx0RmFsc2U6IDAsXG5cdFx0LyoqXG5cdFx0YG5hbWVgIHZhbHVlIGlzIHRoZSBuYW1lIG9mIHRoZSBuZWFyZXN0IGFzc2lnbmVkIHZhbHVlLiBJbjpcblxuXHRcdFx0eCA9IG5ldyBNZXRob2Rcblx0XHRcdFx0bmFtZS5cblxuXHRcdGBuYW1lYCB3aWxsIGJlIFwieFwiLlxuXHRcdCovXG5cdFx0TmFtZTogMSxcblx0XHQvKiogYG51bGxgIGxpdGVyYWwgKi9cblx0XHROdWxsOiAyLFxuXHRcdC8qKiBgdHJ1ZWAgbGl0ZXJhbCAqL1xuXHRcdFRydWU6IDMsXG5cdFx0LyoqIGB2b2lkIDBgICovXG5cdFx0VW5kZWZpbmVkOiA0XG5cdH1cblxuXHQvKipcblx0YGlnbm9yZWAgc3RhdGVtZW50LlxuXHRLZWVwcyB0aGUgY29tcGlsZXIgZnJvbSBjb21wbGFpbmluZyBhYm91dCBhbiB1bnVzZWQgbG9jYWwuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJZ25vcmUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpZ25vcmVkTmFtZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cblx0XHRcdHRoaXMuaWdub3JlZE5hbWVzID0gaWdub3JlZE5hbWVzXG5cdFx0fVxuXHR9XG4iXX0=
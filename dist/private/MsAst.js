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
	exports.Pass = exports.Ignore = exports.SpecialVals = exports.SpecialVal = exports.SpecialDos = exports.SpecialDo = exports.Del = exports.Sub = exports.InstanceOf = exports.Range = exports.SimpleFun = exports.GetterFun = exports.MemberFun = exports.With = exports.Pipe = exports.QuoteSimple = exports.QuoteTaggedTemplate = exports.QuotePlain = exports.QuoteAbstract = exports.MsRegExp = exports.Member = exports.NumberLiteral = exports.Not = exports.Logics = exports.Logic = exports.ObjPair = exports.ObjSimple = exports.BagSimple = exports.BlockWrap = exports.Break = exports.Iteratee = exports.ForBag = exports.ForAsync = exports.For = exports.SwitchPart = exports.Switch = exports.Pattern = exports.CasePart = exports.Case = exports.Lazy = exports.Spread = exports.New = exports.Call = exports.SuperMember = exports.SuperCall = exports.MethodSetter = exports.MethodGetter = exports.MethodImpl = exports.MethodImplLike = exports.Constructor = exports.ClassKindDo = exports.Field = exports.Class = exports.Kind = exports.YieldTo = exports.Yield = exports.Await = exports.Method = exports.FunAbstract = exports.Funs = exports.Fun = exports.FunLike = exports.Cond = exports.Conditional = exports.MapEntry = exports.BagEntry = exports.ObjEntryPlain = exports.ObjEntryAssign = exports.ObjEntry = exports.BuildEntry = exports.Block = exports.Catch = exports.Except = exports.Assert = exports.Throw = exports.SetSub = exports.MemberSet = exports.Setters = exports.AssignDestructure = exports.AssignSingle = exports.Assign = exports.LocalMutate = exports.LocalAccess = exports.LocalDeclares = exports.LocalDeclare = exports.Import = exports.ImportDo = exports.Module = exports.Val = exports.Do = exports.LineContent = undefined;

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
		constructor(loc, opFields, opSuperClass, kinds) {
			let opComment = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
			let opDo = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
			let statics = arguments.length <= 6 || arguments[6] === undefined ? [] : arguments[6];
			let opConstructor = arguments.length <= 7 || arguments[7] === undefined ? null : arguments[7];
			let methods = arguments.length <= 8 || arguments[8] === undefined ? [] : arguments[8];
			super(loc);
			this.opFields = opFields;
			this.opSuperClass = opSuperClass;
			this.kinds = kinds;
			this.opComment = opComment;
			this.opDo = opDo;
			this.statics = statics;
			this.opConstructor = opConstructor;
			this.methods = methods;
		}

		get isRecord() {
			return this.opFields !== null;
		}

	}

	exports.Class = Class;

	class Field extends MsAst {
		constructor(loc, name) {
			let opType = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
			super(loc);
			this.name = name;
			this.opType = opType;
		}

	}

	exports.Field = Field;

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

	class Spread extends Val {
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

	class Pass extends Do {
		constructor(loc, ignored) {
			super(loc);
			this.ignored = ignored;
		}

	}

	exports.Pass = Pass;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BUXFCLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FZWixXQUFXOztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQUdYLEVBQUU7O1NBQUYsRUFBRSxHQUFGLEVBQUU7O09BR0YsR0FBRzs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FJSCxNQUFNOzs7Ozs7Ozs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTTs7T0FvQk4sUUFBUTs7Ozs7Ozs7U0FBUixRQUFRLEdBQVIsUUFBUTs7T0FZUixNQUFNOzs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQVosWUFBWSxHQUFaLFlBQVk7T0EwQ1osYUFBYSxXQUFiLGFBQWEsR0FBRzs7QUFFNUIsT0FBSyxFQUFFLENBQUM7O0FBRVIsTUFBSSxFQUFFLENBQUM7RUFDUDs7T0FHWSxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BaUJYLFdBQVc7Ozs7Ozs7OztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQVlYLE1BQU07Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09BU04sWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTs7T0FxQlosaUJBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztTQUFqQixpQkFBaUIsR0FBakIsaUJBQWlCO09Bd0JqQixPQUFPLFdBQVAsT0FBTyxHQUFHO0FBQ3RCLE1BQUksRUFBRSxDQUFDO0FBQ1AsUUFBTSxFQUFFLENBQUM7RUFDVDs7T0FNWSxTQUFTOzs7Ozs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FpQlQsTUFBTTs7Ozs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLEtBQUs7Ozs7Ozs7O1NBQUwsS0FBSyxHQUFM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T0FjbkIsV0FBVzs7Ozs7Ozs7U0FBWCxXQUFXLEdBQVgsV0FBVzs7T0FZWCxJQUFJOzs7Ozs7Ozs7U0FBSixJQUFJLEdBQUosSUFBSTs7T0FjSixJQUFJOzs7Ozs7Ozs7O1NBQUosSUFBSSxHQUFKLElBQUk7O09BYUosU0FBUzs7Ozs7Ozs7O1NBQVQsU0FBUyxHQUFULFNBQVM7O09BV1QsU0FBUzs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FTVCxTQUFTOzs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTOztPQVNULEtBQUs7Ozs7Ozs7Ozs7U0FBTCxLQUFLLEdBQUwsS0FBSzs7T0FpQkwsVUFBVTs7Ozs7Ozs7O1NBQVYsVUFBVSxHQUFWLFVBQVU7O09BV1YsR0FBRzs7Ozs7Ozs7O1NBQUgsR0FBRyxHQUFILEdBQUc7O09BV0gsR0FBRzs7Ozs7Ozs7O1NBQUgsR0FBRyxHQUFILEdBQUc7O09BY0gsU0FBUzs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUztPQVdULFVBQVUsV0FBVixVQUFVLEdBQUc7QUFDekIsVUFBUSxFQUFFLENBQUM7RUFDWDs7T0FNWSxVQUFVOzs7Ozs7OztTQUFWLFVBQVUsR0FBVixVQUFVO09BWVYsV0FBVyxXQUFYLFdBQVcsR0FBRzs7QUFFMUIsT0FBSyxFQUFFLENBQUM7Ozs7Ozs7QUFTUixNQUFJLEVBQUUsQ0FBQzs7QUFFUCxNQUFJLEVBQUUsQ0FBQzs7QUFFUCxNQUFJLEVBQUUsQ0FBQzs7QUFFUCxXQUFTLEVBQUUsQ0FBQztFQUNaOztPQU1ZLE1BQU07Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09BWU4sSUFBSTs7Ozs7Ozs7U0FBSixJQUFJLEdBQUosSUFBSSIsImZpbGUiOiJNc0FzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIGluZGVudCAqL1xuXG5pbXBvcnQge2FwcGx5RGVmYXVsdHMsIGNhdCwgb3BJZn0gZnJvbSAnLi91dGlsJ1xuXG4vKipcbkFueSBNYXNvbiBBU1QuXG5BbGwgQVNUcyBoYXZlIGEgYGxvY2AgdGhhdCB0aGV5IHBhc3Mgb24gdG8gdGhlIGVzYXN0IGR1cmluZyB7QGxpbmsgdHJhbnNwaWxlfS5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNc0FzdCB7XG5cdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdC8qKiBAdHlwZSB7TG9jfSAqL1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cbn1cblxuLy8gTGluZUNvbnRlbnRcblx0LyoqXG5cdEFueSB2YWxpZCBwYXJ0IG9mIGEgQmxvY2suXG5cdE5vdGUgdGhhdCBzb21lIHtAbGluayBWYWx9cyB3aWxsIHN0aWxsIGNhdXNlIHdhcm5pbmdzIGlmIHRoZXkgYXBwZWFyIGFzIGEgbGluZS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIExpbmVDb250ZW50IGV4dGVuZHMgTXNBc3Qge31cblxuXHQvKiogQ2FuIG9ubHkgYXBwZWFyIGFzIGxpbmVzIGluIGEgQmxvY2suICovXG5cdGV4cG9ydCBjbGFzcyBEbyBleHRlbmRzIExpbmVDb250ZW50IHt9XG5cblx0LyoqIENhbiBhcHBlYXIgaW4gYW55IGV4cHJlc3Npb24uICovXG5cdGV4cG9ydCBjbGFzcyBWYWwgZXh0ZW5kcyBMaW5lQ29udGVudCB7fVxuXG4vLyBNb2R1bGVcblx0LyoqIFdob2xlIHNvdXJjZSBmaWxlLiAqL1xuXHRleHBvcnQgY2xhc3MgTW9kdWxlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdE5vdCB1c2VkIGZvciBjb21waWxhdGlvbiwgYnV0IHVzZWZ1bCBmb3IgdG9vbHMuXG5cdFx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydERvPn0gKi9cblx0XHRcdHRoaXMuZG9JbXBvcnRzID0gZG9JbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PEltcG9ydD59ICovXG5cdFx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PERvPn0gKi9cblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBTaW5nbGUgaW1wb3J0IGluIGFuIGBpbXBvcnQhYCBibG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydERvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGF0aCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdFNpbmdsZSBpbXBvcnQgaW4gYW4gYGltcG9ydGAgYmxvY2suXG5cdElmIHBhdGggaXMgJ2dsb2JhbCcsIHRoaXMgaXMgdHJhbnNwaWxlZCBzcGVjaWFsbHkgYmVjYXVzZSB0aGVyZSdzIG5vIGFjdHVhbCAnZ2xvYmFsJyBtb2R1bGUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoLCBpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0ZWQgPSBpbXBvcnRlZFxuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5vcEltcG9ydERlZmF1bHQgPSBvcEltcG9ydERlZmF1bHRcblx0XHR9XG5cdH1cblxuLy8gTG9jYWxzXG5cdC8qKlxuXHRBbGwge0BsaW5rIExvY2FsQWNjZXNzfWVzIG11c3QgaGF2ZSBzb21lIExvY2FsRGVjbGFyZSB0byBhY2Nlc3MuXG5cdEFsbCBhY2Nlc3NpYmxlIGlkZW50aWZpZXJzIGFyZSB0aGVyZWZvcmUgTG9jYWxEZWNsYXJlcy5cblx0VGhpcyBpbmNsdWRlcyBpbXBvcnRzLCBgdGhpc2AsIHRoZSBmb2N1cywgZXRjLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdC8qKiBMb2NhbERlY2xhcmUgd2l0aCBubyB0eXBlLiAqL1xuXHRcdHN0YXRpYyB1bnR5cGVkKGxvYywgbmFtZSwga2luZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBraW5kKVxuXHRcdH1cblxuXHRcdC8qKiBMb2NhbERlY2xhcmUgb2YganVzdCBhIG5hbWUuICovXG5cdFx0c3RhdGljIHBsYWluKGxvYywgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBMb2NhbERlY2xhcmVzLkVhZ2VyKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBidWlsdChsb2MpIHtcblx0XHRcdHJldHVybiB0aGlzLnBsYWluKGxvYywgJ2J1aWx0Jylcblx0XHR9XG5cdFx0c3RhdGljIGZvY3VzKGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAnXycpXG5cdFx0fVxuXHRcdHN0YXRpYyB0eXBlZEZvY3VzKGxvYywgdHlwZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCAnXycsIHR5cGUsIExvY2FsRGVjbGFyZXMuRWFnZXIpXG5cdFx0fVxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAndGhpcycpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcFR5cGUsIGtpbmQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cblx0XHRpc0xhenkoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMb2NhbERlY2xhcmVzLkxhenlcblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmQgb2Yge0BsaW5rIExvY2FsRGVjbGFyZX0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBMb2NhbERlY2xhcmVzID0ge1xuXHRcdC8qKiBEZWNsYXJlZCBub3JtYWxseS4gKi9cblx0XHRFYWdlcjogMCxcblx0XHQvKiogRGVjbGFyZWQgd2l0aCBgfmFgLiAqL1xuXHRcdExhenk6IDFcblx0fVxuXG5cdC8qKiBBY2Nlc3MgdGhlIGxvY2FsIGBuYW1lYC4gKi9cblx0ZXhwb3J0IGNsYXNzIExvY2FsQWNjZXNzIGV4dGVuZHMgVmFsIHtcblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ18nKVxuXHRcdH1cblxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge25hbWV9IDo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbE11dGF0ZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIEFzc2lnblxuXHQvKiogQW55IGV4cHJlc3Npb24gY3JlYXRpbmcgbmV3IGxvY2Fscy4gKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbiBleHRlbmRzIERvIHtcblx0XHQvKipcblx0XHRBbGwgbG9jYWxzIGNyZWF0ZWQgYnkgdGhlIGFzc2lnbi5cblx0XHRAYWJzdHJhY3Rcblx0XHQqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHt9XG5cdH1cblxuXHQvKiogYHthc3NpZ25lZX0gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnblNpbmdsZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0LyoqIEFzc2lnbiB0byBgX2AuICovXG5cdFx0c3RhdGljIGZvY3VzKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgQXNzaWduU2luZ2xlKGxvYywgTG9jYWxEZWNsYXJlLmZvY3VzKGxvYyksIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWUsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuYXNzaWduZWUgPSBhc3NpZ25lZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKiogQG92ZXJyaWRlICovXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIFt0aGlzLmFzc2lnbmVlXVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge2Fzc2lnbmVlc30gPS86PS86Oj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbkRlc3RydWN0dXJlIGV4dGVuZHMgQXNzaWduIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlcywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMuYXNzaWduZWVzID0gYXNzaWduZWVzXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdEtpbmQgb2YgbG9jYWxzIHRoaXMgYXNzaWducyB0by5cblx0XHRAcmV0dXJuIHtMb2NhbERlY2xhcmVzfVxuXHRcdCovXG5cdFx0a2luZCgpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1swXS5raW5kXG5cdFx0fVxuXG5cdFx0LyoqIEBvdmVycmlkZSAqL1xuXHRcdGFsbEFzc2lnbmVlcygpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBLaW5kcyBvZiB7QGxpbmsgTWVtYmVyU2V0fSBhbmQge0BsaW5rIFNldFN1Yn0uICovXG5cdGV4cG9ydCBjb25zdCBTZXR0ZXJzID0ge1xuXHRcdEluaXQ6IDAsXG5cdFx0TXV0YXRlOiAxXG5cdH1cblxuXHQvKipcblx0YHtvYmplY3R9LntuYW1lfTp7b3BUeXBlfSA9Lzo9Lzo6PSB7dmFsdWV9YFxuXHRBbHNvIGhhbmRsZXMgYHtvYmplY3R9Llwie25hbWV9XCJgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyU2V0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBuYW1lLCBvcFR5cGUsIGtpbmQsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge1NldHRlcnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge29iamVjdH1be3N1YmJlZHN9XTp7b3BUeXBlfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgU2V0U3ViIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBzdWJiZWRzLCBvcFR5cGUsIGtpbmQsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnN1YmJlZHMgPSBzdWJiZWRzXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtTZXR0ZXJzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gRXJyb3JzXG5cdC8qKiBgdGhyb3chIHtvcFRocm93bn1gICovXG5cdGV4cG9ydCBjbGFzcyBUaHJvdyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVGhyb3duKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVGhyb3duID0gb3BUaHJvd25cblx0XHR9XG5cdH1cblxuXHQvKiogYGFzc2VydCEvZm9yYmlkISB7Y29uZGl0aW9ufSB0aHJvdyEge29wVGhyb3dufWAgKi9cblx0ZXhwb3J0IGNsYXNzIEFzc2VydCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5lZ2F0ZSwgY29uZGl0aW9uLCBvcFRocm93bikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRJZiB0cnVlLCB0aGlzIGlzIGEgYGZvcmJpZCFgLlxuXHRcdFx0QHR5cGUge2Jvb2xlYW59XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uZWdhdGUgPSBuZWdhdGVcblx0XHRcdC8qKlxuXHRcdFx0Q29tcGlsZWQgc3BlY2lhbGx5IGlmIGEge0BsaW5rIENhbGx9LlxuXHRcdFx0QHR5cGUge1ZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvblxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFRocm93biA9IG9wVGhyb3duXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGV4Y2VwdFxuXHRcdHRyeVxuXHRcdFx0e3RyeX1cblx0XHRjYXRjaFxuXHRcdFx0e29wQ2F0Y2h9XG5cdFx0ZWxzZVxuXHRcdFx0e29wRWxzZX1cblx0XHRmaW5hbGx5XG5cdFx0XHR7b3BGaW5hbGx5fWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRXhjZXB0IGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgX3RyeSwgdHlwZWRDYXRjaGVzLCBvcENhdGNoQWxsLCBvcEVsc2UsIG9wRmluYWxseSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMudHJ5ID0gX3RyeVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXRjaD59ICovXG5cdFx0XHR0aGlzLnR5cGVkQ2F0Y2hlcyA9IHR5cGVkQ2F0Y2hlc1xuXHRcdFx0LyoqXG5cdFx0XHRvcENhdGNoQWxsLmNhdWdodCBzaG91bGQgaGF2ZSBubyB0eXBlLlxuXHRcdFx0QHR5cGUgez9DYXRjaH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm9wQ2F0Y2hBbGwgPSBvcENhdGNoQWxsXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja30gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja30gKi9cblx0XHRcdHRoaXMub3BGaW5hbGx5ID0gb3BGaW5hbGx5XG5cdFx0fVxuXG5cdFx0Z2V0IGFsbENhdGNoZXMoKSB7XG5cdFx0XHRyZXR1cm4gY2F0KHRoaXMudHlwZWRDYXRjaGVzLCB0aGlzLm9wQ2F0Y2hBbGwpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGNhdGNoIHtjYXVnaHR9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2F0Y2ggZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBjYXVnaHQsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuY2F1Z2h0ID0gY2F1Z2h0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cbi8vIEJsb2NrXG5cdC8qKiBMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TGluZUNvbnRlbnQ+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFBhcnQgb2YgYSBidWlsZGVyLiAqL1xuXHRleHBvcnQgY2xhc3MgQnVpbGRFbnRyeSBleHRlbmRzIE1zQXN0IHt9XG5cblx0LyoqIFBhcnQgb2YgYSB7QGxpbmsgQmxvY2tPYmp9LiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnkgZXh0ZW5kcyBCdWlsZEVudHJ5IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGEuIGJgXG5cdE9iakVudHJ5IHRoYXQgcHJvZHVjZXMgYSBuZXcgbG9jYWwuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeUFzc2lnbiBleHRlbmRzIE9iakVudHJ5IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbikge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBc3NpZ259ICovXG5cdFx0XHR0aGlzLmFzc2lnbiA9IGFzc2lnblxuXHRcdH1cblx0fVxuXG5cdC8qKiBPYmpFbnRyeSB0aGF0IGRvZXMgbm90IGludHJvZHVjZSBhIG5ldyBsb2NhbC4gKi9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5UGxhaW4gZXh0ZW5kcyBPYmpFbnRyeSB7XG5cdFx0LyoqXG5cdFx0YHtuYW1lfS5gIHdpdGggbm8gdmFsdWUuXG5cdFx0VGFrZXMgYSBsb2NhbCBvZiB0aGUgc2FtZSBuYW1lIGZyb20gb3V0c2lkZS5cblx0XHQqL1xuXHRcdHN0YXRpYyBhY2Nlc3MobG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBuYW1lLCBuZXcgTG9jYWxBY2Nlc3MobG9jLCBuYW1lKSlcblx0XHR9XG5cblx0XHRzdGF0aWMgbmFtZShsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCAnbmFtZScsIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYC4ge3ZhbHVlfWAgb3IgYC4uLiB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQmFnRW50cnkgZXh0ZW5kcyBCdWlsZEVudHJ5IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlLCBpc01hbnkpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0XHR0aGlzLmlzTWFueSA9IGlzTWFueVxuXHRcdH1cblx0fVxuXG5cdC8qKiBga2V5YCAtPiBgdmFsYCAqL1xuXHRleHBvcnQgY2xhc3MgTWFwRW50cnkgZXh0ZW5kcyBCdWlsZEVudHJ5IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSwgdmFsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsID0gdmFsXG5cdFx0fVxuXHR9XG5cbi8vIENvbmRpdGlvbmFsc1xuXHQvKipcblx0YGBgaWYvdW5sZXNzIHt0ZXN0fVxuXHRcdHtyZXN1bHR9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDb25kaXRpb25hbCBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIHJlc3VsdCwgaXNVbmxlc3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja3xWYWx9ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc1VubGVzcyA9IGlzVW5sZXNzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBjb25kIHt0ZXN0fSB7aWZUcnVlfSB7aWZGYWxzZX1gICovXG5cdGV4cG9ydCBjbGFzcyBDb25kIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QsIGlmVHJ1ZSwgaWZGYWxzZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuaWZUcnVlID0gaWZUcnVlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuaWZGYWxzZSA9IGlmRmFsc2Vcblx0XHR9XG5cdH1cblxuLy8gRnVuXG5cdGV4cG9ydCBjbGFzcyBGdW5MaWtlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MsIG9wUmVzdEFyZykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5vcFJlc3RBcmcgPSBvcFJlc3RBcmdcblx0XHRcdC8vIFRPRE86IG9wUmV0dXJuVHlwZSBzaG91bGQgYmUgY29tbW9uIHRvb1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGB8OntvcERlY2xhcmVSZXN9IHthcmdzfSAuLi57b3BSZXN0QXJnfVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEZ1biBleHRlbmRzIEZ1bkxpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywgb3B0cyA9IHt9KSB7XG5cdFx0XHRjb25zdCB7a2luZCwgaXNUaGlzRnVuLCBpc0RvLCBvcFJldHVyblR5cGV9ID0gYXBwbHlEZWZhdWx0cyhvcHRzLCB7XG5cdFx0XHRcdGtpbmQ6IEZ1bnMuUGxhaW4sXG5cdFx0XHRcdGlzVGhpc0Z1bjogZmFsc2UsXG5cdFx0XHRcdGlzRG86IGZhbHNlLFxuXHRcdFx0XHRvcFJldHVyblR5cGU6IG51bGxcblx0XHRcdH0pXG5cblx0XHRcdHN1cGVyKGxvYywgYXJncywgb3BSZXN0QXJnKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0LyoqIEB0eXBlIHtGdW5zfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHs/TG9jYWxEZWNsYXJlVGhpc30gKi9cblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9IG9wSWYoaXNUaGlzRnVuLCAoKSA9PiBMb2NhbERlY2xhcmUudGhpcyh0aGlzLmxvYykpXG5cdFx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0XHR0aGlzLmlzRG8gPSBpc0RvIHx8IGZhbHNlXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wUmV0dXJuVHlwZSA9IG9wUmV0dXJuVHlwZVxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIEZ1bn0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBGdW5zID0ge1xuXHRcdC8qKiBSZWd1bGFyIGZ1bmN0aW9uIChgfGApICovXG5cdFx0UGxhaW46IDAsXG5cdFx0LyoqIGAkfGAgKi9cblx0XHRBc3luYzogMSxcblx0XHQvKiogYH58YCAqL1xuXHRcdEdlbmVyYXRvcjogMlxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEZ1bkFic3RyYWN0IGV4dGVuZHMgRnVuTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzLCBvcFJlc3RBcmcsIG9wUmV0dXJuVHlwZSwgb3BDb21tZW50KSB7XG5cdFx0XHRzdXBlcihsb2MsIGFyZ3MsIG9wUmVzdEFyZylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BSZXR1cm5UeXBlID0gb3BSZXR1cm5UeXBlXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBNZXRob2QgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZnVuKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Z1bkxpa2V9ICovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdH1cblx0fVxuXG4vLyBBc3luYyAvIEdlbmVyYXRvclxuXG5cdC8qKiBgJCB7dmFsdWV9IGAqL1xuXHRleHBvcnQgY2xhc3MgQXdhaXQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB5aWVsZCB7b3BWYWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBZaWVsZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFZhbHVlID0gbnVsbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFZhbHVlID0gb3BWYWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgeWllbGQqIHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBZaWVsZFRvIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDbGFzc1xuXHRleHBvcnQgY2xhc3MgS2luZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzdXBlcktpbmRzLCBvcENvbW1lbnQgPSBudWxsLCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBtZXRob2RzID0gW10pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuc3VwZXJLaW5kcyA9IHN1cGVyS2luZHNcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUgez9DbGFzc0tpbmREb30gKi9cblx0XHRcdHRoaXMub3BEbyA9IG9wRG9cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5zdGF0aWNzID0gc3RhdGljc1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLm1ldGhvZHMgPSBtZXRob2RzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYGNsYXNzIHtvcFN1cGVyQ2xhc3N9XG5cdFx0e29wQ29tbWVudH1cblx0XHRkbyFcblx0XHRcdHtvcERvfVxuXHRcdHN0YXRpY1xuXHRcdFx0e3N0YXRpY3N9XG5cdFx0e29wQ29uc3RydWN0b3J9XG5cdFx0e21ldGhvZHN9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDbGFzcyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRsb2MsIG9wRmllbGRzLCBvcFN1cGVyQ2xhc3MsIGtpbmRzLFxuXHRcdFx0b3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMub3BGaWVsZHMgPSBvcEZpZWxkc1xuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFN1cGVyQ2xhc3MgPSBvcFN1cGVyQ2xhc3Ncblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMua2luZHMgPSBraW5kc1xuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7P0NsYXNzS2luZERvfSAqL1xuXHRcdFx0dGhpcy5vcERvID0gb3BEb1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLnN0YXRpY3MgPSBzdGF0aWNzXG5cdFx0XHQvKiogQHR5cGUgez9Db25zdHJ1Y3Rvcn0gKi9cblx0XHRcdHRoaXMub3BDb25zdHJ1Y3RvciA9IG9wQ29uc3RydWN0b3Jcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblxuXHRcdGdldCBpc1JlY29yZCgpIHtcblx0XHRcdHJldHVybiB0aGlzLm9wRmllbGRzICE9PSBudWxsXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBmaWVsZCBzcGVjaWZpY2F0aW9uIGZvciBhIHJlY29yZCBjbGFzcy4gKi9cblx0ZXhwb3J0IGNsYXNzIEZpZWxkIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgb3BUeXBlID0gbnVsbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgZG8hYCBwYXJ0IG9mIHtAbGluayBDbGFzc30gb3Ige0BsaW5rIEtpbmR9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3NLaW5kRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmVGb2N1c30gKi9cblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gTG9jYWxEZWNsYXJlLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbnN0cnVjdCEge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBDb25zdHJ1Y3RvciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1biwgbWVtYmVyQXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW59ICovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5tZW1iZXJBcmdzID0gbWVtYmVyQXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBBbnkgcGFydCBvZiB7QGxpbmsgQ2xhc3Muc3RhdGljc30gb3Ige0BsaW5rIENsYXNzLm1ldGhvZHN9LiAqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbExpa2UgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0VXNlZCBieSB0b29scy5cblx0XHRcdEB0eXBlIHtib29sZWFufVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuaXNNeSA9IGlzTXlcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5zeW1ib2wgPSBzeW1ib2xcblx0XHR9XG5cdH1cblx0LyoqIGB7c3ltYm9sfSB7ZnVufWAgKi9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGwgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wsIGZ1bikge1xuXHRcdFx0c3VwZXIobG9jLCBpc015LCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Z1bn0gKi9cblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRgYGBnZXQge3N5bWJvbH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RHZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MsIGlzTXksIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBMb2NhbERlY2xhcmUudGhpcyhsb2MpXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRgYGBzZXQge3N5bWJvbH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RTZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpc015LCBzeW1ib2wsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MsIGlzTXksIHN5bWJvbClcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBMb2NhbERlY2xhcmUudGhpcyhsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBzdXBlciB7YXJnc31gLlxuXHROZXZlciBhIHtAbGluayBTdXBlck1lbWJlcn0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGwgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwcmVhZD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBzdXBlci57bmFtZX1gIG9yIGBzdXBlci5cIntuYW1lfVwiYC4gKi9cblx0ZXhwb3J0IGNsYXNzIFN1cGVyTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG4vLyBDYWxsc1xuXHQvKiogYHtjYWxsZWR9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2FsbGVkLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbCB8IFNwcmVhZD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBuZXcge3R5cGV9IHthcmdzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgU3ByZWFkfSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgLi4ue3NwcmVhZGVkfWBcblx0VGhpcyBjYW4gb25seSBiZSB1c2VkIGluIENhbGwsIE5ldywgb3IgQmFnU2ltcGxlLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3ByZWFkIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHNwcmVhZGVkKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3ByZWFkZWQgPSBzcHJlYWRlZFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgfnt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBMYXp5IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdC8qKiBgY2FzZWAgKi9cblx0ZXhwb3J0IGNsYXNzIENhc2UgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENhc2VkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdEFzc2lnbmVlIGlzIGFsd2F5cyBhIExvY2FsRGVjbGFyZUZvY3VzLlxuXHRcdFx0QHR5cGUgez9Bc3NpZ25TaW5nbGV9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxDYXNlUGFydD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblx0LyoqIFNpbmdsZSBjYXNlIGluIGEge0BsaW5rIENhc2V9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2FzZVBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0LCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsIHwgUGF0dGVybn0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8qKiBgOnt0eXBlfSB7bG9jYWxzfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFBhdHRlcm4gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlLCBsb2NhbHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5sb2NhbHMgPSBsb2NhbHNcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxBY2Nlc3N9ICovXG5cdFx0XHR0aGlzLnBhdHRlcm5lZCA9IExvY2FsQWNjZXNzLmZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuLy8gU3dpdGNoXG5cdC8qKiBgc3dpdGNoYCAqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3dpdGNoZWQsIHBhcnRzLCBvcEVsc2UpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFN3aXRjaFBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja30gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBTd2l0Y2h9LlxuXHRNdWx0aXBsZSB2YWx1ZXMgYXJlIHNwZWNpZmllZCB3aXRoIGBvcmAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBTd2l0Y2hQYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzLCByZXN1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuLy8gRm9yXG5cdC8qKiBgZm9yYCAqL1xuXHRleHBvcnQgY2xhc3MgRm9yIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGAkZm9yIHtvcEl0ZXJhdGVlfVxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQXN5bmMgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0l0ZXJhdGVlfSAqL1xuXHRcdFx0dGhpcy5pdGVyYXRlZSA9IGl0ZXJhdGVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBAZm9yYFxuXHRDb250YWlucyBtYW55IHtAbGluayBCYWdFbnRyeX0gYW5kIHtAbGluayBCYWdFbnRyeU1hbnl9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRm9yQmFnIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuYnVpbHQgPSBMb2NhbERlY2xhcmUuYnVpbHQobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgeCBpbiB5YCBvciBqdXN0IGB5YCAod2hlcmUgdGhlIGxvY2FsIGlzIGltcGxpY2l0bHkgYF9gKS4gKi9cblx0ZXhwb3J0IGNsYXNzIEl0ZXJhdGVlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZWxlbWVudCwgYmFnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5iYWcgPSBiYWdcblx0XHR9XG5cdH1cblxuXHQvKiogYGJyZWFrYCAqL1xuXHRleHBvcnQgY2xhc3MgQnJlYWsgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFZhbHVlID0gbnVsbCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFZhbHVlID0gb3BWYWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBNaXNjZWxsYW5lb3VzIFZhbHNcblx0LyoqXG5cdEEgYmxvY2sgYXBwZWFyaW5nIG9uIGl0cyBvd24gKG5vdCBhcyB0aGUgYmxvY2sgdG8gYW4gYGlmYCBvciB0aGUgbGlrZSlcblx0aXMgcHV0IGludG8gb25lIG9mIHRoZXNlLlxuXHRlLmcuOlxuXG5cdFx0eCA9XG5cdFx0XHR5ID0gMVxuXHRcdFx0eVxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2tXcmFwIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9uZS1saW5lIEAgZXhwcmVzc2lvbiwgc3VjaCBhcyBgWyAxIDIgMyBdYC4gKi9cblx0ZXhwb3J0IGNsYXNzIEJhZ1NpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9uZS1saW5lIG9iamVjdCBleHByZXNzaW9uLCBzdWNoIGFzIGAoYS4gMSBiLiAyKWAuICovXG5cdGV4cG9ydCBjbGFzcyBPYmpTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFpcnMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8T2JqUGFpcj59ICovXG5cdFx0XHR0aGlzLnBhaXJzID0gcGFpcnNcblx0XHR9XG5cdH1cblx0LyoqIFBhcnQgb2YgYW4ge0BsaW5rIE9ialNpbXBsZX0uICovXG5cdGV4cG9ydCBjbGFzcyBPYmpQYWlyIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5LCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYGFuZGAgb3IgYG9yYCBleHByZXNzaW9uLiAqL1xuXHRleHBvcnQgY2xhc3MgTG9naWMgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2dpY3N9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgTG9naWN9LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgTG9naWNzID0ge1xuXHRcdC8qKiBgYW5kYCBrZXl3b3JkKi9cblx0XHRBbmQ6IDAsXG5cdFx0LyoqIGBvcmAga2V5d29yZCAqL1xuXHRcdE9yOiAxXG5cdH1cblxuXHQvKiogYG5vdGAga2V5d29yZCAqL1xuXHRleHBvcnQgY2xhc3MgTm90IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmFyZyA9IGFyZ1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRMaXRlcmFsIG51bWJlciB2YWx1ZS5cblx0VGhpcyBpcyBib3RoIGEgVG9rZW4gYW5kIE1zQXN0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTnVtYmVyTGl0ZXJhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRTdG9yZSBhcyBhIHN0cmluZyBzbyB3ZSBjYW4gZGlzdGluZ3Vpc2ggYDB4ZmAgYW5kIGAxNWAuXG5cdFx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdEBvdmVycmlkZVxuXHRcdFNpbmNlIHRoaXMgaXMgdXNlZCBhcyBhIFRva2VuLCBpdCBtdXN0IGltcGxlbWVudCB0b1N0cmluZy5cblx0XHQqL1xuXHRcdHRvU3RyaW5nKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsdWUudG9TdHJpbmcoKVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge29iamVjdH0ue25hbWV9YCBvciBge29iamVjdH0uXCJ7bmFtZX1cImAuICovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0LCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHQvKipcblx0XHRcdElmIGEgc3RyaW5nLCBjb3VsZCBzdGlsbCBiZSBhbnkgc3RyaW5nLCBzbyBtYXkgc3RpbGwgY29tcGlsZSB0byBgYVsnc3RyaW5nJ11gLlxuXHRcdFx0QHR5cGUge3N0cmluZyB8IFZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdFJlZ0V4cCBleHByZXNzaW9uLCBsaWtlIGBcXGBmb29cXGBgLi5cblx0TGlrZSBRdW90ZVBsYWluLCBtYXkgY29udGFpbiBpbnRlcnBvbGF0aW9uLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTXNSZWdFeHAgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMsIGZsYWdzID0gJycpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqXG5cdFx0XHRTb21lIHNlbGVjdGlvbiBvZiB0aGUgbGV0dGVycyBpbiAnZ2lteScgKGluIHRoYXQgb3JkZXIpLlxuXHRcdFx0QHR5cGUge3N0cmluZ31cblx0XHRcdCovXG5cdFx0XHR0aGlzLmZsYWdzID0gZmxhZ3Ncblx0XHR9XG5cdH1cblxuXHQvKioge0BsaW5rIFF1b3RlfSBvciB7QGxpbmsgUXVvdGVTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVBYnN0cmFjdCBleHRlbmRzIFZhbCB7fVxuXG5cdC8qKlxuXHRRdW90ZWQgdGV4dC4gQWx3YXlzIGNvbXBpbGVzIHRvIGEgdGVtcGxhdGUgc3RyaW5nLlxuXHRGb3IgdGFnZ2VkIHRlbXBsYXRlcywgdXNlIHtAbGluayBRdW90ZVRhZ2dlZFRlbXBsYXRlfS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlUGxhaW4gZXh0ZW5kcyBRdW90ZUFic3RyYWN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdGBwYXJ0c2AgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdFx0cGFydCBTdHJpbmdzIGFyZSByYXcgdmFsdWVzLCBtZWFuaW5nIFwiXFxuXCIgaXMgdHdvIGNoYXJhY3RlcnMuXG5cdFx0XHRAdHlwZSB7QXJyYXk8c3RyaW5nIHwgVmFsPn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHQvKiogYHt0YWd9XCJ7cXVvdGV9XCJgICovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRhZ2dlZFRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZywgcXVvdGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdC8qKiBAdHlwZSB7UXVvdGV9ICovXG5cdFx0XHR0aGlzLnF1b3RlID0gcXVvdGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YCd7bmFtZX1gLlxuXHRRdW90ZSBjb25zaXN0aW5nIG9mIGEgc2luZ2xlIG5hbWUuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVNpbXBsZSBleHRlbmRzIFF1b3RlQWJzdHJhY3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHBpcGUge3ZhbHVlfVxuXHRcdHtwaXBlc31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFBpcGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUsIHBpcGVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5waXBlcyA9IHBpcGVzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHdpdGgge3ZhbHVlfSBbYXMge2RlY2xhcmV9XVxuXHRcdHtibG9ja31gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFdpdGggZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZSwgdmFsdWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsRGVjbGFyZX0gKi9cblx0XHRcdHRoaXMuZGVjbGFyZSA9IGRlY2xhcmVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAme25hbWV9YCBvciBgLiZ7bmFtZX1gIG9yIGB7b2JqZWN0fS4me25hbWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wT2JqZWN0LCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wT2JqZWN0ID0gb3BPYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgJi57bmFtZX1gICovXG5cdGV4cG9ydCBjbGFzcyBHZXR0ZXJGdW4gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGAmKHt2YWx1ZX0pYCAqL1xuXHRleHBvcnQgY2xhc3MgU2ltcGxlRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBge3N0YXJ0fS4ue2VuZH1gIG9yIGB7c3RhcnR9Li4ue2VuZH1gLiAqL1xuXHRleHBvcnQgY2xhc3MgUmFuZ2UgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3RhcnQsIGVuZCwgaXNFeGNsdXNpdmUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zdGFydCA9IHN0YXJ0XG5cdFx0XHQvKipcblx0XHRcdElmIG51bGwsIHRoaXMgaXMgYW4gaW5maW5pdGUgUmFuZ2UuXG5cdFx0XHRAdHlwZSB7P1ZhbH1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmVuZCA9IGVuZFxuXHRcdFx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRcdFx0dGhpcy5pc0V4Y2x1c2l2ZSA9IGlzRXhjbHVzaXZlXG5cdFx0fVxuXHR9XG5cbi8vIFNwZWNpYWxcblx0LyoqIGB7aW5zdGFuY2V9Ont0eXBlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIEluc3RhbmNlT2YgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaW5zdGFuY2UsIHR5cGUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IGluc3RhbmNlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtzdWJiZWR9W3thcmdzfV1gICovXG5cdGV4cG9ydCBjbGFzcyBTdWIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ViYmVkLCBhcmdzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3ViYmVkID0gc3ViYmVkXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBkZWwge3N1YmJlZH1be2FyZ3N9XWAgKi9cblx0ZXhwb3J0IGNsYXNzIERlbCBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnN1YmJlZCA9IHN1YmJlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRBIHNwZWNpYWwgYWN0aW9uLlxuXHRBbGwgU3BlY2lhbERvcyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtTcGVjaWFsRG9zfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIFNwZWNpYWxEb30uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsRG9zID0ge1xuXHRcdERlYnVnZ2VyOiAwXG5cdH1cblxuXHQvKipcblx0QSBzcGVjaWFsIGV4cHJlc3Npb24uXG5cdEFsbCBTcGVjaWFsVmFscyBhcmUgYXRvbWljIGFuZCBkbyBub3QgcmVseSBvbiBjb250ZXh0LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3BlY2lhbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1NwZWNpYWxWYWxzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgU3BlY2lhbFZhbH0uXG5cdEBlbnVtIHtudW1iZXJ9XG5cdCovXG5cdGV4cG9ydCBjb25zdCBTcGVjaWFsVmFscyA9IHtcblx0XHQvKiogYGZhbHNlYCBsaXRlcmFsICovXG5cdFx0RmFsc2U6IDAsXG5cdFx0LyoqXG5cdFx0YG5hbWVgIHZhbHVlIGlzIHRoZSBuYW1lIG9mIHRoZSBuZWFyZXN0IGFzc2lnbmVkIHZhbHVlLiBJbjpcblxuXHRcdFx0eCA9IG5ldyBNZXRob2Rcblx0XHRcdFx0bmFtZS5cblxuXHRcdGBuYW1lYCB3aWxsIGJlIFwieFwiLlxuXHRcdCovXG5cdFx0TmFtZTogMSxcblx0XHQvKiogYG51bGxgIGxpdGVyYWwgKi9cblx0XHROdWxsOiAyLFxuXHRcdC8qKiBgdHJ1ZWAgbGl0ZXJhbCAqL1xuXHRcdFRydWU6IDMsXG5cdFx0LyoqIGB2b2lkIDBgICovXG5cdFx0VW5kZWZpbmVkOiA0XG5cdH1cblxuXHQvKipcblx0YGlnbm9yZWAgc3RhdGVtZW50LlxuXHRLZWVwcyB0aGUgY29tcGlsZXIgZnJvbSBjb21wbGFpbmluZyBhYm91dCBhbiB1bnVzZWQgbG9jYWwuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBJZ25vcmUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpZ25vcmVkTmFtZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cblx0XHRcdHRoaXMuaWdub3JlZE5hbWVzID0gaWdub3JlZE5hbWVzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBwYXNzYCBzdGF0ZW1lbnQuXG5cdEtlZXBzIHRoZSBjb21waWxlciBmcm9tIGNvbXBsYWluaW5nIGFib3V0IFZhbHMgdXNlZCBhcyBEb3MuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBQYXNzIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaWdub3JlZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5pZ25vcmVkID0gaWdub3JlZFxuXHRcdH1cblx0fVxuIl19
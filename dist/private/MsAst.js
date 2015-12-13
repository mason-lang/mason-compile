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
	exports.Pass = exports.Ignore = exports.SpecialVals = exports.SpecialVal = exports.SpecialDos = exports.SpecialDo = exports.Del = exports.Sub = exports.InstanceOf = exports.Range = exports.SimpleFun = exports.GetterFun = exports.MemberFun = exports.With = exports.Pipe = exports.QuoteSimple = exports.QuoteTaggedTemplate = exports.QuotePlain = exports.QuoteAbstract = exports.MsRegExp = exports.Member = exports.NumberLiteral = exports.Not = exports.Logics = exports.Logic = exports.ObjPair = exports.ObjSimple = exports.BagSimple = exports.BlockWrap = exports.Break = exports.Iteratee = exports.ForBag = exports.ForAsync = exports.For = exports.SwitchPart = exports.Switch = exports.Pattern = exports.CasePart = exports.Case = exports.Lazy = exports.Spread = exports.New = exports.Call = exports.SuperMember = exports.SuperCall = exports.MethodSetter = exports.MethodGetter = exports.MethodImpl = exports.MethodImplLike = exports.Constructor = exports.ClassTraitDo = exports.Field = exports.Class = exports.TraitDo = exports.Trait = exports.YieldTo = exports.Yield = exports.Await = exports.Method = exports.FunAbstract = exports.Funs = exports.Fun = exports.FunLike = exports.Cond = exports.Conditional = exports.MapEntry = exports.BagEntry = exports.ObjEntryPlain = exports.ObjEntryAssign = exports.ObjEntry = exports.BuildEntry = exports.Block = exports.Catch = exports.Except = exports.Assert = exports.Throw = exports.SetSub = exports.MemberSet = exports.Setters = exports.AssignDestructure = exports.AssignSingle = exports.Assign = exports.LocalMutate = exports.LocalAccess = exports.LocalDeclares = exports.LocalDeclare = exports.Import = exports.ImportDo = exports.Module = exports.Val = exports.Do = exports.LineContent = undefined;

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

	class Trait extends Val {
		constructor(loc, superTraits) {
			let opComment = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
			let opDo = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
			let statics = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];
			let methods = arguments.length <= 5 || arguments[5] === undefined ? [] : arguments[5];
			super(loc);
			this.superTraits = superTraits;
			this.opComment = opComment;
			this.opDo = opDo;
			this.statics = statics;
			this.methods = methods;
		}

	}

	exports.Trait = Trait;

	class TraitDo extends Do {
		constructor(loc, implementor, trait) {
			let statics = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];
			let methods = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];
			super(loc);
			this.implementor = implementor;
			this.trait = trait;
			this.statics = statics;
			this.methods = methods;
		}

	}

	exports.TraitDo = TraitDo;

	class Class extends Val {
		constructor(loc, opFields, opSuperClass, traits) {
			let opComment = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
			let opDo = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
			let statics = arguments.length <= 6 || arguments[6] === undefined ? [] : arguments[6];
			let opConstructor = arguments.length <= 7 || arguments[7] === undefined ? null : arguments[7];
			let methods = arguments.length <= 8 || arguments[8] === undefined ? [] : arguments[8];
			super(loc);
			this.opFields = opFields;
			this.opSuperClass = opSuperClass;
			this.traits = traits;
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

	class ClassTraitDo extends MsAst {
		constructor(loc, block) {
			super(loc);
			this.block = block;
			this.declareFocus = LocalDeclare.focus(loc);
		}

	}

	exports.ClassTraitDo = ClassTraitDo;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL01zQXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BUXFCLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FZWixXQUFXOztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQUdYLEVBQUU7O1NBQUYsRUFBRSxHQUFGLEVBQUU7O09BR0YsR0FBRzs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FJSCxNQUFNOzs7Ozs7Ozs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTTs7T0FvQk4sUUFBUTs7Ozs7Ozs7U0FBUixRQUFRLEdBQVIsUUFBUTs7T0FZUixNQUFNOzs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQVosWUFBWSxHQUFaLFlBQVk7T0EwQ1osYUFBYSxXQUFiLGFBQWEsR0FBRzs7QUFFNUIsT0FBSyxFQUFFLENBQUM7O0FBRVIsTUFBSSxFQUFFLENBQUM7RUFDUDs7T0FHWSxXQUFXOzs7Ozs7Ozs7Ozs7Ozs7O1NBQVgsV0FBVyxHQUFYLFdBQVc7O09BaUJYLFdBQVc7Ozs7Ozs7OztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQVlYLE1BQU07Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09BU04sWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTs7T0FxQlosaUJBQWlCOzs7Ozs7Ozs7Ozs7Ozs7OztTQUFqQixpQkFBaUIsR0FBakIsaUJBQWlCO09Bd0JqQixPQUFPLFdBQVAsT0FBTyxHQUFHO0FBQ3RCLE1BQUksRUFBRSxDQUFDO0FBQ1AsUUFBTSxFQUFFLENBQUM7RUFDVDs7T0FNWSxTQUFTOzs7Ozs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FpQlQsTUFBTTs7Ozs7Ozs7Ozs7O1NBQU4sTUFBTSxHQUFOLE1BQU07O09Ba0JOLEtBQUs7Ozs7Ozs7O1NBQUwsS0FBSyxHQUFM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O09BTWIsVUFBVTs7Ozs7Ozs7U0FBVixVQUFVLEdBQVYsVUFBVTs7T0FhVixtQkFBbUI7Ozs7Ozs7OztTQUFuQixtQkFBbUIsR0FBbkIsbUJBQW1COztPQWNuQixXQUFXOzs7Ozs7OztTQUFYLFdBQVcsR0FBWCxXQUFXOztPQVlYLElBQUk7Ozs7Ozs7OztTQUFKLElBQUksR0FBSixJQUFJOztPQWNKLElBQUk7Ozs7Ozs7Ozs7U0FBSixJQUFJLEdBQUosSUFBSTs7T0FhSixTQUFTOzs7Ozs7Ozs7U0FBVCxTQUFTLEdBQVQsU0FBUzs7T0FXVCxTQUFTOzs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTOztPQVNULFNBQVM7Ozs7Ozs7O1NBQVQsU0FBUyxHQUFULFNBQVM7O09BU1QsS0FBSzs7Ozs7Ozs7OztTQUFMLEtBQUssR0FBTCxLQUFLOztPQWlCTCxVQUFVOzs7Ozs7Ozs7U0FBVixVQUFVLEdBQVYsVUFBVTs7T0FXVixHQUFHOzs7Ozs7Ozs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FXSCxHQUFHOzs7Ozs7Ozs7U0FBSCxHQUFHLEdBQUgsR0FBRzs7T0FjSCxTQUFTOzs7Ozs7OztTQUFULFNBQVMsR0FBVCxTQUFTO09BV1QsVUFBVSxXQUFWLFVBQVUsR0FBRztBQUN6QixVQUFRLEVBQUUsQ0FBQztFQUNYOztPQU1ZLFVBQVU7Ozs7Ozs7O1NBQVYsVUFBVSxHQUFWLFVBQVU7T0FZVixXQUFXLFdBQVgsV0FBVyxHQUFHOztBQUUxQixPQUFLLEVBQUUsQ0FBQzs7Ozs7OztBQVNSLE1BQUksRUFBRSxDQUFDOztBQUVQLE1BQUksRUFBRSxDQUFDOztBQUVQLE1BQUksRUFBRSxDQUFDOztBQUVQLFdBQVMsRUFBRSxDQUFDO0VBQ1o7O09BTVksTUFBTTs7Ozs7Ozs7U0FBTixNQUFNLEdBQU4sTUFBTTs7T0FZTixJQUFJOzs7Ozs7OztTQUFKLElBQUksR0FBSixJQUFJIiwiZmlsZSI6Ik1zQXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgaW5kZW50ICovXG5cbmltcG9ydCB7YXBwbHlEZWZhdWx0cywgY2F0LCBvcElmfSBmcm9tICcuL3V0aWwnXG5cbi8qKlxuQW55IE1hc29uIEFTVC5cbkFsbCBBU1RzIGhhdmUgYSBgbG9jYCB0aGF0IHRoZXkgcGFzcyBvbiB0byB0aGUgZXNhc3QgZHVyaW5nIHtAbGluayB0cmFuc3BpbGV9LlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0LyoqIEB0eXBlIHtMb2N9ICovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vLyBMaW5lQ29udGVudFxuXHQvKipcblx0QW55IHZhbGlkIHBhcnQgb2YgYSBCbG9jay5cblx0Tm90ZSB0aGF0IHNvbWUge0BsaW5rIFZhbH1zIHdpbGwgc3RpbGwgY2F1c2Ugd2FybmluZ3MgaWYgdGhleSBhcHBlYXIgYXMgYSBsaW5lLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7fVxuXG5cdC8qKiBDYW4gb25seSBhcHBlYXIgYXMgbGluZXMgaW4gYSBCbG9jay4gKi9cblx0ZXhwb3J0IGNsYXNzIERvIGV4dGVuZHMgTGluZUNvbnRlbnQge31cblxuXHQvKiogQ2FuIGFwcGVhciBpbiBhbnkgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIFZhbCBleHRlbmRzIExpbmVDb250ZW50IHt9XG5cbi8vIE1vZHVsZVxuXHQvKiogV2hvbGUgc291cmNlIGZpbGUuICovXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcENvbW1lbnQsIGRvSW1wb3J0cywgaW1wb3J0cywgbGluZXMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0Tm90IHVzZWQgZm9yIGNvbXBpbGF0aW9uLCBidXQgdXNlZnVsIGZvciB0b29scy5cblx0XHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8SW1wb3J0RG8+fSAqL1xuXHRcdFx0dGhpcy5kb0ltcG9ydHMgPSBkb0ltcG9ydHNcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8SW1wb3J0Pn0gKi9cblx0XHRcdHRoaXMuaW1wb3J0cyA9IGltcG9ydHNcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8RG8+fSAqL1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIFNpbmdsZSBpbXBvcnQgaW4gYW4gYGltcG9ydCFgIGJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgSW1wb3J0RG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHR9XG5cdH1cblxuXHQvKipcblx0U2luZ2xlIGltcG9ydCBpbiBhbiBgaW1wb3J0YCBibG9jay5cblx0SWYgcGF0aCBpcyAnZ2xvYmFsJywgdGhpcyBpcyB0cmFuc3BpbGVkIHNwZWNpYWxseSBiZWNhdXNlIHRoZXJlJ3Mgbm8gYWN0dWFsICdnbG9iYWwnIG1vZHVsZS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEltcG9ydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGgsIGltcG9ydGVkLCBvcEltcG9ydERlZmF1bHQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5pbXBvcnRlZCA9IGltcG9ydGVkXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wSW1wb3J0RGVmYXVsdCA9IG9wSW1wb3J0RGVmYXVsdFxuXHRcdH1cblx0fVxuXG4vLyBMb2NhbHNcblx0LyoqXG5cdEFsbCB7QGxpbmsgTG9jYWxBY2Nlc3N9ZXMgbXVzdCBoYXZlIHNvbWUgTG9jYWxEZWNsYXJlIHRvIGFjY2Vzcy5cblx0QWxsIGFjY2Vzc2libGUgaWRlbnRpZmllcnMgYXJlIHRoZXJlZm9yZSBMb2NhbERlY2xhcmVzLlxuXHRUaGlzIGluY2x1ZGVzIGltcG9ydHMsIGB0aGlzYCwgdGhlIGZvY3VzLCBldGMuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0LyoqIExvY2FsRGVjbGFyZSB3aXRoIG5vIHR5cGUuICovXG5cdFx0c3RhdGljIHVudHlwZWQobG9jLCBuYW1lLCBraW5kKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIGtpbmQpXG5cdFx0fVxuXG5cdFx0LyoqIExvY2FsRGVjbGFyZSBvZiBqdXN0IGEgbmFtZS4gKi9cblx0XHRzdGF0aWMgcGxhaW4obG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIExvY2FsRGVjbGFyZXMuRWFnZXIpXG5cdFx0fVxuXG5cdFx0c3RhdGljIGJ1aWx0KGxvYykge1xuXHRcdFx0cmV0dXJuIHRoaXMucGxhaW4obG9jLCAnYnVpbHQnKVxuXHRcdH1cblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICdfJylcblx0XHR9XG5cdFx0c3RhdGljIHR5cGVkRm9jdXMobG9jLCB0eXBlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsICdfJywgdHlwZSwgTG9jYWxEZWNsYXJlcy5FYWdlcilcblx0XHR9XG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wbGFpbihsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUsIG9wVHlwZSwga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmVzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblxuXHRcdGlzTGF6eSgpIHtcblx0XHRcdHJldHVybiB0aGlzLmtpbmQgPT09IExvY2FsRGVjbGFyZXMuTGF6eVxuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZCBvZiB7QGxpbmsgTG9jYWxEZWNsYXJlfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IExvY2FsRGVjbGFyZXMgPSB7XG5cdFx0LyoqIERlY2xhcmVkIG5vcm1hbGx5LiAqL1xuXHRcdEVhZ2VyOiAwLFxuXHRcdC8qKiBEZWNsYXJlZCB3aXRoIGB+YWAuICovXG5cdFx0TGF6eTogMVxuXHR9XG5cblx0LyoqIEFjY2VzcyB0aGUgbG9jYWwgYG5hbWVgLiAqL1xuXHRleHBvcnQgY2xhc3MgTG9jYWxBY2Nlc3MgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAnXycpXG5cdFx0fVxuXG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7bmFtZX0gOj0ge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIExvY2FsTXV0YXRlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQXNzaWduXG5cdC8qKiBBbnkgZXhwcmVzc2lvbiBjcmVhdGluZyBuZXcgbG9jYWxzLiAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduIGV4dGVuZHMgRG8ge1xuXHRcdC8qKlxuXHRcdEFsbCBsb2NhbHMgY3JlYXRlZCBieSB0aGUgYXNzaWduLlxuXHRcdEBhYnN0cmFjdFxuXHRcdCovXG5cdFx0YWxsQXNzaWduZWVzKCkge31cblx0fVxuXG5cdC8qKiBge2Fzc2lnbmVlfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduU2luZ2xlIGV4dGVuZHMgQXNzaWduIHtcblx0XHQvKiogQXNzaWduIHRvIGBfYC4gKi9cblx0XHRzdGF0aWMgZm9jdXMobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25TaW5nbGUobG9jLCBMb2NhbERlY2xhcmUuZm9jdXMobG9jKSwgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZSA9IGFzc2lnbmVlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdC8qKiBAb3ZlcnJpZGUgKi9cblx0XHRhbGxBc3NpZ25lZXMoKSB7XG5cdFx0XHRyZXR1cm4gW3RoaXMuYXNzaWduZWVdXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7YXNzaWduZWVzfSA9Lzo9Lzo6PSB7dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzaWduRGVzdHJ1Y3R1cmUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWVzLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5hc3NpZ25lZXMgPSBhc3NpZ25lZXNcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0S2luZCBvZiBsb2NhbHMgdGhpcyBhc3NpZ25zIHRvLlxuXHRcdEByZXR1cm4ge0xvY2FsRGVjbGFyZXN9XG5cdFx0Ki9cblx0XHRraW5kKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzWzBdLmtpbmRcblx0XHR9XG5cblx0XHQvKiogQG92ZXJyaWRlICovXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzXG5cdFx0fVxuXHR9XG5cblx0LyoqIEtpbmRzIG9mIHtAbGluayBNZW1iZXJTZXR9IGFuZCB7QGxpbmsgU2V0U3VifS4gKi9cblx0ZXhwb3J0IGNvbnN0IFNldHRlcnMgPSB7XG5cdFx0SW5pdDogMCxcblx0XHRNdXRhdGU6IDFcblx0fVxuXG5cdC8qKlxuXHRge29iamVjdH0ue25hbWV9OntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gXG5cdEFsc28gaGFuZGxlcyBge29iamVjdH0uXCJ7bmFtZX1cImAuXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJTZXQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIG5hbWUsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdC8qKiBAdHlwZSB7U2V0dGVyc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7b2JqZWN0fVt7c3ViYmVkc31dOntvcFR5cGV9ID0vOj0vOjo9IHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBTZXRTdWIgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QsIHN1YmJlZHMsIG9wVHlwZSwga2luZCwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuc3ViYmVkcyA9IHN1YmJlZHNcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHQvKiogQHR5cGUge1NldHRlcnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBFcnJvcnNcblx0LyoqIGB0aHJvdyEge29wVGhyb3dufWAgKi9cblx0ZXhwb3J0IGNsYXNzIFRocm93IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUaHJvd24pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdC8qKiBgYXNzZXJ0IS9mb3JiaWQhIHtjb25kaXRpb259IHRocm93ISB7b3BUaHJvd259YCAqL1xuXHRleHBvcnQgY2xhc3MgQXNzZXJ0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmVnYXRlLCBjb25kaXRpb24sIG9wVGhyb3duKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdElmIHRydWUsIHRoaXMgaXMgYSBgZm9yYmlkIWAuXG5cdFx0XHRAdHlwZSB7Ym9vbGVhbn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLm5lZ2F0ZSA9IG5lZ2F0ZVxuXHRcdFx0LyoqXG5cdFx0XHRDb21waWxlZCBzcGVjaWFsbHkgaWYgYSB7QGxpbmsgQ2FsbH0uXG5cdFx0XHRAdHlwZSB7VmFsfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMuY29uZGl0aW9uID0gY29uZGl0aW9uXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVGhyb3duID0gb3BUaHJvd25cblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgZXhjZXB0XG5cdFx0dHJ5XG5cdFx0XHR7dHJ5fVxuXHRcdGNhdGNoXG5cdFx0XHR7b3BDYXRjaH1cblx0XHRlbHNlXG5cdFx0XHR7b3BFbHNlfVxuXHRcdGZpbmFsbHlcblx0XHRcdHtvcEZpbmFsbHl9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHQgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBfdHJ5LCB0eXBlZENhdGNoZXMsIG9wQ2F0Y2hBbGwsIG9wRWxzZSwgb3BGaW5hbGx5KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy50cnkgPSBfdHJ5XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PENhdGNoPn0gKi9cblx0XHRcdHRoaXMudHlwZWRDYXRjaGVzID0gdHlwZWRDYXRjaGVzXG5cdFx0XHQvKipcblx0XHRcdG9wQ2F0Y2hBbGwuY2F1Z2h0IHNob3VsZCBoYXZlIG5vIHR5cGUuXG5cdFx0XHRAdHlwZSB7P0NhdGNofVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMub3BDYXRjaEFsbCA9IG9wQ2F0Y2hBbGxcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHRcdC8qKiBAdHlwZSB7P0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5vcEZpbmFsbHkgPSBvcEZpbmFsbHlcblx0XHR9XG5cblx0XHRnZXQgYWxsQ2F0Y2hlcygpIHtcblx0XHRcdHJldHVybiBjYXQodGhpcy50eXBlZENhdGNoZXMsIHRoaXMub3BDYXRjaEFsbClcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgY2F0Y2gge2NhdWdodH1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBDYXRjaCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhdWdodCwgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlfSAqL1xuXHRcdFx0dGhpcy5jYXVnaHQgPSBjYXVnaHRcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gQmxvY2tcblx0LyoqIExpbmVzIGluIGFuIGluZGVudGVkIGJsb2NrLiAqL1xuXHRleHBvcnQgY2xhc3MgQmxvY2sgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9zdHJpbmd9ICovXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxMaW5lQ29udGVudD59ICovXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHQvKiogUGFydCBvZiBhIGJ1aWxkZXIuICovXG5cdGV4cG9ydCBjbGFzcyBCdWlsZEVudHJ5IGV4dGVuZHMgTXNBc3Qge31cblxuXHQvKiogUGFydCBvZiBhIHtAbGluayBCbG9ja09ian0uICovXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeSBleHRlbmRzIEJ1aWxkRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYS4gYmBcblx0T2JqRW50cnkgdGhhdCBwcm9kdWNlcyBhIG5ldyBsb2NhbC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5QXNzaWduIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0Fzc2lnbn0gKi9cblx0XHRcdHRoaXMuYXNzaWduID0gYXNzaWduXG5cdFx0fVxuXHR9XG5cblx0LyoqIE9iakVudHJ5IHRoYXQgZG9lcyBub3QgaW50cm9kdWNlIGEgbmV3IGxvY2FsLiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlQbGFpbiBleHRlbmRzIE9iakVudHJ5IHtcblx0XHQvKipcblx0XHRge25hbWV9LmAgd2l0aCBubyB2YWx1ZS5cblx0XHRUYWtlcyBhIGxvY2FsIG9mIHRoZSBzYW1lIG5hbWUgZnJvbSBvdXRzaWRlLlxuXHRcdCovXG5cdFx0c3RhdGljIGFjY2Vzcyhsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIG5hbWUsIG5ldyBMb2NhbEFjY2Vzcyhsb2MsIG5hbWUpKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBuYW1lKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsICduYW1lJywgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtzdHJpbmcgfCBWYWx9ICovXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgLiB7dmFsdWV9YCBvciBgLi4uIHt2YWx1ZX1gICovXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeSBleHRlbmRzIEJ1aWxkRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUsIGlzTWFueSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNNYW55ID0gaXNNYW55XG5cdFx0fVxuXHR9XG5cblx0LyoqIGBrZXlgIC0+IGB2YWxgICovXG5cdGV4cG9ydCBjbGFzcyBNYXBFbnRyeSBleHRlbmRzIEJ1aWxkRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5LCB2YWwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWwgPSB2YWxcblx0XHR9XG5cdH1cblxuLy8gQ29uZGl0aW9uYWxzXG5cdC8qKlxuXHRgYGBpZi91bmxlc3Mge3Rlc3R9XG5cdFx0e3Jlc3VsdH1gYGBcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0LCBpc1VubGVzcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfFZhbH0gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHQvKiogYGNvbmQge3Rlc3R9IHtpZlRydWV9IHtpZkZhbHNlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIENvbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgaWZUcnVlLCBpZkZhbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZlRydWUgPSBpZlRydWVcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5pZkZhbHNlID0gaWZGYWxzZVxuXHRcdH1cblx0fVxuXG4vLyBGdW5cblx0ZXhwb3J0IGNsYXNzIEZ1bkxpa2UgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncywgb3BSZXN0QXJnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PExvY2FsRGVjbGFyZT59ICovXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLm9wUmVzdEFyZyA9IG9wUmVzdEFyZ1xuXHRcdFx0Ly8gVE9ETzogb3BSZXR1cm5UeXBlIHNob3VsZCBiZSBjb21tb24gdG9vXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGBgYHw6e29wRGVjbGFyZVJlc30ge2FyZ3N9IC4uLntvcFJlc3RBcmd9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgRnVuIGV4dGVuZHMgRnVuTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcHRzID0ge30pIHtcblx0XHRcdGNvbnN0IHtraW5kLCBpc1RoaXNGdW4sIGlzRG8sIG9wUmV0dXJuVHlwZX0gPSBhcHBseURlZmF1bHRzKG9wdHMsIHtcblx0XHRcdFx0a2luZDogRnVucy5QbGFpbixcblx0XHRcdFx0aXNUaGlzRnVuOiBmYWxzZSxcblx0XHRcdFx0aXNEbzogZmFsc2UsXG5cdFx0XHRcdG9wUmV0dXJuVHlwZTogbnVsbFxuXHRcdFx0fSlcblxuXHRcdFx0c3VwZXIobG9jLCBhcmdzLCBvcFJlc3RBcmcpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHQvKiogQHR5cGUge0Z1bnN9ICovXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHQvKiogQHR5cGUgez9Mb2NhbERlY2xhcmVUaGlzfSAqL1xuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID0gb3BJZihpc1RoaXNGdW4sICgpID0+IExvY2FsRGVjbGFyZS50aGlzKHRoaXMubG9jKSlcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNEbyA9IGlzRG8gfHwgZmFsc2Vcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BSZXR1cm5UeXBlID0gb3BSZXR1cm5UeXBlXG5cdFx0fVxuXHR9XG5cdC8qKlxuXHRLaW5kcyBvZiB7QGxpbmsgRnVufS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IEZ1bnMgPSB7XG5cdFx0LyoqIFJlZ3VsYXIgZnVuY3Rpb24gKGB8YCkgKi9cblx0XHRQbGFpbjogMCxcblx0XHQvKiogYCR8YCAqL1xuXHRcdEFzeW5jOiAxLFxuXHRcdC8qKiBgfnxgICovXG5cdFx0R2VuZXJhdG9yOiAyXG5cdH1cblxuXHRleHBvcnQgY2xhc3MgRnVuQWJzdHJhY3QgZXh0ZW5kcyBGdW5MaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MsIG9wUmVzdEFyZywgb3BSZXR1cm5UeXBlLCBvcENvbW1lbnQpIHtcblx0XHRcdHN1cGVyKGxvYywgYXJncywgb3BSZXN0QXJnKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcFJldHVyblR5cGUgPSBvcFJldHVyblR5cGVcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBmdW4pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7RnVuTGlrZX0gKi9cblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0fVxuXHR9XG5cbi8vIEFzeW5jIC8gR2VuZXJhdG9yXG5cblx0LyoqIGAkIHt2YWx1ZX0gYCovXG5cdGV4cG9ydCBjbGFzcyBBd2FpdCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHlpZWxkIHtvcFZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFlpZWxkIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVmFsdWUgPSBudWxsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wVmFsdWUgPSBvcFZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB5aWVsZCoge3ZhbHVlfWAgKi9cblx0ZXhwb3J0IGNsYXNzIFlpZWxkVG8gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIENsYXNzXG5cdC8qKiBgdHJhaXRgOiBjcmVhdGUgYSBuZXcgdHJhaXQuICovXG5cdGV4cG9ydCBjbGFzcyBUcmFpdCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzdXBlclRyYWl0cywgb3BDb21tZW50ID0gbnVsbCwgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgbWV0aG9kcyA9IFtdKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnN1cGVyVHJhaXRzID0gc3VwZXJUcmFpdHNcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUgez9DbGFzc1RyYWl0RG99ICovXG5cdFx0XHR0aGlzLm9wRG8gPSBvcERvXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMuc3RhdGljcyA9IHN0YXRpY3Ncblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgdHJhaXQhYDogaW1wbGVtZW50IGEgdHJhaXQgZm9yIGFuIGV4aXN0aW5nIHR5cGUuICovXG5cdGV4cG9ydCBjbGFzcyBUcmFpdERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaW1wbGVtZW50b3IsIHRyYWl0LCBzdGF0aWNzID0gW10sIG1ldGhvZHMgPSBbXSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmltcGxlbWVudG9yID0gaW1wbGVtZW50b3Jcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy50cmFpdCA9IHRyYWl0XG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMuc3RhdGljcyA9IHN0YXRpY3Ncblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TWV0aG9kSW1wbExpa2U+fSAqL1xuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBjbGFzcyB7b3BTdXBlckNsYXNzfVxuXHRcdHtvcENvbW1lbnR9XG5cdFx0ZG8hXG5cdFx0XHR7b3BEb31cblx0XHRzdGF0aWNcblx0XHRcdHtzdGF0aWNzfVxuXHRcdHtvcENvbnN0cnVjdG9yfVxuXHRcdHttZXRob2RzfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0bG9jLCBvcEZpZWxkcywgb3BTdXBlckNsYXNzLCB0cmFpdHMsXG5cdFx0XHRvcENvbW1lbnQgPSBudWxsLCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFtdKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9BcnJheTxMb2NhbERlY2xhcmU+fSAqL1xuXHRcdFx0dGhpcy5vcEZpZWxkcyA9IG9wRmllbGRzXG5cdFx0XHQvKiogQHR5cGUgez9WYWx9ICovXG5cdFx0XHR0aGlzLm9wU3VwZXJDbGFzcyA9IG9wU3VwZXJDbGFzc1xuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy50cmFpdHMgPSB0cmFpdHNcblx0XHRcdC8qKiBAdHlwZSB7P3N0cmluZ30gKi9cblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHQvKiogQHR5cGUgez9DbGFzc1RyYWl0RG99ICovXG5cdFx0XHR0aGlzLm9wRG8gPSBvcERvXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE1ldGhvZEltcGxMaWtlPn0gKi9cblx0XHRcdHRoaXMuc3RhdGljcyA9IHN0YXRpY3Ncblx0XHRcdC8qKiBAdHlwZSB7P0NvbnN0cnVjdG9yfSAqL1xuXHRcdFx0dGhpcy5vcENvbnN0cnVjdG9yID0gb3BDb25zdHJ1Y3RvclxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxNZXRob2RJbXBsTGlrZT59ICovXG5cdFx0XHR0aGlzLm1ldGhvZHMgPSBtZXRob2RzXG5cdFx0fVxuXG5cdFx0Z2V0IGlzUmVjb3JkKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3BGaWVsZHMgIT09IG51bGxcblx0XHR9XG5cdH1cblxuXHQvKiogU2luZ2xlIGZpZWxkIHNwZWNpZmljYXRpb24gZm9yIGEgcmVjb3JkIGNsYXNzLiAqL1xuXHRleHBvcnQgY2xhc3MgRmllbGQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lLCBvcFR5cGUgPSBudWxsKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBkbyFgIHBhcnQgb2Yge0BsaW5rIENsYXNzfSBvciB7QGxpbmsgVHJhaXR9LiAqL1xuXHRleHBvcnQgY2xhc3MgQ2xhc3NUcmFpdERvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYmxvY2spIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdC8qKiBAdHlwZSB7TG9jYWxEZWNsYXJlRm9jdXN9ICovXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IExvY2FsRGVjbGFyZS5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBjb25zdHJ1Y3QhIHtmdW59YCAqL1xuXHRleHBvcnQgY2xhc3MgQ29uc3RydWN0b3IgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBmdW4sIG1lbWJlckFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7RnVufSAqL1xuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubWVtYmVyQXJncyA9IG1lbWJlckFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKiogQW55IHBhcnQgb2Yge0BsaW5rIENsYXNzLnN0YXRpY3N9IG9yIHtAbGluayBDbGFzcy5tZXRob2RzfS4gKi9cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGxMaWtlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKipcblx0XHRcdFVzZWQgYnkgdG9vbHMuXG5cdFx0XHRAdHlwZSB7Ym9vbGVhbn1cblx0XHRcdCovXG5cdFx0XHR0aGlzLmlzTXkgPSBpc015XG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMuc3ltYm9sID0gc3ltYm9sXG5cdFx0fVxuXHR9XG5cdC8qKiBge3N5bWJvbH0ge2Z1bn1gICovXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sLCBmdW4pIHtcblx0XHRcdHN1cGVyKGxvYywgaXNNeSwgc3ltYm9sKVxuXHRcdFx0LyoqIEB0eXBlIHtGdW59ICovXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgZ2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kR2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jLCBpc015LCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gTG9jYWxEZWNsYXJlLnRoaXMobG9jKVxuXHRcdH1cblx0fVxuXHQvKipcblx0YGBgc2V0IHtzeW1ib2x9XG5cdFx0e2Jsb2NrfWBgYFxuXHQqL1xuXHRleHBvcnQgY2xhc3MgTWV0aG9kU2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaXNNeSwgc3ltYm9sLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jLCBpc015LCBzeW1ib2wpXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gTG9jYWxEZWNsYXJlLnRoaXMobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBMb2NhbERlY2xhcmUuZm9jdXMobG9jKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgc3VwZXIge2FyZ3N9YC5cblx0TmV2ZXIgYSB7QGxpbmsgU3VwZXJNZW1iZXJ9LlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3VwZXJDYWxsIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcHJlYWQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgc3VwZXIue25hbWV9YCBvciBgc3VwZXIuXCJ7bmFtZX1cImAuICovXG5cdGV4cG9ydCBjbGFzcyBTdXBlck1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuLy8gQ2FsbHNcblx0LyoqIGB7Y2FsbGVkfSB7YXJnc31gICovXG5cdGV4cG9ydCBjbGFzcyBDYWxsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLmNhbGxlZCA9IGNhbGxlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWwgfCBTcHJlYWQ+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgbmV3IHt0eXBlfSB7YXJnc31gICovXG5cdGV4cG9ydCBjbGFzcyBOZXcgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFNwcmVhZH0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKipcblx0YC4uLntzcHJlYWRlZH1gXG5cdFRoaXMgY2FuIG9ubHkgYmUgdXNlZCBpbiBDYWxsLCBOZXcsIG9yIEJhZ1NpbXBsZS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFNwcmVhZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzcHJlYWRlZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnNwcmVhZGVkID0gc3ByZWFkZWRcblx0XHR9XG5cdH1cblxuXHQvKiogYH57dmFsdWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQ2FzZVxuXHQvKiogYGNhc2VgICovXG5cdGV4cG9ydCBjbGFzcyBDYXNlIGV4dGVuZHMgTGluZUNvbnRlbnQge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDYXNlZCwgcGFydHMsIG9wRWxzZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRBc3NpZ25lZSBpcyBhbHdheXMgYSBMb2NhbERlY2xhcmVGb2N1cy5cblx0XHRcdEB0eXBlIHs/QXNzaWduU2luZ2xlfVxuXHRcdFx0Ki9cblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8Q2FzZVBhcnQ+fSAqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHQvKiogQHR5cGUgez9CbG9ja30gKi9cblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cdC8qKiBTaW5nbGUgY2FzZSBpbiBhIHtAbGluayBDYXNlfS4gKi9cblx0ZXhwb3J0IGNsYXNzIENhc2VQYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCwgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbCB8IFBhdHRlcm59ICovXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHQvKiogYDp7dHlwZX0ge2xvY2Fsc31gICovXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSwgbG9jYWxzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8TG9jYWxEZWNsYXJlPn0gKi9cblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHQvKiogQHR5cGUge0xvY2FsQWNjZXNzfSAqL1xuXHRcdFx0dGhpcy5wYXR0ZXJuZWQgPSBMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cbi8vIFN3aXRjaFxuXHQvKiogYHN3aXRjaGAgKi9cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaCBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN3aXRjaGVkLCBwYXJ0cywgb3BFbHNlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3dpdGNoZWQgPSBzd2l0Y2hlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxTd2l0Y2hQYXJ0Pn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0LyoqIEB0eXBlIHs/QmxvY2t9ICovXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXHQvKipcblx0U2luZ2xlIGNhc2UgaW4gYSB7QGxpbmsgU3dpdGNofS5cblx0TXVsdGlwbGUgdmFsdWVzIGFyZSBzcGVjaWZpZWQgd2l0aCBgb3JgLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgU3dpdGNoUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcywgcmVzdWx0KSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PFZhbD59ICovXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cbi8vIEZvclxuXHQvKiogYGZvcmAgKi9cblx0ZXhwb3J0IGNsYXNzIEZvciBleHRlbmRzIExpbmVDb250ZW50IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUgez9JdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdC8qKiBAdHlwZSB7QmxvY2t9ICovXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHQvKipcblx0YGBgJGZvciB7b3BJdGVyYXRlZX1cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEZvckFzeW5jIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGl0ZXJhdGVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtJdGVyYXRlZX0gKi9cblx0XHRcdHRoaXMuaXRlcmF0ZWUgPSBpdGVyYXRlZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgQGZvcmBcblx0Q29udGFpbnMgbWFueSB7QGxpbmsgQmFnRW50cnl9IGFuZCB7QGxpbmsgQmFnRW50cnlNYW55fS5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEZvckJhZyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcEl0ZXJhdGVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/SXRlcmF0ZWV9ICovXG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHQvKiogQHR5cGUge0Jsb2NrfSAqL1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmJ1aWx0ID0gTG9jYWxEZWNsYXJlLmJ1aWx0KGxvYylcblx0XHR9XG5cdH1cblxuXHQvKiogYHggaW4geWAgb3IganVzdCBgeWAgKHdoZXJlIHRoZSBsb2NhbCBpcyBpbXBsaWNpdGx5IGBfYCkuICovXG5cdGV4cG9ydCBjbGFzcyBJdGVyYXRlZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGVsZW1lbnQsIGJhZykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuYmFnID0gYmFnXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBicmVha2AgKi9cblx0ZXhwb3J0IGNsYXNzIEJyZWFrIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BWYWx1ZSA9IG51bGwpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMub3BWYWx1ZSA9IG9wVmFsdWVcblx0XHR9XG5cdH1cblxuLy8gTWlzY2VsbGFuZW91cyBWYWxzXG5cdC8qKlxuXHRBIGJsb2NrIGFwcGVhcmluZyBvbiBpdHMgb3duIChub3QgYXMgdGhlIGJsb2NrIHRvIGFuIGBpZmAgb3IgdGhlIGxpa2UpXG5cdGlzIHB1dCBpbnRvIG9uZSBvZiB0aGVzZS5cblx0ZS5nLjpcblxuXHRcdHggPVxuXHRcdFx0eSA9IDFcblx0XHRcdHlcblx0Ki9cblx0ZXhwb3J0IGNsYXNzIEJsb2NrV3JhcCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKiBPbmUtbGluZSBAIGV4cHJlc3Npb24sIHN1Y2ggYXMgYFsgMSAyIDMgXWAuICovXG5cdGV4cG9ydCBjbGFzcyBCYWdTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdC8qKiBPbmUtbGluZSBvYmplY3QgZXhwcmVzc2lvbiwgc3VjaCBhcyBgKGEuIDEgYi4gMilgLiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhaXJzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PE9ialBhaXI+fSAqL1xuXHRcdFx0dGhpcy5wYWlycyA9IHBhaXJzXG5cdFx0fVxuXHR9XG5cdC8qKiBQYXJ0IG9mIGFuIHtAbGluayBPYmpTaW1wbGV9LiAqL1xuXHRleHBvcnQgY2xhc3MgT2JqUGFpciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSwgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGBhbmRgIG9yIGBvcmAgZXhwcmVzc2lvbi4gKi9cblx0ZXhwb3J0IGNsYXNzIExvZ2ljIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7TG9naWNzfSAqL1xuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIExvZ2ljfS5cblx0QGVudW0ge251bWJlcn1cblx0Ki9cblx0ZXhwb3J0IGNvbnN0IExvZ2ljcyA9IHtcblx0XHQvKiogYGFuZGAga2V5d29yZCovXG5cdFx0QW5kOiAwLFxuXHRcdC8qKiBgb3JgIGtleXdvcmQgKi9cblx0XHRPcjogMVxuXHR9XG5cblx0LyoqIGBub3RgIGtleXdvcmQgKi9cblx0ZXhwb3J0IGNsYXNzIE5vdCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmcpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5hcmcgPSBhcmdcblx0XHR9XG5cdH1cblxuXHQvKipcblx0TGl0ZXJhbCBudW1iZXIgdmFsdWUuXG5cdFRoaXMgaXMgYm90aCBhIFRva2VuIGFuZCBNc0FzdC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE51bWJlckxpdGVyYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKlxuXHRcdFx0U3RvcmUgYXMgYSBzdHJpbmcgc28gd2UgY2FuIGRpc3Rpbmd1aXNoIGAweGZgIGFuZCBgMTVgLlxuXHRcdFx0QHR5cGUge3N0cmluZ31cblx0XHRcdCovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHQvKipcblx0XHRAb3ZlcnJpZGVcblx0XHRTaW5jZSB0aGlzIGlzIHVzZWQgYXMgYSBUb2tlbiwgaXQgbXVzdCBpbXBsZW1lbnQgdG9TdHJpbmcuXG5cdFx0Ki9cblx0XHR0b1N0cmluZygpIHtcblx0XHRcdHJldHVybiB0aGlzLnZhbHVlLnRvU3RyaW5nKClcblx0XHR9XG5cdH1cblxuXHQvKiogYHtvYmplY3R9LntuYW1lfWAgb3IgYHtvYmplY3R9Llwie25hbWV9XCJgLiAqL1xuXHRleHBvcnQgY2xhc3MgTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCwgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0LyoqXG5cdFx0XHRJZiBhIHN0cmluZywgY291bGQgc3RpbGwgYmUgYW55IHN0cmluZywgc28gbWF5IHN0aWxsIGNvbXBpbGUgdG8gYGFbJ3N0cmluZyddYC5cblx0XHRcdEB0eXBlIHtzdHJpbmcgfCBWYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRSZWdFeHAgZXhwcmVzc2lvbiwgbGlrZSBgXFxgZm9vXFxgYC4uXG5cdExpa2UgUXVvdGVQbGFpbiwgbWF5IGNvbnRhaW4gaW50ZXJwb2xhdGlvbi5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIE1zUmVnRXhwIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzLCBmbGFncyA9ICcnKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PHN0cmluZyB8IFZhbD59ICovXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdC8qKlxuXHRcdFx0U29tZSBzZWxlY3Rpb24gb2YgdGhlIGxldHRlcnMgaW4gJ2dpbXknIChpbiB0aGF0IG9yZGVyKS5cblx0XHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5mbGFncyA9IGZsYWdzXG5cdFx0fVxuXHR9XG5cblx0LyoqIHtAbGluayBRdW90ZX0gb3Ige0BsaW5rIFF1b3RlU2ltcGxlfS4gKi9cblx0ZXhwb3J0IGNsYXNzIFF1b3RlQWJzdHJhY3QgZXh0ZW5kcyBWYWwge31cblxuXHQvKipcblx0UXVvdGVkIHRleHQuIEFsd2F5cyBjb21waWxlcyB0byBhIHRlbXBsYXRlIHN0cmluZy5cblx0Rm9yIHRhZ2dlZCB0ZW1wbGF0ZXMsIHVzZSB7QGxpbmsgUXVvdGVUYWdnZWRUZW1wbGF0ZX0uXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVBsYWluIGV4dGVuZHMgUXVvdGVBYnN0cmFjdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqXG5cdFx0XHRgcGFydHNgIGFyZSBTdHJpbmdzIGludGVybGVhdmVkIHdpdGggVmFscy5cblx0XHRcdHBhcnQgU3RyaW5ncyBhcmUgcmF3IHZhbHVlcywgbWVhbmluZyBcIlxcblwiIGlzIHR3byBjaGFyYWN0ZXJzLlxuXHRcdFx0QHR5cGUge0FycmF5PHN0cmluZyB8IFZhbD59XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7dGFnfVwie3F1b3RlfVwiYCAqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVUYWdnZWRUZW1wbGF0ZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0YWcsIHF1b3RlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudGFnID0gdGFnXG5cdFx0XHQvKiogQHR5cGUge1F1b3RlfSAqL1xuXHRcdFx0dGhpcy5xdW90ZSA9IHF1b3RlXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdGAne25hbWV9YC5cblx0UXVvdGUgY29uc2lzdGluZyBvZiBhIHNpbmdsZSBuYW1lLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgUXVvdGVTaW1wbGUgZXh0ZW5kcyBRdW90ZUFic3RyYWN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGBwaXBlIHt2YWx1ZX1cblx0XHR7cGlwZXN9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBQaXBlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlLCBwaXBlcykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMucGlwZXMgPSBwaXBlc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgYGB3aXRoIHt2YWx1ZX0gW2FzIHtkZWNsYXJlfV1cblx0XHR7YmxvY2t9YGBgXG5cdCovXG5cdGV4cG9ydCBjbGFzcyBXaXRoIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGRlY2xhcmUsIHZhbHVlLCBibG9jaykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtMb2NhbERlY2xhcmV9ICovXG5cdFx0XHR0aGlzLmRlY2xhcmUgPSBkZWNsYXJlXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0LyoqIEB0eXBlIHtCbG9ja30gKi9cblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgJntuYW1lfWAgb3IgYC4me25hbWV9YCBvciBge29iamVjdH0uJntuYW1lfWAgKi9cblx0ZXhwb3J0IGNsYXNzIE1lbWJlckZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcE9iamVjdCwgbmFtZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHs/VmFsfSAqL1xuXHRcdFx0dGhpcy5vcE9iamVjdCA9IG9wT2JqZWN0XG5cdFx0XHQvKiogQHR5cGUge3N0cmluZyB8IFZhbH0gKi9cblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHQvKiogYCYue25hbWV9YCAqL1xuXHRleHBvcnQgY2xhc3MgR2V0dGVyRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7c3RyaW5nIHwgVmFsfSAqL1xuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdC8qKiBgJih7dmFsdWV9KWAgKi9cblx0ZXhwb3J0IGNsYXNzIFNpbXBsZUZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHQvKiogYHtzdGFydH0uLntlbmR9YCBvciBge3N0YXJ0fS4uLntlbmR9YC4gKi9cblx0ZXhwb3J0IGNsYXNzIFJhbmdlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN0YXJ0LCBlbmQsIGlzRXhjbHVzaXZlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuc3RhcnQgPSBzdGFydFxuXHRcdFx0LyoqXG5cdFx0XHRJZiBudWxsLCB0aGlzIGlzIGFuIGluZmluaXRlIFJhbmdlLlxuXHRcdFx0QHR5cGUgez9WYWx9XG5cdFx0XHQqL1xuXHRcdFx0dGhpcy5lbmQgPSBlbmRcblx0XHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0XHRcdHRoaXMuaXNFeGNsdXNpdmUgPSBpc0V4Y2x1c2l2ZVxuXHRcdH1cblx0fVxuXG4vLyBTcGVjaWFsXG5cdC8qKiBge2luc3RhbmNlfTp7dHlwZX1gICovXG5cdGV4cG9ydCBjbGFzcyBJbnN0YW5jZU9mIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGluc3RhbmNlLCB0eXBlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge1ZhbH0gKi9cblx0XHRcdHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGB7c3ViYmVkfVt7YXJnc31dYCAqL1xuXHRleHBvcnQgY2xhc3MgU3ViIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN1YmJlZCwgYXJncykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtWYWx9ICovXG5cdFx0XHR0aGlzLnN1YmJlZCA9IHN1YmJlZFxuXHRcdFx0LyoqIEB0eXBlIHtBcnJheTxWYWw+fSAqL1xuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdC8qKiBgZGVsIHtzdWJiZWR9W3thcmdzfV1gICovXG5cdGV4cG9ydCBjbGFzcyBEZWwgZXh0ZW5kcyBMaW5lQ29udGVudCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzdWJiZWQsIGFyZ3MpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7VmFsfSAqL1xuXHRcdFx0dGhpcy5zdWJiZWQgPSBzdWJiZWRcblx0XHRcdC8qKiBAdHlwZSB7QXJyYXk8VmFsPn0gKi9cblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHQvKipcblx0QSBzcGVjaWFsIGFjdGlvbi5cblx0QWxsIFNwZWNpYWxEb3MgYXJlIGF0b21pYyBhbmQgZG8gbm90IHJlbHkgb24gY29udGV4dC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFNwZWNpYWxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7U3BlY2lhbERvc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cdH1cblx0LyoqXG5cdEtpbmRzIG9mIHtAbGluayBTcGVjaWFsRG99LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgU3BlY2lhbERvcyA9IHtcblx0XHREZWJ1Z2dlcjogMFxuXHR9XG5cblx0LyoqXG5cdEEgc3BlY2lhbCBleHByZXNzaW9uLlxuXHRBbGwgU3BlY2lhbFZhbHMgYXJlIGF0b21pYyBhbmQgZG8gbm90IHJlbHkgb24gY29udGV4dC5cblx0Ki9cblx0ZXhwb3J0IGNsYXNzIFNwZWNpYWxWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0LyoqIEB0eXBlIHtTcGVjaWFsVmFsc30gKi9cblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cdH1cblxuXHQvKipcblx0S2luZHMgb2Yge0BsaW5rIFNwZWNpYWxWYWx9LlxuXHRAZW51bSB7bnVtYmVyfVxuXHQqL1xuXHRleHBvcnQgY29uc3QgU3BlY2lhbFZhbHMgPSB7XG5cdFx0LyoqIGBmYWxzZWAgbGl0ZXJhbCAqL1xuXHRcdEZhbHNlOiAwLFxuXHRcdC8qKlxuXHRcdGBuYW1lYCB2YWx1ZSBpcyB0aGUgbmFtZSBvZiB0aGUgbmVhcmVzdCBhc3NpZ25lZCB2YWx1ZS4gSW46XG5cblx0XHRcdHggPSBuZXcgTWV0aG9kXG5cdFx0XHRcdG5hbWUuXG5cblx0XHRgbmFtZWAgd2lsbCBiZSBcInhcIi5cblx0XHQqL1xuXHRcdE5hbWU6IDEsXG5cdFx0LyoqIGBudWxsYCBsaXRlcmFsICovXG5cdFx0TnVsbDogMixcblx0XHQvKiogYHRydWVgIGxpdGVyYWwgKi9cblx0XHRUcnVlOiAzLFxuXHRcdC8qKiBgdm9pZCAwYCAqL1xuXHRcdFVuZGVmaW5lZDogNFxuXHR9XG5cblx0LyoqXG5cdGBpZ25vcmVgIHN0YXRlbWVudC5cblx0S2VlcHMgdGhlIGNvbXBpbGVyIGZyb20gY29tcGxhaW5pbmcgYWJvdXQgYW4gdW51c2VkIGxvY2FsLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgSWdub3JlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaWdub3JlZE5hbWVzKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvKiogQHR5cGUge0FycmF5PHN0cmluZz59ICovXG5cdFx0XHR0aGlzLmlnbm9yZWROYW1lcyA9IGlnbm9yZWROYW1lc1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHRgcGFzc2Agc3RhdGVtZW50LlxuXHRLZWVwcyB0aGUgY29tcGlsZXIgZnJvbSBjb21wbGFpbmluZyBhYm91dCBWYWxzIHVzZWQgYXMgRG9zLlxuXHQqL1xuXHRleHBvcnQgY2xhc3MgUGFzcyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGlnbm9yZWQpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8qKiBAdHlwZSB7P1ZhbH0gKi9cblx0XHRcdHRoaXMuaWdub3JlZCA9IGlnbm9yZWRcblx0XHR9XG5cdH1cbiJdfQ==
if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	class MsAst {
		constructor(loc) {
			this.loc = loc;
		}

		toString() {
			const inspect = _ => _ === null ? 'null' : _ === undefined ? 'undefined' : _ instanceof Array ? `[\n\t${ _.map(_ => indent(_.toString())).join(',\n\t') }\n]` : typeof _ === 'string' ? JSON.stringify(_) : _.toString();

			const indent = str => str.replace(/\n/g, '\n\t');

			const type = this.constructor.name;
			const props = Object.keys(this).map(key => '\n\t' + `${ key }: ` + indent(inspect(this[key]))).join(',');
			return `${ type }(${ props })`;
		}
	}

	// LineContent
	// Valid part of a Block.
	exports.default = MsAst;

	class LineContent extends MsAst {}

	// These can only appear as lines in a Block.
	exports.LineContent = LineContent;

	class Do extends LineContent {}

	// These can appear in any expression.
	exports.Do = Do;

	class Val extends LineContent {}

	// Module
	exports.Val = Val;

	class Module extends MsAst {
		constructor(loc, doUses, // Array[UseDo]
		uses, // Array[Use]
		debugUses, // Array[Use]
		lines, // Array[Do]
		exports, // Array[LocalDeclare]
		opDefaultExport) {
			// Opt[Val]
			super(loc);
			this.doUses = doUses;
			this.uses = uses;
			this.debugUses = debugUses;
			this.lines = lines;
			this.exports = exports;
			this.opDefaultExport = opDefaultExport;
		}
	}

	exports.Module = Module;

	class UseDo extends MsAst {
		constructor(loc, path /* String */) {
			super(loc);
			this.path = path;
		}
	}

	exports.UseDo = UseDo;

	class Use extends MsAst {
		constructor(loc, path, // String
		used, // Array[LocalDeclare]
		opUseDefault) {
			// Opt[LocalDeclare]
			super(loc);
			this.path = path;
			this.used = used;
			this.opUseDefault = opUseDefault;
		}
	}

	// Locals
	exports.Use = Use;
	const LD_Const = 0,
	      LD_Lazy = 1,
	      LD_Mutable = 2;
	exports.LD_Const = LD_Const;
	exports.LD_Lazy = LD_Lazy;
	exports.LD_Mutable = LD_Mutable;

	class LocalDeclare extends MsAst {
		static untyped(loc, name, kind) {
			return new LocalDeclare(loc, name, null, kind);
		}

		static plain(loc, name) {
			return new LocalDeclare(loc, name, null, LD_Const);
		}

		constructor(loc, name, /* String */opType, /* Opt[Val] */kind /* Number */) {
			super(loc);
			this.name = name;
			this.opType = opType;
			this.kind = kind;
		}

		isLazy() {
			return this.kind === LD_Lazy;
		}

		isMutable() {
			return this.kind === LD_Mutable;
		}
	}

	exports.LocalDeclare = LocalDeclare;

	class LocalDeclareBuilt extends LocalDeclare {
		constructor(loc) {
			super(loc, 'built', null, LD_Const);
		}
	}

	exports.LocalDeclareBuilt = LocalDeclareBuilt;

	class LocalDeclareFocus extends LocalDeclare {
		constructor(loc) {
			super(loc, '_', null, LD_Const);
		}
	}

	exports.LocalDeclareFocus = LocalDeclareFocus;

	class LocalDeclareName extends LocalDeclare {
		constructor(loc) {
			super(loc, 'name', null, LD_Const);
		}
	}

	exports.LocalDeclareName = LocalDeclareName;

	class LocalDeclareThis extends LocalDeclare {
		constructor(loc) {
			super(loc, 'this', null, LD_Const);
		}
	}

	exports.LocalDeclareThis = LocalDeclareThis;

	class LocalDeclareRes extends LocalDeclare {
		constructor(loc, opType) {
			super(loc, 'res', opType, LD_Const);
		}
	}

	exports.LocalDeclareRes = LocalDeclareRes;

	class LocalAccess extends Val {
		static focus(loc) {
			return new LocalAccess(loc, '_');
		}

		static this(loc) {
			return new LocalAccess(loc, 'this');
		}

		constructor(loc, name /* String */) {
			super(loc);
			this.name = name;
		}
	}

	exports.LocalAccess = LocalAccess;

	class GlobalAccess extends Val {
		constructor(loc, name /* JsGlobals */) {
			super(loc);
			this.name = name;
		}
	}

	exports.GlobalAccess = GlobalAccess;

	class LocalMutate extends Do {
		constructor(loc, name, /* String */value /* Val */) {
			super(loc);
			this.name = name;
			this.value = value;
		}
	}

	// Assign
	exports.LocalMutate = LocalMutate;

	class Assign extends Do {}

	exports.Assign = Assign;

	class AssignSingle extends Assign {
		static focus(loc, value) {
			return new AssignSingle(loc, new LocalDeclareFocus(loc), value);
		}

		constructor(loc, assignee, /* LocalDeclare */value /* Val */) {
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
		constructor(loc, assignees, /* Array[LocalDeclare] */value /* Val */) {
			super(loc);
			this.assignees = assignees;
			this.value = value;
		}

		allAssignees() {
			return this.assignees;
		}

		kind() {
			return this.assignees[0].kind;
		}
	}

	exports.AssignDestructure = AssignDestructure;
	const MS_New = 0,
	      MS_Mutate = 1,
	      MS_NewMutable = 2;
	exports.MS_New = MS_New;
	exports.MS_Mutate = MS_Mutate;
	exports.MS_NewMutable = MS_NewMutable;

	class MemberSet extends Do {
		constructor(loc, object, /* Val */name, /* String */kind, /* Number */value /* Val */) {
			super(loc);
			this.object = object;
			this.name = name;
			this.kind = kind;
			this.value = value;
		}
	}

	// Errors
	exports.MemberSet = MemberSet;

	class Throw extends Do {
		constructor(loc, opThrown /* Opt[Val] */) {
			super(loc);
			// TODO: ES6 optional arguments
			if (opThrown === undefined) opThrown = null;
			this.opThrown = opThrown;
		}
	}

	exports.Throw = Throw;

	class Assert extends Do {
		constructor(loc, negate, /* Boolean */condition, /* Val */opThrown /* Opt[Val] */) {
			super(loc);
			this.negate = negate;
			// condition treated specially if a Call.
			this.condition = condition;
			this.opThrown = opThrown;
		}
	}

	exports.Assert = Assert;

	class ExceptDo extends Do {
		constructor(loc, _try, /* BlockDo */_catch, /* Opt[Catch] */_finally /* Opt[BlockDo] */) {
			super(loc);
			this._try = _try;
			this._catch = _catch;
			this._finally = _finally;
		}
	}

	exports.ExceptDo = ExceptDo;

	class ExceptVal extends Val {
		constructor(loc, _try, // BlockVal
		_catch, // Opt[Catch]
		_finally) {
			// Opt[BlockDo]
			super(loc);
			this._try = _try;
			this._catch = _catch;
			this._finally = _finally;
		}
	}

	exports.ExceptVal = ExceptVal;

	class Catch extends MsAst {
		constructor(loc, caught, /* LocalDeclare */block /* BlockDo/BlockVal */) {
			super(loc);
			this.caught = caught;
			this.block = block;
		}
	}

	// Debug
	exports.Catch = Catch;

	class Debug extends Do {
		constructor(loc, lines /* Array[LineContent] */) {
			super(loc);
			this.lines = lines;
		}
	}

	// Block
	exports.Debug = Debug;

	class BlockDo extends MsAst {
		constructor(loc, lines /* Array[LineContent] */) {
			super(loc);
			this.lines = lines;
		}
	}

	exports.BlockDo = BlockDo;

	class BlockVal extends MsAst {}

	exports.BlockVal = BlockVal;

	class BlockWithReturn extends BlockVal {
		constructor(loc, lines, /* Array[LineContent] */returned /* Val */) {
			super(loc);
			this.lines = lines;
			this.returned = returned;
		}
	}

	exports.BlockWithReturn = BlockWithReturn;

	class BlockValThrow extends BlockVal {
		constructor(loc, lines, /* Array[LineContent] */_throw /* Throw */) {
			super(loc);
			this.lines = lines;
			this.throw = _throw;
		}
	}

	// TODO: BlockBag, BlockMap, BlockObj => BlockBuild(kind, ...)
	exports.BlockValThrow = BlockValThrow;

	class BlockObj extends BlockVal {
		static of(loc, lines, opObjed, opName) {
			// TODO: ES6 optional arguments
			if (opObjed === undefined) opObjed = null;
			if (opName === undefined) opName = null;
			return new BlockObj(loc, new LocalDeclareBuilt(loc), lines, opObjed, opName);
		}

		constructor(loc, built, // LocalDeclareBuilt
		lines, // Array[Union[LineContent ObjEntry]]
		opObjed, // Opt[Val]
		opName) {
			// Opt[String]
			super(loc);
			this.built = built;
			this.lines = lines;
			this.opObjed = opObjed;
			this.opName = opName;
		}
	}

	exports.BlockObj = BlockObj;

	class ObjEntry extends Do {}

	exports.ObjEntry = ObjEntry;

	class ObjEntryAssign extends ObjEntry {
		constructor(loc, assign /* Assign */) {
			super(loc);
			this.assign = assign;
		}
	}

	exports.ObjEntryAssign = ObjEntryAssign;

	class ObjEntryComputed extends ObjEntry {
		static name(loc, value) {
			return new ObjEntryComputed(loc, Quote.forString(loc, 'name'), value);
		}

		constructor(loc, key, /* Val */value /* Val */) {
			super(loc);
			this.key = key;
			this.value = value;
		}
	}

	exports.ObjEntryComputed = ObjEntryComputed;

	class BlockBag extends BlockVal {
		static of(loc, lines) {
			return new BlockBag(loc, new LocalDeclareBuilt(loc), lines);
		}

		constructor(loc, built, /* LocalDeclareBuilt */lines /* Union[LineContent BagEntry] */) {
			super(loc);
			this.built = built;
			this.lines = lines;
		}
	}

	exports.BlockBag = BlockBag;

	class BagEntry extends Do {
		constructor(loc, value /* Val */) {
			super(loc);
			this.value = value;
		}
	}

	exports.BagEntry = BagEntry;

	class BagEntryMany extends Do {
		constructor(loc, value /* Val */) {
			super(loc);
			this.value = value;
		}
	}

	exports.BagEntryMany = BagEntryMany;

	class BlockMap extends BlockVal {
		static of(loc, lines) {
			return new BlockMap(loc, new LocalDeclareBuilt(loc), lines);
		}

		constructor(loc, built, /* LocalDeclareBuilt */lines /* Union[LineContent MapEntry] */) {
			super(loc);
			this.built = built;
			this.lines = lines;
		}
	}

	exports.BlockMap = BlockMap;

	class MapEntry extends Do {
		constructor(loc, key, /* Val */val /* Val */) {
			super(loc);
			this.key = key;
			this.val = val;
		}
	}

	// Conditionals
	exports.MapEntry = MapEntry;

	class ConditionalDo extends Do {
		constructor(loc, test, /* Val */result, /* BlockDo */isUnless /* Boolean */) {
			super(loc);
			this.test = test;
			this.result = result;
			this.isUnless = isUnless;
		}
	}

	exports.ConditionalDo = ConditionalDo;

	class ConditionalVal extends Val {
		constructor(loc, test, /* Val */result, /* BlockVal */isUnless /* Boolean */) {
			super(loc);
			this.test = test;
			this.result = result;
			this.isUnless = isUnless;
		}
	}

	// Fun
	exports.ConditionalVal = ConditionalVal;

	class Fun extends Val {
		constructor(loc, opDeclareThis, // Opt[LocalDeclareThis]
		isGenerator, // Boolean
		args, // Array[LocalDeclare]
		opRestArg, // Opt[LocalDeclare]
		block, // Block
		opIn, // Opt[Debug]
		opDeclareRes, // Opt[LocalDeclareRes]
		opOut) {
			// Opt[Debug]
			super(loc);
			// TODO:ES6 Optional args
			if (opIn === undefined) opIn = null;
			if (opDeclareRes === undefined) opDeclareRes = null;
			if (opOut === undefined) opOut = null;

			this.opDeclareThis = opDeclareThis;
			this.isGenerator = isGenerator;
			this.args = args;
			this.opRestArg = opRestArg;
			this.block = block;
			this.opIn = opIn;
			this.opDeclareRes = opDeclareRes;
			this.opOut = opOut;
		}
	}

	// Generator
	exports.Fun = Fun;

	class Yield extends Val {
		constructor(loc, opYielded /* Opt[Val] */) {
			super(loc);
			// TODO:ES6 Optional arguments
			if (opYielded === undefined) opYielded = null;
			this.opYielded = opYielded;
		}
	}

	exports.Yield = Yield;

	class YieldTo extends Val {
		constructor(loc, yieldedTo /* Val */) {
			super(loc);
			this.yieldedTo = yieldedTo;
		}
	}

	// Class
	exports.YieldTo = YieldTo;

	class Class extends Val {
		constructor(loc, opSuperClass, // Opt[Val]
		opDo, // Opt[ClassDo],
		statics, // Array[Fun]
		opConstructor, // Opt[Fun]
		methods) {
			// MethodImpl
			super(loc);
			this.opSuperClass = opSuperClass;
			this.opDo = opDo;
			this.statics = statics;
			this.opConstructor = opConstructor;
			this.methods = methods;
		}
	}

	exports.Class = Class;
	const MI_Plain = 0,
	      MI_Get = 1,
	      MI_Set = 2;
	exports.MI_Plain = MI_Plain;
	exports.MI_Get = MI_Get;
	exports.MI_Set = MI_Set;

	class MethodImpl extends MsAst {
		constructor(loc, kind, /* Number */symbol, /* Union[String Val] */fun /* Fun */) {
			super(loc);
			this.kind = kind;
			this.symbol = symbol;
			this.fun = fun;
		}
	}

	exports.MethodImpl = MethodImpl;

	class ClassDo extends MsAst {
		constructor(loc, declareFocus, /* LocalDeclareFocus */block /* BlockDo */) {
			super(loc);
			this.declareFocus = declareFocus;
			this.block = block;
		}
	}

	// Calls
	exports.ClassDo = ClassDo;

	class Call extends Val {
		static contains(loc, testType, tested) {
			return new Call(loc, new SpecialVal(loc, SV_Contains), [testType, tested]);
		}

		static sub(loc, args) {
			return new Call(loc, new SpecialVal(loc, SV_Sub), args);
		}

		constructor(loc, called, /* Val */args /* Array[Union[Val Splat]] */) {
			super(loc);
			this.called = called;
			this.args = args;
		}
	}

	exports.Call = Call;

	class New extends Val {
		constructor(loc, type, /* Val */args /* Union[Val Splat] */) {
			super(loc);
			this.type = type;
			this.args = args;
		}
	}

	exports.New = New;

	class Splat extends MsAst {
		constructor(loc, splatted /* Val */) {
			super(loc);
			this.splatted = splatted;
		}
	}

	exports.Splat = Splat;

	class Lazy extends Val {
		constructor(loc, value /* Val */) {
			super(loc);
			this.value = value;
		}
	}

	// Case
	exports.Lazy = Lazy;

	class CaseDo extends Do {
		constructor(loc, opCased, // Opt[AssignSingle]
		parts, // Array[CaseDoPart]
		opElse) {
			// Opt[BlockDo]
			super(loc);
			// TODO:ES6 Optional arguments
			if (opElse === undefined) opElse = null;
			this.opCased = opCased;
			this.parts = parts;
			this.opElse = opElse;
		}
	}

	exports.CaseDo = CaseDo;

	class CaseVal extends Val {
		constructor(loc, opCased, // Opt[AssignSingle]
		parts, // Array[CaseValPart]
		opElse) {
			// Opt[BlockVal]
			super(loc);
			// TODO:ES6 Optional arguments
			if (opElse === undefined) opElse = null;
			this.opCased = opCased;
			this.parts = parts;
			this.opElse = opElse;
		}
	}

	exports.CaseVal = CaseVal;

	class CaseDoPart extends MsAst {
		constructor(loc, test, /* Union[Val Pattern] */result /* BlockDo */) {
			super(loc);
			this.test = test;
			this.result = result;
		}
	}

	exports.CaseDoPart = CaseDoPart;

	class CaseValPart extends MsAst {
		constructor(loc, test, /* Union[Val Pattern] */result /* BlockVal */) {
			super(loc);
			this.test = test;
			this.result = result;
		}
	}

	exports.CaseValPart = CaseValPart;

	class Pattern extends MsAst {
		constructor(loc, type, // Val
		locals, // Array[LocalDeclare]
		patterned) {
			// LocalAccess
			super(loc);
			this.type = type;
			this.locals = locals;
			this.patterned = patterned;
		}
	}

	// Switch
	exports.Pattern = Pattern;

	class SwitchDo extends Do {
		constructor(loc, switched, // Val
		parts, // Array[SwitchDoPart]
		opElse) {
			// Opt[BlockDo]
			super(loc);
			this.switched = switched;
			this.parts = parts;
			this.opElse = opElse;
		}
	}

	exports.SwitchDo = SwitchDo;

	class SwitchVal extends Val {
		constructor(loc, switched, // Val
		parts, // Array[SwitchValPart]
		opElse) {
			// Opt[BlockVal]
			super(loc);
			this.switched = switched;
			this.parts = parts;
			this.opElse = opElse;
		}
	}

	exports.SwitchVal = SwitchVal;

	class SwitchDoPart extends MsAst {
		constructor(loc, values, /* Array[Val] */result /* BlockDo */) {
			super(loc);
			this.values = values;
			this.result = result;
		}
	}

	exports.SwitchDoPart = SwitchDoPart;

	class SwitchValPart extends MsAst {
		constructor(loc, values, /* Array[Val] */result /* BlockVal */) {
			super(loc);
			this.values = values;
			this.result = result;
		}
	}

	// For
	exports.SwitchValPart = SwitchValPart;

	class ForDo extends Do {
		constructor(loc, opIteratee, /* Opt[Iteratee] */block /* BlockDo */) {
			super(loc);
			this.opIteratee = opIteratee;
			this.block = block;
		}
	}

	exports.ForDo = ForDo;

	class ForVal extends Val {
		constructor(loc, opIteratee, /* Opt[Iteratee] */block /* BlockDo */) {
			super(loc);
			this.opIteratee = opIteratee;
			this.block = block;
		}
	}

	exports.ForVal = ForVal;

	class ForBag extends Val {
		static of(loc, opIteratee, block) {
			return new ForBag(loc, new LocalDeclareBuilt(loc), opIteratee, block);
		}

		constructor(loc, built, // LocalDeclareBuilt
		opIteratee, // Opt[Iteratee]
		block) {
			// BlockDo
			super(loc);
			this.built = built;
			this.opIteratee = opIteratee;
			this.block = block;
		}
	}

	exports.ForBag = ForBag;

	class Iteratee extends MsAst {
		constructor(loc, element, /* LocalDeclare */bag /* Val */) {
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

	// Misc Vals
	exports.BreakWithVal = BreakWithVal;

	class BlockWrap extends Val {
		constructor(loc, block /* BlockVal */) {
			super(loc);
			this.block = block;
		}
	}

	exports.BlockWrap = BlockWrap;

	class BagSimple extends Val {
		constructor(loc, parts /* Array[Val] */) {
			super(loc);
			this.parts = parts;
		}
	}

	exports.BagSimple = BagSimple;

	class ObjSimple extends Val {
		constructor(loc, pairs /* Array[ObjPair] */) {
			super(loc);
			this.pairs = pairs;
		}
	}

	exports.ObjSimple = ObjSimple;

	class ObjPair extends MsAst {
		constructor(loc, key, /* String */value /* Val */) {
			super(loc);
			this.key = key;
			this.value = value;
		}
	}

	exports.ObjPair = ObjPair;
	const L_And = 0,
	      L_Or = 1;
	exports.L_And = L_And;
	exports.L_Or = L_Or;

	class Logic extends Val {
		constructor(loc, kind, /* Number */args /* Array[Val] */) {
			super(loc);
			this.kind = kind;
			this.args = args;
		}
	}

	exports.Logic = Logic;

	class Not extends Val {
		constructor(loc, arg /* Val */) {
			super(loc);
			this.arg = arg;
		}
	}

	// Store the value as a String so we can distinguish `0xf` from `15`.
	exports.Not = Not;

	class NumberLiteral extends Val {
		constructor(loc, value /* String */) {
			super(loc);
			this.value = value;
		}
	}

	exports.NumberLiteral = NumberLiteral;

	class Member extends Val {
		constructor(loc, object, /* Val */name /* String */) {
			super(loc);
			this.object = object;
			this.name = name;
		}
	}

	exports.Member = Member;

	class Quote extends Val {
		static forString(loc, str) {
			return new Quote(loc, [str]);
		}

		// parts are Strings interleaved with Vals.
		constructor(loc, parts /* Array[Union[String Val]] */) {
			super(loc);
			this.parts = parts;
		}
	}

	exports.Quote = Quote;

	class QuoteTemplate extends Val {
		constructor(loc, tag, /* Val */quote /* Quote */) {
			super(loc);
			this.tag = tag;
			this.quote = quote;
		}
	}

	exports.QuoteTemplate = QuoteTemplate;

	class With extends Val {
		constructor(loc, declare, /* LocalDeclare */value, /* Val */block /* BlockDo */) {
			super(loc);
			this.declare = declare;
			this.value = value;
			this.block = block;
		}
	}

	// Special
	exports.With = With;
	const SD_Debugger = 0;
	exports.SD_Debugger = SD_Debugger;

	class SpecialDo extends Do {
		constructor(loc, kind /* Number */) {
			super(loc);
			this.kind = kind;
		}
	}

	exports.SpecialDo = SpecialDo;
	const SV_Contains = 0,
	      SV_False = 1,
	      SV_Null = 2,
	      SV_Sub = 3,
	      SV_Super = 4,
	      SV_True = 5,
	      SV_Undefined = 6,
	      SV_Name = 7;
	exports.SV_Contains = SV_Contains;
	exports.SV_False = SV_False;
	exports.SV_Null = SV_Null;
	exports.SV_Sub = SV_Sub;
	exports.SV_Super = SV_Super;
	exports.SV_True = SV_True;
	exports.SV_Undefined = SV_Undefined;
	exports.SV_Name = SV_Name;

	class SpecialVal extends Val {
		constructor(loc, kind /* Number */) {
			super(loc);
			this.kind = kind;
		}
	}

	exports.SpecialVal = SpecialVal;

	class Ignore extends Do {
		constructor(loc, ignored /* Array[String] */) {
			super(loc);
			this.ignored = ignored;
		}
	}

	exports.Ignore = Ignore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1zQXN0LmpzIiwicHJpdmF0ZS9Nc0FzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FlLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDs7QUFFRCxVQUFRLEdBQUc7QUFDVixTQUFNLE9BQU8sR0FBRyxDQUFDLElBQ2hCLENBQUMsS0FBSyxJQUFJLEdBQ1QsTUFBTSxHQUNOLENBQUMsS0FBSyxTQUFTLEdBQ2YsV0FBVyxHQUNYLENBQUMsWUFBWSxLQUFLLEdBQ2xCLENBQUMsS0FBSyxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLENBQUMsR0FDM0QsT0FBTyxDQUFDLEtBQUssUUFBUSxHQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUNqQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7O0FBRWQsU0FBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUVoRCxTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtBQUNsQyxTQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQ3RDLE1BQU0sR0FBRyxDQUFDLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1RCxVQUFPLENBQUMsR0FBRSxJQUFJLEVBQUMsQ0FBQyxHQUFFLEtB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Q0FBQyxHQUFHLEVBQUUsSUFBSSxlQUFlO0FBQ25DLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLE1BQU0sU0FBUyxFQUFFLENBQUM7QUFDOUIsYUFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLHNCQUFzQjtBQUM3QyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtHQUN0QjtFQUNEIiwiZmlsZSI6InByaXZhdGUvTXNBc3QuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdGNvbnN0IGluc3BlY3QgPSBfID0+XG5cdFx0XHRfID09PSBudWxsID9cblx0XHRcdFx0J251bGwnIDpcblx0XHRcdFx0XyA9PT0gdW5kZWZpbmVkID9cblx0XHRcdFx0J3VuZGVmaW5lZCcgOlxuXHRcdFx0XHRfIGluc3RhbmNlb2YgQXJyYXkgP1xuXHRcdFx0XHRgW1xcblxcdCR7Xy5tYXAoXyA9PiBpbmRlbnQoXy50b1N0cmluZygpKSkuam9pbignLFxcblxcdCcpfVxcbl1gIDpcblx0XHRcdFx0dHlwZW9mIF8gPT09ICdzdHJpbmcnID9cblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkoXykgOlxuXHRcdFx0XHRfLnRvU3RyaW5nKClcblxuXHRcdGNvbnN0IGluZGVudCA9IHN0ciA9PiBzdHIucmVwbGFjZSgvXFxuL2csICdcXG5cXHQnKVxuXG5cdFx0Y29uc3QgdHlwZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZVxuXHRcdGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXModGhpcykubWFwKGtleSA9PlxuXHRcdFx0J1xcblxcdCcgKyBgJHtrZXl9OiBgICsgaW5kZW50KGluc3BlY3QodGhpc1trZXldKSkpLmpvaW4oJywnKVxuXHRcdHJldHVybiBgJHt0eXBlfSgke3Byb3BzfSlgXG5cdH1cbn1cblxuLy8gTGluZUNvbnRlbnRcblx0Ly8gVmFsaWQgcGFydCBvZiBhIEJsb2NrLlxuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7IH1cblxuXHQvLyBUaGVzZSBjYW4gb25seSBhcHBlYXIgYXMgbGluZXMgaW4gYSBCbG9jay5cblx0ZXhwb3J0IGNsYXNzIERvIGV4dGVuZHMgTGluZUNvbnRlbnQgeyB9XG5cblx0Ly8gVGhlc2UgY2FuIGFwcGVhciBpbiBhbnkgZXhwcmVzc2lvbi5cblx0ZXhwb3J0IGNsYXNzIFZhbCBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG4vLyBNb2R1bGVcblx0ZXhwb3J0IGNsYXNzIE1vZHVsZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRkb1VzZXMsIC8vIEFycmF5W1VzZURvXVxuXHRcdFx0dXNlcywgLy8gQXJyYXlbVXNlXVxuXHRcdFx0ZGVidWdVc2VzLCAvLyBBcnJheVtVc2VdXG5cdFx0XHRsaW5lcywgLy8gQXJyYXlbRG9dXG5cdFx0XHRleHBvcnRzLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRvcERlZmF1bHRFeHBvcnQpIHsgLy8gT3B0W1ZhbF1cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuZG9Vc2VzID0gZG9Vc2VzXG5cdFx0XHR0aGlzLnVzZXMgPSB1c2VzXG5cdFx0XHR0aGlzLmRlYnVnVXNlcyA9IGRlYnVnVXNlc1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLmV4cG9ydHMgPSBleHBvcnRzXG5cdFx0XHR0aGlzLm9wRGVmYXVsdEV4cG9ydCA9IG9wRGVmYXVsdEV4cG9ydFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBVc2VEbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGggLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFVzZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRwYXRoLCAvLyBTdHJpbmdcblx0XHRcdHVzZWQsIC8vIEFycmF5W0xvY2FsRGVjbGFyZV1cblx0XHRcdG9wVXNlRGVmYXVsdCkgeyAvLyBPcHRbTG9jYWxEZWNsYXJlXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdFx0dGhpcy51c2VkID0gdXNlZFxuXHRcdFx0dGhpcy5vcFVzZURlZmF1bHQgPSBvcFVzZURlZmF1bHRcblx0XHR9XG5cdH1cblxuLy8gTG9jYWxzXG5cdGV4cG9ydCBjb25zdFxuXHRcdExEX0NvbnN0ID0gMCxcblx0XHRMRF9MYXp5ID0gMSxcblx0XHRMRF9NdXRhYmxlID0gMlxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdHN0YXRpYyB1bnR5cGVkKGxvYywgbmFtZSwga2luZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBraW5kKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBwbGFpbihsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLywgb3BUeXBlIC8qIE9wdFtWYWxdICovLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cblx0XHRpc0xhenkoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMRF9MYXp5XG5cdFx0fVxuXG5cdFx0aXNNdXRhYmxlKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTERfTXV0YWJsZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVCdWlsdCBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MsICdidWlsdCcsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlRm9jdXMgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jLCAnXycsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlTmFtZSBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MsICduYW1lJywgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVUaGlzIGV4dGVuZHMgTG9jYWxEZWNsYXJlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYywgJ3RoaXMnLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZVJlcyBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFR5cGUpIHtcblx0XHRcdHN1cGVyKGxvYywgJ3JlcycsIG9wVHlwZSwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIExvY2FsQWNjZXNzIGV4dGVuZHMgVmFsIHtcblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ18nKVxuXHRcdH1cblxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEdsb2JhbEFjY2VzcyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIEpzR2xvYmFscyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBMb2NhbE11dGF0ZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBBc3NpZ25cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbiBleHRlbmRzIERvIHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25TaW5nbGUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhsb2MpLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlIC8qIExvY2FsRGVjbGFyZSAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbmVlID0gYXNzaWduZWVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdGFsbEFzc2lnbmVlcygpIHsgcmV0dXJuIFsgdGhpcy5hc3NpZ25lZSBdIH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25EZXN0cnVjdHVyZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZXMgLyogQXJyYXlbTG9jYWxEZWNsYXJlXSAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbmVlcyA9IGFzc2lnbmVlc1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzXG5cdFx0fVxuXG5cdFx0a2luZCgpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1swXS5raW5kXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0XG5cdFx0TVNfTmV3ID0gMCxcblx0XHRNU19NdXRhdGUgPSAxLFxuXHRcdE1TX05ld011dGFibGUgPSAyXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJTZXQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QgLyogVmFsICovLCBuYW1lIC8qIFN0cmluZyAqLywga2luZCAvKiBOdW1iZXIgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBFcnJvcnNcblx0ZXhwb3J0IGNsYXNzIFRocm93IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUaHJvd24gLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8vIFRPRE86IEVTNiBvcHRpb25hbCBhcmd1bWVudHNcblx0XHRcdGlmIChvcFRocm93biA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcFRocm93biA9IG51bGxcblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NlcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuZWdhdGUgLyogQm9vbGVhbiAqLywgY29uZGl0aW9uIC8qIFZhbCAqLywgb3BUaHJvd24gLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmVnYXRlID0gbmVnYXRlXG5cdFx0XHQvLyBjb25kaXRpb24gdHJlYXRlZCBzcGVjaWFsbHkgaWYgYSBDYWxsLlxuXHRcdFx0dGhpcy5jb25kaXRpb24gPSBjb25kaXRpb25cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHREbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIF90cnkgLyogQmxvY2tEbyAqLywgX2NhdGNoIC8qIE9wdFtDYXRjaF0gKi8sIF9maW5hbGx5IC8qIE9wdFtCbG9ja0RvXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHRWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdF90cnksIC8vIEJsb2NrVmFsXG5cdFx0XHRfY2F0Y2gsIC8vIE9wdFtDYXRjaF1cblx0XHRcdF9maW5hbGx5KSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXRjaCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhdWdodCAvKiBMb2NhbERlY2xhcmUgKi8sIGJsb2NrIC8qIEJsb2NrRG8vQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2F1Z2h0ID0gY2F1Z2h0XG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gRGVidWdcblx0ZXhwb3J0IGNsYXNzIERlYnVnIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbGluZXMgLyogQXJyYXlbTGluZUNvbnRlbnRdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuLy8gQmxvY2tcblx0ZXhwb3J0IGNsYXNzIEJsb2NrRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBsaW5lcyAvKiBBcnJheVtMaW5lQ29udGVudF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbCBleHRlbmRzIE1zQXN0IHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1dpdGhSZXR1cm4gZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBsaW5lcyAvKiBBcnJheVtMaW5lQ29udGVudF0gKi8sIHJldHVybmVkIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLnJldHVybmVkID0gcmV0dXJuZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWxUaHJvdyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGxpbmVzIC8qIEFycmF5W0xpbmVDb250ZW50XSAqLywgX3Rocm93IC8qIFRocm93ICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHRcdHRoaXMudGhyb3cgPSBfdGhyb3dcblx0XHR9XG5cdH1cblxuXHQvLyBUT0RPOiBCbG9ja0JhZywgQmxvY2tNYXAsIEJsb2NrT2JqID0+IEJsb2NrQnVpbGQoa2luZCwgLi4uKVxuXHRleHBvcnQgY2xhc3MgQmxvY2tPYmogZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0c3RhdGljIG9mKGxvYywgbGluZXMsIG9wT2JqZWQsIG9wTmFtZSkge1xuXHRcdFx0Ly8gVE9ETzogRVM2IG9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdFx0aWYgKG9wT2JqZWQgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0b3BPYmplZCA9IG51bGxcblx0XHRcdGlmIChvcE5hbWUgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0b3BOYW1lID0gbnVsbFxuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja09iaihsb2MsIG5ldyBMb2NhbERlY2xhcmVCdWlsdChsb2MpLCBsaW5lcywgb3BPYmplZCwgb3BOYW1lKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdGJ1aWx0LCAvLyBMb2NhbERlY2xhcmVCdWlsdFxuXHRcdFx0bGluZXMsIC8vIEFycmF5W1VuaW9uW0xpbmVDb250ZW50IE9iakVudHJ5XV1cblx0XHRcdG9wT2JqZWQsIC8vIE9wdFtWYWxdXG5cdFx0XHRvcE5hbWUpIHsgLy8gT3B0W1N0cmluZ11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYnVpbHQgPSBidWlsdFxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLm9wT2JqZWQgPSBvcE9iamVkXG5cdFx0XHR0aGlzLm9wTmFtZSA9IG9wTmFtZVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgT2JqRW50cnkgZXh0ZW5kcyBEbyB7IH1cblxuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlBc3NpZ24gZXh0ZW5kcyBPYmpFbnRyeSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24gLyogQXNzaWduICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbiA9IGFzc2lnblxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeUNvbXB1dGVkIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdHN0YXRpYyBuYW1lKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlDb21wdXRlZChsb2MsIFF1b3RlLmZvclN0cmluZyhsb2MsICduYW1lJyksIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5IC8qIFZhbCAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrQmFnIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdHN0YXRpYyBvZihsb2MsIGxpbmVzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEJsb2NrQmFnKGxvYywgbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYyksIGxpbmVzKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgYnVpbHQgLyogTG9jYWxEZWNsYXJlQnVpbHQgKi8sIGxpbmVzIC8qIFVuaW9uW0xpbmVDb250ZW50IEJhZ0VudHJ5XSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5idWlsdCA9IGJ1aWx0XG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmFnRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeU1hbnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja01hcCBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRzdGF0aWMgb2YobG9jLCBsaW5lcykge1xuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja01hcChsb2MsIG5ldyBMb2NhbERlY2xhcmVCdWlsdChsb2MpLCBsaW5lcylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJ1aWx0IC8qIExvY2FsRGVjbGFyZUJ1aWx0ICovLCBsaW5lcyAvKiBVbmlvbltMaW5lQ29udGVudCBNYXBFbnRyeV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYnVpbHQgPSBidWlsdFxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE1hcEVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5IC8qIFZhbCAqLywgdmFsIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdHRoaXMudmFsID0gdmFsXG5cdFx0fVxuXHR9XG5cbi8vIENvbmRpdGlvbmFsc1xuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVmFsICovLCByZXN1bHQgLyogQmxvY2tEbyAqLywgaXNVbmxlc3MgLyogQm9vbGVhbiAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDb25kaXRpb25hbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFZhbCAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovLCBpc1VubGVzcyAvKiBCb29sZWFuICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdFx0dGhpcy5pc1VubGVzcyA9IGlzVW5sZXNzXG5cdFx0fVxuXHR9XG5cbi8vIEZ1blxuXHRleHBvcnQgY2xhc3MgRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRvcERlY2xhcmVUaGlzLCAvLyBPcHRbTG9jYWxEZWNsYXJlVGhpc11cblx0XHRcdGlzR2VuZXJhdG9yLCAvLyBCb29sZWFuXG5cdFx0XHRhcmdzLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRvcFJlc3RBcmcsIC8vIE9wdFtMb2NhbERlY2xhcmVdXG5cdFx0XHRibG9jaywgLy8gQmxvY2tcblx0XHRcdG9wSW4sIC8vIE9wdFtEZWJ1Z11cblx0XHRcdG9wRGVjbGFyZVJlcywgLy8gT3B0W0xvY2FsRGVjbGFyZVJlc11cblx0XHRcdG9wT3V0KSB7IC8vIE9wdFtEZWJ1Z11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3Ncblx0XHRcdGlmIChvcEluID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wSW4gPSBudWxsXG5cdFx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcE91dCA9IG51bGxcblxuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID0gb3BEZWNsYXJlVGhpc1xuXHRcdFx0dGhpcy5pc0dlbmVyYXRvciA9IGlzR2VuZXJhdG9yXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0XHR0aGlzLm9wUmVzdEFyZyA9IG9wUmVzdEFyZ1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLm9wSW4gPSBvcEluXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVJlcyA9IG9wRGVjbGFyZVJlc1xuXHRcdFx0dGhpcy5vcE91dCA9IG9wT3V0XG5cdFx0fVxuXHR9XG5cbi8vIEdlbmVyYXRvclxuXHRleHBvcnQgY2xhc3MgWWllbGQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BZaWVsZGVkIC8qIE9wdFtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRcdGlmIChvcFlpZWxkZWQgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0b3BZaWVsZGVkID0gbnVsbFxuXHRcdFx0dGhpcy5vcFlpZWxkZWQgPSBvcFlpZWxkZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgWWllbGRUbyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB5aWVsZGVkVG8gLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnlpZWxkZWRUbyA9IHlpZWxkZWRUb1xuXHRcdH1cblx0fVxuXG4vLyBDbGFzc1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdG9wU3VwZXJDbGFzcywgLy8gT3B0W1ZhbF1cblx0XHRcdG9wRG8sIC8vIE9wdFtDbGFzc0RvXSxcblx0XHRcdHN0YXRpY3MsIC8vIEFycmF5W0Z1bl1cblx0XHRcdG9wQ29uc3RydWN0b3IsIC8vIE9wdFtGdW5dXG5cdFx0XHRtZXRob2RzKSB7IC8vIE1ldGhvZEltcGxcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BTdXBlckNsYXNzID0gb3BTdXBlckNsYXNzXG5cdFx0XHR0aGlzLm9wRG8gPSBvcERvXG5cdFx0XHR0aGlzLnN0YXRpY3MgPSBzdGF0aWNzXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IgPSBvcENvbnN0cnVjdG9yXG5cdFx0XHR0aGlzLm1ldGhvZHMgPSBtZXRob2RzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0XG5cdFx0TUlfUGxhaW4gPSAwLFxuXHRcdE1JX0dldCA9IDEsXG5cdFx0TUlfU2V0ID0gMlxuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQgLyogTnVtYmVyICovLCBzeW1ib2wgLyogVW5pb25bU3RyaW5nIFZhbF0gKi8sIGZ1biAvKiBGdW4gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdHRoaXMuc3ltYm9sID0gc3ltYm9sXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDbGFzc0RvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZUZvY3VzIC8qIExvY2FsRGVjbGFyZUZvY3VzICovLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IGRlY2xhcmVGb2N1c1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cbi8vIENhbGxzXG5cdGV4cG9ydCBjbGFzcyBDYWxsIGV4dGVuZHMgVmFsIHtcblx0XHRzdGF0aWMgY29udGFpbnMobG9jLCB0ZXN0VHlwZSwgdGVzdGVkKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNWX0NvbnRhaW5zKSwgWyB0ZXN0VHlwZSwgdGVzdGVkIF0pXG5cdFx0fVxuXG5cdFx0c3RhdGljIHN1Yihsb2MsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU1ZfU3ViKSwgYXJncylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCAvKiBWYWwgKi8sIGFyZ3MgLyogQXJyYXlbVW5pb25bVmFsIFNwbGF0XV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlIC8qIFZhbCAqLywgYXJncyAvKiBVbmlvbltWYWwgU3BsYXRdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFNwbGF0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3BsYXR0ZWQgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnNwbGF0dGVkID0gc3BsYXR0ZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BDYXNlZCwgLy8gT3B0W0Fzc2lnblNpbmdsZV1cblx0XHRcdHBhcnRzLCAvLyBBcnJheVtDYXNlRG9QYXJ0XVxuXHRcdFx0b3BFbHNlKSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0XHRpZiAob3BFbHNlID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wRWxzZSA9IG51bGxcblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZVZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BDYXNlZCwgLy8gT3B0W0Fzc2lnblNpbmdsZV1cblx0XHRcdHBhcnRzLCAvLyBBcnJheVtDYXNlVmFsUGFydF1cblx0XHRcdG9wRWxzZSkgeyAvLyBPcHRbQmxvY2tWYWxdXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRcdGlmIChvcEVsc2UgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0b3BFbHNlID0gbnVsbFxuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCAvKiBVbmlvbltWYWwgUGF0dGVybl0gKi8sIHJlc3VsdCAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXNlVmFsUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVW5pb25bVmFsIFBhdHRlcm5dICovLCByZXN1bHQgLyogQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFBhdHRlcm4gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0dHlwZSwgLy8gVmFsXG5cdFx0XHRsb2NhbHMsIC8vIEFycmF5W0xvY2FsRGVjbGFyZV1cblx0XHRcdHBhdHRlcm5lZCkgeyAvLyBMb2NhbEFjY2Vzc1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0dGhpcy5sb2NhbHMgPSBsb2NhbHNcblx0XHRcdHRoaXMucGF0dGVybmVkID0gcGF0dGVybmVkXG5cdFx0fVxuXHR9XG5cbi8vIFN3aXRjaFxuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0c3dpdGNoZWQsIC8vIFZhbFxuXHRcdFx0cGFydHMsIC8vIEFycmF5W1N3aXRjaERvUGFydF1cblx0XHRcdG9wRWxzZSkgeyAvLyBPcHRbQmxvY2tEb11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuc3dpdGNoZWQgPSBzd2l0Y2hlZFxuXHRcdFx0dGhpcy5wYXJ0cyA9ICBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRzd2l0Y2hlZCwgLy8gVmFsXG5cdFx0XHRwYXJ0cywgLy8gQXJyYXlbU3dpdGNoVmFsUGFydF1cblx0XHRcdG9wRWxzZSkgeyAvLyBPcHRbQmxvY2tWYWxdXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnN3aXRjaGVkID0gc3dpdGNoZWRcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzIC8qIEFycmF5W1ZhbF0gKi8sIHJlc3VsdCAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcyAvKiBBcnJheVtWYWxdICovLCByZXN1bHQgLyogQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG4vLyBGb3Jcblx0ZXhwb3J0IGNsYXNzIEZvckRvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSAvKiBPcHRbSXRlcmF0ZWVdICovLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgRm9yVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUgLyogT3B0W0l0ZXJhdGVlXSAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEZvckJhZyBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIG9mKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHJldHVybiBuZXcgRm9yQmFnKGxvYywgbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYyksIG9wSXRlcmF0ZWUsIGJsb2NrKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdGJ1aWx0LCAvLyBMb2NhbERlY2xhcmVCdWlsdFxuXHRcdFx0b3BJdGVyYXRlZSwgLy8gT3B0W0l0ZXJhdGVlXVxuXHRcdFx0YmxvY2spIHsgLy8gQmxvY2tEb1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5idWlsdCA9IGJ1aWx0XG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgSXRlcmF0ZWUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBlbGVtZW50IC8qIExvY2FsRGVjbGFyZSAqLywgYmFnIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudFxuXHRcdFx0dGhpcy5iYWcgPSBiYWdcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQnJlYWsgZXh0ZW5kcyBEbyB7IH1cblxuXHRleHBvcnQgY2xhc3MgQnJlYWtXaXRoVmFsIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBNaXNjIFZhbHNcblx0ZXhwb3J0IGNsYXNzIEJsb2NrV3JhcCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jayAvKiBCbG9ja1ZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJhZ1NpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cyAvKiBBcnJheVtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgT2JqU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhaXJzIC8qIEFycmF5W09ialBhaXJdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhaXJzID0gcGFpcnNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgT2JqUGFpciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSAvKiBTdHJpbmcgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdFxuXHRcdExfQW5kID0gMCxcblx0XHRMX09yID0gMVxuXHRleHBvcnQgY2xhc3MgTG9naWMgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8sIGFyZ3MgLyogQXJyYXlbVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBOb3QgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJnIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hcmcgPSBhcmdcblx0XHR9XG5cdH1cblxuXHQvLyBTdG9yZSB0aGUgdmFsdWUgYXMgYSBTdHJpbmcgc28gd2UgY2FuIGRpc3Rpbmd1aXNoIGAweGZgIGZyb20gYDE1YC5cblx0ZXhwb3J0IGNsYXNzIE51bWJlckxpdGVyYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUgLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCAvKiBWYWwgKi8sIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBRdW90ZSBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGZvclN0cmluZyhsb2MsIHN0cikge1xuXHRcdFx0cmV0dXJuIG5ldyBRdW90ZShsb2MsIFsgc3RyIF0pXG5cdFx0fVxuXG5cdFx0Ly8gcGFydHMgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMgLyogQXJyYXlbVW5pb25bU3RyaW5nIFZhbF1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgUXVvdGVUZW1wbGF0ZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0YWcgLyogVmFsICovLCBxdW90ZSAvKiBRdW90ZSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdHRoaXMucXVvdGUgPSBxdW90ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBXaXRoIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGRlY2xhcmUgLyogTG9jYWxEZWNsYXJlICovLCB2YWx1ZSAvKiBWYWwgKi8sIGJsb2NrIC8qIEJsb2NrRG8gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuZGVjbGFyZSA9IGRlY2xhcmVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cbi8vIFNwZWNpYWxcblx0ZXhwb3J0IGNvbnN0IFNEX0RlYnVnZ2VyID0gMFxuXHRleHBvcnQgY2xhc3MgU3BlY2lhbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY29uc3Rcblx0XHRTVl9Db250YWlucyA9IDAsXG5cdFx0U1ZfRmFsc2UgPSAxLFxuXHRcdFNWX051bGwgPSAyLFxuXHRcdFNWX1N1YiA9IDMsXG5cdFx0U1ZfU3VwZXIgPSA0LFxuXHRcdFNWX1RydWUgPSA1LFxuXHRcdFNWX1VuZGVmaW5lZCA9IDYsXG5cdFx0U1ZfTmFtZSA9IDdcblx0ZXhwb3J0IGNsYXNzIFNwZWNpYWxWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgSWdub3JlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaWdub3JlZCAvKiBBcnJheVtTdHJpbmddICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmlnbm9yZWQgPSBpZ25vcmVkXG5cdFx0fVxuXHR9Il0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
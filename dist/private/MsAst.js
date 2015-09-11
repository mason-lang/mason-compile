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
		opUseGlobal, // Nullable[UseGlobal]
		debugUses, // Array[Use]
		lines, // Array[Do]
		exports, // Array[LocalDeclare]
		opDefaultExport) {
			// Opt[Val]
			super(loc);
			this.doUses = doUses;
			this.uses = uses;
			this.opUseGlobal = opUseGlobal;
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

	exports.Use = Use;

	class UseGlobal extends MsAst {
		constructor(loc, used, /* Array[LocalDeclare] */opUseDefault /* Opt[LocalDeclare] */) {
			super(loc);
			this.used = used;
			this.opUseDefault = opUseDefault;
		}
	}

	// Locals
	exports.UseGlobal = UseGlobal;
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
			// TODO:ES6 optional arguments
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
			// TODO:ES6 optional arguments
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
		statics, // Array[MethodImplLike]
		opConstructor, // Opt[Fun]
		methods) {
			// Array[MethodImplLike]
			super(loc);
			this.opSuperClass = opSuperClass;
			this.opDo = opDo;
			this.statics = statics;
			this.opConstructor = opConstructor;
			this.methods = methods;
		}
	}

	exports.Class = Class;

	class Constructor extends MsAst {
		constructor(loc, fun, /* Fun*/memberArgs /* Array[LocalDeclare] */) {
			super(loc);
			this.fun = fun;
			this.memberArgs = memberArgs;
		}
	}

	exports.Constructor = Constructor;

	class MethodImplLike extends MsAst {
		constructor(loc, symbol /* Union[String Val] */) {
			super(loc);
			this.symbol = symbol;
		}
	}

	exports.MethodImplLike = MethodImplLike;

	class MethodImpl extends MethodImplLike {
		constructor(loc, symbol, fun /* Fun */) {
			super(loc, symbol);
			this.fun = fun;
		}
	}

	exports.MethodImpl = MethodImpl;

	class MethodGetter extends MethodImplLike {
		constructor(loc, symbol, block /* BlockVal */) {
			super(loc, symbol);
			this.block = block;
			this.declareThis = new LocalDeclareThis(loc);
		}
	}

	exports.MethodGetter = MethodGetter;

	class MethodSetter extends MethodImplLike {
		constructor(loc, symbol, block /* BlockDo */) {
			super(loc, symbol);
			this.block = block;
			this.declareThis = new LocalDeclareThis(loc);
			this.declareFocus = new LocalDeclareFocus(loc);
		}
	}

	exports.MethodSetter = MethodSetter;

	class ClassDo extends MsAst {
		constructor(loc, declareFocus, /* LocalDeclareFocus */block /* BlockDo */) {
			super(loc);
			this.declareFocus = declareFocus;
			this.block = block;
		}
	}

	exports.ClassDo = ClassDo;

	class SuperCall extends Val {
		constructor(loc, args /* Array[Union[Val Splat]] */) {
			super(loc);
			this.args = args;
		}
	}

	exports.SuperCall = SuperCall;

	class SuperCallDo extends Do {
		constructor(loc, args /* Array[Union[Val Splat]] */) {
			super(loc);
			this.args = args;
		}
	}

	exports.SuperCallDo = SuperCallDo;

	class SuperMember extends Val {
		constructor(loc, name /* String */) {
			super(loc);
			this.name = name;
		}
	}

	// Calls
	exports.SuperMember = SuperMember;

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
		// part Strings are raw values, meaning "\n" is two characters.
		// Since "\{" is special to Mason, that's only one character.
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
	      SV_True = 4,
	      SV_Undefined = 5,
	      SV_Name = 6;
	exports.SV_Contains = SV_Contains;
	exports.SV_False = SV_False;
	exports.SV_Null = SV_Null;
	exports.SV_Sub = SV_Sub;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1zQXN0LmpzIiwicHJpdmF0ZS9Nc0FzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FlLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDs7QUFFRCxVQUFRLEdBQUc7QUFDVixTQUFNLE9BQU8sR0FBRyxDQUFDLElBQ2hCLENBQUMsS0FBSyxJQUFJLEdBQ1QsTUFBTSxHQUNOLENBQUMsS0FBSyxTQUFTLEdBQ2YsV0FBVyxHQUNYLENBQUMsWUFBWSxLQUFLLEdBQ2xCLENBQUMsS0FBSyxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLENBQUMsR0FDM0QsT0FBTyxDQUFDLEtBQUssUUFBUSxHQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUNqQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7O0FBRWQsU0FBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUVoRCxTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtBQUNsQyxTQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQ3RDLE1BQU0sR0FBRyxDQUFDLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1RCxVQUFPLENBQUMsR0FBRSxJQUFJLEVBQUMsQ0FBQyxHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUMxQjtFQUNEOzs7O21CQXhCb0IsS0FBSzs7QUE0QmxCLE9BQU0sV0FBVyxTQUFTLEtBQUssQ0FBQyxFQUFHOzs7OztBQUduQyxPQUFNLEVBQUUsU0FBUyxXQUFXLENBQUMsRUFBRzs7Ozs7QUFHaEMsT0FBTSxHQUFHLFNBQVMsV0FBVyxDQUFDLEVBQUc7Ozs7O0FBR2pDLE9BQU0sTUFBTSxTQUFTLEtBQUssQ0FBQztBQUNqQyxhQUFXLENBQUMsR0FBRyxFQUNkLE1BQU07QUFDTixNQUFJO0FBQ0osYUFBVztBQUNYLFdBQVM7QUFDVCxPQUFLO0FBQ0wsU0FBTztBQUNQLGlCQUFlLEVBQUU7O0FBQ2pCLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFBO0dBQ3RDO0VBQ0Q7Ozs7QUFFTSxPQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7OztBQUVNLE9BQU0sR0FBRyxTQUFTLEtBQUssQ0FBQztBQUM5QixhQUFXLENBQUMsR0FBRyxFQUNkLElBQUk7QUFDSixNQUFJO0FBQ0osY0FBWSxFQUFFOztBQUNkLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0dBQ2hDO0VBQ0Q7Ozs7QUFFTSxPQUFNLFNBQVMsU0FBUyxLQUFLLENBQUM7QUFDcEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLDJCQUE0QixZQUFZLDBCQUEwQjtBQUN0RixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtHQUNoQztFQUNEOzs7O0FBR00sT0FDTixRQUFRLEdBQUcsQ0FBQztPQUNaLE9BQU8sR0FBRyxDQUFDO09BQ1gsVUFBVSxHQUFHLENBQUMsQ0FBQTs7Ozs7QUFDUixPQUFNLFlBQVksU0FBUyxLQUFLLENBQUM7QUFDdkMsU0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDL0IsVUFBTyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUM5Qzs7QUFFRCxTQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLFVBQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDbEQ7O0FBRUQsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGNBQWUsTUFBTSxnQkFBaUIsSUFBSSxlQUFlO0FBQzdFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCOztBQUVELFFBQU0sR0FBRztBQUNSLFVBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUE7R0FDNUI7O0FBRUQsV0FBUyxHQUFHO0FBQ1gsVUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtHQUMvQjtFQUNEOzs7O0FBRU0sT0FBTSxpQkFBaUIsU0FBUyxZQUFZLENBQUM7QUFDbkQsYUFBVyxDQUFDLEdBQUcsRUFBRTtBQUNoQixRQUFLLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDbkM7RUFDRDs7OztBQUNNLE9BQU0saUJBQWlCLFNBQVMsWUFBWSxDQUFDO0FBQ25ELGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsUUFBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0dBQy9CO0VBQ0Q7Ozs7QUFDTSxPQUFNLGdCQUFnQixTQUFTLFlBQVksQ0FBQztBQUNsRCxhQUFXLENBQUMsR0FBRyxFQUFFO0FBQ2hCLFFBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUNsQztFQUNEOzs7O0FBQ00sT0FBTSxnQkFBZ0IsU0FBUyxZQUFZLENBQUM7QUFDbEQsYUFBVyxDQUFDLEdBQUcsRUFBRTtBQUNoQixRQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDbEM7RUFDRDs7OztBQUNNLE9BQU0sZUFBZSxTQUFTLFlBQVksQ0FBQztBQUNqRCxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRTtBQUN4QixRQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDbkM7RUFDRDs7OztBQUVNLE9BQU0sV0FBVyxTQUFTLEdBQUcsQ0FBQztBQUNwQyxTQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUU7QUFDakIsVUFBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7R0FDaEM7O0FBRUQsU0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ2hCLFVBQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0dBQ25DOztBQUVELGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxlQUFlO0FBQ25DLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFdBQVcsU0FBUyxFQUFFLENBQUM7QUFDbkMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGNBQWUsS0FBSyxZQUFZO0FBQ3BELFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxNQUFNLFNBQVMsRUFBRSxDQUFDLEVBQUc7Ozs7QUFFM0IsT0FBTSxZQUFZLFNBQVMsTUFBTSxDQUFDO0FBQ3hDLFNBQU8sS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDeEIsVUFBTyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUMvRDs7QUFFRCxhQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsb0JBQXFCLEtBQUssWUFBWTtBQUM5RCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtBQUN4QixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjs7QUFFRCxjQUFZLEdBQUc7QUFBRSxVQUFPLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFBO0dBQUU7RUFDM0M7Ozs7QUFFTSxPQUFNLGlCQUFpQixTQUFTLE1BQU0sQ0FBQztBQUM3QyxhQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsMkJBQTRCLEtBQUssWUFBWTtBQUN0RSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjs7QUFFRCxjQUFZLEdBQUc7QUFDZCxVQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7R0FDckI7O0FBRUQsTUFBSSxHQUFHO0FBQ04sVUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtHQUM3QjtFQUNEOzs7QUFFTSxPQUNOLE1BQU0sR0FBRyxDQUFDO09BQ1YsU0FBUyxHQUFHLENBQUM7T0FDYixhQUFhLEdBQUcsQ0FBQyxDQUFBOzs7OztBQUNYLE9BQU0sU0FBUyxTQUFTLEVBQUUsQ0FBQztBQUNqQyxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sV0FBWSxJQUFJLGNBQWUsSUFBSSxjQUFlLEtBQUssWUFBWTtBQUN6RixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7OztBQUdNLE9BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztBQUM3QixhQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsaUJBQWlCO0FBQ3pDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFVixPQUFJLFFBQVEsS0FBSyxTQUFTLEVBQ3pCLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7R0FDeEI7RUFDRDs7OztBQUVNLE9BQU0sTUFBTSxTQUFTLEVBQUUsQ0FBQztBQUM5QixhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sZUFBZ0IsU0FBUyxXQUFZLFFBQVEsaUJBQWlCO0FBQ3BGLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBOztBQUVwQixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN4QjtFQUNEOzs7O0FBRU0sT0FBTSxRQUFRLFNBQVMsRUFBRSxDQUFDO0FBQ2hDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxlQUFnQixNQUFNLGtCQUFtQixRQUFRLHFCQUFxQjtBQUMxRixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN4QjtFQUNEOzs7O0FBRU0sT0FBTSxTQUFTLFNBQVMsR0FBRyxDQUFDO0FBQ2xDLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsSUFBSTtBQUNKLFFBQU07QUFDTixVQUFRLEVBQUU7O0FBQ1YsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7R0FDeEI7RUFDRDs7OztBQUVNLE9BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sb0JBQXFCLEtBQUsseUJBQXlCO0FBQ3pFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO0FBQzdCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSywyQkFBMkI7QUFDaEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7Ozs7QUFHTSxPQUFNLE9BQU8sU0FBUyxLQUFLLENBQUM7QUFDbEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLDJCQUEyQjtBQUNoRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxRQUFRLFNBQVMsS0FBSyxDQUFDLEVBQUc7Ozs7QUFFaEMsT0FBTSxlQUFlLFNBQVMsUUFBUSxDQUFDO0FBQzdDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSywwQkFBMkIsUUFBUSxZQUFZO0FBQ3BFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0dBQ3hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLGFBQWEsU0FBUyxRQUFRLENBQUM7QUFDM0MsYUFBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLDBCQUEyQixNQUFNLGNBQWM7QUFDcEUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUE7R0FDbkI7RUFDRDs7Ozs7QUFHTSxPQUFNLFFBQVEsU0FBUyxRQUFRLENBQUM7QUFDdEMsU0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFOztBQUV0QyxPQUFJLE9BQU8sS0FBSyxTQUFTLEVBQ3hCLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDZixPQUFJLE1BQU0sS0FBSyxTQUFTLEVBQ3ZCLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDZCxVQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDNUU7O0FBRUQsYUFBVyxDQUFDLEdBQUcsRUFDZCxLQUFLO0FBQ0wsT0FBSztBQUNMLFNBQU87QUFDUCxRQUFNLEVBQUU7O0FBQ1IsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUNNLE9BQU0sUUFBUSxTQUFTLEVBQUUsQ0FBQyxFQUFHOzs7O0FBRTdCLE9BQU0sY0FBYyxTQUFTLFFBQVEsQ0FBQztBQUM1QyxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sZUFBZTtBQUNyQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7O0FBRU0sT0FBTSxnQkFBZ0IsU0FBUyxRQUFRLENBQUM7QUFDOUMsU0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUN2QixVQUFPLElBQUksZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQ3JFOztBQUVELGFBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxXQUFZLEtBQUssWUFBWTtBQUNoRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUNkLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFFBQVEsU0FBUyxRQUFRLENBQUM7QUFDdEMsU0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNyQixVQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQzNEOztBQUVELGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyx5QkFBMEIsS0FBSyxvQ0FBb0M7QUFDeEYsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sUUFBUSxTQUFTLEVBQUUsQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssWUFBWTtBQUNqQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxZQUFZLFNBQVMsRUFBRSxDQUFDO0FBQ3BDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxZQUFZO0FBQ2pDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFFBQVEsU0FBUyxRQUFRLENBQUM7QUFDdEMsU0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNyQixVQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQzNEOztBQUVELGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyx5QkFBMEIsS0FBSyxvQ0FBb0M7QUFDeEYsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sUUFBUSxTQUFTLEVBQUUsQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBWSxHQUFHLFlBQVk7QUFDOUMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtHQUNkO0VBQ0Q7Ozs7O0FBR00sT0FBTSxhQUFhLFNBQVMsRUFBRSxDQUFDO0FBQ3JDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxXQUFZLE1BQU0sZUFBZ0IsUUFBUSxnQkFBZ0I7QUFDOUUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7R0FDeEI7RUFDRDs7OztBQUVNLE9BQU0sY0FBYyxTQUFTLEdBQUcsQ0FBQztBQUN2QyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksV0FBWSxNQUFNLGdCQUFpQixRQUFRLGdCQUFnQjtBQUMvRSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN4QjtFQUNEOzs7OztBQUdNLE9BQU0sR0FBRyxTQUFTLEdBQUcsQ0FBQztBQUM1QixhQUFXLENBQUMsR0FBRyxFQUNkLGFBQWE7QUFDYixhQUFXO0FBQ1gsTUFBSTtBQUNKLFdBQVM7QUFDVCxPQUFLO0FBQ0wsTUFBSTtBQUNKLGNBQVk7QUFDWixPQUFLLEVBQUU7O0FBQ1AsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVWLE9BQUksSUFBSSxLQUFLLFNBQVMsRUFDckIsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNaLE9BQUksWUFBWSxLQUFLLFNBQVMsRUFDN0IsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUNwQixPQUFJLEtBQUssS0FBSyxTQUFTLEVBQ3RCLEtBQUssR0FBRyxJQUFJLENBQUE7O0FBRWIsT0FBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDbEMsT0FBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDOUIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDMUIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7QUFDaEMsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7Ozs7QUFHTSxPQUFNLEtBQUssU0FBUyxHQUFHLENBQUM7QUFDOUIsYUFBVyxDQUFDLEdBQUcsRUFBRSxTQUFTLGlCQUFpQjtBQUMxQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRVYsT0FBSSxTQUFTLEtBQUssU0FBUyxFQUMxQixTQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0dBQzFCO0VBQ0Q7Ozs7QUFFTSxPQUFNLE9BQU8sU0FBUyxHQUFHLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxTQUFTLFlBQVk7QUFDckMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7R0FDMUI7RUFDRDs7Ozs7QUFHTSxPQUFNLEtBQUssU0FBUyxHQUFHLENBQUM7QUFDOUIsYUFBVyxDQUFDLEdBQUcsRUFDZCxZQUFZO0FBQ1osTUFBSTtBQUNKLFNBQU87QUFDUCxlQUFhO0FBQ2IsU0FBTyxFQUFFOztBQUNULFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0FBQ2hDLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBQ2xDLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0dBQ3RCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFdBQVcsU0FBUyxLQUFLLENBQUM7QUFDdEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVcsVUFBVSw0QkFBNEI7QUFDcEUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtHQUM1QjtFQUNEOzs7O0FBRU0sT0FBTSxjQUFjLFNBQVMsS0FBSyxDQUFDO0FBQ3pDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSwwQkFBMEI7QUFDaEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUNNLE9BQU0sVUFBVSxTQUFTLGNBQWMsQ0FBQztBQUM5QyxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLFlBQVk7QUFDdkMsUUFBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNsQixPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtHQUNkO0VBQ0Q7Ozs7QUFDTSxPQUFNLFlBQVksU0FBUyxjQUFjLENBQUM7QUFDaEQsYUFBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxpQkFBaUI7QUFDOUMsUUFBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNsQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsV0FBVyxHQUFHLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUE7R0FDNUM7RUFDRDs7OztBQUNNLE9BQU0sWUFBWSxTQUFTLGNBQWMsQ0FBQztBQUNoRCxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLGdCQUFnQjtBQUM3QyxRQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1QyxPQUFJLENBQUMsWUFBWSxHQUFHLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUE7R0FDOUM7RUFDRDs7OztBQUVNLE9BQU0sT0FBTyxTQUFTLEtBQUssQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUFFLFlBQVkseUJBQTBCLEtBQUssZ0JBQWdCO0FBQzNFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0FBQ2hDLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFNBQVMsU0FBUyxHQUFHLENBQUM7QUFDbEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGdDQUFnQztBQUNwRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBQ00sT0FBTSxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxnQ0FBZ0M7QUFDcEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7OztBQUVNLE9BQU0sV0FBVyxTQUFTLEdBQUcsQ0FBQztBQUNwQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksZUFBZTtBQUNuQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7OztBQUdNLE9BQU0sSUFBSSxTQUFTLEdBQUcsQ0FBQztBQUM3QixTQUFPLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUN0QyxVQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLFVBQVUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBRSxRQUFRLEVBQUUsTUFBTSxDQUFFLENBQUMsQ0FBQTtHQUM1RTs7QUFFRCxTQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3JCLFVBQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUN2RDs7QUFFRCxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sV0FBWSxJQUFJLGdDQUFnQztBQUN0RSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBRU0sT0FBTSxHQUFHLFNBQVMsR0FBRyxDQUFDO0FBQzVCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxXQUFZLElBQUkseUJBQXlCO0FBQzdELFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLFlBQVk7QUFDcEMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7R0FDeEI7RUFDRDs7OztBQUVNLE9BQU0sSUFBSSxTQUFTLEdBQUcsQ0FBQztBQUM3QixhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssWUFBWTtBQUNqQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7OztBQUdNLE9BQU0sTUFBTSxTQUFTLEVBQUUsQ0FBQztBQUM5QixhQUFXLENBQUMsR0FBRyxFQUNkLE9BQU87QUFDUCxPQUFLO0FBQ0wsUUFBTSxFQUFFOztBQUNSLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFVixPQUFJLE1BQU0sS0FBSyxTQUFTLEVBQ3ZCLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDZCxPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUN0QixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7O0FBRU0sT0FBTSxPQUFPLFNBQVMsR0FBRyxDQUFDO0FBQ2hDLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsT0FBTztBQUNQLE9BQUs7QUFDTCxRQUFNLEVBQUU7O0FBQ1IsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVWLE9BQUksTUFBTSxLQUFLLFNBQVMsRUFDdkIsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNkLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0dBQ3BCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFVBQVUsU0FBUyxLQUFLLENBQUM7QUFDckMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLDBCQUEyQixNQUFNLGdCQUFnQjtBQUNyRSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7O0FBRU0sT0FBTSxXQUFXLFNBQVMsS0FBSyxDQUFDO0FBQ3RDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSwwQkFBMkIsTUFBTSxpQkFBaUI7QUFDdEUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUVNLE9BQU0sT0FBTyxTQUFTLEtBQUssQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUNkLElBQUk7QUFDSixRQUFNO0FBQ04sV0FBUyxFQUFFOztBQUNYLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0dBQzFCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxRQUFRLFNBQVMsRUFBRSxDQUFDO0FBQ2hDLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsUUFBUTtBQUNSLE9BQUs7QUFDTCxRQUFNLEVBQUU7O0FBQ1IsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsT0FBSSxDQUFDLEtBQUssR0FBSSxLQUFLLENBQUE7QUFDbkIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUVNLE9BQU0sU0FBUyxTQUFTLEdBQUcsQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUNkLFFBQVE7QUFDUixPQUFLO0FBQ0wsUUFBTSxFQUFFOztBQUNSLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0dBQ3BCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFlBQVksU0FBUyxLQUFLLENBQUM7QUFDdkMsYUFBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLGtCQUFtQixNQUFNLGdCQUFnQjtBQUMvRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7O0FBRU0sT0FBTSxhQUFhLFNBQVMsS0FBSyxDQUFDO0FBQ3hDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxrQkFBbUIsTUFBTSxpQkFBaUI7QUFDaEUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7Ozs7QUFHTSxPQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7QUFDN0IsYUFBVyxDQUFDLEdBQUcsRUFBRSxVQUFVLHFCQUFzQixLQUFLLGdCQUFnQjtBQUNyRSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtBQUM1QixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxNQUFNLFNBQVMsR0FBRyxDQUFDO0FBQy9CLGFBQVcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxxQkFBc0IsS0FBSyxnQkFBZ0I7QUFDckUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDNUIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sTUFBTSxTQUFTLEdBQUcsQ0FBQztBQUMvQixTQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRTtBQUNqQyxVQUFPLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUNyRTs7QUFFRCxhQUFXLENBQUMsR0FBRyxFQUNkLEtBQUs7QUFDTCxZQUFVO0FBQ1YsT0FBSyxFQUFFOztBQUNQLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQzVCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFFBQVEsU0FBUyxLQUFLLENBQUM7QUFDbkMsYUFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLG9CQUFxQixHQUFHLFlBQVk7QUFDM0QsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDtFQUNEOzs7O0FBRU0sT0FBTSxLQUFLLFNBQVMsRUFBRSxDQUFDLEVBQUc7Ozs7QUFFMUIsT0FBTSxZQUFZLFNBQVMsRUFBRSxDQUFDO0FBQ3BDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQ3ZCLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxTQUFTLFNBQVMsR0FBRyxDQUFDO0FBQ2xDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxpQkFBaUI7QUFDdEMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sU0FBUyxTQUFTLEdBQUcsQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssbUJBQW1CO0FBQ3hDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFNBQVMsU0FBUyxHQUFHLENBQUM7QUFDbEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLHVCQUF1QjtBQUM1QyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxPQUFPLFNBQVMsS0FBSyxDQUFDO0FBQ2xDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxjQUFlLEtBQUssWUFBWTtBQUNuRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUNkLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7OztBQUVNLE9BQ04sS0FBSyxHQUFHLENBQUM7T0FDVCxJQUFJLEdBQUcsQ0FBQyxDQUFBOzs7O0FBQ0YsT0FBTSxLQUFLLFNBQVMsR0FBRyxDQUFDO0FBQzlCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxjQUFlLElBQUksbUJBQW1CO0FBQzFELFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLEdBQUcsU0FBUyxHQUFHLENBQUM7QUFDNUIsYUFBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFlBQVk7QUFDL0IsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDtFQUNEOzs7OztBQUdNLE9BQU0sYUFBYSxTQUFTLEdBQUcsQ0FBQztBQUN0QyxhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssZUFBZTtBQUNwQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxNQUFNLFNBQVMsR0FBRyxDQUFDO0FBQy9CLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxXQUFZLElBQUksZUFBZTtBQUNyRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBRU0sT0FBTSxLQUFLLFNBQVMsR0FBRyxDQUFDO0FBQzlCLFNBQU8sU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDMUIsVUFBTyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBRSxHQUFHLENBQUUsQ0FBQyxDQUFBO0dBQzlCOzs7OztBQUtELGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxpQ0FBaUM7QUFDdEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sYUFBYSxTQUFTLEdBQUcsQ0FBQztBQUN0QyxhQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBWSxLQUFLLGNBQWM7QUFDbEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxJQUFJLFNBQVMsR0FBRyxDQUFDO0FBQzdCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxvQkFBcUIsS0FBSyxXQUFZLEtBQUssZ0JBQWdCO0FBQ2xGLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFHTSxPQUFNLFdBQVcsR0FBRyxDQUFDLENBQUE7OztBQUNyQixPQUFNLFNBQVMsU0FBUyxFQUFFLENBQUM7QUFDakMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7O0FBRU0sT0FDTixXQUFXLEdBQUcsQ0FBQztPQUNmLFFBQVEsR0FBRyxDQUFDO09BQ1osT0FBTyxHQUFHLENBQUM7T0FDWCxNQUFNLEdBQUcsQ0FBQztPQUNWLE9BQU8sR0FBRyxDQUFDO09BQ1gsWUFBWSxHQUFHLENBQUM7T0FDaEIsT0FBTyxHQUFHLENBQUMsQ0FBQTs7Ozs7Ozs7O0FBQ0wsT0FBTSxVQUFVLFNBQVMsR0FBRyxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxlQUFlO0FBQ25DLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLE1BQU0sU0FBUyxFQUFFLENBQUM7QUFDOUIsYUFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLHNCQUFzQjtBQUM3QyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtHQUN0QjtFQUNEIiwiZmlsZSI6InByaXZhdGUvTXNBc3QuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdGNvbnN0IGluc3BlY3QgPSBfID0+XG5cdFx0XHRfID09PSBudWxsID9cblx0XHRcdFx0J251bGwnIDpcblx0XHRcdFx0XyA9PT0gdW5kZWZpbmVkID9cblx0XHRcdFx0J3VuZGVmaW5lZCcgOlxuXHRcdFx0XHRfIGluc3RhbmNlb2YgQXJyYXkgP1xuXHRcdFx0XHRgW1xcblxcdCR7Xy5tYXAoXyA9PiBpbmRlbnQoXy50b1N0cmluZygpKSkuam9pbignLFxcblxcdCcpfVxcbl1gIDpcblx0XHRcdFx0dHlwZW9mIF8gPT09ICdzdHJpbmcnID9cblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkoXykgOlxuXHRcdFx0XHRfLnRvU3RyaW5nKClcblxuXHRcdGNvbnN0IGluZGVudCA9IHN0ciA9PiBzdHIucmVwbGFjZSgvXFxuL2csICdcXG5cXHQnKVxuXG5cdFx0Y29uc3QgdHlwZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZVxuXHRcdGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXModGhpcykubWFwKGtleSA9PlxuXHRcdFx0J1xcblxcdCcgKyBgJHtrZXl9OiBgICsgaW5kZW50KGluc3BlY3QodGhpc1trZXldKSkpLmpvaW4oJywnKVxuXHRcdHJldHVybiBgJHt0eXBlfSgke3Byb3BzfSlgXG5cdH1cbn1cblxuLy8gTGluZUNvbnRlbnRcblx0Ly8gVmFsaWQgcGFydCBvZiBhIEJsb2NrLlxuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7IH1cblxuXHQvLyBUaGVzZSBjYW4gb25seSBhcHBlYXIgYXMgbGluZXMgaW4gYSBCbG9jay5cblx0ZXhwb3J0IGNsYXNzIERvIGV4dGVuZHMgTGluZUNvbnRlbnQgeyB9XG5cblx0Ly8gVGhlc2UgY2FuIGFwcGVhciBpbiBhbnkgZXhwcmVzc2lvbi5cblx0ZXhwb3J0IGNsYXNzIFZhbCBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG4vLyBNb2R1bGVcblx0ZXhwb3J0IGNsYXNzIE1vZHVsZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRkb1VzZXMsIC8vIEFycmF5W1VzZURvXVxuXHRcdFx0dXNlcywgLy8gQXJyYXlbVXNlXVxuXHRcdFx0b3BVc2VHbG9iYWwsIC8vIE51bGxhYmxlW1VzZUdsb2JhbF1cblx0XHRcdGRlYnVnVXNlcywgLy8gQXJyYXlbVXNlXVxuXHRcdFx0bGluZXMsIC8vIEFycmF5W0RvXVxuXHRcdFx0ZXhwb3J0cywgLy8gQXJyYXlbTG9jYWxEZWNsYXJlXVxuXHRcdFx0b3BEZWZhdWx0RXhwb3J0KSB7IC8vIE9wdFtWYWxdXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmRvVXNlcyA9IGRvVXNlc1xuXHRcdFx0dGhpcy51c2VzID0gdXNlc1xuXHRcdFx0dGhpcy5vcFVzZUdsb2JhbCA9IG9wVXNlR2xvYmFsXG5cdFx0XHR0aGlzLmRlYnVnVXNlcyA9IGRlYnVnVXNlc1xuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLmV4cG9ydHMgPSBleHBvcnRzXG5cdFx0XHR0aGlzLm9wRGVmYXVsdEV4cG9ydCA9IG9wRGVmYXVsdEV4cG9ydFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBVc2VEbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGggLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFVzZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRwYXRoLCAvLyBTdHJpbmdcblx0XHRcdHVzZWQsIC8vIEFycmF5W0xvY2FsRGVjbGFyZV1cblx0XHRcdG9wVXNlRGVmYXVsdCkgeyAvLyBPcHRbTG9jYWxEZWNsYXJlXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdFx0dGhpcy51c2VkID0gdXNlZFxuXHRcdFx0dGhpcy5vcFVzZURlZmF1bHQgPSBvcFVzZURlZmF1bHRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgVXNlR2xvYmFsIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdXNlZCAvKiBBcnJheVtMb2NhbERlY2xhcmVdICovLCBvcFVzZURlZmF1bHQgLyogT3B0W0xvY2FsRGVjbGFyZV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudXNlZCA9IHVzZWRcblx0XHRcdHRoaXMub3BVc2VEZWZhdWx0ID0gb3BVc2VEZWZhdWx0XG5cdFx0fVxuXHR9XG5cbi8vIExvY2Fsc1xuXHRleHBvcnQgY29uc3Rcblx0XHRMRF9Db25zdCA9IDAsXG5cdFx0TERfTGF6eSA9IDEsXG5cdFx0TERfTXV0YWJsZSA9IDJcblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZSBleHRlbmRzIE1zQXN0IHtcblx0XHRzdGF0aWMgdW50eXBlZChsb2MsIG5hbWUsIGtpbmQpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwga2luZClcblx0XHR9XG5cblx0XHRzdGF0aWMgcGxhaW4obG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8sIG9wVHlwZSAvKiBPcHRbVmFsXSAqLywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXG5cdFx0aXNMYXp5KCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTERfTGF6eVxuXHRcdH1cblxuXHRcdGlzTXV0YWJsZSgpIHtcblx0XHRcdHJldHVybiB0aGlzLmtpbmQgPT09IExEX011dGFibGVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlQnVpbHQgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jLCAnYnVpbHQnLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZUZvY3VzIGV4dGVuZHMgTG9jYWxEZWNsYXJlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYywgJ18nLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZU5hbWUgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jLCAnbmFtZScsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlVGhpcyBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MsICd0aGlzJywgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVSZXMgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUeXBlKSB7XG5cdFx0XHRzdXBlcihsb2MsICdyZXMnLCBvcFR5cGUsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBMb2NhbEFjY2VzcyBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGZvY3VzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICdfJylcblx0XHR9XG5cblx0XHRzdGF0aWMgdGhpcyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAndGhpcycpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBMb2NhbE11dGF0ZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBBc3NpZ25cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbiBleHRlbmRzIERvIHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25TaW5nbGUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhsb2MpLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlIC8qIExvY2FsRGVjbGFyZSAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbmVlID0gYXNzaWduZWVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdGFsbEFzc2lnbmVlcygpIHsgcmV0dXJuIFsgdGhpcy5hc3NpZ25lZSBdIH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25EZXN0cnVjdHVyZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZXMgLyogQXJyYXlbTG9jYWxEZWNsYXJlXSAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbmVlcyA9IGFzc2lnbmVlc1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzXG5cdFx0fVxuXG5cdFx0a2luZCgpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1swXS5raW5kXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0XG5cdFx0TVNfTmV3ID0gMCxcblx0XHRNU19NdXRhdGUgPSAxLFxuXHRcdE1TX05ld011dGFibGUgPSAyXG5cdGV4cG9ydCBjbGFzcyBNZW1iZXJTZXQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QgLyogVmFsICovLCBuYW1lIC8qIFN0cmluZyAqLywga2luZCAvKiBOdW1iZXIgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBFcnJvcnNcblx0ZXhwb3J0IGNsYXNzIFRocm93IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUaHJvd24gLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8vIFRPRE86RVM2IG9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdFx0aWYgKG9wVGhyb3duID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wVGhyb3duID0gbnVsbFxuXHRcdFx0dGhpcy5vcFRocm93biA9IG9wVGhyb3duXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEFzc2VydCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5lZ2F0ZSAvKiBCb29sZWFuICovLCBjb25kaXRpb24gLyogVmFsICovLCBvcFRocm93biAvKiBPcHRbVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uZWdhdGUgPSBuZWdhdGVcblx0XHRcdC8vIGNvbmRpdGlvbiB0cmVhdGVkIHNwZWNpYWxseSBpZiBhIENhbGwuXG5cdFx0XHR0aGlzLmNvbmRpdGlvbiA9IGNvbmRpdGlvblxuXHRcdFx0dGhpcy5vcFRocm93biA9IG9wVGhyb3duXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEV4Y2VwdERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgX3RyeSAvKiBCbG9ja0RvICovLCBfY2F0Y2ggLyogT3B0W0NhdGNoXSAqLywgX2ZpbmFsbHkgLyogT3B0W0Jsb2NrRG9dICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLl90cnkgPSBfdHJ5XG5cdFx0XHR0aGlzLl9jYXRjaCA9IF9jYXRjaFxuXHRcdFx0dGhpcy5fZmluYWxseSA9IF9maW5hbGx5XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEV4Y2VwdFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0X3RyeSwgLy8gQmxvY2tWYWxcblx0XHRcdF9jYXRjaCwgLy8gT3B0W0NhdGNoXVxuXHRcdFx0X2ZpbmFsbHkpIHsgLy8gT3B0W0Jsb2NrRG9dXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLl90cnkgPSBfdHJ5XG5cdFx0XHR0aGlzLl9jYXRjaCA9IF9jYXRjaFxuXHRcdFx0dGhpcy5fZmluYWxseSA9IF9maW5hbGx5XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIENhdGNoIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgY2F1Z2h0IC8qIExvY2FsRGVjbGFyZSAqLywgYmxvY2sgLyogQmxvY2tEby9CbG9ja1ZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5jYXVnaHQgPSBjYXVnaHRcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG4vLyBEZWJ1Z1xuXHRleHBvcnQgY2xhc3MgRGVidWcgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBsaW5lcyAvKiBBcnJheVtMaW5lQ29udGVudF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG4vLyBCbG9ja1xuXHRleHBvcnQgY2xhc3MgQmxvY2tEbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGxpbmVzIC8qIEFycmF5W0xpbmVDb250ZW50XSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsIGV4dGVuZHMgTXNBc3QgeyB9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrV2l0aFJldHVybiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGxpbmVzIC8qIEFycmF5W0xpbmVDb250ZW50XSAqLywgcmV0dXJuZWQgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHRcdHRoaXMucmV0dXJuZWQgPSByZXR1cm5lZFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbFRocm93IGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbGluZXMgLyogQXJyYXlbTGluZUNvbnRlbnRdICovLCBfdGhyb3cgLyogVGhyb3cgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdFx0dGhpcy50aHJvdyA9IF90aHJvd1xuXHRcdH1cblx0fVxuXG5cdC8vIFRPRE86IEJsb2NrQmFnLCBCbG9ja01hcCwgQmxvY2tPYmogPT4gQmxvY2tCdWlsZChraW5kLCAuLi4pXG5cdGV4cG9ydCBjbGFzcyBCbG9ja09iaiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRzdGF0aWMgb2YobG9jLCBsaW5lcywgb3BPYmplZCwgb3BOYW1lKSB7XG5cdFx0XHQvLyBUT0RPOkVTNiBvcHRpb25hbCBhcmd1bWVudHNcblx0XHRcdGlmIChvcE9iamVkID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wT2JqZWQgPSBudWxsXG5cdFx0XHRpZiAob3BOYW1lID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wTmFtZSA9IG51bGxcblx0XHRcdHJldHVybiBuZXcgQmxvY2tPYmoobG9jLCBuZXcgTG9jYWxEZWNsYXJlQnVpbHQobG9jKSwgbGluZXMsIG9wT2JqZWQsIG9wTmFtZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRidWlsdCwgLy8gTG9jYWxEZWNsYXJlQnVpbHRcblx0XHRcdGxpbmVzLCAvLyBBcnJheVtVbmlvbltMaW5lQ29udGVudCBPYmpFbnRyeV1dXG5cdFx0XHRvcE9iamVkLCAvLyBPcHRbVmFsXVxuXHRcdFx0b3BOYW1lKSB7IC8vIE9wdFtTdHJpbmddXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gYnVpbHRcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdFx0dGhpcy5vcE9iamVkID0gb3BPYmplZFxuXHRcdFx0dGhpcy5vcE5hbWUgPSBvcE5hbWVcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5IGV4dGVuZHMgRG8geyB9XG5cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5QXNzaWduIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduIC8qIEFzc2lnbiAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlDb21wdXRlZCBleHRlbmRzIE9iakVudHJ5IHtcblx0XHRzdGF0aWMgbmFtZShsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5Q29tcHV0ZWQobG9jLCBRdW90ZS5mb3JTdHJpbmcobG9jLCAnbmFtZScpLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSAvKiBWYWwgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0JhZyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRzdGF0aWMgb2YobG9jLCBsaW5lcykge1xuXHRcdFx0cmV0dXJuIG5ldyBCbG9ja0JhZyhsb2MsIG5ldyBMb2NhbERlY2xhcmVCdWlsdChsb2MpLCBsaW5lcylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJ1aWx0IC8qIExvY2FsRGVjbGFyZUJ1aWx0ICovLCBsaW5lcyAvKiBVbmlvbltMaW5lQ29udGVudCBCYWdFbnRyeV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYnVpbHQgPSBidWlsdFxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmFnRW50cnlNYW55IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmxvY2tNYXAgZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0c3RhdGljIG9mKGxvYywgbGluZXMpIHtcblx0XHRcdHJldHVybiBuZXcgQmxvY2tNYXAobG9jLCBuZXcgTG9jYWxEZWNsYXJlQnVpbHQobG9jKSwgbGluZXMpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBidWlsdCAvKiBMb2NhbERlY2xhcmVCdWlsdCAqLywgbGluZXMgLyogVW5pb25bTGluZUNvbnRlbnQgTWFwRW50cnldICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gYnVpbHRcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBNYXBFbnRyeSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSAvKiBWYWwgKi8sIHZhbCAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHR0aGlzLnZhbCA9IHZhbFxuXHRcdH1cblx0fVxuXG4vLyBDb25kaXRpb25hbHNcblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFZhbCAqLywgcmVzdWx0IC8qIEJsb2NrRG8gKi8sIGlzVW5sZXNzIC8qIEJvb2xlYW4gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCAvKiBWYWwgKi8sIHJlc3VsdCAvKiBCbG9ja1ZhbCAqLywgaXNVbmxlc3MgLyogQm9vbGVhbiAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG4vLyBGdW5cblx0ZXhwb3J0IGNsYXNzIEZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BEZWNsYXJlVGhpcywgLy8gT3B0W0xvY2FsRGVjbGFyZVRoaXNdXG5cdFx0XHRpc0dlbmVyYXRvciwgLy8gQm9vbGVhblxuXHRcdFx0YXJncywgLy8gQXJyYXlbTG9jYWxEZWNsYXJlXVxuXHRcdFx0b3BSZXN0QXJnLCAvLyBPcHRbTG9jYWxEZWNsYXJlXVxuXHRcdFx0YmxvY2ssIC8vIEJsb2NrXG5cdFx0XHRvcEluLCAvLyBPcHRbRGVidWddXG5cdFx0XHRvcERlY2xhcmVSZXMsIC8vIE9wdFtMb2NhbERlY2xhcmVSZXNdXG5cdFx0XHRvcE91dCkgeyAvLyBPcHRbRGVidWddXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmdzXG5cdFx0XHRpZiAob3BJbiA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcEluID0gbnVsbFxuXHRcdFx0aWYgKG9wRGVjbGFyZVJlcyA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcERlY2xhcmVSZXMgPSBudWxsXG5cdFx0XHRpZiAob3BPdXQgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0b3BPdXQgPSBudWxsXG5cblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9IG9wRGVjbGFyZVRoaXNcblx0XHRcdHRoaXMuaXNHZW5lcmF0b3IgPSBpc0dlbmVyYXRvclxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdFx0dGhpcy5vcFJlc3RBcmcgPSBvcFJlc3RBcmdcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5vcEluID0gb3BJblxuXHRcdFx0dGhpcy5vcERlY2xhcmVSZXMgPSBvcERlY2xhcmVSZXNcblx0XHRcdHRoaXMub3BPdXQgPSBvcE91dFxuXHRcdH1cblx0fVxuXG4vLyBHZW5lcmF0b3Jcblx0ZXhwb3J0IGNsYXNzIFlpZWxkIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wWWllbGRlZCAvKiBPcHRbVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0XHRpZiAob3BZaWVsZGVkID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wWWllbGRlZCA9IG51bGxcblx0XHRcdHRoaXMub3BZaWVsZGVkID0gb3BZaWVsZGVkXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFlpZWxkVG8gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgeWllbGRlZFRvIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy55aWVsZGVkVG8gPSB5aWVsZGVkVG9cblx0XHR9XG5cdH1cblxuLy8gQ2xhc3Ncblx0ZXhwb3J0IGNsYXNzIENsYXNzIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRvcFN1cGVyQ2xhc3MsIC8vIE9wdFtWYWxdXG5cdFx0XHRvcERvLCAvLyBPcHRbQ2xhc3NEb10sXG5cdFx0XHRzdGF0aWNzLCAvLyBBcnJheVtNZXRob2RJbXBsTGlrZV1cblx0XHRcdG9wQ29uc3RydWN0b3IsIC8vIE9wdFtGdW5dXG5cdFx0XHRtZXRob2RzKSB7IC8vIEFycmF5W01ldGhvZEltcGxMaWtlXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcFN1cGVyQ2xhc3MgPSBvcFN1cGVyQ2xhc3Ncblx0XHRcdHRoaXMub3BEbyA9IG9wRG9cblx0XHRcdHRoaXMuc3RhdGljcyA9IHN0YXRpY3Ncblx0XHRcdHRoaXMub3BDb25zdHJ1Y3RvciA9IG9wQ29uc3RydWN0b3Jcblx0XHRcdHRoaXMubWV0aG9kcyA9IG1ldGhvZHNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ29uc3RydWN0b3IgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBmdW4gLyogRnVuKi8sIG1lbWJlckFyZ3MgLyogQXJyYXlbTG9jYWxEZWNsYXJlXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHRcdHRoaXMubWVtYmVyQXJncyA9IG1lbWJlckFyZ3Ncblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbExpa2UgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wgLyogVW5pb25bU3RyaW5nIFZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuc3ltYm9sID0gc3ltYm9sXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBmdW4gLyogRnVuICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBNZXRob2RHZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wsIGJsb2NrIC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5kZWNsYXJlVGhpcyA9IG5ldyBMb2NhbERlY2xhcmVUaGlzKGxvYylcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZFNldHRlciBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBuZXcgTG9jYWxEZWNsYXJlVGhpcyhsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IG5ldyBMb2NhbERlY2xhcmVGb2N1cyhsb2MpXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIENsYXNzRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBkZWNsYXJlRm9jdXMgLyogTG9jYWxEZWNsYXJlRm9jdXMgKi8sIGJsb2NrIC8qIEJsb2NrRG8gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gZGVjbGFyZUZvY3VzXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3VwZXJDYWxsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MgLyogQXJyYXlbVW5pb25bVmFsIFNwbGF0XV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIFN1cGVyQ2FsbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncyAvKiBBcnJheVtVbmlvbltWYWwgU3BsYXRdXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBTdXBlck1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG4vLyBDYWxsc1xuXHRleHBvcnQgY2xhc3MgQ2FsbCBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGNvbnRhaW5zKGxvYywgdGVzdFR5cGUsIHRlc3RlZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTVl9Db250YWlucyksIFsgdGVzdFR5cGUsIHRlc3RlZCBdKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBzdWIobG9jLCBhcmdzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNWX1N1YiksIGFyZ3MpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBjYWxsZWQgLyogVmFsICovLCBhcmdzIC8qIEFycmF5W1VuaW9uW1ZhbCBTcGxhdF1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmNhbGxlZCA9IGNhbGxlZFxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBOZXcgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdHlwZSAvKiBWYWwgKi8sIGFyZ3MgLyogVW5pb25bVmFsIFNwbGF0XSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBTcGxhdCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHNwbGF0dGVkIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5zcGxhdHRlZCA9IHNwbGF0dGVkXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIExhenkgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQ2FzZVxuXHRleHBvcnQgY2xhc3MgQ2FzZURvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdG9wQ2FzZWQsIC8vIE9wdFtBc3NpZ25TaW5nbGVdXG5cdFx0XHRwYXJ0cywgLy8gQXJyYXlbQ2FzZURvUGFydF1cblx0XHRcdG9wRWxzZSkgeyAvLyBPcHRbQmxvY2tEb11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3VtZW50c1xuXHRcdFx0aWYgKG9wRWxzZSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcEVsc2UgPSBudWxsXG5cdFx0XHR0aGlzLm9wQ2FzZWQgPSBvcENhc2VkXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIENhc2VWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdG9wQ2FzZWQsIC8vIE9wdFtBc3NpZ25TaW5nbGVdXG5cdFx0XHRwYXJ0cywgLy8gQXJyYXlbQ2FzZVZhbFBhcnRdXG5cdFx0XHRvcEVsc2UpIHsgLy8gT3B0W0Jsb2NrVmFsXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0XHRpZiAob3BFbHNlID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wRWxzZSA9IG51bGxcblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZURvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVW5pb25bVmFsIFBhdHRlcm5dICovLCByZXN1bHQgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZVZhbFBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFVuaW9uW1ZhbCBQYXR0ZXJuXSAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdHR5cGUsIC8vIFZhbFxuXHRcdFx0bG9jYWxzLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRwYXR0ZXJuZWQpIHsgLy8gTG9jYWxBY2Nlc3Ncblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHR0aGlzLnBhdHRlcm5lZCA9IHBhdHRlcm5lZFxuXHRcdH1cblx0fVxuXG4vLyBTd2l0Y2hcblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdHN3aXRjaGVkLCAvLyBWYWxcblx0XHRcdHBhcnRzLCAvLyBBcnJheVtTd2l0Y2hEb1BhcnRdXG5cdFx0XHRvcEVsc2UpIHsgLy8gT3B0W0Jsb2NrRG9dXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnN3aXRjaGVkID0gc3dpdGNoZWRcblx0XHRcdHRoaXMucGFydHMgPSAgcGFydHNcblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0c3dpdGNoZWQsIC8vIFZhbFxuXHRcdFx0cGFydHMsIC8vIEFycmF5W1N3aXRjaFZhbFBhcnRdXG5cdFx0XHRvcEVsc2UpIHsgLy8gT3B0W0Jsb2NrVmFsXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcyAvKiBBcnJheVtWYWxdICovLCByZXN1bHQgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZXMgPSB2YWx1ZXNcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaFZhbFBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZXMgLyogQXJyYXlbVmFsXSAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuLy8gRm9yXG5cdGV4cG9ydCBjbGFzcyBGb3JEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUgLyogT3B0W0l0ZXJhdGVlXSAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEZvclZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcEl0ZXJhdGVlIC8qIE9wdFtJdGVyYXRlZV0gKi8sIGJsb2NrIC8qIEJsb2NrRG8gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBGb3JCYWcgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBvZihsb2MsIG9wSXRlcmF0ZWUsIGJsb2NrKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEZvckJhZyhsb2MsIG5ldyBMb2NhbERlY2xhcmVCdWlsdChsb2MpLCBvcEl0ZXJhdGVlLCBibG9jaylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRidWlsdCwgLy8gTG9jYWxEZWNsYXJlQnVpbHRcblx0XHRcdG9wSXRlcmF0ZWUsIC8vIE9wdFtJdGVyYXRlZV1cblx0XHRcdGJsb2NrKSB7IC8vIEJsb2NrRG9cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYnVpbHQgPSBidWlsdFxuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEl0ZXJhdGVlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZWxlbWVudCAvKiBMb2NhbERlY2xhcmUgKi8sIGJhZyAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcblx0XHRcdHRoaXMuYmFnID0gYmFnXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJyZWFrIGV4dGVuZHMgRG8geyB9XG5cblx0ZXhwb3J0IGNsYXNzIEJyZWFrV2l0aFZhbCBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gTWlzYyBWYWxzXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1dyYXAgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYmxvY2sgLyogQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCYWdTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMgLyogQXJyYXlbVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE9ialNpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYWlycyAvKiBBcnJheVtPYmpQYWlyXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5wYWlycyA9IHBhaXJzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE9ialBhaXIgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXkgLyogU3RyaW5nICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY29uc3Rcblx0XHRMX0FuZCA9IDAsXG5cdFx0TF9PciA9IDFcblx0ZXhwb3J0IGNsYXNzIExvZ2ljIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQgLyogTnVtYmVyICovLCBhcmdzIC8qIEFycmF5W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTm90IGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZyAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYXJnID0gYXJnXG5cdFx0fVxuXHR9XG5cblx0Ly8gU3RvcmUgdGhlIHZhbHVlIGFzIGEgU3RyaW5nIHNvIHdlIGNhbiBkaXN0aW5ndWlzaCBgMHhmYCBmcm9tIGAxNWAuXG5cdGV4cG9ydCBjbGFzcyBOdW1iZXJMaXRlcmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QgLyogVmFsICovLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgUXVvdGUgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBmb3JTdHJpbmcobG9jLCBzdHIpIHtcblx0XHRcdHJldHVybiBuZXcgUXVvdGUobG9jLCBbIHN0ciBdKVxuXHRcdH1cblxuXHRcdC8vIHBhcnRzIGFyZSBTdHJpbmdzIGludGVybGVhdmVkIHdpdGggVmFscy5cblx0XHQvLyBwYXJ0IFN0cmluZ3MgYXJlIHJhdyB2YWx1ZXMsIG1lYW5pbmcgXCJcXG5cIiBpcyB0d28gY2hhcmFjdGVycy5cblx0XHQvLyBTaW5jZSBcIlxce1wiIGlzIHNwZWNpYWwgdG8gTWFzb24sIHRoYXQncyBvbmx5IG9uZSBjaGFyYWN0ZXIuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cyAvKiBBcnJheVtVbmlvbltTdHJpbmcgVmFsXV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZyAvKiBWYWwgKi8sIHF1b3RlIC8qIFF1b3RlICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRhZyA9IHRhZ1xuXHRcdFx0dGhpcy5xdW90ZSA9IHF1b3RlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFdpdGggZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZSAvKiBMb2NhbERlY2xhcmUgKi8sIHZhbHVlIC8qIFZhbCAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlID0gZGVjbGFyZVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gU3BlY2lhbFxuXHRleHBvcnQgY29uc3QgU0RfRGVidWdnZXIgPSAwXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdFxuXHRcdFNWX0NvbnRhaW5zID0gMCxcblx0XHRTVl9GYWxzZSA9IDEsXG5cdFx0U1ZfTnVsbCA9IDIsXG5cdFx0U1ZfU3ViID0gMyxcblx0XHRTVl9UcnVlID0gNCxcblx0XHRTVl9VbmRlZmluZWQgPSA1LFxuXHRcdFNWX05hbWUgPSA2XG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQgLyogTnVtYmVyICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIElnbm9yZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGlnbm9yZWQgLyogQXJyYXlbU3RyaW5nXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5pZ25vcmVkID0gaWdub3JlZFxuXHRcdH1cblx0fSJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
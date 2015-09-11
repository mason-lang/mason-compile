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

	exports.ConditionalVal = ConditionalVal;

	class Cond extends Val {
		constructor(loc, test, /* Val */ifTrue, /* Val */ifFalse /* Val */) {
			super(loc);
			this.test = test;
			this.ifTrue = ifTrue;
			this.ifFalse = ifFalse;
		}
	}

	// Fun
	exports.Cond = Cond;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1zQXN0LmpzIiwicHJpdmF0ZS9Nc0FzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FlLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDs7QUFFRCxVQUFRLEdBQUc7QUFDVixTQUFNLE9BQU8sR0FBRyxDQUFDLElBQ2hCLENBQUMsS0FBSyxJQUFJLEdBQ1QsTUFBTSxHQUNOLENBQUMsS0FBSyxTQUFTLEdBQ2YsV0FBVyxHQUNYLENBQUMsWUFBWSxLQUFLLEdBQ2xCLENBQUMsS0FBSyxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLENBQUMsR0FDM0QsT0FBTyxDQUFDLEtBQUssUUFBUSxHQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUNqQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7O0FBRWQsU0FBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUVoRCxTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtBQUNsQyxTQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQ3RDLE1BQU0sR0FBRyxDQUFDLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1RCxVQUFPLENBQUMsR0FBRSxJQUFJLEVBQUMsQ0FBQyxHQUFFLEtB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QU8sb0JBQXFCLEtBQUssV0FBWSxLQUFLLGdCQUFnQjtBQUNsRixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUN0QixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBR00sT0FBTSxXQUFXLEdBQUcsQ0FBQyxDQUFBOzs7QUFDckIsT0FBTSxTQUFTLFNBQVMsRUFBRSxDQUFDO0FBQ2pDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxlQUFlO0FBQ25DLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7OztBQUVNLE9BQ04sV0FBVyxHQUFHLENBQUM7T0FDZixRQUFRLEdBQUcsQ0FBQztPQUNaLE9BQU8sR0FBRyxDQUFDO09BQ1gsTUFBTSxHQUFHLENBQUM7T0FDVixPQUFPLEdBQUcsQ0FBQztPQUNYLFlBQVksR0FBRyxDQUFDO09BQ2hCLE9BQU8sR0FBRyxDQUFDLENBQUE7Ozs7Ozs7OztBQUNMLE9BQU0sVUFBVSxTQUFTLEdBQUcsQ0FBQztBQUNuQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksZUFBZTtBQUNuQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBRU0sT0FBTSxNQUFNLFNBQVMsRUFBRSxDQUFDO0FBQzlCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxzQkFBc0I7QUFDN0MsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7R0FDdEI7RUFDRCIsImZpbGUiOiJwcml2YXRlL01zQXN0LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBNc0FzdCB7XG5cdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRjb25zdCBpbnNwZWN0ID0gXyA9PlxuXHRcdFx0XyA9PT0gbnVsbCA/XG5cdFx0XHRcdCdudWxsJyA6XG5cdFx0XHRcdF8gPT09IHVuZGVmaW5lZCA/XG5cdFx0XHRcdCd1bmRlZmluZWQnIDpcblx0XHRcdFx0XyBpbnN0YW5jZW9mIEFycmF5ID9cblx0XHRcdFx0YFtcXG5cXHQke18ubWFwKF8gPT4gaW5kZW50KF8udG9TdHJpbmcoKSkpLmpvaW4oJyxcXG5cXHQnKX1cXG5dYCA6XG5cdFx0XHRcdHR5cGVvZiBfID09PSAnc3RyaW5nJyA/XG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KF8pIDpcblx0XHRcdFx0Xy50b1N0cmluZygpXG5cblx0XHRjb25zdCBpbmRlbnQgPSBzdHIgPT4gc3RyLnJlcGxhY2UoL1xcbi9nLCAnXFxuXFx0JylcblxuXHRcdGNvbnN0IHR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWVcblx0XHRjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHRoaXMpLm1hcChrZXkgPT5cblx0XHRcdCdcXG5cXHQnICsgYCR7a2V5fTogYCArIGluZGVudChpbnNwZWN0KHRoaXNba2V5XSkpKS5qb2luKCcsJylcblx0XHRyZXR1cm4gYCR7dHlwZX0oJHtwcm9wc30pYFxuXHR9XG59XG5cbi8vIExpbmVDb250ZW50XG5cdC8vIFZhbGlkIHBhcnQgb2YgYSBCbG9jay5cblx0ZXhwb3J0IGNsYXNzIExpbmVDb250ZW50IGV4dGVuZHMgTXNBc3QgeyB9XG5cblx0Ly8gVGhlc2UgY2FuIG9ubHkgYXBwZWFyIGFzIGxpbmVzIGluIGEgQmxvY2suXG5cdGV4cG9ydCBjbGFzcyBEbyBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG5cdC8vIFRoZXNlIGNhbiBhcHBlYXIgaW4gYW55IGV4cHJlc3Npb24uXG5cdGV4cG9ydCBjbGFzcyBWYWwgZXh0ZW5kcyBMaW5lQ29udGVudCB7IH1cblxuLy8gTW9kdWxlXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0ZG9Vc2VzLCAvLyBBcnJheVtVc2VEb11cblx0XHRcdHVzZXMsIC8vIEFycmF5W1VzZV1cblx0XHRcdG9wVXNlR2xvYmFsLCAvLyBOdWxsYWJsZVtVc2VHbG9iYWxdXG5cdFx0XHRkZWJ1Z1VzZXMsIC8vIEFycmF5W1VzZV1cblx0XHRcdGxpbmVzLCAvLyBBcnJheVtEb11cblx0XHRcdGV4cG9ydHMsIC8vIEFycmF5W0xvY2FsRGVjbGFyZV1cblx0XHRcdG9wRGVmYXVsdEV4cG9ydCkgeyAvLyBPcHRbVmFsXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5kb1VzZXMgPSBkb1VzZXNcblx0XHRcdHRoaXMudXNlcyA9IHVzZXNcblx0XHRcdHRoaXMub3BVc2VHbG9iYWwgPSBvcFVzZUdsb2JhbFxuXHRcdFx0dGhpcy5kZWJ1Z1VzZXMgPSBkZWJ1Z1VzZXNcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdFx0dGhpcy5leHBvcnRzID0gZXhwb3J0c1xuXHRcdFx0dGhpcy5vcERlZmF1bHRFeHBvcnQgPSBvcERlZmF1bHRFeHBvcnRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgVXNlRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBVc2UgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0cGF0aCwgLy8gU3RyaW5nXG5cdFx0XHR1c2VkLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRvcFVzZURlZmF1bHQpIHsgLy8gT3B0W0xvY2FsRGVjbGFyZV1cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHRcdHRoaXMudXNlZCA9IHVzZWRcblx0XHRcdHRoaXMub3BVc2VEZWZhdWx0ID0gb3BVc2VEZWZhdWx0XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFVzZUdsb2JhbCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHVzZWQgLyogQXJyYXlbTG9jYWxEZWNsYXJlXSAqLywgb3BVc2VEZWZhdWx0IC8qIE9wdFtMb2NhbERlY2xhcmVdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnVzZWQgPSB1c2VkXG5cdFx0XHR0aGlzLm9wVXNlRGVmYXVsdCA9IG9wVXNlRGVmYXVsdFxuXHRcdH1cblx0fVxuXG4vLyBMb2NhbHNcblx0ZXhwb3J0IGNvbnN0XG5cdFx0TERfQ29uc3QgPSAwLFxuXHRcdExEX0xhenkgPSAxLFxuXHRcdExEX011dGFibGUgPSAyXG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0c3RhdGljIHVudHlwZWQobG9jLCBuYW1lLCBraW5kKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIGtpbmQpXG5cdFx0fVxuXG5cdFx0c3RhdGljIHBsYWluKGxvYywgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovLCBvcFR5cGUgLyogT3B0W1ZhbF0gKi8sIGtpbmQgLyogTnVtYmVyICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHR0aGlzLm9wVHlwZSA9IG9wVHlwZVxuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblxuXHRcdGlzTGF6eSgpIHtcblx0XHRcdHJldHVybiB0aGlzLmtpbmQgPT09IExEX0xhenlcblx0XHR9XG5cblx0XHRpc011dGFibGUoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMRF9NdXRhYmxlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZUJ1aWx0IGV4dGVuZHMgTG9jYWxEZWNsYXJlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYywgJ2J1aWx0JywgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVGb2N1cyBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MsICdfJywgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVOYW1lIGV4dGVuZHMgTG9jYWxEZWNsYXJlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYywgJ25hbWUnLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZVRoaXMgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jLCAndGhpcycsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlUmVzIGV4dGVuZHMgTG9jYWxEZWNsYXJlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVHlwZSkge1xuXHRcdFx0c3VwZXIobG9jLCAncmVzJywgb3BUeXBlLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTG9jYWxBY2Nlc3MgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAnXycpXG5cdFx0fVxuXG5cdFx0c3RhdGljIHRoaXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ3RoaXMnKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTG9jYWxNdXRhdGUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gQXNzaWduXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ24gZXh0ZW5kcyBEbyB7IH1cblxuXHRleHBvcnQgY2xhc3MgQXNzaWduU2luZ2xlIGV4dGVuZHMgQXNzaWduIHtcblx0XHRzdGF0aWMgZm9jdXMobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25TaW5nbGUobG9jLCBuZXcgTG9jYWxEZWNsYXJlRm9jdXMobG9jKSwgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZSAvKiBMb2NhbERlY2xhcmUgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hc3NpZ25lZSA9IGFzc2lnbmVlXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cblx0XHRhbGxBc3NpZ25lZXMoKSB7IHJldHVybiBbIHRoaXMuYXNzaWduZWUgXSB9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQXNzaWduRGVzdHJ1Y3R1cmUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWVzIC8qIEFycmF5W0xvY2FsRGVjbGFyZV0gKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hc3NpZ25lZXMgPSBhc3NpZ25lZXNcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdGFsbEFzc2lnbmVlcygpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1xuXHRcdH1cblxuXHRcdGtpbmQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hc3NpZ25lZXNbMF0ua2luZFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdFxuXHRcdE1TX05ldyA9IDAsXG5cdFx0TVNfTXV0YXRlID0gMSxcblx0XHRNU19OZXdNdXRhYmxlID0gMlxuXHRleHBvcnQgY2xhc3MgTWVtYmVyU2V0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0IC8qIFZhbCAqLywgbmFtZSAvKiBTdHJpbmcgKi8sIGtpbmQgLyogTnVtYmVyICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gRXJyb3JzXG5cdGV4cG9ydCBjbGFzcyBUaHJvdyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVGhyb3duIC8qIE9wdFtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvLyBUT0RPOkVTNiBvcHRpb25hbCBhcmd1bWVudHNcblx0XHRcdGlmIChvcFRocm93biA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcFRocm93biA9IG51bGxcblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NlcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuZWdhdGUgLyogQm9vbGVhbiAqLywgY29uZGl0aW9uIC8qIFZhbCAqLywgb3BUaHJvd24gLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmVnYXRlID0gbmVnYXRlXG5cdFx0XHQvLyBjb25kaXRpb24gdHJlYXRlZCBzcGVjaWFsbHkgaWYgYSBDYWxsLlxuXHRcdFx0dGhpcy5jb25kaXRpb24gPSBjb25kaXRpb25cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHREbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIF90cnkgLyogQmxvY2tEbyAqLywgX2NhdGNoIC8qIE9wdFtDYXRjaF0gKi8sIF9maW5hbGx5IC8qIE9wdFtCbG9ja0RvXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHRWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdF90cnksIC8vIEJsb2NrVmFsXG5cdFx0XHRfY2F0Y2gsIC8vIE9wdFtDYXRjaF1cblx0XHRcdF9maW5hbGx5KSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXRjaCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhdWdodCAvKiBMb2NhbERlY2xhcmUgKi8sIGJsb2NrIC8qIEJsb2NrRG8vQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2F1Z2h0ID0gY2F1Z2h0XG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gRGVidWdcblx0ZXhwb3J0IGNsYXNzIERlYnVnIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbGluZXMgLyogQXJyYXlbTGluZUNvbnRlbnRdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuLy8gQmxvY2tcblx0ZXhwb3J0IGNsYXNzIEJsb2NrRG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBsaW5lcyAvKiBBcnJheVtMaW5lQ29udGVudF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1ZhbCBleHRlbmRzIE1zQXN0IHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja1dpdGhSZXR1cm4gZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBsaW5lcyAvKiBBcnJheVtMaW5lQ29udGVudF0gKi8sIHJldHVybmVkIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLnJldHVybmVkID0gcmV0dXJuZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWxUaHJvdyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGxpbmVzIC8qIEFycmF5W0xpbmVDb250ZW50XSAqLywgX3Rocm93IC8qIFRocm93ICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHRcdHRoaXMudGhyb3cgPSBfdGhyb3dcblx0XHR9XG5cdH1cblxuXHQvLyBUT0RPOiBCbG9ja0JhZywgQmxvY2tNYXAsIEJsb2NrT2JqID0+IEJsb2NrQnVpbGQoa2luZCwgLi4uKVxuXHRleHBvcnQgY2xhc3MgQmxvY2tPYmogZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0c3RhdGljIG9mKGxvYywgbGluZXMsIG9wT2JqZWQsIG9wTmFtZSkge1xuXHRcdFx0Ly8gVE9ETzpFUzYgb3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0XHRpZiAob3BPYmplZCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcE9iamVkID0gbnVsbFxuXHRcdFx0aWYgKG9wTmFtZSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcE5hbWUgPSBudWxsXG5cdFx0XHRyZXR1cm4gbmV3IEJsb2NrT2JqKGxvYywgbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYyksIGxpbmVzLCBvcE9iamVkLCBvcE5hbWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0YnVpbHQsIC8vIExvY2FsRGVjbGFyZUJ1aWx0XG5cdFx0XHRsaW5lcywgLy8gQXJyYXlbVW5pb25bTGluZUNvbnRlbnQgT2JqRW50cnldXVxuXHRcdFx0b3BPYmplZCwgLy8gT3B0W1ZhbF1cblx0XHRcdG9wTmFtZSkgeyAvLyBPcHRbU3RyaW5nXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5idWlsdCA9IGJ1aWx0XG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHRcdHRoaXMub3BPYmplZCA9IG9wT2JqZWRcblx0XHRcdHRoaXMub3BOYW1lID0gb3BOYW1lXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeSBleHRlbmRzIERvIHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeUFzc2lnbiBleHRlbmRzIE9iakVudHJ5IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbiAvKiBBc3NpZ24gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYXNzaWduID0gYXNzaWduXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5Q29tcHV0ZWQgZXh0ZW5kcyBPYmpFbnRyeSB7XG5cdFx0c3RhdGljIG5hbWUobG9jLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeUNvbXB1dGVkKGxvYywgUXVvdGUuZm9yU3RyaW5nKGxvYywgJ25hbWUnKSwgdmFsdWUpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXkgLyogVmFsICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmxvY2tCYWcgZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0c3RhdGljIG9mKGxvYywgbGluZXMpIHtcblx0XHRcdHJldHVybiBuZXcgQmxvY2tCYWcobG9jLCBuZXcgTG9jYWxEZWNsYXJlQnVpbHQobG9jKSwgbGluZXMpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBidWlsdCAvKiBMb2NhbERlY2xhcmVCdWlsdCAqLywgbGluZXMgLyogVW5pb25bTGluZUNvbnRlbnQgQmFnRW50cnldICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gYnVpbHRcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5TWFueSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrTWFwIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdHN0YXRpYyBvZihsb2MsIGxpbmVzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEJsb2NrTWFwKGxvYywgbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYyksIGxpbmVzKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgYnVpbHQgLyogTG9jYWxEZWNsYXJlQnVpbHQgKi8sIGxpbmVzIC8qIFVuaW9uW0xpbmVDb250ZW50IE1hcEVudHJ5XSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5idWlsdCA9IGJ1aWx0XG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTWFwRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBrZXkgLyogVmFsICovLCB2YWwgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0dGhpcy52YWwgPSB2YWxcblx0XHR9XG5cdH1cblxuLy8gQ29uZGl0aW9uYWxzXG5cdGV4cG9ydCBjbGFzcyBDb25kaXRpb25hbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCAvKiBWYWwgKi8sIHJlc3VsdCAvKiBCbG9ja0RvICovLCBpc1VubGVzcyAvKiBCb29sZWFuICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdFx0dGhpcy5pc1VubGVzcyA9IGlzVW5sZXNzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVmFsICovLCByZXN1bHQgLyogQmxvY2tWYWwgKi8sIGlzVW5sZXNzIC8qIEJvb2xlYW4gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ29uZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFZhbCAqLywgaWZUcnVlIC8qIFZhbCAqLywgaWZGYWxzZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdHRoaXMuaWZUcnVlID0gaWZUcnVlXG5cdFx0XHR0aGlzLmlmRmFsc2UgPSBpZkZhbHNlXG5cdFx0fVxuXHR9XG5cbi8vIEZ1blxuXHRleHBvcnQgY2xhc3MgRnVuIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRvcERlY2xhcmVUaGlzLCAvLyBPcHRbTG9jYWxEZWNsYXJlVGhpc11cblx0XHRcdGlzR2VuZXJhdG9yLCAvLyBCb29sZWFuXG5cdFx0XHRhcmdzLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRvcFJlc3RBcmcsIC8vIE9wdFtMb2NhbERlY2xhcmVdXG5cdFx0XHRibG9jaywgLy8gQmxvY2tcblx0XHRcdG9wSW4sIC8vIE9wdFtEZWJ1Z11cblx0XHRcdG9wRGVjbGFyZVJlcywgLy8gT3B0W0xvY2FsRGVjbGFyZVJlc11cblx0XHRcdG9wT3V0KSB7IC8vIE9wdFtEZWJ1Z11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdC8vIFRPRE86RVM2IE9wdGlvbmFsIGFyZ3Ncblx0XHRcdGlmIChvcEluID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wSW4gPSBudWxsXG5cdFx0XHRpZiAob3BEZWNsYXJlUmVzID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wRGVjbGFyZVJlcyA9IG51bGxcblx0XHRcdGlmIChvcE91dCA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRvcE91dCA9IG51bGxcblxuXHRcdFx0dGhpcy5vcERlY2xhcmVUaGlzID0gb3BEZWNsYXJlVGhpc1xuXHRcdFx0dGhpcy5pc0dlbmVyYXRvciA9IGlzR2VuZXJhdG9yXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0XHR0aGlzLm9wUmVzdEFyZyA9IG9wUmVzdEFyZ1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLm9wSW4gPSBvcEluXG5cdFx0XHR0aGlzLm9wRGVjbGFyZVJlcyA9IG9wRGVjbGFyZVJlc1xuXHRcdFx0dGhpcy5vcE91dCA9IG9wT3V0XG5cdFx0fVxuXHR9XG5cbi8vIEdlbmVyYXRvclxuXHRleHBvcnQgY2xhc3MgWWllbGQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BZaWVsZGVkIC8qIE9wdFtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRcdGlmIChvcFlpZWxkZWQgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0b3BZaWVsZGVkID0gbnVsbFxuXHRcdFx0dGhpcy5vcFlpZWxkZWQgPSBvcFlpZWxkZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgWWllbGRUbyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB5aWVsZGVkVG8gLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnlpZWxkZWRUbyA9IHlpZWxkZWRUb1xuXHRcdH1cblx0fVxuXG4vLyBDbGFzc1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdG9wU3VwZXJDbGFzcywgLy8gT3B0W1ZhbF1cblx0XHRcdG9wRG8sIC8vIE9wdFtDbGFzc0RvXSxcblx0XHRcdHN0YXRpY3MsIC8vIEFycmF5W01ldGhvZEltcGxMaWtlXVxuXHRcdFx0b3BDb25zdHJ1Y3RvciwgLy8gT3B0W0Z1bl1cblx0XHRcdG1ldGhvZHMpIHsgLy8gQXJyYXlbTWV0aG9kSW1wbExpa2VdXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9wU3VwZXJDbGFzcyA9IG9wU3VwZXJDbGFzc1xuXHRcdFx0dGhpcy5vcERvID0gb3BEb1xuXHRcdFx0dGhpcy5zdGF0aWNzID0gc3RhdGljc1xuXHRcdFx0dGhpcy5vcENvbnN0cnVjdG9yID0gb3BDb25zdHJ1Y3RvclxuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDb25zdHJ1Y3RvciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1biAvKiBGdW4qLywgbWVtYmVyQXJncyAvKiBBcnJheVtMb2NhbERlY2xhcmVdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdFx0dGhpcy5tZW1iZXJBcmdzID0gbWVtYmVyQXJnc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsTGlrZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCAvKiBVbmlvbltTdHJpbmcgVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5zeW1ib2wgPSBzeW1ib2xcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGwgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wsIGZ1biAvKiBGdW4gKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEdldHRlciBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgYmxvY2sgLyogQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gbmV3IExvY2FsRGVjbGFyZVRoaXMobG9jKVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTWV0aG9kU2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5kZWNsYXJlVGhpcyA9IG5ldyBMb2NhbERlY2xhcmVUaGlzKGxvYylcblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gbmV3IExvY2FsRGVjbGFyZUZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2xhc3NEbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGRlY2xhcmVGb2N1cyAvKiBMb2NhbERlY2xhcmVGb2N1cyAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBkZWNsYXJlRm9jdXNcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncyAvKiBBcnJheVtVbmlvbltWYWwgU3BsYXRdXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgU3VwZXJDYWxsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzIC8qIEFycmF5W1VuaW9uW1ZhbCBTcGxhdF1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN1cGVyTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cbi8vIENhbGxzXG5cdGV4cG9ydCBjbGFzcyBDYWxsIGV4dGVuZHMgVmFsIHtcblx0XHRzdGF0aWMgY29udGFpbnMobG9jLCB0ZXN0VHlwZSwgdGVzdGVkKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNWX0NvbnRhaW5zKSwgWyB0ZXN0VHlwZSwgdGVzdGVkIF0pXG5cdFx0fVxuXG5cdFx0c3RhdGljIHN1Yihsb2MsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU1ZfU3ViKSwgYXJncylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCAvKiBWYWwgKi8sIGFyZ3MgLyogQXJyYXlbVW5pb25bVmFsIFNwbGF0XV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlIC8qIFZhbCAqLywgYXJncyAvKiBVbmlvbltWYWwgU3BsYXRdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFNwbGF0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3BsYXR0ZWQgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnNwbGF0dGVkID0gc3BsYXR0ZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BDYXNlZCwgLy8gT3B0W0Fzc2lnblNpbmdsZV1cblx0XHRcdHBhcnRzLCAvLyBBcnJheVtDYXNlRG9QYXJ0XVxuXHRcdFx0b3BFbHNlKSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0Ly8gVE9ETzpFUzYgT3B0aW9uYWwgYXJndW1lbnRzXG5cdFx0XHRpZiAob3BFbHNlID09PSB1bmRlZmluZWQpXG5cdFx0XHRcdG9wRWxzZSA9IG51bGxcblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZVZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BDYXNlZCwgLy8gT3B0W0Fzc2lnblNpbmdsZV1cblx0XHRcdHBhcnRzLCAvLyBBcnJheVtDYXNlVmFsUGFydF1cblx0XHRcdG9wRWxzZSkgeyAvLyBPcHRbQmxvY2tWYWxdXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHQvLyBUT0RPOkVTNiBPcHRpb25hbCBhcmd1bWVudHNcblx0XHRcdGlmIChvcEVsc2UgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0b3BFbHNlID0gbnVsbFxuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCAvKiBVbmlvbltWYWwgUGF0dGVybl0gKi8sIHJlc3VsdCAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXNlVmFsUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVW5pb25bVmFsIFBhdHRlcm5dICovLCByZXN1bHQgLyogQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFBhdHRlcm4gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0dHlwZSwgLy8gVmFsXG5cdFx0XHRsb2NhbHMsIC8vIEFycmF5W0xvY2FsRGVjbGFyZV1cblx0XHRcdHBhdHRlcm5lZCkgeyAvLyBMb2NhbEFjY2Vzc1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50eXBlID0gdHlwZVxuXHRcdFx0dGhpcy5sb2NhbHMgPSBsb2NhbHNcblx0XHRcdHRoaXMucGF0dGVybmVkID0gcGF0dGVybmVkXG5cdFx0fVxuXHR9XG5cbi8vIFN3aXRjaFxuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0c3dpdGNoZWQsIC8vIFZhbFxuXHRcdFx0cGFydHMsIC8vIEFycmF5W1N3aXRjaERvUGFydF1cblx0XHRcdG9wRWxzZSkgeyAvLyBPcHRbQmxvY2tEb11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuc3dpdGNoZWQgPSBzd2l0Y2hlZFxuXHRcdFx0dGhpcy5wYXJ0cyA9ICBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRzd2l0Y2hlZCwgLy8gVmFsXG5cdFx0XHRwYXJ0cywgLy8gQXJyYXlbU3dpdGNoVmFsUGFydF1cblx0XHRcdG9wRWxzZSkgeyAvLyBPcHRbQmxvY2tWYWxdXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnN3aXRjaGVkID0gc3dpdGNoZWRcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3dpdGNoRG9QYXJ0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWVzIC8qIEFycmF5W1ZhbF0gKi8sIHJlc3VsdCAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3dpdGNoVmFsUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcyAvKiBBcnJheVtWYWxdICovLCByZXN1bHQgLyogQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWVzID0gdmFsdWVzXG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG4vLyBGb3Jcblx0ZXhwb3J0IGNsYXNzIEZvckRvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSAvKiBPcHRbSXRlcmF0ZWVdICovLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgRm9yVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUgLyogT3B0W0l0ZXJhdGVlXSAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEZvckJhZyBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIG9mKGxvYywgb3BJdGVyYXRlZSwgYmxvY2spIHtcblx0XHRcdHJldHVybiBuZXcgRm9yQmFnKGxvYywgbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYyksIG9wSXRlcmF0ZWUsIGJsb2NrKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdGJ1aWx0LCAvLyBMb2NhbERlY2xhcmVCdWlsdFxuXHRcdFx0b3BJdGVyYXRlZSwgLy8gT3B0W0l0ZXJhdGVlXVxuXHRcdFx0YmxvY2spIHsgLy8gQmxvY2tEb1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5idWlsdCA9IGJ1aWx0XG5cdFx0XHR0aGlzLm9wSXRlcmF0ZWUgPSBvcEl0ZXJhdGVlXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgSXRlcmF0ZWUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBlbGVtZW50IC8qIExvY2FsRGVjbGFyZSAqLywgYmFnIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudFxuXHRcdFx0dGhpcy5iYWcgPSBiYWdcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQnJlYWsgZXh0ZW5kcyBEbyB7IH1cblxuXHRleHBvcnQgY2xhc3MgQnJlYWtXaXRoVmFsIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUpIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBNaXNjIFZhbHNcblx0ZXhwb3J0IGNsYXNzIEJsb2NrV3JhcCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBibG9jayAvKiBCbG9ja1ZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJhZ1NpbXBsZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cyAvKiBBcnJheVtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgT2JqU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhaXJzIC8qIEFycmF5W09ialBhaXJdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhaXJzID0gcGFpcnNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgT2JqUGFpciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSAvKiBTdHJpbmcgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdFxuXHRcdExfQW5kID0gMCxcblx0XHRMX09yID0gMVxuXHRleHBvcnQgY2xhc3MgTG9naWMgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8sIGFyZ3MgLyogQXJyYXlbVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBOb3QgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJnIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hcmcgPSBhcmdcblx0XHR9XG5cdH1cblxuXHQvLyBTdG9yZSB0aGUgdmFsdWUgYXMgYSBTdHJpbmcgc28gd2UgY2FuIGRpc3Rpbmd1aXNoIGAweGZgIGZyb20gYDE1YC5cblx0ZXhwb3J0IGNsYXNzIE51bWJlckxpdGVyYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUgLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9iamVjdCAvKiBWYWwgKi8sIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBRdW90ZSBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGZvclN0cmluZyhsb2MsIHN0cikge1xuXHRcdFx0cmV0dXJuIG5ldyBRdW90ZShsb2MsIFsgc3RyIF0pXG5cdFx0fVxuXG5cdFx0Ly8gcGFydHMgYXJlIFN0cmluZ3MgaW50ZXJsZWF2ZWQgd2l0aCBWYWxzLlxuXHRcdC8vIHBhcnQgU3RyaW5ncyBhcmUgcmF3IHZhbHVlcywgbWVhbmluZyBcIlxcblwiIGlzIHR3byBjaGFyYWN0ZXJzLlxuXHRcdC8vIFNpbmNlIFwiXFx7XCIgaXMgc3BlY2lhbCB0byBNYXNvbiwgdGhhdCdzIG9ubHkgb25lIGNoYXJhY3Rlci5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzIC8qIEFycmF5W1VuaW9uW1N0cmluZyBWYWxdXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFF1b3RlVGVtcGxhdGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGFnIC8qIFZhbCAqLywgcXVvdGUgLyogUXVvdGUgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudGFnID0gdGFnXG5cdFx0XHR0aGlzLnF1b3RlID0gcXVvdGVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgV2l0aCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBkZWNsYXJlIC8qIExvY2FsRGVjbGFyZSAqLywgdmFsdWUgLyogVmFsICovLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmUgPSBkZWNsYXJlXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG4vLyBTcGVjaWFsXG5cdGV4cG9ydCBjb25zdCBTRF9EZWJ1Z2dlciA9IDBcblx0ZXhwb3J0IGNsYXNzIFNwZWNpYWxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQgLyogTnVtYmVyICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0XG5cdFx0U1ZfQ29udGFpbnMgPSAwLFxuXHRcdFNWX0ZhbHNlID0gMSxcblx0XHRTVl9OdWxsID0gMixcblx0XHRTVl9TdWIgPSAzLFxuXHRcdFNWX1RydWUgPSA0LFxuXHRcdFNWX1VuZGVmaW5lZCA9IDUsXG5cdFx0U1ZfTmFtZSA9IDZcblx0ZXhwb3J0IGNsYXNzIFNwZWNpYWxWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgSWdub3JlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgaWdub3JlZCAvKiBBcnJheVtTdHJpbmddICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmlnbm9yZWQgPSBpZ25vcmVkXG5cdFx0fVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
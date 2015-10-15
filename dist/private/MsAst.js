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
		constructor(loc, opComment, // Opt[String]
		doImports, // Array[ImportDo]
		imports, // Array[Import]
		opImportGlobal, // Nullable[ImportGlobal]
		lines) {
			// Array[Do]
			super(loc);
			this.opComment = opComment;
			this.doImports = doImports;
			this.imports = imports;
			this.opImportGlobal = opImportGlobal;
			this.lines = lines;
		}
	}

	exports.Module = Module;

	class ModuleExport extends Do {
		constructor(loc, assign /* AssignSingle */) {
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
		constructor(loc, path /* String */) {
			super(loc);
			this.path = path;
		}
	}

	exports.ImportDo = ImportDo;

	class Import extends MsAst {
		constructor(loc, path, // String
		imported, // Array[LocalDeclare]
		opImportDefault) {
			// Opt[LocalDeclare]
			super(loc);
			this.path = path;
			this.imported = imported;
			this.opImportDefault = opImportDefault;
		}
	}

	exports.Import = Import;

	class ImportGlobal extends MsAst {
		constructor(loc, imported, // Array[LocalDeclare]
		opImportDefault) {
			/* Opt[LocalDeclare] */
			super(loc);
			this.imported = imported;
			this.opImportDefault = opImportDefault;
		}
	}

	// Locals
	exports.ImportGlobal = ImportGlobal;
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
	const SET_Init = 0,
	      SET_Mutate = 1,
	      SET_InitMutable = 2;

	exports.SET_Init = SET_Init;
	exports.SET_Mutate = SET_Mutate;
	exports.SET_InitMutable = SET_InitMutable;

	class MemberSet extends Do {
		constructor(loc, object, // Val
		name, // Union[String Val]
		opType, // Opt[Val]
		kind, // Number (SET_*)
		value) {
			// Val
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
		constructor(loc, object, // Val
		subbeds, // Array[Val]
		opType, // Opt[Val]
		kind, // Number (SET_*)
		value) {
			// Val
			super(loc);
			this.object = object;
			this.subbeds = subbeds;
			this.opType = opType;
			this.kind = kind;
			this.value = value;
		}
	}

	// Errors
	exports.SetSub = SetSub;

	class Throw extends Do {
		constructor(loc, opThrown /* Opt[Val] */) {
			super(loc);
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

	// Block
	exports.Catch = Catch;

	class Block extends MsAst {
		constructor(loc, opComment /* Opt[String] */) {
			super(loc);
			this.opComment = opComment;
		}
	}

	exports.Block = Block;

	class BlockDo extends Block {
		constructor(loc, opComment, lines /* Array[LineContent] */) {
			super(loc, opComment);
			this.lines = lines;
		}
	}

	exports.BlockDo = BlockDo;

	class BlockVal extends Block {}

	exports.BlockVal = BlockVal;

	class BlockWithReturn extends BlockVal {
		constructor(loc, opComment, lines, /* Array[LineContent] */returned /* Val */) {
			super(loc, opComment);
			this.lines = lines;
			this.returned = returned;
		}
	}

	exports.BlockWithReturn = BlockWithReturn;

	class BlockValThrow extends BlockVal {
		constructor(loc, opComment, lines, /* Array[LineContent] */_throw /* Throw */) {
			super(loc, opComment);
			this.lines = lines;
			this.throw = _throw;
		}
	}

	// TODO: BlockBag, BlockMap, BlockObj => BlockBuild(kind, ...)
	exports.BlockValThrow = BlockValThrow;

	class BlockObj extends BlockVal {
		constructor(loc, opComment, lines /* Array[Union[LineContent ObjEntry]] */) {
			super(loc, opComment);
			this.built = new LocalDeclareBuilt(loc);
			this.lines = lines;
		}
	}

	exports.BlockObj = BlockObj;

	class ObjEntry extends Do {
		constructor(loc) {
			super(loc);
			this.opComment = null;
		}
	}

	exports.ObjEntry = ObjEntry;

	class ObjEntryAssign extends ObjEntry {
		constructor(loc, assign /* Assign */) {
			super(loc);
			this.assign = assign;
		}
	}

	exports.ObjEntryAssign = ObjEntryAssign;

	class ObjEntryComputed extends ObjEntry {
		constructor(loc, key, /* Val */value /* Val */) {
			super(loc);
			this.key = key;
			this.value = value;
		}
	}

	exports.ObjEntryComputed = ObjEntryComputed;

	class ObjEntryPlain extends ObjEntry {
		static access(loc, name) {
			return new ObjEntryPlain(loc, name, new LocalAccess(loc, name));
		}

		static name(loc, value) {
			return new ObjEntryPlain(loc, 'name', value);
		}

		constructor(loc, name, /* String */value /* Val */) {
			super(loc);
			this.name = name;
			this.value = value;
		}
	}

	exports.ObjEntryPlain = ObjEntryPlain;

	class BlockBag extends BlockVal {
		constructor(loc, opComment, lines /* Union[LineContent BagEntry] */) {
			super(loc, opComment);
			this.built = new LocalDeclareBuilt(loc);
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
		constructor(loc, opComment, lines /* Union[LineContent MapEntry] */) {
			super(loc, opComment);
			this.built = new LocalDeclareBuilt(loc);
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
		opDeclareRes) {
			// Opt[LocalDeclareRes]
			super(loc);
			this.opDeclareThis = opDeclareThis;
			this.isGenerator = isGenerator;
			this.args = args;
			this.opRestArg = opRestArg;
			this.block = block;
			this.opDeclareRes = opDeclareRes;
		}
	}

	// Generator
	exports.Fun = Fun;

	class Yield extends Val {
		constructor(loc) /* Opt[Val] */{
			let opYielded = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

			super(loc);
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
		opComment, opDo, // Opt[ClassDo],
		statics, // Array[MethodImplLike]
		opConstructor, // Opt[Constructor]
		methods) {
			// Array[MethodImplLike]
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
		constructor(loc, name /* Union[String Val] */) {
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
		constructor(loc, opIteratee, /* Opt[Iteratee] */block /* BlockDo */) {
			super(loc);
			this.built = new LocalDeclareBuilt(loc);
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

	// This is both a Token and MsAst.
	// Store the value as a String so we can distinguish `0xf` from `15`.
	exports.Not = Not;

	class NumberLiteral extends Val {
		constructor(loc, value /* String */) {
			super(loc);
			this.value = value;
		}

		// Tokens need toString.
		toString() {
			return this.value.toString();
		}
	}

	exports.NumberLiteral = NumberLiteral;

	class Member extends Val {
		constructor(loc, object, /* Val */name /* Union[String Val] */) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1zQXN0LmpzIiwicHJpdmF0ZS9Nc0FzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FlLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDs7QUFFRCxVQUFRLEdBQUc7QUFDVixTQUFNLE9BQU8sR0FBRyxDQUFDLElBQ2hCLENBQUMsS0FBSyxJQUFJLEdBQ1QsTUFBTSxHQUNOLENBQUMsS0FBSyxTQUFTLEdBQ2YsV0FBVyxHQUNYLENBQUMsWUFBWSxLQUFLLEdBQ2xCLENBQUMsS0FBSyxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLENBQUMsR0FDM0QsT0FBTyxDQUFDLEtBQUssUUFBUSxHQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUNqQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7O0FBRWQsU0FBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUVoRCxTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtBQUNsQyxTQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQ3RDLE1BQU0sR0FBRyxDQUFDLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1RCxVQUFPLENBQUMsR0FBRSxJQUFJLEVBQUMsQ0FBQyxHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUMxQjtFQUNEOzs7O21CQXhCb0IsS0FBSzs7QUE0QmxCLE9BQU0sV0FBVyxTQUFTLEtBQUssQ0FBQyxFQUFHOzs7OztBQUduQyxPQUFNLEVBQUUsU0FBUyxXQUFXLENBQUMsRUFBRzs7Ozs7QUFHaEMsT0FBTSxHQUFHLFNBQVMsV0FBVyxDQUFDLEVBQUc7Ozs7O0FBR2pDLE9BQU0sTUFBTSxTQUFTLEtBQUssQ0FBQztBQUNqQyxhQUFXLENBQUMsR0FBRyxFQUNkLFNBQVM7QUFDVCxXQUFTO0FBQ1QsU0FBTztBQUNQLGdCQUFjO0FBQ2QsT0FBSyxFQUFFOztBQUNQLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBO0FBQ3BDLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFlBQVksU0FBUyxFQUFFLENBQUM7QUFDcEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLHFCQUFxQjtBQUMzQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7O0FBQ00sT0FBTSxpQkFBaUIsU0FBUyxZQUFZLENBQUMsRUFBRzs7OztBQUNoRCxPQUFNLG1CQUFtQixTQUFTLFlBQVksQ0FBQyxFQUFHOzs7O0FBRWxELE9BQU0sUUFBUSxTQUFTLEtBQUssQ0FBQztBQUNuQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksZUFBZTtBQUNuQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBRU0sT0FBTSxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBQ2pDLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsSUFBSTtBQUNKLFVBQVE7QUFDUixpQkFBZSxFQUFFOztBQUNqQixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtBQUN4QixPQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQTtHQUN0QztFQUNEOzs7O0FBRU0sT0FBTSxZQUFZLFNBQVMsS0FBSyxDQUFDO0FBQ3ZDLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsUUFBUTtBQUNSLGlCQUFlLEVBQUU7O0FBQ2pCLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLE9BQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFBO0dBQ3RDO0VBQ0Q7Ozs7QUFHTSxPQUNOLFFBQVEsR0FBRyxDQUFDO09BQ1osT0FBTyxHQUFHLENBQUM7T0FDWCxVQUFVLEdBQUcsQ0FBQyxDQUFBOzs7OztBQUNSLE9BQU0sWUFBWSxTQUFTLEtBQUssQ0FBQztBQUN2QyxTQUFPLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUMvQixVQUFPLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQzlDOztBQUVELFNBQU8sS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDdkIsVUFBTyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUNsRDs7QUFFRCxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksY0FBZSxNQUFNLGdCQUFpQixJQUFJLGVBQWU7QUFDN0UsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7O0FBRUQsUUFBTSxHQUFHO0FBQ1IsVUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQTtHQUM1Qjs7QUFFRCxXQUFTLEdBQUc7QUFDWCxVQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0dBQy9CO0VBQ0Q7Ozs7QUFFTSxPQUFNLGlCQUFpQixTQUFTLFlBQVksQ0FBQztBQUNuRCxhQUFXLENBQUMsR0FBRyxFQUFFO0FBQ2hCLFFBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUNuQztFQUNEOzs7O0FBQ00sT0FBTSxpQkFBaUIsU0FBUyxZQUFZLENBQUM7QUFDbkQsYUFBVyxDQUFDLEdBQUcsRUFBRTtBQUNoQixRQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDL0I7RUFDRDs7OztBQUNNLE9BQU0sZ0JBQWdCLFNBQVMsWUFBWSxDQUFDO0FBQ2xELGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsUUFBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0dBQ2xDO0VBQ0Q7Ozs7QUFDTSxPQUFNLGdCQUFnQixTQUFTLFlBQVksQ0FBQztBQUNsRCxhQUFXLENBQUMsR0FBRyxFQUFFO0FBQ2hCLFFBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUNsQztFQUNEOzs7O0FBQ00sT0FBTSxlQUFlLFNBQVMsWUFBWSxDQUFDO0FBQ2pELGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ3hCLFFBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtHQUNuQztFQUNEOzs7O0FBRU0sT0FBTSxXQUFXLFNBQVMsR0FBRyxDQUFDO0FBQ3BDLFNBQU8sS0FBSyxDQUFDLEdBQUcsRUFBRTtBQUNqQixVQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUNoQzs7QUFFRCxTQUFPLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDaEIsVUFBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDbkM7O0FBRUQsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7OztBQUVNLE9BQU0sV0FBVyxTQUFTLEVBQUUsQ0FBQztBQUNuQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksY0FBZSxLQUFLLFlBQVk7QUFDcEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7Ozs7QUFHTSxPQUFNLE1BQU0sU0FBUyxFQUFFLENBQUMsRUFBRzs7OztBQUUzQixPQUFNLFlBQVksU0FBUyxNQUFNLENBQUM7QUFDeEMsU0FBTyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUN4QixVQUFPLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQy9EOztBQUVELGFBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxvQkFBcUIsS0FBSyxZQUFZO0FBQzlELFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCOztBQUVELGNBQVksR0FBRztBQUFFLFVBQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7R0FBRTtFQUN6Qzs7OztBQUVNLE9BQU0saUJBQWlCLFNBQVMsTUFBTSxDQUFDO0FBQzdDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUywyQkFBNEIsS0FBSyxZQUFZO0FBQ3RFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCOztBQUVELGNBQVksR0FBRztBQUNkLFVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtHQUNyQjs7QUFFRCxNQUFJLEdBQUc7QUFDTixVQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO0dBQzdCO0VBQ0Q7OztBQUVNLE9BQ04sUUFBUSxHQUFHLENBQUM7T0FDWixVQUFVLEdBQUcsQ0FBQztPQUNkLGVBQWUsR0FBRyxDQUFDLENBQUE7Ozs7OztBQUViLE9BQU0sU0FBUyxTQUFTLEVBQUUsQ0FBQztBQUNqQyxhQUFXLENBQ1YsR0FBRyxFQUNILE1BQU07QUFDTixNQUFJO0FBQ0osUUFBTTtBQUNOLE1BQUk7QUFDSixPQUFLLEVBQUU7O0FBQ1AsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sTUFBTSxTQUFTLEVBQUUsQ0FBQztBQUM5QixhQUFXLENBQ1YsR0FBRyxFQUNILE1BQU07QUFDTixTQUFPO0FBQ1AsUUFBTTtBQUNOLE1BQUk7QUFDSixPQUFLLEVBQUU7O0FBQ1AsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7Ozs7QUFHTSxPQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7QUFDN0IsYUFBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLGlCQUFnQjtBQUN4QyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN4QjtFQUNEOzs7O0FBRU0sT0FBTSxNQUFNLFNBQVMsRUFBRSxDQUFDO0FBQzlCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxlQUFnQixTQUFTLFdBQVksUUFBUSxpQkFBaUI7QUFDcEYsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7O0FBRXBCLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0dBQ3hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFFBQVEsU0FBUyxFQUFFLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWdCLE1BQU0sa0JBQW1CLFFBQVEscUJBQXFCO0FBQzFGLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0dBQ3hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFNBQVMsU0FBUyxHQUFHLENBQUM7QUFDbEMsYUFBVyxDQUFDLEdBQUcsRUFDZCxJQUFJO0FBQ0osUUFBTTtBQUNOLFVBQVEsRUFBRTs7QUFDVixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN4QjtFQUNEOzs7O0FBRU0sT0FBTSxLQUFLLFNBQVMsS0FBSyxDQUFDO0FBQ2hDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxvQkFBcUIsS0FBSyx5QkFBeUI7QUFDekUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7Ozs7QUFHTSxPQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxTQUFTLG9CQUFvQjtBQUM3QyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtHQUMxQjtFQUNEOzs7O0FBRU0sT0FBTSxPQUFPLFNBQVMsS0FBSyxDQUFDO0FBQ2xDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssMkJBQTJCO0FBQzNELFFBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDckIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sUUFBUSxTQUFTLEtBQUssQ0FBQyxFQUFHOzs7O0FBRWhDLE9BQU0sZUFBZSxTQUFTLFFBQVEsQ0FBQztBQUM3QyxhQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLDBCQUEyQixRQUFRLFlBQVk7QUFDL0UsUUFBSyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUNyQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN4QjtFQUNEOzs7O0FBRU0sT0FBTSxhQUFhLFNBQVMsUUFBUSxDQUFDO0FBQzNDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssMEJBQTJCLE1BQU0sY0FBYztBQUMvRSxRQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0FBQ3JCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFBO0dBQ25CO0VBQ0Q7Ozs7O0FBR00sT0FBTSxRQUFRLFNBQVMsUUFBUSxDQUFDO0FBQ3RDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssMkNBQTJDO0FBQzNFLFFBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDckIsT0FBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZDLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFFBQVEsU0FBUyxFQUFFLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRTtBQUNoQixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtHQUNyQjtFQUNEOzs7O0FBRU0sT0FBTSxjQUFjLFNBQVMsUUFBUSxDQUFDO0FBQzVDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxlQUFlO0FBQ3JDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0dBQ3BCO0VBQ0Q7Ozs7QUFFTSxPQUFNLGdCQUFnQixTQUFTLFFBQVEsQ0FBQztBQUM5QyxhQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBWSxLQUFLLFlBQVk7QUFDaEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxhQUFhLFNBQVMsUUFBUSxDQUFDO0FBQzNDLFNBQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDeEIsVUFBTyxJQUFJLGFBQWEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO0dBQy9EOztBQUVELFNBQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDdkIsVUFBTyxJQUFJLGFBQWEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQzVDOztBQUVELGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxjQUFlLEtBQUssWUFBWTtBQUNwRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxRQUFRLFNBQVMsUUFBUSxDQUFDO0FBQ3RDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssb0NBQW9DO0FBQ3BFLFFBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDckIsT0FBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZDLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFFBQVEsU0FBUyxFQUFFLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLFlBQVk7QUFDakMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sWUFBWSxTQUFTLEVBQUUsQ0FBQztBQUNwQyxhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssWUFBWTtBQUNqQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxRQUFRLFNBQVMsUUFBUSxDQUFDO0FBQ3RDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssb0NBQW9DO0FBQ3BFLFFBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDckIsT0FBSSxDQUFDLEtBQUssR0FBRyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZDLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFFBQVEsU0FBUyxFQUFFLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVksR0FBRyxZQUFZO0FBQzlDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0FBQ2QsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDtFQUNEOzs7OztBQUdNLE9BQU0sYUFBYSxTQUFTLEVBQUUsQ0FBQztBQUNyQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksV0FBWSxNQUFNLGVBQWdCLFFBQVEsZ0JBQWdCO0FBQzlFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0dBQ3hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLGNBQWMsU0FBUyxHQUFHLENBQUM7QUFDdkMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLFdBQVksTUFBTSxnQkFBaUIsUUFBUSxnQkFBZ0I7QUFDL0UsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7R0FDeEI7RUFDRDs7OztBQUVNLE9BQU0sSUFBSSxTQUFTLEdBQUcsQ0FBQztBQUM3QixhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksV0FBWSxNQUFNLFdBQVksT0FBTyxZQUFZO0FBQ3JFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0dBQ3RCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxHQUFHLFNBQVMsR0FBRyxDQUFDO0FBQzVCLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsYUFBYTtBQUNiLGFBQVc7QUFDWCxNQUFJO0FBQ0osV0FBUztBQUNULE9BQUs7QUFDTCxjQUFZLEVBQUU7O0FBQ2QsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDbEMsT0FBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDOUIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDMUIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7R0FDaEM7RUFDRDs7Ozs7QUFHTSxPQUFNLEtBQUssU0FBUyxHQUFHLENBQUM7QUFDOUIsYUFBVyxDQUFDLEdBQUcsZ0JBQWlDO09BQS9CLFNBQVMseURBQUMsSUFBSTs7QUFDOUIsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7R0FDMUI7RUFDRDs7OztBQUVNLE9BQU0sT0FBTyxTQUFTLEdBQUcsQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsWUFBWTtBQUNyQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtHQUMxQjtFQUNEOzs7OztBQUdNLE9BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQztBQUM5QixhQUFXLENBQUMsR0FBRyxFQUNkLFlBQVk7QUFDWixXQUFTLEVBQ1QsSUFBSTtBQUNKLFNBQU87QUFDUCxlQUFhO0FBQ2IsU0FBTyxFQUFFOztBQUNULFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0FBQ2hDLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBQ2xDLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0dBQ3RCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFdBQVcsU0FBUyxLQUFLLENBQUM7QUFDdEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVcsVUFBVSw0QkFBNEI7QUFDcEUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtHQUM1QjtFQUNEOzs7O0FBRU0sT0FBTSxjQUFjLFNBQVMsS0FBSyxDQUFDO0FBQ3pDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSwwQkFBMEI7QUFDaEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUNNLE9BQU0sVUFBVSxTQUFTLGNBQWMsQ0FBQztBQUM5QyxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLFlBQVk7QUFDdkMsUUFBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNsQixPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtHQUNkO0VBQ0Q7Ozs7QUFDTSxPQUFNLFlBQVksU0FBUyxjQUFjLENBQUM7QUFDaEQsYUFBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxpQkFBaUI7QUFDOUMsUUFBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNsQixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsV0FBVyxHQUFHLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUE7R0FDNUM7RUFDRDs7OztBQUNNLE9BQU0sWUFBWSxTQUFTLGNBQWMsQ0FBQztBQUNoRCxhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLGdCQUFnQjtBQUM3QyxRQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1QyxPQUFJLENBQUMsWUFBWSxHQUFHLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUE7R0FDOUM7RUFDRDs7OztBQUVNLE9BQU0sT0FBTyxTQUFTLEtBQUssQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUFFLFlBQVkseUJBQTBCLEtBQUssZ0JBQWdCO0FBQzNFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0FBQ2hDLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFNBQVMsU0FBUyxHQUFHLENBQUM7QUFDbEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGdDQUFnQztBQUNwRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBQ00sT0FBTSxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxnQ0FBZ0M7QUFDcEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7OztBQUVNLE9BQU0sV0FBVyxTQUFTLEdBQUcsQ0FBQztBQUNwQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksMEJBQTBCO0FBQzlDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxJQUFJLFNBQVMsR0FBRyxDQUFDO0FBQzdCLFNBQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQ3RDLFVBQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0dBQzFFOztBQUVELFNBQU8sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7QUFDckIsVUFBTyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxVQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQ3ZEOztBQUVELGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxXQUFZLElBQUksZ0NBQWdDO0FBQ3RFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLEdBQUcsU0FBUyxHQUFHLENBQUM7QUFDNUIsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLFdBQVksSUFBSSx5QkFBeUI7QUFDN0QsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7OztBQUVNLE9BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsWUFBWTtBQUNwQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN4QjtFQUNEOzs7O0FBRU0sT0FBTSxJQUFJLFNBQVMsR0FBRyxDQUFDO0FBQzdCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxZQUFZO0FBQ2pDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxNQUFNLFNBQVMsRUFBRSxDQUFDO0FBQzlCLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsT0FBTztBQUNQLE9BQUs7QUFDTCxRQUFNLEVBQUU7O0FBQ1IsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdEIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUVNLE9BQU0sT0FBTyxTQUFTLEdBQUcsQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUNkLE9BQU87QUFDUCxPQUFLO0FBQ0wsUUFBTSxFQUFFOztBQUNSLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0dBQ3BCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFVBQVUsU0FBUyxLQUFLLENBQUM7QUFDckMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLDBCQUEyQixNQUFNLGdCQUFnQjtBQUNyRSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7O0FBRU0sT0FBTSxXQUFXLFNBQVMsS0FBSyxDQUFDO0FBQ3RDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSwwQkFBMkIsTUFBTSxpQkFBaUI7QUFDdEUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUVNLE9BQU0sT0FBTyxTQUFTLEtBQUssQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUNkLElBQUk7QUFDSixRQUFNO0FBQ04sV0FBUyxFQUFFOztBQUNYLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0dBQzFCO0VBQ0Q7Ozs7O0FBR00sT0FBTSxRQUFRLFNBQVMsRUFBRSxDQUFDO0FBQ2hDLGFBQVcsQ0FBQyxHQUFHLEVBQ2QsUUFBUTtBQUNSLE9BQUs7QUFDTCxRQUFNLEVBQUU7O0FBQ1IsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsT0FBSSxDQUFDLEtBQUssR0FBSSxLQUFLLENBQUE7QUFDbkIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7OztBQUVNLE9BQU0sU0FBUyxTQUFTLEdBQUcsQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUNkLFFBQVE7QUFDUixPQUFLO0FBQ0wsUUFBTSxFQUFFOztBQUNSLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0dBQ3BCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFlBQVksU0FBUyxLQUFLLENBQUM7QUFDdkMsYUFBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLGtCQUFtQixNQUFNLGdCQUFnQjtBQUMvRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtHQUNwQjtFQUNEOzs7O0FBRU0sT0FBTSxhQUFhLFNBQVMsS0FBSyxDQUFDO0FBQ3hDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxrQkFBbUIsTUFBTSxpQkFBaUI7QUFDaEUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDcEI7RUFDRDs7Ozs7QUFHTSxPQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7QUFDN0IsYUFBVyxDQUFDLEdBQUcsRUFBRSxVQUFVLHFCQUFzQixLQUFLLGdCQUFnQjtBQUNyRSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtBQUM1QixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxNQUFNLFNBQVMsR0FBRyxDQUFDO0FBQy9CLGFBQVcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxxQkFBc0IsS0FBSyxnQkFBZ0I7QUFDckUsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDNUIsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sTUFBTSxTQUFTLEdBQUcsQ0FBQztBQUMvQixhQUFXLENBQUMsR0FBRyxFQUFFLFVBQVUscUJBQXNCLEtBQUssZ0JBQWdCO0FBQ3JFLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN2QyxPQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtBQUM1QixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxRQUFRLFNBQVMsS0FBSyxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxvQkFBcUIsR0FBRyxZQUFZO0FBQzNELFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0dBQ2Q7RUFDRDs7OztBQUVNLE9BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQyxFQUFHOzs7O0FBRTFCLE9BQU0sWUFBWSxTQUFTLEVBQUUsQ0FBQztBQUNwQyxhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUN2QixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7OztBQUdNLE9BQU0sU0FBUyxTQUFTLEdBQUcsQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssaUJBQWlCO0FBQ3RDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFFTSxPQUFNLFNBQVMsU0FBUyxHQUFHLENBQUM7QUFDbEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLG1CQUFtQjtBQUN4QyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxTQUFTLFNBQVMsR0FBRyxDQUFDO0FBQ2xDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyx1QkFBdUI7QUFDNUMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sT0FBTyxTQUFTLEtBQUssQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsY0FBZSxLQUFLLFlBQVk7QUFDbkQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7QUFFTSxPQUNOLEtBQUssR0FBRyxDQUFDO09BQ1QsSUFBSSxHQUFHLENBQUMsQ0FBQTs7OztBQUNGLE9BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQztBQUM5QixhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksY0FBZSxJQUFJLG1CQUFtQjtBQUMxRCxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBRU0sT0FBTSxHQUFHLFNBQVMsR0FBRyxDQUFDO0FBQzVCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxZQUFZO0FBQy9CLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0dBQ2Q7RUFDRDs7Ozs7O0FBSU0sT0FBTSxhQUFhLFNBQVMsR0FBRyxDQUFDO0FBQ3RDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxlQUFlO0FBQ3BDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCOzs7QUFHRCxVQUFRLEdBQUc7QUFBRSxVQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7R0FBRTtFQUMzQzs7OztBQUVNLE9BQU0sTUFBTSxTQUFTLEdBQUcsQ0FBQztBQUMvQixhQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sV0FBWSxJQUFJLDBCQUEwQjtBQUNoRSxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBRU0sT0FBTSxLQUFLLFNBQVMsR0FBRyxDQUFDO0FBQzlCLFNBQU8sU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDMUIsVUFBTyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0dBQzVCOzs7OztBQUtELGFBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxpQ0FBaUM7QUFDdEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbEI7RUFDRDs7OztBQUVNLE9BQU0sYUFBYSxTQUFTLEdBQUcsQ0FBQztBQUN0QyxhQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBWSxLQUFLLGNBQWM7QUFDbEQsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtHQUNsQjtFQUNEOzs7O0FBRU0sT0FBTSxJQUFJLFNBQVMsR0FBRyxDQUFDO0FBQzdCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxvQkFBcUIsS0FBSyxXQUFZLEtBQUssZ0JBQWdCO0FBQ2xGLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLE9BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2xCO0VBQ0Q7Ozs7QUFHTSxPQUFNLFdBQVcsR0FBRyxDQUFDLENBQUE7OztBQUNyQixPQUFNLFNBQVMsU0FBUyxFQUFFLENBQUM7QUFDakMsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7O0FBRU0sT0FDTixXQUFXLEdBQUcsQ0FBQztPQUNmLFFBQVEsR0FBRyxDQUFDO09BQ1osT0FBTyxHQUFHLENBQUM7T0FDWCxNQUFNLEdBQUcsQ0FBQztPQUNWLE9BQU8sR0FBRyxDQUFDO09BQ1gsWUFBWSxHQUFHLENBQUM7T0FDaEIsT0FBTyxHQUFHLENBQUMsQ0FBQTs7Ozs7Ozs7O0FBQ0wsT0FBTSxVQUFVLFNBQVMsR0FBRyxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxlQUFlO0FBQ25DLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7QUFFTSxPQUFNLE1BQU0sU0FBUyxFQUFFLENBQUM7QUFDOUIsYUFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLHNCQUFzQjtBQUM3QyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtHQUN0QjtFQUNEIiwiZmlsZSI6InByaXZhdGUvTXNBc3QuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImV4cG9ydCBkZWZhdWx0IGNsYXNzIE1zQXN0IHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdGNvbnN0IGluc3BlY3QgPSBfID0+XG5cdFx0XHRfID09PSBudWxsID9cblx0XHRcdFx0J251bGwnIDpcblx0XHRcdFx0XyA9PT0gdW5kZWZpbmVkID9cblx0XHRcdFx0J3VuZGVmaW5lZCcgOlxuXHRcdFx0XHRfIGluc3RhbmNlb2YgQXJyYXkgP1xuXHRcdFx0XHRgW1xcblxcdCR7Xy5tYXAoXyA9PiBpbmRlbnQoXy50b1N0cmluZygpKSkuam9pbignLFxcblxcdCcpfVxcbl1gIDpcblx0XHRcdFx0dHlwZW9mIF8gPT09ICdzdHJpbmcnID9cblx0XHRcdFx0SlNPTi5zdHJpbmdpZnkoXykgOlxuXHRcdFx0XHRfLnRvU3RyaW5nKClcblxuXHRcdGNvbnN0IGluZGVudCA9IHN0ciA9PiBzdHIucmVwbGFjZSgvXFxuL2csICdcXG5cXHQnKVxuXG5cdFx0Y29uc3QgdHlwZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZVxuXHRcdGNvbnN0IHByb3BzID0gT2JqZWN0LmtleXModGhpcykubWFwKGtleSA9PlxuXHRcdFx0J1xcblxcdCcgKyBgJHtrZXl9OiBgICsgaW5kZW50KGluc3BlY3QodGhpc1trZXldKSkpLmpvaW4oJywnKVxuXHRcdHJldHVybiBgJHt0eXBlfSgke3Byb3BzfSlgXG5cdH1cbn1cblxuLy8gTGluZUNvbnRlbnRcblx0Ly8gVmFsaWQgcGFydCBvZiBhIEJsb2NrLlxuXHRleHBvcnQgY2xhc3MgTGluZUNvbnRlbnQgZXh0ZW5kcyBNc0FzdCB7IH1cblxuXHQvLyBUaGVzZSBjYW4gb25seSBhcHBlYXIgYXMgbGluZXMgaW4gYSBCbG9jay5cblx0ZXhwb3J0IGNsYXNzIERvIGV4dGVuZHMgTGluZUNvbnRlbnQgeyB9XG5cblx0Ly8gVGhlc2UgY2FuIGFwcGVhciBpbiBhbnkgZXhwcmVzc2lvbi5cblx0ZXhwb3J0IGNsYXNzIFZhbCBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG4vLyBNb2R1bGVcblx0ZXhwb3J0IGNsYXNzIE1vZHVsZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRvcENvbW1lbnQsIC8vIE9wdFtTdHJpbmddXG5cdFx0XHRkb0ltcG9ydHMsIC8vIEFycmF5W0ltcG9ydERvXVxuXHRcdFx0aW1wb3J0cywgLy8gQXJyYXlbSW1wb3J0XVxuXHRcdFx0b3BJbXBvcnRHbG9iYWwsIC8vIE51bGxhYmxlW0ltcG9ydEdsb2JhbF1cblx0XHRcdGxpbmVzKSB7IC8vIEFycmF5W0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBvcENvbW1lbnRcblx0XHRcdHRoaXMuZG9JbXBvcnRzID0gZG9JbXBvcnRzXG5cdFx0XHR0aGlzLmltcG9ydHMgPSBpbXBvcnRzXG5cdFx0XHR0aGlzLm9wSW1wb3J0R2xvYmFsID0gb3BJbXBvcnRHbG9iYWxcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ24gLyogQXNzaWduU2luZ2xlICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbiA9IGFzc2lnblxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTW9kdWxlRXhwb3J0TmFtZWQgZXh0ZW5kcyBNb2R1bGVFeHBvcnQgeyB9XG5cdGV4cG9ydCBjbGFzcyBNb2R1bGVFeHBvcnREZWZhdWx0IGV4dGVuZHMgTW9kdWxlRXhwb3J0IHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnREbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhdGggLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEltcG9ydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRwYXRoLCAvLyBTdHJpbmdcblx0XHRcdGltcG9ydGVkLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRvcEltcG9ydERlZmF1bHQpIHsgLy8gT3B0W0xvY2FsRGVjbGFyZV1cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGF0aCA9IHBhdGhcblx0XHRcdHRoaXMuaW1wb3J0ZWQgPSBpbXBvcnRlZFxuXHRcdFx0dGhpcy5vcEltcG9ydERlZmF1bHQgPSBvcEltcG9ydERlZmF1bHRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgSW1wb3J0R2xvYmFsIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdGltcG9ydGVkLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRvcEltcG9ydERlZmF1bHQpIHsgLyogT3B0W0xvY2FsRGVjbGFyZV0gKi9cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuaW1wb3J0ZWQgPSBpbXBvcnRlZFxuXHRcdFx0dGhpcy5vcEltcG9ydERlZmF1bHQgPSBvcEltcG9ydERlZmF1bHRcblx0XHR9XG5cdH1cblxuLy8gTG9jYWxzXG5cdGV4cG9ydCBjb25zdFxuXHRcdExEX0NvbnN0ID0gMCxcblx0XHRMRF9MYXp5ID0gMSxcblx0XHRMRF9NdXRhYmxlID0gMlxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdHN0YXRpYyB1bnR5cGVkKGxvYywgbmFtZSwga2luZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbERlY2xhcmUobG9jLCBuYW1lLCBudWxsLCBraW5kKVxuXHRcdH1cblxuXHRcdHN0YXRpYyBwbGFpbihsb2MsIG5hbWUpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLywgb3BUeXBlIC8qIE9wdFtWYWxdICovLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cblx0XHRpc0xhenkoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5raW5kID09PSBMRF9MYXp5XG5cdFx0fVxuXG5cdFx0aXNNdXRhYmxlKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTERfTXV0YWJsZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVCdWlsdCBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MsICdidWlsdCcsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlRm9jdXMgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jLCAnXycsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlTmFtZSBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MsICduYW1lJywgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVUaGlzIGV4dGVuZHMgTG9jYWxEZWNsYXJlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYywgJ3RoaXMnLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZVJlcyBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFR5cGUpIHtcblx0XHRcdHN1cGVyKGxvYywgJ3JlcycsIG9wVHlwZSwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIExvY2FsQWNjZXNzIGV4dGVuZHMgVmFsIHtcblx0XHRzdGF0aWMgZm9jdXMobG9jKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsQWNjZXNzKGxvYywgJ18nKVxuXHRcdH1cblxuXHRcdHN0YXRpYyB0aGlzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICd0aGlzJylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIExvY2FsTXV0YXRlIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIEFzc2lnblxuXHRleHBvcnQgY2xhc3MgQXNzaWduIGV4dGVuZHMgRG8geyB9XG5cblx0ZXhwb3J0IGNsYXNzIEFzc2lnblNpbmdsZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0c3RhdGljIGZvY3VzKGxvYywgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuZXcgQXNzaWduU2luZ2xlKGxvYywgbmV3IExvY2FsRGVjbGFyZUZvY3VzKGxvYyksIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWUgLyogTG9jYWxEZWNsYXJlICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYXNzaWduZWUgPSBhc3NpZ25lZVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0YWxsQXNzaWduZWVzKCkgeyByZXR1cm4gW3RoaXMuYXNzaWduZWVdIH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25EZXN0cnVjdHVyZSBleHRlbmRzIEFzc2lnbiB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhc3NpZ25lZXMgLyogQXJyYXlbTG9jYWxEZWNsYXJlXSAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbmVlcyA9IGFzc2lnbmVlc1xuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0YWxsQXNzaWduZWVzKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuYXNzaWduZWVzXG5cdFx0fVxuXG5cdFx0a2luZCgpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1swXS5raW5kXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0XG5cdFx0U0VUX0luaXQgPSAwLFxuXHRcdFNFVF9NdXRhdGUgPSAxLFxuXHRcdFNFVF9Jbml0TXV0YWJsZSA9IDJcblxuXHRleHBvcnQgY2xhc3MgTWVtYmVyU2V0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKFxuXHRcdFx0bG9jLFxuXHRcdFx0b2JqZWN0LCAvLyBWYWxcblx0XHRcdG5hbWUsIC8vIFVuaW9uW1N0cmluZyBWYWxdXG5cdFx0XHRvcFR5cGUsIC8vIE9wdFtWYWxdXG5cdFx0XHRraW5kLCAvLyBOdW1iZXIgKFNFVF8qKVxuXHRcdFx0dmFsdWUpIHsgLy8gVmFsXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0dGhpcy5vcFR5cGUgPSBvcFR5cGVcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBTZXRTdWIgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IoXG5cdFx0XHRsb2MsXG5cdFx0XHRvYmplY3QsIC8vIFZhbFxuXHRcdFx0c3ViYmVkcywgLy8gQXJyYXlbVmFsXVxuXHRcdFx0b3BUeXBlLCAvLyBPcHRbVmFsXVxuXHRcdFx0a2luZCwgLy8gTnVtYmVyIChTRVRfKilcblx0XHRcdHZhbHVlKSB7IC8vIFZhbFxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdHRoaXMuc3ViYmVkcyA9IHN1YmJlZHNcblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gRXJyb3JzXG5cdGV4cG9ydCBjbGFzcyBUaHJvdyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVGhyb3duLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NlcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuZWdhdGUgLyogQm9vbGVhbiAqLywgY29uZGl0aW9uIC8qIFZhbCAqLywgb3BUaHJvd24gLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmVnYXRlID0gbmVnYXRlXG5cdFx0XHQvLyBjb25kaXRpb24gdHJlYXRlZCBzcGVjaWFsbHkgaWYgYSBDYWxsLlxuXHRcdFx0dGhpcy5jb25kaXRpb24gPSBjb25kaXRpb25cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHREbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIF90cnkgLyogQmxvY2tEbyAqLywgX2NhdGNoIC8qIE9wdFtDYXRjaF0gKi8sIF9maW5hbGx5IC8qIE9wdFtCbG9ja0RvXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHRWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdF90cnksIC8vIEJsb2NrVmFsXG5cdFx0XHRfY2F0Y2gsIC8vIE9wdFtDYXRjaF1cblx0XHRcdF9maW5hbGx5KSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXRjaCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhdWdodCAvKiBMb2NhbERlY2xhcmUgKi8sIGJsb2NrIC8qIEJsb2NrRG8vQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2F1Z2h0ID0gY2F1Z2h0XG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gQmxvY2tcblx0ZXhwb3J0IGNsYXNzIEJsb2NrIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50IC8qIE9wdFtTdHJpbmddICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0RvIGV4dGVuZHMgQmxvY2sge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcyAvKiBBcnJheVtMaW5lQ29udGVudF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsIGV4dGVuZHMgQmxvY2sgeyB9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrV2l0aFJldHVybiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMgLyogQXJyYXlbTGluZUNvbnRlbnRdICovLCByZXR1cm5lZCAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLnJldHVybmVkID0gcmV0dXJuZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWxUaHJvdyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMgLyogQXJyYXlbTGluZUNvbnRlbnRdICovLCBfdGhyb3cgLyogVGhyb3cgKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLnRocm93ID0gX3Rocm93XG5cdFx0fVxuXHR9XG5cblx0Ly8gVE9ETzogQmxvY2tCYWcsIEJsb2NrTWFwLCBCbG9ja09iaiA9PiBCbG9ja0J1aWxkKGtpbmQsIC4uLilcblx0ZXhwb3J0IGNsYXNzIEJsb2NrT2JqIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcyAvKiBBcnJheVtVbmlvbltMaW5lQ29udGVudCBPYmpFbnRyeV1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdHRoaXMuYnVpbHQgPSBuZXcgTG9jYWxEZWNsYXJlQnVpbHQobG9jKVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5QXNzaWduIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduIC8qIEFzc2lnbiAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlDb21wdXRlZCBleHRlbmRzIE9iakVudHJ5IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSAvKiBWYWwgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBPYmpFbnRyeVBsYWluIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdHN0YXRpYyBhY2Nlc3MobG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBuYW1lLCBuZXcgTG9jYWxBY2Nlc3MobG9jLCBuYW1lKSlcblx0XHR9XG5cblx0XHRzdGF0aWMgbmFtZShsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCAnbmFtZScsIHZhbHVlKVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrQmFnIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcyAvKiBVbmlvbltMaW5lQ29udGVudCBCYWdFbnRyeV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5idWlsdCA9IG5ldyBMb2NhbERlY2xhcmVCdWlsdChsb2MpXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmFnRW50cnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCYWdFbnRyeU1hbnkgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja01hcCBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMgLyogVW5pb25bTGluZUNvbnRlbnQgTWFwRW50cnldICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdHRoaXMuYnVpbHQgPSBuZXcgTG9jYWxEZWNsYXJlQnVpbHQobG9jKVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE1hcEVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5IC8qIFZhbCAqLywgdmFsIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdHRoaXMudmFsID0gdmFsXG5cdFx0fVxuXHR9XG5cbi8vIENvbmRpdGlvbmFsc1xuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVmFsICovLCByZXN1bHQgLyogQmxvY2tEbyAqLywgaXNVbmxlc3MgLyogQm9vbGVhbiAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDb25kaXRpb25hbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFZhbCAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovLCBpc1VubGVzcyAvKiBCb29sZWFuICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdFx0dGhpcy5pc1VubGVzcyA9IGlzVW5sZXNzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIENvbmQgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCAvKiBWYWwgKi8sIGlmVHJ1ZSAvKiBWYWwgKi8sIGlmRmFsc2UgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLmlmVHJ1ZSA9IGlmVHJ1ZVxuXHRcdFx0dGhpcy5pZkZhbHNlID0gaWZGYWxzZVxuXHRcdH1cblx0fVxuXG4vLyBGdW5cblx0ZXhwb3J0IGNsYXNzIEZ1biBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BEZWNsYXJlVGhpcywgLy8gT3B0W0xvY2FsRGVjbGFyZVRoaXNdXG5cdFx0XHRpc0dlbmVyYXRvciwgLy8gQm9vbGVhblxuXHRcdFx0YXJncywgLy8gQXJyYXlbTG9jYWxEZWNsYXJlXVxuXHRcdFx0b3BSZXN0QXJnLCAvLyBPcHRbTG9jYWxEZWNsYXJlXVxuXHRcdFx0YmxvY2ssIC8vIEJsb2NrXG5cdFx0XHRvcERlY2xhcmVSZXMpIHsgLy8gT3B0W0xvY2FsRGVjbGFyZVJlc11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9IG9wRGVjbGFyZVRoaXNcblx0XHRcdHRoaXMuaXNHZW5lcmF0b3IgPSBpc0dlbmVyYXRvclxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdFx0dGhpcy5vcFJlc3RBcmcgPSBvcFJlc3RBcmdcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5vcERlY2xhcmVSZXMgPSBvcERlY2xhcmVSZXNcblx0XHR9XG5cdH1cblxuLy8gR2VuZXJhdG9yXG5cdGV4cG9ydCBjbGFzcyBZaWVsZCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcFlpZWxkZWQ9bnVsbCAvKiBPcHRbVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcFlpZWxkZWQgPSBvcFlpZWxkZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgWWllbGRUbyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB5aWVsZGVkVG8gLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnlpZWxkZWRUbyA9IHlpZWxkZWRUb1xuXHRcdH1cblx0fVxuXG4vLyBDbGFzc1xuXHRleHBvcnQgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdG9wU3VwZXJDbGFzcywgLy8gT3B0W1ZhbF1cblx0XHRcdG9wQ29tbWVudCxcblx0XHRcdG9wRG8sIC8vIE9wdFtDbGFzc0RvXSxcblx0XHRcdHN0YXRpY3MsIC8vIEFycmF5W01ldGhvZEltcGxMaWtlXVxuXHRcdFx0b3BDb25zdHJ1Y3RvciwgLy8gT3B0W0NvbnN0cnVjdG9yXVxuXHRcdFx0bWV0aG9kcykgeyAvLyBBcnJheVtNZXRob2RJbXBsTGlrZV1cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BTdXBlckNsYXNzID0gb3BTdXBlckNsYXNzXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdFx0dGhpcy5vcERvID0gb3BEb1xuXHRcdFx0dGhpcy5zdGF0aWNzID0gc3RhdGljc1xuXHRcdFx0dGhpcy5vcENvbnN0cnVjdG9yID0gb3BDb25zdHJ1Y3RvclxuXHRcdFx0dGhpcy5tZXRob2RzID0gbWV0aG9kc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDb25zdHJ1Y3RvciBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGZ1biAvKiBGdW4qLywgbWVtYmVyQXJncyAvKiBBcnJheVtMb2NhbERlY2xhcmVdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdFx0dGhpcy5tZW1iZXJBcmdzID0gbWVtYmVyQXJnc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBNZXRob2RJbXBsTGlrZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCAvKiBVbmlvbltTdHJpbmcgVmFsXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5zeW1ib2wgPSBzeW1ib2xcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGwgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wsIGZ1biAvKiBGdW4gKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0dGhpcy5mdW4gPSBmdW5cblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEdldHRlciBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgYmxvY2sgLyogQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gbmV3IExvY2FsRGVjbGFyZVRoaXMobG9jKVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTWV0aG9kU2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIHN5bWJvbClcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5kZWNsYXJlVGhpcyA9IG5ldyBMb2NhbERlY2xhcmVUaGlzKGxvYylcblx0XHRcdHRoaXMuZGVjbGFyZUZvY3VzID0gbmV3IExvY2FsRGVjbGFyZUZvY3VzKGxvYylcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2xhc3NEbyBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGRlY2xhcmVGb2N1cyAvKiBMb2NhbERlY2xhcmVGb2N1cyAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBkZWNsYXJlRm9jdXNcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXJncyAvKiBBcnJheVtVbmlvbltWYWwgU3BsYXRdXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgU3VwZXJDYWxsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzIC8qIEFycmF5W1VuaW9uW1ZhbCBTcGxhdF1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN1cGVyTWVtYmVyIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogVW5pb25bU3RyaW5nIFZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuLy8gQ2FsbHNcblx0ZXhwb3J0IGNsYXNzIENhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBjb250YWlucyhsb2MsIHRlc3RUeXBlLCB0ZXN0ZWQpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU1ZfQ29udGFpbnMpLCBbdGVzdFR5cGUsIHRlc3RlZF0pXG5cdFx0fVxuXG5cdFx0c3RhdGljIHN1Yihsb2MsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU1ZfU3ViKSwgYXJncylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCAvKiBWYWwgKi8sIGFyZ3MgLyogQXJyYXlbVW5pb25bVmFsIFNwbGF0XV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlIC8qIFZhbCAqLywgYXJncyAvKiBVbmlvbltWYWwgU3BsYXRdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFNwbGF0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3BsYXR0ZWQgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnNwbGF0dGVkID0gc3BsYXR0ZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BDYXNlZCwgLy8gT3B0W0Fzc2lnblNpbmdsZV1cblx0XHRcdHBhcnRzLCAvLyBBcnJheVtDYXNlRG9QYXJ0XVxuXHRcdFx0b3BFbHNlKSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXNlVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRvcENhc2VkLCAvLyBPcHRbQXNzaWduU2luZ2xlXVxuXHRcdFx0cGFydHMsIC8vIEFycmF5W0Nhc2VWYWxQYXJ0XVxuXHRcdFx0b3BFbHNlKSB7IC8vIE9wdFtCbG9ja1ZhbF1cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZURvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVW5pb25bVmFsIFBhdHRlcm5dICovLCByZXN1bHQgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZVZhbFBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFVuaW9uW1ZhbCBQYXR0ZXJuXSAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdHR5cGUsIC8vIFZhbFxuXHRcdFx0bG9jYWxzLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRwYXR0ZXJuZWQpIHsgLy8gTG9jYWxBY2Nlc3Ncblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHR0aGlzLnBhdHRlcm5lZCA9IHBhdHRlcm5lZFxuXHRcdH1cblx0fVxuXG4vLyBTd2l0Y2hcblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdHN3aXRjaGVkLCAvLyBWYWxcblx0XHRcdHBhcnRzLCAvLyBBcnJheVtTd2l0Y2hEb1BhcnRdXG5cdFx0XHRvcEVsc2UpIHsgLy8gT3B0W0Jsb2NrRG9dXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnN3aXRjaGVkID0gc3dpdGNoZWRcblx0XHRcdHRoaXMucGFydHMgPSAgcGFydHNcblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0c3dpdGNoZWQsIC8vIFZhbFxuXHRcdFx0cGFydHMsIC8vIEFycmF5W1N3aXRjaFZhbFBhcnRdXG5cdFx0XHRvcEVsc2UpIHsgLy8gT3B0W0Jsb2NrVmFsXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcyAvKiBBcnJheVtWYWxdICovLCByZXN1bHQgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZXMgPSB2YWx1ZXNcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaFZhbFBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZXMgLyogQXJyYXlbVmFsXSAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuLy8gRm9yXG5cdGV4cG9ydCBjbGFzcyBGb3JEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUgLyogT3B0W0l0ZXJhdGVlXSAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEZvclZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcEl0ZXJhdGVlIC8qIE9wdFtJdGVyYXRlZV0gKi8sIGJsb2NrIC8qIEJsb2NrRG8gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBGb3JCYWcgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSAvKiBPcHRbSXRlcmF0ZWVdICovLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYylcblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBJdGVyYXRlZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGVsZW1lbnQgLyogTG9jYWxEZWNsYXJlICovLCBiYWcgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG5cdFx0XHR0aGlzLmJhZyA9IGJhZ1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCcmVhayBleHRlbmRzIERvIHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBCcmVha1dpdGhWYWwgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIE1pc2MgVmFsc1xuXHRleHBvcnQgY2xhc3MgQmxvY2tXcmFwIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJsb2NrIC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmFnU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzIC8qIEFycmF5W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBPYmpTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFpcnMgLyogQXJyYXlbT2JqUGFpcl0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGFpcnMgPSBwYWlyc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBPYmpQYWlyIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5IC8qIFN0cmluZyAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0XG5cdFx0TF9BbmQgPSAwLFxuXHRcdExfT3IgPSAxXG5cdGV4cG9ydCBjbGFzcyBMb2dpYyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kIC8qIE51bWJlciAqLywgYXJncyAvKiBBcnJheVtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE5vdCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmcgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFyZyA9IGFyZ1xuXHRcdH1cblx0fVxuXG5cdC8vIFRoaXMgaXMgYm90aCBhIFRva2VuIGFuZCBNc0FzdC5cblx0Ly8gU3RvcmUgdGhlIHZhbHVlIGFzIGEgU3RyaW5nIHNvIHdlIGNhbiBkaXN0aW5ndWlzaCBgMHhmYCBmcm9tIGAxNWAuXG5cdGV4cG9ydCBjbGFzcyBOdW1iZXJMaXRlcmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0Ly8gVG9rZW5zIG5lZWQgdG9TdHJpbmcuXG5cdFx0dG9TdHJpbmcoKSB7IHJldHVybiB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgfVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QgLyogVmFsICovLCBuYW1lIC8qIFVuaW9uW1N0cmluZyBWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9iamVjdCA9IG9iamVjdFxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBRdW90ZSBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGZvclN0cmluZyhsb2MsIHN0cikge1xuXHRcdFx0cmV0dXJuIG5ldyBRdW90ZShsb2MsIFtzdHJdKVxuXHRcdH1cblxuXHRcdC8vIHBhcnRzIGFyZSBTdHJpbmdzIGludGVybGVhdmVkIHdpdGggVmFscy5cblx0XHQvLyBwYXJ0IFN0cmluZ3MgYXJlIHJhdyB2YWx1ZXMsIG1lYW5pbmcgXCJcXG5cIiBpcyB0d28gY2hhcmFjdGVycy5cblx0XHQvLyBTaW5jZSBcIlxce1wiIGlzIHNwZWNpYWwgdG8gTWFzb24sIHRoYXQncyBvbmx5IG9uZSBjaGFyYWN0ZXIuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXJ0cyAvKiBBcnJheVtVbmlvbltTdHJpbmcgVmFsXV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBRdW90ZVRlbXBsYXRlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRhZyAvKiBWYWwgKi8sIHF1b3RlIC8qIFF1b3RlICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRhZyA9IHRhZ1xuXHRcdFx0dGhpcy5xdW90ZSA9IHF1b3RlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFdpdGggZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZSAvKiBMb2NhbERlY2xhcmUgKi8sIHZhbHVlIC8qIFZhbCAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlID0gZGVjbGFyZVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gU3BlY2lhbFxuXHRleHBvcnQgY29uc3QgU0RfRGVidWdnZXIgPSAwXG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdFxuXHRcdFNWX0NvbnRhaW5zID0gMCxcblx0XHRTVl9GYWxzZSA9IDEsXG5cdFx0U1ZfTnVsbCA9IDIsXG5cdFx0U1ZfU3ViID0gMyxcblx0XHRTVl9UcnVlID0gNCxcblx0XHRTVl9VbmRlZmluZWQgPSA1LFxuXHRcdFNWX05hbWUgPSA2XG5cdGV4cG9ydCBjbGFzcyBTcGVjaWFsVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQgLyogTnVtYmVyICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIElnbm9yZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGlnbm9yZWQgLyogQXJyYXlbU3RyaW5nXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5pZ25vcmVkID0gaWdub3JlZFxuXHRcdH1cblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

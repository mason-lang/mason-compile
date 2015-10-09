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
		block) {
			let opIn = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];
			let opDeclareRes = arguments.length <= 7 || arguments[7] === undefined ? null : arguments[7];
			let opOut = arguments.length <= 8 || arguments[8] === undefined ? null : arguments[8];
			// Opt[BlockDo]) {
			super(loc);
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
// Block
// Opt[BlockDo]
// Opt[LocalDeclareRes]
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1zQXN0LmpzIiwicHJpdmF0ZS9Nc0FzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FlLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDs7QUFFRCxVQUFRLEdBQUc7QUFDVixTQUFNLE9BQU8sR0FBRyxDQUFDLElBQ2hCLENBQUMsS0FBSyxJQUFJLEdBQ1QsTUFBTSxHQUNOLENBQUMsS0FBSyxTQUFTLEdBQ2YsV0FBVyxHQUNYLENBQUMsWUFBWSxLQUFLLEdBQ2xCLENBQUMsS0FBSyxHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLENBQUMsR0FDM0QsT0FBTyxDQUFDLEtBQUssUUFBUSxHQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUNqQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7O0FBRWQsU0FBTSxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUVoRCxTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtBQUNsQyxTQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQ3RDLE1BQU0sR0FBRyxDQUFDLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1RCxVQUFPLENBQUMsR0FBRSxJQUFJLEVBQUMsQ0FBQyxHQUFFLEtB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RyxFQUFFLElBQUksZUFBZTtBQUNuQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7O0FBRU0sT0FBTSxNQUFNLFNBQVMsRUFBRSxDQUFDO0FBQzlCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxzQkFBc0I7QUFDN0MsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7R0FDdEI7RUFDRCIsImZpbGUiOiJwcml2YXRlL01zQXN0LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBNc0FzdCB7XG5cdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRjb25zdCBpbnNwZWN0ID0gXyA9PlxuXHRcdFx0XyA9PT0gbnVsbCA/XG5cdFx0XHRcdCdudWxsJyA6XG5cdFx0XHRcdF8gPT09IHVuZGVmaW5lZCA/XG5cdFx0XHRcdCd1bmRlZmluZWQnIDpcblx0XHRcdFx0XyBpbnN0YW5jZW9mIEFycmF5ID9cblx0XHRcdFx0YFtcXG5cXHQke18ubWFwKF8gPT4gaW5kZW50KF8udG9TdHJpbmcoKSkpLmpvaW4oJyxcXG5cXHQnKX1cXG5dYCA6XG5cdFx0XHRcdHR5cGVvZiBfID09PSAnc3RyaW5nJyA/XG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KF8pIDpcblx0XHRcdFx0Xy50b1N0cmluZygpXG5cblx0XHRjb25zdCBpbmRlbnQgPSBzdHIgPT4gc3RyLnJlcGxhY2UoL1xcbi9nLCAnXFxuXFx0JylcblxuXHRcdGNvbnN0IHR5cGUgPSB0aGlzLmNvbnN0cnVjdG9yLm5hbWVcblx0XHRjb25zdCBwcm9wcyA9IE9iamVjdC5rZXlzKHRoaXMpLm1hcChrZXkgPT5cblx0XHRcdCdcXG5cXHQnICsgYCR7a2V5fTogYCArIGluZGVudChpbnNwZWN0KHRoaXNba2V5XSkpKS5qb2luKCcsJylcblx0XHRyZXR1cm4gYCR7dHlwZX0oJHtwcm9wc30pYFxuXHR9XG59XG5cbi8vIExpbmVDb250ZW50XG5cdC8vIFZhbGlkIHBhcnQgb2YgYSBCbG9jay5cblx0ZXhwb3J0IGNsYXNzIExpbmVDb250ZW50IGV4dGVuZHMgTXNBc3QgeyB9XG5cblx0Ly8gVGhlc2UgY2FuIG9ubHkgYXBwZWFyIGFzIGxpbmVzIGluIGEgQmxvY2suXG5cdGV4cG9ydCBjbGFzcyBEbyBleHRlbmRzIExpbmVDb250ZW50IHsgfVxuXG5cdC8vIFRoZXNlIGNhbiBhcHBlYXIgaW4gYW55IGV4cHJlc3Npb24uXG5cdGV4cG9ydCBjbGFzcyBWYWwgZXh0ZW5kcyBMaW5lQ29udGVudCB7IH1cblxuLy8gTW9kdWxlXG5cdGV4cG9ydCBjbGFzcyBNb2R1bGUgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BDb21tZW50LCAvLyBPcHRbU3RyaW5nXVxuXHRcdFx0ZG9JbXBvcnRzLCAvLyBBcnJheVtJbXBvcnREb11cblx0XHRcdGltcG9ydHMsIC8vIEFycmF5W0ltcG9ydF1cblx0XHRcdG9wSW1wb3J0R2xvYmFsLCAvLyBOdWxsYWJsZVtJbXBvcnRHbG9iYWxdXG5cdFx0XHRsaW5lcykgeyAvLyBBcnJheVtEb11cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHR0aGlzLmRvSW1wb3J0cyA9IGRvSW1wb3J0c1xuXHRcdFx0dGhpcy5pbXBvcnRzID0gaW1wb3J0c1xuXHRcdFx0dGhpcy5vcEltcG9ydEdsb2JhbCA9IG9wSW1wb3J0R2xvYmFsXG5cdFx0XHR0aGlzLmxpbmVzID0gbGluZXNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTW9kdWxlRXhwb3J0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduIC8qIEFzc2lnblNpbmdsZSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIE1vZHVsZUV4cG9ydE5hbWVkIGV4dGVuZHMgTW9kdWxlRXhwb3J0IHsgfVxuXHRleHBvcnQgY2xhc3MgTW9kdWxlRXhwb3J0RGVmYXVsdCBleHRlbmRzIE1vZHVsZUV4cG9ydCB7IH1cblxuXHRleHBvcnQgY2xhc3MgSW1wb3J0RG8gZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBwYXRoIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5wYXRoID0gcGF0aFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBJbXBvcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0cGF0aCwgLy8gU3RyaW5nXG5cdFx0XHRpbXBvcnRlZCwgLy8gQXJyYXlbTG9jYWxEZWNsYXJlXVxuXHRcdFx0b3BJbXBvcnREZWZhdWx0KSB7IC8vIE9wdFtMb2NhbERlY2xhcmVdXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoXG5cdFx0XHR0aGlzLmltcG9ydGVkID0gaW1wb3J0ZWRcblx0XHRcdHRoaXMub3BJbXBvcnREZWZhdWx0ID0gb3BJbXBvcnREZWZhdWx0XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEltcG9ydEdsb2JhbCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRpbXBvcnRlZCwgLy8gQXJyYXlbTG9jYWxEZWNsYXJlXVxuXHRcdFx0b3BJbXBvcnREZWZhdWx0KSB7IC8qIE9wdFtMb2NhbERlY2xhcmVdICovXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmltcG9ydGVkID0gaW1wb3J0ZWRcblx0XHRcdHRoaXMub3BJbXBvcnREZWZhdWx0ID0gb3BJbXBvcnREZWZhdWx0XG5cdFx0fVxuXHR9XG5cbi8vIExvY2Fsc1xuXHRleHBvcnQgY29uc3Rcblx0XHRMRF9Db25zdCA9IDAsXG5cdFx0TERfTGF6eSA9IDEsXG5cdFx0TERfTXV0YWJsZSA9IDJcblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZSBleHRlbmRzIE1zQXN0IHtcblx0XHRzdGF0aWMgdW50eXBlZChsb2MsIG5hbWUsIGtpbmQpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxEZWNsYXJlKGxvYywgbmFtZSwgbnVsbCwga2luZClcblx0XHR9XG5cblx0XHRzdGF0aWMgcGxhaW4obG9jLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvY2FsRGVjbGFyZShsb2MsIG5hbWUsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblxuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8sIG9wVHlwZSAvKiBPcHRbVmFsXSAqLywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdHRoaXMub3BUeXBlID0gb3BUeXBlXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0fVxuXG5cdFx0aXNMYXp5KCkge1xuXHRcdFx0cmV0dXJuIHRoaXMua2luZCA9PT0gTERfTGF6eVxuXHRcdH1cblxuXHRcdGlzTXV0YWJsZSgpIHtcblx0XHRcdHJldHVybiB0aGlzLmtpbmQgPT09IExEX011dGFibGVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlQnVpbHQgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jLCAnYnVpbHQnLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZUZvY3VzIGV4dGVuZHMgTG9jYWxEZWNsYXJlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHRcdHN1cGVyKGxvYywgJ18nLCBudWxsLCBMRF9Db25zdClcblx0XHR9XG5cdH1cblx0ZXhwb3J0IGNsYXNzIExvY2FsRGVjbGFyZU5hbWUgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jLCAnbmFtZScsIG51bGwsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTG9jYWxEZWNsYXJlVGhpcyBleHRlbmRzIExvY2FsRGVjbGFyZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0XHRzdXBlcihsb2MsICd0aGlzJywgbnVsbCwgTERfQ29uc3QpXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBMb2NhbERlY2xhcmVSZXMgZXh0ZW5kcyBMb2NhbERlY2xhcmUge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BUeXBlKSB7XG5cdFx0XHRzdXBlcihsb2MsICdyZXMnLCBvcFR5cGUsIExEX0NvbnN0KVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBMb2NhbEFjY2VzcyBleHRlbmRzIFZhbCB7XG5cdFx0c3RhdGljIGZvY3VzKGxvYykge1xuXHRcdFx0cmV0dXJuIG5ldyBMb2NhbEFjY2Vzcyhsb2MsICdfJylcblx0XHR9XG5cblx0XHRzdGF0aWMgdGhpcyhsb2MpIHtcblx0XHRcdHJldHVybiBuZXcgTG9jYWxBY2Nlc3MobG9jLCAndGhpcycpXG5cdFx0fVxuXG5cdFx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBMb2NhbE11dGF0ZSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBBc3NpZ25cblx0ZXhwb3J0IGNsYXNzIEFzc2lnbiBleHRlbmRzIERvIHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NpZ25TaW5nbGUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdHN0YXRpYyBmb2N1cyhsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhsb2MpLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFzc2lnbmVlIC8qIExvY2FsRGVjbGFyZSAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFzc2lnbmVlID0gYXNzaWduZWVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdGFsbEFzc2lnbmVlcygpIHsgcmV0dXJuIFt0aGlzLmFzc2lnbmVlXSB9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQXNzaWduRGVzdHJ1Y3R1cmUgZXh0ZW5kcyBBc3NpZ24ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduZWVzIC8qIEFycmF5W0xvY2FsRGVjbGFyZV0gKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hc3NpZ25lZXMgPSBhc3NpZ25lZXNcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblxuXHRcdGFsbEFzc2lnbmVlcygpIHtcblx0XHRcdHJldHVybiB0aGlzLmFzc2lnbmVlc1xuXHRcdH1cblxuXHRcdGtpbmQoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hc3NpZ25lZXNbMF0ua2luZFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjb25zdFxuXHRcdE1TX05ldyA9IDAsXG5cdFx0TVNfTXV0YXRlID0gMSxcblx0XHRNU19OZXdNdXRhYmxlID0gMlxuXHRleHBvcnQgY2xhc3MgTWVtYmVyU2V0IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb2JqZWN0IC8qIFZhbCAqLywgbmFtZSAvKiBTdHJpbmcgKi8sIGtpbmQgLyogTnVtYmVyICovLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0XG5cdFx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuLy8gRXJyb3JzXG5cdGV4cG9ydCBjbGFzcyBUaHJvdyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wVGhyb3duLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBBc3NlcnQgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBuZWdhdGUgLyogQm9vbGVhbiAqLywgY29uZGl0aW9uIC8qIFZhbCAqLywgb3BUaHJvd24gLyogT3B0W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmVnYXRlID0gbmVnYXRlXG5cdFx0XHQvLyBjb25kaXRpb24gdHJlYXRlZCBzcGVjaWFsbHkgaWYgYSBDYWxsLlxuXHRcdFx0dGhpcy5jb25kaXRpb24gPSBjb25kaXRpb25cblx0XHRcdHRoaXMub3BUaHJvd24gPSBvcFRocm93blxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHREbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIF90cnkgLyogQmxvY2tEbyAqLywgX2NhdGNoIC8qIE9wdFtDYXRjaF0gKi8sIF9maW5hbGx5IC8qIE9wdFtCbG9ja0RvXSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBFeGNlcHRWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdF90cnksIC8vIEJsb2NrVmFsXG5cdFx0XHRfY2F0Y2gsIC8vIE9wdFtDYXRjaF1cblx0XHRcdF9maW5hbGx5KSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5fdHJ5ID0gX3RyeVxuXHRcdFx0dGhpcy5fY2F0Y2ggPSBfY2F0Y2hcblx0XHRcdHRoaXMuX2ZpbmFsbHkgPSBfZmluYWxseVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXRjaCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhdWdodCAvKiBMb2NhbERlY2xhcmUgKi8sIGJsb2NrIC8qIEJsb2NrRG8vQmxvY2tWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2F1Z2h0ID0gY2F1Z2h0XG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuLy8gQmxvY2tcblx0ZXhwb3J0IGNsYXNzIEJsb2NrIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50IC8qIE9wdFtTdHJpbmddICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9wQ29tbWVudCA9IG9wQ29tbWVudFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0RvIGV4dGVuZHMgQmxvY2sge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcyAvKiBBcnJheVtMaW5lQ29udGVudF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrVmFsIGV4dGVuZHMgQmxvY2sgeyB9XG5cblx0ZXhwb3J0IGNsYXNzIEJsb2NrV2l0aFJldHVybiBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMgLyogQXJyYXlbTGluZUNvbnRlbnRdICovLCByZXR1cm5lZCAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLnJldHVybmVkID0gcmV0dXJuZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmxvY2tWYWxUaHJvdyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMgLyogQXJyYXlbTGluZUNvbnRlbnRdICovLCBfdGhyb3cgLyogVGhyb3cgKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgb3BDb21tZW50KVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0XHR0aGlzLnRocm93ID0gX3Rocm93XG5cdFx0fVxuXHR9XG5cblx0Ly8gVE9ETzogQmxvY2tCYWcsIEJsb2NrTWFwLCBCbG9ja09iaiA9PiBCbG9ja0J1aWxkKGtpbmQsIC4uLilcblx0ZXhwb3J0IGNsYXNzIEJsb2NrT2JqIGV4dGVuZHMgQmxvY2tWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BDb21tZW50LCBsaW5lcyAvKiBBcnJheVtVbmlvbltMaW5lQ29udGVudCBPYmpFbnRyeV1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdHRoaXMuYnVpbHQgPSBuZXcgTG9jYWxEZWNsYXJlQnVpbHQobG9jKVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcENvbW1lbnQgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE9iakVudHJ5QXNzaWduIGV4dGVuZHMgT2JqRW50cnkge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgYXNzaWduIC8qIEFzc2lnbiAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5hc3NpZ24gPSBhc3NpZ25cblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgT2JqRW50cnlDb21wdXRlZCBleHRlbmRzIE9iakVudHJ5IHtcblx0XHRzdGF0aWMgbmFtZShsb2MsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5Q29tcHV0ZWQobG9jLCBRdW90ZS5mb3JTdHJpbmcobG9jLCAnbmFtZScpLCB2YWx1ZSlcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSAvKiBWYWwgKi8sIHZhbHVlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5rZXkgPSBrZXlcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCbG9ja0JhZyBleHRlbmRzIEJsb2NrVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wQ29tbWVudCwgbGluZXMgLyogVW5pb25bTGluZUNvbnRlbnQgQmFnRW50cnldICovKSB7XG5cdFx0XHRzdXBlcihsb2MsIG9wQ29tbWVudClcblx0XHRcdHRoaXMuYnVpbHQgPSBuZXcgTG9jYWxEZWNsYXJlQnVpbHQobG9jKVxuXHRcdFx0dGhpcy5saW5lcyA9IGxpbmVzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEJhZ0VudHJ5IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmFnRW50cnlNYW55IGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlID0gdmFsdWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmxvY2tNYXAgZXh0ZW5kcyBCbG9ja1ZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcENvbW1lbnQsIGxpbmVzIC8qIFVuaW9uW0xpbmVDb250ZW50IE1hcEVudHJ5XSAqLykge1xuXHRcdFx0c3VwZXIobG9jLCBvcENvbW1lbnQpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYylcblx0XHRcdHRoaXMubGluZXMgPSBsaW5lc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBNYXBFbnRyeSBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGtleSAvKiBWYWwgKi8sIHZhbCAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2V5ID0ga2V5XG5cdFx0XHR0aGlzLnZhbCA9IHZhbFxuXHRcdH1cblx0fVxuXG4vLyBDb25kaXRpb25hbHNcblx0ZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFZhbCAqLywgcmVzdWx0IC8qIEJsb2NrRG8gKi8sIGlzVW5sZXNzIC8qIEJvb2xlYW4gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudGVzdCA9IHRlc3Rcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0XHR0aGlzLmlzVW5sZXNzID0gaXNVbmxlc3Ncblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxWYWwgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgdGVzdCAvKiBWYWwgKi8sIHJlc3VsdCAvKiBCbG9ja1ZhbCAqLywgaXNVbmxlc3MgLyogQm9vbGVhbiAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHRcdHRoaXMuaXNVbmxlc3MgPSBpc1VubGVzc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDb25kIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVmFsICovLCBpZlRydWUgLyogVmFsICovLCBpZkZhbHNlIC8qIFZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5pZlRydWUgPSBpZlRydWVcblx0XHRcdHRoaXMuaWZGYWxzZSA9IGlmRmFsc2Vcblx0XHR9XG5cdH1cblxuLy8gRnVuXG5cdGV4cG9ydCBjbGFzcyBGdW4gZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdG9wRGVjbGFyZVRoaXMsIC8vIE9wdFtMb2NhbERlY2xhcmVUaGlzXVxuXHRcdFx0aXNHZW5lcmF0b3IsIC8vIEJvb2xlYW5cblx0XHRcdGFyZ3MsIC8vIEFycmF5W0xvY2FsRGVjbGFyZV1cblx0XHRcdG9wUmVzdEFyZywgLy8gT3B0W0xvY2FsRGVjbGFyZV1cblx0XHRcdGJsb2NrLCAvLyBCbG9ja1xuXHRcdFx0b3BJbj1udWxsLCAvLyBPcHRbQmxvY2tEb11cblx0XHRcdG9wRGVjbGFyZVJlcz1udWxsLCAvLyBPcHRbTG9jYWxEZWNsYXJlUmVzXVxuXHRcdFx0b3BPdXQ9bnVsbCkgeyAvLyBPcHRbQmxvY2tEb10pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BEZWNsYXJlVGhpcyA9IG9wRGVjbGFyZVRoaXNcblx0XHRcdHRoaXMuaXNHZW5lcmF0b3IgPSBpc0dlbmVyYXRvclxuXHRcdFx0dGhpcy5hcmdzID0gYXJnc1xuXHRcdFx0dGhpcy5vcFJlc3RBcmcgPSBvcFJlc3RBcmdcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdFx0dGhpcy5vcEluID0gb3BJblxuXHRcdFx0dGhpcy5vcERlY2xhcmVSZXMgPSBvcERlY2xhcmVSZXNcblx0XHRcdHRoaXMub3BPdXQgPSBvcE91dFxuXHRcdH1cblx0fVxuXG4vLyBHZW5lcmF0b3Jcblx0ZXhwb3J0IGNsYXNzIFlpZWxkIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wWWllbGRlZD1udWxsIC8qIE9wdFtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLm9wWWllbGRlZCA9IG9wWWllbGRlZFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBZaWVsZFRvIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHlpZWxkZWRUbyAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMueWllbGRlZFRvID0geWllbGRlZFRvXG5cdFx0fVxuXHR9XG5cbi8vIENsYXNzXG5cdGV4cG9ydCBjbGFzcyBDbGFzcyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BTdXBlckNsYXNzLCAvLyBPcHRbVmFsXVxuXHRcdFx0b3BDb21tZW50LFxuXHRcdFx0b3BEbywgLy8gT3B0W0NsYXNzRG9dLFxuXHRcdFx0c3RhdGljcywgLy8gQXJyYXlbTWV0aG9kSW1wbExpa2VdXG5cdFx0XHRvcENvbnN0cnVjdG9yLCAvLyBPcHRbQ29uc3RydWN0b3JdXG5cdFx0XHRtZXRob2RzKSB7IC8vIEFycmF5W01ldGhvZEltcGxMaWtlXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcFN1cGVyQ2xhc3MgPSBvcFN1cGVyQ2xhc3Ncblx0XHRcdHRoaXMub3BDb21tZW50ID0gb3BDb21tZW50XG5cdFx0XHR0aGlzLm9wRG8gPSBvcERvXG5cdFx0XHR0aGlzLnN0YXRpY3MgPSBzdGF0aWNzXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IgPSBvcENvbnN0cnVjdG9yXG5cdFx0XHR0aGlzLm1ldGhvZHMgPSBtZXRob2RzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIENvbnN0cnVjdG9yIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZnVuIC8qIEZ1biovLCBtZW1iZXJBcmdzIC8qIEFycmF5W0xvY2FsRGVjbGFyZV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuZnVuID0gZnVuXG5cdFx0XHR0aGlzLm1lbWJlckFyZ3MgPSBtZW1iZXJBcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE1ldGhvZEltcGxMaWtlIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sIC8qIFVuaW9uW1N0cmluZyBWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnN5bWJvbCA9IHN5bWJvbFxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTWV0aG9kSW1wbCBleHRlbmRzIE1ldGhvZEltcGxMaWtlIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHN5bWJvbCwgZnVuIC8qIEZ1biAqLykge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHR0aGlzLmZ1biA9IGZ1blxuXHRcdH1cblx0fVxuXHRleHBvcnQgY2xhc3MgTWV0aG9kR2V0dGVyIGV4dGVuZHMgTWV0aG9kSW1wbExpa2Uge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3ltYm9sLCBibG9jayAvKiBCbG9ja1ZhbCAqLykge1xuXHRcdFx0c3VwZXIobG9jLCBzeW1ib2wpXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHRcdHRoaXMuZGVjbGFyZVRoaXMgPSBuZXcgTG9jYWxEZWNsYXJlVGhpcyhsb2MpXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBNZXRob2RTZXR0ZXIgZXh0ZW5kcyBNZXRob2RJbXBsTGlrZSB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBzeW1ib2wsIGJsb2NrIC8qIEJsb2NrRG8gKi8pIHtcblx0XHRcdHN1cGVyKGxvYywgc3ltYm9sKVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0XHR0aGlzLmRlY2xhcmVUaGlzID0gbmV3IExvY2FsRGVjbGFyZVRoaXMobG9jKVxuXHRcdFx0dGhpcy5kZWNsYXJlRm9jdXMgPSBuZXcgTG9jYWxEZWNsYXJlRm9jdXMobG9jKVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDbGFzc0RvIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgZGVjbGFyZUZvY3VzIC8qIExvY2FsRGVjbGFyZUZvY3VzICovLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmRlY2xhcmVGb2N1cyA9IGRlY2xhcmVGb2N1c1xuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN1cGVyQ2FsbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmdzIC8qIEFycmF5W1VuaW9uW1ZhbCBTcGxhdF1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cdGV4cG9ydCBjbGFzcyBTdXBlckNhbGxEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGFyZ3MgLyogQXJyYXlbVW5pb25bVmFsIFNwbGF0XV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuYXJncyA9IGFyZ3Ncblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgU3VwZXJNZW1iZXIgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuLy8gQ2FsbHNcblx0ZXhwb3J0IGNsYXNzIENhbGwgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBjb250YWlucyhsb2MsIHRlc3RUeXBlLCB0ZXN0ZWQpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU1ZfQ29udGFpbnMpLCBbdGVzdFR5cGUsIHRlc3RlZF0pXG5cdFx0fVxuXG5cdFx0c3RhdGljIHN1Yihsb2MsIGFyZ3MpIHtcblx0XHRcdHJldHVybiBuZXcgQ2FsbChsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU1ZfU3ViKSwgYXJncylcblx0XHR9XG5cblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGNhbGxlZCAvKiBWYWwgKi8sIGFyZ3MgLyogQXJyYXlbVW5pb25bVmFsIFNwbGF0XV0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuY2FsbGVkID0gY2FsbGVkXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE5ldyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0eXBlIC8qIFZhbCAqLywgYXJncyAvKiBVbmlvbltWYWwgU3BsYXRdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFNwbGF0IGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgc3BsYXR0ZWQgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnNwbGF0dGVkID0gc3BsYXR0ZWRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgTGF6eSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSAvKiBWYWwgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdH1cblx0fVxuXG4vLyBDYXNlXG5cdGV4cG9ydCBjbGFzcyBDYXNlRG8gZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0b3BDYXNlZCwgLy8gT3B0W0Fzc2lnblNpbmdsZV1cblx0XHRcdHBhcnRzLCAvLyBBcnJheVtDYXNlRG9QYXJ0XVxuXHRcdFx0b3BFbHNlKSB7IC8vIE9wdFtCbG9ja0RvXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcENhc2VkID0gb3BDYXNlZFxuXHRcdFx0dGhpcy5wYXJ0cyA9IHBhcnRzXG5cdFx0XHR0aGlzLm9wRWxzZSA9IG9wRWxzZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBDYXNlVmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsXG5cdFx0XHRvcENhc2VkLCAvLyBPcHRbQXNzaWduU2luZ2xlXVxuXHRcdFx0cGFydHMsIC8vIEFycmF5W0Nhc2VWYWxQYXJ0XVxuXHRcdFx0b3BFbHNlKSB7IC8vIE9wdFtCbG9ja1ZhbF1cblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BDYXNlZCA9IG9wQ2FzZWRcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdFx0dGhpcy5vcEVsc2UgPSBvcEVsc2Vcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZURvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHRlc3QgLyogVW5pb25bVmFsIFBhdHRlcm5dICovLCByZXN1bHQgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50ZXN0ID0gdGVzdFxuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQ2FzZVZhbFBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0ZXN0IC8qIFVuaW9uW1ZhbCBQYXR0ZXJuXSAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnRlc3QgPSB0ZXN0XG5cdFx0XHR0aGlzLnJlc3VsdCA9IHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBQYXR0ZXJuIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdHR5cGUsIC8vIFZhbFxuXHRcdFx0bG9jYWxzLCAvLyBBcnJheVtMb2NhbERlY2xhcmVdXG5cdFx0XHRwYXR0ZXJuZWQpIHsgLy8gTG9jYWxBY2Nlc3Ncblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMudHlwZSA9IHR5cGVcblx0XHRcdHRoaXMubG9jYWxzID0gbG9jYWxzXG5cdFx0XHR0aGlzLnBhdHRlcm5lZCA9IHBhdHRlcm5lZFxuXHRcdH1cblx0fVxuXG4vLyBTd2l0Y2hcblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYyxcblx0XHRcdHN3aXRjaGVkLCAvLyBWYWxcblx0XHRcdHBhcnRzLCAvLyBBcnJheVtTd2l0Y2hEb1BhcnRdXG5cdFx0XHRvcEVsc2UpIHsgLy8gT3B0W0Jsb2NrRG9dXG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnN3aXRjaGVkID0gc3dpdGNoZWRcblx0XHRcdHRoaXMucGFydHMgPSAgcGFydHNcblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLFxuXHRcdFx0c3dpdGNoZWQsIC8vIFZhbFxuXHRcdFx0cGFydHMsIC8vIEFycmF5W1N3aXRjaFZhbFBhcnRdXG5cdFx0XHRvcEVsc2UpIHsgLy8gT3B0W0Jsb2NrVmFsXVxuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5zd2l0Y2hlZCA9IHN3aXRjaGVkXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHRcdHRoaXMub3BFbHNlID0gb3BFbHNlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaERvUGFydCBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlcyAvKiBBcnJheVtWYWxdICovLCByZXN1bHQgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZXMgPSB2YWx1ZXNcblx0XHRcdHRoaXMucmVzdWx0ID0gcmVzdWx0XG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIFN3aXRjaFZhbFBhcnQgZXh0ZW5kcyBNc0FzdCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZXMgLyogQXJyYXlbVmFsXSAqLywgcmVzdWx0IC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnZhbHVlcyA9IHZhbHVlc1xuXHRcdFx0dGhpcy5yZXN1bHQgPSByZXN1bHRcblx0XHR9XG5cdH1cblxuLy8gRm9yXG5cdGV4cG9ydCBjbGFzcyBGb3JEbyBleHRlbmRzIERvIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIG9wSXRlcmF0ZWUgLyogT3B0W0l0ZXJhdGVlXSAqLywgYmxvY2sgLyogQmxvY2tEbyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vcEl0ZXJhdGVlID0gb3BJdGVyYXRlZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIEZvclZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvcEl0ZXJhdGVlIC8qIE9wdFtJdGVyYXRlZV0gKi8sIGJsb2NrIC8qIEJsb2NrRG8gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBGb3JCYWcgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgb3BJdGVyYXRlZSAvKiBPcHRbSXRlcmF0ZWVdICovLCBibG9jayAvKiBCbG9ja0RvICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmJ1aWx0ID0gbmV3IExvY2FsRGVjbGFyZUJ1aWx0KGxvYylcblx0XHRcdHRoaXMub3BJdGVyYXRlZSA9IG9wSXRlcmF0ZWVcblx0XHRcdHRoaXMuYmxvY2sgPSBibG9ja1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBJdGVyYXRlZSBleHRlbmRzIE1zQXN0IHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGVsZW1lbnQgLyogTG9jYWxEZWNsYXJlICovLCBiYWcgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG5cdFx0XHR0aGlzLmJhZyA9IGJhZ1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBCcmVhayBleHRlbmRzIERvIHsgfVxuXG5cdGV4cG9ydCBjbGFzcyBCcmVha1dpdGhWYWwgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB2YWx1ZSkge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cbi8vIE1pc2MgVmFsc1xuXHRleHBvcnQgY2xhc3MgQmxvY2tXcmFwIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGJsb2NrIC8qIEJsb2NrVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmJsb2NrID0gYmxvY2tcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgQmFnU2ltcGxlIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHBhcnRzIC8qIEFycmF5W1ZhbF0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGFydHMgPSBwYXJ0c1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBPYmpTaW1wbGUgZXh0ZW5kcyBWYWwge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFpcnMgLyogQXJyYXlbT2JqUGFpcl0gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMucGFpcnMgPSBwYWlyc1xuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBPYmpQYWlyIGV4dGVuZHMgTXNBc3Qge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2V5IC8qIFN0cmluZyAqLywgdmFsdWUgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtleSA9IGtleVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNvbnN0XG5cdFx0TF9BbmQgPSAwLFxuXHRcdExfT3IgPSAxXG5cdGV4cG9ydCBjbGFzcyBMb2dpYyBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kIC8qIE51bWJlciAqLywgYXJncyAvKiBBcnJheVtWYWxdICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdFx0XHR0aGlzLmFyZ3MgPSBhcmdzXG5cdFx0fVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE5vdCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBhcmcgLyogVmFsICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLmFyZyA9IGFyZ1xuXHRcdH1cblx0fVxuXG5cdC8vIFRoaXMgaXMgYm90aCBhIFRva2VuIGFuZCBNc0FzdC5cblx0Ly8gU3RvcmUgdGhlIHZhbHVlIGFzIGEgU3RyaW5nIHNvIHdlIGNhbiBkaXN0aW5ndWlzaCBgMHhmYCBmcm9tIGAxNWAuXG5cdGV4cG9ydCBjbGFzcyBOdW1iZXJMaXRlcmFsIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIHZhbHVlIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy52YWx1ZSA9IHZhbHVlXG5cdFx0fVxuXG5cdFx0Ly8gVG9rZW5zIG5lZWQgdG9TdHJpbmcuXG5cdFx0dG9TdHJpbmcoKSB7IHJldHVybiB0aGlzLnZhbHVlLnRvU3RyaW5nKCkgfVxuXHR9XG5cblx0ZXhwb3J0IGNsYXNzIE1lbWJlciBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBvYmplY3QgLyogVmFsICovLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5vYmplY3QgPSBvYmplY3Rcblx0XHRcdHRoaXMubmFtZSA9IG5hbWVcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgUXVvdGUgZXh0ZW5kcyBWYWwge1xuXHRcdHN0YXRpYyBmb3JTdHJpbmcobG9jLCBzdHIpIHtcblx0XHRcdHJldHVybiBuZXcgUXVvdGUobG9jLCBbc3RyXSlcblx0XHR9XG5cblx0XHQvLyBwYXJ0cyBhcmUgU3RyaW5ncyBpbnRlcmxlYXZlZCB3aXRoIFZhbHMuXG5cdFx0Ly8gcGFydCBTdHJpbmdzIGFyZSByYXcgdmFsdWVzLCBtZWFuaW5nIFwiXFxuXCIgaXMgdHdvIGNoYXJhY3RlcnMuXG5cdFx0Ly8gU2luY2UgXCJcXHtcIiBpcyBzcGVjaWFsIHRvIE1hc29uLCB0aGF0J3Mgb25seSBvbmUgY2hhcmFjdGVyLlxuXHRcdGNvbnN0cnVjdG9yKGxvYywgcGFydHMgLyogQXJyYXlbVW5pb25bU3RyaW5nIFZhbF1dICovKSB7XG5cdFx0XHRzdXBlcihsb2MpXG5cdFx0XHR0aGlzLnBhcnRzID0gcGFydHNcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY2xhc3MgUXVvdGVUZW1wbGF0ZSBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCB0YWcgLyogVmFsICovLCBxdW90ZSAvKiBRdW90ZSAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy50YWcgPSB0YWdcblx0XHRcdHRoaXMucXVvdGUgPSBxdW90ZVxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBXaXRoIGV4dGVuZHMgVmFsIHtcblx0XHRjb25zdHJ1Y3Rvcihsb2MsIGRlY2xhcmUgLyogTG9jYWxEZWNsYXJlICovLCB2YWx1ZSAvKiBWYWwgKi8sIGJsb2NrIC8qIEJsb2NrRG8gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuZGVjbGFyZSA9IGRlY2xhcmVcblx0XHRcdHRoaXMudmFsdWUgPSB2YWx1ZVxuXHRcdFx0dGhpcy5ibG9jayA9IGJsb2NrXG5cdFx0fVxuXHR9XG5cbi8vIFNwZWNpYWxcblx0ZXhwb3J0IGNvbnN0IFNEX0RlYnVnZ2VyID0gMFxuXHRleHBvcnQgY2xhc3MgU3BlY2lhbERvIGV4dGVuZHMgRG8ge1xuXHRcdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHR9XG5cdH1cblxuXHRleHBvcnQgY29uc3Rcblx0XHRTVl9Db250YWlucyA9IDAsXG5cdFx0U1ZfRmFsc2UgPSAxLFxuXHRcdFNWX051bGwgPSAyLFxuXHRcdFNWX1N1YiA9IDMsXG5cdFx0U1ZfVHJ1ZSA9IDQsXG5cdFx0U1ZfVW5kZWZpbmVkID0gNSxcblx0XHRTVl9OYW1lID0gNlxuXHRleHBvcnQgY2xhc3MgU3BlY2lhbFZhbCBleHRlbmRzIFZhbCB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdFx0c3VwZXIobG9jKVxuXHRcdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdH1cblx0fVxuXG5cdGV4cG9ydCBjbGFzcyBJZ25vcmUgZXh0ZW5kcyBEbyB7XG5cdFx0Y29uc3RydWN0b3IobG9jLCBpZ25vcmVkIC8qIEFycmF5W1N0cmluZ10gKi8pIHtcblx0XHRcdHN1cGVyKGxvYylcblx0XHRcdHRoaXMuaWdub3JlZCA9IGlnbm9yZWRcblx0XHR9XG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

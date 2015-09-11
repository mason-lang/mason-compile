export default class MsAst {
	constructor(loc) {
		this.loc = loc
	}

	toString() {
		const inspect = _ =>
			_ === null ?
				'null' :
				_ === undefined ?
				'undefined' :
				_ instanceof Array ?
				`[\n\t${_.map(_ => indent(_.toString())).join(',\n\t')}\n]` :
				typeof _ === 'string' ?
				JSON.stringify(_) :
				_.toString()

		const indent = str => str.replace(/\n/g, '\n\t')

		const type = this.constructor.name
		const props = Object.keys(this).map(key =>
			'\n\t' + `${key}: ` + indent(inspect(this[key]))).join(',')
		return `${type}(${props})`
	}
}

// LineContent
	// Valid part of a Block.
	export class LineContent extends MsAst { }

	// These can only appear as lines in a Block.
	export class Do extends LineContent { }

	// These can appear in any expression.
	export class Val extends LineContent { }

// Module
	export class Module extends MsAst {
		constructor(loc,
			doUses, // Array[UseDo]
			uses, // Array[Use]
			opUseGlobal, // Nullable[UseGlobal]
			debugUses, // Array[Use]
			lines, // Array[Do]
			exports, // Array[LocalDeclare]
			opDefaultExport) { // Opt[Val]
			super(loc)
			this.doUses = doUses
			this.uses = uses
			this.opUseGlobal = opUseGlobal
			this.debugUses = debugUses
			this.lines = lines
			this.exports = exports
			this.opDefaultExport = opDefaultExport
		}
	}

	export class UseDo extends MsAst {
		constructor(loc, path /* String */) {
			super(loc)
			this.path = path
		}
	}

	export class Use extends MsAst {
		constructor(loc,
			path, // String
			used, // Array[LocalDeclare]
			opUseDefault) { // Opt[LocalDeclare]
			super(loc)
			this.path = path
			this.used = used
			this.opUseDefault = opUseDefault
		}
	}

	export class UseGlobal extends MsAst {
		constructor(loc, used /* Array[LocalDeclare] */, opUseDefault /* Opt[LocalDeclare] */) {
			super(loc)
			this.used = used
			this.opUseDefault = opUseDefault
		}
	}

// Locals
	export const
		LD_Const = 0,
		LD_Lazy = 1,
		LD_Mutable = 2
	export class LocalDeclare extends MsAst {
		static untyped(loc, name, kind) {
			return new LocalDeclare(loc, name, null, kind)
		}

		static plain(loc, name) {
			return new LocalDeclare(loc, name, null, LD_Const)
		}

		constructor(loc, name /* String */, opType /* Opt[Val] */, kind /* Number */) {
			super(loc)
			this.name = name
			this.opType = opType
			this.kind = kind
		}

		isLazy() {
			return this.kind === LD_Lazy
		}

		isMutable() {
			return this.kind === LD_Mutable
		}
	}

	export class LocalDeclareBuilt extends LocalDeclare {
		constructor(loc) {
			super(loc, 'built', null, LD_Const)
		}
	}
	export class LocalDeclareFocus extends LocalDeclare {
		constructor(loc) {
			super(loc, '_', null, LD_Const)
		}
	}
	export class LocalDeclareName extends LocalDeclare {
		constructor(loc) {
			super(loc, 'name', null, LD_Const)
		}
	}
	export class LocalDeclareThis extends LocalDeclare {
		constructor(loc) {
			super(loc, 'this', null, LD_Const)
		}
	}
	export class LocalDeclareRes extends LocalDeclare {
		constructor(loc, opType) {
			super(loc, 'res', opType, LD_Const)
		}
	}

	export class LocalAccess extends Val {
		static focus(loc) {
			return new LocalAccess(loc, '_')
		}

		static this(loc) {
			return new LocalAccess(loc, 'this')
		}

		constructor(loc, name /* String */) {
			super(loc)
			this.name = name
		}
	}

	export class LocalMutate extends Do {
		constructor(loc, name /* String */, value /* Val */) {
			super(loc)
			this.name = name
			this.value = value
		}
	}

// Assign
	export class Assign extends Do { }

	export class AssignSingle extends Assign {
		static focus(loc, value) {
			return new AssignSingle(loc, new LocalDeclareFocus(loc), value)
		}

		constructor(loc, assignee /* LocalDeclare */, value /* Val */) {
			super(loc)
			this.assignee = assignee
			this.value = value
		}

		allAssignees() { return [ this.assignee ] }
	}

	export class AssignDestructure extends Assign {
		constructor(loc, assignees /* Array[LocalDeclare] */, value /* Val */) {
			super(loc)
			this.assignees = assignees
			this.value = value
		}

		allAssignees() {
			return this.assignees
		}

		kind() {
			return this.assignees[0].kind
		}
	}

	export const
		MS_New = 0,
		MS_Mutate = 1,
		MS_NewMutable = 2
	export class MemberSet extends Do {
		constructor(loc, object /* Val */, name /* String */, kind /* Number */, value /* Val */) {
			super(loc)
			this.object = object
			this.name = name
			this.kind = kind
			this.value = value
		}
	}

// Errors
	export class Throw extends Do {
		constructor(loc, opThrown /* Opt[Val] */) {
			super(loc)
			// TODO:ES6 optional arguments
			if (opThrown === undefined)
				opThrown = null
			this.opThrown = opThrown
		}
	}

	export class Assert extends Do {
		constructor(loc, negate /* Boolean */, condition /* Val */, opThrown /* Opt[Val] */) {
			super(loc)
			this.negate = negate
			// condition treated specially if a Call.
			this.condition = condition
			this.opThrown = opThrown
		}
	}

	export class ExceptDo extends Do {
		constructor(loc, _try /* BlockDo */, _catch /* Opt[Catch] */, _finally /* Opt[BlockDo] */) {
			super(loc)
			this._try = _try
			this._catch = _catch
			this._finally = _finally
		}
	}

	export class ExceptVal extends Val {
		constructor(loc,
			_try, // BlockVal
			_catch, // Opt[Catch]
			_finally) { // Opt[BlockDo]
			super(loc)
			this._try = _try
			this._catch = _catch
			this._finally = _finally
		}
	}

	export class Catch extends MsAst {
		constructor(loc, caught /* LocalDeclare */, block /* BlockDo/BlockVal */) {
			super(loc)
			this.caught = caught
			this.block = block
		}
	}

// Debug
	export class Debug extends Do {
		constructor(loc, lines /* Array[LineContent] */) {
			super(loc)
			this.lines = lines
		}
	}

// Block
	export class BlockDo extends MsAst {
		constructor(loc, lines /* Array[LineContent] */) {
			super(loc)
			this.lines = lines
		}
	}

	export class BlockVal extends MsAst { }

	export class BlockWithReturn extends BlockVal {
		constructor(loc, lines /* Array[LineContent] */, returned /* Val */) {
			super(loc)
			this.lines = lines
			this.returned = returned
		}
	}

	export class BlockValThrow extends BlockVal {
		constructor(loc, lines /* Array[LineContent] */, _throw /* Throw */) {
			super(loc)
			this.lines = lines
			this.throw = _throw
		}
	}

	// TODO: BlockBag, BlockMap, BlockObj => BlockBuild(kind, ...)
	export class BlockObj extends BlockVal {
		static of(loc, lines, opObjed, opName) {
			// TODO:ES6 optional arguments
			if (opObjed === undefined)
				opObjed = null
			if (opName === undefined)
				opName = null
			return new BlockObj(loc, new LocalDeclareBuilt(loc), lines, opObjed, opName)
		}

		constructor(loc,
			built, // LocalDeclareBuilt
			lines, // Array[Union[LineContent ObjEntry]]
			opObjed, // Opt[Val]
			opName) { // Opt[String]
			super(loc)
			this.built = built
			this.lines = lines
			this.opObjed = opObjed
			this.opName = opName
		}
	}
	export class ObjEntry extends Do { }

	export class ObjEntryAssign extends ObjEntry {
		constructor(loc, assign /* Assign */) {
			super(loc)
			this.assign = assign
		}
	}

	export class ObjEntryComputed extends ObjEntry {
		static name(loc, value) {
			return new ObjEntryComputed(loc, Quote.forString(loc, 'name'), value)
		}

		constructor(loc, key /* Val */, value /* Val */) {
			super(loc)
			this.key = key
			this.value = value
		}
	}

	export class BlockBag extends BlockVal {
		static of(loc, lines) {
			return new BlockBag(loc, new LocalDeclareBuilt(loc), lines)
		}

		constructor(loc, built /* LocalDeclareBuilt */, lines /* Union[LineContent BagEntry] */) {
			super(loc)
			this.built = built
			this.lines = lines
		}
	}

	export class BagEntry extends Do {
		constructor(loc, value /* Val */) {
			super(loc)
			this.value = value
		}
	}

	export class BagEntryMany extends Do {
		constructor(loc, value /* Val */) {
			super(loc)
			this.value = value
		}
	}

	export class BlockMap extends BlockVal {
		static of(loc, lines) {
			return new BlockMap(loc, new LocalDeclareBuilt(loc), lines)
		}

		constructor(loc, built /* LocalDeclareBuilt */, lines /* Union[LineContent MapEntry] */) {
			super(loc)
			this.built = built
			this.lines = lines
		}
	}

	export class MapEntry extends Do {
		constructor(loc, key /* Val */, val /* Val */) {
			super(loc)
			this.key = key
			this.val = val
		}
	}

// Conditionals
	export class ConditionalDo extends Do {
		constructor(loc, test /* Val */, result /* BlockDo */, isUnless /* Boolean */) {
			super(loc)
			this.test = test
			this.result = result
			this.isUnless = isUnless
		}
	}

	export class ConditionalVal extends Val {
		constructor(loc, test /* Val */, result /* BlockVal */, isUnless /* Boolean */) {
			super(loc)
			this.test = test
			this.result = result
			this.isUnless = isUnless
		}
	}

	export class Cond extends Val {
		constructor(loc, test /* Val */, ifTrue /* Val */, ifFalse /* Val */) {
			super(loc)
			this.test = test
			this.ifTrue = ifTrue
			this.ifFalse = ifFalse
		}
	}

// Fun
	export class Fun extends Val {
		constructor(loc,
			opDeclareThis, // Opt[LocalDeclareThis]
			isGenerator, // Boolean
			args, // Array[LocalDeclare]
			opRestArg, // Opt[LocalDeclare]
			block, // Block
			opIn, // Opt[Debug]
			opDeclareRes, // Opt[LocalDeclareRes]
			opOut) { // Opt[Debug]
			super(loc)
			// TODO:ES6 Optional args
			if (opIn === undefined)
				opIn = null
			if (opDeclareRes === undefined)
				opDeclareRes = null
			if (opOut === undefined)
				opOut = null

			this.opDeclareThis = opDeclareThis
			this.isGenerator = isGenerator
			this.args = args
			this.opRestArg = opRestArg
			this.block = block
			this.opIn = opIn
			this.opDeclareRes = opDeclareRes
			this.opOut = opOut
		}
	}

// Generator
	export class Yield extends Val {
		constructor(loc, opYielded /* Opt[Val] */) {
			super(loc)
			// TODO:ES6 Optional arguments
			if (opYielded === undefined)
				opYielded = null
			this.opYielded = opYielded
		}
	}

	export class YieldTo extends Val {
		constructor(loc, yieldedTo /* Val */) {
			super(loc)
			this.yieldedTo = yieldedTo
		}
	}

// Class
	export class Class extends Val {
		constructor(loc,
			opSuperClass, // Opt[Val]
			opDo, // Opt[ClassDo],
			statics, // Array[MethodImplLike]
			opConstructor, // Opt[Fun]
			methods) { // Array[MethodImplLike]
			super(loc)
			this.opSuperClass = opSuperClass
			this.opDo = opDo
			this.statics = statics
			this.opConstructor = opConstructor
			this.methods = methods
		}
	}

	export class Constructor extends MsAst {
		constructor(loc, fun /* Fun*/, memberArgs /* Array[LocalDeclare] */) {
			super(loc)
			this.fun = fun
			this.memberArgs = memberArgs
		}
	}

	export class MethodImplLike extends MsAst {
		constructor(loc, symbol /* Union[String Val] */) {
			super(loc)
			this.symbol = symbol
		}
	}
	export class MethodImpl extends MethodImplLike {
		constructor(loc, symbol, fun /* Fun */) {
			super(loc, symbol)
			this.fun = fun
		}
	}
	export class MethodGetter extends MethodImplLike {
		constructor(loc, symbol, block /* BlockVal */) {
			super(loc, symbol)
			this.block = block
			this.declareThis = new LocalDeclareThis(loc)
		}
	}
	export class MethodSetter extends MethodImplLike {
		constructor(loc, symbol, block /* BlockDo */) {
			super(loc, symbol)
			this.block = block
			this.declareThis = new LocalDeclareThis(loc)
			this.declareFocus = new LocalDeclareFocus(loc)
		}
	}

	export class ClassDo extends MsAst {
		constructor(loc, declareFocus /* LocalDeclareFocus */, block /* BlockDo */) {
			super(loc)
			this.declareFocus = declareFocus
			this.block = block
		}
	}

	export class SuperCall extends Val {
		constructor(loc, args /* Array[Union[Val Splat]] */) {
			super(loc)
			this.args = args
		}
	}
	export class SuperCallDo extends Do {
		constructor(loc, args /* Array[Union[Val Splat]] */) {
			super(loc)
			this.args = args
		}
	}

	export class SuperMember extends Val {
		constructor(loc, name /* String */) {
			super(loc)
			this.name = name
		}
	}

// Calls
	export class Call extends Val {
		static contains(loc, testType, tested) {
			return new Call(loc, new SpecialVal(loc, SV_Contains), [ testType, tested ])
		}

		static sub(loc, args) {
			return new Call(loc, new SpecialVal(loc, SV_Sub), args)
		}

		constructor(loc, called /* Val */, args /* Array[Union[Val Splat]] */) {
			super(loc)
			this.called = called
			this.args = args
		}
	}

	export class New extends Val {
		constructor(loc, type /* Val */, args /* Union[Val Splat] */) {
			super(loc)
			this.type = type
			this.args = args
		}
	}

	export class Splat extends MsAst {
		constructor(loc, splatted /* Val */) {
			super(loc)
			this.splatted = splatted
		}
	}

	export class Lazy extends Val {
		constructor(loc, value /* Val */) {
			super(loc)
			this.value = value
		}
	}

// Case
	export class CaseDo extends Do {
		constructor(loc,
			opCased, // Opt[AssignSingle]
			parts, // Array[CaseDoPart]
			opElse) { // Opt[BlockDo]
			super(loc)
			// TODO:ES6 Optional arguments
			if (opElse === undefined)
				opElse = null
			this.opCased = opCased
			this.parts = parts
			this.opElse = opElse
		}
	}

	export class CaseVal extends Val {
		constructor(loc,
			opCased, // Opt[AssignSingle]
			parts, // Array[CaseValPart]
			opElse) { // Opt[BlockVal]
			super(loc)
			// TODO:ES6 Optional arguments
			if (opElse === undefined)
				opElse = null
			this.opCased = opCased
			this.parts = parts
			this.opElse = opElse
		}
	}

	export class CaseDoPart extends MsAst {
		constructor(loc, test /* Union[Val Pattern] */, result /* BlockDo */) {
			super(loc)
			this.test = test
			this.result = result
		}
	}

	export class CaseValPart extends MsAst {
		constructor(loc, test /* Union[Val Pattern] */, result /* BlockVal */) {
			super(loc)
			this.test = test
			this.result = result
		}
	}

	export class Pattern extends MsAst {
		constructor(loc,
			type, // Val
			locals, // Array[LocalDeclare]
			patterned) { // LocalAccess
			super(loc)
			this.type = type
			this.locals = locals
			this.patterned = patterned
		}
	}

// Switch
	export class SwitchDo extends Do {
		constructor(loc,
			switched, // Val
			parts, // Array[SwitchDoPart]
			opElse) { // Opt[BlockDo]
			super(loc)
			this.switched = switched
			this.parts =  parts
			this.opElse = opElse
		}
	}

	export class SwitchVal extends Val {
		constructor(loc,
			switched, // Val
			parts, // Array[SwitchValPart]
			opElse) { // Opt[BlockVal]
			super(loc)
			this.switched = switched
			this.parts = parts
			this.opElse = opElse
		}
	}

	export class SwitchDoPart extends MsAst {
		constructor(loc, values /* Array[Val] */, result /* BlockDo */) {
			super(loc)
			this.values = values
			this.result = result
		}
	}

	export class SwitchValPart extends MsAst {
		constructor(loc, values /* Array[Val] */, result /* BlockVal */) {
			super(loc)
			this.values = values
			this.result = result
		}
	}

// For
	export class ForDo extends Do {
		constructor(loc, opIteratee /* Opt[Iteratee] */, block /* BlockDo */) {
			super(loc)
			this.opIteratee = opIteratee
			this.block = block
		}
	}

	export class ForVal extends Val {
		constructor(loc, opIteratee /* Opt[Iteratee] */, block /* BlockDo */) {
			super(loc)
			this.opIteratee = opIteratee
			this.block = block
		}
	}

	export class ForBag extends Val {
		static of(loc, opIteratee, block) {
			return new ForBag(loc, new LocalDeclareBuilt(loc), opIteratee, block)
		}

		constructor(loc,
			built, // LocalDeclareBuilt
			opIteratee, // Opt[Iteratee]
			block) { // BlockDo
			super(loc)
			this.built = built
			this.opIteratee = opIteratee
			this.block = block
		}
	}

	export class Iteratee extends MsAst {
		constructor(loc, element /* LocalDeclare */, bag /* Val */) {
			super(loc)
			this.element = element
			this.bag = bag
		}
	}

	export class Break extends Do { }

	export class BreakWithVal extends Do {
		constructor(loc, value) {
			super(loc)
			this.value = value
		}
	}

// Misc Vals
	export class BlockWrap extends Val {
		constructor(loc, block /* BlockVal */) {
			super(loc)
			this.block = block
		}
	}

	export class BagSimple extends Val {
		constructor(loc, parts /* Array[Val] */) {
			super(loc)
			this.parts = parts
		}
	}

	export class ObjSimple extends Val {
		constructor(loc, pairs /* Array[ObjPair] */) {
			super(loc)
			this.pairs = pairs
		}
	}

	export class ObjPair extends MsAst {
		constructor(loc, key /* String */, value /* Val */) {
			super(loc)
			this.key = key
			this.value = value
		}
	}

	export const
		L_And = 0,
		L_Or = 1
	export class Logic extends Val {
		constructor(loc, kind /* Number */, args /* Array[Val] */) {
			super(loc)
			this.kind = kind
			this.args = args
		}
	}

	export class Not extends Val {
		constructor(loc, arg /* Val */) {
			super(loc)
			this.arg = arg
		}
	}

	// Store the value as a String so we can distinguish `0xf` from `15`.
	export class NumberLiteral extends Val {
		constructor(loc, value /* String */) {
			super(loc)
			this.value = value
		}
	}

	export class Member extends Val {
		constructor(loc, object /* Val */, name /* String */) {
			super(loc)
			this.object = object
			this.name = name
		}
	}

	export class Quote extends Val {
		static forString(loc, str) {
			return new Quote(loc, [ str ])
		}

		// parts are Strings interleaved with Vals.
		// part Strings are raw values, meaning "\n" is two characters.
		// Since "\{" is special to Mason, that's only one character.
		constructor(loc, parts /* Array[Union[String Val]] */) {
			super(loc)
			this.parts = parts
		}
	}

	export class QuoteTemplate extends Val {
		constructor(loc, tag /* Val */, quote /* Quote */) {
			super(loc)
			this.tag = tag
			this.quote = quote
		}
	}

	export class With extends Val {
		constructor(loc, declare /* LocalDeclare */, value /* Val */, block /* BlockDo */) {
			super(loc)
			this.declare = declare
			this.value = value
			this.block = block
		}
	}

// Special
	export const SD_Debugger = 0
	export class SpecialDo extends Do {
		constructor(loc, kind /* Number */) {
			super(loc)
			this.kind = kind
		}
	}

	export const
		SV_Contains = 0,
		SV_False = 1,
		SV_Null = 2,
		SV_Sub = 3,
		SV_True = 4,
		SV_Undefined = 5,
		SV_Name = 6
	export class SpecialVal extends Val {
		constructor(loc, kind /* Number */) {
			super(loc)
			this.kind = kind
		}
	}

	export class Ignore extends Do {
		constructor(loc, ignored /* Array[String] */) {
			super(loc)
			this.ignored = ignored
		}
	}

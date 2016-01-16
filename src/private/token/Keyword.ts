import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {SpecialVals} from '../ast/Val'
import {showKeyword} from '../languages/util'
import Token from './Token'

/**
A "keyword" is any set of characters with a particular meaning.
It doensn't necessarily have to be something that might have been a [[Name]].
For example, see [[Keywords.ObjEntry]].

This can even include ones like `. ` (defines an object property, as in `key. value`).
Kind is a ***. See the full list below.
*/
export default class Keyword extends Token {
	constructor(loc: Loc, public kind: Keywords) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return showKeyword(this.kind)
	}
}

/** Kind of [[Keyword]]. */
export const enum Keywords {
	// JavaScript reserved words
	Enum,
	From,
	Implements,
	Interface,
	Package,
	Private,
	Protected,
	Public,

	// JavaScript keywords
	Arguments,
	Continue,
	Delete,
	Eval,
	In,
	InstanceOf,
	Return,
	TypeOf,
	Void,
	While,

	// Mason reserved words
	Bang,
	LeftAngle,
	LeftArrow,
	RightAngle,
	Data,
	Declare,
	DelPred,
	DoWhile,
	DoUntil,
	Final,
	Flags,
	Implicit,
	Is,
	Macro,
	Meta,
	Mut,
	Native,
	On,
	Operator,
	Out,
	Pure,
	Readonly,
	Sealed,
	Sizeof,
	Struct,
	Throws,
	To,
	Type,
	Until,
	Use,

	// Reserved: parallel
	Actor,
	Move,
	Send,
	Shared,
	Synchronized,
	Transient,
	Volatile,

	// Reserved: types
	Any,
	Boolean,
	Int,
	Int8,
	Int16,
	Int32,
	Int64,
	Uint,
	Uint8,
	Uint16,
	Uint32,
	Uint64,
	Float,
	Float32,
	Float64,
	Float128,
	Mixed,
	Number,
	Object,
	Ptr,
	String,
	Symbol,

	// Real keywords
	Abstract,
	Ampersand,
	And,
	As,
	Assert,
	Assign,
	Await,
	Break,
	Built,
	Case,
	Catch,
	Cond,
	Class,
	Colon,
	Construct,
	Debugger,
	Del,
	Do,
	Dot,
	Dot2,
	Dot3,
	Else,
	Except,
	Extends,
	False,
	Finally,
	Focus,
	For,
	ForAsync,
	ForBag,
	Forbid,
	Fun,
	FunDo,
	FunThis,
	FunThisDo,
	FunAsync,
	FunAsynDo,
	FunThisAsync,
	FunThisAsynDo,
	FunGen,
	FunGenDo,
	FunThisGen,
	FunThisGenDo,
	Get,
	If,
	Ignore,
	Import,
	ImportDo,
	ImportLazy,
	Lazy,
	LocalMutate,
	MapEntry,
	Method,
	My,
	Name,
	New,
	Not,
	Null,
	// Also works as BagEntry
	ObjEntry,
	Of,
	Override,
	Or,
	Pass,
	Pipe,
	Region,
	Set,
	Super,
	Static,
	Switch,
	Tick,
	Throw,
	Todo,
	Trait,
	TraitDo,
	True,
	Try,
	Undefined,
	Unless,
	Virtual,
	With,
	Yield,
	YieldTo
}

export function* reservedKeywords(): Iterable<Keywords> {
	for (let i = 0; i < Keywords.Abstract; i++)
		yield i
}

// This includes names used for debug (like Keywords.Ampersand -> '&')
const keywordKindToName = new Map<Keywords, string>([
	// Reserved keywords
	[Keywords.Enum, 'enum'],
	[Keywords.From, 'from'],
	[Keywords.Implements, 'implements'],
	[Keywords.Interface, 'interface'],
	[Keywords.Package, 'package'],
	[Keywords.Private, 'private'],
	[Keywords.Protected, 'protected'],
	[Keywords.Public, 'public'],
	[Keywords.Arguments, 'arguments'],
	[Keywords.Continue, 'continue'],
	[Keywords.Delete, 'delete'],
	[Keywords.Eval, 'eval'],
	[Keywords.In, 'in'],
	[Keywords.InstanceOf, 'instanceof'],
	[Keywords.Return, 'return'],
	[Keywords.TypeOf, 'typeof'],
	[Keywords.Void, 'void'],
	[Keywords.While, 'while'],
	[Keywords.Bang, '!'],
	[Keywords.LeftAngle, '<'],
	[Keywords.LeftArrow, '<-'],
	[Keywords.RightAngle, '>'],
	[Keywords.Data, 'data'],
	[Keywords.Declare, 'declare'],
	[Keywords.DelPred, 'del?'],
	[Keywords.DoWhile, 'do-while'],
	[Keywords.DoUntil, 'do-until'],
	[Keywords.Final, 'final'],
	[Keywords.Flags, 'flags'],
	[Keywords.Implicit, 'implicit'],
	[Keywords.Is, 'is'],
	[Keywords.Macro, 'macro'],
	[Keywords.Meta, 'meta'],
	[Keywords.Mut, 'mut'],
	[Keywords.Native, 'native'],
	[Keywords.On, 'on'],
	[Keywords.Operator, 'operator'],
	[Keywords.Out, 'out'],
	[Keywords.Pure, 'pure'],
	[Keywords.Readonly, 'readonly'],
	[Keywords.Sealed, 'sealed'],
	[Keywords.Sizeof, 'sizeof'],
	[Keywords.Struct, 'struct'],
	[Keywords.Throws, 'throws'],
	[Keywords.To, 'to'],
	[Keywords.Type, 'type'],
	[Keywords.Until, 'until'],
	[Keywords.Use, 'use'],

	[Keywords.Actor, 'actor'],
	[Keywords.Move, 'move'],
	[Keywords.Send, 'send'],
	[Keywords.Shared, 'shared'],
	[Keywords.Synchronized, 'synchronized'],
	[Keywords.Transient, 'transient'],
	[Keywords.Volatile, 'volatile'],

	[Keywords.Any, 'any'],
	[Keywords.Boolean, 'boolean'],
	[Keywords.Int, 'int'],
	[Keywords.Int8, 'int8'],
	[Keywords.Int16, 'int16'],
	[Keywords.Int32, 'int32'],
	[Keywords.Int64, 'int64'],
	[Keywords.Uint, 'uint'],
	[Keywords.Uint8, 'uint8'],
	[Keywords.Uint16, 'uint16'],
	[Keywords.Uint32, 'uint32'],
	[Keywords.Uint64, 'uint64'],
	[Keywords.Float, 'float'],
	[Keywords.Float32, 'float32'],
	[Keywords.Float64, 'float64'],
	[Keywords.Float128, 'float128'],
	[Keywords.Mixed, 'mixed'],
	[Keywords.Number, 'number'],
	[Keywords.Object, 'object'],
	[Keywords.Ptr, 'ptr'],
	[Keywords.String, 'string'],
	[Keywords.Symbol, 'symbol'],

	// Real keywords
	[Keywords.Abstract, 'abstract'],
	[Keywords.Ampersand, '&'],
	[Keywords.And, 'and'],
	[Keywords.As, 'as'],
	[Keywords.Assert, 'assert'],
	[Keywords.Assign, '='],
	[Keywords.Await, '$'],
	[Keywords.Break, 'break'],
	[Keywords.Built, 'built'],
	[Keywords.Case, 'case'],
	[Keywords.Catch, 'catch'],
	[Keywords.Cond, 'cond'],
	[Keywords.Class, 'class'],
	[Keywords.Colon, ':'],
	[Keywords.Construct, 'construct'],
	[Keywords.Debugger, 'debugger'],
	[Keywords.Del, 'del'],
	[Keywords.Do, 'do'],
	[Keywords.Dot, '.'],
	[Keywords.Dot2, '..'],
	[Keywords.Dot3, '...'],
	[Keywords.Else, 'else'],
	[Keywords.Except, 'except'],
	[Keywords.Extends, 'extends'],
	[Keywords.False, 'false'],
	[Keywords.Finally, 'finally'],
	[Keywords.Focus, '_'],
	[Keywords.For, 'for'],
	[Keywords.ForAsync, '$for'],
	[Keywords.ForBag, '@for'],
	[Keywords.Forbid, 'forbid'],
	[Keywords.Fun, '|'],
	[Keywords.FunDo, '!|'],
	[Keywords.FunThis, '.|'],
	[Keywords.FunThisDo, '.!|'],
	[Keywords.FunAsync, '$|'],
	[Keywords.FunAsynDo, '$!|'],
	[Keywords.FunThisAsync, '.$|'],
	[Keywords.FunThisAsynDo, '.$!|'],
	[Keywords.FunGen, '*|'],
	[Keywords.FunGenDo, '*!|'],
	[Keywords.FunThisGen, '.*|'],
	[Keywords.FunThisGenDo, '.*!|'],
	[Keywords.Get, 'get'],
	[Keywords.If, 'if'],
	[Keywords.Ignore, 'ignore'],
	[Keywords.Import, 'import'],
	[Keywords.ImportDo, 'import!'],
	[Keywords.ImportLazy, 'import~'],
	[Keywords.Lazy, '~'],
	[Keywords.LocalMutate, ':='],
	[Keywords.MapEntry, '->'],
	[Keywords.Method, 'method'],
	[Keywords.My, 'my'],
	[Keywords.Name, 'name'],
	[Keywords.New, 'new'],
	[Keywords.Not, 'not'],
	[Keywords.Null, 'null'],
	[Keywords.ObjEntry, '. '],
	[Keywords.Of, 'of'],
	[Keywords.Or, 'or'],
	[Keywords.Override, 'override'],
	[Keywords.Pass, 'pass'],
	[Keywords.Pipe, 'pipe'],
	[Keywords.Region, 'region'],
	[Keywords.Set, 'set'],
	[Keywords.Super, 'super'],
	[Keywords.Static, 'static'],
	[Keywords.Switch, 'switch'],
	[Keywords.Tick, '\''],
	[Keywords.Throw, 'throw'],
	[Keywords.Todo, 'todo'],
	[Keywords.Trait, 'trait'],
	[Keywords.TraitDo, 'trait!'],
	[Keywords.True, 'true'],
	[Keywords.Try, 'try'],
	[Keywords.Undefined, 'undefined'],
	[Keywords.Unless, 'unless'],
	[Keywords.Virtual, 'virtual'],
	[Keywords.With, 'with'],
	[Keywords.Yield, 'yield'],
	[Keywords.YieldTo, 'yield*']])

const notNameKeywords = new Set<Keywords>([
	Keywords.Ampersand, Keywords.Colon, Keywords.Dot, Keywords.Dot2, Keywords.Dot3, Keywords.Fun,
	Keywords.FunDo, Keywords.FunThis, Keywords.FunThisDo, Keywords.FunAsync, Keywords.FunAsynDo,
	Keywords.FunThisAsync, Keywords.FunThisAsynDo, Keywords.FunGen, Keywords.FunGenDo,
	Keywords.FunThisGen, Keywords.FunThisGenDo, Keywords.Lazy, Keywords.LocalMutate,
	Keywords.ObjEntry, Keywords.Tick
])

// Does not include reserved keywords
export const allKeywords: Array<Keywords> = (() => {
	const ks = new Set(keywordKindToName.keys())
	for (const _ of reservedKeywords())
		ks.delete(_)
	return Array.from(ks)
})()

const nameKeywords = new Set(allKeywords)
for (const _ of notNameKeywords)
	nameKeywords.delete(_)

const keywordNameToKind = new Map<string, Keywords>(
	Array.from(nameKeywords).map<[string, Keywords]>(_ => [keywordKindToName.get(_), _]))

export function keywordName(kind: Keywords): string {
	return keywordKindToName.get(kind)
}

/** See if the name is a keyword and if so return its kind. */
export function opKeywordKindFromName(name: string): Op<Keywords> {
	const kind = keywordNameToKind.get(name)
	return kind === undefined ? null : kind
}

export function opKeywordKindToSpecialValueKind(kind: Keywords): Op<SpecialVals> {
	switch (kind) {
		case Keywords.False:
			return SpecialVals.False
		case Keywords.Name:
			return SpecialVals.Name
		case Keywords.Null:
			return SpecialVals.Null
		case Keywords.True:
			return SpecialVals.True
		case Keywords.Undefined:
			return SpecialVals.Undefined
		default:
			return null
	}
}

export function isKeyword(keywordKind: Keywords, token: Token): token is Keyword {
	return token instanceof Keyword && token.kind === keywordKind
}

export function isAnyKeyword(keywordKinds: Set<Keywords>, token: Token): token is Keyword {
	return token instanceof Keyword && keywordKinds.has(token.kind)
}

export function tryGetKeywordName(token: Keyword): Op<string> {
	return nameKeywords.has(token.kind) ? keywordName(token.kind) : null
}

/** Whether `token` is a reserved word. */
export function isReservedKeyword(token: Token): token is Keyword {
	return token instanceof Keyword && reservedKeywordsSet.has(token.kind)
}
const reservedKeywordsSet = new Set(reservedKeywords())
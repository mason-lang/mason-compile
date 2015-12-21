import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import {code} from '../CompileError'
import {SpecialVals} from './MsAst'

/**
Lexed element in a tree of Tokens.

Since [[lex]] does grouping, [[parse]] avoids doing much of the work parsers usually do;
it doesn't have to handle a "left parenthesis", only a [[Group]] of kind G_Parenthesis.
This also means that the many different [[MsAst]] types all parse in a similar manner,
keeping the language consistent.

@abstract
*/
// TODO: Would like `export default abstract class Token
// https://github.com/Microsoft/TypeScript/issues/3792
abstract class Token {
	constructor(public loc: Loc) {}
}
export default Token

export abstract class Group<SubType extends Token> extends Token {
	constructor(loc: Loc, public subTokens: Array<SubType>) {
		super(loc)
	}

	abstract showType(): string

	get type(): GroupType {
		return <any> this.constructor
	}
}

export type GroupType = {
	new(loc: Loc, subTokens: Array<{}>): Group<Token>
	prototype: {showType(): string}
}

/**
Lines in an indented block.
Note that `Block`s do not always map to [[Block]] MsAsts.
*/
export class GroupBlock extends Group<GroupLine> {
	showType(): string { return 'indented block' }
}

export type QuoteTokenPart = StringToken | Name | Keyword | GroupInterpolation

/**
Tokens within a quote.
`subTokens` may be plain strings, Names (for `#foo`), or Interpolation groups (for `#(0)`).
*/
export class GroupQuote extends Group<QuoteTokenPart> {
	showType(): string { return 'quote' }
}

/**
Tokens within a RegExp.
`subTokens` are same as for Quote.
*/
export class GroupRegExp extends Group<QuoteTokenPart> {
	flags: string
	showType(): string { return 'regexp' }
}

/**
Tokens surrounded by parentheses.
There may be no closing parenthesis. In:

	a (b
		c

The tokens are a Group<Line>(Name, Group<Parenthesis>(...))
*/
export class GroupParenthesis extends Group<Token> {
	showType(): string { return '()' }
}

/** Like [[GroupParenthesis]], but simpler because there must be a closing `]`. */
export class GroupBracket extends Group<Token> {
	showType(): string { return '[]' }
}

/**
Tokens on a line.
The indented block following the end of the line is considered to be a part of the line!
This means that in this code:
	a
		b
		c
	d
There are 2 lines, one starting with 'a' and one starting with 'd'.
The first line contains 'a' and a `Block` which in turn contains two other lines.
*/
export class GroupLine extends Group<Token> {
	showType(): string { return 'line' }
}

/**
Groups two or more tokens that are *not* separated by spaces.
`a[b].c` is an example.
A single token on its own will not be given a `Space` group.
*/
export class GroupSpace extends Group<Token> {
	showType(): string { return 'space' }
}

/** Interpolated tokens in a Quote or RegExp using `#()`. */
export class GroupInterpolation extends Group<Token> {
	showType(): string { return 'interpolation' }
}

/**
An identifier. Usually the name of some local variable or property.
A Name is guaranteed to not be any keyword.
*/
export class Name extends Token {
	constructor(loc: Loc, public name: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return code(this.name)
	}
}

/**
Documentation comment (beginning with one `|` rather than two).
Non-doc comments are ignored by [[lex]].
These don't affect output, but are passed to various [[MsAst]]s for use by other tools.
*/
export class DocComment extends Token {
	constructor(loc: Loc, public text: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return 'doc comment'
	}
}

/** Number literal. */
export class NumberToken extends Token {
	constructor(loc: Loc, public value: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return this.value
	}
}

/** String part of a GroupQuote or GroupRegExp. */
export class StringToken extends Token {
	constructor(loc: Loc, public value: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return this.value
	}
}

/**
A "keyword" is any set of characters with a particular meaning.
It doensn't necessarily have to be something that might have been a [[Name]].
For example, see [[Keywords.ObjEntry]].

This can even include ones like `. ` (defines an object property, as in `key. value`).
Kind is a ***. See the full list below.
*/
export class Keyword extends Token {
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
	Implements,
	Interface,
	Package,
	Private,
	Protected,
	Public,

	// JavaScript keywords
	Arguments,
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
	Actor,
	Data,
	DelPred,
	DoWhile,
	DoUntil,
	Final,
	Is,
	Meta,
	Out,
	Override,
	Send,
	To,
	Type,
	Until,

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
	With,
	Yield,
	YieldTo
}

export const reservedKeywords: Array<Keywords> = [
	Keywords.Enum, Keywords.Implements, Keywords.Interface, Keywords.Package, Keywords.Private,
	Keywords.Protected, Keywords.Public, Keywords.Arguments, Keywords.Delete, Keywords.Eval,
	Keywords.In, Keywords.InstanceOf, Keywords.Return, Keywords.TypeOf, Keywords.Void,
	Keywords.While, Keywords.Bang, Keywords.LeftAngle, Keywords.LeftArrow, Keywords.RightAngle,
	Keywords.Actor, Keywords.Data, Keywords.DelPred, Keywords.DoWhile, Keywords.DoUntil,
	Keywords.Final, Keywords.Is, Keywords.Meta, Keywords.Out, Keywords.Override, Keywords.Send,
	Keywords.To, Keywords.Type, Keywords.Until
	]

// This includes names used for debug (like Keywords.Ampersand -> '&')
const keywordKindToName = new Map<Keywords, string>([
	// Reserved keywords
	[Keywords.Enum, 'enum'],
	[Keywords.Implements, 'implements'],
	[Keywords.Interface, 'interface'],
	[Keywords.Package, 'package'],
	[Keywords.Private, 'private'],
	[Keywords.Protected, 'protected'],
	[Keywords.Public, 'public'],
	[Keywords.Arguments, 'arguments'],
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
	[Keywords.Actor, 'actor'],
	[Keywords.Data, 'data'],
	[Keywords.DelPred, 'del?'],
	[Keywords.DoWhile, 'do-while'],
	[Keywords.DoUntil, 'do-until'],
	[Keywords.Final, 'final'],
	[Keywords.Is, 'is'],
	[Keywords.Meta, 'meta'],
	[Keywords.Out, 'out'],
	[Keywords.Override, 'override'],
	[Keywords.Send, 'send'],
	[Keywords.To, 'to'],
	[Keywords.Type, 'type'],
	[Keywords.Until, 'until'],
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
	for (const _ of reservedKeywords)
		ks.delete(_)
	return Array.from(ks)
})()

const nameKeywords = new Set(allKeywords)
for (const _ of notNameKeywords)
	nameKeywords.delete(_)

const keywordNameToKind = new Map(Array.from(nameKeywords).map<[string, Keywords]>(_ => [keywordKindToName.get(_), _]))

export function keywordName(kind: Keywords): string {
	return keywordKindToName.get(kind)
}

export function showKeyword(kind: Keywords): string {
	return code(keywordName(kind))
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
const reservedKeywordsSet = new Set(reservedKeywords)

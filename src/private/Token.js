import {code} from '../CompileError'
import {SpecialVals} from './MsAst'

/**
Lexed element in a tree of Tokens.

Since {@link lex} does grouping, {@link parse} avoids doing much of the work parsers usually do;
it doesn't have to handle a "left parenthesis", only a {@link Group} of kind G_Parenthesis.
This also means that the many different {@link MsAst} types all parse in a similar manner,
keeping the language consistent.

Besides {@link Group}, {@link Keyword}, {@link Name}, and {@link DocComment},
{@link NumberLiteral} values are also treated as Tokens.

@abstract
*/
export default class Token {
	constructor(loc) {
		this.loc = loc
	}
}

/**
Contains multiple sub-tokens.
See {@link GroupKind} for explanations.
*/
export class Group extends Token {
	constructor(loc, subTokens, kind) {
		super(loc)
		/**
		Tokens within this group.
		@type {Array<Token>}
		*/
		this.subTokens = subTokens
		/** @type {Groups} */
		this.kind = kind
	}

	toString() {
		return `${groupKindToName.get(this.kind)}`
	}
}

/**
A "keyword" is any set of characters with a particular meaning.
It doensn't necessarily have to be something that might have been a {@link Name}.
For example, see {@link Keywords.ObjEntry}.

This can even include ones like `. ` (defines an object property, as in `key. value`).
Kind is a ***. See the full list below.
*/
export class Keyword extends Token {
	constructor(loc, kind) {
		super(loc)
		/** @type {Keywords} */
		this.kind = kind
	}

	toString() {
		return showKeyword(this.kind)
	}
}

/**
An identifier. Usually the name of some local variable or property.
A Name is guaranteed to not be any keyword.
*/
export class Name extends Token {
	constructor(loc, name) {
		super(loc)
		/** @type {string} */
		this.name = name
	}

	toString() {
		return code(this.name)
	}
}

/**
Documentation comment (beginning with one `|` rather than two).
Non-doc comments are ignored by {@link lex}.
These don't affect output, but are passed to various {@link MsAst}s for use by other tools.
*/
export class DocComment extends Token {
	constructor(loc, text) {
		super(loc)
		/** @type {string} */
		this.text = text
	}

	toString() {
		return 'doc comment'
	}
}

let nextGroupKind = 0
const
	groupKindToName = new Map(),
	g = name => {
		const kind = nextGroupKind
		groupKindToName.set(kind, name)
		nextGroupKind = nextGroupKind + 1
		return kind
	}

/**
Kinds of {@link Group}.
@enum {number}
*/
export const Groups = {
	/**
	Tokens surrounded by parentheses.
	There may be no closing parenthesis. In:

		a (b
			c

	The tokens are a Group<Line>(Name, Group<Parenthesis>(...))
	*/
	Parenthesis: g('()'),
	/** Like `Parenthesis`, but simpler because there must be a closing `]`. */
	Bracket: g('[]'),
	/**
	Lines in an indented block.
	Sub-tokens will always be `Line` groups.
	Note that `Block`s do not always map to Block* MsAsts.
	*/
	Block: g('indented block'),
	/**
	Tokens within a quote.
	`subTokens` may be strings, or G_Parenthesis groups.
	*/
	Quote: g('quote'),
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
	Line: g('line'),
	/**
	Groups two or more tokens that are *not* separated by spaces.
	`a[b].c` is an example.
	A single token on its own will not be given a `Space` group.
	*/
	Space: g('space')
}

/**
Outputtable description of a group kind.
@param {Groups} groupKind
*/
export function showGroupKind(groupKind) {
	return groupKindToName.get(groupKind)
}

let nextKeywordKind = 0
const
	keywordNameToKind = new Map(),
	keywordKindToName = new Map(),
	nameKeywords = new Set()

// These keywords are special names.
// When lexing a name, a map lookup is done by keywordKindFromName.
function kw(name) {
	const kind = kwNotName(name)
	nameKeywords.add(kind)
	keywordNameToKind.set(name, kind)
	return kind
}
// These keywords must be lexed specially.
function kwNotName(debugName) {
	const kind = nextKeywordKind
	keywordKindToName.set(kind, debugName)
	nextKeywordKind = nextKeywordKind + 1
	return kind
}

// Used by info.js
export const reservedKeywords = [
	// JavaScript reserved words
	'enum',
	'implements',
	'interface',
	'package',
	'private',
	'protected',
	'public',

	// JavaScript keywords
	'arguments',
	'async',
	'await',
	'const',
	'delete',
	'eval',
	'in',
	'instanceof',
	'let',
	'return',
	'typeof',
	'var',
	'void',
	'while',

	// Mason reserved words
	'!',
	'<',
	'>',
	'actor',
	'data',
	'del?',
	'do-while',
	'do-until',
	'final',
	'is',
	'meta',
	'out',
	'override',
	'send',
	'to',
	'type',
	'until'
]
for (const name of reservedKeywords)
	kw(name)
const firstNonReservedKeyword = nextKeywordKind

/** Kinds of {@link Keyword}. */
export const Keywords = {
	Abstract: kw('abstract'),
	Ampersand: kwNotName('&'),
	And: kw('and'),
	As: kw('as'),
	Assert: kw('assert'),
	Assign: kw('='),
	LocalMutate: kwNotName(':='),
	Break: kw('break'),
	Built: kw('built'),
	Case: kw('case'),
	Catch: kw('catch'),
	Cond: kw('cond'),
	Class: kw('class'),
	Colon: kwNotName(':'),
	Construct: kw('construct'),
	Debugger: kw('debugger'),
	Del: kw('del'),
	Do: kw('do'),
	Dot: kwNotName('.'),
	Dot2: kwNotName('..'),
	Dot3: kwNotName('... '),
	Else: kw('else'),
	Except: kw('except'),
	False: kw('false'),
	Finally: kw('finally'),
	Focus: kw('_'),
	For: kw('for'),
	ForAsync: kw('$for'),
	ForBag: kw('@for'),
	Forbid: kw('forbid'),
	Fun: kwNotName('|'),
	FunDo: kwNotName('!|'),
	FunThis: kwNotName('.|'),
	FunThisDo: kwNotName('.!|'),
	FunAsync: kwNotName('$|'),
	FunAsyncDo: kwNotName('$!|'),
	FunThisAsync: kwNotName('.$|'),
	FunThisAsyncDo: kwNotName('.$!|'),
	FunGen: kwNotName('*|'),
	FunGenDo: kwNotName('*!|'),
	FunThisGen: kwNotName('.*|'),
	FunThisGenDo: kwNotName('.*!|'),
	Get: kw('get'),
	If: kw('if'),
	Ignore: kw('ignore'),
	Kind: kw('kind'),
	Lazy: kwNotName('~'),
	MapEntry: kw('->'),
	Method: kw('method'),
	My: kw('my'),
	Name: kw('name'),
	New: kw('new'),
	Not: kw('not'),
	Null: kw('null'),
	ObjAssign: kwNotName('. '),
	Of: kw('of'),
	Or: kw('or'),
	Pass: kw('pass'),
	Pipe: kw('pipe'),
	Region: kw('region'),
	Set: kw('set'),
	Super: kw('super'),
	Static: kw('static'),
	Switch: kw('switch'),
	Tick: kwNotName('\''),
	Throw: kw('throw'),
	Todo: kw('todo'),
	True: kw('true'),
	Try: kw('try'),
	Undefined: kw('undefined'),
	Unless: kw('unless'),
	Import: kw('import'),
	ImportDo: kw('import!'),
	ImportLazy: kw('import~'),
	With: kw('with'),
	Yield: kw('<-'),
	YieldTo: kw('<-*')
}

/**
Name of a keyword.
@param {Keywords} kind
@return {string}
*/
export function keywordName(kind) {
	return keywordKindToName.get(kind)
}

export function showKeyword(kind) {
	return code(keywordName(kind))
}

/**
See if the name is a keyword and if so return its kind.
@return {?Keywords}
*/
export function opKeywordKindFromName(name) {
	const kind = keywordNameToKind.get(name)
	return kind === undefined ? null : kind
}

export function opKeywordKindToSpecialValueKind(kind) {
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

/**
Whether `token` is a Group of the given kind.
@param {Groups} groupKind
@param {Token} token
*/
export function isGroup(groupKind, token) {
	return token instanceof Group && token.kind === groupKind
}

/**
Whether `token` is a Keyword of the given kind.
@param {Keywords} keywordKind
@param {Token} token
*/
export function isKeyword(keywordKind, token) {
	return token instanceof Keyword && token.kind === keywordKind
}

/**
Whether `token` is a Keyword of any of the given kinds.
@param {Set} keywordKinds
@param {Token} token
*/
export function isAnyKeyword(keywordKinds, token) {
	return token instanceof Keyword && keywordKinds.has(token.kind)
}

/** Whether `token` is a Keyword whose value can be used as a property name. */
export function isNameKeyword(token) {
	return isAnyKeyword(nameKeywords, token)
}

/** Whether `token` is a reserved word. */
export function isReservedKeyword(token) {
	return token instanceof Keyword && token.kind < firstNonReservedKeyword
}

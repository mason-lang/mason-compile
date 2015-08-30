import { code } from '../CompileError'
import { NumberLiteral } from './MsAst'
import { SV_False, SV_Null, SV_Super, SV_ThisModuleDirectory, SV_True, SV_Undefined
	} from './MsAst'
import { implementMany } from './util'

/*
Token tree, output of `lex/group`.
That's right: in Mason, the tokens form a tree containing both plain tokens and Group tokens.
This means that the parser avoids doing much of the work that parsers normally have to do;
it doesn't have to handle a "left parenthesis", only a Group(tokens, G_Parenthesis).
*/

// `.name`, `..name`, etc.
// Currently nDots > 1 is only used by `use` blocks.
export class DotName {
	constructor(loc, nDots /* Number */, name /* String */) {
		this.loc = loc
		this.nDots = nDots
		this.name = name
	}
}

// kind is a G_***.
export class Group {
	constructor(loc, subTokens /* Array[Token] */, kind /* Number */) {
		this.loc = loc
		this.subTokens = subTokens
		this.kind = kind
	}
}

/*
A key"word" is any set of characters with a particular meaning.
This can even include ones like `. ` (defines an object property, as in `key. value`).
Kind is a KW_***. See the full list below.
*/
export class Keyword {
	constructor(loc, kind /* Number */) {
		this.loc = loc
		this.kind = kind
	}
}

// A name is guaranteed to *not* be a keyword.
// It's also not a DotName.
export class Name {
	constructor(loc, name /* String */) {
		this.loc = loc
		this.name = name
	}
}

// NumberLiteral is also both a token and an MsAst.

implementMany({ DotName, Group, Keyword, Name, NumberLiteral }, 'toString', {
	DotName() { return `${'.'.repeat(this.nDots)}${this.name}` },
	Group() { return `${groupKindToName.get(this.kind)}` },
	Keyword() { return code(keywordKindToName.get(this.kind)) },
	Name() { return this.name },
	NumberLiteral() { return this.value.toString() }
})

let nextGroupKind = 0
const
	groupKindToName = new Map(),
	g = name => {
		const kind = nextGroupKind
		groupKindToName.set(kind, name)
		nextGroupKind = nextGroupKind + 1
		return kind
	}
export const
	G_Parenthesis = g('( )'),
	G_Bracket = g('[ ]'),
	// Lines in an indented block.
	// Sub-tokens will always be G_Line groups.
	// Note that G_Blocks do not always map to Block* MsAsts.
	G_Block = g('indented block'),
	// Within a quote.
	// Sub-tokens may be strings, or G_Parenthesis groups.
	G_Quote = g('quote'),
	/*
	Tokens on a line.
	NOTE: The indented block following the end of the line is considered to be a part of the line!
	This means that in this code:
		a
			b
			c
		d
	There are 2 lines, one starting with 'a' and one starting with 'd'.
	The first line contains 'a' and a G_Block which in turn contains two other lines.
	*/
	G_Line = g('line'),
	/*
	Groups two or more tokens that are *not* separated by spaces.
	`a[b].c` is an example.
	A single token on its own will not be given a G_Space.
	*/
	G_Space = g('spaced group'),
	showGroupKind = groupKind => groupKindToName.get(groupKind)


let nextKeywordKind = 0
const
	keywordNameToKind = new Map(),
	keywordKindToName = new Map(),
	// These keywords are special names.
	// When lexing a name, a map lookup is done by keywordKindFromName.
	kw = name => {
		const kind = kwNotName(name)
		keywordNameToKind.set(name, kind)
		return kind
	},
	// These keywords must be lexed specially.
	kwNotName = debugName => {
		const kind = nextKeywordKind
		keywordKindToName.set(kind, debugName)
		nextKeywordKind = nextKeywordKind + 1
		return kind
	}

const reserved_words = [
	// Current reserved words
	'await',
	'enum',
	'implements',
	'interface',
	'package',
	'private',
	'protected',
	'public',

	// JavaScript keywords
	'arguments',
	'const',
	'delete',
	'eval',
	'instanceof',
	'let',
	'return',
	'typeof',
	'var',
	'void',
	'while',

	// Keywords Mason might use
	'abstract',
	'data',
	'final',
	'gen',
	'gen!',
	'goto!',
	'is',
	'isa',
	'of',
	'of!',
	'to',
	'until',
	'until!',
	'while!'
]

for (const name of reserved_words)
	keywordNameToKind.set(name, -1)

export const
	KW_And = kw('and'),
	KW_As = kw('as'),
	KW_Assert = kw('assert!'),
	KW_AssertNot = kw('forbid!'),
	KW_Assign = kw('='),
	KW_AssignMutable = kw('::='),
	KW_LocalMutate = kw(':='),
	KW_Break = kw('break!'),
	KW_BreakWithVal = kw('break'),
	KW_Built = kw('built'),
	KW_CaseDo = kw('case!'),
	KW_CaseVal = kw('case'),
	KW_CatchDo = kw('catch!'),
	KW_CatchVal = kw('catch'),
	KW_Class = kw('class'),
	KW_Construct = kw('construct!'),
	KW_Debug = kw('debug'),
	KW_Debugger = kw('debugger!'),
	KW_Do = kw('do!'),
	// Three dots followed by a space, as in `... things-added-to-@`.
	KW_Ellipsis = kw('... '),
	KW_Else = kw('else'),
	KW_ExceptDo = kw('except!'),
	KW_ExceptVal = kw('except'),
	KW_False = kw('false'),
	KW_Finally = kw('finally!'),
	KW_Focus = kw('_'),
	KW_ForBag = kw('@for'),
	KW_ForDo = kw('for!'),
	KW_ForVal = kw('for'),
	KW_Fun = kwNotName('|'),
	KW_FunDo = kwNotName('!|'),
	KW_FunGen = kwNotName('~|'),
	KW_FunGenDo = kwNotName('~!|'),
	KW_FunThis = kwNotName('.|'),
	KW_FunThisDo = kwNotName('.!|'),
	KW_FunThisGen = kwNotName('.~|'),
	KW_FunThisGenDo = kwNotName('.~!|'),
	KW_Get = kw('get'),
	KW_IfVal = kw('if'),
	KW_IfDo = kw('if!'),
	KW_In = kw('in'),
	KW_Lazy = kwNotName('~'),
	KW_MapEntry = kw('->'),
	KW_New = kw('new'),
	KW_Not = kw('not'),
	KW_Null = kw('null'),
	KW_ObjAssign = kw('. '),
	KW_Or = kw('or'),
	KW_Out = kw('out'),
	KW_Pass = kw('pass'),
	KW_Region = kw('region'),
	KW_Set = kw('set!'),
	KW_Super = kw('super'),
	KW_Static = kw('static'),
	KW_SwitchDo = kw('switch!'),
	KW_SwitchVal = kw('switch'),
	KW_ThisModuleDirectory = kw('this-module-directory'),
	KW_Throw = kw('throw!'),
	KW_True = kw('true'),
	KW_TryDo = kw('try!'),
	KW_TryVal = kw('try'),
	KW_Type = kwNotName(':'),
	KW_Undefined = kw('undefined'),
	KW_UnlessVal = kw('unless'),
	KW_UnlessDo = kw('unless!'),
	KW_Use = kw('use'),
	KW_UseDebug = kw('use-debug'),
	KW_UseDo = kw('use!'),
	KW_UseLazy = kw('use~'),
	KW_With = kw('with'),
	KW_Yield = kw('<~'),
	KW_YieldTo = kw('<~~'),

	keywordName = kind =>
		keywordKindToName.get(kind),
	// Returns -1 for reserved keyword or undefined for not-a-keyword.
	opKeywordKindFromName = name =>
		keywordNameToKind.get(name),
	opKeywordKindToSpecialValueKind = kw => {
		switch (kw) {
			case KW_False: return SV_False
			case KW_Null: return SV_Null
			case KW_Super: return SV_Super
			case KW_ThisModuleDirectory: return SV_ThisModuleDirectory
			case KW_True: return SV_True
			case KW_Undefined: return SV_Undefined
			default: return null
		}
	},
	isGroup = (groupKind, token) =>
		token instanceof Group && token.kind === groupKind,
	isKeyword = (keywordKind, token) =>
		token instanceof Keyword && token.kind === keywordKind

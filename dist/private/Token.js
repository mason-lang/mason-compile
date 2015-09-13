if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../CompileError', './MsAst'], function (exports, _CompileError, _MsAst) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	/*
 Token tree, output of `lex/group`.
 That's right: in Mason, the tokens form a tree containing both plain tokens and Group tokens.
 This means that the parser avoids doing much of the work that parsers normally have to do;
 it doesn't have to handle a "left parenthesis", only a Group(tokens, G_Parenthesis).
 */

	// `.name`, `..name`, etc.
	// Currently nDots > 1 is only used by `use` blocks.

	class DotName {
		constructor(loc, nDots, /* Number */name /* String */) {
			this.loc = loc;
			this.nDots = nDots;
			this.name = name;
		}

		toString() {
			return `${ '.'.repeat(this.nDots) }${ this.name }`;
		}
	}

	// kind is a G_***.
	exports.DotName = DotName;

	class Group {
		constructor(loc, subTokens, /* Array[Token] */kind /* Number */) {
			this.loc = loc;
			this.subTokens = subTokens;
			this.kind = kind;
		}

		toString() {
			return `${ groupKindToName.get(this.kind) }`;
		}
	}

	/*
 A key"word" is any set of characters with a particular meaning.
 This can even include ones like `. ` (defines an object property, as in `key. value`).
 Kind is a KW_***. See the full list below.
 */
	exports.Group = Group;

	class Keyword {
		constructor(loc, kind /* Number */) {
			this.loc = loc;
			this.kind = kind;
		}

		toString() {
			return (0, _CompileError.code)(keywordKindToName.get(this.kind));
		}
	}

	// A name is guaranteed to *not* be a keyword.
	// It's also not a DotName.
	exports.Keyword = Keyword;

	class Name {
		constructor(loc, name /* String */) {
			this.loc = loc;
			this.name = name;
		}

		toString() {
			return this.name;
		}
	}

	exports.Name = Name;

	class DocComment {
		constructor(loc, text /* String */) {
			this.loc = loc;
			this.text = text;
		}

		toString() {
			return 'doc comment';
		}
	}

	exports.DocComment = DocComment;

	let nextGroupKind = 0;
	const groupKindToName = new Map(),
	      g = name => {
		const kind = nextGroupKind;
		groupKindToName.set(kind, name);
		nextGroupKind = nextGroupKind + 1;
		return kind;
	};

	const G_Parenthesis = g('( )'),
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
	      showGroupKind = groupKind => groupKindToName.get(groupKind);

	exports.G_Parenthesis = G_Parenthesis;
	exports.G_Bracket = G_Bracket;
	exports.G_Block = G_Block;
	exports.G_Quote = G_Quote;
	exports.G_Line = G_Line;
	exports.G_Space = G_Space;
	exports.showGroupKind = showGroupKind;
	let nextKeywordKind = 0;
	const keywordNameToKind = new Map(),
	      keywordKindToName = new Map(),
	     
	// These keywords are special names.
	// When lexing a name, a map lookup is done by keywordKindFromName.
	kw = name => {
		const kind = kwNotName(name);
		keywordNameToKind.set(name, kind);
		return kind;
	},
	     
	// These keywords must be lexed specially.
	kwNotName = debugName => {
		const kind = nextKeywordKind;
		keywordKindToName.set(kind, debugName);
		nextKeywordKind = nextKeywordKind + 1;
		return kind;
	};

	const reserved_words = [
	// JavaScript reserved words
	'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public',

	// JavaScript keywords
	'arguments', 'await', 'const', 'delete', 'eval', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while',

	// mason reserved words
	'abstract', 'await!', 'del', 'del?', 'del!', 'final', 'gen', 'gen!', 'goto!', 'is', 'isa', 'of', 'of!', 'to', 'until', 'until!', 'while!'];

	for (const name of reserved_words) keywordNameToKind.set(name, -1);

	const KW_And = kw('and'),
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
	      KW_Cond = kw('cond'),
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
	      KW_Ignore = kw('ignore'),
	      KW_In = kw('in'),
	      KW_Lazy = kwNotName('~'),
	      KW_MapEntry = kw('->'),
	      KW_Name = kw('name'),
	      KW_New = kw('new'),
	      KW_Not = kw('not'),
	      KW_Null = kw('null'),
	      KW_ObjAssign = kw('. '),
	      KW_Or = kw('or'),
	      KW_Out = kw('out'),
	      KW_Pass = kw('pass'),
	      KW_Region = kw('region'),
	      KW_Set = kw('set!'),
	      KW_SuperDo = kw('super!'),
	      KW_SuperVal = kw('super'),
	      KW_Static = kw('static'),
	      KW_SwitchDo = kw('switch!'),
	      KW_SwitchVal = kw('switch'),
	      KW_Throw = kw('throw!'),
	      KW_Todo = kw('todo'),
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
	      keywordName = kind => keywordKindToName.get(kind),
	     
	// Returns -1 for reserved keyword or undefined for not-a-keyword.
	opKeywordKindFromName = name => keywordNameToKind.get(name),
	      opKeywordKindToSpecialValueKind = kw => {
		switch (kw) {
			case KW_False:
				return _MsAst.SV_False;
			case KW_Name:
				return _MsAst.SV_Name;
			case KW_Null:
				return _MsAst.SV_Null;
			case KW_True:
				return _MsAst.SV_True;
			case KW_Undefined:
				return _MsAst.SV_Undefined;
			default:
				return null;
		}
	},
	      isGroup = (groupKind, token) => token instanceof Group && token.kind === groupKind,
	      isKeyword = (keywordKind, token) => token instanceof Keyword && token.kind === keywordKind;
	exports.KW_And = KW_And;
	exports.KW_As = KW_As;
	exports.KW_Assert = KW_Assert;
	exports.KW_AssertNot = KW_AssertNot;
	exports.KW_Assign = KW_Assign;
	exports.KW_AssignMutable = KW_AssignMutable;
	exports.KW_LocalMutate = KW_LocalMutate;
	exports.KW_Break = KW_Break;
	exports.KW_BreakWithVal = KW_BreakWithVal;
	exports.KW_Built = KW_Built;
	exports.KW_CaseDo = KW_CaseDo;
	exports.KW_CaseVal = KW_CaseVal;
	exports.KW_CatchDo = KW_CatchDo;
	exports.KW_CatchVal = KW_CatchVal;
	exports.KW_Cond = KW_Cond;
	exports.KW_Class = KW_Class;
	exports.KW_Construct = KW_Construct;
	exports.KW_Debug = KW_Debug;
	exports.KW_Debugger = KW_Debugger;
	exports.KW_Do = KW_Do;
	exports.KW_Ellipsis = KW_Ellipsis;
	exports.KW_Else = KW_Else;
	exports.KW_ExceptDo = KW_ExceptDo;
	exports.KW_ExceptVal = KW_ExceptVal;
	exports.KW_False = KW_False;
	exports.KW_Finally = KW_Finally;
	exports.KW_Focus = KW_Focus;
	exports.KW_ForBag = KW_ForBag;
	exports.KW_ForDo = KW_ForDo;
	exports.KW_ForVal = KW_ForVal;
	exports.KW_Fun = KW_Fun;
	exports.KW_FunDo = KW_FunDo;
	exports.KW_FunGen = KW_FunGen;
	exports.KW_FunGenDo = KW_FunGenDo;
	exports.KW_FunThis = KW_FunThis;
	exports.KW_FunThisDo = KW_FunThisDo;
	exports.KW_FunThisGen = KW_FunThisGen;
	exports.KW_FunThisGenDo = KW_FunThisGenDo;
	exports.KW_Get = KW_Get;
	exports.KW_IfVal = KW_IfVal;
	exports.KW_IfDo = KW_IfDo;
	exports.KW_Ignore = KW_Ignore;
	exports.KW_In = KW_In;
	exports.KW_Lazy = KW_Lazy;
	exports.KW_MapEntry = KW_MapEntry;
	exports.KW_Name = KW_Name;
	exports.KW_New = KW_New;
	exports.KW_Not = KW_Not;
	exports.KW_Null = KW_Null;
	exports.KW_ObjAssign = KW_ObjAssign;
	exports.KW_Or = KW_Or;
	exports.KW_Out = KW_Out;
	exports.KW_Pass = KW_Pass;
	exports.KW_Region = KW_Region;
	exports.KW_Set = KW_Set;
	exports.KW_SuperDo = KW_SuperDo;
	exports.KW_SuperVal = KW_SuperVal;
	exports.KW_Static = KW_Static;
	exports.KW_SwitchDo = KW_SwitchDo;
	exports.KW_SwitchVal = KW_SwitchVal;
	exports.KW_Throw = KW_Throw;
	exports.KW_Todo = KW_Todo;
	exports.KW_True = KW_True;
	exports.KW_TryDo = KW_TryDo;
	exports.KW_TryVal = KW_TryVal;
	exports.KW_Type = KW_Type;
	exports.KW_Undefined = KW_Undefined;
	exports.KW_UnlessVal = KW_UnlessVal;
	exports.KW_UnlessDo = KW_UnlessDo;
	exports.KW_Use = KW_Use;
	exports.KW_UseDebug = KW_UseDebug;
	exports.KW_UseDo = KW_UseDo;
	exports.KW_UseLazy = KW_UseLazy;
	exports.KW_With = KW_With;
	exports.KW_Yield = KW_Yield;
	exports.KW_YieldTo = KW_YieldTo;
	exports.keywordName = keywordName;
	exports.opKeywordKindFromName = opKeywordKindFromName;
	exports.opKeywordKindToSpecialValueKind = opKeywordKindToSpecialValueKind;
	exports.isGroup = isGroup;
	exports.isKeyword = isKeyword;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRva2VuLmpzIiwicHJpdmF0ZS9Ub2tlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNZTyxPQUFNLE9BQU8sQ0FBQztBQUNwQixhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssY0FBZSxJQUFJLGVBQWU7QUFDdkQsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLENBQUMsR0FBRSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxHQUFFLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFBO0dBQUU7RUFDN0Q7Ozs7O0FBR00sT0FBTSxLQUFLLENBQUM7QUFDbEIsYUFBVyxDQUFDLEdBQUcsRUFBRSxTQUFTLG9CQUFxQixJQUFJLGVBQWU7QUFDakUsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLENBQUMsR0FBRSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUE7R0FBRTtFQUN6RDs7Ozs7Ozs7O0FBT00sT0FBTSxPQUFPLENBQUM7QUFDcEIsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLGtCQTVDWixJQUFJLEVBNENhLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJ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O09BQ3BCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3RCLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2xCLFNBQVMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3RCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ3JCLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3ZCLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzFCLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzNCLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQzlCLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzVCLFlBQVksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQy9CLGFBQWEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQ2hDLGVBQWUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO09BQ25DLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ25CLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2hCLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3hCLFdBQVcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ3RCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFlBQVksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ3ZCLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2hCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3pCLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3pCLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ3JCLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3hCLFlBQVksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzlCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFVBQVUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3ZCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ25CLFVBQVUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BRXRCLFdBQVcsR0FBRyxJQUFJLElBQ2pCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7OztBQUU1QixzQkFBcUIsR0FBRyxJQUFJLElBQzNCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7T0FDNUIsK0JBQStCLEdBQUcsRUFBRSxJQUFJO0FBQ3ZDLFVBQVEsRUFBRTtBQUNULFFBQUssUUFBUTtBQUFFLGtCQW5RVCxRQUFRLENBbVFnQjtBQUFBLEFBQzlCLFFBQUssT0FBTztBQUFFLGtCQXBRRSxPQUFPLENBb1FLO0FBQUEsQUFDNUIsUUFBSyxPQUFPO0FBQUUsa0JBclFXLE9BQU8sQ0FxUUo7QUFBQSxBQUM1QixRQUFLLE9BQU87QUFBRSxrQkF0UW9CLE9BQU8sQ0FzUWI7QUFBQSxBQUM1QixRQUFLLFlBQVk7QUFBRSxrQkF2UXdCLFlBQVksQ0F1UWpCO0FBQUEsQUFDdEM7QUFBUyxXQUFPLElBQUksQ0FBQTtBQUFBLEdBQ3BCO0VBQ0Q7T0FDRCxPQUFPLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxLQUMxQixLQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUztPQUNuRCxTQUFTLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUM5QixLQUFLLFlBQVksT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBIiwiZmlsZSI6InByaXZhdGUvVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7IGNvZGUgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgeyBTVl9GYWxzZSwgU1ZfTmFtZSwgU1ZfTnVsbCwgU1ZfVHJ1ZSwgU1ZfVW5kZWZpbmVkIH0gZnJvbSAnLi9Nc0FzdCdcblxuLypcblRva2VuIHRyZWUsIG91dHB1dCBvZiBgbGV4L2dyb3VwYC5cblRoYXQncyByaWdodDogaW4gTWFzb24sIHRoZSB0b2tlbnMgZm9ybSBhIHRyZWUgY29udGFpbmluZyBib3RoIHBsYWluIHRva2VucyBhbmQgR3JvdXAgdG9rZW5zLlxuVGhpcyBtZWFucyB0aGF0IHRoZSBwYXJzZXIgYXZvaWRzIGRvaW5nIG11Y2ggb2YgdGhlIHdvcmsgdGhhdCBwYXJzZXJzIG5vcm1hbGx5IGhhdmUgdG8gZG87XG5pdCBkb2Vzbid0IGhhdmUgdG8gaGFuZGxlIGEgXCJsZWZ0IHBhcmVudGhlc2lzXCIsIG9ubHkgYSBHcm91cCh0b2tlbnMsIEdfUGFyZW50aGVzaXMpLlxuKi9cblxuLy8gYC5uYW1lYCwgYC4ubmFtZWAsIGV0Yy5cbi8vIEN1cnJlbnRseSBuRG90cyA+IDEgaXMgb25seSB1c2VkIGJ5IGB1c2VgIGJsb2Nrcy5cbmV4cG9ydCBjbGFzcyBEb3ROYW1lIHtcblx0Y29uc3RydWN0b3IobG9jLCBuRG90cyAvKiBOdW1iZXIgKi8sIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHR0aGlzLm5Eb3RzID0gbkRvdHNcblx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdH1cblxuXHR0b1N0cmluZygpIHsgcmV0dXJuIGAkeycuJy5yZXBlYXQodGhpcy5uRG90cyl9JHt0aGlzLm5hbWV9YCB9XG59XG5cbi8vIGtpbmQgaXMgYSBHXyoqKi5cbmV4cG9ydCBjbGFzcyBHcm91cCB7XG5cdGNvbnN0cnVjdG9yKGxvYywgc3ViVG9rZW5zIC8qIEFycmF5W1Rva2VuXSAqLywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMuc3ViVG9rZW5zID0gc3ViVG9rZW5zXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7IHJldHVybiBgJHtncm91cEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCl9YCB9XG59XG5cbi8qXG5BIGtleVwid29yZFwiIGlzIGFueSBzZXQgb2YgY2hhcmFjdGVycyB3aXRoIGEgcGFydGljdWxhciBtZWFuaW5nLlxuVGhpcyBjYW4gZXZlbiBpbmNsdWRlIG9uZXMgbGlrZSBgLiBgIChkZWZpbmVzIGFuIG9iamVjdCBwcm9wZXJ0eSwgYXMgaW4gYGtleS4gdmFsdWVgKS5cbktpbmQgaXMgYSBLV18qKiouIFNlZSB0aGUgZnVsbCBsaXN0IGJlbG93LlxuKi9cbmV4cG9ydCBjbGFzcyBLZXl3b3JkIHtcblx0Y29uc3RydWN0b3IobG9jLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7IHJldHVybiBjb2RlKGtleXdvcmRLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpKSB9XG59XG5cbi8vIEEgbmFtZSBpcyBndWFyYW50ZWVkIHRvICpub3QqIGJlIGEga2V5d29yZC5cbi8vIEl0J3MgYWxzbyBub3QgYSBEb3ROYW1lLlxuZXhwb3J0IGNsYXNzIE5hbWUge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdH1cblxuXHR0b1N0cmluZygpIHsgcmV0dXJuIHRoaXMubmFtZSB9XG59XG5cbmV4cG9ydCBjbGFzcyBEb2NDb21tZW50IHtcblx0Y29uc3RydWN0b3IobG9jLCB0ZXh0IC8qIFN0cmluZyAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy50ZXh0ID0gdGV4dFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7IHJldHVybiAnZG9jIGNvbW1lbnQnIH1cbn1cblxubGV0IG5leHRHcm91cEtpbmQgPSAwXG5jb25zdFxuXHRncm91cEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdGcgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEdyb3VwS2luZFxuXHRcdGdyb3VwS2luZFRvTmFtZS5zZXQoa2luZCwgbmFtZSlcblx0XHRuZXh0R3JvdXBLaW5kID0gbmV4dEdyb3VwS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9XG5cbmV4cG9ydCBjb25zdFxuXHRHX1BhcmVudGhlc2lzID0gZygnKCApJyksXG5cdEdfQnJhY2tldCA9IGcoJ1sgXScpLFxuXHQvLyBMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0Ly8gU3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBHX0xpbmUgZ3JvdXBzLlxuXHQvLyBOb3RlIHRoYXQgR19CbG9ja3MgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0R19CbG9jayA9IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8vIFdpdGhpbiBhIHF1b3RlLlxuXHQvLyBTdWItdG9rZW5zIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0R19RdW90ZSA9IGcoJ3F1b3RlJyksXG5cdC8qXG5cdFRva2VucyBvbiBhIGxpbmUuXG5cdE5PVEU6IFRoZSBpbmRlbnRlZCBibG9jayBmb2xsb3dpbmcgdGhlIGVuZCBvZiB0aGUgbGluZSBpcyBjb25zaWRlcmVkIHRvIGJlIGEgcGFydCBvZiB0aGUgbGluZSFcblx0VGhpcyBtZWFucyB0aGF0IGluIHRoaXMgY29kZTpcblx0XHRhXG5cdFx0XHRiXG5cdFx0XHRjXG5cdFx0ZFxuXHRUaGVyZSBhcmUgMiBsaW5lcywgb25lIHN0YXJ0aW5nIHdpdGggJ2EnIGFuZCBvbmUgc3RhcnRpbmcgd2l0aCAnZCcuXG5cdFRoZSBmaXJzdCBsaW5lIGNvbnRhaW5zICdhJyBhbmQgYSBHX0Jsb2NrIHdoaWNoIGluIHR1cm4gY29udGFpbnMgdHdvIG90aGVyIGxpbmVzLlxuXHQqL1xuXHRHX0xpbmUgPSBnKCdsaW5lJyksXG5cdC8qXG5cdEdyb3VwcyB0d28gb3IgbW9yZSB0b2tlbnMgdGhhdCBhcmUgKm5vdCogc2VwYXJhdGVkIGJ5IHNwYWNlcy5cblx0YGFbYl0uY2AgaXMgYW4gZXhhbXBsZS5cblx0QSBzaW5nbGUgdG9rZW4gb24gaXRzIG93biB3aWxsIG5vdCBiZSBnaXZlbiBhIEdfU3BhY2UuXG5cdCovXG5cdEdfU3BhY2UgPSBnKCdzcGFjZWQgZ3JvdXAnKSxcblx0c2hvd0dyb3VwS2luZCA9IGdyb3VwS2luZCA9PiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcblxuXG5sZXQgbmV4dEtleXdvcmRLaW5kID0gMFxuY29uc3Rcblx0a2V5d29yZE5hbWVUb0tpbmQgPSBuZXcgTWFwKCksXG5cdGtleXdvcmRLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cblx0Ly8gV2hlbiBsZXhpbmcgYSBuYW1lLCBhIG1hcCBsb29rdXAgaXMgZG9uZSBieSBrZXl3b3JkS2luZEZyb21OYW1lLlxuXHRrdyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBrd05vdE5hbWUobmFtZSlcblx0XHRrZXl3b3JkTmFtZVRvS2luZC5zZXQobmFtZSwga2luZClcblx0XHRyZXR1cm4ga2luZFxuXHR9LFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBtdXN0IGJlIGxleGVkIHNwZWNpYWxseS5cblx0a3dOb3ROYW1lID0gZGVidWdOYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEtleXdvcmRLaW5kXG5cdFx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0XHRuZXh0S2V5d29yZEtpbmQgPSBuZXh0S2V5d29yZEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fVxuXG5jb25zdCByZXNlcnZlZF93b3JkcyA9IFtcblx0Ly8gSmF2YVNjcmlwdCByZXNlcnZlZCB3b3Jkc1xuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2F3YWl0Jyxcblx0J2NvbnN0Jyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luc3RhbmNlb2YnLFxuXHQnbGV0Jyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIG1hc29uIHJlc2VydmVkIHdvcmRzXG5cdCdhYnN0cmFjdCcsXG5cdCdhd2FpdCEnLFxuXHQnZGVsJyxcblx0J2RlbD8nLFxuXHQnZGVsIScsXG5cdCdmaW5hbCcsXG5cdCdnZW4nLFxuXHQnZ2VuIScsXG5cdCdnb3RvIScsXG5cdCdpcycsXG5cdCdpc2EnLFxuXHQnb2YnLFxuXHQnb2YhJyxcblx0J3RvJyxcblx0J3VudGlsJyxcblx0J3VudGlsIScsXG5cdCd3aGlsZSEnXG5dXG5cbmZvciAoY29uc3QgbmFtZSBvZiByZXNlcnZlZF93b3Jkcylcblx0a2V5d29yZE5hbWVUb0tpbmQuc2V0KG5hbWUsIC0xKVxuXG5leHBvcnQgY29uc3Rcblx0S1dfQW5kID0ga3coJ2FuZCcpLFxuXHRLV19BcyA9IGt3KCdhcycpLFxuXHRLV19Bc3NlcnQgPSBrdygnYXNzZXJ0IScpLFxuXHRLV19Bc3NlcnROb3QgPSBrdygnZm9yYmlkIScpLFxuXHRLV19Bc3NpZ24gPSBrdygnPScpLFxuXHRLV19Bc3NpZ25NdXRhYmxlID0ga3coJzo6PScpLFxuXHRLV19Mb2NhbE11dGF0ZSA9IGt3KCc6PScpLFxuXHRLV19CcmVhayA9IGt3KCdicmVhayEnKSxcblx0S1dfQnJlYWtXaXRoVmFsID0ga3coJ2JyZWFrJyksXG5cdEtXX0J1aWx0ID0ga3coJ2J1aWx0JyksXG5cdEtXX0Nhc2VEbyA9IGt3KCdjYXNlIScpLFxuXHRLV19DYXNlVmFsID0ga3coJ2Nhc2UnKSxcblx0S1dfQ2F0Y2hEbyA9IGt3KCdjYXRjaCEnKSxcblx0S1dfQ2F0Y2hWYWwgPSBrdygnY2F0Y2gnKSxcblx0S1dfQ29uZCA9IGt3KCdjb25kJyksXG5cdEtXX0NsYXNzID0ga3coJ2NsYXNzJyksXG5cdEtXX0NvbnN0cnVjdCA9IGt3KCdjb25zdHJ1Y3QhJyksXG5cdEtXX0RlYnVnID0ga3coJ2RlYnVnJyksXG5cdEtXX0RlYnVnZ2VyID0ga3coJ2RlYnVnZ2VyIScpLFxuXHRLV19EbyA9IGt3KCdkbyEnKSxcblx0Ly8gVGhyZWUgZG90cyBmb2xsb3dlZCBieSBhIHNwYWNlLCBhcyBpbiBgLi4uIHRoaW5ncy1hZGRlZC10by1AYC5cblx0S1dfRWxsaXBzaXMgPSBrdygnLi4uICcpLFxuXHRLV19FbHNlID0ga3coJ2Vsc2UnKSxcblx0S1dfRXhjZXB0RG8gPSBrdygnZXhjZXB0IScpLFxuXHRLV19FeGNlcHRWYWwgPSBrdygnZXhjZXB0JyksXG5cdEtXX0ZhbHNlID0ga3coJ2ZhbHNlJyksXG5cdEtXX0ZpbmFsbHkgPSBrdygnZmluYWxseSEnKSxcblx0S1dfRm9jdXMgPSBrdygnXycpLFxuXHRLV19Gb3JCYWcgPSBrdygnQGZvcicpLFxuXHRLV19Gb3JEbyA9IGt3KCdmb3IhJyksXG5cdEtXX0ZvclZhbCA9IGt3KCdmb3InKSxcblx0S1dfRnVuID0ga3dOb3ROYW1lKCd8JyksXG5cdEtXX0Z1bkRvID0ga3dOb3ROYW1lKCchfCcpLFxuXHRLV19GdW5HZW4gPSBrd05vdE5hbWUoJ358JyksXG5cdEtXX0Z1bkdlbkRvID0ga3dOb3ROYW1lKCd+IXwnKSxcblx0S1dfRnVuVGhpcyA9IGt3Tm90TmFtZSgnLnwnKSxcblx0S1dfRnVuVGhpc0RvID0ga3dOb3ROYW1lKCcuIXwnKSxcblx0S1dfRnVuVGhpc0dlbiA9IGt3Tm90TmFtZSgnLn58JyksXG5cdEtXX0Z1blRoaXNHZW5EbyA9IGt3Tm90TmFtZSgnLn4hfCcpLFxuXHRLV19HZXQgPSBrdygnZ2V0JyksXG5cdEtXX0lmVmFsID0ga3coJ2lmJyksXG5cdEtXX0lmRG8gPSBrdygnaWYhJyksXG5cdEtXX0lnbm9yZSA9IGt3KCdpZ25vcmUnKSxcblx0S1dfSW4gPSBrdygnaW4nKSxcblx0S1dfTGF6eSA9IGt3Tm90TmFtZSgnficpLFxuXHRLV19NYXBFbnRyeSA9IGt3KCctPicpLFxuXHRLV19OYW1lID0ga3coJ25hbWUnKSxcblx0S1dfTmV3ID0ga3coJ25ldycpLFxuXHRLV19Ob3QgPSBrdygnbm90JyksXG5cdEtXX051bGwgPSBrdygnbnVsbCcpLFxuXHRLV19PYmpBc3NpZ24gPSBrdygnLiAnKSxcblx0S1dfT3IgPSBrdygnb3InKSxcblx0S1dfT3V0ID0ga3coJ291dCcpLFxuXHRLV19QYXNzID0ga3coJ3Bhc3MnKSxcblx0S1dfUmVnaW9uID0ga3coJ3JlZ2lvbicpLFxuXHRLV19TZXQgPSBrdygnc2V0IScpLFxuXHRLV19TdXBlckRvID0ga3coJ3N1cGVyIScpLFxuXHRLV19TdXBlclZhbCA9IGt3KCdzdXBlcicpLFxuXHRLV19TdGF0aWMgPSBrdygnc3RhdGljJyksXG5cdEtXX1N3aXRjaERvID0ga3coJ3N3aXRjaCEnKSxcblx0S1dfU3dpdGNoVmFsID0ga3coJ3N3aXRjaCcpLFxuXHRLV19UaHJvdyA9IGt3KCd0aHJvdyEnKSxcblx0S1dfVG9kbyA9IGt3KCd0b2RvJyksXG5cdEtXX1RydWUgPSBrdygndHJ1ZScpLFxuXHRLV19UcnlEbyA9IGt3KCd0cnkhJyksXG5cdEtXX1RyeVZhbCA9IGt3KCd0cnknKSxcblx0S1dfVHlwZSA9IGt3Tm90TmFtZSgnOicpLFxuXHRLV19VbmRlZmluZWQgPSBrdygndW5kZWZpbmVkJyksXG5cdEtXX1VubGVzc1ZhbCA9IGt3KCd1bmxlc3MnKSxcblx0S1dfVW5sZXNzRG8gPSBrdygndW5sZXNzIScpLFxuXHRLV19Vc2UgPSBrdygndXNlJyksXG5cdEtXX1VzZURlYnVnID0ga3coJ3VzZS1kZWJ1ZycpLFxuXHRLV19Vc2VEbyA9IGt3KCd1c2UhJyksXG5cdEtXX1VzZUxhenkgPSBrdygndXNlficpLFxuXHRLV19XaXRoID0ga3coJ3dpdGgnKSxcblx0S1dfWWllbGQgPSBrdygnPH4nKSxcblx0S1dfWWllbGRUbyA9IGt3KCc8fn4nKSxcblxuXHRrZXl3b3JkTmFtZSA9IGtpbmQgPT5cblx0XHRrZXl3b3JkS2luZFRvTmFtZS5nZXQoa2luZCksXG5cdC8vIFJldHVybnMgLTEgZm9yIHJlc2VydmVkIGtleXdvcmQgb3IgdW5kZWZpbmVkIGZvciBub3QtYS1rZXl3b3JkLlxuXHRvcEtleXdvcmRLaW5kRnJvbU5hbWUgPSBuYW1lID0+XG5cdFx0a2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpLFxuXHRvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kID0ga3cgPT4ge1xuXHRcdHN3aXRjaCAoa3cpIHtcblx0XHRcdGNhc2UgS1dfRmFsc2U6IHJldHVybiBTVl9GYWxzZVxuXHRcdFx0Y2FzZSBLV19OYW1lOiByZXR1cm4gU1ZfTmFtZVxuXHRcdFx0Y2FzZSBLV19OdWxsOiByZXR1cm4gU1ZfTnVsbFxuXHRcdFx0Y2FzZSBLV19UcnVlOiByZXR1cm4gU1ZfVHJ1ZVxuXHRcdFx0Y2FzZSBLV19VbmRlZmluZWQ6IHJldHVybiBTVl9VbmRlZmluZWRcblx0XHRcdGRlZmF1bHQ6IHJldHVybiBudWxsXG5cdFx0fVxuXHR9LFxuXHRpc0dyb3VwID0gKGdyb3VwS2luZCwgdG9rZW4pID0+XG5cdFx0dG9rZW4gaW5zdGFuY2VvZiBHcm91cCAmJiB0b2tlbi5raW5kID09PSBncm91cEtpbmQsXG5cdGlzS2V5d29yZCA9IChrZXl3b3JkS2luZCwgdG9rZW4pID0+XG5cdFx0dG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
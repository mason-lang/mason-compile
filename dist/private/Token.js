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
	// Currently nDots > 1 is only used by `import` blocks.

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

	const G_Parenthesis = g('()'),
	      G_Bracket = g('[]'),
	     
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
	'abstract', 'await!', 'del', 'del?', 'del!', 'final', 'gen', 'gen!', 'goto!', 'is', 'meta', 'of', 'of!', 'to', 'until', 'until!', 'while!'];

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
	      KW_Import = kw('import'),
	      KW_ImportDebug = kw('import-debug'),
	      KW_ImportDo = kw('import!'),
	      KW_ImportLazy = kw('import~'),
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
	exports.KW_Import = KW_Import;
	exports.KW_ImportDebug = KW_ImportDebug;
	exports.KW_ImportDo = KW_ImportDo;
	exports.KW_ImportLazy = KW_ImportLazy;
	exports.KW_With = KW_With;
	exports.KW_Yield = KW_Yield;
	exports.KW_YieldTo = KW_YieldTo;
	exports.keywordName = keywordName;
	exports.opKeywordKindFromName = opKeywordKindFromName;
	exports.opKeywordKindToSpecialValueKind = opKeywordKindToSpecialValueKind;
	exports.isGroup = isGroup;
	exports.isKeyword = isKeyword;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRva2VuLmpzIiwicHJpdmF0ZS9Ub2tlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNZTyxPQUFNLE9BQU8sQ0FBQztBQUNwQixhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssY0FBZSxJQUFJLGVBQWU7QUFDdkQsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLENBQUMsR0FBRSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxHQUFFLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFBO0dBQUU7RUFDN0Q7Ozs7O0FBR00sT0FBTSxLQUFLLENBQUM7QUFDbEIsYUFBVyxDQUFDLEdBQUcsRUFBRSxTQUFTLG9CQUFxQixJQUFJLGVBQWU7QUFDakUsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLENBQUMsR0FBRSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUE7R0FBRTtFQUN6RDs7Ozs7Ozs7O0FBT00sT0FBTSxPQUFPLENBQUM7QUFDcEIsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFBRSxVQUFPLGtCQTVDYixJQUFJLEVBNENjLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJ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O09BQ3BCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3RCLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2xCLFNBQVMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3RCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ3JCLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3ZCLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzFCLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzNCLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQzlCLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzVCLFlBQVksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQy9CLGFBQWEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQ2hDLGVBQWUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO09BQ25DLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ25CLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2hCLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3hCLFdBQVcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ3RCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFlBQVksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ3ZCLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2hCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3pCLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3pCLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ3JCLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3hCLFlBQVksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzlCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLGNBQWMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDO09BQ25DLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLGFBQWEsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzdCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ25CLFVBQVUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BRXRCLFdBQVcsR0FBRyxJQUFJLElBQ2pCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7OztBQUU1QixzQkFBcUIsR0FBRyxJQUFJLElBQzNCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7T0FDNUIsK0JBQStCLEdBQUcsRUFBRSxJQUFJO0FBQ3ZDLFVBQVEsRUFBRTtBQUNULFFBQUssUUFBUTtBQUFFLGtCQW5RVixRQUFRLENBbVFpQjtBQUFBLEFBQzlCLFFBQUssT0FBTztBQUFFLGtCQXBRQyxPQUFPLENBb1FNO0FBQUEsQUFDNUIsUUFBSyxPQUFPO0FBQUUsa0JBclFVLE9BQU8sQ0FxUUg7QUFBQSxBQUM1QixRQUFLLE9BQU87QUFBRSxrQkF0UW1CLE9BQU8sQ0FzUVo7QUFBQSxBQUM1QixRQUFLLFlBQVk7QUFBRSxrQkF2UXVCLFlBQVksQ0F1UWhCO0FBQUEsQUFDdEM7QUFBUyxXQUFPLElBQUksQ0FBQTtBQUFBLEdBQ3BCO0VBQ0Q7T0FDRCxPQUFPLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxLQUMxQixLQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUztPQUNuRCxTQUFTLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUM5QixLQUFLLFlBQVksT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBIiwiZmlsZSI6InByaXZhdGUvVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtTVl9GYWxzZSwgU1ZfTmFtZSwgU1ZfTnVsbCwgU1ZfVHJ1ZSwgU1ZfVW5kZWZpbmVkfSBmcm9tICcuL01zQXN0J1xuXG4vKlxuVG9rZW4gdHJlZSwgb3V0cHV0IG9mIGBsZXgvZ3JvdXBgLlxuVGhhdCdzIHJpZ2h0OiBpbiBNYXNvbiwgdGhlIHRva2VucyBmb3JtIGEgdHJlZSBjb250YWluaW5nIGJvdGggcGxhaW4gdG9rZW5zIGFuZCBHcm91cCB0b2tlbnMuXG5UaGlzIG1lYW5zIHRoYXQgdGhlIHBhcnNlciBhdm9pZHMgZG9pbmcgbXVjaCBvZiB0aGUgd29yayB0aGF0IHBhcnNlcnMgbm9ybWFsbHkgaGF2ZSB0byBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIEdyb3VwKHRva2VucywgR19QYXJlbnRoZXNpcykuXG4qL1xuXG4vLyBgLm5hbWVgLCBgLi5uYW1lYCwgZXRjLlxuLy8gQ3VycmVudGx5IG5Eb3RzID4gMSBpcyBvbmx5IHVzZWQgYnkgYGltcG9ydGAgYmxvY2tzLlxuZXhwb3J0IGNsYXNzIERvdE5hbWUge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5Eb3RzIC8qIE51bWJlciAqLywgbmFtZSAvKiBTdHJpbmcgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMubkRvdHMgPSBuRG90c1xuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxuXG5cdHRvU3RyaW5nKCkgeyByZXR1cm4gYCR7Jy4nLnJlcGVhdCh0aGlzLm5Eb3RzKX0ke3RoaXMubmFtZX1gIH1cbn1cblxuLy8ga2luZCBpcyBhIEdfKioqLlxuZXhwb3J0IGNsYXNzIEdyb3VwIHtcblx0Y29uc3RydWN0b3IobG9jLCBzdWJUb2tlbnMgLyogQXJyYXlbVG9rZW5dICovLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy5zdWJUb2tlbnMgPSBzdWJUb2tlbnNcblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHsgcmV0dXJuIGAke2dyb3VwS2luZFRvTmFtZS5nZXQodGhpcy5raW5kKX1gIH1cbn1cblxuLypcbkEga2V5XCJ3b3JkXCIgaXMgYW55IHNldCBvZiBjaGFyYWN0ZXJzIHdpdGggYSBwYXJ0aWN1bGFyIG1lYW5pbmcuXG5UaGlzIGNhbiBldmVuIGluY2x1ZGUgb25lcyBsaWtlIGAuIGAgKGRlZmluZXMgYW4gb2JqZWN0IHByb3BlcnR5LCBhcyBpbiBga2V5LiB2YWx1ZWApLlxuS2luZCBpcyBhIEtXXyoqKi4gU2VlIHRoZSBmdWxsIGxpc3QgYmVsb3cuXG4qL1xuZXhwb3J0IGNsYXNzIEtleXdvcmQge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQgLyogTnVtYmVyICovKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHsgcmV0dXJuIGNvZGUoa2V5d29yZEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCkpIH1cbn1cblxuLy8gQSBuYW1lIGlzIGd1YXJhbnRlZWQgdG8gKm5vdCogYmUgYSBrZXl3b3JkLlxuLy8gSXQncyBhbHNvIG5vdCBhIERvdE5hbWUuXG5leHBvcnQgY2xhc3MgTmFtZSB7XG5cdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxuXG5cdHRvU3RyaW5nKCkgeyByZXR1cm4gdGhpcy5uYW1lIH1cbn1cblxuZXhwb3J0IGNsYXNzIERvY0NvbW1lbnQge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHRleHQgLyogU3RyaW5nICovKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHR0aGlzLnRleHQgPSB0ZXh0XG5cdH1cblxuXHR0b1N0cmluZygpIHsgcmV0dXJuICdkb2MgY29tbWVudCcgfVxufVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cblxuZXhwb3J0IGNvbnN0XG5cdEdfUGFyZW50aGVzaXMgPSBnKCcoKScpLFxuXHRHX0JyYWNrZXQgPSBnKCdbXScpLFxuXHQvLyBMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0Ly8gU3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBHX0xpbmUgZ3JvdXBzLlxuXHQvLyBOb3RlIHRoYXQgR19CbG9ja3MgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0R19CbG9jayA9IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8vIFdpdGhpbiBhIHF1b3RlLlxuXHQvLyBTdWItdG9rZW5zIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0R19RdW90ZSA9IGcoJ3F1b3RlJyksXG5cdC8qXG5cdFRva2VucyBvbiBhIGxpbmUuXG5cdE5PVEU6IFRoZSBpbmRlbnRlZCBibG9jayBmb2xsb3dpbmcgdGhlIGVuZCBvZiB0aGUgbGluZSBpcyBjb25zaWRlcmVkIHRvIGJlIGEgcGFydCBvZiB0aGUgbGluZSFcblx0VGhpcyBtZWFucyB0aGF0IGluIHRoaXMgY29kZTpcblx0XHRhXG5cdFx0XHRiXG5cdFx0XHRjXG5cdFx0ZFxuXHRUaGVyZSBhcmUgMiBsaW5lcywgb25lIHN0YXJ0aW5nIHdpdGggJ2EnIGFuZCBvbmUgc3RhcnRpbmcgd2l0aCAnZCcuXG5cdFRoZSBmaXJzdCBsaW5lIGNvbnRhaW5zICdhJyBhbmQgYSBHX0Jsb2NrIHdoaWNoIGluIHR1cm4gY29udGFpbnMgdHdvIG90aGVyIGxpbmVzLlxuXHQqL1xuXHRHX0xpbmUgPSBnKCdsaW5lJyksXG5cdC8qXG5cdEdyb3VwcyB0d28gb3IgbW9yZSB0b2tlbnMgdGhhdCBhcmUgKm5vdCogc2VwYXJhdGVkIGJ5IHNwYWNlcy5cblx0YGFbYl0uY2AgaXMgYW4gZXhhbXBsZS5cblx0QSBzaW5nbGUgdG9rZW4gb24gaXRzIG93biB3aWxsIG5vdCBiZSBnaXZlbiBhIEdfU3BhY2UuXG5cdCovXG5cdEdfU3BhY2UgPSBnKCdzcGFjZWQgZ3JvdXAnKSxcblx0c2hvd0dyb3VwS2luZCA9IGdyb3VwS2luZCA9PiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcblxuXG5sZXQgbmV4dEtleXdvcmRLaW5kID0gMFxuY29uc3Rcblx0a2V5d29yZE5hbWVUb0tpbmQgPSBuZXcgTWFwKCksXG5cdGtleXdvcmRLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cblx0Ly8gV2hlbiBsZXhpbmcgYSBuYW1lLCBhIG1hcCBsb29rdXAgaXMgZG9uZSBieSBrZXl3b3JkS2luZEZyb21OYW1lLlxuXHRrdyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBrd05vdE5hbWUobmFtZSlcblx0XHRrZXl3b3JkTmFtZVRvS2luZC5zZXQobmFtZSwga2luZClcblx0XHRyZXR1cm4ga2luZFxuXHR9LFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBtdXN0IGJlIGxleGVkIHNwZWNpYWxseS5cblx0a3dOb3ROYW1lID0gZGVidWdOYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEtleXdvcmRLaW5kXG5cdFx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0XHRuZXh0S2V5d29yZEtpbmQgPSBuZXh0S2V5d29yZEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fVxuXG5jb25zdCByZXNlcnZlZF93b3JkcyA9IFtcblx0Ly8gSmF2YVNjcmlwdCByZXNlcnZlZCB3b3Jkc1xuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2F3YWl0Jyxcblx0J2NvbnN0Jyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luc3RhbmNlb2YnLFxuXHQnbGV0Jyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIG1hc29uIHJlc2VydmVkIHdvcmRzXG5cdCdhYnN0cmFjdCcsXG5cdCdhd2FpdCEnLFxuXHQnZGVsJyxcblx0J2RlbD8nLFxuXHQnZGVsIScsXG5cdCdmaW5hbCcsXG5cdCdnZW4nLFxuXHQnZ2VuIScsXG5cdCdnb3RvIScsXG5cdCdpcycsXG5cdCdtZXRhJyxcblx0J29mJyxcblx0J29mIScsXG5cdCd0bycsXG5cdCd1bnRpbCcsXG5cdCd1bnRpbCEnLFxuXHQnd2hpbGUhJ1xuXVxuXG5mb3IgKGNvbnN0IG5hbWUgb2YgcmVzZXJ2ZWRfd29yZHMpXG5cdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCAtMSlcblxuZXhwb3J0IGNvbnN0XG5cdEtXX0FuZCA9IGt3KCdhbmQnKSxcblx0S1dfQXMgPSBrdygnYXMnKSxcblx0S1dfQXNzZXJ0ID0ga3coJ2Fzc2VydCEnKSxcblx0S1dfQXNzZXJ0Tm90ID0ga3coJ2ZvcmJpZCEnKSxcblx0S1dfQXNzaWduID0ga3coJz0nKSxcblx0S1dfQXNzaWduTXV0YWJsZSA9IGt3KCc6Oj0nKSxcblx0S1dfTG9jYWxNdXRhdGUgPSBrdygnOj0nKSxcblx0S1dfQnJlYWsgPSBrdygnYnJlYWshJyksXG5cdEtXX0JyZWFrV2l0aFZhbCA9IGt3KCdicmVhaycpLFxuXHRLV19CdWlsdCA9IGt3KCdidWlsdCcpLFxuXHRLV19DYXNlRG8gPSBrdygnY2FzZSEnKSxcblx0S1dfQ2FzZVZhbCA9IGt3KCdjYXNlJyksXG5cdEtXX0NhdGNoRG8gPSBrdygnY2F0Y2ghJyksXG5cdEtXX0NhdGNoVmFsID0ga3coJ2NhdGNoJyksXG5cdEtXX0NvbmQgPSBrdygnY29uZCcpLFxuXHRLV19DbGFzcyA9IGt3KCdjbGFzcycpLFxuXHRLV19Db25zdHJ1Y3QgPSBrdygnY29uc3RydWN0IScpLFxuXHRLV19EZWJ1ZyA9IGt3KCdkZWJ1ZycpLFxuXHRLV19EZWJ1Z2dlciA9IGt3KCdkZWJ1Z2dlciEnKSxcblx0S1dfRG8gPSBrdygnZG8hJyksXG5cdC8vIFRocmVlIGRvdHMgZm9sbG93ZWQgYnkgYSBzcGFjZSwgYXMgaW4gYC4uLiB0aGluZ3MtYWRkZWQtdG8tQGAuXG5cdEtXX0VsbGlwc2lzID0ga3coJy4uLiAnKSxcblx0S1dfRWxzZSA9IGt3KCdlbHNlJyksXG5cdEtXX0V4Y2VwdERvID0ga3coJ2V4Y2VwdCEnKSxcblx0S1dfRXhjZXB0VmFsID0ga3coJ2V4Y2VwdCcpLFxuXHRLV19GYWxzZSA9IGt3KCdmYWxzZScpLFxuXHRLV19GaW5hbGx5ID0ga3coJ2ZpbmFsbHkhJyksXG5cdEtXX0ZvY3VzID0ga3coJ18nKSxcblx0S1dfRm9yQmFnID0ga3coJ0Bmb3InKSxcblx0S1dfRm9yRG8gPSBrdygnZm9yIScpLFxuXHRLV19Gb3JWYWwgPSBrdygnZm9yJyksXG5cdEtXX0Z1biA9IGt3Tm90TmFtZSgnfCcpLFxuXHRLV19GdW5EbyA9IGt3Tm90TmFtZSgnIXwnKSxcblx0S1dfRnVuR2VuID0ga3dOb3ROYW1lKCd+fCcpLFxuXHRLV19GdW5HZW5EbyA9IGt3Tm90TmFtZSgnfiF8JyksXG5cdEtXX0Z1blRoaXMgPSBrd05vdE5hbWUoJy58JyksXG5cdEtXX0Z1blRoaXNEbyA9IGt3Tm90TmFtZSgnLiF8JyksXG5cdEtXX0Z1blRoaXNHZW4gPSBrd05vdE5hbWUoJy5+fCcpLFxuXHRLV19GdW5UaGlzR2VuRG8gPSBrd05vdE5hbWUoJy5+IXwnKSxcblx0S1dfR2V0ID0ga3coJ2dldCcpLFxuXHRLV19JZlZhbCA9IGt3KCdpZicpLFxuXHRLV19JZkRvID0ga3coJ2lmIScpLFxuXHRLV19JZ25vcmUgPSBrdygnaWdub3JlJyksXG5cdEtXX0luID0ga3coJ2luJyksXG5cdEtXX0xhenkgPSBrd05vdE5hbWUoJ34nKSxcblx0S1dfTWFwRW50cnkgPSBrdygnLT4nKSxcblx0S1dfTmFtZSA9IGt3KCduYW1lJyksXG5cdEtXX05ldyA9IGt3KCduZXcnKSxcblx0S1dfTm90ID0ga3coJ25vdCcpLFxuXHRLV19OdWxsID0ga3coJ251bGwnKSxcblx0S1dfT2JqQXNzaWduID0ga3coJy4gJyksXG5cdEtXX09yID0ga3coJ29yJyksXG5cdEtXX091dCA9IGt3KCdvdXQnKSxcblx0S1dfUGFzcyA9IGt3KCdwYXNzJyksXG5cdEtXX1JlZ2lvbiA9IGt3KCdyZWdpb24nKSxcblx0S1dfU2V0ID0ga3coJ3NldCEnKSxcblx0S1dfU3VwZXJEbyA9IGt3KCdzdXBlciEnKSxcblx0S1dfU3VwZXJWYWwgPSBrdygnc3VwZXInKSxcblx0S1dfU3RhdGljID0ga3coJ3N0YXRpYycpLFxuXHRLV19Td2l0Y2hEbyA9IGt3KCdzd2l0Y2ghJyksXG5cdEtXX1N3aXRjaFZhbCA9IGt3KCdzd2l0Y2gnKSxcblx0S1dfVGhyb3cgPSBrdygndGhyb3chJyksXG5cdEtXX1RvZG8gPSBrdygndG9kbycpLFxuXHRLV19UcnVlID0ga3coJ3RydWUnKSxcblx0S1dfVHJ5RG8gPSBrdygndHJ5IScpLFxuXHRLV19UcnlWYWwgPSBrdygndHJ5JyksXG5cdEtXX1R5cGUgPSBrd05vdE5hbWUoJzonKSxcblx0S1dfVW5kZWZpbmVkID0ga3coJ3VuZGVmaW5lZCcpLFxuXHRLV19Vbmxlc3NWYWwgPSBrdygndW5sZXNzJyksXG5cdEtXX1VubGVzc0RvID0ga3coJ3VubGVzcyEnKSxcblx0S1dfSW1wb3J0ID0ga3coJ2ltcG9ydCcpLFxuXHRLV19JbXBvcnREZWJ1ZyA9IGt3KCdpbXBvcnQtZGVidWcnKSxcblx0S1dfSW1wb3J0RG8gPSBrdygnaW1wb3J0IScpLFxuXHRLV19JbXBvcnRMYXp5ID0ga3coJ2ltcG9ydH4nKSxcblx0S1dfV2l0aCA9IGt3KCd3aXRoJyksXG5cdEtXX1lpZWxkID0ga3coJzx+JyksXG5cdEtXX1lpZWxkVG8gPSBrdygnPH5+JyksXG5cblx0a2V5d29yZE5hbWUgPSBraW5kID0+XG5cdFx0a2V5d29yZEtpbmRUb05hbWUuZ2V0KGtpbmQpLFxuXHQvLyBSZXR1cm5zIC0xIGZvciByZXNlcnZlZCBrZXl3b3JkIG9yIHVuZGVmaW5lZCBmb3Igbm90LWEta2V5d29yZC5cblx0b3BLZXl3b3JkS2luZEZyb21OYW1lID0gbmFtZSA9PlxuXHRcdGtleXdvcmROYW1lVG9LaW5kLmdldChuYW1lKSxcblx0b3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZCA9IGt3ID0+IHtcblx0XHRzd2l0Y2ggKGt3KSB7XG5cdFx0XHRjYXNlIEtXX0ZhbHNlOiByZXR1cm4gU1ZfRmFsc2Vcblx0XHRcdGNhc2UgS1dfTmFtZTogcmV0dXJuIFNWX05hbWVcblx0XHRcdGNhc2UgS1dfTnVsbDogcmV0dXJuIFNWX051bGxcblx0XHRcdGNhc2UgS1dfVHJ1ZTogcmV0dXJuIFNWX1RydWVcblx0XHRcdGNhc2UgS1dfVW5kZWZpbmVkOiByZXR1cm4gU1ZfVW5kZWZpbmVkXG5cdFx0XHRkZWZhdWx0OiByZXR1cm4gbnVsbFxuXHRcdH1cblx0fSxcblx0aXNHcm91cCA9IChncm91cEtpbmQsIHRva2VuKSA9PlxuXHRcdHRva2VuIGluc3RhbmNlb2YgR3JvdXAgJiYgdG9rZW4ua2luZCA9PT0gZ3JvdXBLaW5kLFxuXHRpc0tleXdvcmQgPSAoa2V5d29yZEtpbmQsIHRva2VuKSA9PlxuXHRcdHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiB0b2tlbi5raW5kID09PSBrZXl3b3JkS2luZFxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

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

	// kind is a G_***.

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
	      nameKeywords = new Set(),
	      reservedKeywords = new Set(),
	     
	// These keywords are special names.
	// When lexing a name, a map lookup is done by keywordKindFromName.
	kw = name => {
		const kind = kwNotName(name);
		nameKeywords.add(kind);
		keywordNameToKind.set(name, kind);
		return kind;
	},
	     
	// These keywords must be lexed specially.
	kwNotName = debugName => {
		const kind = nextKeywordKind;
		keywordKindToName.set(kind, debugName);
		nextKeywordKind = nextKeywordKind + 1;
		return kind;
	},
	      kwReserved = name => {
		const kind = kw(name);
		reservedKeywords.add(kind);
	};

	const reserved_words = [
	// JavaScript reserved words
	'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public',

	// JavaScript keywords
	'arguments', 'await', 'const', 'delete', 'eval', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while',

	// mason reserved words
	'abstract', 'await!', 'del', 'del?', 'del!', 'final', 'gen', 'gen!', 'goto!', 'is', 'meta', 'to', 'until', 'until!', 'while!'];

	for (const name of reserved_words) kwReserved(name);

	const KW_And = kw('and'),
	      KW_As = kw('as'),
	      KW_Assert = kw('assert!'),
	      KW_AssertNot = kw('forbid!'),
	      KW_Assign = kw('='),
	      KW_AssignMutable = kwNotName('::='),
	      KW_LocalMutate = kwNotName(':='),
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
	      KW_Debugger = kw('debugger!'),
	      KW_Do = kw('do!'),
	      KW_Dot = kwNotName('.'),
	      KW_Ellipsis = kwNotName('... '),
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
	      KW_ObjAssign = kwNotName('. '),
	      KW_Of = kw('of'),
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
	      isKeyword = (keywordKind, token) => token instanceof Keyword && token.kind === keywordKind,
	      isAnyKeyword = (keywordKinds, token) => token instanceof Keyword && keywordKinds.has(token.kind),
	      isNameKeyword = token => isAnyKeyword(nameKeywords, token),
	      isReservedKeyword = token => isAnyKeyword(reservedKeywords, token);
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
	exports.KW_Debugger = KW_Debugger;
	exports.KW_Do = KW_Do;
	exports.KW_Dot = KW_Dot;
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
	exports.KW_Of = KW_Of;
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
	exports.isAnyKeyword = isAnyKeyword;
	exports.isNameKeyword = isNameKeyword;
	exports.isReservedKeyword = isReservedKeyword;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRva2VuLmpzIiwicHJpdmF0ZS9Ub2tlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7OztBQ1dPLE9BQU0sS0FBSyxDQUFDO0FBQ2xCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxvQkFBcUIsSUFBSSxlQUFlO0FBQ2pFLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0FBQ2QsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDMUIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7O0FBRUQsVUFBUSxHQUFHO0FBQUUsVUFBTyxDQUFDLEdBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFBO0dBQUU7RUFDekQ7Ozs7Ozs7OztBQU9NLE9BQU0sT0FBTyxDQUFDO0FBQ3BCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxlQUFlO0FBQ25DLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0FBQ2QsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7O0FBRUQsVUFBUSxHQUFHO0FBQUUsVUFBTyxrQkFoQ2IsSUFBSSxFQWdDYyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7R0FBRTtFQUM1RDs7Ozs7QUFHTSxPQUFNLElBQUksQ0FBQztBQUNqQixhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksZUFBZTtBQUNuQyxPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUNkLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCOztBQUVELFVBQVEsR0FBRztBQUFFLFVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtHQUFFO0VBQy9COzs7O0FBRU0sT0FBTSxVQUFVLENBQUM7QUFDdkIsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsT0FBSSxDQUFDLEdB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QVUsQ0FBQztPQUMzQixRQUFRLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNsQixTQUFTLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUN0QixRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNyQixTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNyQixNQUFNLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztPQUN2QixRQUFRLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUMxQixTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUMzQixXQUFXLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztPQUM5QixVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUM1QixZQUFZLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztPQUMvQixhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztPQUNoQyxlQUFlLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztPQUNuQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixRQUFRLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNuQixPQUFPLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNuQixTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN4QixLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNoQixPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztPQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUN0QixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixZQUFZLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUM5QixLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNoQixLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNoQixNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN4QixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNuQixVQUFVLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN6QixXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUN6QixTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUMzQixZQUFZLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUMzQixRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN2QixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNyQixTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNyQixPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztPQUN4QixZQUFZLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztPQUM5QixZQUFZLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUMzQixXQUFXLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUMzQixTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUMzQixhQUFhLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUM3QixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixRQUFRLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNuQixVQUFVLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUV0QixXQUFXLEdBQUcsSUFBSSxJQUNqQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDOzs7QUFFNUIsc0JBQXFCLEdBQUcsSUFBSSxJQUMzQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO09BQzVCLCtCQUErQixHQUFHLEVBQUUsSUFBSTtBQUN2QyxVQUFRLEVBQUU7QUFDVCxRQUFLLFFBQVE7QUFBRSxrQkF6UFYsUUFBUSxDQXlQaUI7QUFBQSxBQUM5QixRQUFLLE9BQU87QUFBRSxrQkExUEMsT0FBTyxDQTBQTTtBQUFBLEFBQzVCLFFBQUssT0FBTztBQUFFLGtCQTNQVSxPQUFPLENBMlBIO0FBQUEsQUFDNUIsUUFBSyxPQUFPO0FBQUUsa0JBNVBtQixPQUFPLENBNFBaO0FBQUEsQUFDNUIsUUFBSyxZQUFZO0FBQUUsa0JBN1B1QixZQUFZLENBNlBoQjtBQUFBLEFBQ3RDO0FBQVMsV0FBTyxJQUFJLENBQUE7QUFBQSxHQUNwQjtFQUNEO09BQ0QsT0FBTyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssS0FDMUIsS0FBSyxZQUFZLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVM7T0FDbkQsU0FBUyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssS0FDOUIsS0FBSyxZQUFZLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFdBQVc7T0FDdkQsWUFBWSxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssS0FDbEMsS0FBSyxZQUFZLE9BQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7T0FDekQsYUFBYSxHQUFHLEtBQUssSUFDcEIsWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUM7T0FDbEMsaUJBQWlCLEdBQUcsS0FBSyxJQUN4QixZQUFZLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9Ub2tlbi5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQge1NWX0ZhbHNlLCBTVl9OYW1lLCBTVl9OdWxsLCBTVl9UcnVlLCBTVl9VbmRlZmluZWR9IGZyb20gJy4vTXNBc3QnXG5cbi8qXG5Ub2tlbiB0cmVlLCBvdXRwdXQgb2YgYGxleC9ncm91cGAuXG5UaGF0J3MgcmlnaHQ6IGluIE1hc29uLCB0aGUgdG9rZW5zIGZvcm0gYSB0cmVlIGNvbnRhaW5pbmcgYm90aCBwbGFpbiB0b2tlbnMgYW5kIEdyb3VwIHRva2Vucy5cblRoaXMgbWVhbnMgdGhhdCB0aGUgcGFyc2VyIGF2b2lkcyBkb2luZyBtdWNoIG9mIHRoZSB3b3JrIHRoYXQgcGFyc2VycyBub3JtYWxseSBoYXZlIHRvIGRvO1xuaXQgZG9lc24ndCBoYXZlIHRvIGhhbmRsZSBhIFwibGVmdCBwYXJlbnRoZXNpc1wiLCBvbmx5IGEgR3JvdXAodG9rZW5zLCBHX1BhcmVudGhlc2lzKS5cbiovXG5cbi8vIGtpbmQgaXMgYSBHXyoqKi5cbmV4cG9ydCBjbGFzcyBHcm91cCB7XG5cdGNvbnN0cnVjdG9yKGxvYywgc3ViVG9rZW5zIC8qIEFycmF5W1Rva2VuXSAqLywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMuc3ViVG9rZW5zID0gc3ViVG9rZW5zXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7IHJldHVybiBgJHtncm91cEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCl9YCB9XG59XG5cbi8qXG5BIGtleVwid29yZFwiIGlzIGFueSBzZXQgb2YgY2hhcmFjdGVycyB3aXRoIGEgcGFydGljdWxhciBtZWFuaW5nLlxuVGhpcyBjYW4gZXZlbiBpbmNsdWRlIG9uZXMgbGlrZSBgLiBgIChkZWZpbmVzIGFuIG9iamVjdCBwcm9wZXJ0eSwgYXMgaW4gYGtleS4gdmFsdWVgKS5cbktpbmQgaXMgYSBLV18qKiouIFNlZSB0aGUgZnVsbCBsaXN0IGJlbG93LlxuKi9cbmV4cG9ydCBjbGFzcyBLZXl3b3JkIHtcblx0Y29uc3RydWN0b3IobG9jLCBraW5kIC8qIE51bWJlciAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7IHJldHVybiBjb2RlKGtleXdvcmRLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpKSB9XG59XG5cbi8vIEEgbmFtZSBpcyBndWFyYW50ZWVkIHRvICpub3QqIGJlIGEga2V5d29yZC5cbmV4cG9ydCBjbGFzcyBOYW1lIHtcblx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG5cblx0dG9TdHJpbmcoKSB7IHJldHVybiB0aGlzLm5hbWUgfVxufVxuXG5leHBvcnQgY2xhc3MgRG9jQ29tbWVudCB7XG5cdGNvbnN0cnVjdG9yKGxvYywgdGV4dCAvKiBTdHJpbmcgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMudGV4dCA9IHRleHRcblx0fVxuXG5cdHRvU3RyaW5nKCkgeyByZXR1cm4gJ2RvYyBjb21tZW50JyB9XG59XG5cbmxldCBuZXh0R3JvdXBLaW5kID0gMFxuY29uc3Rcblx0Z3JvdXBLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRnID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IG5leHRHcm91cEtpbmRcblx0XHRncm91cEtpbmRUb05hbWUuc2V0KGtpbmQsIG5hbWUpXG5cdFx0bmV4dEdyb3VwS2luZCA9IG5leHRHcm91cEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fVxuXG5leHBvcnQgY29uc3Rcblx0R19QYXJlbnRoZXNpcyA9IGcoJygpJyksXG5cdEdfQnJhY2tldCA9IGcoJ1tdJyksXG5cdC8vIExpbmVzIGluIGFuIGluZGVudGVkIGJsb2NrLlxuXHQvLyBTdWItdG9rZW5zIHdpbGwgYWx3YXlzIGJlIEdfTGluZSBncm91cHMuXG5cdC8vIE5vdGUgdGhhdCBHX0Jsb2NrcyBkbyBub3QgYWx3YXlzIG1hcCB0byBCbG9jayogTXNBc3RzLlxuXHRHX0Jsb2NrID0gZygnaW5kZW50ZWQgYmxvY2snKSxcblx0Ly8gV2l0aGluIGEgcXVvdGUuXG5cdC8vIFN1Yi10b2tlbnMgbWF5IGJlIHN0cmluZ3MsIG9yIEdfUGFyZW50aGVzaXMgZ3JvdXBzLlxuXHRHX1F1b3RlID0gZygncXVvdGUnKSxcblx0Lypcblx0VG9rZW5zIG9uIGEgbGluZS5cblx0Tk9URTogVGhlIGluZGVudGVkIGJsb2NrIGZvbGxvd2luZyB0aGUgZW5kIG9mIHRoZSBsaW5lIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBwYXJ0IG9mIHRoZSBsaW5lIVxuXHRUaGlzIG1lYW5zIHRoYXQgaW4gdGhpcyBjb2RlOlxuXHRcdGFcblx0XHRcdGJcblx0XHRcdGNcblx0XHRkXG5cdFRoZXJlIGFyZSAyIGxpbmVzLCBvbmUgc3RhcnRpbmcgd2l0aCAnYScgYW5kIG9uZSBzdGFydGluZyB3aXRoICdkJy5cblx0VGhlIGZpcnN0IGxpbmUgY29udGFpbnMgJ2EnIGFuZCBhIEdfQmxvY2sgd2hpY2ggaW4gdHVybiBjb250YWlucyB0d28gb3RoZXIgbGluZXMuXG5cdCovXG5cdEdfTGluZSA9IGcoJ2xpbmUnKSxcblx0Lypcblx0R3JvdXBzIHR3byBvciBtb3JlIHRva2VucyB0aGF0IGFyZSAqbm90KiBzZXBhcmF0ZWQgYnkgc3BhY2VzLlxuXHRgYVtiXS5jYCBpcyBhbiBleGFtcGxlLlxuXHRBIHNpbmdsZSB0b2tlbiBvbiBpdHMgb3duIHdpbGwgbm90IGJlIGdpdmVuIGEgR19TcGFjZS5cblx0Ki9cblx0R19TcGFjZSA9IGcoJ3NwYWNlZCBncm91cCcpLFxuXHRzaG93R3JvdXBLaW5kID0gZ3JvdXBLaW5kID0+IGdyb3VwS2luZFRvTmFtZS5nZXQoZ3JvdXBLaW5kKVxuXG5sZXQgbmV4dEtleXdvcmRLaW5kID0gMFxuY29uc3Rcblx0a2V5d29yZE5hbWVUb0tpbmQgPSBuZXcgTWFwKCksXG5cdGtleXdvcmRLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRuYW1lS2V5d29yZHMgPSBuZXcgU2V0KCksXG5cdHJlc2VydmVkS2V5d29yZHMgPSBuZXcgU2V0KCksXG5cdC8vIFRoZXNlIGtleXdvcmRzIGFyZSBzcGVjaWFsIG5hbWVzLlxuXHQvLyBXaGVuIGxleGluZyBhIG5hbWUsIGEgbWFwIGxvb2t1cCBpcyBkb25lIGJ5IGtleXdvcmRLaW5kRnJvbU5hbWUuXG5cdGt3ID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IGt3Tm90TmFtZShuYW1lKVxuXHRcdG5hbWVLZXl3b3Jkcy5hZGQoa2luZClcblx0XHRrZXl3b3JkTmFtZVRvS2luZC5zZXQobmFtZSwga2luZClcblx0XHRyZXR1cm4ga2luZFxuXHR9LFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBtdXN0IGJlIGxleGVkIHNwZWNpYWxseS5cblx0a3dOb3ROYW1lID0gZGVidWdOYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEtleXdvcmRLaW5kXG5cdFx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0XHRuZXh0S2V5d29yZEtpbmQgPSBuZXh0S2V5d29yZEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fSxcblx0a3dSZXNlcnZlZCA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBrdyhuYW1lKVxuXHRcdHJlc2VydmVkS2V5d29yZHMuYWRkKGtpbmQpXG5cdH1cblxuY29uc3QgcmVzZXJ2ZWRfd29yZHMgPSBbXG5cdC8vIEphdmFTY3JpcHQgcmVzZXJ2ZWQgd29yZHNcblx0J2VudW0nLFxuXHQnaW1wbGVtZW50cycsXG5cdCdpbnRlcmZhY2UnLFxuXHQncGFja2FnZScsXG5cdCdwcml2YXRlJyxcblx0J3Byb3RlY3RlZCcsXG5cdCdwdWJsaWMnLFxuXG5cdC8vIEphdmFTY3JpcHQga2V5d29yZHNcblx0J2FyZ3VtZW50cycsXG5cdCdhd2FpdCcsXG5cdCdjb25zdCcsXG5cdCdkZWxldGUnLFxuXHQnZXZhbCcsXG5cdCdpbnN0YW5jZW9mJyxcblx0J2xldCcsXG5cdCdyZXR1cm4nLFxuXHQndHlwZW9mJyxcblx0J3ZhcicsXG5cdCd2b2lkJyxcblx0J3doaWxlJyxcblxuXHQvLyBtYXNvbiByZXNlcnZlZCB3b3Jkc1xuXHQnYWJzdHJhY3QnLFxuXHQnYXdhaXQhJyxcblx0J2RlbCcsXG5cdCdkZWw/Jyxcblx0J2RlbCEnLFxuXHQnZmluYWwnLFxuXHQnZ2VuJyxcblx0J2dlbiEnLFxuXHQnZ290byEnLFxuXHQnaXMnLFxuXHQnbWV0YScsXG5cdCd0bycsXG5cdCd1bnRpbCcsXG5cdCd1bnRpbCEnLFxuXHQnd2hpbGUhJ1xuXVxuXG5mb3IgKGNvbnN0IG5hbWUgb2YgcmVzZXJ2ZWRfd29yZHMpXG5cdGt3UmVzZXJ2ZWQobmFtZSlcblxuZXhwb3J0IGNvbnN0XG5cdEtXX0FuZCA9IGt3KCdhbmQnKSxcblx0S1dfQXMgPSBrdygnYXMnKSxcblx0S1dfQXNzZXJ0ID0ga3coJ2Fzc2VydCEnKSxcblx0S1dfQXNzZXJ0Tm90ID0ga3coJ2ZvcmJpZCEnKSxcblx0S1dfQXNzaWduID0ga3coJz0nKSxcblx0S1dfQXNzaWduTXV0YWJsZSA9IGt3Tm90TmFtZSgnOjo9JyksXG5cdEtXX0xvY2FsTXV0YXRlID0ga3dOb3ROYW1lKCc6PScpLFxuXHRLV19CcmVhayA9IGt3KCdicmVhayEnKSxcblx0S1dfQnJlYWtXaXRoVmFsID0ga3coJ2JyZWFrJyksXG5cdEtXX0J1aWx0ID0ga3coJ2J1aWx0JyksXG5cdEtXX0Nhc2VEbyA9IGt3KCdjYXNlIScpLFxuXHRLV19DYXNlVmFsID0ga3coJ2Nhc2UnKSxcblx0S1dfQ2F0Y2hEbyA9IGt3KCdjYXRjaCEnKSxcblx0S1dfQ2F0Y2hWYWwgPSBrdygnY2F0Y2gnKSxcblx0S1dfQ29uZCA9IGt3KCdjb25kJyksXG5cdEtXX0NsYXNzID0ga3coJ2NsYXNzJyksXG5cdEtXX0NvbnN0cnVjdCA9IGt3KCdjb25zdHJ1Y3QhJyksXG5cdEtXX0RlYnVnZ2VyID0ga3coJ2RlYnVnZ2VyIScpLFxuXHRLV19EbyA9IGt3KCdkbyEnKSxcblx0S1dfRG90ID0ga3dOb3ROYW1lKCcuJyksXG5cdEtXX0VsbGlwc2lzID0ga3dOb3ROYW1lKCcuLi4gJyksXG5cdEtXX0Vsc2UgPSBrdygnZWxzZScpLFxuXHRLV19FeGNlcHREbyA9IGt3KCdleGNlcHQhJyksXG5cdEtXX0V4Y2VwdFZhbCA9IGt3KCdleGNlcHQnKSxcblx0S1dfRmFsc2UgPSBrdygnZmFsc2UnKSxcblx0S1dfRmluYWxseSA9IGt3KCdmaW5hbGx5IScpLFxuXHRLV19Gb2N1cyA9IGt3KCdfJyksXG5cdEtXX0ZvckJhZyA9IGt3KCdAZm9yJyksXG5cdEtXX0ZvckRvID0ga3coJ2ZvciEnKSxcblx0S1dfRm9yVmFsID0ga3coJ2ZvcicpLFxuXHRLV19GdW4gPSBrd05vdE5hbWUoJ3wnKSxcblx0S1dfRnVuRG8gPSBrd05vdE5hbWUoJyF8JyksXG5cdEtXX0Z1bkdlbiA9IGt3Tm90TmFtZSgnfnwnKSxcblx0S1dfRnVuR2VuRG8gPSBrd05vdE5hbWUoJ34hfCcpLFxuXHRLV19GdW5UaGlzID0ga3dOb3ROYW1lKCcufCcpLFxuXHRLV19GdW5UaGlzRG8gPSBrd05vdE5hbWUoJy4hfCcpLFxuXHRLV19GdW5UaGlzR2VuID0ga3dOb3ROYW1lKCcufnwnKSxcblx0S1dfRnVuVGhpc0dlbkRvID0ga3dOb3ROYW1lKCcufiF8JyksXG5cdEtXX0dldCA9IGt3KCdnZXQnKSxcblx0S1dfSWZWYWwgPSBrdygnaWYnKSxcblx0S1dfSWZEbyA9IGt3KCdpZiEnKSxcblx0S1dfSWdub3JlID0ga3coJ2lnbm9yZScpLFxuXHRLV19JbiA9IGt3KCdpbicpLFxuXHRLV19MYXp5ID0ga3dOb3ROYW1lKCd+JyksXG5cdEtXX01hcEVudHJ5ID0ga3coJy0+JyksXG5cdEtXX05hbWUgPSBrdygnbmFtZScpLFxuXHRLV19OZXcgPSBrdygnbmV3JyksXG5cdEtXX05vdCA9IGt3KCdub3QnKSxcblx0S1dfTnVsbCA9IGt3KCdudWxsJyksXG5cdEtXX09iakFzc2lnbiA9IGt3Tm90TmFtZSgnLiAnKSxcblx0S1dfT2YgPSBrdygnb2YnKSxcblx0S1dfT3IgPSBrdygnb3InKSxcblx0S1dfT3V0ID0ga3coJ291dCcpLFxuXHRLV19QYXNzID0ga3coJ3Bhc3MnKSxcblx0S1dfUmVnaW9uID0ga3coJ3JlZ2lvbicpLFxuXHRLV19TZXQgPSBrdygnc2V0IScpLFxuXHRLV19TdXBlckRvID0ga3coJ3N1cGVyIScpLFxuXHRLV19TdXBlclZhbCA9IGt3KCdzdXBlcicpLFxuXHRLV19TdGF0aWMgPSBrdygnc3RhdGljJyksXG5cdEtXX1N3aXRjaERvID0ga3coJ3N3aXRjaCEnKSxcblx0S1dfU3dpdGNoVmFsID0ga3coJ3N3aXRjaCcpLFxuXHRLV19UaHJvdyA9IGt3KCd0aHJvdyEnKSxcblx0S1dfVG9kbyA9IGt3KCd0b2RvJyksXG5cdEtXX1RydWUgPSBrdygndHJ1ZScpLFxuXHRLV19UcnlEbyA9IGt3KCd0cnkhJyksXG5cdEtXX1RyeVZhbCA9IGt3KCd0cnknKSxcblx0S1dfVHlwZSA9IGt3Tm90TmFtZSgnOicpLFxuXHRLV19VbmRlZmluZWQgPSBrdygndW5kZWZpbmVkJyksXG5cdEtXX1VubGVzc1ZhbCA9IGt3KCd1bmxlc3MnKSxcblx0S1dfVW5sZXNzRG8gPSBrdygndW5sZXNzIScpLFxuXHRLV19JbXBvcnQgPSBrdygnaW1wb3J0JyksXG5cdEtXX0ltcG9ydERvID0ga3coJ2ltcG9ydCEnKSxcblx0S1dfSW1wb3J0TGF6eSA9IGt3KCdpbXBvcnR+JyksXG5cdEtXX1dpdGggPSBrdygnd2l0aCcpLFxuXHRLV19ZaWVsZCA9IGt3KCc8ficpLFxuXHRLV19ZaWVsZFRvID0ga3coJzx+ficpLFxuXG5cdGtleXdvcmROYW1lID0ga2luZCA9PlxuXHRcdGtleXdvcmRLaW5kVG9OYW1lLmdldChraW5kKSxcblx0Ly8gUmV0dXJucyAtMSBmb3IgcmVzZXJ2ZWQga2V5d29yZCBvciB1bmRlZmluZWQgZm9yIG5vdC1hLWtleXdvcmQuXG5cdG9wS2V5d29yZEtpbmRGcm9tTmFtZSA9IG5hbWUgPT5cblx0XHRrZXl3b3JkTmFtZVRvS2luZC5nZXQobmFtZSksXG5cdG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQgPSBrdyA9PiB7XG5cdFx0c3dpdGNoIChrdykge1xuXHRcdFx0Y2FzZSBLV19GYWxzZTogcmV0dXJuIFNWX0ZhbHNlXG5cdFx0XHRjYXNlIEtXX05hbWU6IHJldHVybiBTVl9OYW1lXG5cdFx0XHRjYXNlIEtXX051bGw6IHJldHVybiBTVl9OdWxsXG5cdFx0XHRjYXNlIEtXX1RydWU6IHJldHVybiBTVl9UcnVlXG5cdFx0XHRjYXNlIEtXX1VuZGVmaW5lZDogcmV0dXJuIFNWX1VuZGVmaW5lZFxuXHRcdFx0ZGVmYXVsdDogcmV0dXJuIG51bGxcblx0XHR9XG5cdH0sXG5cdGlzR3JvdXAgPSAoZ3JvdXBLaW5kLCB0b2tlbikgPT5cblx0XHR0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZCxcblx0aXNLZXl3b3JkID0gKGtleXdvcmRLaW5kLCB0b2tlbikgPT5cblx0XHR0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYgdG9rZW4ua2luZCA9PT0ga2V5d29yZEtpbmQsXG5cdGlzQW55S2V5d29yZCA9IChrZXl3b3JkS2luZHMsIHRva2VuKSA9PlxuXHRcdHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpLFxuXHRpc05hbWVLZXl3b3JkID0gdG9rZW4gPT5cblx0XHRpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbiksXG5cdGlzUmVzZXJ2ZWRLZXl3b3JkID0gdG9rZW4gPT5cblx0XHRpc0FueUtleXdvcmQocmVzZXJ2ZWRLZXl3b3JkcywgdG9rZW4pXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

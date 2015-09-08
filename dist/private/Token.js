if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../CompileError', './MsAst', './util'], function (exports, _CompileError, _MsAst, _util) {
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
	}

	// kind is a G_***.
	exports.DotName = DotName;

	class Group {
		constructor(loc, subTokens, /* Array[Token] */kind /* Number */) {
			this.loc = loc;
			this.subTokens = subTokens;
			this.kind = kind;
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
	}

	// A name is guaranteed to *not* be a keyword.
	// It's also not a DotName.
	exports.Keyword = Keyword;

	class Name {
		constructor(loc, name /* String */) {
			this.loc = loc;
			this.name = name;
		}
	}

	// NumberLiteral is also both a token and an MsAst.

	exports.Name = Name;
	(0, _util.implementMany)({ DotName, Group, Keyword, Name, NumberLiteral: _MsAst.NumberLiteral }, 'toString', {
		DotName() {
			return `${ '.'.repeat(this.nDots) }${ this.name }`;
		},
		Group() {
			return `${ groupKindToName.get(this.kind) }`;
		},
		Keyword() {
			return (0, _CompileError.code)(keywordKindToName.get(this.kind));
		},
		Name() {
			return this.name;
		},
		NumberLiteral() {
			return this.value.toString();
		}
	});

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
	'abstract', 'await!', 'data', 'del', 'del?', 'del!', 'final', 'gen', 'gen!', 'goto!', 'is', 'isa', 'of', 'of!', 'to', 'until', 'until!', 'while!'];

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
	      KW_Super = kw('super'),
	      KW_Static = kw('static'),
	      KW_SwitchDo = kw('switch!'),
	      KW_SwitchVal = kw('switch'),
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
			case KW_Super:
				return _MsAst.SV_Super;
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
	exports.KW_Super = KW_Super;
	exports.KW_Static = KW_Static;
	exports.KW_SwitchDo = KW_SwitchDo;
	exports.KW_SwitchVal = KW_SwitchVal;
	exports.KW_Throw = KW_Throw;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRva2VuLmpzIiwicHJpdmF0ZS9Ub2tlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNjTyxPQUFNLE9BQU8sQ0FBQztBQUNwQixhQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssY0FBZSxJQUFJLGVBQWU7QUFDdkQsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7OztBQUdNLE9BQU0sS0FBSyxDQUFDO0FBQ2xCLGFBQVcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxvQkFBcUIsSUFBSSxlQUFlO0FBQ2pFLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0FBQ2QsT0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDMUIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7RUFDRDs7Ozs7Ozs7O0FBT00sT0FBTSxPQUFPLENBQUM7QUFDcEIsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjtFQUNEOzs7Ozs7QUFJTSxPQUFNLElBQUksQ0FBQztBQUNqQixhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksZUFBZTtBQUNuQyxPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUNkLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQ2hCO0VBQ0Q7Ozs7O0FBSUQsV0FuRFMsYUFBYSxFQW1EUixFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxhQUFhLFNBckRuRCxhQUFhLEFBcURzQyxFQUFFLEVBQUUsVUFBVSxFQUFFO0FBQzNFLFNBQU8sR0FBRztBQUFFLFVB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QUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3RCLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2xCLFNBQVMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3RCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ3JCLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3ZCLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzFCLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzNCLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQzlCLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQzVCLFlBQVksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQy9CLGFBQWEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO09BQ2hDLGVBQWUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO09BQ25DLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ25CLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2hCLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3hCLFdBQVcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ3RCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFlBQVksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ3ZCLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2hCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ25CLFFBQVEsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQ3RCLFNBQVMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3hCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3ZCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ3JCLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO09BQ3hCLFlBQVksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzlCLFlBQVksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQzNCLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQzNCLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BQ2xCLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLFFBQVEsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3JCLFVBQVUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3ZCLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO09BQ3BCLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ25CLFVBQVUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO09BRXRCLFdBQVcsR0FBRyxJQUFJLElBQ2pCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7OztBQUU1QixzQkFBcUIsR0FBRyxJQUFJLElBQzNCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7T0FDNUIsK0JBQStCLEdBQUcsRUFBRSxJQUFJO0FBQ3ZDLFVBQVEsRUFBRTtBQUNULFFBQUssUUFBUTtBQUFFLGtCQTNQVCxRQUFRLENBMlBnQjtBQUFBLEFBQzlCLFFBQUssT0FBTztBQUFFLGtCQTVQRSxPQUFPLENBNFBLO0FBQUEsQUFDNUIsUUFBSyxPQUFPO0FBQUUsa0JBN1BXLE9BQU8sQ0E2UEo7QUFBQSxBQUM1QixRQUFLLFFBQVE7QUFBRSxrQkE5UG1CLFFBQVEsQ0E4UFo7QUFBQSxBQUM5QixRQUFLLE9BQU87QUFBRSxrQkEvUDhCLE9BQU8sQ0ErUHZCO0FBQUEsQUFDNUIsUUFBSyxZQUFZO0FBQUUsa0JBaFFrQyxZQUFZLENBZ1EzQjtBQUFBLEFBQ3RDO0FBQVMsV0FBTyxJQUFJLENBQUE7QUFBQSxHQUNwQjtFQUNEO09BQ0QsT0FBTyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssS0FDMUIsS0FBSyxZQUFZLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVM7T0FDbkQsU0FBUyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssS0FDOUIsS0FBSyxZQUFZLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQSIsImZpbGUiOiJwcml2YXRlL1Rva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgeyBjb2RlIH0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHsgTnVtYmVyTGl0ZXJhbCB9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBTVl9GYWxzZSwgU1ZfTmFtZSwgU1ZfTnVsbCwgU1ZfU3VwZXIsIFNWX1RydWUsIFNWX1VuZGVmaW5lZCB9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBpbXBsZW1lbnRNYW55IH0gZnJvbSAnLi91dGlsJ1xuXG4vKlxuVG9rZW4gdHJlZSwgb3V0cHV0IG9mIGBsZXgvZ3JvdXBgLlxuVGhhdCdzIHJpZ2h0OiBpbiBNYXNvbiwgdGhlIHRva2VucyBmb3JtIGEgdHJlZSBjb250YWluaW5nIGJvdGggcGxhaW4gdG9rZW5zIGFuZCBHcm91cCB0b2tlbnMuXG5UaGlzIG1lYW5zIHRoYXQgdGhlIHBhcnNlciBhdm9pZHMgZG9pbmcgbXVjaCBvZiB0aGUgd29yayB0aGF0IHBhcnNlcnMgbm9ybWFsbHkgaGF2ZSB0byBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIEdyb3VwKHRva2VucywgR19QYXJlbnRoZXNpcykuXG4qL1xuXG4vLyBgLm5hbWVgLCBgLi5uYW1lYCwgZXRjLlxuLy8gQ3VycmVudGx5IG5Eb3RzID4gMSBpcyBvbmx5IHVzZWQgYnkgYHVzZWAgYmxvY2tzLlxuZXhwb3J0IGNsYXNzIERvdE5hbWUge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5Eb3RzIC8qIE51bWJlciAqLywgbmFtZSAvKiBTdHJpbmcgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMubkRvdHMgPSBuRG90c1xuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxufVxuXG4vLyBraW5kIGlzIGEgR18qKiouXG5leHBvcnQgY2xhc3MgR3JvdXAge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHN1YlRva2VucyAvKiBBcnJheVtUb2tlbl0gKi8sIGtpbmQgLyogTnVtYmVyICovKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxufVxuXG4vKlxuQSBrZXlcIndvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cblRoaXMgY2FuIGV2ZW4gaW5jbHVkZSBvbmVzIGxpa2UgYC4gYCAoZGVmaW5lcyBhbiBvYmplY3QgcHJvcGVydHksIGFzIGluIGBrZXkuIHZhbHVlYCkuXG5LaW5kIGlzIGEgS1dfKioqLiBTZWUgdGhlIGZ1bGwgbGlzdCBiZWxvdy5cbiovXG5leHBvcnQgY2xhc3MgS2V5d29yZCB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxufVxuXG4vLyBBIG5hbWUgaXMgZ3VhcmFudGVlZCB0byAqbm90KiBiZSBhIGtleXdvcmQuXG4vLyBJdCdzIGFsc28gbm90IGEgRG90TmFtZS5cbmV4cG9ydCBjbGFzcyBOYW1lIHtcblx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG59XG5cbi8vIE51bWJlckxpdGVyYWwgaXMgYWxzbyBib3RoIGEgdG9rZW4gYW5kIGFuIE1zQXN0LlxuXG5pbXBsZW1lbnRNYW55KHsgRG90TmFtZSwgR3JvdXAsIEtleXdvcmQsIE5hbWUsIE51bWJlckxpdGVyYWwgfSwgJ3RvU3RyaW5nJywge1xuXHREb3ROYW1lKCkgeyByZXR1cm4gYCR7Jy4nLnJlcGVhdCh0aGlzLm5Eb3RzKX0ke3RoaXMubmFtZX1gIH0sXG5cdEdyb3VwKCkgeyByZXR1cm4gYCR7Z3JvdXBLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpfWAgfSxcblx0S2V5d29yZCgpIHsgcmV0dXJuIGNvZGUoa2V5d29yZEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCkpIH0sXG5cdE5hbWUoKSB7IHJldHVybiB0aGlzLm5hbWUgfSxcblx0TnVtYmVyTGl0ZXJhbCgpIHsgcmV0dXJuIHRoaXMudmFsdWUudG9TdHJpbmcoKSB9XG59KVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cblxuZXhwb3J0IGNvbnN0XG5cdEdfUGFyZW50aGVzaXMgPSBnKCcoICknKSxcblx0R19CcmFja2V0ID0gZygnWyBdJyksXG5cdC8vIExpbmVzIGluIGFuIGluZGVudGVkIGJsb2NrLlxuXHQvLyBTdWItdG9rZW5zIHdpbGwgYWx3YXlzIGJlIEdfTGluZSBncm91cHMuXG5cdC8vIE5vdGUgdGhhdCBHX0Jsb2NrcyBkbyBub3QgYWx3YXlzIG1hcCB0byBCbG9jayogTXNBc3RzLlxuXHRHX0Jsb2NrID0gZygnaW5kZW50ZWQgYmxvY2snKSxcblx0Ly8gV2l0aGluIGEgcXVvdGUuXG5cdC8vIFN1Yi10b2tlbnMgbWF5IGJlIHN0cmluZ3MsIG9yIEdfUGFyZW50aGVzaXMgZ3JvdXBzLlxuXHRHX1F1b3RlID0gZygncXVvdGUnKSxcblx0Lypcblx0VG9rZW5zIG9uIGEgbGluZS5cblx0Tk9URTogVGhlIGluZGVudGVkIGJsb2NrIGZvbGxvd2luZyB0aGUgZW5kIG9mIHRoZSBsaW5lIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBwYXJ0IG9mIHRoZSBsaW5lIVxuXHRUaGlzIG1lYW5zIHRoYXQgaW4gdGhpcyBjb2RlOlxuXHRcdGFcblx0XHRcdGJcblx0XHRcdGNcblx0XHRkXG5cdFRoZXJlIGFyZSAyIGxpbmVzLCBvbmUgc3RhcnRpbmcgd2l0aCAnYScgYW5kIG9uZSBzdGFydGluZyB3aXRoICdkJy5cblx0VGhlIGZpcnN0IGxpbmUgY29udGFpbnMgJ2EnIGFuZCBhIEdfQmxvY2sgd2hpY2ggaW4gdHVybiBjb250YWlucyB0d28gb3RoZXIgbGluZXMuXG5cdCovXG5cdEdfTGluZSA9IGcoJ2xpbmUnKSxcblx0Lypcblx0R3JvdXBzIHR3byBvciBtb3JlIHRva2VucyB0aGF0IGFyZSAqbm90KiBzZXBhcmF0ZWQgYnkgc3BhY2VzLlxuXHRgYVtiXS5jYCBpcyBhbiBleGFtcGxlLlxuXHRBIHNpbmdsZSB0b2tlbiBvbiBpdHMgb3duIHdpbGwgbm90IGJlIGdpdmVuIGEgR19TcGFjZS5cblx0Ki9cblx0R19TcGFjZSA9IGcoJ3NwYWNlZCBncm91cCcpLFxuXHRzaG93R3JvdXBLaW5kID0gZ3JvdXBLaW5kID0+IGdyb3VwS2luZFRvTmFtZS5nZXQoZ3JvdXBLaW5kKVxuXG5cbmxldCBuZXh0S2V5d29yZEtpbmQgPSAwXG5jb25zdFxuXHRrZXl3b3JkTmFtZVRvS2luZCA9IG5ldyBNYXAoKSxcblx0a2V5d29yZEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdC8vIFRoZXNlIGtleXdvcmRzIGFyZSBzcGVjaWFsIG5hbWVzLlxuXHQvLyBXaGVuIGxleGluZyBhIG5hbWUsIGEgbWFwIGxvb2t1cCBpcyBkb25lIGJ5IGtleXdvcmRLaW5kRnJvbU5hbWUuXG5cdGt3ID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IGt3Tm90TmFtZShuYW1lKVxuXHRcdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCBraW5kKVxuXHRcdHJldHVybiBraW5kXG5cdH0sXG5cdC8vIFRoZXNlIGtleXdvcmRzIG11c3QgYmUgbGV4ZWQgc3BlY2lhbGx5LlxuXHRrd05vdE5hbWUgPSBkZWJ1Z05hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0S2V5d29yZEtpbmRcblx0XHRrZXl3b3JkS2luZFRvTmFtZS5zZXQoa2luZCwgZGVidWdOYW1lKVxuXHRcdG5leHRLZXl3b3JkS2luZCA9IG5leHRLZXl3b3JkS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9XG5cbmNvbnN0IHJlc2VydmVkX3dvcmRzID0gW1xuXHQvLyBKYXZhU2NyaXB0IHJlc2VydmVkIHdvcmRzXG5cdCdlbnVtJyxcblx0J2ltcGxlbWVudHMnLFxuXHQnaW50ZXJmYWNlJyxcblx0J3BhY2thZ2UnLFxuXHQncHJpdmF0ZScsXG5cdCdwcm90ZWN0ZWQnLFxuXHQncHVibGljJyxcblxuXHQvLyBKYXZhU2NyaXB0IGtleXdvcmRzXG5cdCdhcmd1bWVudHMnLFxuXHQnYXdhaXQnLFxuXHQnY29uc3QnLFxuXHQnZGVsZXRlJyxcblx0J2V2YWwnLFxuXHQnaW5zdGFuY2VvZicsXG5cdCdsZXQnLFxuXHQncmV0dXJuJyxcblx0J3R5cGVvZicsXG5cdCd2YXInLFxuXHQndm9pZCcsXG5cdCd3aGlsZScsXG5cblx0Ly8gbWFzb24gcmVzZXJ2ZWQgd29yZHNcblx0J2Fic3RyYWN0Jyxcblx0J2F3YWl0IScsXG5cdCdkYXRhJyxcblx0J2RlbCcsXG5cdCdkZWw/Jyxcblx0J2RlbCEnLFxuXHQnZmluYWwnLFxuXHQnZ2VuJyxcblx0J2dlbiEnLFxuXHQnZ290byEnLFxuXHQnaXMnLFxuXHQnaXNhJyxcblx0J29mJyxcblx0J29mIScsXG5cdCd0bycsXG5cdCd1bnRpbCcsXG5cdCd1bnRpbCEnLFxuXHQnd2hpbGUhJ1xuXVxuXG5mb3IgKGNvbnN0IG5hbWUgb2YgcmVzZXJ2ZWRfd29yZHMpXG5cdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCAtMSlcblxuZXhwb3J0IGNvbnN0XG5cdEtXX0FuZCA9IGt3KCdhbmQnKSxcblx0S1dfQXMgPSBrdygnYXMnKSxcblx0S1dfQXNzZXJ0ID0ga3coJ2Fzc2VydCEnKSxcblx0S1dfQXNzZXJ0Tm90ID0ga3coJ2ZvcmJpZCEnKSxcblx0S1dfQXNzaWduID0ga3coJz0nKSxcblx0S1dfQXNzaWduTXV0YWJsZSA9IGt3KCc6Oj0nKSxcblx0S1dfTG9jYWxNdXRhdGUgPSBrdygnOj0nKSxcblx0S1dfQnJlYWsgPSBrdygnYnJlYWshJyksXG5cdEtXX0JyZWFrV2l0aFZhbCA9IGt3KCdicmVhaycpLFxuXHRLV19CdWlsdCA9IGt3KCdidWlsdCcpLFxuXHRLV19DYXNlRG8gPSBrdygnY2FzZSEnKSxcblx0S1dfQ2FzZVZhbCA9IGt3KCdjYXNlJyksXG5cdEtXX0NhdGNoRG8gPSBrdygnY2F0Y2ghJyksXG5cdEtXX0NhdGNoVmFsID0ga3coJ2NhdGNoJyksXG5cdEtXX0NsYXNzID0ga3coJ2NsYXNzJyksXG5cdEtXX0NvbnN0cnVjdCA9IGt3KCdjb25zdHJ1Y3QhJyksXG5cdEtXX0RlYnVnID0ga3coJ2RlYnVnJyksXG5cdEtXX0RlYnVnZ2VyID0ga3coJ2RlYnVnZ2VyIScpLFxuXHRLV19EbyA9IGt3KCdkbyEnKSxcblx0Ly8gVGhyZWUgZG90cyBmb2xsb3dlZCBieSBhIHNwYWNlLCBhcyBpbiBgLi4uIHRoaW5ncy1hZGRlZC10by1AYC5cblx0S1dfRWxsaXBzaXMgPSBrdygnLi4uICcpLFxuXHRLV19FbHNlID0ga3coJ2Vsc2UnKSxcblx0S1dfRXhjZXB0RG8gPSBrdygnZXhjZXB0IScpLFxuXHRLV19FeGNlcHRWYWwgPSBrdygnZXhjZXB0JyksXG5cdEtXX0ZhbHNlID0ga3coJ2ZhbHNlJyksXG5cdEtXX0ZpbmFsbHkgPSBrdygnZmluYWxseSEnKSxcblx0S1dfRm9jdXMgPSBrdygnXycpLFxuXHRLV19Gb3JCYWcgPSBrdygnQGZvcicpLFxuXHRLV19Gb3JEbyA9IGt3KCdmb3IhJyksXG5cdEtXX0ZvclZhbCA9IGt3KCdmb3InKSxcblx0S1dfRnVuID0ga3dOb3ROYW1lKCd8JyksXG5cdEtXX0Z1bkRvID0ga3dOb3ROYW1lKCchfCcpLFxuXHRLV19GdW5HZW4gPSBrd05vdE5hbWUoJ358JyksXG5cdEtXX0Z1bkdlbkRvID0ga3dOb3ROYW1lKCd+IXwnKSxcblx0S1dfRnVuVGhpcyA9IGt3Tm90TmFtZSgnLnwnKSxcblx0S1dfRnVuVGhpc0RvID0ga3dOb3ROYW1lKCcuIXwnKSxcblx0S1dfRnVuVGhpc0dlbiA9IGt3Tm90TmFtZSgnLn58JyksXG5cdEtXX0Z1blRoaXNHZW5EbyA9IGt3Tm90TmFtZSgnLn4hfCcpLFxuXHRLV19HZXQgPSBrdygnZ2V0JyksXG5cdEtXX0lmVmFsID0ga3coJ2lmJyksXG5cdEtXX0lmRG8gPSBrdygnaWYhJyksXG5cdEtXX0lnbm9yZSA9IGt3KCdpZ25vcmUnKSxcblx0S1dfSW4gPSBrdygnaW4nKSxcblx0S1dfTGF6eSA9IGt3Tm90TmFtZSgnficpLFxuXHRLV19NYXBFbnRyeSA9IGt3KCctPicpLFxuXHRLV19OYW1lID0ga3coJ25hbWUnKSxcblx0S1dfTmV3ID0ga3coJ25ldycpLFxuXHRLV19Ob3QgPSBrdygnbm90JyksXG5cdEtXX051bGwgPSBrdygnbnVsbCcpLFxuXHRLV19PYmpBc3NpZ24gPSBrdygnLiAnKSxcblx0S1dfT3IgPSBrdygnb3InKSxcblx0S1dfT3V0ID0ga3coJ291dCcpLFxuXHRLV19QYXNzID0ga3coJ3Bhc3MnKSxcblx0S1dfUmVnaW9uID0ga3coJ3JlZ2lvbicpLFxuXHRLV19TZXQgPSBrdygnc2V0IScpLFxuXHRLV19TdXBlciA9IGt3KCdzdXBlcicpLFxuXHRLV19TdGF0aWMgPSBrdygnc3RhdGljJyksXG5cdEtXX1N3aXRjaERvID0ga3coJ3N3aXRjaCEnKSxcblx0S1dfU3dpdGNoVmFsID0ga3coJ3N3aXRjaCcpLFxuXHRLV19UaHJvdyA9IGt3KCd0aHJvdyEnKSxcblx0S1dfVHJ1ZSA9IGt3KCd0cnVlJyksXG5cdEtXX1RyeURvID0ga3coJ3RyeSEnKSxcblx0S1dfVHJ5VmFsID0ga3coJ3RyeScpLFxuXHRLV19UeXBlID0ga3dOb3ROYW1lKCc6JyksXG5cdEtXX1VuZGVmaW5lZCA9IGt3KCd1bmRlZmluZWQnKSxcblx0S1dfVW5sZXNzVmFsID0ga3coJ3VubGVzcycpLFxuXHRLV19Vbmxlc3NEbyA9IGt3KCd1bmxlc3MhJyksXG5cdEtXX1VzZSA9IGt3KCd1c2UnKSxcblx0S1dfVXNlRGVidWcgPSBrdygndXNlLWRlYnVnJyksXG5cdEtXX1VzZURvID0ga3coJ3VzZSEnKSxcblx0S1dfVXNlTGF6eSA9IGt3KCd1c2V+JyksXG5cdEtXX1dpdGggPSBrdygnd2l0aCcpLFxuXHRLV19ZaWVsZCA9IGt3KCc8ficpLFxuXHRLV19ZaWVsZFRvID0ga3coJzx+ficpLFxuXG5cdGtleXdvcmROYW1lID0ga2luZCA9PlxuXHRcdGtleXdvcmRLaW5kVG9OYW1lLmdldChraW5kKSxcblx0Ly8gUmV0dXJucyAtMSBmb3IgcmVzZXJ2ZWQga2V5d29yZCBvciB1bmRlZmluZWQgZm9yIG5vdC1hLWtleXdvcmQuXG5cdG9wS2V5d29yZEtpbmRGcm9tTmFtZSA9IG5hbWUgPT5cblx0XHRrZXl3b3JkTmFtZVRvS2luZC5nZXQobmFtZSksXG5cdG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQgPSBrdyA9PiB7XG5cdFx0c3dpdGNoIChrdykge1xuXHRcdFx0Y2FzZSBLV19GYWxzZTogcmV0dXJuIFNWX0ZhbHNlXG5cdFx0XHRjYXNlIEtXX05hbWU6IHJldHVybiBTVl9OYW1lXG5cdFx0XHRjYXNlIEtXX051bGw6IHJldHVybiBTVl9OdWxsXG5cdFx0XHRjYXNlIEtXX1N1cGVyOiByZXR1cm4gU1ZfU3VwZXJcblx0XHRcdGNhc2UgS1dfVHJ1ZTogcmV0dXJuIFNWX1RydWVcblx0XHRcdGNhc2UgS1dfVW5kZWZpbmVkOiByZXR1cm4gU1ZfVW5kZWZpbmVkXG5cdFx0XHRkZWZhdWx0OiByZXR1cm4gbnVsbFxuXHRcdH1cblx0fSxcblx0aXNHcm91cCA9IChncm91cEtpbmQsIHRva2VuKSA9PlxuXHRcdHRva2VuIGluc3RhbmNlb2YgR3JvdXAgJiYgdG9rZW4ua2luZCA9PT0gZ3JvdXBLaW5kLFxuXHRpc0tleXdvcmQgPSAoa2V5d29yZEtpbmQsIHRva2VuKSA9PlxuXHRcdHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiB0b2tlbi5raW5kID09PSBrZXl3b3JkS2luZFxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
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
	// Current reserved words
	'await', 'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public',

	// JavaScript keywords
	'arguments', 'const', 'delete', 'eval', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while',

	// Keywords Mason might use
	'abstract', 'data', 'final', 'gen', 'gen!', 'goto!', 'is', 'isa', 'of', 'of!', 'to', 'until', 'until!', 'while!'];

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
	      KW_Continue = kw('continue!'),
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
	      KW_Focus = kwNotName('_'),
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
	      keywordName = kind => keywordKindToName.get(kind),
	     
	// Returns -1 for reserved keyword or undefined for not-a-keyword.
	opKeywordKindFromName = name => keywordNameToKind.get(name),
	      opKeywordKindToSpecialValueKind = kw => {
		switch (kw) {
			case KW_False:
				return _MsAst.SV_False;
			case KW_Null:
				return _MsAst.SV_Null;
			case KW_Super:
				return _MsAst.SV_Super;
			case KW_ThisModuleDirectory:
				return _MsAst.SV_ThisModuleDirectory;
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
	exports.KW_Continue = KW_Continue;
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
	exports.KW_In = KW_In;
	exports.KW_Lazy = KW_Lazy;
	exports.KW_MapEntry = KW_MapEntry;
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
	exports.KW_ThisModuleDirectory = KW_ThisModuleDirectory;
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
//# sourceMappingURL=data:application/json;base64,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QUMzQixZQUFZLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUMzQixRQUFRLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUN0QixVQUFVLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQztPQUMzQixRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztPQUN6QixTQUFTLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUN0QixRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNyQixTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNyQixNQUFNLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztPQUN2QixRQUFRLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUMxQixTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUMzQixXQUFXLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztPQUM5QixVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUM1QixZQUFZLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztPQUMvQixhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztPQUNoQyxlQUFlLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztPQUNuQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixRQUFRLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNuQixPQUFPLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNuQixLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNoQixPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztPQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUN0QixNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixZQUFZLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUN2QixLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNoQixNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUNsQixPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNwQixTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN4QixNQUFNLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztPQUNuQixRQUFRLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztPQUN0QixTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUMzQixZQUFZLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztPQUMzQixzQkFBc0IsR0FBRyxFQUFFLENBQUMsdUJBQXVCLENBQUM7T0FDcEQsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDdkIsT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDcEIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDckIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDckIsT0FBTyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7T0FDeEIsWUFBWSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDOUIsWUFBWSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDM0IsV0FBVyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7T0FDM0IsTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDbEIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDckIsVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDdkIsT0FBTyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7T0FDcEIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FDbkIsVUFBVSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FFdEIsV0FBVyxHQUFHLElBQUksSUFDakIsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQzs7O0FBRTVCLHNCQUFxQixHQUFHLElBQUksSUFDM0IsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztPQUM1QiwrQkFBK0IsR0FBRyxFQUFFLElBQUk7QUFDdkMsVUFBUSxFQUFFO0FBQ1QsUUFBSyxRQUFRO0FBQUUsa0JBdlBULFFBQVEsQ0F1UGdCO0FBQUEsQUFDOUIsUUFBSyxPQUFPO0FBQUUsa0JBeFBFLE9BQU8sQ0F3UEs7QUFBQSxBQUM1QixRQUFLLFFBQVE7QUFBRSxrQkF6UFUsUUFBUSxDQXlQSDtBQUFBLEFBQzlCLFFBQUssc0JBQXNCO0FBQUUsa0JBMVBNLHNCQUFzQixDQTBQQztBQUFBLEFBQzFELFFBQUssT0FBTztBQUFFLGtCQTNQNkMsT0FBTyxDQTJQdEM7QUFBQSxBQUM1QixRQUFLLFlBQVk7QUFBRSxrQkE1UGlELFlBQVksQ0E0UDFDO0FBQUEsQUFDdEM7QUFBUyxXQUFPLElBQUksQ0FBQTtBQUFBLEdBQ3BCO0VBQ0Q7T0FDRCxPQUFPLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxLQUMxQixLQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUztPQUNuRCxTQUFTLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUM5QixLQUFLLFlBQVksT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBIiwiZmlsZSI6InByaXZhdGUvVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb2RlIH0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHsgTnVtYmVyTGl0ZXJhbCB9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBTVl9GYWxzZSwgU1ZfTnVsbCwgU1ZfU3VwZXIsIFNWX1RoaXNNb2R1bGVEaXJlY3RvcnksIFNWX1RydWUsIFNWX1VuZGVmaW5lZFxuXHR9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBpbXBsZW1lbnRNYW55IH0gZnJvbSAnLi91dGlsJ1xuXG4vKlxuVG9rZW4gdHJlZSwgb3V0cHV0IG9mIGBsZXgvZ3JvdXBgLlxuVGhhdCdzIHJpZ2h0OiBpbiBNYXNvbiwgdGhlIHRva2VucyBmb3JtIGEgdHJlZSBjb250YWluaW5nIGJvdGggcGxhaW4gdG9rZW5zIGFuZCBHcm91cCB0b2tlbnMuXG5UaGlzIG1lYW5zIHRoYXQgdGhlIHBhcnNlciBhdm9pZHMgZG9pbmcgbXVjaCBvZiB0aGUgd29yayB0aGF0IHBhcnNlcnMgbm9ybWFsbHkgaGF2ZSB0byBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIEdyb3VwKHRva2VucywgR19QYXJlbnRoZXNpcykuXG4qL1xuXG4vLyBgLm5hbWVgLCBgLi5uYW1lYCwgZXRjLlxuLy8gQ3VycmVudGx5IG5Eb3RzID4gMSBpcyBvbmx5IHVzZWQgYnkgYHVzZWAgYmxvY2tzLlxuZXhwb3J0IGNsYXNzIERvdE5hbWUge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5Eb3RzIC8qIE51bWJlciAqLywgbmFtZSAvKiBTdHJpbmcgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMubkRvdHMgPSBuRG90c1xuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxufVxuXG4vLyBraW5kIGlzIGEgR18qKiouXG5leHBvcnQgY2xhc3MgR3JvdXAge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHN1YlRva2VucyAvKiBBcnJheVtUb2tlbl0gKi8sIGtpbmQgLyogTnVtYmVyICovKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxufVxuXG4vKlxuQSBrZXlcIndvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cblRoaXMgY2FuIGV2ZW4gaW5jbHVkZSBvbmVzIGxpa2UgYC4gYCAoZGVmaW5lcyBhbiBvYmplY3QgcHJvcGVydHksIGFzIGluIGBrZXkuIHZhbHVlYCkuXG5LaW5kIGlzIGEgS1dfKioqLiBTZWUgdGhlIGZ1bGwgbGlzdCBiZWxvdy5cbiovXG5leHBvcnQgY2xhc3MgS2V5d29yZCB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCAvKiBOdW1iZXIgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxufVxuXG4vLyBBIG5hbWUgaXMgZ3VhcmFudGVlZCB0byAqbm90KiBiZSBhIGtleXdvcmQuXG4vLyBJdCdzIGFsc28gbm90IGEgRG90TmFtZS5cbmV4cG9ydCBjbGFzcyBOYW1lIHtcblx0Y29uc3RydWN0b3IobG9jLCBuYW1lIC8qIFN0cmluZyAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG59XG5cbi8vIE51bWJlckxpdGVyYWwgaXMgYWxzbyBib3RoIGEgdG9rZW4gYW5kIGFuIE1zQXN0LlxuXG5pbXBsZW1lbnRNYW55KHsgRG90TmFtZSwgR3JvdXAsIEtleXdvcmQsIE5hbWUsIE51bWJlckxpdGVyYWwgfSwgJ3RvU3RyaW5nJywge1xuXHREb3ROYW1lKCkgeyByZXR1cm4gYCR7Jy4nLnJlcGVhdCh0aGlzLm5Eb3RzKX0ke3RoaXMubmFtZX1gIH0sXG5cdEdyb3VwKCkgeyByZXR1cm4gYCR7Z3JvdXBLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpfWAgfSxcblx0S2V5d29yZCgpIHsgcmV0dXJuIGNvZGUoa2V5d29yZEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCkpIH0sXG5cdE5hbWUoKSB7IHJldHVybiB0aGlzLm5hbWUgfSxcblx0TnVtYmVyTGl0ZXJhbCgpIHsgcmV0dXJuIHRoaXMudmFsdWUudG9TdHJpbmcoKSB9XG59KVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cbmV4cG9ydCBjb25zdFxuXHRHX1BhcmVudGhlc2lzID0gZygnKCApJyksXG5cdEdfQnJhY2tldCA9IGcoJ1sgXScpLFxuXHQvLyBMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0Ly8gU3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBHX0xpbmUgZ3JvdXBzLlxuXHQvLyBOb3RlIHRoYXQgR19CbG9ja3MgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0R19CbG9jayA9IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8vIFdpdGhpbiBhIHF1b3RlLlxuXHQvLyBTdWItdG9rZW5zIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0R19RdW90ZSA9IGcoJ3F1b3RlJyksXG5cdC8qXG5cdFRva2VucyBvbiBhIGxpbmUuXG5cdE5PVEU6IFRoZSBpbmRlbnRlZCBibG9jayBmb2xsb3dpbmcgdGhlIGVuZCBvZiB0aGUgbGluZSBpcyBjb25zaWRlcmVkIHRvIGJlIGEgcGFydCBvZiB0aGUgbGluZSFcblx0VGhpcyBtZWFucyB0aGF0IGluIHRoaXMgY29kZTpcblx0XHRhXG5cdFx0XHRiXG5cdFx0XHRjXG5cdFx0ZFxuXHRUaGVyZSBhcmUgMiBsaW5lcywgb25lIHN0YXJ0aW5nIHdpdGggJ2EnIGFuZCBvbmUgc3RhcnRpbmcgd2l0aCAnZCcuXG5cdFRoZSBmaXJzdCBsaW5lIGNvbnRhaW5zICdhJyBhbmQgYSBHX0Jsb2NrIHdoaWNoIGluIHR1cm4gY29udGFpbnMgdHdvIG90aGVyIGxpbmVzLlxuXHQqL1xuXHRHX0xpbmUgPSBnKCdsaW5lJyksXG5cdC8qXG5cdEdyb3VwcyB0d28gb3IgbW9yZSB0b2tlbnMgdGhhdCBhcmUgKm5vdCogc2VwYXJhdGVkIGJ5IHNwYWNlcy5cblx0YGFbYl0uY2AgaXMgYW4gZXhhbXBsZS5cblx0QSBzaW5nbGUgdG9rZW4gb24gaXRzIG93biB3aWxsIG5vdCBiZSBnaXZlbiBhIEdfU3BhY2UuXG5cdCovXG5cdEdfU3BhY2UgPSBnKCdzcGFjZWQgZ3JvdXAnKSxcblx0c2hvd0dyb3VwS2luZCA9IGdyb3VwS2luZCA9PiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcblxuXG5sZXQgbmV4dEtleXdvcmRLaW5kID0gMFxuY29uc3Rcblx0a2V5d29yZE5hbWVUb0tpbmQgPSBuZXcgTWFwKCksXG5cdGtleXdvcmRLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cblx0Ly8gV2hlbiBsZXhpbmcgYSBuYW1lLCBhIG1hcCBsb29rdXAgaXMgZG9uZSBieSBrZXl3b3JkS2luZEZyb21OYW1lLlxuXHRrdyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBrd05vdE5hbWUobmFtZSlcblx0XHRrZXl3b3JkTmFtZVRvS2luZC5zZXQobmFtZSwga2luZClcblx0XHRyZXR1cm4ga2luZFxuXHR9LFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBtdXN0IGJlIGxleGVkIHNwZWNpYWxseS5cblx0a3dOb3ROYW1lID0gZGVidWdOYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEtleXdvcmRLaW5kXG5cdFx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0XHRuZXh0S2V5d29yZEtpbmQgPSBuZXh0S2V5d29yZEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fVxuXG5jb25zdCByZXNlcnZlZF93b3JkcyA9IFtcblx0Ly8gQ3VycmVudCByZXNlcnZlZCB3b3Jkc1xuXHQnYXdhaXQnLFxuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2NvbnN0Jyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luc3RhbmNlb2YnLFxuXHQnbGV0Jyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIEtleXdvcmRzIE1hc29uIG1pZ2h0IHVzZVxuXHQnYWJzdHJhY3QnLFxuXHQnZGF0YScsXG5cdCdmaW5hbCcsXG5cdCdnZW4nLFxuXHQnZ2VuIScsXG5cdCdnb3RvIScsXG5cdCdpcycsXG5cdCdpc2EnLFxuXHQnb2YnLFxuXHQnb2YhJyxcblx0J3RvJyxcblx0J3VudGlsJyxcblx0J3VudGlsIScsXG5cdCd3aGlsZSEnXG5dXG5cbmZvciAoY29uc3QgbmFtZSBvZiByZXNlcnZlZF93b3Jkcylcblx0a2V5d29yZE5hbWVUb0tpbmQuc2V0KG5hbWUsIC0xKVxuXG5leHBvcnQgY29uc3Rcblx0S1dfQW5kID0ga3coJ2FuZCcpLFxuXHRLV19BcyA9IGt3KCdhcycpLFxuXHRLV19Bc3NlcnQgPSBrdygnYXNzZXJ0IScpLFxuXHRLV19Bc3NlcnROb3QgPSBrdygnZm9yYmlkIScpLFxuXHRLV19Bc3NpZ24gPSBrdygnPScpLFxuXHRLV19Bc3NpZ25NdXRhYmxlID0ga3coJzo6PScpLFxuXHRLV19Mb2NhbE11dGF0ZSA9IGt3KCc6PScpLFxuXHRLV19CcmVhayA9IGt3KCdicmVhayEnKSxcblx0S1dfQnJlYWtXaXRoVmFsID0ga3coJ2JyZWFrJyksXG5cdEtXX0J1aWx0ID0ga3coJ2J1aWx0JyksXG5cdEtXX0Nhc2VEbyA9IGt3KCdjYXNlIScpLFxuXHRLV19DYXNlVmFsID0ga3coJ2Nhc2UnKSxcblx0S1dfQ2F0Y2hEbyA9IGt3KCdjYXRjaCEnKSxcblx0S1dfQ2F0Y2hWYWwgPSBrdygnY2F0Y2gnKSxcblx0S1dfQ2xhc3MgPSBrdygnY2xhc3MnKSxcblx0S1dfQ29uc3RydWN0ID0ga3coJ2NvbnN0cnVjdCEnKSxcblx0S1dfQ29udGludWUgPSBrdygnY29udGludWUhJyksXG5cdEtXX0RlYnVnID0ga3coJ2RlYnVnJyksXG5cdEtXX0RlYnVnZ2VyID0ga3coJ2RlYnVnZ2VyIScpLFxuXHRLV19EbyA9IGt3KCdkbyEnKSxcblx0Ly8gVGhyZWUgZG90cyBmb2xsb3dlZCBieSBhIHNwYWNlLCBhcyBpbiBgLi4uIHRoaW5ncy1hZGRlZC10by1AYC5cblx0S1dfRWxsaXBzaXMgPSBrdygnLi4uICcpLFxuXHRLV19FbHNlID0ga3coJ2Vsc2UnKSxcblx0S1dfRXhjZXB0RG8gPSBrdygnZXhjZXB0IScpLFxuXHRLV19FeGNlcHRWYWwgPSBrdygnZXhjZXB0JyksXG5cdEtXX0ZhbHNlID0ga3coJ2ZhbHNlJyksXG5cdEtXX0ZpbmFsbHkgPSBrdygnZmluYWxseSEnKSxcblx0S1dfRm9jdXMgPSBrd05vdE5hbWUoJ18nKSxcblx0S1dfRm9yQmFnID0ga3coJ0Bmb3InKSxcblx0S1dfRm9yRG8gPSBrdygnZm9yIScpLFxuXHRLV19Gb3JWYWwgPSBrdygnZm9yJyksXG5cdEtXX0Z1biA9IGt3Tm90TmFtZSgnfCcpLFxuXHRLV19GdW5EbyA9IGt3Tm90TmFtZSgnIXwnKSxcblx0S1dfRnVuR2VuID0ga3dOb3ROYW1lKCd+fCcpLFxuXHRLV19GdW5HZW5EbyA9IGt3Tm90TmFtZSgnfiF8JyksXG5cdEtXX0Z1blRoaXMgPSBrd05vdE5hbWUoJy58JyksXG5cdEtXX0Z1blRoaXNEbyA9IGt3Tm90TmFtZSgnLiF8JyksXG5cdEtXX0Z1blRoaXNHZW4gPSBrd05vdE5hbWUoJy5+fCcpLFxuXHRLV19GdW5UaGlzR2VuRG8gPSBrd05vdE5hbWUoJy5+IXwnKSxcblx0S1dfR2V0ID0ga3coJ2dldCcpLFxuXHRLV19JZlZhbCA9IGt3KCdpZicpLFxuXHRLV19JZkRvID0ga3coJ2lmIScpLFxuXHRLV19JbiA9IGt3KCdpbicpLFxuXHRLV19MYXp5ID0ga3dOb3ROYW1lKCd+JyksXG5cdEtXX01hcEVudHJ5ID0ga3coJy0+JyksXG5cdEtXX05ldyA9IGt3KCduZXcnKSxcblx0S1dfTm90ID0ga3coJ25vdCcpLFxuXHRLV19OdWxsID0ga3coJ251bGwnKSxcblx0S1dfT2JqQXNzaWduID0ga3coJy4gJyksXG5cdEtXX09yID0ga3coJ29yJyksXG5cdEtXX091dCA9IGt3KCdvdXQnKSxcblx0S1dfUGFzcyA9IGt3KCdwYXNzJyksXG5cdEtXX1JlZ2lvbiA9IGt3KCdyZWdpb24nKSxcblx0S1dfU2V0ID0ga3coJ3NldCEnKSxcblx0S1dfU3VwZXIgPSBrdygnc3VwZXInKSxcblx0S1dfU3RhdGljID0ga3coJ3N0YXRpYycpLFxuXHRLV19Td2l0Y2hEbyA9IGt3KCdzd2l0Y2ghJyksXG5cdEtXX1N3aXRjaFZhbCA9IGt3KCdzd2l0Y2gnKSxcblx0S1dfVGhpc01vZHVsZURpcmVjdG9yeSA9IGt3KCd0aGlzLW1vZHVsZS1kaXJlY3RvcnknKSxcblx0S1dfVGhyb3cgPSBrdygndGhyb3chJyksXG5cdEtXX1RydWUgPSBrdygndHJ1ZScpLFxuXHRLV19UcnlEbyA9IGt3KCd0cnkhJyksXG5cdEtXX1RyeVZhbCA9IGt3KCd0cnknKSxcblx0S1dfVHlwZSA9IGt3Tm90TmFtZSgnOicpLFxuXHRLV19VbmRlZmluZWQgPSBrdygndW5kZWZpbmVkJyksXG5cdEtXX1VubGVzc1ZhbCA9IGt3KCd1bmxlc3MnKSxcblx0S1dfVW5sZXNzRG8gPSBrdygndW5sZXNzIScpLFxuXHRLV19Vc2UgPSBrdygndXNlJyksXG5cdEtXX1VzZURlYnVnID0ga3coJ3VzZS1kZWJ1ZycpLFxuXHRLV19Vc2VEbyA9IGt3KCd1c2UhJyksXG5cdEtXX1VzZUxhenkgPSBrdygndXNlficpLFxuXHRLV19XaXRoID0ga3coJ3dpdGgnKSxcblx0S1dfWWllbGQgPSBrdygnPH4nKSxcblx0S1dfWWllbGRUbyA9IGt3KCc8fn4nKSxcblxuXHRrZXl3b3JkTmFtZSA9IGtpbmQgPT5cblx0XHRrZXl3b3JkS2luZFRvTmFtZS5nZXQoa2luZCksXG5cdC8vIFJldHVybnMgLTEgZm9yIHJlc2VydmVkIGtleXdvcmQgb3IgdW5kZWZpbmVkIGZvciBub3QtYS1rZXl3b3JkLlxuXHRvcEtleXdvcmRLaW5kRnJvbU5hbWUgPSBuYW1lID0+XG5cdFx0a2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpLFxuXHRvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kID0ga3cgPT4ge1xuXHRcdHN3aXRjaCAoa3cpIHtcblx0XHRcdGNhc2UgS1dfRmFsc2U6IHJldHVybiBTVl9GYWxzZVxuXHRcdFx0Y2FzZSBLV19OdWxsOiByZXR1cm4gU1ZfTnVsbFxuXHRcdFx0Y2FzZSBLV19TdXBlcjogcmV0dXJuIFNWX1N1cGVyXG5cdFx0XHRjYXNlIEtXX1RoaXNNb2R1bGVEaXJlY3Rvcnk6IHJldHVybiBTVl9UaGlzTW9kdWxlRGlyZWN0b3J5XG5cdFx0XHRjYXNlIEtXX1RydWU6IHJldHVybiBTVl9UcnVlXG5cdFx0XHRjYXNlIEtXX1VuZGVmaW5lZDogcmV0dXJuIFNWX1VuZGVmaW5lZFxuXHRcdFx0ZGVmYXVsdDogcmV0dXJuIG51bGxcblx0XHR9XG5cdH0sXG5cdGlzR3JvdXAgPSAoZ3JvdXBLaW5kLCB0b2tlbikgPT5cblx0XHR0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZCxcblx0aXNLZXl3b3JkID0gKGtleXdvcmRLaW5kLCB0b2tlbikgPT5cblx0XHR0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYgdG9rZW4ua2luZCA9PT0ga2V5d29yZEtpbmRcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../CompileError', './MsAst'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../CompileError'), require('./MsAst'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.MsAst);
		global.Token = mod.exports;
	}
})(this, function (exports, _CompileError, _MsAst) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Keywords = exports.Groups = exports.DocComment = exports.Name = exports.Keyword = exports.Group = undefined;
	exports.showGroupKind = showGroupKind;
	exports.keywordName = keywordName;
	exports.opKeywordKindFromName = opKeywordKindFromName;
	exports.opKeywordKindToSpecialValueKind = opKeywordKindToSpecialValueKind;
	exports.isGroup = isGroup;
	exports.isKeyword = isKeyword;
	exports.isAnyKeyword = isAnyKeyword;
	exports.isNameKeyword = isNameKeyword;
	exports.isReservedKeyword = isReservedKeyword;

	class Token {
		constructor(loc) {
			this.loc = loc;
		}

	}

	exports.default = Token;

	class Group extends Token {
		constructor(loc, subTokens, kind) {
			super(loc);
			this.subTokens = subTokens;
			this.kind = kind;
		}

		toString() {
			return `${ groupKindToName.get(this.kind) }`;
		}

	}

	exports.Group = Group;

	class Keyword extends Token {
		constructor(loc, kind) {
			super(loc);
			this.kind = kind;
		}

		toString() {
			return (0, _CompileError.code)(keywordKindToName.get(this.kind));
		}

	}

	exports.Keyword = Keyword;

	class Name extends Token {
		constructor(loc, name) {
			super(loc);
			this.name = name;
		}

		toString() {
			return (0, _CompileError.code)(this.name);
		}

	}

	exports.Name = Name;

	class DocComment extends Token {
		constructor(loc, text) {
			super(loc);
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

	const Groups = exports.Groups = {
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
	};

	function showGroupKind(groupKind) {
		return groupKindToName.get(groupKind);
	}

	let nextKeywordKind = 0;
	const keywordNameToKind = new Map(),
	      keywordKindToName = new Map(),
	      nameKeywords = new Set(),
	      reservedKeywords = new Set();

	function kw(name) {
		const kind = kwNotName(name);
		nameKeywords.add(kind);
		keywordNameToKind.set(name, kind);
		return kind;
	}

	function kwNotName(debugName) {
		const kind = nextKeywordKind;
		keywordKindToName.set(kind, debugName);
		nextKeywordKind = nextKeywordKind + 1;
		return kind;
	}

	function kwReserved(name) {
		const kind = kw(name);
		reservedKeywords.add(kind);
	}

	const reservedWords = ['enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'arguments', 'async', 'await', 'const', 'delete', 'eval', 'in', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while', '!', 'abstract', 'actor', 'await!', 'data', 'del?', 'else!', 'final', 'is', 'meta', 'out', 'send', 'send!', 'to', 'type', 'until', 'until!', 'while!'];

	for (const name of reservedWords) kwReserved(name);

	const Keywords = exports.Keywords = {
		Ampersand: kwNotName('&'),
		And: kw('and'),
		As: kw('as'),
		Assert: kw('assert!'),
		AssertNot: kw('forbid!'),
		Assign: kw('='),
		AssignMutable: kwNotName('::='),
		LocalMutate: kwNotName(':='),
		Break: kw('break!'),
		BreakWithVal: kw('break'),
		Built: kw('built'),
		CaseDo: kw('case!'),
		CaseVal: kw('case'),
		CatchDo: kw('catch!'),
		CatchVal: kw('catch'),
		Cond: kw('cond'),
		Class: kw('class'),
		Construct: kw('construct!'),
		Debugger: kw('debugger!'),
		DelDo: kw('del!'),
		DelVal: kw('del'),
		Do: kw('do!'),
		Dot: kwNotName('.'),
		Dot2: kwNotName('..'),
		Dot3: kwNotName('... '),
		Else: kw('else'),
		ExceptDo: kw('except!'),
		ExceptVal: kw('except'),
		False: kw('false'),
		Finally: kw('finally!'),
		Focus: kw('_'),
		ForBag: kw('@for'),
		ForDo: kw('for!'),
		ForVal: kw('for'),
		Fun: kwNotName('|'),
		FunDo: kwNotName('!|'),
		FunThis: kwNotName('.|'),
		FunThisDo: kwNotName('.!|'),
		FunAsync: kwNotName('$|'),
		FunAsyncDo: kwNotName('$!|'),
		FunThisAsync: kwNotName('.$|'),
		FunThisAsyncDo: kwNotName('.$!|'),
		FunGen: kwNotName('~|'),
		FunGenDo: kwNotName('~!|'),
		FunThisGen: kwNotName('.~|'),
		FunThisGenDo: kwNotName('.~!|'),
		Get: kw('get'),
		IfVal: kw('if'),
		IfDo: kw('if!'),
		Ignore: kw('ignore'),
		Lazy: kwNotName('~'),
		MapEntry: kw('->'),
		Name: kw('name'),
		New: kw('new'),
		Not: kw('not'),
		Null: kw('null'),
		ObjAssign: kwNotName('. '),
		Of: kw('of'),
		Or: kw('or'),
		Pass: kw('pass'),
		Region: kw('region'),
		Set: kw('set!'),
		SuperDo: kw('super!'),
		SuperVal: kw('super'),
		Static: kw('static'),
		SwitchDo: kw('switch!'),
		SwitchVal: kw('switch'),
		Tick: kwNotName('\''),
		Throw: kw('throw!'),
		Todo: kw('todo'),
		True: kw('true'),
		TryDo: kw('try!'),
		TryVal: kw('try'),
		Type: kwNotName(':'),
		Undefined: kw('undefined'),
		UnlessVal: kw('unless'),
		UnlessDo: kw('unless!'),
		Import: kw('import'),
		ImportDo: kw('import!'),
		ImportLazy: kw('import~'),
		With: kw('with'),
		Yield: kw('<~'),
		YieldTo: kw('<~~')
	};

	function keywordName(kind) {
		return keywordKindToName.get(kind);
	}

	function opKeywordKindFromName(name) {
		const kind = keywordNameToKind.get(name);
		return kind === undefined ? null : kind;
	}

	function opKeywordKindToSpecialValueKind(kind) {
		switch (kind) {
			case Keywords.False:
				return _MsAst.SpecialVals.False;

			case Keywords.Name:
				return _MsAst.SpecialVals.Name;

			case Keywords.Null:
				return _MsAst.SpecialVals.Null;

			case Keywords.True:
				return _MsAst.SpecialVals.True;

			case Keywords.Undefined:
				return _MsAst.SpecialVals.Undefined;

			default:
				return null;
		}
	}

	function isGroup(groupKind, token) {
		return token instanceof Group && token.kind === groupKind;
	}

	function isKeyword(keywordKind, token) {
		return token instanceof Keyword && token.kind === keywordKind;
	}

	function isAnyKeyword(keywordKinds, token) {
		return token instanceof Keyword && keywordKinds.has(token.kind);
	}

	function isNameKeyword(token) {
		return isAnyKeyword(nameKeywords, token);
	}

	function isReservedKeyword(token) {
		return isAnyKeyword(reservedKeywords, token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0E4SmdCLGFBQWEsR0FBYixhQUFhO1NBNEtiLFdBQVcsR0FBWCxXQUFXO1NBUVgscUJBQXFCLEdBQXJCLHFCQUFxQjtTQUtyQiwrQkFBK0IsR0FBL0IsK0JBQStCO1NBc0IvQixPQUFPLEdBQVAsT0FBTztTQVNQLFNBQVMsR0FBVCxTQUFTO1NBU1QsWUFBWSxHQUFaLFlBQVk7U0FLWixhQUFhLEdBQWIsYUFBYTtTQUtiLGlCQUFpQixHQUFqQixpQkFBaUI7O09BelhaLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FVYixLQUFLOzs7Ozs7Ozs7Ozs7O1NBQUwsS0FBSyxHQUFMLEtBQUs7O09BeUJMLE9BQU87Ozs7Ozs7Ozs7OztTQUFQLE9BQU8sR0FBUCxPQUFPOztPQWdCUCxJQUFJOzs7Ozs7Ozs7Ozs7U0FBSixJQUFJLEdBQUosSUFBSTs7T0FpQkosVUFBVTs7Ozs7Ozs7Ozs7O1NBQVYsVUFBVSxHQUFWLFVBQVU7Ozs7Ozs7Ozs7O09BMEJWLE1BQU0sV0FBTixNQUFNLEdBQUc7Ozs7Ozs7O0FBVXJCLGFBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDOztBQUVwQixTQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQzs7Ozs7O0FBTWhCLE9BQUssRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUM7Ozs7O0FBSzFCLE9BQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDOzs7Ozs7Ozs7Ozs7QUFZakIsTUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7Ozs7OztBQU1mLE9BQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO0VBQ2pCOztVQU1lLGFBQWE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWlGaEIsUUFBUSxXQUFSLFFBQVEsR0FBRztBQUN2QixXQUFTLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUN6QixLQUFHLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNkLElBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ1osUUFBTSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFDckIsV0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFDeEIsUUFBTSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZixlQUFhLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUMvQixhQUFXLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQztBQUM1QixPQUFLLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNuQixjQUFZLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUN6QixPQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNsQixRQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNuQixTQUFPLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNuQixTQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNyQixVQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNyQixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixPQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNsQixXQUFTLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQztBQUMzQixVQUFRLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQztBQUN6QixPQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNqQixRQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNqQixJQUFFLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNiLEtBQUcsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDO0FBQ25CLE1BQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ3JCLE1BQUksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3ZCLE1BQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ2hCLFVBQVEsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDO0FBQ3ZCLFdBQVMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDO0FBQ3ZCLE9BQUssRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ2xCLFNBQU8sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDO0FBQ3ZCLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsUUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDbEIsT0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDakIsUUFBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDakIsS0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUM7QUFDbkIsT0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDdEIsU0FBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDeEIsV0FBUyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDM0IsVUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDekIsWUFBVSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDNUIsY0FBWSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUM7QUFDOUIsZ0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ2pDLFFBQU0sRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ3ZCLFVBQVEsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDO0FBQzFCLFlBQVUsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDO0FBQzVCLGNBQVksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQy9CLEtBQUcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2QsT0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDZixNQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNmLFFBQU0sRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDO0FBQ3BCLE1BQUksRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDO0FBQ3BCLFVBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2xCLE1BQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ2hCLEtBQUcsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDO0FBQ2QsS0FBRyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDZCxNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixXQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQztBQUMxQixJQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNaLElBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ1osTUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDaEIsUUFBTSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDcEIsS0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDZixTQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNyQixVQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNyQixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixVQUFRLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN2QixXQUFTLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUN2QixNQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNyQixPQUFLLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNuQixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixPQUFLLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNqQixRQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNqQixNQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUNwQixXQUFTLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQztBQUMxQixXQUFTLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUN2QixVQUFRLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN2QixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixVQUFRLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN2QixZQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN6QixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixPQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNmLFNBQU8sRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDO0VBQ2xCOztVQU9lLFdBQVc7Ozs7VUFRWCxxQkFBcUI7Ozs7O1VBS3JCLCtCQUErQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQXNCL0IsT0FBTzs7OztVQVNQLFNBQVM7Ozs7VUFTVCxZQUFZOzs7O1VBS1osYUFBYTs7OztVQUtiLGlCQUFpQiIsImZpbGUiOiJUb2tlbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtTcGVjaWFsVmFsc30gZnJvbSAnLi9Nc0FzdCdcblxuLyoqXG5MZXhlZCBlbGVtZW50IGluIGEgdHJlZSBvZiBUb2tlbnMuXG5cblNpbmNlIHtAbGluayBsZXh9IGRvZXMgZ3JvdXBpbmcsIHtAbGluayBwYXJzZX0gYXZvaWRzIGRvaW5nIG11Y2ggb2YgdGhlIHdvcmsgcGFyc2VycyB1c3VhbGx5IGRvO1xuaXQgZG9lc24ndCBoYXZlIHRvIGhhbmRsZSBhIFwibGVmdCBwYXJlbnRoZXNpc1wiLCBvbmx5IGEge0BsaW5rIEdyb3VwfSBvZiBraW5kIEdfUGFyZW50aGVzaXMuXG5UaGlzIGFsc28gbWVhbnMgdGhhdCB0aGUgbWFueSBkaWZmZXJlbnQge0BsaW5rIE1zQXN0fSB0eXBlcyBhbGwgcGFyc2UgaW4gYSBzaW1pbGFyIG1hbm5lcixcbmtlZXBpbmcgdGhlIGxhbmd1YWdlIGNvbnNpc3RlbnQuXG5cbkJlc2lkZXMge0BsaW5rIEdyb3VwfSwge0BsaW5rIEtleXdvcmR9LCB7QGxpbmsgTmFtZX0sIGFuZCB7QGxpbmsgRG9jQ29tbWVudH0sXG57QGxpbmsgTnVtYmVyTGl0ZXJhbH0gdmFsdWVzIGFyZSBhbHNvIHRyZWF0ZWQgYXMgVG9rZW5zLlxuXG5AYWJzdHJhY3RcbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cbn1cblxuLyoqXG5Db250YWlucyBtdWx0aXBsZSBzdWItdG9rZW5zLlxuU2VlIHtAbGluayBHcm91cEtpbmR9IGZvciBleHBsYW5hdGlvbnMuXG4qL1xuZXhwb3J0IGNsYXNzIEdyb3VwIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHN1YlRva2Vucywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKipcblx0XHRUb2tlbnMgd2l0aGluIHRoaXMgZ3JvdXAuXG5cdFx0QHR5cGUge0FycmF5PFRva2VuPn1cblx0XHQqL1xuXHRcdHRoaXMuc3ViVG9rZW5zID0gc3ViVG9rZW5zXG5cdFx0LyoqIEB0eXBlIHtHcm91cHN9ICovXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGAke2dyb3VwS2luZFRvTmFtZS5nZXQodGhpcy5raW5kKX1gXG5cdH1cbn1cblxuLyoqXG5BIFwia2V5d29yZFwiIGlzIGFueSBzZXQgb2YgY2hhcmFjdGVycyB3aXRoIGEgcGFydGljdWxhciBtZWFuaW5nLlxuSXQgZG9lbnNuJ3QgbmVjZXNzYXJpbHkgaGF2ZSB0byBiZSBzb21ldGhpbmcgdGhhdCBtaWdodCBoYXZlIGJlZW4gYSB7QGxpbmsgTmFtZX0uXG5Gb3IgZXhhbXBsZSwgc2VlIHtAbGluayBLZXl3b3Jkcy5PYmpFbnRyeX0uXG5cblRoaXMgY2FuIGV2ZW4gaW5jbHVkZSBvbmVzIGxpa2UgYC4gYCAoZGVmaW5lcyBhbiBvYmplY3QgcHJvcGVydHksIGFzIGluIGBrZXkuIHZhbHVlYCkuXG5LaW5kIGlzIGEgKioqLiBTZWUgdGhlIGZ1bGwgbGlzdCBiZWxvdy5cbiovXG5leHBvcnQgY2xhc3MgS2V5d29yZCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7S2V5d29yZHN9ICovXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGNvZGUoa2V5d29yZEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCkpXG5cdH1cbn1cblxuLyoqXG5BbiBpZGVudGlmaWVyLiBVc3VhbGx5IHRoZSBuYW1lIG9mIHNvbWUgbG9jYWwgdmFyaWFibGUgb3IgcHJvcGVydHkuXG5BIE5hbWUgaXMgZ3VhcmFudGVlZCB0byBub3QgYmUgYW55IGtleXdvcmQuXG4qL1xuZXhwb3J0IGNsYXNzIE5hbWUgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gY29kZSh0aGlzLm5hbWUpXG5cdH1cbn1cblxuLyoqXG5Eb2N1bWVudGF0aW9uIGNvbW1lbnQgKGJlZ2lubmluZyB3aXRoIG9uZSBgfGAgcmF0aGVyIHRoYW4gdHdvKS5cbk5vbi1kb2MgY29tbWVudHMgYXJlIGlnbm9yZWQgYnkge0BsaW5rIGxleH0uXG5UaGVzZSBkb24ndCBhZmZlY3Qgb3V0cHV0LCBidXQgYXJlIHBhc3NlZCB0byB2YXJpb3VzIHtAbGluayBNc0FzdH1zIGZvciB1c2UgYnkgb3RoZXIgdG9vbHMuXG4qL1xuZXhwb3J0IGNsYXNzIERvY0NvbW1lbnQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgdGV4dCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHR0aGlzLnRleHQgPSB0ZXh0XG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gJ2RvYyBjb21tZW50J1xuXHR9XG59XG5cbmxldCBuZXh0R3JvdXBLaW5kID0gMFxuY29uc3Rcblx0Z3JvdXBLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRnID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IG5leHRHcm91cEtpbmRcblx0XHRncm91cEtpbmRUb05hbWUuc2V0KGtpbmQsIG5hbWUpXG5cdFx0bmV4dEdyb3VwS2luZCA9IG5leHRHcm91cEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fVxuXG4vKipcbktpbmRzIG9mIHtAbGluayBHcm91cH0uXG5AZW51bSB7bnVtYmVyfVxuKi9cbmV4cG9ydCBjb25zdCBHcm91cHMgPSB7XG5cdC8qKlxuXHRUb2tlbnMgc3Vycm91bmRlZCBieSBwYXJlbnRoZXNlcy5cblx0VGhlcmUgbWF5IGJlIG5vIGNsb3NpbmcgcGFyZW50aGVzaXMuIEluOlxuXG5cdFx0YSAoYlxuXHRcdFx0Y1xuXG5cdFRoZSB0b2tlbnMgYXJlIGEgR3JvdXA8TGluZT4oTmFtZSwgR3JvdXA8UGFyZW50aGVzaXM+KC4uLikpXG5cdCovXG5cdFBhcmVudGhlc2lzOiBnKCcoKScpLFxuXHQvKiogTGlrZSBgUGFyZW50aGVzaXNgLCBidXQgc2ltcGxlciBiZWNhdXNlIHRoZXJlIG11c3QgYmUgYSBjbG9zaW5nIGBdYC4gKi9cblx0QnJhY2tldDogZygnW10nKSxcblx0LyoqXG5cdExpbmVzIGluIGFuIGluZGVudGVkIGJsb2NrLlxuXHRTdWItdG9rZW5zIHdpbGwgYWx3YXlzIGJlIGBMaW5lYCBncm91cHMuXG5cdE5vdGUgdGhhdCBgQmxvY2tgcyBkbyBub3QgYWx3YXlzIG1hcCB0byBCbG9jayogTXNBc3RzLlxuXHQqL1xuXHRCbG9jazogZygnaW5kZW50ZWQgYmxvY2snKSxcblx0LyoqXG5cdFRva2VucyB3aXRoaW4gYSBxdW90ZS5cblx0YHN1YlRva2Vuc2AgbWF5IGJlIHN0cmluZ3MsIG9yIEdfUGFyZW50aGVzaXMgZ3JvdXBzLlxuXHQqL1xuXHRRdW90ZTogZygncXVvdGUnKSxcblx0LyoqXG5cdFRva2VucyBvbiBhIGxpbmUuXG5cdFRoZSBpbmRlbnRlZCBibG9jayBmb2xsb3dpbmcgdGhlIGVuZCBvZiB0aGUgbGluZSBpcyBjb25zaWRlcmVkIHRvIGJlIGEgcGFydCBvZiB0aGUgbGluZSFcblx0VGhpcyBtZWFucyB0aGF0IGluIHRoaXMgY29kZTpcblx0XHRhXG5cdFx0XHRiXG5cdFx0XHRjXG5cdFx0ZFxuXHRUaGVyZSBhcmUgMiBsaW5lcywgb25lIHN0YXJ0aW5nIHdpdGggJ2EnIGFuZCBvbmUgc3RhcnRpbmcgd2l0aCAnZCcuXG5cdFRoZSBmaXJzdCBsaW5lIGNvbnRhaW5zICdhJyBhbmQgYSBgQmxvY2tgIHdoaWNoIGluIHR1cm4gY29udGFpbnMgdHdvIG90aGVyIGxpbmVzLlxuXHQqL1xuXHRMaW5lOiBnKCdsaW5lJyksXG5cdC8qKlxuXHRHcm91cHMgdHdvIG9yIG1vcmUgdG9rZW5zIHRoYXQgYXJlICpub3QqIHNlcGFyYXRlZCBieSBzcGFjZXMuXG5cdGBhW2JdLmNgIGlzIGFuIGV4YW1wbGUuXG5cdEEgc2luZ2xlIHRva2VuIG9uIGl0cyBvd24gd2lsbCBub3QgYmUgZ2l2ZW4gYSBgU3BhY2VgIGdyb3VwLlxuXHQqL1xuXHRTcGFjZTogZygnc3BhY2UnKVxufVxuXG4vKipcbk91dHB1dHRhYmxlIGRlc2NyaXB0aW9uIG9mIGEgZ3JvdXAga2luZC5cbkBwYXJhbSB7R3JvdXBzfSBncm91cEtpbmRcbiovXG5leHBvcnQgZnVuY3Rpb24gc2hvd0dyb3VwS2luZChncm91cEtpbmQpIHtcblx0cmV0dXJuIGdyb3VwS2luZFRvTmFtZS5nZXQoZ3JvdXBLaW5kKVxufVxuXG5sZXQgbmV4dEtleXdvcmRLaW5kID0gMFxuY29uc3Rcblx0a2V5d29yZE5hbWVUb0tpbmQgPSBuZXcgTWFwKCksXG5cdGtleXdvcmRLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRuYW1lS2V5d29yZHMgPSBuZXcgU2V0KCksXG5cdHJlc2VydmVkS2V5d29yZHMgPSBuZXcgU2V0KClcbi8vIFRoZXNlIGtleXdvcmRzIGFyZSBzcGVjaWFsIG5hbWVzLlxuLy8gV2hlbiBsZXhpbmcgYSBuYW1lLCBhIG1hcCBsb29rdXAgaXMgZG9uZSBieSBrZXl3b3JkS2luZEZyb21OYW1lLlxuZnVuY3Rpb24ga3cobmFtZSkge1xuXHRjb25zdCBraW5kID0ga3dOb3ROYW1lKG5hbWUpXG5cdG5hbWVLZXl3b3Jkcy5hZGQoa2luZClcblx0a2V5d29yZE5hbWVUb0tpbmQuc2V0KG5hbWUsIGtpbmQpXG5cdHJldHVybiBraW5kXG59XG4vLyBUaGVzZSBrZXl3b3JkcyBtdXN0IGJlIGxleGVkIHNwZWNpYWxseS5cbmZ1bmN0aW9uIGt3Tm90TmFtZShkZWJ1Z05hbWUpIHtcblx0Y29uc3Qga2luZCA9IG5leHRLZXl3b3JkS2luZFxuXHRrZXl3b3JkS2luZFRvTmFtZS5zZXQoa2luZCwgZGVidWdOYW1lKVxuXHRuZXh0S2V5d29yZEtpbmQgPSBuZXh0S2V5d29yZEtpbmQgKyAxXG5cdHJldHVybiBraW5kXG59XG5mdW5jdGlvbiBrd1Jlc2VydmVkKG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGt3KG5hbWUpXG5cdHJlc2VydmVkS2V5d29yZHMuYWRkKGtpbmQpXG59XG5cbmNvbnN0IHJlc2VydmVkV29yZHMgPSBbXG5cdC8vIEphdmFTY3JpcHQgcmVzZXJ2ZWQgd29yZHNcblx0J2VudW0nLFxuXHQnaW1wbGVtZW50cycsXG5cdCdpbnRlcmZhY2UnLFxuXHQncGFja2FnZScsXG5cdCdwcml2YXRlJyxcblx0J3Byb3RlY3RlZCcsXG5cdCdwdWJsaWMnLFxuXG5cdC8vIEphdmFTY3JpcHQga2V5d29yZHNcblx0J2FyZ3VtZW50cycsXG5cdCdhc3luYycsXG5cdCdhd2FpdCcsXG5cdCdjb25zdCcsXG5cdCdkZWxldGUnLFxuXHQnZXZhbCcsXG5cdCdpbicsXG5cdCdpbnN0YW5jZW9mJyxcblx0J2xldCcsXG5cdCdyZXR1cm4nLFxuXHQndHlwZW9mJyxcblx0J3ZhcicsXG5cdCd2b2lkJyxcblx0J3doaWxlJyxcblxuXHQvLyBNYXNvbiByZXNlcnZlZCB3b3Jkc1xuXHQnIScsXG5cdCdhYnN0cmFjdCcsXG5cdCdhY3RvcicsXG5cdCdhd2FpdCEnLFxuXHQnZGF0YScsXG5cdCdkZWw/Jyxcblx0J2Vsc2UhJyxcblx0J2ZpbmFsJyxcblx0J2lzJyxcblx0J21ldGEnLFxuXHQnb3V0Jyxcblx0J3NlbmQnLFxuXHQnc2VuZCEnLFxuXHQndG8nLFxuXHQndHlwZScsXG5cdCd1bnRpbCcsXG5cdCd1bnRpbCEnLFxuXHQnd2hpbGUhJ1xuXVxuXG5mb3IgKGNvbnN0IG5hbWUgb2YgcmVzZXJ2ZWRXb3Jkcylcblx0a3dSZXNlcnZlZChuYW1lKVxuXG4vKiogS2luZHMgb2Yge0BsaW5rIEtleXdvcmR9LiAqL1xuZXhwb3J0IGNvbnN0IEtleXdvcmRzID0ge1xuXHRBbXBlcnNhbmQ6IGt3Tm90TmFtZSgnJicpLFxuXHRBbmQ6IGt3KCdhbmQnKSxcblx0QXM6IGt3KCdhcycpLFxuXHRBc3NlcnQ6IGt3KCdhc3NlcnQhJyksXG5cdEFzc2VydE5vdDoga3coJ2ZvcmJpZCEnKSxcblx0QXNzaWduOiBrdygnPScpLFxuXHRBc3NpZ25NdXRhYmxlOiBrd05vdE5hbWUoJzo6PScpLFxuXHRMb2NhbE11dGF0ZToga3dOb3ROYW1lKCc6PScpLFxuXHRCcmVhazoga3coJ2JyZWFrIScpLFxuXHRCcmVha1dpdGhWYWw6IGt3KCdicmVhaycpLFxuXHRCdWlsdDoga3coJ2J1aWx0JyksXG5cdENhc2VEbzoga3coJ2Nhc2UhJyksXG5cdENhc2VWYWw6IGt3KCdjYXNlJyksXG5cdENhdGNoRG86IGt3KCdjYXRjaCEnKSxcblx0Q2F0Y2hWYWw6IGt3KCdjYXRjaCcpLFxuXHRDb25kOiBrdygnY29uZCcpLFxuXHRDbGFzczoga3coJ2NsYXNzJyksXG5cdENvbnN0cnVjdDoga3coJ2NvbnN0cnVjdCEnKSxcblx0RGVidWdnZXI6IGt3KCdkZWJ1Z2dlciEnKSxcblx0RGVsRG86IGt3KCdkZWwhJyksXG5cdERlbFZhbDoga3coJ2RlbCcpLFxuXHREbzoga3coJ2RvIScpLFxuXHREb3Q6IGt3Tm90TmFtZSgnLicpLFxuXHREb3QyOiBrd05vdE5hbWUoJy4uJyksXG5cdERvdDM6IGt3Tm90TmFtZSgnLi4uICcpLFxuXHRFbHNlOiBrdygnZWxzZScpLFxuXHRFeGNlcHREbzoga3coJ2V4Y2VwdCEnKSxcblx0RXhjZXB0VmFsOiBrdygnZXhjZXB0JyksXG5cdEZhbHNlOiBrdygnZmFsc2UnKSxcblx0RmluYWxseToga3coJ2ZpbmFsbHkhJyksXG5cdEZvY3VzOiBrdygnXycpLFxuXHRGb3JCYWc6IGt3KCdAZm9yJyksXG5cdEZvckRvOiBrdygnZm9yIScpLFxuXHRGb3JWYWw6IGt3KCdmb3InKSxcblx0RnVuOiBrd05vdE5hbWUoJ3wnKSxcblx0RnVuRG86IGt3Tm90TmFtZSgnIXwnKSxcblx0RnVuVGhpczoga3dOb3ROYW1lKCcufCcpLFxuXHRGdW5UaGlzRG86IGt3Tm90TmFtZSgnLiF8JyksXG5cdEZ1bkFzeW5jOiBrd05vdE5hbWUoJyR8JyksXG5cdEZ1bkFzeW5jRG86IGt3Tm90TmFtZSgnJCF8JyksXG5cdEZ1blRoaXNBc3luYzoga3dOb3ROYW1lKCcuJHwnKSxcblx0RnVuVGhpc0FzeW5jRG86IGt3Tm90TmFtZSgnLiQhfCcpLFxuXHRGdW5HZW46IGt3Tm90TmFtZSgnfnwnKSxcblx0RnVuR2VuRG86IGt3Tm90TmFtZSgnfiF8JyksXG5cdEZ1blRoaXNHZW46IGt3Tm90TmFtZSgnLn58JyksXG5cdEZ1blRoaXNHZW5Ebzoga3dOb3ROYW1lKCcufiF8JyksXG5cdEdldDoga3coJ2dldCcpLFxuXHRJZlZhbDoga3coJ2lmJyksXG5cdElmRG86IGt3KCdpZiEnKSxcblx0SWdub3JlOiBrdygnaWdub3JlJyksXG5cdExhenk6IGt3Tm90TmFtZSgnficpLFxuXHRNYXBFbnRyeToga3coJy0+JyksXG5cdE5hbWU6IGt3KCduYW1lJyksXG5cdE5ldzoga3coJ25ldycpLFxuXHROb3Q6IGt3KCdub3QnKSxcblx0TnVsbDoga3coJ251bGwnKSxcblx0T2JqQXNzaWduOiBrd05vdE5hbWUoJy4gJyksXG5cdE9mOiBrdygnb2YnKSxcblx0T3I6IGt3KCdvcicpLFxuXHRQYXNzOiBrdygncGFzcycpLFxuXHRSZWdpb246IGt3KCdyZWdpb24nKSxcblx0U2V0OiBrdygnc2V0IScpLFxuXHRTdXBlckRvOiBrdygnc3VwZXIhJyksXG5cdFN1cGVyVmFsOiBrdygnc3VwZXInKSxcblx0U3RhdGljOiBrdygnc3RhdGljJyksXG5cdFN3aXRjaERvOiBrdygnc3dpdGNoIScpLFxuXHRTd2l0Y2hWYWw6IGt3KCdzd2l0Y2gnKSxcblx0VGljazoga3dOb3ROYW1lKCdcXCcnKSxcblx0VGhyb3c6IGt3KCd0aHJvdyEnKSxcblx0VG9kbzoga3coJ3RvZG8nKSxcblx0VHJ1ZToga3coJ3RydWUnKSxcblx0VHJ5RG86IGt3KCd0cnkhJyksXG5cdFRyeVZhbDoga3coJ3RyeScpLFxuXHRUeXBlOiBrd05vdE5hbWUoJzonKSxcblx0VW5kZWZpbmVkOiBrdygndW5kZWZpbmVkJyksXG5cdFVubGVzc1ZhbDoga3coJ3VubGVzcycpLFxuXHRVbmxlc3NEbzoga3coJ3VubGVzcyEnKSxcblx0SW1wb3J0OiBrdygnaW1wb3J0JyksXG5cdEltcG9ydERvOiBrdygnaW1wb3J0IScpLFxuXHRJbXBvcnRMYXp5OiBrdygnaW1wb3J0ficpLFxuXHRXaXRoOiBrdygnd2l0aCcpLFxuXHRZaWVsZDoga3coJzx+JyksXG5cdFlpZWxkVG86IGt3KCc8fn4nKVxufVxuXG4vKipcbk5hbWUgb2YgYSBrZXl3b3JkLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2luZFxuQHJldHVybiB7c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXl3b3JkTmFtZShraW5kKSB7XG5cdHJldHVybiBrZXl3b3JkS2luZFRvTmFtZS5nZXQoa2luZClcbn1cblxuLyoqXG5TZWUgaWYgdGhlIG5hbWUgaXMgYSBrZXl3b3JkIGFuZCBpZiBzbyByZXR1cm4gaXRzIGtpbmQuXG5AcmV0dXJuIHs/S2V5d29yZHN9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG9wS2V5d29yZEtpbmRGcm9tTmFtZShuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrZXl3b3JkTmFtZVRvS2luZC5nZXQobmFtZSlcblx0cmV0dXJuIGtpbmQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBraW5kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kKGtpbmQpIHtcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GYWxzZTpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5GYWxzZVxuXHRcdGNhc2UgS2V5d29yZHMuTmFtZTpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OYW1lXG5cdFx0Y2FzZSBLZXl3b3Jkcy5OdWxsOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLk51bGxcblx0XHRjYXNlIEtleXdvcmRzLlRydWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuVHJ1ZVxuXHRcdGNhc2UgS2V5d29yZHMuVW5kZWZpbmVkOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlVuZGVmaW5lZFxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgR3JvdXAgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0dyb3Vwc30gZ3JvdXBLaW5kXG5AcGFyYW0ge1Rva2VufSB0b2tlblxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0dyb3VwKGdyb3VwS2luZCwgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgR3JvdXAgJiYgdG9rZW4ua2luZCA9PT0gZ3JvdXBLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiB0aGUgZ2l2ZW4ga2luZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtleXdvcmRLaW5kXG5AcGFyYW0ge1Rva2VufSB0b2tlblxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0tleXdvcmQoa2V5d29yZEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYgdG9rZW4ua2luZCA9PT0ga2V5d29yZEtpbmRcbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIG9mIGFueSBvZiB0aGUgZ2l2ZW4ga2luZHMuXG5AcGFyYW0ge1NldH0ga2V5d29yZEtpbmRzXG5AcGFyYW0ge1Rva2VufSB0b2tlblxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FueUtleXdvcmQoa2V5d29yZEtpbmRzLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIGtleXdvcmRLaW5kcy5oYXModG9rZW4ua2luZClcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgd2hvc2UgdmFsdWUgY2FuIGJlIHVzZWQgYXMgYSBwcm9wZXJ0eSBuYW1lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZUtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChuYW1lS2V5d29yZHMsIHRva2VuKVxufVxuXG4vKiogV2hldGhlciBgdG9rZW5gIGlzIGEgcmVzZXJ2ZWQgd29yZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jlc2VydmVkS2V5d29yZCh0b2tlbikge1xuXHRyZXR1cm4gaXNBbnlLZXl3b3JkKHJlc2VydmVkS2V5d29yZHMsIHRva2VuKVxufVxuIl19
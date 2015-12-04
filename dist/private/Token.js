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
	exports.Keywords = exports.reservedKeywords = exports.Groups = exports.DocComment = exports.Name = exports.Keyword = exports.Group = undefined;
	exports.showGroupKind = showGroupKind;
	exports.keywordName = keywordName;
	exports.showKeyword = showKeyword;
	exports.showGroup = showGroup;
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
			return groupName(this.kind);
		}

	}

	exports.Group = Group;

	class Keyword extends Token {
		constructor(loc, kind) {
			super(loc);
			this.kind = kind;
		}

		toString() {
			return showKeyword(this.kind);
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
		Space: g('space'),
		/**
  Tokens within a quote.
  `subTokens` may be plain strings, Names (for `#foo`), or Interpolation groups (for `#(0)`).
  */
		Quote: g('quote'),
		/**
  Tokens within a RegExp.
  `subTokens` are same as for Quote.
  */
		RegExp: g('regexp'),
		/** Interpolated tokens in a Quote or RegExp using `#()`. */
		Interpolation: g('interpolation')
	};

	function showGroupKind(groupKind) {
		return groupKindToName.get(groupKind);
	}

	let nextKeywordKind = 0;
	const keywordNameToKind = new Map(),
	      keywordKindToName = new Map(),
	      nameKeywords = new Set();

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

	const reservedKeywords = exports.reservedKeywords = [
	// JavaScript reserved words
	'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public',

	// JavaScript keywords
	'arguments', 'delete', 'eval', 'in', 'instanceof', 'return', 'typeof', 'void', 'while',

	// Mason reserved words
	'!', '<', '<-', '>', 'actor', 'data', 'del?', 'do-while', 'do-until', 'final', 'is', 'meta', 'out', 'override', 'send', 'to', 'type', 'until'];

	for (const name of reservedKeywords) kw(name);

	const firstNonReservedKeyword = nextKeywordKind;
	const Keywords = exports.Keywords = {
		Abstract: kw('abstract'),
		Ampersand: kwNotName('&'),
		And: kw('and'),
		As: kw('as'),
		Assert: kw('assert'),
		Assign: kw('='),
		Await: kw('$'),
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
		Yield: kw('yield'),
		YieldTo: kw('yield*')
	};

	function keywordName(kind) {
		return keywordKindToName.get(kind);
	}

	function groupName(kind) {
		return groupKindToName.get(kind);
	}

	function showKeyword(kind) {
		return (0, _CompileError.code)(keywordName(kind));
	}

	function showGroup(kind) {
		return (0, _CompileError.code)(groupName(kind));
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
		return token instanceof Keyword && token.kind < firstNonReservedKeyword;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FzS2dCLGFBQWEsR0FBYixhQUFhO1NBK0piLFdBQVcsR0FBWCxXQUFXO1NBUVgsV0FBVyxHQUFYLFdBQVc7U0FJWCxTQUFTLEdBQVQsU0FBUztTQVFULHFCQUFxQixHQUFyQixxQkFBcUI7U0FLckIsK0JBQStCLEdBQS9CLCtCQUErQjtTQXNCL0IsT0FBTyxHQUFQLE9BQU87U0FTUCxTQUFTLEdBQVQsU0FBUztTQVNULFlBQVksR0FBWixZQUFZO1NBS1osYUFBYSxHQUFiLGFBQWE7U0FLYixpQkFBaUIsR0FBakIsaUJBQWlCOztPQWhZWixLQUFLOzs7Ozs7O21CQUFMLEtBQUs7O09BVWIsS0FBSzs7Ozs7Ozs7Ozs7OztTQUFMLEtBQUssR0FBTCxLQUFLOztPQTBCTCxPQUFPOzs7Ozs7Ozs7Ozs7U0FBUCxPQUFPLEdBQVAsT0FBTzs7T0FnQlAsSUFBSTs7Ozs7Ozs7Ozs7O1NBQUosSUFBSSxHQUFKLElBQUk7O09BaUJKLFVBQVU7Ozs7Ozs7Ozs7OztTQUFWLFVBQVUsR0FBVixVQUFVOzs7Ozs7Ozs7OztPQTBCVixNQUFNLFdBQU4sTUFBTSxHQUFHOzs7Ozs7OztBQVVyQixhQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQzs7QUFFcEIsU0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7Ozs7OztBQU1oQixPQUFLLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7QUFZMUIsTUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7Ozs7OztBQU1mLE9BQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDOzs7OztBQUtqQixPQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQzs7Ozs7QUFLakIsUUFBTSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7O0FBRW5CLGVBQWEsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFD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Q0FBQztBQUNsQixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixNQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQztBQUNyQixPQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNsQixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixLQUFHLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNkLFdBQVMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzFCLFFBQU0sRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDO0FBQ3BCLFFBQU0sRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDO0FBQ3BCLFVBQVEsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDO0FBQ3ZCLFlBQVUsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDO0FBQ3pCLE1BQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ2hCLE9BQUssRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ2xCLFNBQU8sRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDO0VBQ3JCOztVQU9lLFdBQVc7Ozs7Ozs7O1VBUVgsV0FBVzs7OztVQUlYLFNBQVM7Ozs7VUFRVCxxQkFBcUI7Ozs7O1VBS3JCLCtCQUErQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQXNCL0IsT0FBTzs7OztVQVNQLFNBQVM7Ozs7VUFTVCxZQUFZOzs7O1VBS1osYUFBYTs7OztVQUtiLGlCQUFpQiIsImZpbGUiOiJUb2tlbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtTcGVjaWFsVmFsc30gZnJvbSAnLi9Nc0FzdCdcblxuLyoqXG5MZXhlZCBlbGVtZW50IGluIGEgdHJlZSBvZiBUb2tlbnMuXG5cblNpbmNlIHtAbGluayBsZXh9IGRvZXMgZ3JvdXBpbmcsIHtAbGluayBwYXJzZX0gYXZvaWRzIGRvaW5nIG11Y2ggb2YgdGhlIHdvcmsgcGFyc2VycyB1c3VhbGx5IGRvO1xuaXQgZG9lc24ndCBoYXZlIHRvIGhhbmRsZSBhIFwibGVmdCBwYXJlbnRoZXNpc1wiLCBvbmx5IGEge0BsaW5rIEdyb3VwfSBvZiBraW5kIEdfUGFyZW50aGVzaXMuXG5UaGlzIGFsc28gbWVhbnMgdGhhdCB0aGUgbWFueSBkaWZmZXJlbnQge0BsaW5rIE1zQXN0fSB0eXBlcyBhbGwgcGFyc2UgaW4gYSBzaW1pbGFyIG1hbm5lcixcbmtlZXBpbmcgdGhlIGxhbmd1YWdlIGNvbnNpc3RlbnQuXG5cbkJlc2lkZXMge0BsaW5rIEdyb3VwfSwge0BsaW5rIEtleXdvcmR9LCB7QGxpbmsgTmFtZX0sIGFuZCB7QGxpbmsgRG9jQ29tbWVudH0sXG57QGxpbmsgTnVtYmVyTGl0ZXJhbH0gdmFsdWVzIGFyZSBhbHNvIHRyZWF0ZWQgYXMgVG9rZW5zLlxuXG5AYWJzdHJhY3RcbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cbn1cblxuLyoqXG5Db250YWlucyBtdWx0aXBsZSBzdWItdG9rZW5zLlxuU2VlIHtAbGluayBHcm91cEtpbmR9IGZvciBleHBsYW5hdGlvbnMuXG4qL1xuZXhwb3J0IGNsYXNzIEdyb3VwIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHN1YlRva2Vucywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKipcblx0XHRUb2tlbnMgd2l0aGluIHRoaXMgZ3JvdXAuXG5cdFx0QHR5cGUge0FycmF5PFRva2VuPn1cblx0XHQqL1xuXHRcdHRoaXMuc3ViVG9rZW5zID0gc3ViVG9rZW5zXG5cdFx0LyoqIEB0eXBlIHtHcm91cHN9ICovXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHRcdC8vIGlmIHRoaXMua2luZCA9PT0gR3JvdXBzLlJlZ0V4cCwgdGhpcyB3aWxsIGFsc28gYmUgZ2l2ZW4gYSBgZmxhZ3NgIGZpZWxkLlxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGdyb3VwTmFtZSh0aGlzLmtpbmQpXG5cdH1cbn1cblxuLyoqXG5BIFwia2V5d29yZFwiIGlzIGFueSBzZXQgb2YgY2hhcmFjdGVycyB3aXRoIGEgcGFydGljdWxhciBtZWFuaW5nLlxuSXQgZG9lbnNuJ3QgbmVjZXNzYXJpbHkgaGF2ZSB0byBiZSBzb21ldGhpbmcgdGhhdCBtaWdodCBoYXZlIGJlZW4gYSB7QGxpbmsgTmFtZX0uXG5Gb3IgZXhhbXBsZSwgc2VlIHtAbGluayBLZXl3b3Jkcy5PYmpFbnRyeX0uXG5cblRoaXMgY2FuIGV2ZW4gaW5jbHVkZSBvbmVzIGxpa2UgYC4gYCAoZGVmaW5lcyBhbiBvYmplY3QgcHJvcGVydHksIGFzIGluIGBrZXkuIHZhbHVlYCkuXG5LaW5kIGlzIGEgKioqLiBTZWUgdGhlIGZ1bGwgbGlzdCBiZWxvdy5cbiovXG5leHBvcnQgY2xhc3MgS2V5d29yZCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7S2V5d29yZHN9ICovXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHNob3dLZXl3b3JkKHRoaXMua2luZClcblx0fVxufVxuXG4vKipcbkFuIGlkZW50aWZpZXIuIFVzdWFsbHkgdGhlIG5hbWUgb2Ygc29tZSBsb2NhbCB2YXJpYWJsZSBvciBwcm9wZXJ0eS5cbkEgTmFtZSBpcyBndWFyYW50ZWVkIHRvIG5vdCBiZSBhbnkga2V5d29yZC5cbiovXG5leHBvcnQgY2xhc3MgTmFtZSBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBuYW1lKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKHRoaXMubmFtZSlcblx0fVxufVxuXG4vKipcbkRvY3VtZW50YXRpb24gY29tbWVudCAoYmVnaW5uaW5nIHdpdGggb25lIGB8YCByYXRoZXIgdGhhbiB0d28pLlxuTm9uLWRvYyBjb21tZW50cyBhcmUgaWdub3JlZCBieSB7QGxpbmsgbGV4fS5cblRoZXNlIGRvbid0IGFmZmVjdCBvdXRwdXQsIGJ1dCBhcmUgcGFzc2VkIHRvIHZhcmlvdXMge0BsaW5rIE1zQXN0fXMgZm9yIHVzZSBieSBvdGhlciB0b29scy5cbiovXG5leHBvcnQgY2xhc3MgRG9jQ29tbWVudCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCB0ZXh0KSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdHRoaXMudGV4dCA9IHRleHRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiAnZG9jIGNvbW1lbnQnXG5cdH1cbn1cblxubGV0IG5leHRHcm91cEtpbmQgPSAwXG5jb25zdFxuXHRncm91cEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdGcgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEdyb3VwS2luZFxuXHRcdGdyb3VwS2luZFRvTmFtZS5zZXQoa2luZCwgbmFtZSlcblx0XHRuZXh0R3JvdXBLaW5kID0gbmV4dEdyb3VwS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9XG5cbi8qKlxuS2luZHMgb2Yge0BsaW5rIEdyb3VwfS5cbkBlbnVtIHtudW1iZXJ9XG4qL1xuZXhwb3J0IGNvbnN0IEdyb3VwcyA9IHtcblx0LyoqXG5cdFRva2VucyBzdXJyb3VuZGVkIGJ5IHBhcmVudGhlc2VzLlxuXHRUaGVyZSBtYXkgYmUgbm8gY2xvc2luZyBwYXJlbnRoZXNpcy4gSW46XG5cblx0XHRhIChiXG5cdFx0XHRjXG5cblx0VGhlIHRva2VucyBhcmUgYSBHcm91cDxMaW5lPihOYW1lLCBHcm91cDxQYXJlbnRoZXNpcz4oLi4uKSlcblx0Ki9cblx0UGFyZW50aGVzaXM6IGcoJygpJyksXG5cdC8qKiBMaWtlIGBQYXJlbnRoZXNpc2AsIGJ1dCBzaW1wbGVyIGJlY2F1c2UgdGhlcmUgbXVzdCBiZSBhIGNsb3NpbmcgYF1gLiAqL1xuXHRCcmFja2V0OiBnKCdbXScpLFxuXHQvKipcblx0TGluZXMgaW4gYW4gaW5kZW50ZWQgYmxvY2suXG5cdFN1Yi10b2tlbnMgd2lsbCBhbHdheXMgYmUgYExpbmVgIGdyb3Vwcy5cblx0Tm90ZSB0aGF0IGBCbG9ja2BzIGRvIG5vdCBhbHdheXMgbWFwIHRvIEJsb2NrKiBNc0FzdHMuXG5cdCovXG5cdEJsb2NrOiBnKCdpbmRlbnRlZCBibG9jaycpLFxuXHQvKipcblx0VG9rZW5zIG9uIGEgbGluZS5cblx0VGhlIGluZGVudGVkIGJsb2NrIGZvbGxvd2luZyB0aGUgZW5kIG9mIHRoZSBsaW5lIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBwYXJ0IG9mIHRoZSBsaW5lIVxuXHRUaGlzIG1lYW5zIHRoYXQgaW4gdGhpcyBjb2RlOlxuXHRcdGFcblx0XHRcdGJcblx0XHRcdGNcblx0XHRkXG5cdFRoZXJlIGFyZSAyIGxpbmVzLCBvbmUgc3RhcnRpbmcgd2l0aCAnYScgYW5kIG9uZSBzdGFydGluZyB3aXRoICdkJy5cblx0VGhlIGZpcnN0IGxpbmUgY29udGFpbnMgJ2EnIGFuZCBhIGBCbG9ja2Agd2hpY2ggaW4gdHVybiBjb250YWlucyB0d28gb3RoZXIgbGluZXMuXG5cdCovXG5cdExpbmU6IGcoJ2xpbmUnKSxcblx0LyoqXG5cdEdyb3VwcyB0d28gb3IgbW9yZSB0b2tlbnMgdGhhdCBhcmUgKm5vdCogc2VwYXJhdGVkIGJ5IHNwYWNlcy5cblx0YGFbYl0uY2AgaXMgYW4gZXhhbXBsZS5cblx0QSBzaW5nbGUgdG9rZW4gb24gaXRzIG93biB3aWxsIG5vdCBiZSBnaXZlbiBhIGBTcGFjZWAgZ3JvdXAuXG5cdCovXG5cdFNwYWNlOiBnKCdzcGFjZScpLFxuXHQvKipcblx0VG9rZW5zIHdpdGhpbiBhIHF1b3RlLlxuXHRgc3ViVG9rZW5zYCBtYXkgYmUgcGxhaW4gc3RyaW5ncywgTmFtZXMgKGZvciBgI2Zvb2ApLCBvciBJbnRlcnBvbGF0aW9uIGdyb3VwcyAoZm9yIGAjKDApYCkuXG5cdCovXG5cdFF1b3RlOiBnKCdxdW90ZScpLFxuXHQvKipcblx0VG9rZW5zIHdpdGhpbiBhIFJlZ0V4cC5cblx0YHN1YlRva2Vuc2AgYXJlIHNhbWUgYXMgZm9yIFF1b3RlLlxuXHQqL1xuXHRSZWdFeHA6IGcoJ3JlZ2V4cCcpLFxuXHQvKiogSW50ZXJwb2xhdGVkIHRva2VucyBpbiBhIFF1b3RlIG9yIFJlZ0V4cCB1c2luZyBgIygpYC4gKi9cblx0SW50ZXJwb2xhdGlvbjogZygnaW50ZXJwb2xhdGlvbicpXG59XG5cbi8qKlxuT3V0cHV0dGFibGUgZGVzY3JpcHRpb24gb2YgYSBncm91cCBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93R3JvdXBLaW5kKGdyb3VwS2luZCkge1xuXHRyZXR1cm4gZ3JvdXBLaW5kVG9OYW1lLmdldChncm91cEtpbmQpXG59XG5cbmxldCBuZXh0S2V5d29yZEtpbmQgPSAwXG5jb25zdFxuXHRrZXl3b3JkTmFtZVRvS2luZCA9IG5ldyBNYXAoKSxcblx0a2V5d29yZEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdG5hbWVLZXl3b3JkcyA9IG5ldyBTZXQoKVxuXG4vLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cbi8vIFdoZW4gbGV4aW5nIGEgbmFtZSwgYSBtYXAgbG9va3VwIGlzIGRvbmUgYnkga2V5d29yZEtpbmRGcm9tTmFtZS5cbmZ1bmN0aW9uIGt3KG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGt3Tm90TmFtZShuYW1lKVxuXHRuYW1lS2V5d29yZHMuYWRkKGtpbmQpXG5cdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCBraW5kKVxuXHRyZXR1cm4ga2luZFxufVxuLy8gVGhlc2Uga2V5d29yZHMgbXVzdCBiZSBsZXhlZCBzcGVjaWFsbHkuXG5mdW5jdGlvbiBrd05vdE5hbWUoZGVidWdOYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBuZXh0S2V5d29yZEtpbmRcblx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0bmV4dEtleXdvcmRLaW5kID0gbmV4dEtleXdvcmRLaW5kICsgMVxuXHRyZXR1cm4ga2luZFxufVxuXG4vLyBVc2VkIGJ5IGluZm8uanNcbmV4cG9ydCBjb25zdCByZXNlcnZlZEtleXdvcmRzID0gW1xuXHQvLyBKYXZhU2NyaXB0IHJlc2VydmVkIHdvcmRzXG5cdCdlbnVtJyxcblx0J2ltcGxlbWVudHMnLFxuXHQnaW50ZXJmYWNlJyxcblx0J3BhY2thZ2UnLFxuXHQncHJpdmF0ZScsXG5cdCdwcm90ZWN0ZWQnLFxuXHQncHVibGljJyxcblxuXHQvLyBKYXZhU2NyaXB0IGtleXdvcmRzXG5cdCdhcmd1bWVudHMnLFxuXHQnZGVsZXRlJyxcblx0J2V2YWwnLFxuXHQnaW4nLFxuXHQnaW5zdGFuY2VvZicsXG5cdCdyZXR1cm4nLFxuXHQndHlwZW9mJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIE1hc29uIHJlc2VydmVkIHdvcmRzXG5cdCchJyxcblx0JzwnLFxuXHQnPC0nLFxuXHQnPicsXG5cdCdhY3RvcicsXG5cdCdkYXRhJyxcblx0J2RlbD8nLFxuXHQnZG8td2hpbGUnLFxuXHQnZG8tdW50aWwnLFxuXHQnZmluYWwnLFxuXHQnaXMnLFxuXHQnbWV0YScsXG5cdCdvdXQnLFxuXHQnb3ZlcnJpZGUnLFxuXHQnc2VuZCcsXG5cdCd0bycsXG5cdCd0eXBlJyxcblx0J3VudGlsJ1xuXVxuZm9yIChjb25zdCBuYW1lIG9mIHJlc2VydmVkS2V5d29yZHMpXG5cdGt3KG5hbWUpXG5jb25zdCBmaXJzdE5vblJlc2VydmVkS2V5d29yZCA9IG5leHRLZXl3b3JkS2luZFxuXG4vKiogS2luZHMgb2Yge0BsaW5rIEtleXdvcmR9LiAqL1xuZXhwb3J0IGNvbnN0IEtleXdvcmRzID0ge1xuXHRBYnN0cmFjdDoga3coJ2Fic3RyYWN0JyksXG5cdEFtcGVyc2FuZDoga3dOb3ROYW1lKCcmJyksXG5cdEFuZDoga3coJ2FuZCcpLFxuXHRBczoga3coJ2FzJyksXG5cdEFzc2VydDoga3coJ2Fzc2VydCcpLFxuXHRBc3NpZ246IGt3KCc9JyksXG5cdEF3YWl0OiBrdygnJCcpLFxuXHRMb2NhbE11dGF0ZToga3dOb3ROYW1lKCc6PScpLFxuXHRCcmVhazoga3coJ2JyZWFrJyksXG5cdEJ1aWx0OiBrdygnYnVpbHQnKSxcblx0Q2FzZToga3coJ2Nhc2UnKSxcblx0Q2F0Y2g6IGt3KCdjYXRjaCcpLFxuXHRDb25kOiBrdygnY29uZCcpLFxuXHRDbGFzczoga3coJ2NsYXNzJyksXG5cdENvbG9uOiBrd05vdE5hbWUoJzonKSxcblx0Q29uc3RydWN0OiBrdygnY29uc3RydWN0JyksXG5cdERlYnVnZ2VyOiBrdygnZGVidWdnZXInKSxcblx0RGVsOiBrdygnZGVsJyksXG5cdERvOiBrdygnZG8nKSxcblx0RG90OiBrd05vdE5hbWUoJy4nKSxcblx0RG90Mjoga3dOb3ROYW1lKCcuLicpLFxuXHREb3QzOiBrd05vdE5hbWUoJy4uLiAnKSxcblx0RWxzZToga3coJ2Vsc2UnKSxcblx0RXhjZXB0OiBrdygnZXhjZXB0JyksXG5cdEZhbHNlOiBrdygnZmFsc2UnKSxcblx0RmluYWxseToga3coJ2ZpbmFsbHknKSxcblx0Rm9jdXM6IGt3KCdfJyksXG5cdEZvcjoga3coJ2ZvcicpLFxuXHRGb3JBc3luYzoga3coJyRmb3InKSxcblx0Rm9yQmFnOiBrdygnQGZvcicpLFxuXHRGb3JiaWQ6IGt3KCdmb3JiaWQnKSxcblx0RnVuOiBrd05vdE5hbWUoJ3wnKSxcblx0RnVuRG86IGt3Tm90TmFtZSgnIXwnKSxcblx0RnVuVGhpczoga3dOb3ROYW1lKCcufCcpLFxuXHRGdW5UaGlzRG86IGt3Tm90TmFtZSgnLiF8JyksXG5cdEZ1bkFzeW5jOiBrd05vdE5hbWUoJyR8JyksXG5cdEZ1bkFzeW5jRG86IGt3Tm90TmFtZSgnJCF8JyksXG5cdEZ1blRoaXNBc3luYzoga3dOb3ROYW1lKCcuJHwnKSxcblx0RnVuVGhpc0FzeW5jRG86IGt3Tm90TmFtZSgnLiQhfCcpLFxuXHRGdW5HZW46IGt3Tm90TmFtZSgnKnwnKSxcblx0RnVuR2VuRG86IGt3Tm90TmFtZSgnKiF8JyksXG5cdEZ1blRoaXNHZW46IGt3Tm90TmFtZSgnLip8JyksXG5cdEZ1blRoaXNHZW5Ebzoga3dOb3ROYW1lKCcuKiF8JyksXG5cdEdldDoga3coJ2dldCcpLFxuXHRJZjoga3coJ2lmJyksXG5cdElnbm9yZToga3coJ2lnbm9yZScpLFxuXHRLaW5kOiBrdygna2luZCcpLFxuXHRMYXp5OiBrd05vdE5hbWUoJ34nKSxcblx0TWFwRW50cnk6IGt3KCctPicpLFxuXHRNZXRob2Q6IGt3KCdtZXRob2QnKSxcblx0TXk6IGt3KCdteScpLFxuXHROYW1lOiBrdygnbmFtZScpLFxuXHROZXc6IGt3KCduZXcnKSxcblx0Tm90OiBrdygnbm90JyksXG5cdE51bGw6IGt3KCdudWxsJyksXG5cdE9iakFzc2lnbjoga3dOb3ROYW1lKCcuICcpLFxuXHRPZjoga3coJ29mJyksXG5cdE9yOiBrdygnb3InKSxcblx0UGFzczoga3coJ3Bhc3MnKSxcblx0UGlwZToga3coJ3BpcGUnKSxcblx0UmVnaW9uOiBrdygncmVnaW9uJyksXG5cdFNldDoga3coJ3NldCcpLFxuXHRTdXBlcjoga3coJ3N1cGVyJyksXG5cdFN0YXRpYzoga3coJ3N0YXRpYycpLFxuXHRTd2l0Y2g6IGt3KCdzd2l0Y2gnKSxcblx0VGljazoga3dOb3ROYW1lKCdcXCcnKSxcblx0VGhyb3c6IGt3KCd0aHJvdycpLFxuXHRUb2RvOiBrdygndG9kbycpLFxuXHRUcnVlOiBrdygndHJ1ZScpLFxuXHRUcnk6IGt3KCd0cnknKSxcblx0VW5kZWZpbmVkOiBrdygndW5kZWZpbmVkJyksXG5cdFVubGVzczoga3coJ3VubGVzcycpLFxuXHRJbXBvcnQ6IGt3KCdpbXBvcnQnKSxcblx0SW1wb3J0RG86IGt3KCdpbXBvcnQhJyksXG5cdEltcG9ydExhenk6IGt3KCdpbXBvcnR+JyksXG5cdFdpdGg6IGt3KCd3aXRoJyksXG5cdFlpZWxkOiBrdygneWllbGQnKSxcblx0WWllbGRUbzoga3coJ3lpZWxkKicpXG59XG5cbi8qKlxuTmFtZSBvZiBhIGtleXdvcmQuXG5AcGFyYW0ge0tleXdvcmRzfSBraW5kXG5AcmV0dXJuIHtzdHJpbmd9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGtleXdvcmROYW1lKGtpbmQpIHtcblx0cmV0dXJuIGtleXdvcmRLaW5kVG9OYW1lLmdldChraW5kKVxufVxuXG5mdW5jdGlvbiBncm91cE5hbWUoa2luZCkge1xuXHRyZXR1cm4gZ3JvdXBLaW5kVG9OYW1lLmdldChraW5kKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0tleXdvcmQoa2luZCkge1xuXHRyZXR1cm4gY29kZShrZXl3b3JkTmFtZShraW5kKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dHcm91cChraW5kKSB7XG5cdHJldHVybiBjb2RlKGdyb3VwTmFtZShraW5kKSlcbn1cblxuLyoqXG5TZWUgaWYgdGhlIG5hbWUgaXMgYSBrZXl3b3JkIGFuZCBpZiBzbyByZXR1cm4gaXRzIGtpbmQuXG5AcmV0dXJuIHs/S2V5d29yZHN9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG9wS2V5d29yZEtpbmRGcm9tTmFtZShuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrZXl3b3JkTmFtZVRvS2luZC5nZXQobmFtZSlcblx0cmV0dXJuIGtpbmQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBraW5kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kVG9TcGVjaWFsVmFsdWVLaW5kKGtpbmQpIHtcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GYWxzZTpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5GYWxzZVxuXHRcdGNhc2UgS2V5d29yZHMuTmFtZTpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OYW1lXG5cdFx0Y2FzZSBLZXl3b3Jkcy5OdWxsOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLk51bGxcblx0XHRjYXNlIEtleXdvcmRzLlRydWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuVHJ1ZVxuXHRcdGNhc2UgS2V5d29yZHMuVW5kZWZpbmVkOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlVuZGVmaW5lZFxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgR3JvdXAgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0dyb3Vwc30gZ3JvdXBLaW5kXG5AcGFyYW0ge1Rva2VufSB0b2tlblxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0dyb3VwKGdyb3VwS2luZCwgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgR3JvdXAgJiYgdG9rZW4ua2luZCA9PT0gZ3JvdXBLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiB0aGUgZ2l2ZW4ga2luZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtleXdvcmRLaW5kXG5AcGFyYW0ge1Rva2VufSB0b2tlblxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0tleXdvcmQoa2V5d29yZEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYgdG9rZW4ua2luZCA9PT0ga2V5d29yZEtpbmRcbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIG9mIGFueSBvZiB0aGUgZ2l2ZW4ga2luZHMuXG5AcGFyYW0ge1NldH0ga2V5d29yZEtpbmRzXG5AcGFyYW0ge1Rva2VufSB0b2tlblxuKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FueUtleXdvcmQoa2V5d29yZEtpbmRzLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIGtleXdvcmRLaW5kcy5oYXModG9rZW4ua2luZClcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgd2hvc2UgdmFsdWUgY2FuIGJlIHVzZWQgYXMgYSBwcm9wZXJ0eSBuYW1lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZUtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChuYW1lS2V5d29yZHMsIHRva2VuKVxufVxuXG4vKiogV2hldGhlciBgdG9rZW5gIGlzIGEgcmVzZXJ2ZWQgd29yZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jlc2VydmVkS2V5d29yZCh0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPCBmaXJzdE5vblJlc2VydmVkS2V5d29yZFxufVxuIl19
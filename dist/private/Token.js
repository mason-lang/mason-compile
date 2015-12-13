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
		Extends: kw('extends'),
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
		Lazy: kwNotName('~'),
		MapEntry: kw('->'),
		Method: kw('method'),
		My: kw('my'),
		Name: kw('name'),
		New: kw('new'),
		Not: kw('not'),
		Null: kw('null'),
		// Also works as BagEntry
		ObjEntry: kwNotName('. '),
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
		Trait: kw('trait'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FzS2dCLGFBQWEsR0FBYixhQUFhO1NBaUtiLFdBQVcsR0FBWCxXQUFXO1NBUVgsV0FBVyxHQUFYLFdBQVc7U0FJWCxTQUFTLEdBQVQsU0FBUztTQVFULHFCQUFxQixHQUFyQixxQkFBcUI7U0FLckIsK0JBQStCLEdBQS9CLCtCQUErQjtTQXNCL0IsT0FBTyxHQUFQLE9BQU87U0FTUCxTQUFTLEdBQVQsU0FBUztTQVNULFlBQVksR0FBWixZQUFZO1NBS1osYUFBYSxHQUFiLGFBQWE7U0FLYixpQkFBaUIsR0FBakIsaUJBQWlCOztPQWxZWixLQUFLOzs7Ozs7O21CQUFMLEtBQUs7O09BVWIsS0FBSzs7Ozs7Ozs7Ozs7OztTQUFMLEtBQUssR0FBTCxLQUFLOztPQTBCTCxPQUFPOzs7Ozs7Ozs7Ozs7U0FBUCxPQUFPLEdBQVAsT0FBTzs7T0FnQlAsSUFBSTs7Ozs7Ozs7Ozs7O1NBQUosSUFBSSxHQUFKLElBQUk7O09BaUJKLFVBQVU7Ozs7Ozs7Ozs7OztTQUFWLFVBQVUsR0FBVixVQUFVOzs7Ozs7Ozs7OztPQTBCVixNQUFNLFdBQU4sTUFBTSxHQUFHOzs7Ozs7OztBQVVyQixhQUFXLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQzs7QUFFcEIsU0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7Ozs7OztBQU1oQixPQUFLLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7QUFZMUIsTUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7Ozs7OztBQU1mLE9BQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDOzs7OztBQUtqQixPQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQzs7Ozs7QUFLakIsUUFBTSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7O0FBRW5CLGVBQWEsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFD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LENBQUM7QUFDbEIsUUFBTSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDcEIsUUFBTSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDcEIsTUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDckIsT0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDbEIsTUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDaEIsT0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDbEIsTUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDaEIsS0FBRyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDZCxXQUFTLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQztBQUMxQixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixVQUFRLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN2QixZQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN6QixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixPQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNsQixTQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztFQUNyQjs7VUFPZSxXQUFXOzs7Ozs7OztVQVFYLFdBQVc7Ozs7VUFJWCxTQUFTOzs7O1VBUVQscUJBQXFCOzs7OztVQUtyQiwrQkFBK0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFzQi9CLE9BQU87Ozs7VUFTUCxTQUFTOzs7O1VBU1QsWUFBWTs7OztVQUtaLGFBQWE7Ozs7VUFLYixpQkFBaUIiLCJmaWxlIjoiVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7U3BlY2lhbFZhbHN9IGZyb20gJy4vTXNBc3QnXG5cbi8qKlxuTGV4ZWQgZWxlbWVudCBpbiBhIHRyZWUgb2YgVG9rZW5zLlxuXG5TaW5jZSB7QGxpbmsgbGV4fSBkb2VzIGdyb3VwaW5nLCB7QGxpbmsgcGFyc2V9IGF2b2lkcyBkb2luZyBtdWNoIG9mIHRoZSB3b3JrIHBhcnNlcnMgdXN1YWxseSBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIHtAbGluayBHcm91cH0gb2Yga2luZCBHX1BhcmVudGhlc2lzLlxuVGhpcyBhbHNvIG1lYW5zIHRoYXQgdGhlIG1hbnkgZGlmZmVyZW50IHtAbGluayBNc0FzdH0gdHlwZXMgYWxsIHBhcnNlIGluIGEgc2ltaWxhciBtYW5uZXIsXG5rZWVwaW5nIHRoZSBsYW5ndWFnZSBjb25zaXN0ZW50LlxuXG5CZXNpZGVzIHtAbGluayBHcm91cH0sIHtAbGluayBLZXl3b3JkfSwge0BsaW5rIE5hbWV9LCBhbmQge0BsaW5rIERvY0NvbW1lbnR9LFxue0BsaW5rIE51bWJlckxpdGVyYWx9IHZhbHVlcyBhcmUgYWxzbyB0cmVhdGVkIGFzIFRva2Vucy5cblxuQGFic3RyYWN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8qKlxuQ29udGFpbnMgbXVsdGlwbGUgc3ViLXRva2Vucy5cblNlZSB7QGxpbmsgR3JvdXBLaW5kfSBmb3IgZXhwbGFuYXRpb25zLlxuKi9cbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBzdWJUb2tlbnMsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqXG5cdFx0VG9rZW5zIHdpdGhpbiB0aGlzIGdyb3VwLlxuXHRcdEB0eXBlIHtBcnJheTxUb2tlbj59XG5cdFx0Ki9cblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdC8qKiBAdHlwZSB7R3JvdXBzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0XHQvLyBpZiB0aGlzLmtpbmQgPT09IEdyb3Vwcy5SZWdFeHAsIHRoaXMgd2lsbCBhbHNvIGJlIGdpdmVuIGEgYGZsYWdzYCBmaWVsZC5cblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBncm91cE5hbWUodGhpcy5raW5kKVxuXHR9XG59XG5cbi8qKlxuQSBcImtleXdvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cbkl0IGRvZW5zbid0IG5lY2Vzc2FyaWx5IGhhdmUgdG8gYmUgc29tZXRoaW5nIHRoYXQgbWlnaHQgaGF2ZSBiZWVuIGEge0BsaW5rIE5hbWV9LlxuRm9yIGV4YW1wbGUsIHNlZSB7QGxpbmsgS2V5d29yZHMuT2JqRW50cnl9LlxuXG5UaGlzIGNhbiBldmVuIGluY2x1ZGUgb25lcyBsaWtlIGAuIGAgKGRlZmluZXMgYW4gb2JqZWN0IHByb3BlcnR5LCBhcyBpbiBga2V5LiB2YWx1ZWApLlxuS2luZCBpcyBhICoqKi4gU2VlIHRoZSBmdWxsIGxpc3QgYmVsb3cuXG4qL1xuZXhwb3J0IGNsYXNzIEtleXdvcmQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge0tleXdvcmRzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBzaG93S2V5d29yZCh0aGlzLmtpbmQpXG5cdH1cbn1cblxuLyoqXG5BbiBpZGVudGlmaWVyLiBVc3VhbGx5IHRoZSBuYW1lIG9mIHNvbWUgbG9jYWwgdmFyaWFibGUgb3IgcHJvcGVydHkuXG5BIE5hbWUgaXMgZ3VhcmFudGVlZCB0byBub3QgYmUgYW55IGtleXdvcmQuXG4qL1xuZXhwb3J0IGNsYXNzIE5hbWUgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gY29kZSh0aGlzLm5hbWUpXG5cdH1cbn1cblxuLyoqXG5Eb2N1bWVudGF0aW9uIGNvbW1lbnQgKGJlZ2lubmluZyB3aXRoIG9uZSBgfGAgcmF0aGVyIHRoYW4gdHdvKS5cbk5vbi1kb2MgY29tbWVudHMgYXJlIGlnbm9yZWQgYnkge0BsaW5rIGxleH0uXG5UaGVzZSBkb24ndCBhZmZlY3Qgb3V0cHV0LCBidXQgYXJlIHBhc3NlZCB0byB2YXJpb3VzIHtAbGluayBNc0FzdH1zIGZvciB1c2UgYnkgb3RoZXIgdG9vbHMuXG4qL1xuZXhwb3J0IGNsYXNzIERvY0NvbW1lbnQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgdGV4dCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHR0aGlzLnRleHQgPSB0ZXh0XG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gJ2RvYyBjb21tZW50J1xuXHR9XG59XG5cbmxldCBuZXh0R3JvdXBLaW5kID0gMFxuY29uc3Rcblx0Z3JvdXBLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRnID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IG5leHRHcm91cEtpbmRcblx0XHRncm91cEtpbmRUb05hbWUuc2V0KGtpbmQsIG5hbWUpXG5cdFx0bmV4dEdyb3VwS2luZCA9IG5leHRHcm91cEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fVxuXG4vKipcbktpbmRzIG9mIHtAbGluayBHcm91cH0uXG5AZW51bSB7bnVtYmVyfVxuKi9cbmV4cG9ydCBjb25zdCBHcm91cHMgPSB7XG5cdC8qKlxuXHRUb2tlbnMgc3Vycm91bmRlZCBieSBwYXJlbnRoZXNlcy5cblx0VGhlcmUgbWF5IGJlIG5vIGNsb3NpbmcgcGFyZW50aGVzaXMuIEluOlxuXG5cdFx0YSAoYlxuXHRcdFx0Y1xuXG5cdFRoZSB0b2tlbnMgYXJlIGEgR3JvdXA8TGluZT4oTmFtZSwgR3JvdXA8UGFyZW50aGVzaXM+KC4uLikpXG5cdCovXG5cdFBhcmVudGhlc2lzOiBnKCcoKScpLFxuXHQvKiogTGlrZSBgUGFyZW50aGVzaXNgLCBidXQgc2ltcGxlciBiZWNhdXNlIHRoZXJlIG11c3QgYmUgYSBjbG9zaW5nIGBdYC4gKi9cblx0QnJhY2tldDogZygnW10nKSxcblx0LyoqXG5cdExpbmVzIGluIGFuIGluZGVudGVkIGJsb2NrLlxuXHRTdWItdG9rZW5zIHdpbGwgYWx3YXlzIGJlIGBMaW5lYCBncm91cHMuXG5cdE5vdGUgdGhhdCBgQmxvY2tgcyBkbyBub3QgYWx3YXlzIG1hcCB0byBCbG9jayogTXNBc3RzLlxuXHQqL1xuXHRCbG9jazogZygnaW5kZW50ZWQgYmxvY2snKSxcblx0LyoqXG5cdFRva2VucyBvbiBhIGxpbmUuXG5cdFRoZSBpbmRlbnRlZCBibG9jayBmb2xsb3dpbmcgdGhlIGVuZCBvZiB0aGUgbGluZSBpcyBjb25zaWRlcmVkIHRvIGJlIGEgcGFydCBvZiB0aGUgbGluZSFcblx0VGhpcyBtZWFucyB0aGF0IGluIHRoaXMgY29kZTpcblx0XHRhXG5cdFx0XHRiXG5cdFx0XHRjXG5cdFx0ZFxuXHRUaGVyZSBhcmUgMiBsaW5lcywgb25lIHN0YXJ0aW5nIHdpdGggJ2EnIGFuZCBvbmUgc3RhcnRpbmcgd2l0aCAnZCcuXG5cdFRoZSBmaXJzdCBsaW5lIGNvbnRhaW5zICdhJyBhbmQgYSBgQmxvY2tgIHdoaWNoIGluIHR1cm4gY29udGFpbnMgdHdvIG90aGVyIGxpbmVzLlxuXHQqL1xuXHRMaW5lOiBnKCdsaW5lJyksXG5cdC8qKlxuXHRHcm91cHMgdHdvIG9yIG1vcmUgdG9rZW5zIHRoYXQgYXJlICpub3QqIHNlcGFyYXRlZCBieSBzcGFjZXMuXG5cdGBhW2JdLmNgIGlzIGFuIGV4YW1wbGUuXG5cdEEgc2luZ2xlIHRva2VuIG9uIGl0cyBvd24gd2lsbCBub3QgYmUgZ2l2ZW4gYSBgU3BhY2VgIGdyb3VwLlxuXHQqL1xuXHRTcGFjZTogZygnc3BhY2UnKSxcblx0LyoqXG5cdFRva2VucyB3aXRoaW4gYSBxdW90ZS5cblx0YHN1YlRva2Vuc2AgbWF5IGJlIHBsYWluIHN0cmluZ3MsIE5hbWVzIChmb3IgYCNmb29gKSwgb3IgSW50ZXJwb2xhdGlvbiBncm91cHMgKGZvciBgIygwKWApLlxuXHQqL1xuXHRRdW90ZTogZygncXVvdGUnKSxcblx0LyoqXG5cdFRva2VucyB3aXRoaW4gYSBSZWdFeHAuXG5cdGBzdWJUb2tlbnNgIGFyZSBzYW1lIGFzIGZvciBRdW90ZS5cblx0Ki9cblx0UmVnRXhwOiBnKCdyZWdleHAnKSxcblx0LyoqIEludGVycG9sYXRlZCB0b2tlbnMgaW4gYSBRdW90ZSBvciBSZWdFeHAgdXNpbmcgYCMoKWAuICovXG5cdEludGVycG9sYXRpb246IGcoJ2ludGVycG9sYXRpb24nKVxufVxuXG4vKipcbk91dHB1dHRhYmxlIGRlc2NyaXB0aW9uIG9mIGEgZ3JvdXAga2luZC5cbkBwYXJhbSB7R3JvdXBzfSBncm91cEtpbmRcbiovXG5leHBvcnQgZnVuY3Rpb24gc2hvd0dyb3VwS2luZChncm91cEtpbmQpIHtcblx0cmV0dXJuIGdyb3VwS2luZFRvTmFtZS5nZXQoZ3JvdXBLaW5kKVxufVxuXG5sZXQgbmV4dEtleXdvcmRLaW5kID0gMFxuY29uc3Rcblx0a2V5d29yZE5hbWVUb0tpbmQgPSBuZXcgTWFwKCksXG5cdGtleXdvcmRLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRuYW1lS2V5d29yZHMgPSBuZXcgU2V0KClcblxuLy8gVGhlc2Uga2V5d29yZHMgYXJlIHNwZWNpYWwgbmFtZXMuXG4vLyBXaGVuIGxleGluZyBhIG5hbWUsIGEgbWFwIGxvb2t1cCBpcyBkb25lIGJ5IGtleXdvcmRLaW5kRnJvbU5hbWUuXG5mdW5jdGlvbiBrdyhuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrd05vdE5hbWUobmFtZSlcblx0bmFtZUtleXdvcmRzLmFkZChraW5kKVxuXHRrZXl3b3JkTmFtZVRvS2luZC5zZXQobmFtZSwga2luZClcblx0cmV0dXJuIGtpbmRcbn1cbi8vIFRoZXNlIGtleXdvcmRzIG11c3QgYmUgbGV4ZWQgc3BlY2lhbGx5LlxuZnVuY3Rpb24ga3dOb3ROYW1lKGRlYnVnTmFtZSkge1xuXHRjb25zdCBraW5kID0gbmV4dEtleXdvcmRLaW5kXG5cdGtleXdvcmRLaW5kVG9OYW1lLnNldChraW5kLCBkZWJ1Z05hbWUpXG5cdG5leHRLZXl3b3JkS2luZCA9IG5leHRLZXl3b3JkS2luZCArIDFcblx0cmV0dXJuIGtpbmRcbn1cblxuLy8gVXNlZCBieSBpbmZvLmpzXG5leHBvcnQgY29uc3QgcmVzZXJ2ZWRLZXl3b3JkcyA9IFtcblx0Ly8gSmF2YVNjcmlwdCByZXNlcnZlZCB3b3Jkc1xuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luJyxcblx0J2luc3RhbmNlb2YnLFxuXHQncmV0dXJuJyxcblx0J3R5cGVvZicsXG5cdCd2b2lkJyxcblx0J3doaWxlJyxcblxuXHQvLyBNYXNvbiByZXNlcnZlZCB3b3Jkc1xuXHQnIScsXG5cdCc8Jyxcblx0JzwtJyxcblx0Jz4nLFxuXHQnYWN0b3InLFxuXHQnZGF0YScsXG5cdCdkZWw/Jyxcblx0J2RvLXdoaWxlJyxcblx0J2RvLXVudGlsJyxcblx0J2ZpbmFsJyxcblx0J2lzJyxcblx0J21ldGEnLFxuXHQnb3V0Jyxcblx0J292ZXJyaWRlJyxcblx0J3NlbmQnLFxuXHQndG8nLFxuXHQndHlwZScsXG5cdCd1bnRpbCdcbl1cbmZvciAoY29uc3QgbmFtZSBvZiByZXNlcnZlZEtleXdvcmRzKVxuXHRrdyhuYW1lKVxuY29uc3QgZmlyc3ROb25SZXNlcnZlZEtleXdvcmQgPSBuZXh0S2V5d29yZEtpbmRcblxuLyoqIEtpbmRzIG9mIHtAbGluayBLZXl3b3JkfS4gKi9cbmV4cG9ydCBjb25zdCBLZXl3b3JkcyA9IHtcblx0QWJzdHJhY3Q6IGt3KCdhYnN0cmFjdCcpLFxuXHRBbXBlcnNhbmQ6IGt3Tm90TmFtZSgnJicpLFxuXHRBbmQ6IGt3KCdhbmQnKSxcblx0QXM6IGt3KCdhcycpLFxuXHRBc3NlcnQ6IGt3KCdhc3NlcnQnKSxcblx0QXNzaWduOiBrdygnPScpLFxuXHRBd2FpdDoga3coJyQnKSxcblx0TG9jYWxNdXRhdGU6IGt3Tm90TmFtZSgnOj0nKSxcblx0QnJlYWs6IGt3KCdicmVhaycpLFxuXHRCdWlsdDoga3coJ2J1aWx0JyksXG5cdENhc2U6IGt3KCdjYXNlJyksXG5cdENhdGNoOiBrdygnY2F0Y2gnKSxcblx0Q29uZDoga3coJ2NvbmQnKSxcblx0Q2xhc3M6IGt3KCdjbGFzcycpLFxuXHRDb2xvbjoga3dOb3ROYW1lKCc6JyksXG5cdENvbnN0cnVjdDoga3coJ2NvbnN0cnVjdCcpLFxuXHREZWJ1Z2dlcjoga3coJ2RlYnVnZ2VyJyksXG5cdERlbDoga3coJ2RlbCcpLFxuXHREbzoga3coJ2RvJyksXG5cdERvdDoga3dOb3ROYW1lKCcuJyksXG5cdERvdDI6IGt3Tm90TmFtZSgnLi4nKSxcblx0RG90Mzoga3dOb3ROYW1lKCcuLi4gJyksXG5cdEVsc2U6IGt3KCdlbHNlJyksXG5cdEV4Y2VwdDoga3coJ2V4Y2VwdCcpLFxuXHRFeHRlbmRzOiBrdygnZXh0ZW5kcycpLFxuXHRGYWxzZToga3coJ2ZhbHNlJyksXG5cdEZpbmFsbHk6IGt3KCdmaW5hbGx5JyksXG5cdEZvY3VzOiBrdygnXycpLFxuXHRGb3I6IGt3KCdmb3InKSxcblx0Rm9yQXN5bmM6IGt3KCckZm9yJyksXG5cdEZvckJhZzoga3coJ0Bmb3InKSxcblx0Rm9yYmlkOiBrdygnZm9yYmlkJyksXG5cdEZ1bjoga3dOb3ROYW1lKCd8JyksXG5cdEZ1bkRvOiBrd05vdE5hbWUoJyF8JyksXG5cdEZ1blRoaXM6IGt3Tm90TmFtZSgnLnwnKSxcblx0RnVuVGhpc0RvOiBrd05vdE5hbWUoJy4hfCcpLFxuXHRGdW5Bc3luYzoga3dOb3ROYW1lKCckfCcpLFxuXHRGdW5Bc3luY0RvOiBrd05vdE5hbWUoJyQhfCcpLFxuXHRGdW5UaGlzQXN5bmM6IGt3Tm90TmFtZSgnLiR8JyksXG5cdEZ1blRoaXNBc3luY0RvOiBrd05vdE5hbWUoJy4kIXwnKSxcblx0RnVuR2VuOiBrd05vdE5hbWUoJyp8JyksXG5cdEZ1bkdlbkRvOiBrd05vdE5hbWUoJyohfCcpLFxuXHRGdW5UaGlzR2VuOiBrd05vdE5hbWUoJy4qfCcpLFxuXHRGdW5UaGlzR2VuRG86IGt3Tm90TmFtZSgnLiohfCcpLFxuXHRHZXQ6IGt3KCdnZXQnKSxcblx0SWY6IGt3KCdpZicpLFxuXHRJZ25vcmU6IGt3KCdpZ25vcmUnKSxcblx0TGF6eToga3dOb3ROYW1lKCd+JyksXG5cdE1hcEVudHJ5OiBrdygnLT4nKSxcblx0TWV0aG9kOiBrdygnbWV0aG9kJyksXG5cdE15OiBrdygnbXknKSxcblx0TmFtZToga3coJ25hbWUnKSxcblx0TmV3OiBrdygnbmV3JyksXG5cdE5vdDoga3coJ25vdCcpLFxuXHROdWxsOiBrdygnbnVsbCcpLFxuXHQvLyBBbHNvIHdvcmtzIGFzIEJhZ0VudHJ5XG5cdE9iakVudHJ5OiBrd05vdE5hbWUoJy4gJyksXG5cdE9mOiBrdygnb2YnKSxcblx0T3I6IGt3KCdvcicpLFxuXHRQYXNzOiBrdygncGFzcycpLFxuXHRQaXBlOiBrdygncGlwZScpLFxuXHRSZWdpb246IGt3KCdyZWdpb24nKSxcblx0U2V0OiBrdygnc2V0JyksXG5cdFN1cGVyOiBrdygnc3VwZXInKSxcblx0U3RhdGljOiBrdygnc3RhdGljJyksXG5cdFN3aXRjaDoga3coJ3N3aXRjaCcpLFxuXHRUaWNrOiBrd05vdE5hbWUoJ1xcJycpLFxuXHRUaHJvdzoga3coJ3Rocm93JyksXG5cdFRvZG86IGt3KCd0b2RvJyksXG5cdFRyYWl0OiBrdygndHJhaXQnKSxcblx0VHJ1ZToga3coJ3RydWUnKSxcblx0VHJ5OiBrdygndHJ5JyksXG5cdFVuZGVmaW5lZDoga3coJ3VuZGVmaW5lZCcpLFxuXHRVbmxlc3M6IGt3KCd1bmxlc3MnKSxcblx0SW1wb3J0OiBrdygnaW1wb3J0JyksXG5cdEltcG9ydERvOiBrdygnaW1wb3J0IScpLFxuXHRJbXBvcnRMYXp5OiBrdygnaW1wb3J0ficpLFxuXHRXaXRoOiBrdygnd2l0aCcpLFxuXHRZaWVsZDoga3coJ3lpZWxkJyksXG5cdFlpZWxkVG86IGt3KCd5aWVsZConKVxufVxuXG4vKipcbk5hbWUgb2YgYSBrZXl3b3JkLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2luZFxuQHJldHVybiB7c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXl3b3JkTmFtZShraW5kKSB7XG5cdHJldHVybiBrZXl3b3JkS2luZFRvTmFtZS5nZXQoa2luZClcbn1cblxuZnVuY3Rpb24gZ3JvdXBOYW1lKGtpbmQpIHtcblx0cmV0dXJuIGdyb3VwS2luZFRvTmFtZS5nZXQoa2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dLZXl3b3JkKGtpbmQpIHtcblx0cmV0dXJuIGNvZGUoa2V5d29yZE5hbWUoa2luZCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93R3JvdXAoa2luZCkge1xuXHRyZXR1cm4gY29kZShncm91cE5hbWUoa2luZCkpXG59XG5cbi8qKlxuU2VlIGlmIHRoZSBuYW1lIGlzIGEga2V5d29yZCBhbmQgaWYgc28gcmV0dXJuIGl0cyBraW5kLlxuQHJldHVybiB7P0tleXdvcmRzfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSkge1xuXHRjb25zdCBraW5kID0ga2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpXG5cdHJldHVybiBraW5kID09PSB1bmRlZmluZWQgPyBudWxsIDoga2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZChraW5kKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRmFsc2U6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuRmFsc2Vcblx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTmFtZVxuXHRcdGNhc2UgS2V5d29yZHMuTnVsbDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OdWxsXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcnVlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlRydWVcblx0XHRjYXNlIEtleXdvcmRzLlVuZGVmaW5lZDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5VbmRlZmluZWRcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEdyb3VwIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNHcm91cChncm91cEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNLZXl3b3JkKGtleXdvcmRLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiBhbnkgb2YgdGhlIGdpdmVuIGtpbmRzLlxuQHBhcmFtIHtTZXR9IGtleXdvcmRLaW5kc1xuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNBbnlLZXl3b3JkKGtleXdvcmRLaW5kcywgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIHdob3NlIHZhbHVlIGNhbiBiZSB1c2VkIGFzIGEgcHJvcGVydHkgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbilcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIHJlc2VydmVkIHdvcmQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiB0b2tlbi5raW5kIDwgZmlyc3ROb25SZXNlcnZlZEtleXdvcmRcbn1cbiJdfQ==
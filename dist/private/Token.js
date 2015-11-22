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
	'!', '<', '>', 'actor', 'data', 'del?', 'do-while', 'do-until', 'final', 'is', 'meta', 'out', 'override', 'send', 'to', 'type', 'until'];

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

	function showKeyword(kind) {
		return (0, _CompileError.code)(keywordName(kind));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0E4SmdCLGFBQWEsR0FBYixhQUFhO1NBOEpiLFdBQVcsR0FBWCxXQUFXO1NBSVgsV0FBVyxHQUFYLFdBQVc7U0FRWCxxQkFBcUIsR0FBckIscUJBQXFCO1NBS3JCLCtCQUErQixHQUEvQiwrQkFBK0I7U0FzQi9CLE9BQU8sR0FBUCxPQUFPO1NBU1AsU0FBUyxHQUFULFNBQVM7U0FTVCxZQUFZLEdBQVosWUFBWTtTQUtaLGFBQWEsR0FBYixhQUFhO1NBS2IsaUJBQWlCLEdBQWpCLGlCQUFpQjs7T0EvV1osS0FBSzs7Ozs7OzttQkFBTCxLQUFLOztPQVViLEtBQUs7Ozs7Ozs7Ozs7Ozs7U0FBTCxLQUFLLEdBQUwsS0FBSzs7T0F5QkwsT0FBTzs7Ozs7Ozs7Ozs7O1NBQVAsT0FBTyxHQUFQLE9BQU87O09BZ0JQLElBQUk7Ozs7Ozs7Ozs7OztTQUFKLElBQUksR0FBSixJQUFJOztPQWlCSixVQUFVOzs7Ozs7Ozs7Ozs7U0FBVixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7T0EwQlYsTUFBTSxXQUFOLE1BQU0sR0FBRzs7Ozs7Ozs7QUFVckIsYUFBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRXBCLFNBQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDOzs7Ozs7QUFNaEIsT0FBSyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQzs7Ozs7QUFLMUIsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Ozs7Ozs7Ozs7OztBQVlqQixNQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs7Ozs7O0FBTWYsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7RUFDakI7O1VBTWUsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EyQmhCLGdCQUFnQixXQUFoQixnQkFBZ0IsR0FBRzs7QUFFL0IsT0FBTSxFQUNOLFlBQVksRUFD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LENBQUM7QUFDckIsT0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDbEIsTUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDaEIsTUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDaEIsS0FBRyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDZCxXQUFTLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQztBQUMxQixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixRQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNwQixVQUFRLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN2QixZQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQztBQUN6QixNQUFJLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNoQixPQUFLLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNsQixTQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztFQUNyQjs7VUFPZSxXQUFXOzs7O1VBSVgsV0FBVzs7OztVQVFYLHFCQUFxQjs7Ozs7VUFLckIsK0JBQStCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBc0IvQixPQUFPOzs7O1VBU1AsU0FBUzs7OztVQVNULFlBQVk7Ozs7VUFLWixhQUFhOzs7O1VBS2IsaUJBQWlCIiwiZmlsZSI6IlRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQge1NwZWNpYWxWYWxzfSBmcm9tICcuL01zQXN0J1xuXG4vKipcbkxleGVkIGVsZW1lbnQgaW4gYSB0cmVlIG9mIFRva2Vucy5cblxuU2luY2Uge0BsaW5rIGxleH0gZG9lcyBncm91cGluZywge0BsaW5rIHBhcnNlfSBhdm9pZHMgZG9pbmcgbXVjaCBvZiB0aGUgd29yayBwYXJzZXJzIHVzdWFsbHkgZG87XG5pdCBkb2Vzbid0IGhhdmUgdG8gaGFuZGxlIGEgXCJsZWZ0IHBhcmVudGhlc2lzXCIsIG9ubHkgYSB7QGxpbmsgR3JvdXB9IG9mIGtpbmQgR19QYXJlbnRoZXNpcy5cblRoaXMgYWxzbyBtZWFucyB0aGF0IHRoZSBtYW55IGRpZmZlcmVudCB7QGxpbmsgTXNBc3R9IHR5cGVzIGFsbCBwYXJzZSBpbiBhIHNpbWlsYXIgbWFubmVyLFxua2VlcGluZyB0aGUgbGFuZ3VhZ2UgY29uc2lzdGVudC5cblxuQmVzaWRlcyB7QGxpbmsgR3JvdXB9LCB7QGxpbmsgS2V5d29yZH0sIHtAbGluayBOYW1lfSwgYW5kIHtAbGluayBEb2NDb21tZW50fSxcbntAbGluayBOdW1iZXJMaXRlcmFsfSB2YWx1ZXMgYXJlIGFsc28gdHJlYXRlZCBhcyBUb2tlbnMuXG5cbkBhYnN0cmFjdFxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vKipcbkNvbnRhaW5zIG11bHRpcGxlIHN1Yi10b2tlbnMuXG5TZWUge0BsaW5rIEdyb3VwS2luZH0gZm9yIGV4cGxhbmF0aW9ucy5cbiovXG5leHBvcnQgY2xhc3MgR3JvdXAgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgc3ViVG9rZW5zLCBraW5kKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKlxuXHRcdFRva2VucyB3aXRoaW4gdGhpcyBncm91cC5cblx0XHRAdHlwZSB7QXJyYXk8VG9rZW4+fVxuXHRcdCovXG5cdFx0dGhpcy5zdWJUb2tlbnMgPSBzdWJUb2tlbnNcblx0XHQvKiogQHR5cGUge0dyb3Vwc30gKi9cblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gYCR7Z3JvdXBLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpfWBcblx0fVxufVxuXG4vKipcbkEgXCJrZXl3b3JkXCIgaXMgYW55IHNldCBvZiBjaGFyYWN0ZXJzIHdpdGggYSBwYXJ0aWN1bGFyIG1lYW5pbmcuXG5JdCBkb2Vuc24ndCBuZWNlc3NhcmlseSBoYXZlIHRvIGJlIHNvbWV0aGluZyB0aGF0IG1pZ2h0IGhhdmUgYmVlbiBhIHtAbGluayBOYW1lfS5cbkZvciBleGFtcGxlLCBzZWUge0BsaW5rIEtleXdvcmRzLk9iakVudHJ5fS5cblxuVGhpcyBjYW4gZXZlbiBpbmNsdWRlIG9uZXMgbGlrZSBgLiBgIChkZWZpbmVzIGFuIG9iamVjdCBwcm9wZXJ0eSwgYXMgaW4gYGtleS4gdmFsdWVgKS5cbktpbmQgaXMgYSAqKiouIFNlZSB0aGUgZnVsbCBsaXN0IGJlbG93LlxuKi9cbmV4cG9ydCBjbGFzcyBLZXl3b3JkIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtLZXl3b3Jkc30gKi9cblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gc2hvd0tleXdvcmQodGhpcy5raW5kKVxuXHR9XG59XG5cbi8qKlxuQW4gaWRlbnRpZmllci4gVXN1YWxseSB0aGUgbmFtZSBvZiBzb21lIGxvY2FsIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuQSBOYW1lIGlzIGd1YXJhbnRlZWQgdG8gbm90IGJlIGFueSBrZXl3b3JkLlxuKi9cbmV4cG9ydCBjbGFzcyBOYW1lIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGNvZGUodGhpcy5uYW1lKVxuXHR9XG59XG5cbi8qKlxuRG9jdW1lbnRhdGlvbiBjb21tZW50IChiZWdpbm5pbmcgd2l0aCBvbmUgYHxgIHJhdGhlciB0aGFuIHR3bykuXG5Ob24tZG9jIGNvbW1lbnRzIGFyZSBpZ25vcmVkIGJ5IHtAbGluayBsZXh9LlxuVGhlc2UgZG9uJ3QgYWZmZWN0IG91dHB1dCwgYnV0IGFyZSBwYXNzZWQgdG8gdmFyaW91cyB7QGxpbmsgTXNBc3R9cyBmb3IgdXNlIGJ5IG90aGVyIHRvb2xzLlxuKi9cbmV4cG9ydCBjbGFzcyBEb2NDb21tZW50IGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHRleHQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy50ZXh0ID0gdGV4dFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuICdkb2MgY29tbWVudCdcblx0fVxufVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cblxuLyoqXG5LaW5kcyBvZiB7QGxpbmsgR3JvdXB9LlxuQGVudW0ge251bWJlcn1cbiovXG5leHBvcnQgY29uc3QgR3JvdXBzID0ge1xuXHQvKipcblx0VG9rZW5zIHN1cnJvdW5kZWQgYnkgcGFyZW50aGVzZXMuXG5cdFRoZXJlIG1heSBiZSBubyBjbG9zaW5nIHBhcmVudGhlc2lzLiBJbjpcblxuXHRcdGEgKGJcblx0XHRcdGNcblxuXHRUaGUgdG9rZW5zIGFyZSBhIEdyb3VwPExpbmU+KE5hbWUsIEdyb3VwPFBhcmVudGhlc2lzPiguLi4pKVxuXHQqL1xuXHRQYXJlbnRoZXNpczogZygnKCknKSxcblx0LyoqIExpa2UgYFBhcmVudGhlc2lzYCwgYnV0IHNpbXBsZXIgYmVjYXVzZSB0aGVyZSBtdXN0IGJlIGEgY2xvc2luZyBgXWAuICovXG5cdEJyYWNrZXQ6IGcoJ1tdJyksXG5cdC8qKlxuXHRMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0U3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBgTGluZWAgZ3JvdXBzLlxuXHROb3RlIHRoYXQgYEJsb2NrYHMgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0Ki9cblx0QmxvY2s6IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8qKlxuXHRUb2tlbnMgd2l0aGluIGEgcXVvdGUuXG5cdGBzdWJUb2tlbnNgIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0Ki9cblx0UXVvdGU6IGcoJ3F1b3RlJyksXG5cdC8qKlxuXHRUb2tlbnMgb24gYSBsaW5lLlxuXHRUaGUgaW5kZW50ZWQgYmxvY2sgZm9sbG93aW5nIHRoZSBlbmQgb2YgdGhlIGxpbmUgaXMgY29uc2lkZXJlZCB0byBiZSBhIHBhcnQgb2YgdGhlIGxpbmUhXG5cdFRoaXMgbWVhbnMgdGhhdCBpbiB0aGlzIGNvZGU6XG5cdFx0YVxuXHRcdFx0YlxuXHRcdFx0Y1xuXHRcdGRcblx0VGhlcmUgYXJlIDIgbGluZXMsIG9uZSBzdGFydGluZyB3aXRoICdhJyBhbmQgb25lIHN0YXJ0aW5nIHdpdGggJ2QnLlxuXHRUaGUgZmlyc3QgbGluZSBjb250YWlucyAnYScgYW5kIGEgYEJsb2NrYCB3aGljaCBpbiB0dXJuIGNvbnRhaW5zIHR3byBvdGhlciBsaW5lcy5cblx0Ki9cblx0TGluZTogZygnbGluZScpLFxuXHQvKipcblx0R3JvdXBzIHR3byBvciBtb3JlIHRva2VucyB0aGF0IGFyZSAqbm90KiBzZXBhcmF0ZWQgYnkgc3BhY2VzLlxuXHRgYVtiXS5jYCBpcyBhbiBleGFtcGxlLlxuXHRBIHNpbmdsZSB0b2tlbiBvbiBpdHMgb3duIHdpbGwgbm90IGJlIGdpdmVuIGEgYFNwYWNlYCBncm91cC5cblx0Ki9cblx0U3BhY2U6IGcoJ3NwYWNlJylcbn1cblxuLyoqXG5PdXRwdXR0YWJsZSBkZXNjcmlwdGlvbiBvZiBhIGdyb3VwIGtpbmQuXG5AcGFyYW0ge0dyb3Vwc30gZ3JvdXBLaW5kXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dHcm91cEtpbmQoZ3JvdXBLaW5kKSB7XG5cdHJldHVybiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcbn1cblxubGV0IG5leHRLZXl3b3JkS2luZCA9IDBcbmNvbnN0XG5cdGtleXdvcmROYW1lVG9LaW5kID0gbmV3IE1hcCgpLFxuXHRrZXl3b3JkS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0bmFtZUtleXdvcmRzID0gbmV3IFNldCgpXG5cbi8vIFRoZXNlIGtleXdvcmRzIGFyZSBzcGVjaWFsIG5hbWVzLlxuLy8gV2hlbiBsZXhpbmcgYSBuYW1lLCBhIG1hcCBsb29rdXAgaXMgZG9uZSBieSBrZXl3b3JkS2luZEZyb21OYW1lLlxuZnVuY3Rpb24ga3cobmFtZSkge1xuXHRjb25zdCBraW5kID0ga3dOb3ROYW1lKG5hbWUpXG5cdG5hbWVLZXl3b3Jkcy5hZGQoa2luZClcblx0a2V5d29yZE5hbWVUb0tpbmQuc2V0KG5hbWUsIGtpbmQpXG5cdHJldHVybiBraW5kXG59XG4vLyBUaGVzZSBrZXl3b3JkcyBtdXN0IGJlIGxleGVkIHNwZWNpYWxseS5cbmZ1bmN0aW9uIGt3Tm90TmFtZShkZWJ1Z05hbWUpIHtcblx0Y29uc3Qga2luZCA9IG5leHRLZXl3b3JkS2luZFxuXHRrZXl3b3JkS2luZFRvTmFtZS5zZXQoa2luZCwgZGVidWdOYW1lKVxuXHRuZXh0S2V5d29yZEtpbmQgPSBuZXh0S2V5d29yZEtpbmQgKyAxXG5cdHJldHVybiBraW5kXG59XG5cbi8vIFVzZWQgYnkgaW5mby5qc1xuZXhwb3J0IGNvbnN0IHJlc2VydmVkS2V5d29yZHMgPSBbXG5cdC8vIEphdmFTY3JpcHQgcmVzZXJ2ZWQgd29yZHNcblx0J2VudW0nLFxuXHQnaW1wbGVtZW50cycsXG5cdCdpbnRlcmZhY2UnLFxuXHQncGFja2FnZScsXG5cdCdwcml2YXRlJyxcblx0J3Byb3RlY3RlZCcsXG5cdCdwdWJsaWMnLFxuXG5cdC8vIEphdmFTY3JpcHQga2V5d29yZHNcblx0J2FyZ3VtZW50cycsXG5cdCdkZWxldGUnLFxuXHQnZXZhbCcsXG5cdCdpbicsXG5cdCdpbnN0YW5jZW9mJyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndm9pZCcsXG5cdCd3aGlsZScsXG5cblx0Ly8gTWFzb24gcmVzZXJ2ZWQgd29yZHNcblx0JyEnLFxuXHQnPCcsXG5cdCc+Jyxcblx0J2FjdG9yJyxcblx0J2RhdGEnLFxuXHQnZGVsPycsXG5cdCdkby13aGlsZScsXG5cdCdkby11bnRpbCcsXG5cdCdmaW5hbCcsXG5cdCdpcycsXG5cdCdtZXRhJyxcblx0J291dCcsXG5cdCdvdmVycmlkZScsXG5cdCdzZW5kJyxcblx0J3RvJyxcblx0J3R5cGUnLFxuXHQndW50aWwnXG5dXG5mb3IgKGNvbnN0IG5hbWUgb2YgcmVzZXJ2ZWRLZXl3b3Jkcylcblx0a3cobmFtZSlcbmNvbnN0IGZpcnN0Tm9uUmVzZXJ2ZWRLZXl3b3JkID0gbmV4dEtleXdvcmRLaW5kXG5cbi8qKiBLaW5kcyBvZiB7QGxpbmsgS2V5d29yZH0uICovXG5leHBvcnQgY29uc3QgS2V5d29yZHMgPSB7XG5cdEFic3RyYWN0OiBrdygnYWJzdHJhY3QnKSxcblx0QW1wZXJzYW5kOiBrd05vdE5hbWUoJyYnKSxcblx0QW5kOiBrdygnYW5kJyksXG5cdEFzOiBrdygnYXMnKSxcblx0QXNzZXJ0OiBrdygnYXNzZXJ0JyksXG5cdEFzc2lnbjoga3coJz0nKSxcblx0QXdhaXQ6IGt3KCckJyksXG5cdExvY2FsTXV0YXRlOiBrd05vdE5hbWUoJzo9JyksXG5cdEJyZWFrOiBrdygnYnJlYWsnKSxcblx0QnVpbHQ6IGt3KCdidWlsdCcpLFxuXHRDYXNlOiBrdygnY2FzZScpLFxuXHRDYXRjaDoga3coJ2NhdGNoJyksXG5cdENvbmQ6IGt3KCdjb25kJyksXG5cdENsYXNzOiBrdygnY2xhc3MnKSxcblx0Q29sb246IGt3Tm90TmFtZSgnOicpLFxuXHRDb25zdHJ1Y3Q6IGt3KCdjb25zdHJ1Y3QnKSxcblx0RGVidWdnZXI6IGt3KCdkZWJ1Z2dlcicpLFxuXHREZWw6IGt3KCdkZWwnKSxcblx0RG86IGt3KCdkbycpLFxuXHREb3Q6IGt3Tm90TmFtZSgnLicpLFxuXHREb3QyOiBrd05vdE5hbWUoJy4uJyksXG5cdERvdDM6IGt3Tm90TmFtZSgnLi4uICcpLFxuXHRFbHNlOiBrdygnZWxzZScpLFxuXHRFeGNlcHQ6IGt3KCdleGNlcHQnKSxcblx0RmFsc2U6IGt3KCdmYWxzZScpLFxuXHRGaW5hbGx5OiBrdygnZmluYWxseScpLFxuXHRGb2N1czoga3coJ18nKSxcblx0Rm9yOiBrdygnZm9yJyksXG5cdEZvckFzeW5jOiBrdygnJGZvcicpLFxuXHRGb3JCYWc6IGt3KCdAZm9yJyksXG5cdEZvcmJpZDoga3coJ2ZvcmJpZCcpLFxuXHRGdW46IGt3Tm90TmFtZSgnfCcpLFxuXHRGdW5Ebzoga3dOb3ROYW1lKCchfCcpLFxuXHRGdW5UaGlzOiBrd05vdE5hbWUoJy58JyksXG5cdEZ1blRoaXNEbzoga3dOb3ROYW1lKCcuIXwnKSxcblx0RnVuQXN5bmM6IGt3Tm90TmFtZSgnJHwnKSxcblx0RnVuQXN5bmNEbzoga3dOb3ROYW1lKCckIXwnKSxcblx0RnVuVGhpc0FzeW5jOiBrd05vdE5hbWUoJy4kfCcpLFxuXHRGdW5UaGlzQXN5bmNEbzoga3dOb3ROYW1lKCcuJCF8JyksXG5cdEZ1bkdlbjoga3dOb3ROYW1lKCcqfCcpLFxuXHRGdW5HZW5Ebzoga3dOb3ROYW1lKCcqIXwnKSxcblx0RnVuVGhpc0dlbjoga3dOb3ROYW1lKCcuKnwnKSxcblx0RnVuVGhpc0dlbkRvOiBrd05vdE5hbWUoJy4qIXwnKSxcblx0R2V0OiBrdygnZ2V0JyksXG5cdElmOiBrdygnaWYnKSxcblx0SWdub3JlOiBrdygnaWdub3JlJyksXG5cdEtpbmQ6IGt3KCdraW5kJyksXG5cdExhenk6IGt3Tm90TmFtZSgnficpLFxuXHRNYXBFbnRyeToga3coJy0+JyksXG5cdE1ldGhvZDoga3coJ21ldGhvZCcpLFxuXHRNeToga3coJ215JyksXG5cdE5hbWU6IGt3KCduYW1lJyksXG5cdE5ldzoga3coJ25ldycpLFxuXHROb3Q6IGt3KCdub3QnKSxcblx0TnVsbDoga3coJ251bGwnKSxcblx0T2JqQXNzaWduOiBrd05vdE5hbWUoJy4gJyksXG5cdE9mOiBrdygnb2YnKSxcblx0T3I6IGt3KCdvcicpLFxuXHRQYXNzOiBrdygncGFzcycpLFxuXHRQaXBlOiBrdygncGlwZScpLFxuXHRSZWdpb246IGt3KCdyZWdpb24nKSxcblx0U2V0OiBrdygnc2V0JyksXG5cdFN1cGVyOiBrdygnc3VwZXInKSxcblx0U3RhdGljOiBrdygnc3RhdGljJyksXG5cdFN3aXRjaDoga3coJ3N3aXRjaCcpLFxuXHRUaWNrOiBrd05vdE5hbWUoJ1xcJycpLFxuXHRUaHJvdzoga3coJ3Rocm93JyksXG5cdFRvZG86IGt3KCd0b2RvJyksXG5cdFRydWU6IGt3KCd0cnVlJyksXG5cdFRyeToga3coJ3RyeScpLFxuXHRVbmRlZmluZWQ6IGt3KCd1bmRlZmluZWQnKSxcblx0VW5sZXNzOiBrdygndW5sZXNzJyksXG5cdEltcG9ydDoga3coJ2ltcG9ydCcpLFxuXHRJbXBvcnREbzoga3coJ2ltcG9ydCEnKSxcblx0SW1wb3J0TGF6eToga3coJ2ltcG9ydH4nKSxcblx0V2l0aDoga3coJ3dpdGgnKSxcblx0WWllbGQ6IGt3KCd5aWVsZCcpLFxuXHRZaWVsZFRvOiBrdygneWllbGQqJylcbn1cblxuLyoqXG5OYW1lIG9mIGEga2V5d29yZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtpbmRcbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24ga2V5d29yZE5hbWUoa2luZCkge1xuXHRyZXR1cm4ga2V5d29yZEtpbmRUb05hbWUuZ2V0KGtpbmQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93S2V5d29yZChraW5kKSB7XG5cdHJldHVybiBjb2RlKGtleXdvcmROYW1lKGtpbmQpKVxufVxuXG4vKipcblNlZSBpZiB0aGUgbmFtZSBpcyBhIGtleXdvcmQgYW5kIGlmIHNvIHJldHVybiBpdHMga2luZC5cbkByZXR1cm4gez9LZXl3b3Jkc31cbiovXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGtleXdvcmROYW1lVG9LaW5kLmdldChuYW1lKVxuXHRyZXR1cm4ga2luZCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGtpbmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQoa2luZCkge1xuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZhbHNlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLkZhbHNlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5OYW1lOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLk5hbWVcblx0XHRjYXNlIEtleXdvcmRzLk51bGw6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTnVsbFxuXHRcdGNhc2UgS2V5d29yZHMuVHJ1ZTpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5UcnVlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5VbmRlZmluZWQ6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuVW5kZWZpbmVkXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBudWxsXG5cdH1cbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBHcm91cCBvZiB0aGUgZ2l2ZW4ga2luZC5cbkBwYXJhbSB7R3JvdXBzfSBncm91cEtpbmRcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR3JvdXAoZ3JvdXBLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBHcm91cCAmJiB0b2tlbi5raW5kID09PSBncm91cEtpbmRcbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2V5d29yZEtpbmRcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzS2V5d29yZChrZXl3b3JkS2luZCwgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiB0b2tlbi5raW5kID09PSBrZXl3b3JkS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgYW55IG9mIHRoZSBnaXZlbiBraW5kcy5cbkBwYXJhbSB7U2V0fSBrZXl3b3JkS2luZHNcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQW55S2V5d29yZChrZXl3b3JkS2luZHMsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYga2V5d29yZEtpbmRzLmhhcyh0b2tlbi5raW5kKVxufVxuXG4vKiogV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCB3aG9zZSB2YWx1ZSBjYW4gYmUgdXNlZCBhcyBhIHByb3BlcnR5IG5hbWUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lS2V5d29yZCh0b2tlbikge1xuXHRyZXR1cm4gaXNBbnlLZXl3b3JkKG5hbWVLZXl3b3JkcywgdG9rZW4pXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSByZXNlcnZlZCB3b3JkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVzZXJ2ZWRLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYgdG9rZW4ua2luZCA8IGZpcnN0Tm9uUmVzZXJ2ZWRLZXl3b3JkXG59XG4iXX0=
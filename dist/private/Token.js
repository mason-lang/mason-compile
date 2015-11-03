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
		Assert: kw('assert'),
		AssertNot: kw('forbid'),
		Assign: kw('='),
		AssignMutable: kwNotName('::='),
		LocalMutate: kwNotName(':='),
		Break: kw('break'),
		Built: kw('built'),
		Case: kw('case'),
		Catch: kw('catch'),
		Cond: kw('cond'),
		Class: kw('class'),
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
		ForBag: kw('@for'),
		For: kw('for'),
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
		If: kw('if'),
		Ignore: kw('ignore'),
		Kind: kw('kind'),
		Lazy: kwNotName('~'),
		Less: kw('<'),
		MapEntry: kw('->'),
		More: kw('>'),
		Name: kw('name'),
		New: kw('new'),
		Not: kw('not'),
		Null: kw('null'),
		ObjAssign: kwNotName('. '),
		Of: kw('of'),
		Or: kw('or'),
		Pass: kw('pass'),
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
		Type: kwNotName(':'),
		Undefined: kw('undefined'),
		Unless: kw('unless'),
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
		return isAnyKeyword(reservedKeywords, token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0E4SmdCLGFBQWEsR0FBYixhQUFhO1NBb0tiLFdBQVcsR0FBWCxXQUFXO1NBSVgsV0FBVyxHQUFYLFdBQVc7U0FRWCxxQkFBcUIsR0FBckIscUJBQXFCO1NBS3JCLCtCQUErQixHQUEvQiwrQkFBK0I7U0FzQi9CLE9BQU8sR0FBUCxPQUFPO1NBU1AsU0FBUyxHQUFULFNBQVM7U0FTVCxZQUFZLEdBQVosWUFBWTtTQUtaLGFBQWEsR0FBYixhQUFhO1NBS2IsaUJBQWlCLEdBQWpCLGlCQUFpQjs7T0FyWFosS0FBSzs7Ozs7OzttQkFBTCxLQUFLOztPQVViLEtBQUs7Ozs7Ozs7Ozs7Ozs7U0FBTCxLQUFLLEdBQUwsS0FBSzs7T0F5QkwsT0FBTzs7Ozs7Ozs7Ozs7O1NBQVAsT0FBTyxHQUFQLE9BQU87O09BZ0JQLElBQUk7Ozs7Ozs7Ozs7OztTQUFKLElBQUksR0FBSixJQUFJOztPQWlCSixVQUFVOzs7Ozs7Ozs7Ozs7U0FBVixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7T0EwQlYsTUFBTSxXQUFOLE1BQU0sR0FBRzs7Ozs7Ozs7QUFVckIsYUFBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRXBCLFNBQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDOzs7Ozs7QUFNaEIsT0FBSyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQzs7Ozs7QUFLMUIsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Ozs7Ozs7Ozs7OztBQVlqQixNQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs7Ozs7O0FBTWYsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7RUFDakI7O1VBTWUsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BaUZoQixRQUFRLFdBQVIsUUFBUSxHQUFHO0FBQ3ZCLFdBQVMsRUFBRSxTQUFT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LHFCQUFxQjs7Ozs7VUFLckIsK0JBQStCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBc0IvQixPQUFPOzs7O1VBU1AsU0FBUzs7OztVQVNULFlBQVk7Ozs7VUFLWixhQUFhOzs7O1VBS2IsaUJBQWlCIiwiZmlsZSI6IlRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQge1NwZWNpYWxWYWxzfSBmcm9tICcuL01zQXN0J1xuXG4vKipcbkxleGVkIGVsZW1lbnQgaW4gYSB0cmVlIG9mIFRva2Vucy5cblxuU2luY2Uge0BsaW5rIGxleH0gZG9lcyBncm91cGluZywge0BsaW5rIHBhcnNlfSBhdm9pZHMgZG9pbmcgbXVjaCBvZiB0aGUgd29yayBwYXJzZXJzIHVzdWFsbHkgZG87XG5pdCBkb2Vzbid0IGhhdmUgdG8gaGFuZGxlIGEgXCJsZWZ0IHBhcmVudGhlc2lzXCIsIG9ubHkgYSB7QGxpbmsgR3JvdXB9IG9mIGtpbmQgR19QYXJlbnRoZXNpcy5cblRoaXMgYWxzbyBtZWFucyB0aGF0IHRoZSBtYW55IGRpZmZlcmVudCB7QGxpbmsgTXNBc3R9IHR5cGVzIGFsbCBwYXJzZSBpbiBhIHNpbWlsYXIgbWFubmVyLFxua2VlcGluZyB0aGUgbGFuZ3VhZ2UgY29uc2lzdGVudC5cblxuQmVzaWRlcyB7QGxpbmsgR3JvdXB9LCB7QGxpbmsgS2V5d29yZH0sIHtAbGluayBOYW1lfSwgYW5kIHtAbGluayBEb2NDb21tZW50fSxcbntAbGluayBOdW1iZXJMaXRlcmFsfSB2YWx1ZXMgYXJlIGFsc28gdHJlYXRlZCBhcyBUb2tlbnMuXG5cbkBhYnN0cmFjdFxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vKipcbkNvbnRhaW5zIG11bHRpcGxlIHN1Yi10b2tlbnMuXG5TZWUge0BsaW5rIEdyb3VwS2luZH0gZm9yIGV4cGxhbmF0aW9ucy5cbiovXG5leHBvcnQgY2xhc3MgR3JvdXAgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgc3ViVG9rZW5zLCBraW5kKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKlxuXHRcdFRva2VucyB3aXRoaW4gdGhpcyBncm91cC5cblx0XHRAdHlwZSB7QXJyYXk8VG9rZW4+fVxuXHRcdCovXG5cdFx0dGhpcy5zdWJUb2tlbnMgPSBzdWJUb2tlbnNcblx0XHQvKiogQHR5cGUge0dyb3Vwc30gKi9cblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gYCR7Z3JvdXBLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpfWBcblx0fVxufVxuXG4vKipcbkEgXCJrZXl3b3JkXCIgaXMgYW55IHNldCBvZiBjaGFyYWN0ZXJzIHdpdGggYSBwYXJ0aWN1bGFyIG1lYW5pbmcuXG5JdCBkb2Vuc24ndCBuZWNlc3NhcmlseSBoYXZlIHRvIGJlIHNvbWV0aGluZyB0aGF0IG1pZ2h0IGhhdmUgYmVlbiBhIHtAbGluayBOYW1lfS5cbkZvciBleGFtcGxlLCBzZWUge0BsaW5rIEtleXdvcmRzLk9iakVudHJ5fS5cblxuVGhpcyBjYW4gZXZlbiBpbmNsdWRlIG9uZXMgbGlrZSBgLiBgIChkZWZpbmVzIGFuIG9iamVjdCBwcm9wZXJ0eSwgYXMgaW4gYGtleS4gdmFsdWVgKS5cbktpbmQgaXMgYSAqKiouIFNlZSB0aGUgZnVsbCBsaXN0IGJlbG93LlxuKi9cbmV4cG9ydCBjbGFzcyBLZXl3b3JkIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtLZXl3b3Jkc30gKi9cblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gc2hvd0tleXdvcmQodGhpcy5raW5kKVxuXHR9XG59XG5cbi8qKlxuQW4gaWRlbnRpZmllci4gVXN1YWxseSB0aGUgbmFtZSBvZiBzb21lIGxvY2FsIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuQSBOYW1lIGlzIGd1YXJhbnRlZWQgdG8gbm90IGJlIGFueSBrZXl3b3JkLlxuKi9cbmV4cG9ydCBjbGFzcyBOYW1lIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGNvZGUodGhpcy5uYW1lKVxuXHR9XG59XG5cbi8qKlxuRG9jdW1lbnRhdGlvbiBjb21tZW50IChiZWdpbm5pbmcgd2l0aCBvbmUgYHxgIHJhdGhlciB0aGFuIHR3bykuXG5Ob24tZG9jIGNvbW1lbnRzIGFyZSBpZ25vcmVkIGJ5IHtAbGluayBsZXh9LlxuVGhlc2UgZG9uJ3QgYWZmZWN0IG91dHB1dCwgYnV0IGFyZSBwYXNzZWQgdG8gdmFyaW91cyB7QGxpbmsgTXNBc3R9cyBmb3IgdXNlIGJ5IG90aGVyIHRvb2xzLlxuKi9cbmV4cG9ydCBjbGFzcyBEb2NDb21tZW50IGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHRleHQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy50ZXh0ID0gdGV4dFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuICdkb2MgY29tbWVudCdcblx0fVxufVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cblxuLyoqXG5LaW5kcyBvZiB7QGxpbmsgR3JvdXB9LlxuQGVudW0ge251bWJlcn1cbiovXG5leHBvcnQgY29uc3QgR3JvdXBzID0ge1xuXHQvKipcblx0VG9rZW5zIHN1cnJvdW5kZWQgYnkgcGFyZW50aGVzZXMuXG5cdFRoZXJlIG1heSBiZSBubyBjbG9zaW5nIHBhcmVudGhlc2lzLiBJbjpcblxuXHRcdGEgKGJcblx0XHRcdGNcblxuXHRUaGUgdG9rZW5zIGFyZSBhIEdyb3VwPExpbmU+KE5hbWUsIEdyb3VwPFBhcmVudGhlc2lzPiguLi4pKVxuXHQqL1xuXHRQYXJlbnRoZXNpczogZygnKCknKSxcblx0LyoqIExpa2UgYFBhcmVudGhlc2lzYCwgYnV0IHNpbXBsZXIgYmVjYXVzZSB0aGVyZSBtdXN0IGJlIGEgY2xvc2luZyBgXWAuICovXG5cdEJyYWNrZXQ6IGcoJ1tdJyksXG5cdC8qKlxuXHRMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0U3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBgTGluZWAgZ3JvdXBzLlxuXHROb3RlIHRoYXQgYEJsb2NrYHMgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0Ki9cblx0QmxvY2s6IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8qKlxuXHRUb2tlbnMgd2l0aGluIGEgcXVvdGUuXG5cdGBzdWJUb2tlbnNgIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0Ki9cblx0UXVvdGU6IGcoJ3F1b3RlJyksXG5cdC8qKlxuXHRUb2tlbnMgb24gYSBsaW5lLlxuXHRUaGUgaW5kZW50ZWQgYmxvY2sgZm9sbG93aW5nIHRoZSBlbmQgb2YgdGhlIGxpbmUgaXMgY29uc2lkZXJlZCB0byBiZSBhIHBhcnQgb2YgdGhlIGxpbmUhXG5cdFRoaXMgbWVhbnMgdGhhdCBpbiB0aGlzIGNvZGU6XG5cdFx0YVxuXHRcdFx0YlxuXHRcdFx0Y1xuXHRcdGRcblx0VGhlcmUgYXJlIDIgbGluZXMsIG9uZSBzdGFydGluZyB3aXRoICdhJyBhbmQgb25lIHN0YXJ0aW5nIHdpdGggJ2QnLlxuXHRUaGUgZmlyc3QgbGluZSBjb250YWlucyAnYScgYW5kIGEgYEJsb2NrYCB3aGljaCBpbiB0dXJuIGNvbnRhaW5zIHR3byBvdGhlciBsaW5lcy5cblx0Ki9cblx0TGluZTogZygnbGluZScpLFxuXHQvKipcblx0R3JvdXBzIHR3byBvciBtb3JlIHRva2VucyB0aGF0IGFyZSAqbm90KiBzZXBhcmF0ZWQgYnkgc3BhY2VzLlxuXHRgYVtiXS5jYCBpcyBhbiBleGFtcGxlLlxuXHRBIHNpbmdsZSB0b2tlbiBvbiBpdHMgb3duIHdpbGwgbm90IGJlIGdpdmVuIGEgYFNwYWNlYCBncm91cC5cblx0Ki9cblx0U3BhY2U6IGcoJ3NwYWNlJylcbn1cblxuLyoqXG5PdXRwdXR0YWJsZSBkZXNjcmlwdGlvbiBvZiBhIGdyb3VwIGtpbmQuXG5AcGFyYW0ge0dyb3Vwc30gZ3JvdXBLaW5kXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dHcm91cEtpbmQoZ3JvdXBLaW5kKSB7XG5cdHJldHVybiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcbn1cblxubGV0IG5leHRLZXl3b3JkS2luZCA9IDBcbmNvbnN0XG5cdGtleXdvcmROYW1lVG9LaW5kID0gbmV3IE1hcCgpLFxuXHRrZXl3b3JkS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0bmFtZUtleXdvcmRzID0gbmV3IFNldCgpLFxuXHRyZXNlcnZlZEtleXdvcmRzID0gbmV3IFNldCgpXG4vLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cbi8vIFdoZW4gbGV4aW5nIGEgbmFtZSwgYSBtYXAgbG9va3VwIGlzIGRvbmUgYnkga2V5d29yZEtpbmRGcm9tTmFtZS5cbmZ1bmN0aW9uIGt3KG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGt3Tm90TmFtZShuYW1lKVxuXHRuYW1lS2V5d29yZHMuYWRkKGtpbmQpXG5cdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCBraW5kKVxuXHRyZXR1cm4ga2luZFxufVxuLy8gVGhlc2Uga2V5d29yZHMgbXVzdCBiZSBsZXhlZCBzcGVjaWFsbHkuXG5mdW5jdGlvbiBrd05vdE5hbWUoZGVidWdOYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBuZXh0S2V5d29yZEtpbmRcblx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0bmV4dEtleXdvcmRLaW5kID0gbmV4dEtleXdvcmRLaW5kICsgMVxuXHRyZXR1cm4ga2luZFxufVxuZnVuY3Rpb24ga3dSZXNlcnZlZChuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrdyhuYW1lKVxuXHRyZXNlcnZlZEtleXdvcmRzLmFkZChraW5kKVxufVxuXG5jb25zdCByZXNlcnZlZFdvcmRzID0gW1xuXHQvLyBKYXZhU2NyaXB0IHJlc2VydmVkIHdvcmRzXG5cdCdlbnVtJyxcblx0J2ltcGxlbWVudHMnLFxuXHQnaW50ZXJmYWNlJyxcblx0J3BhY2thZ2UnLFxuXHQncHJpdmF0ZScsXG5cdCdwcm90ZWN0ZWQnLFxuXHQncHVibGljJyxcblxuXHQvLyBKYXZhU2NyaXB0IGtleXdvcmRzXG5cdCdhcmd1bWVudHMnLFxuXHQnYXN5bmMnLFxuXHQnYXdhaXQnLFxuXHQnY29uc3QnLFxuXHQnZGVsZXRlJyxcblx0J2V2YWwnLFxuXHQnaW4nLFxuXHQnaW5zdGFuY2VvZicsXG5cdCdsZXQnLFxuXHQncmV0dXJuJyxcblx0J3R5cGVvZicsXG5cdCd2YXInLFxuXHQndm9pZCcsXG5cdCd3aGlsZScsXG5cblx0Ly8gTWFzb24gcmVzZXJ2ZWQgd29yZHNcblx0JyEnLFxuXHQnYWJzdHJhY3QnLFxuXHQnYWN0b3InLFxuXHQnYXdhaXQhJyxcblx0J2RhdGEnLFxuXHQnZGVsPycsXG5cdCdlbHNlIScsXG5cdCdmaW5hbCcsXG5cdCdpcycsXG5cdCdtZXRhJyxcblx0J291dCcsXG5cdCdzZW5kJyxcblx0J3NlbmQhJyxcblx0J3RvJyxcblx0J3R5cGUnLFxuXHQndW50aWwnLFxuXHQndW50aWwhJyxcblx0J3doaWxlISdcbl1cblxuZm9yIChjb25zdCBuYW1lIG9mIHJlc2VydmVkV29yZHMpXG5cdGt3UmVzZXJ2ZWQobmFtZSlcblxuLyoqIEtpbmRzIG9mIHtAbGluayBLZXl3b3JkfS4gKi9cbmV4cG9ydCBjb25zdCBLZXl3b3JkcyA9IHtcblx0QW1wZXJzYW5kOiBrd05vdE5hbWUoJyYnKSxcblx0QW5kOiBrdygnYW5kJyksXG5cdEFzOiBrdygnYXMnKSxcblx0QXNzZXJ0OiBrdygnYXNzZXJ0JyksXG5cdEFzc2VydE5vdDoga3coJ2ZvcmJpZCcpLFxuXHRBc3NpZ246IGt3KCc9JyksXG5cdEFzc2lnbk11dGFibGU6IGt3Tm90TmFtZSgnOjo9JyksXG5cdExvY2FsTXV0YXRlOiBrd05vdE5hbWUoJzo9JyksXG5cdEJyZWFrOiBrdygnYnJlYWsnKSxcblx0QnVpbHQ6IGt3KCdidWlsdCcpLFxuXHRDYXNlOiBrdygnY2FzZScpLFxuXHRDYXRjaDoga3coJ2NhdGNoJyksXG5cdENvbmQ6IGt3KCdjb25kJyksXG5cdENsYXNzOiBrdygnY2xhc3MnKSxcblx0Q29uc3RydWN0OiBrdygnY29uc3RydWN0JyksXG5cdERlYnVnZ2VyOiBrdygnZGVidWdnZXInKSxcblx0RGVsOiBrdygnZGVsJyksXG5cdERvOiBrdygnZG8nKSxcblx0RG90OiBrd05vdE5hbWUoJy4nKSxcblx0RG90Mjoga3dOb3ROYW1lKCcuLicpLFxuXHREb3QzOiBrd05vdE5hbWUoJy4uLiAnKSxcblx0RWxzZToga3coJ2Vsc2UnKSxcblx0RXhjZXB0OiBrdygnZXhjZXB0JyksXG5cdEZhbHNlOiBrdygnZmFsc2UnKSxcblx0RmluYWxseToga3coJ2ZpbmFsbHknKSxcblx0Rm9jdXM6IGt3KCdfJyksXG5cdEZvckJhZzoga3coJ0Bmb3InKSxcblx0Rm9yOiBrdygnZm9yJyksXG5cdEZ1bjoga3dOb3ROYW1lKCd8JyksXG5cdEZ1bkRvOiBrd05vdE5hbWUoJyF8JyksXG5cdEZ1blRoaXM6IGt3Tm90TmFtZSgnLnwnKSxcblx0RnVuVGhpc0RvOiBrd05vdE5hbWUoJy4hfCcpLFxuXHRGdW5Bc3luYzoga3dOb3ROYW1lKCckfCcpLFxuXHRGdW5Bc3luY0RvOiBrd05vdE5hbWUoJyQhfCcpLFxuXHRGdW5UaGlzQXN5bmM6IGt3Tm90TmFtZSgnLiR8JyksXG5cdEZ1blRoaXNBc3luY0RvOiBrd05vdE5hbWUoJy4kIXwnKSxcblx0RnVuR2VuOiBrd05vdE5hbWUoJ358JyksXG5cdEZ1bkdlbkRvOiBrd05vdE5hbWUoJ34hfCcpLFxuXHRGdW5UaGlzR2VuOiBrd05vdE5hbWUoJy5+fCcpLFxuXHRGdW5UaGlzR2VuRG86IGt3Tm90TmFtZSgnLn4hfCcpLFxuXHRHZXQ6IGt3KCdnZXQnKSxcblx0SWY6IGt3KCdpZicpLFxuXHRJZ25vcmU6IGt3KCdpZ25vcmUnKSxcblx0S2luZDoga3coJ2tpbmQnKSxcblx0TGF6eToga3dOb3ROYW1lKCd+JyksXG5cdExlc3M6IGt3KCc8JyksXG5cdE1hcEVudHJ5OiBrdygnLT4nKSxcblx0TW9yZToga3coJz4nKSxcblx0TmFtZToga3coJ25hbWUnKSxcblx0TmV3OiBrdygnbmV3JyksXG5cdE5vdDoga3coJ25vdCcpLFxuXHROdWxsOiBrdygnbnVsbCcpLFxuXHRPYmpBc3NpZ246IGt3Tm90TmFtZSgnLiAnKSxcblx0T2Y6IGt3KCdvZicpLFxuXHRPcjoga3coJ29yJyksXG5cdFBhc3M6IGt3KCdwYXNzJyksXG5cdFJlZ2lvbjoga3coJ3JlZ2lvbicpLFxuXHRTZXQ6IGt3KCdzZXQnKSxcblx0U3VwZXI6IGt3KCdzdXBlcicpLFxuXHRTdGF0aWM6IGt3KCdzdGF0aWMnKSxcblx0U3dpdGNoOiBrdygnc3dpdGNoJyksXG5cdFRpY2s6IGt3Tm90TmFtZSgnXFwnJyksXG5cdFRocm93OiBrdygndGhyb3cnKSxcblx0VG9kbzoga3coJ3RvZG8nKSxcblx0VHJ1ZToga3coJ3RydWUnKSxcblx0VHJ5OiBrdygndHJ5JyksXG5cdFR5cGU6IGt3Tm90TmFtZSgnOicpLFxuXHRVbmRlZmluZWQ6IGt3KCd1bmRlZmluZWQnKSxcblx0VW5sZXNzOiBrdygndW5sZXNzJyksXG5cdEltcG9ydDoga3coJ2ltcG9ydCcpLFxuXHRJbXBvcnREbzoga3coJ2ltcG9ydCEnKSxcblx0SW1wb3J0TGF6eToga3coJ2ltcG9ydH4nKSxcblx0V2l0aDoga3coJ3dpdGgnKSxcblx0WWllbGQ6IGt3KCc8ficpLFxuXHRZaWVsZFRvOiBrdygnPH5+Jylcbn1cblxuLyoqXG5OYW1lIG9mIGEga2V5d29yZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtpbmRcbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24ga2V5d29yZE5hbWUoa2luZCkge1xuXHRyZXR1cm4ga2V5d29yZEtpbmRUb05hbWUuZ2V0KGtpbmQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93S2V5d29yZChraW5kKSB7XG5cdHJldHVybiBjb2RlKGtleXdvcmROYW1lKGtpbmQpKVxufVxuXG4vKipcblNlZSBpZiB0aGUgbmFtZSBpcyBhIGtleXdvcmQgYW5kIGlmIHNvIHJldHVybiBpdHMga2luZC5cbkByZXR1cm4gez9LZXl3b3Jkc31cbiovXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGtleXdvcmROYW1lVG9LaW5kLmdldChuYW1lKVxuXHRyZXR1cm4ga2luZCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGtpbmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQoa2luZCkge1xuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZhbHNlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLkZhbHNlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5OYW1lOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLk5hbWVcblx0XHRjYXNlIEtleXdvcmRzLk51bGw6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTnVsbFxuXHRcdGNhc2UgS2V5d29yZHMuVHJ1ZTpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5UcnVlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5VbmRlZmluZWQ6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuVW5kZWZpbmVkXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBudWxsXG5cdH1cbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBHcm91cCBvZiB0aGUgZ2l2ZW4ga2luZC5cbkBwYXJhbSB7R3JvdXBzfSBncm91cEtpbmRcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR3JvdXAoZ3JvdXBLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBHcm91cCAmJiB0b2tlbi5raW5kID09PSBncm91cEtpbmRcbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2V5d29yZEtpbmRcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzS2V5d29yZChrZXl3b3JkS2luZCwgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiB0b2tlbi5raW5kID09PSBrZXl3b3JkS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgYW55IG9mIHRoZSBnaXZlbiBraW5kcy5cbkBwYXJhbSB7U2V0fSBrZXl3b3JkS2luZHNcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQW55S2V5d29yZChrZXl3b3JkS2luZHMsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYga2V5d29yZEtpbmRzLmhhcyh0b2tlbi5raW5kKVxufVxuXG4vKiogV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCB3aG9zZSB2YWx1ZSBjYW4gYmUgdXNlZCBhcyBhIHByb3BlcnR5IG5hbWUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lS2V5d29yZCh0b2tlbikge1xuXHRyZXR1cm4gaXNBbnlLZXl3b3JkKG5hbWVLZXl3b3JkcywgdG9rZW4pXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSByZXNlcnZlZCB3b3JkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVzZXJ2ZWRLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQocmVzZXJ2ZWRLZXl3b3JkcywgdG9rZW4pXG59XG4iXX0=
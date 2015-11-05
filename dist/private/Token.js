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

	const reservedWords = ['enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'arguments', 'async', 'await', 'const', 'delete', 'eval', 'in', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while', '!', '<', '>', 'abstract', 'actor', 'data', 'del?', 'do-while', 'do-until', 'final', 'is', 'meta', 'method', 'out', 'override', 'send', 'to', 'type', 'until'];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0E4SmdCLGFBQWEsR0FBYixhQUFhO1NBcUtiLFdBQVcsR0FBWCxXQUFXO1NBSVgsV0FBVyxHQUFYLFdBQVc7U0FRWCxxQkFBcUIsR0FBckIscUJBQXFCO1NBS3JCLCtCQUErQixHQUEvQiwrQkFBK0I7U0FzQi9CLE9BQU8sR0FBUCxPQUFPO1NBU1AsU0FBUyxHQUFULFNBQVM7U0FTVCxZQUFZLEdBQVosWUFBWTtTQUtaLGFBQWEsR0FBYixhQUFhO1NBS2IsaUJBQWlCLEdBQWpCLGlCQUFpQjs7T0F0WFosS0FBSzs7Ozs7OzttQkFBTCxLQUFLOztPQVViLEtBQUs7Ozs7Ozs7Ozs7Ozs7U0FBTCxLQUFLLEdBQUwsS0FBSzs7T0F5QkwsT0FBTzs7Ozs7Ozs7Ozs7O1NBQVAsT0FBTyxHQUFQLE9BQU87O09BZ0JQLElBQUk7Ozs7Ozs7Ozs7OztTQUFKLElBQUksR0FBSixJQUFJOztPQWlCSixVQUFVOzs7Ozs7Ozs7Ozs7U0FBVixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7T0EwQlYsTUFBTSxXQUFOLE1BQU0sR0FBRzs7Ozs7Ozs7QUFVckIsYUFBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRXBCLFNBQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDOzs7Ozs7QUFNaEIsT0FBSyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQzs7Ozs7QUFLMUIsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Ozs7Ozs7Ozs7OztBQVlqQixNQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs7Ozs7O0FBTWYsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7RUFDakI7O1VBTWUsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Ba0ZoQixRQUFRLFdBQVIsUUFBUSxHQUFHO0FBQ3ZCLFdBQVMsRUFBRSxTQUFT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LHFCQUFxQjs7Ozs7VUFLckIsK0JBQStCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBc0IvQixPQUFPOzs7O1VBU1AsU0FBUzs7OztVQVNULFlBQVk7Ozs7VUFLWixhQUFhOzs7O1VBS2IsaUJBQWlCIiwiZmlsZSI6IlRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQge1NwZWNpYWxWYWxzfSBmcm9tICcuL01zQXN0J1xuXG4vKipcbkxleGVkIGVsZW1lbnQgaW4gYSB0cmVlIG9mIFRva2Vucy5cblxuU2luY2Uge0BsaW5rIGxleH0gZG9lcyBncm91cGluZywge0BsaW5rIHBhcnNlfSBhdm9pZHMgZG9pbmcgbXVjaCBvZiB0aGUgd29yayBwYXJzZXJzIHVzdWFsbHkgZG87XG5pdCBkb2Vzbid0IGhhdmUgdG8gaGFuZGxlIGEgXCJsZWZ0IHBhcmVudGhlc2lzXCIsIG9ubHkgYSB7QGxpbmsgR3JvdXB9IG9mIGtpbmQgR19QYXJlbnRoZXNpcy5cblRoaXMgYWxzbyBtZWFucyB0aGF0IHRoZSBtYW55IGRpZmZlcmVudCB7QGxpbmsgTXNBc3R9IHR5cGVzIGFsbCBwYXJzZSBpbiBhIHNpbWlsYXIgbWFubmVyLFxua2VlcGluZyB0aGUgbGFuZ3VhZ2UgY29uc2lzdGVudC5cblxuQmVzaWRlcyB7QGxpbmsgR3JvdXB9LCB7QGxpbmsgS2V5d29yZH0sIHtAbGluayBOYW1lfSwgYW5kIHtAbGluayBEb2NDb21tZW50fSxcbntAbGluayBOdW1iZXJMaXRlcmFsfSB2YWx1ZXMgYXJlIGFsc28gdHJlYXRlZCBhcyBUb2tlbnMuXG5cbkBhYnN0cmFjdFxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxufVxuXG4vKipcbkNvbnRhaW5zIG11bHRpcGxlIHN1Yi10b2tlbnMuXG5TZWUge0BsaW5rIEdyb3VwS2luZH0gZm9yIGV4cGxhbmF0aW9ucy5cbiovXG5leHBvcnQgY2xhc3MgR3JvdXAgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgc3ViVG9rZW5zLCBraW5kKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKlxuXHRcdFRva2VucyB3aXRoaW4gdGhpcyBncm91cC5cblx0XHRAdHlwZSB7QXJyYXk8VG9rZW4+fVxuXHRcdCovXG5cdFx0dGhpcy5zdWJUb2tlbnMgPSBzdWJUb2tlbnNcblx0XHQvKiogQHR5cGUge0dyb3Vwc30gKi9cblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gYCR7Z3JvdXBLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpfWBcblx0fVxufVxuXG4vKipcbkEgXCJrZXl3b3JkXCIgaXMgYW55IHNldCBvZiBjaGFyYWN0ZXJzIHdpdGggYSBwYXJ0aWN1bGFyIG1lYW5pbmcuXG5JdCBkb2Vuc24ndCBuZWNlc3NhcmlseSBoYXZlIHRvIGJlIHNvbWV0aGluZyB0aGF0IG1pZ2h0IGhhdmUgYmVlbiBhIHtAbGluayBOYW1lfS5cbkZvciBleGFtcGxlLCBzZWUge0BsaW5rIEtleXdvcmRzLk9iakVudHJ5fS5cblxuVGhpcyBjYW4gZXZlbiBpbmNsdWRlIG9uZXMgbGlrZSBgLiBgIChkZWZpbmVzIGFuIG9iamVjdCBwcm9wZXJ0eSwgYXMgaW4gYGtleS4gdmFsdWVgKS5cbktpbmQgaXMgYSAqKiouIFNlZSB0aGUgZnVsbCBsaXN0IGJlbG93LlxuKi9cbmV4cG9ydCBjbGFzcyBLZXl3b3JkIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtLZXl3b3Jkc30gKi9cblx0XHR0aGlzLmtpbmQgPSBraW5kXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gc2hvd0tleXdvcmQodGhpcy5raW5kKVxuXHR9XG59XG5cbi8qKlxuQW4gaWRlbnRpZmllci4gVXN1YWxseSB0aGUgbmFtZSBvZiBzb21lIGxvY2FsIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuQSBOYW1lIGlzIGd1YXJhbnRlZWQgdG8gbm90IGJlIGFueSBrZXl3b3JkLlxuKi9cbmV4cG9ydCBjbGFzcyBOYW1lIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGNvZGUodGhpcy5uYW1lKVxuXHR9XG59XG5cbi8qKlxuRG9jdW1lbnRhdGlvbiBjb21tZW50IChiZWdpbm5pbmcgd2l0aCBvbmUgYHxgIHJhdGhlciB0aGFuIHR3bykuXG5Ob24tZG9jIGNvbW1lbnRzIGFyZSBpZ25vcmVkIGJ5IHtAbGluayBsZXh9LlxuVGhlc2UgZG9uJ3QgYWZmZWN0IG91dHB1dCwgYnV0IGFyZSBwYXNzZWQgdG8gdmFyaW91cyB7QGxpbmsgTXNBc3R9cyBmb3IgdXNlIGJ5IG90aGVyIHRvb2xzLlxuKi9cbmV4cG9ydCBjbGFzcyBEb2NDb21tZW50IGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHRleHQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy50ZXh0ID0gdGV4dFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuICdkb2MgY29tbWVudCdcblx0fVxufVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cblxuLyoqXG5LaW5kcyBvZiB7QGxpbmsgR3JvdXB9LlxuQGVudW0ge251bWJlcn1cbiovXG5leHBvcnQgY29uc3QgR3JvdXBzID0ge1xuXHQvKipcblx0VG9rZW5zIHN1cnJvdW5kZWQgYnkgcGFyZW50aGVzZXMuXG5cdFRoZXJlIG1heSBiZSBubyBjbG9zaW5nIHBhcmVudGhlc2lzLiBJbjpcblxuXHRcdGEgKGJcblx0XHRcdGNcblxuXHRUaGUgdG9rZW5zIGFyZSBhIEdyb3VwPExpbmU+KE5hbWUsIEdyb3VwPFBhcmVudGhlc2lzPiguLi4pKVxuXHQqL1xuXHRQYXJlbnRoZXNpczogZygnKCknKSxcblx0LyoqIExpa2UgYFBhcmVudGhlc2lzYCwgYnV0IHNpbXBsZXIgYmVjYXVzZSB0aGVyZSBtdXN0IGJlIGEgY2xvc2luZyBgXWAuICovXG5cdEJyYWNrZXQ6IGcoJ1tdJyksXG5cdC8qKlxuXHRMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0U3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBgTGluZWAgZ3JvdXBzLlxuXHROb3RlIHRoYXQgYEJsb2NrYHMgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0Ki9cblx0QmxvY2s6IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8qKlxuXHRUb2tlbnMgd2l0aGluIGEgcXVvdGUuXG5cdGBzdWJUb2tlbnNgIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0Ki9cblx0UXVvdGU6IGcoJ3F1b3RlJyksXG5cdC8qKlxuXHRUb2tlbnMgb24gYSBsaW5lLlxuXHRUaGUgaW5kZW50ZWQgYmxvY2sgZm9sbG93aW5nIHRoZSBlbmQgb2YgdGhlIGxpbmUgaXMgY29uc2lkZXJlZCB0byBiZSBhIHBhcnQgb2YgdGhlIGxpbmUhXG5cdFRoaXMgbWVhbnMgdGhhdCBpbiB0aGlzIGNvZGU6XG5cdFx0YVxuXHRcdFx0YlxuXHRcdFx0Y1xuXHRcdGRcblx0VGhlcmUgYXJlIDIgbGluZXMsIG9uZSBzdGFydGluZyB3aXRoICdhJyBhbmQgb25lIHN0YXJ0aW5nIHdpdGggJ2QnLlxuXHRUaGUgZmlyc3QgbGluZSBjb250YWlucyAnYScgYW5kIGEgYEJsb2NrYCB3aGljaCBpbiB0dXJuIGNvbnRhaW5zIHR3byBvdGhlciBsaW5lcy5cblx0Ki9cblx0TGluZTogZygnbGluZScpLFxuXHQvKipcblx0R3JvdXBzIHR3byBvciBtb3JlIHRva2VucyB0aGF0IGFyZSAqbm90KiBzZXBhcmF0ZWQgYnkgc3BhY2VzLlxuXHRgYVtiXS5jYCBpcyBhbiBleGFtcGxlLlxuXHRBIHNpbmdsZSB0b2tlbiBvbiBpdHMgb3duIHdpbGwgbm90IGJlIGdpdmVuIGEgYFNwYWNlYCBncm91cC5cblx0Ki9cblx0U3BhY2U6IGcoJ3NwYWNlJylcbn1cblxuLyoqXG5PdXRwdXR0YWJsZSBkZXNjcmlwdGlvbiBvZiBhIGdyb3VwIGtpbmQuXG5AcGFyYW0ge0dyb3Vwc30gZ3JvdXBLaW5kXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dHcm91cEtpbmQoZ3JvdXBLaW5kKSB7XG5cdHJldHVybiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcbn1cblxubGV0IG5leHRLZXl3b3JkS2luZCA9IDBcbmNvbnN0XG5cdGtleXdvcmROYW1lVG9LaW5kID0gbmV3IE1hcCgpLFxuXHRrZXl3b3JkS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0bmFtZUtleXdvcmRzID0gbmV3IFNldCgpLFxuXHRyZXNlcnZlZEtleXdvcmRzID0gbmV3IFNldCgpXG4vLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cbi8vIFdoZW4gbGV4aW5nIGEgbmFtZSwgYSBtYXAgbG9va3VwIGlzIGRvbmUgYnkga2V5d29yZEtpbmRGcm9tTmFtZS5cbmZ1bmN0aW9uIGt3KG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGt3Tm90TmFtZShuYW1lKVxuXHRuYW1lS2V5d29yZHMuYWRkKGtpbmQpXG5cdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCBraW5kKVxuXHRyZXR1cm4ga2luZFxufVxuLy8gVGhlc2Uga2V5d29yZHMgbXVzdCBiZSBsZXhlZCBzcGVjaWFsbHkuXG5mdW5jdGlvbiBrd05vdE5hbWUoZGVidWdOYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBuZXh0S2V5d29yZEtpbmRcblx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0bmV4dEtleXdvcmRLaW5kID0gbmV4dEtleXdvcmRLaW5kICsgMVxuXHRyZXR1cm4ga2luZFxufVxuZnVuY3Rpb24ga3dSZXNlcnZlZChuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrdyhuYW1lKVxuXHRyZXNlcnZlZEtleXdvcmRzLmFkZChraW5kKVxufVxuXG5jb25zdCByZXNlcnZlZFdvcmRzID0gW1xuXHQvLyBKYXZhU2NyaXB0IHJlc2VydmVkIHdvcmRzXG5cdCdlbnVtJyxcblx0J2ltcGxlbWVudHMnLFxuXHQnaW50ZXJmYWNlJyxcblx0J3BhY2thZ2UnLFxuXHQncHJpdmF0ZScsXG5cdCdwcm90ZWN0ZWQnLFxuXHQncHVibGljJyxcblxuXHQvLyBKYXZhU2NyaXB0IGtleXdvcmRzXG5cdCdhcmd1bWVudHMnLFxuXHQnYXN5bmMnLFxuXHQnYXdhaXQnLFxuXHQnY29uc3QnLFxuXHQnZGVsZXRlJyxcblx0J2V2YWwnLFxuXHQnaW4nLFxuXHQnaW5zdGFuY2VvZicsXG5cdCdsZXQnLFxuXHQncmV0dXJuJyxcblx0J3R5cGVvZicsXG5cdCd2YXInLFxuXHQndm9pZCcsXG5cdCd3aGlsZScsXG5cblx0Ly8gTWFzb24gcmVzZXJ2ZWQgd29yZHNcblx0JyEnLFxuXHQnPCcsXG5cdCc+Jyxcblx0J2Fic3RyYWN0Jyxcblx0J2FjdG9yJyxcblx0J2RhdGEnLFxuXHQnZGVsPycsXG5cdCdkby13aGlsZScsXG5cdCdkby11bnRpbCcsXG5cdCdmaW5hbCcsXG5cdCdpcycsXG5cdCdtZXRhJyxcblx0J21ldGhvZCcsXG5cdCdvdXQnLFxuXHQnb3ZlcnJpZGUnLFxuXHQnc2VuZCcsXG5cdCd0bycsXG5cdCd0eXBlJyxcblx0J3VudGlsJ1xuXVxuXG5mb3IgKGNvbnN0IG5hbWUgb2YgcmVzZXJ2ZWRXb3Jkcylcblx0a3dSZXNlcnZlZChuYW1lKVxuXG4vKiogS2luZHMgb2Yge0BsaW5rIEtleXdvcmR9LiAqL1xuZXhwb3J0IGNvbnN0IEtleXdvcmRzID0ge1xuXHRBbXBlcnNhbmQ6IGt3Tm90TmFtZSgnJicpLFxuXHRBbmQ6IGt3KCdhbmQnKSxcblx0QXM6IGt3KCdhcycpLFxuXHRBc3NlcnQ6IGt3KCdhc3NlcnQnKSxcblx0QXNzZXJ0Tm90OiBrdygnZm9yYmlkJyksXG5cdEFzc2lnbjoga3coJz0nKSxcblx0QXNzaWduTXV0YWJsZToga3dOb3ROYW1lKCc6Oj0nKSxcblx0TG9jYWxNdXRhdGU6IGt3Tm90TmFtZSgnOj0nKSxcblx0QnJlYWs6IGt3KCdicmVhaycpLFxuXHRCdWlsdDoga3coJ2J1aWx0JyksXG5cdENhc2U6IGt3KCdjYXNlJyksXG5cdENhdGNoOiBrdygnY2F0Y2gnKSxcblx0Q29uZDoga3coJ2NvbmQnKSxcblx0Q2xhc3M6IGt3KCdjbGFzcycpLFxuXHRDb25zdHJ1Y3Q6IGt3KCdjb25zdHJ1Y3QnKSxcblx0RGVidWdnZXI6IGt3KCdkZWJ1Z2dlcicpLFxuXHREZWw6IGt3KCdkZWwnKSxcblx0RG86IGt3KCdkbycpLFxuXHREb3Q6IGt3Tm90TmFtZSgnLicpLFxuXHREb3QyOiBrd05vdE5hbWUoJy4uJyksXG5cdERvdDM6IGt3Tm90TmFtZSgnLi4uICcpLFxuXHRFbHNlOiBrdygnZWxzZScpLFxuXHRFeGNlcHQ6IGt3KCdleGNlcHQnKSxcblx0RmFsc2U6IGt3KCdmYWxzZScpLFxuXHRGaW5hbGx5OiBrdygnZmluYWxseScpLFxuXHRGb2N1czoga3coJ18nKSxcblx0Rm9yQmFnOiBrdygnQGZvcicpLFxuXHRGb3I6IGt3KCdmb3InKSxcblx0RnVuOiBrd05vdE5hbWUoJ3wnKSxcblx0RnVuRG86IGt3Tm90TmFtZSgnIXwnKSxcblx0RnVuVGhpczoga3dOb3ROYW1lKCcufCcpLFxuXHRGdW5UaGlzRG86IGt3Tm90TmFtZSgnLiF8JyksXG5cdEZ1bkFzeW5jOiBrd05vdE5hbWUoJyR8JyksXG5cdEZ1bkFzeW5jRG86IGt3Tm90TmFtZSgnJCF8JyksXG5cdEZ1blRoaXNBc3luYzoga3dOb3ROYW1lKCcuJHwnKSxcblx0RnVuVGhpc0FzeW5jRG86IGt3Tm90TmFtZSgnLiQhfCcpLFxuXHRGdW5HZW46IGt3Tm90TmFtZSgnfnwnKSxcblx0RnVuR2VuRG86IGt3Tm90TmFtZSgnfiF8JyksXG5cdEZ1blRoaXNHZW46IGt3Tm90TmFtZSgnLn58JyksXG5cdEZ1blRoaXNHZW5Ebzoga3dOb3ROYW1lKCcufiF8JyksXG5cdEdldDoga3coJ2dldCcpLFxuXHRJZjoga3coJ2lmJyksXG5cdElnbm9yZToga3coJ2lnbm9yZScpLFxuXHRLaW5kOiBrdygna2luZCcpLFxuXHRMYXp5OiBrd05vdE5hbWUoJ34nKSxcblx0TGVzczoga3coJzwnKSxcblx0TWFwRW50cnk6IGt3KCctPicpLFxuXHRNb3JlOiBrdygnPicpLFxuXHROYW1lOiBrdygnbmFtZScpLFxuXHROZXc6IGt3KCduZXcnKSxcblx0Tm90OiBrdygnbm90JyksXG5cdE51bGw6IGt3KCdudWxsJyksXG5cdE9iakFzc2lnbjoga3dOb3ROYW1lKCcuICcpLFxuXHRPZjoga3coJ29mJyksXG5cdE9yOiBrdygnb3InKSxcblx0UGFzczoga3coJ3Bhc3MnKSxcblx0UmVnaW9uOiBrdygncmVnaW9uJyksXG5cdFNldDoga3coJ3NldCcpLFxuXHRTdXBlcjoga3coJ3N1cGVyJyksXG5cdFN0YXRpYzoga3coJ3N0YXRpYycpLFxuXHRTd2l0Y2g6IGt3KCdzd2l0Y2gnKSxcblx0VGljazoga3dOb3ROYW1lKCdcXCcnKSxcblx0VGhyb3c6IGt3KCd0aHJvdycpLFxuXHRUb2RvOiBrdygndG9kbycpLFxuXHRUcnVlOiBrdygndHJ1ZScpLFxuXHRUcnk6IGt3KCd0cnknKSxcblx0VHlwZToga3dOb3ROYW1lKCc6JyksXG5cdFVuZGVmaW5lZDoga3coJ3VuZGVmaW5lZCcpLFxuXHRVbmxlc3M6IGt3KCd1bmxlc3MnKSxcblx0SW1wb3J0OiBrdygnaW1wb3J0JyksXG5cdEltcG9ydERvOiBrdygnaW1wb3J0IScpLFxuXHRJbXBvcnRMYXp5OiBrdygnaW1wb3J0ficpLFxuXHRXaXRoOiBrdygnd2l0aCcpLFxuXHRZaWVsZDoga3coJzx+JyksXG5cdFlpZWxkVG86IGt3KCc8fn4nKVxufVxuXG4vKipcbk5hbWUgb2YgYSBrZXl3b3JkLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2luZFxuQHJldHVybiB7c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXl3b3JkTmFtZShraW5kKSB7XG5cdHJldHVybiBrZXl3b3JkS2luZFRvTmFtZS5nZXQoa2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dLZXl3b3JkKGtpbmQpIHtcblx0cmV0dXJuIGNvZGUoa2V5d29yZE5hbWUoa2luZCkpXG59XG5cbi8qKlxuU2VlIGlmIHRoZSBuYW1lIGlzIGEga2V5d29yZCBhbmQgaWYgc28gcmV0dXJuIGl0cyBraW5kLlxuQHJldHVybiB7P0tleXdvcmRzfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSkge1xuXHRjb25zdCBraW5kID0ga2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpXG5cdHJldHVybiBraW5kID09PSB1bmRlZmluZWQgPyBudWxsIDoga2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZChraW5kKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRmFsc2U6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuRmFsc2Vcblx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTmFtZVxuXHRcdGNhc2UgS2V5d29yZHMuTnVsbDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OdWxsXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcnVlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlRydWVcblx0XHRjYXNlIEtleXdvcmRzLlVuZGVmaW5lZDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5VbmRlZmluZWRcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEdyb3VwIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNHcm91cChncm91cEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNLZXl3b3JkKGtleXdvcmRLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiBhbnkgb2YgdGhlIGdpdmVuIGtpbmRzLlxuQHBhcmFtIHtTZXR9IGtleXdvcmRLaW5kc1xuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNBbnlLZXl3b3JkKGtleXdvcmRLaW5kcywgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIHdob3NlIHZhbHVlIGNhbiBiZSB1c2VkIGFzIGEgcHJvcGVydHkgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbilcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIHJlc2VydmVkIHdvcmQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChyZXNlcnZlZEtleXdvcmRzLCB0b2tlbilcbn1cbiJdfQ==
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0E4SmdCLGFBQWEsR0FBYixhQUFhO1NBK0tiLFdBQVcsR0FBWCxXQUFXO1NBUVgscUJBQXFCLEdBQXJCLHFCQUFxQjtTQUtyQiwrQkFBK0IsR0FBL0IsK0JBQStCO1NBc0IvQixPQUFPLEdBQVAsT0FBTztTQVNQLFNBQVMsR0FBVCxTQUFTO1NBU1QsWUFBWSxHQUFaLFlBQVk7U0FLWixhQUFhLEdBQWIsYUFBYTtTQUtiLGlCQUFpQixHQUFqQixpQkFBaUI7O09BNVhaLEtBQUs7Ozs7Ozs7bUJBQUwsS0FBSzs7T0FVYixLQUFLOzs7Ozs7Ozs7Ozs7O1NBQUwsS0FBSyxHQUFMLEtBQUs7O09BeUJMLE9BQU87Ozs7Ozs7Ozs7OztTQUFQLE9BQU8sR0FBUCxPQUFPOztPQWdCUCxJQUFJOzs7Ozs7Ozs7Ozs7U0FBSixJQUFJLEdBQUosSUFBSTs7T0FpQkosVUFBVTs7Ozs7Ozs7Ozs7O1NBQVYsVUFBVSxHQUFWLFVBQVU7Ozs7Ozs7Ozs7O09BMEJWLE1BQU0sV0FBTixNQUFNLEdBQUc7Ozs7Ozs7O0FBVXJCLGFBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDOztBQUVwQixTQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQzs7Ozs7O0FBTWhCLE9BQUssRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUM7Ozs7O0FBSzFCLE9BQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDOzs7Ozs7Ozs7Ozs7QUFZakIsTUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7Ozs7OztBQU1mLE9BQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO0VBQ2pCOztVQU1lLGFBQWE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWlGaEIsUUFBUSxXQUFSLFFBQVEsR0FBRztBQUN2QixXQUFTLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUN6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QVMsQ0FBQyxHQUFHLENBQUM7QUFDcEIsV0FBUyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUM7QUFDMUIsV0FBUyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDdkIsVUFBUSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFDdkIsUUFBTSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDcEIsVUFBUSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFDdkIsWUFBVSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFDekIsTUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDaEIsT0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDZixTQUFPLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztFQUNsQjs7VUFPZSxXQUFXOzs7O1VBUVgscUJBQXFCOzs7OztVQUtyQiwrQkFBK0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFzQi9CLE9BQU87Ozs7VUFTUCxTQUFTOzs7O1VBU1QsWUFBWTs7OztVQUtaLGFBQWE7Ozs7VUFLYixpQkFBaUIiLCJmaWxlIjoiVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7U3BlY2lhbFZhbHN9IGZyb20gJy4vTXNBc3QnXG5cbi8qKlxuTGV4ZWQgZWxlbWVudCBpbiBhIHRyZWUgb2YgVG9rZW5zLlxuXG5TaW5jZSB7QGxpbmsgbGV4fSBkb2VzIGdyb3VwaW5nLCB7QGxpbmsgcGFyc2V9IGF2b2lkcyBkb2luZyBtdWNoIG9mIHRoZSB3b3JrIHBhcnNlcnMgdXN1YWxseSBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIHtAbGluayBHcm91cH0gb2Yga2luZCBHX1BhcmVudGhlc2lzLlxuVGhpcyBhbHNvIG1lYW5zIHRoYXQgdGhlIG1hbnkgZGlmZmVyZW50IHtAbGluayBNc0FzdH0gdHlwZXMgYWxsIHBhcnNlIGluIGEgc2ltaWxhciBtYW5uZXIsXG5rZWVwaW5nIHRoZSBsYW5ndWFnZSBjb25zaXN0ZW50LlxuXG5CZXNpZGVzIHtAbGluayBHcm91cH0sIHtAbGluayBLZXl3b3JkfSwge0BsaW5rIE5hbWV9LCBhbmQge0BsaW5rIERvY0NvbW1lbnR9LFxue0BsaW5rIE51bWJlckxpdGVyYWx9IHZhbHVlcyBhcmUgYWxzbyB0cmVhdGVkIGFzIFRva2Vucy5cblxuQGFic3RyYWN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8qKlxuQ29udGFpbnMgbXVsdGlwbGUgc3ViLXRva2Vucy5cblNlZSB7QGxpbmsgR3JvdXBLaW5kfSBmb3IgZXhwbGFuYXRpb25zLlxuKi9cbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBzdWJUb2tlbnMsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqXG5cdFx0VG9rZW5zIHdpdGhpbiB0aGlzIGdyb3VwLlxuXHRcdEB0eXBlIHtBcnJheTxUb2tlbj59XG5cdFx0Ki9cblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdC8qKiBAdHlwZSB7R3JvdXBzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBgJHtncm91cEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCl9YFxuXHR9XG59XG5cbi8qKlxuQSBcImtleXdvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cbkl0IGRvZW5zbid0IG5lY2Vzc2FyaWx5IGhhdmUgdG8gYmUgc29tZXRoaW5nIHRoYXQgbWlnaHQgaGF2ZSBiZWVuIGEge0BsaW5rIE5hbWV9LlxuRm9yIGV4YW1wbGUsIHNlZSB7QGxpbmsgS2V5d29yZHMuT2JqRW50cnl9LlxuXG5UaGlzIGNhbiBldmVuIGluY2x1ZGUgb25lcyBsaWtlIGAuIGAgKGRlZmluZXMgYW4gb2JqZWN0IHByb3BlcnR5LCBhcyBpbiBga2V5LiB2YWx1ZWApLlxuS2luZCBpcyBhICoqKi4gU2VlIHRoZSBmdWxsIGxpc3QgYmVsb3cuXG4qL1xuZXhwb3J0IGNsYXNzIEtleXdvcmQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge0tleXdvcmRzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKGtleXdvcmRLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpKVxuXHR9XG59XG5cbi8qKlxuQW4gaWRlbnRpZmllci4gVXN1YWxseSB0aGUgbmFtZSBvZiBzb21lIGxvY2FsIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuQSBOYW1lIGlzIGd1YXJhbnRlZWQgdG8gbm90IGJlIGFueSBrZXl3b3JkLlxuKi9cbmV4cG9ydCBjbGFzcyBOYW1lIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGNvZGUodGhpcy5uYW1lKVxuXHR9XG59XG5cbi8qKlxuRG9jdW1lbnRhdGlvbiBjb21tZW50IChiZWdpbm5pbmcgd2l0aCBvbmUgYHxgIHJhdGhlciB0aGFuIHR3bykuXG5Ob24tZG9jIGNvbW1lbnRzIGFyZSBpZ25vcmVkIGJ5IHtAbGluayBsZXh9LlxuVGhlc2UgZG9uJ3QgYWZmZWN0IG91dHB1dCwgYnV0IGFyZSBwYXNzZWQgdG8gdmFyaW91cyB7QGxpbmsgTXNBc3R9cyBmb3IgdXNlIGJ5IG90aGVyIHRvb2xzLlxuKi9cbmV4cG9ydCBjbGFzcyBEb2NDb21tZW50IGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHRleHQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy50ZXh0ID0gdGV4dFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuICdkb2MgY29tbWVudCdcblx0fVxufVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cblxuLyoqXG5LaW5kcyBvZiB7QGxpbmsgR3JvdXB9LlxuQGVudW0ge251bWJlcn1cbiovXG5leHBvcnQgY29uc3QgR3JvdXBzID0ge1xuXHQvKipcblx0VG9rZW5zIHN1cnJvdW5kZWQgYnkgcGFyZW50aGVzZXMuXG5cdFRoZXJlIG1heSBiZSBubyBjbG9zaW5nIHBhcmVudGhlc2lzLiBJbjpcblxuXHRcdGEgKGJcblx0XHRcdGNcblxuXHRUaGUgdG9rZW5zIGFyZSBhIEdyb3VwPExpbmU+KE5hbWUsIEdyb3VwPFBhcmVudGhlc2lzPiguLi4pKVxuXHQqL1xuXHRQYXJlbnRoZXNpczogZygnKCknKSxcblx0LyoqIExpa2UgYFBhcmVudGhlc2lzYCwgYnV0IHNpbXBsZXIgYmVjYXVzZSB0aGVyZSBtdXN0IGJlIGEgY2xvc2luZyBgXWAuICovXG5cdEJyYWNrZXQ6IGcoJ1tdJyksXG5cdC8qKlxuXHRMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0U3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBgTGluZWAgZ3JvdXBzLlxuXHROb3RlIHRoYXQgYEJsb2NrYHMgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0Ki9cblx0QmxvY2s6IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8qKlxuXHRUb2tlbnMgd2l0aGluIGEgcXVvdGUuXG5cdGBzdWJUb2tlbnNgIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0Ki9cblx0UXVvdGU6IGcoJ3F1b3RlJyksXG5cdC8qKlxuXHRUb2tlbnMgb24gYSBsaW5lLlxuXHRUaGUgaW5kZW50ZWQgYmxvY2sgZm9sbG93aW5nIHRoZSBlbmQgb2YgdGhlIGxpbmUgaXMgY29uc2lkZXJlZCB0byBiZSBhIHBhcnQgb2YgdGhlIGxpbmUhXG5cdFRoaXMgbWVhbnMgdGhhdCBpbiB0aGlzIGNvZGU6XG5cdFx0YVxuXHRcdFx0YlxuXHRcdFx0Y1xuXHRcdGRcblx0VGhlcmUgYXJlIDIgbGluZXMsIG9uZSBzdGFydGluZyB3aXRoICdhJyBhbmQgb25lIHN0YXJ0aW5nIHdpdGggJ2QnLlxuXHRUaGUgZmlyc3QgbGluZSBjb250YWlucyAnYScgYW5kIGEgYEJsb2NrYCB3aGljaCBpbiB0dXJuIGNvbnRhaW5zIHR3byBvdGhlciBsaW5lcy5cblx0Ki9cblx0TGluZTogZygnbGluZScpLFxuXHQvKipcblx0R3JvdXBzIHR3byBvciBtb3JlIHRva2VucyB0aGF0IGFyZSAqbm90KiBzZXBhcmF0ZWQgYnkgc3BhY2VzLlxuXHRgYVtiXS5jYCBpcyBhbiBleGFtcGxlLlxuXHRBIHNpbmdsZSB0b2tlbiBvbiBpdHMgb3duIHdpbGwgbm90IGJlIGdpdmVuIGEgYFNwYWNlYCBncm91cC5cblx0Ki9cblx0U3BhY2U6IGcoJ3NwYWNlJylcbn1cblxuLyoqXG5PdXRwdXR0YWJsZSBkZXNjcmlwdGlvbiBvZiBhIGdyb3VwIGtpbmQuXG5AcGFyYW0ge0dyb3Vwc30gZ3JvdXBLaW5kXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dHcm91cEtpbmQoZ3JvdXBLaW5kKSB7XG5cdHJldHVybiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcbn1cblxubGV0IG5leHRLZXl3b3JkS2luZCA9IDBcbmNvbnN0XG5cdGtleXdvcmROYW1lVG9LaW5kID0gbmV3IE1hcCgpLFxuXHRrZXl3b3JkS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0bmFtZUtleXdvcmRzID0gbmV3IFNldCgpLFxuXHRyZXNlcnZlZEtleXdvcmRzID0gbmV3IFNldCgpXG4vLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cbi8vIFdoZW4gbGV4aW5nIGEgbmFtZSwgYSBtYXAgbG9va3VwIGlzIGRvbmUgYnkga2V5d29yZEtpbmRGcm9tTmFtZS5cbmZ1bmN0aW9uIGt3KG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGt3Tm90TmFtZShuYW1lKVxuXHRuYW1lS2V5d29yZHMuYWRkKGtpbmQpXG5cdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCBraW5kKVxuXHRyZXR1cm4ga2luZFxufVxuLy8gVGhlc2Uga2V5d29yZHMgbXVzdCBiZSBsZXhlZCBzcGVjaWFsbHkuXG5mdW5jdGlvbiBrd05vdE5hbWUoZGVidWdOYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBuZXh0S2V5d29yZEtpbmRcblx0a2V5d29yZEtpbmRUb05hbWUuc2V0KGtpbmQsIGRlYnVnTmFtZSlcblx0bmV4dEtleXdvcmRLaW5kID0gbmV4dEtleXdvcmRLaW5kICsgMVxuXHRyZXR1cm4ga2luZFxufVxuZnVuY3Rpb24ga3dSZXNlcnZlZChuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrdyhuYW1lKVxuXHRyZXNlcnZlZEtleXdvcmRzLmFkZChraW5kKVxufVxuXG5jb25zdCByZXNlcnZlZFdvcmRzID0gW1xuXHQvLyBKYXZhU2NyaXB0IHJlc2VydmVkIHdvcmRzXG5cdCdlbnVtJyxcblx0J2ltcGxlbWVudHMnLFxuXHQnaW50ZXJmYWNlJyxcblx0J3BhY2thZ2UnLFxuXHQncHJpdmF0ZScsXG5cdCdwcm90ZWN0ZWQnLFxuXHQncHVibGljJyxcblxuXHQvLyBKYXZhU2NyaXB0IGtleXdvcmRzXG5cdCdhcmd1bWVudHMnLFxuXHQnYXN5bmMnLFxuXHQnYXdhaXQnLFxuXHQnY29uc3QnLFxuXHQnZGVsZXRlJyxcblx0J2V2YWwnLFxuXHQnaW4nLFxuXHQnaW5zdGFuY2VvZicsXG5cdCdsZXQnLFxuXHQncmV0dXJuJyxcblx0J3R5cGVvZicsXG5cdCd2YXInLFxuXHQndm9pZCcsXG5cdCd3aGlsZScsXG5cblx0Ly8gTWFzb24gcmVzZXJ2ZWQgd29yZHNcblx0JyEnLFxuXHQnYWJzdHJhY3QnLFxuXHQnYWN0b3InLFxuXHQnYXdhaXQhJyxcblx0J2RhdGEnLFxuXHQnZGVsPycsXG5cdCdlbHNlIScsXG5cdCdmaW5hbCcsXG5cdCdpcycsXG5cdCdtZXRhJyxcblx0J291dCcsXG5cdCdzZW5kJyxcblx0J3NlbmQhJyxcblx0J3RvJyxcblx0J3R5cGUnLFxuXHQndW50aWwnLFxuXHQndW50aWwhJyxcblx0J3doaWxlISdcbl1cblxuZm9yIChjb25zdCBuYW1lIG9mIHJlc2VydmVkV29yZHMpXG5cdGt3UmVzZXJ2ZWQobmFtZSlcblxuLyoqIEtpbmRzIG9mIHtAbGluayBLZXl3b3JkfS4gKi9cbmV4cG9ydCBjb25zdCBLZXl3b3JkcyA9IHtcblx0QW1wZXJzYW5kOiBrd05vdE5hbWUoJyYnKSxcblx0QW5kOiBrdygnYW5kJyksXG5cdEFzOiBrdygnYXMnKSxcblx0QXNzZXJ0OiBrdygnYXNzZXJ0IScpLFxuXHRBc3NlcnROb3Q6IGt3KCdmb3JiaWQhJyksXG5cdEFzc2lnbjoga3coJz0nKSxcblx0QXNzaWduTXV0YWJsZToga3dOb3ROYW1lKCc6Oj0nKSxcblx0TG9jYWxNdXRhdGU6IGt3Tm90TmFtZSgnOj0nKSxcblx0QnJlYWs6IGt3KCdicmVhayEnKSxcblx0QnJlYWtXaXRoVmFsOiBrdygnYnJlYWsnKSxcblx0QnVpbHQ6IGt3KCdidWlsdCcpLFxuXHRDYXNlRG86IGt3KCdjYXNlIScpLFxuXHRDYXNlVmFsOiBrdygnY2FzZScpLFxuXHRDYXRjaERvOiBrdygnY2F0Y2ghJyksXG5cdENhdGNoVmFsOiBrdygnY2F0Y2gnKSxcblx0Q29uZDoga3coJ2NvbmQnKSxcblx0Q2xhc3M6IGt3KCdjbGFzcycpLFxuXHRDb25zdHJ1Y3Q6IGt3KCdjb25zdHJ1Y3QhJyksXG5cdERlYnVnZ2VyOiBrdygnZGVidWdnZXIhJyksXG5cdERlbERvOiBrdygnZGVsIScpLFxuXHREZWxWYWw6IGt3KCdkZWwnKSxcblx0RG86IGt3KCdkbyEnKSxcblx0RG90OiBrd05vdE5hbWUoJy4nKSxcblx0RG90Mjoga3dOb3ROYW1lKCcuLicpLFxuXHREb3QzOiBrd05vdE5hbWUoJy4uLiAnKSxcblx0RWxzZToga3coJ2Vsc2UnKSxcblx0RXhjZXB0RG86IGt3KCdleGNlcHQhJyksXG5cdEV4Y2VwdFZhbDoga3coJ2V4Y2VwdCcpLFxuXHRGYWxzZToga3coJ2ZhbHNlJyksXG5cdEZpbmFsbHk6IGt3KCdmaW5hbGx5IScpLFxuXHRGb2N1czoga3coJ18nKSxcblx0Rm9yQmFnOiBrdygnQGZvcicpLFxuXHRGb3JEbzoga3coJ2ZvciEnKSxcblx0Rm9yVmFsOiBrdygnZm9yJyksXG5cdEZ1bjoga3dOb3ROYW1lKCd8JyksXG5cdEZ1bkRvOiBrd05vdE5hbWUoJyF8JyksXG5cdEZ1blRoaXM6IGt3Tm90TmFtZSgnLnwnKSxcblx0RnVuVGhpc0RvOiBrd05vdE5hbWUoJy4hfCcpLFxuXHRGdW5Bc3luYzoga3dOb3ROYW1lKCckfCcpLFxuXHRGdW5Bc3luY0RvOiBrd05vdE5hbWUoJyQhfCcpLFxuXHRGdW5UaGlzQXN5bmM6IGt3Tm90TmFtZSgnLiR8JyksXG5cdEZ1blRoaXNBc3luY0RvOiBrd05vdE5hbWUoJy4kIXwnKSxcblx0RnVuR2VuOiBrd05vdE5hbWUoJ358JyksXG5cdEZ1bkdlbkRvOiBrd05vdE5hbWUoJ34hfCcpLFxuXHRGdW5UaGlzR2VuOiBrd05vdE5hbWUoJy5+fCcpLFxuXHRGdW5UaGlzR2VuRG86IGt3Tm90TmFtZSgnLn4hfCcpLFxuXHRHZXQ6IGt3KCdnZXQnKSxcblx0SWZWYWw6IGt3KCdpZicpLFxuXHRJZkRvOiBrdygnaWYhJyksXG5cdElnbm9yZToga3coJ2lnbm9yZScpLFxuXHRLaW5kOiBrdygna2luZCcpLFxuXHRMYXp5OiBrd05vdE5hbWUoJ34nKSxcblx0TGVzczoga3coJzwnKSxcblx0TWFwRW50cnk6IGt3KCctPicpLFxuXHRNb3JlOiBrdygnPicpLFxuXHROYW1lOiBrdygnbmFtZScpLFxuXHROZXc6IGt3KCduZXcnKSxcblx0Tm90OiBrdygnbm90JyksXG5cdE51bGw6IGt3KCdudWxsJyksXG5cdE9iakFzc2lnbjoga3dOb3ROYW1lKCcuICcpLFxuXHRPZjoga3coJ29mJyksXG5cdE9yOiBrdygnb3InKSxcblx0UGFzczoga3coJ3Bhc3MnKSxcblx0UmVnaW9uOiBrdygncmVnaW9uJyksXG5cdFNldDoga3coJ3NldCEnKSxcblx0U3VwZXJEbzoga3coJ3N1cGVyIScpLFxuXHRTdXBlclZhbDoga3coJ3N1cGVyJyksXG5cdFN0YXRpYzoga3coJ3N0YXRpYycpLFxuXHRTd2l0Y2hEbzoga3coJ3N3aXRjaCEnKSxcblx0U3dpdGNoVmFsOiBrdygnc3dpdGNoJyksXG5cdFRpY2s6IGt3Tm90TmFtZSgnXFwnJyksXG5cdFRocm93OiBrdygndGhyb3chJyksXG5cdFRvZG86IGt3KCd0b2RvJyksXG5cdFRydWU6IGt3KCd0cnVlJyksXG5cdFRyeURvOiBrdygndHJ5IScpLFxuXHRUcnlWYWw6IGt3KCd0cnknKSxcblx0VHlwZToga3dOb3ROYW1lKCc6JyksXG5cdFVuZGVmaW5lZDoga3coJ3VuZGVmaW5lZCcpLFxuXHRVbmxlc3NWYWw6IGt3KCd1bmxlc3MnKSxcblx0VW5sZXNzRG86IGt3KCd1bmxlc3MhJyksXG5cdEltcG9ydDoga3coJ2ltcG9ydCcpLFxuXHRJbXBvcnREbzoga3coJ2ltcG9ydCEnKSxcblx0SW1wb3J0TGF6eToga3coJ2ltcG9ydH4nKSxcblx0V2l0aDoga3coJ3dpdGgnKSxcblx0WWllbGQ6IGt3KCc8ficpLFxuXHRZaWVsZFRvOiBrdygnPH5+Jylcbn1cblxuLyoqXG5OYW1lIG9mIGEga2V5d29yZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtpbmRcbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24ga2V5d29yZE5hbWUoa2luZCkge1xuXHRyZXR1cm4ga2V5d29yZEtpbmRUb05hbWUuZ2V0KGtpbmQpXG59XG5cbi8qKlxuU2VlIGlmIHRoZSBuYW1lIGlzIGEga2V5d29yZCBhbmQgaWYgc28gcmV0dXJuIGl0cyBraW5kLlxuQHJldHVybiB7P0tleXdvcmRzfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSkge1xuXHRjb25zdCBraW5kID0ga2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpXG5cdHJldHVybiBraW5kID09PSB1bmRlZmluZWQgPyBudWxsIDoga2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZChraW5kKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRmFsc2U6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuRmFsc2Vcblx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTmFtZVxuXHRcdGNhc2UgS2V5d29yZHMuTnVsbDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OdWxsXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcnVlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlRydWVcblx0XHRjYXNlIEtleXdvcmRzLlVuZGVmaW5lZDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5VbmRlZmluZWRcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEdyb3VwIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNHcm91cChncm91cEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNLZXl3b3JkKGtleXdvcmRLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiBhbnkgb2YgdGhlIGdpdmVuIGtpbmRzLlxuQHBhcmFtIHtTZXR9IGtleXdvcmRLaW5kc1xuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNBbnlLZXl3b3JkKGtleXdvcmRLaW5kcywgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIHdob3NlIHZhbHVlIGNhbiBiZSB1c2VkIGFzIGEgcHJvcGVydHkgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbilcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIHJlc2VydmVkIHdvcmQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChyZXNlcnZlZEtleXdvcmRzLCB0b2tlbilcbn1cbiJdfQ==
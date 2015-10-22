(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../CompileError', './MsAst'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../CompileError'), require('./MsAst'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.MsAst);
		global.Token = mod.exports;
	}
})(this, function (exports, _CompileError, _MsAst) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.showGroupKind = showGroupKind;
	exports.keywordName = keywordName;
	exports.opKeywordKindFromName = opKeywordKindFromName;
	exports.opKeywordKindToSpecialValueKind = opKeywordKindToSpecialValueKind;
	exports.isGroup = isGroup;
	exports.isKeyword = isKeyword;
	exports.isAnyKeyword = isAnyKeyword;
	exports.isNameKeyword = isNameKeyword;
	exports.isReservedKeyword = isReservedKeyword;

	/**
 Lexed element in a tree of Tokens.
 
 Since {@link lex} does grouping, {@link parse} avoids doing much of the work parsers usually do;
 it doesn't have to handle a "left parenthesis", only a {@link Group} of kind G_Parenthesis.
 This also means that the many different {@link MsAst} types all parse in a similar manner,
 keeping the language consistent.
 
 Besides {@link Group}, {@link Keyword}, {@link Name}, and {@link DocComment},
 {@link NumberLiteral} values are also treated as Tokens.
 
 @abstract
 */

	class Token {
		constructor(loc) {
			this.loc = loc;
		}
	}

	/**
 Contains multiple sub-tokens.
 See {@link GroupKind} for explanations.
 */
	exports.default = Token;

	class Group extends Token {
		constructor(loc, subTokens, kind) {
			super(loc);
			/**
   Tokens within this group.
   @type {Array<Token>}
   */
			this.subTokens = subTokens;
			/** @type {Groups} */
			this.kind = kind;
		}

		toString() {
			return `${ groupKindToName.get(this.kind) }`;
		}
	}

	/**
 A "keyword" is any set of characters with a particular meaning.
 It doensn't necessarily have to be something that might have been a {@link Name}.
 For example, see {@link Keywords.ObjEntry}.
 
 This can even include ones like `. ` (defines an object property, as in `key. value`).
 Kind is a ***. See the full list below.
 */
	exports.Group = Group;

	class Keyword extends Token {
		constructor(loc, kind) {
			super(loc);
			/** @type {Keywords} */
			this.kind = kind;
		}

		toString() {
			return (0, _CompileError.code)(keywordKindToName.get(this.kind));
		}
	}

	/**
 An identifier. Usually the name of some local variable or property.
 A Name is guaranteed to not be any keyword.
 */
	exports.Keyword = Keyword;

	class Name extends Token {
		constructor(loc, name /* String */) {
			super(loc);
			this.name = name;
		}

		toString() {
			return (0, _CompileError.code)(this.name);
		}
	}

	/**
 Documentation comment (beginning with one `|` rather than two).
 Non-doc comments are ignored by {@link lex}.
 These don't affect output, but are passed to various {@link MsAst}s for use by other tools.
 */
	exports.Name = Name;

	class DocComment extends Token {
		constructor(loc, text) {
			super(loc);
			/** @type {string} */
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

	/**
 Kinds of {@link Group}.
 @enum {number}
 */
	const Groups = {
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

	exports.Groups = Groups;
	/**
 Outputtable description of a group kind.
 @param {Groups} groupKind
 */

	function showGroupKind(groupKind) {
		return groupKindToName.get(groupKind);
	}

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
	'arguments', 'await', 'const', 'delete', 'eval', 'in', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while',

	// mason reserved words
	'abstract', 'await!', 'data', 'del?', 'else!', 'final', 'is', 'meta', 'out', 'to', 'until', 'until!', 'while!'];

	for (const name of reserved_words) kwReserved(name);

	/** Kinds of {@link Keyword}. */
	const Keywords = {
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
		Ellipsis: kwNotName('... '),
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
		FunGen: kwNotName('~|'),
		FunGenDo: kwNotName('~!|'),
		FunThis: kwNotName('.|'),
		FunThisDo: kwNotName('.!|'),
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

	exports.Keywords = Keywords;
	/**
 Name of a keyword.
 @param {Keywords} kind
 @return {string}
 */

	function keywordName(kind) {
		return keywordKindToName.get(kind);
	}

	/**
 See if the name is a keyword and if so return its kind.
 @return {?Keywords}
 */

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

	/**
 Whether `token` is a Group of the given kind.
 @param {Groups} groupKind
 @param {Token} token
 */

	function isGroup(groupKind, token) {
		return token instanceof Group && token.kind === groupKind;
	}

	/**
 Whether `token` is a Keyword of the given kind.
 @param {Keywords} keywordKind
 @param {Token} token
 */

	function isKeyword(keywordKind, token) {
		return token instanceof Keyword && token.kind === keywordKind;
	}

	/**
 Whether `token` is a Keyword of any of the given kinds.
 @param {Set} keywordKinds
 @param {Token} token
 */

	function isAnyKeyword(keywordKinds, token) {
		return token instanceof Keyword && keywordKinds.has(token.kind);
	}

	/** Whether `token` is a Keyword whose value can be used as a property name. */

	function isNameKeyword(token) {
		return isAnyKeyword(nameKeywords, token);
	}

	/** Whether `token` is a reserved word. */

	function isReservedKeyword(token) {
		return isAnyKeyword(reservedKeywords, token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCZSxPQUFNLEtBQUssQ0FBQztBQUMxQixhQUFXLENBQUMsR0FBRyxFQUFFO0FBQ2hCLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0dBQ2Q7RUFDRDs7Ozs7O21CQUpvQixLQUFLOztBQVVuQixPQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO0FBQ2pDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7Ozs7QUFLVixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTs7QUFFMUIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7O0FBRUQsVUFBUSxHQUFHO0FBQ1YsVUFBTyxDQUFDLEdBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFBO0dBQzFDO0VBQ0Q7Ozs7Ozs7Ozs7OztBQVVNLE9BQU0sT0FBTyxTQUFTLEtBQUssQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtBQUN0QixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRVYsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7O0FBRUQsVUFBUSxHQUFHO0FBQ1YsVUFBTyxrQkEzREQsSUFBSSxFQTJERSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7R0FDN0M7RUFDRDs7Ozs7Ozs7QUFNTSxPQUFNLElBQUksU0FBUyxLQUFLLENBQUM7QUFDL0IsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElB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QzdCO0FBQ0MsV0FBTyxJQUFJLENBQUE7QUFBQSxHQUNaO0VBQ0Q7Ozs7Ozs7O0FBT00sVUFBUyxPQUFPLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRTtBQUN6QyxTQUFPLEtBQUssWUFBWSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUE7RUFDekQ7Ozs7Ozs7O0FBT00sVUFBUyxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRTtBQUM3QyxTQUFPLEtBQUssWUFBWSxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7RUFDN0Q7Ozs7Ozs7O0FBT00sVUFBUyxZQUFZLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRTtBQUNqRCxTQUFPLEtBQUssWUFBWSxPQUFPLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7RUFDL0Q7Ozs7QUFHTSxVQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUU7QUFDcEMsU0FBTyxZQUFZLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQ3hDOzs7O0FBR00sVUFBUyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7QUFDeEMsU0FBTyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUE7RUFDNUMiLCJmaWxlIjoiVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7U3BlY2lhbFZhbHN9IGZyb20gJy4vTXNBc3QnXG5cbi8qKlxuTGV4ZWQgZWxlbWVudCBpbiBhIHRyZWUgb2YgVG9rZW5zLlxuXG5TaW5jZSB7QGxpbmsgbGV4fSBkb2VzIGdyb3VwaW5nLCB7QGxpbmsgcGFyc2V9IGF2b2lkcyBkb2luZyBtdWNoIG9mIHRoZSB3b3JrIHBhcnNlcnMgdXN1YWxseSBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIHtAbGluayBHcm91cH0gb2Yga2luZCBHX1BhcmVudGhlc2lzLlxuVGhpcyBhbHNvIG1lYW5zIHRoYXQgdGhlIG1hbnkgZGlmZmVyZW50IHtAbGluayBNc0FzdH0gdHlwZXMgYWxsIHBhcnNlIGluIGEgc2ltaWxhciBtYW5uZXIsXG5rZWVwaW5nIHRoZSBsYW5ndWFnZSBjb25zaXN0ZW50LlxuXG5CZXNpZGVzIHtAbGluayBHcm91cH0sIHtAbGluayBLZXl3b3JkfSwge0BsaW5rIE5hbWV9LCBhbmQge0BsaW5rIERvY0NvbW1lbnR9LFxue0BsaW5rIE51bWJlckxpdGVyYWx9IHZhbHVlcyBhcmUgYWxzbyB0cmVhdGVkIGFzIFRva2Vucy5cblxuQGFic3RyYWN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8qKlxuQ29udGFpbnMgbXVsdGlwbGUgc3ViLXRva2Vucy5cblNlZSB7QGxpbmsgR3JvdXBLaW5kfSBmb3IgZXhwbGFuYXRpb25zLlxuKi9cbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBzdWJUb2tlbnMsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqXG5cdFx0VG9rZW5zIHdpdGhpbiB0aGlzIGdyb3VwLlxuXHRcdEB0eXBlIHtBcnJheTxUb2tlbj59XG5cdFx0Ki9cblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdC8qKiBAdHlwZSB7R3JvdXBzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBgJHtncm91cEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCl9YFxuXHR9XG59XG5cbi8qKlxuQSBcImtleXdvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cbkl0IGRvZW5zbid0IG5lY2Vzc2FyaWx5IGhhdmUgdG8gYmUgc29tZXRoaW5nIHRoYXQgbWlnaHQgaGF2ZSBiZWVuIGEge0BsaW5rIE5hbWV9LlxuRm9yIGV4YW1wbGUsIHNlZSB7QGxpbmsgS2V5d29yZHMuT2JqRW50cnl9LlxuXG5UaGlzIGNhbiBldmVuIGluY2x1ZGUgb25lcyBsaWtlIGAuIGAgKGRlZmluZXMgYW4gb2JqZWN0IHByb3BlcnR5LCBhcyBpbiBga2V5LiB2YWx1ZWApLlxuS2luZCBpcyBhICoqKi4gU2VlIHRoZSBmdWxsIGxpc3QgYmVsb3cuXG4qL1xuZXhwb3J0IGNsYXNzIEtleXdvcmQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge0tleXdvcmRzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKGtleXdvcmRLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpKVxuXHR9XG59XG5cbi8qKlxuQW4gaWRlbnRpZmllci4gVXN1YWxseSB0aGUgbmFtZSBvZiBzb21lIGxvY2FsIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuQSBOYW1lIGlzIGd1YXJhbnRlZWQgdG8gbm90IGJlIGFueSBrZXl3b3JkLlxuKi9cbmV4cG9ydCBjbGFzcyBOYW1lIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKHRoaXMubmFtZSlcblx0fVxufVxuXG4vKipcbkRvY3VtZW50YXRpb24gY29tbWVudCAoYmVnaW5uaW5nIHdpdGggb25lIGB8YCByYXRoZXIgdGhhbiB0d28pLlxuTm9uLWRvYyBjb21tZW50cyBhcmUgaWdub3JlZCBieSB7QGxpbmsgbGV4fS5cblRoZXNlIGRvbid0IGFmZmVjdCBvdXRwdXQsIGJ1dCBhcmUgcGFzc2VkIHRvIHZhcmlvdXMge0BsaW5rIE1zQXN0fXMgZm9yIHVzZSBieSBvdGhlciB0b29scy5cbiovXG5leHBvcnQgY2xhc3MgRG9jQ29tbWVudCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCB0ZXh0KSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdHRoaXMudGV4dCA9IHRleHRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiAnZG9jIGNvbW1lbnQnXG5cdH1cbn1cblxubGV0IG5leHRHcm91cEtpbmQgPSAwXG5jb25zdFxuXHRncm91cEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdGcgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEdyb3VwS2luZFxuXHRcdGdyb3VwS2luZFRvTmFtZS5zZXQoa2luZCwgbmFtZSlcblx0XHRuZXh0R3JvdXBLaW5kID0gbmV4dEdyb3VwS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9XG5cbi8qKlxuS2luZHMgb2Yge0BsaW5rIEdyb3VwfS5cbkBlbnVtIHtudW1iZXJ9XG4qL1xuZXhwb3J0IGNvbnN0IEdyb3VwcyA9IHtcblx0LyoqXG5cdFRva2VucyBzdXJyb3VuZGVkIGJ5IHBhcmVudGhlc2VzLlxuXHRUaGVyZSBtYXkgYmUgbm8gY2xvc2luZyBwYXJlbnRoZXNpcy4gSW46XG5cblx0XHRhIChiXG5cdFx0XHRjXG5cblx0VGhlIHRva2VucyBhcmUgYSBHcm91cDxMaW5lPihOYW1lLCBHcm91cDxQYXJlbnRoZXNpcz4oLi4uKSlcblx0Ki9cblx0UGFyZW50aGVzaXM6IGcoJygpJyksXG5cdC8qKiBMaWtlIGBQYXJlbnRoZXNpc2AsIGJ1dCBzaW1wbGVyIGJlY2F1c2UgdGhlcmUgbXVzdCBiZSBhIGNsb3NpbmcgYF1gLiAqL1xuXHRCcmFja2V0OiBnKCdbXScpLFxuXHQvKipcblx0TGluZXMgaW4gYW4gaW5kZW50ZWQgYmxvY2suXG5cdFN1Yi10b2tlbnMgd2lsbCBhbHdheXMgYmUgYExpbmVgIGdyb3Vwcy5cblx0Tm90ZSB0aGF0IGBCbG9ja2BzIGRvIG5vdCBhbHdheXMgbWFwIHRvIEJsb2NrKiBNc0FzdHMuXG5cdCovXG5cdEJsb2NrOiBnKCdpbmRlbnRlZCBibG9jaycpLFxuXHQvKipcblx0VG9rZW5zIHdpdGhpbiBhIHF1b3RlLlxuXHRgc3ViVG9rZW5zYCBtYXkgYmUgc3RyaW5ncywgb3IgR19QYXJlbnRoZXNpcyBncm91cHMuXG5cdCovXG5cdFF1b3RlOiBnKCdxdW90ZScpLFxuXHQvKipcblx0VG9rZW5zIG9uIGEgbGluZS5cblx0VGhlIGluZGVudGVkIGJsb2NrIGZvbGxvd2luZyB0aGUgZW5kIG9mIHRoZSBsaW5lIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBwYXJ0IG9mIHRoZSBsaW5lIVxuXHRUaGlzIG1lYW5zIHRoYXQgaW4gdGhpcyBjb2RlOlxuXHRcdGFcblx0XHRcdGJcblx0XHRcdGNcblx0XHRkXG5cdFRoZXJlIGFyZSAyIGxpbmVzLCBvbmUgc3RhcnRpbmcgd2l0aCAnYScgYW5kIG9uZSBzdGFydGluZyB3aXRoICdkJy5cblx0VGhlIGZpcnN0IGxpbmUgY29udGFpbnMgJ2EnIGFuZCBhIGBCbG9ja2Agd2hpY2ggaW4gdHVybiBjb250YWlucyB0d28gb3RoZXIgbGluZXMuXG5cdCovXG5cdExpbmU6IGcoJ2xpbmUnKSxcblx0LyoqXG5cdEdyb3VwcyB0d28gb3IgbW9yZSB0b2tlbnMgdGhhdCBhcmUgKm5vdCogc2VwYXJhdGVkIGJ5IHNwYWNlcy5cblx0YGFbYl0uY2AgaXMgYW4gZXhhbXBsZS5cblx0QSBzaW5nbGUgdG9rZW4gb24gaXRzIG93biB3aWxsIG5vdCBiZSBnaXZlbiBhIGBTcGFjZWAgZ3JvdXAuXG5cdCovXG5cdFNwYWNlOiBnKCdzcGFjZScpXG59XG5cbi8qKlxuT3V0cHV0dGFibGUgZGVzY3JpcHRpb24gb2YgYSBncm91cCBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93R3JvdXBLaW5kKGdyb3VwS2luZCkge1xuXHRyZXR1cm4gZ3JvdXBLaW5kVG9OYW1lLmdldChncm91cEtpbmQpXG59XG5cbmxldCBuZXh0S2V5d29yZEtpbmQgPSAwXG5jb25zdFxuXHRrZXl3b3JkTmFtZVRvS2luZCA9IG5ldyBNYXAoKSxcblx0a2V5d29yZEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdG5hbWVLZXl3b3JkcyA9IG5ldyBTZXQoKSxcblx0cmVzZXJ2ZWRLZXl3b3JkcyA9IG5ldyBTZXQoKSxcblx0Ly8gVGhlc2Uga2V5d29yZHMgYXJlIHNwZWNpYWwgbmFtZXMuXG5cdC8vIFdoZW4gbGV4aW5nIGEgbmFtZSwgYSBtYXAgbG9va3VwIGlzIGRvbmUgYnkga2V5d29yZEtpbmRGcm9tTmFtZS5cblx0a3cgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0ga3dOb3ROYW1lKG5hbWUpXG5cdFx0bmFtZUtleXdvcmRzLmFkZChraW5kKVxuXHRcdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCBraW5kKVxuXHRcdHJldHVybiBraW5kXG5cdH0sXG5cdC8vIFRoZXNlIGtleXdvcmRzIG11c3QgYmUgbGV4ZWQgc3BlY2lhbGx5LlxuXHRrd05vdE5hbWUgPSBkZWJ1Z05hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0S2V5d29yZEtpbmRcblx0XHRrZXl3b3JkS2luZFRvTmFtZS5zZXQoa2luZCwgZGVidWdOYW1lKVxuXHRcdG5leHRLZXl3b3JkS2luZCA9IG5leHRLZXl3b3JkS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9LFxuXHRrd1Jlc2VydmVkID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IGt3KG5hbWUpXG5cdFx0cmVzZXJ2ZWRLZXl3b3Jkcy5hZGQoa2luZClcblx0fVxuXG5jb25zdCByZXNlcnZlZF93b3JkcyA9IFtcblx0Ly8gSmF2YVNjcmlwdCByZXNlcnZlZCB3b3Jkc1xuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2F3YWl0Jyxcblx0J2NvbnN0Jyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luJyxcblx0J2luc3RhbmNlb2YnLFxuXHQnbGV0Jyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIG1hc29uIHJlc2VydmVkIHdvcmRzXG5cdCdhYnN0cmFjdCcsXG5cdCdhd2FpdCEnLFxuXHQnZGF0YScsXG5cdCdkZWw/Jyxcblx0J2Vsc2UhJyxcblx0J2ZpbmFsJyxcblx0J2lzJyxcblx0J21ldGEnLFxuXHQnb3V0Jyxcblx0J3RvJyxcblx0J3VudGlsJyxcblx0J3VudGlsIScsXG5cdCd3aGlsZSEnXG5dXG5cbmZvciAoY29uc3QgbmFtZSBvZiByZXNlcnZlZF93b3Jkcylcblx0a3dSZXNlcnZlZChuYW1lKVxuXG4vKiogS2luZHMgb2Yge0BsaW5rIEtleXdvcmR9LiAqL1xuZXhwb3J0IGNvbnN0IEtleXdvcmRzID0ge1xuXHRBbmQ6IGt3KCdhbmQnKSxcblx0QXM6IGt3KCdhcycpLFxuXHRBc3NlcnQ6IGt3KCdhc3NlcnQhJyksXG5cdEFzc2VydE5vdDoga3coJ2ZvcmJpZCEnKSxcblx0QXNzaWduOiBrdygnPScpLFxuXHRBc3NpZ25NdXRhYmxlOiBrd05vdE5hbWUoJzo6PScpLFxuXHRMb2NhbE11dGF0ZToga3dOb3ROYW1lKCc6PScpLFxuXHRCcmVhazoga3coJ2JyZWFrIScpLFxuXHRCcmVha1dpdGhWYWw6IGt3KCdicmVhaycpLFxuXHRCdWlsdDoga3coJ2J1aWx0JyksXG5cdENhc2VEbzoga3coJ2Nhc2UhJyksXG5cdENhc2VWYWw6IGt3KCdjYXNlJyksXG5cdENhdGNoRG86IGt3KCdjYXRjaCEnKSxcblx0Q2F0Y2hWYWw6IGt3KCdjYXRjaCcpLFxuXHRDb25kOiBrdygnY29uZCcpLFxuXHRDbGFzczoga3coJ2NsYXNzJyksXG5cdENvbnN0cnVjdDoga3coJ2NvbnN0cnVjdCEnKSxcblx0RGVidWdnZXI6IGt3KCdkZWJ1Z2dlciEnKSxcblx0RGVsRG86IGt3KCdkZWwhJyksXG5cdERlbFZhbDoga3coJ2RlbCcpLFxuXHREbzoga3coJ2RvIScpLFxuXHREb3Q6IGt3Tm90TmFtZSgnLicpLFxuXHRFbGxpcHNpczoga3dOb3ROYW1lKCcuLi4gJyksXG5cdEVsc2U6IGt3KCdlbHNlJyksXG5cdEV4Y2VwdERvOiBrdygnZXhjZXB0IScpLFxuXHRFeGNlcHRWYWw6IGt3KCdleGNlcHQnKSxcblx0RmFsc2U6IGt3KCdmYWxzZScpLFxuXHRGaW5hbGx5OiBrdygnZmluYWxseSEnKSxcblx0Rm9jdXM6IGt3KCdfJyksXG5cdEZvckJhZzoga3coJ0Bmb3InKSxcblx0Rm9yRG86IGt3KCdmb3IhJyksXG5cdEZvclZhbDoga3coJ2ZvcicpLFxuXHRGdW46IGt3Tm90TmFtZSgnfCcpLFxuXHRGdW5Ebzoga3dOb3ROYW1lKCchfCcpLFxuXHRGdW5HZW46IGt3Tm90TmFtZSgnfnwnKSxcblx0RnVuR2VuRG86IGt3Tm90TmFtZSgnfiF8JyksXG5cdEZ1blRoaXM6IGt3Tm90TmFtZSgnLnwnKSxcblx0RnVuVGhpc0RvOiBrd05vdE5hbWUoJy4hfCcpLFxuXHRGdW5UaGlzR2VuOiBrd05vdE5hbWUoJy5+fCcpLFxuXHRGdW5UaGlzR2VuRG86IGt3Tm90TmFtZSgnLn4hfCcpLFxuXHRHZXQ6IGt3KCdnZXQnKSxcblx0SWZWYWw6IGt3KCdpZicpLFxuXHRJZkRvOiBrdygnaWYhJyksXG5cdElnbm9yZToga3coJ2lnbm9yZScpLFxuXHRMYXp5OiBrd05vdE5hbWUoJ34nKSxcblx0TWFwRW50cnk6IGt3KCctPicpLFxuXHROYW1lOiBrdygnbmFtZScpLFxuXHROZXc6IGt3KCduZXcnKSxcblx0Tm90OiBrdygnbm90JyksXG5cdE51bGw6IGt3KCdudWxsJyksXG5cdE9iakFzc2lnbjoga3dOb3ROYW1lKCcuICcpLFxuXHRPZjoga3coJ29mJyksXG5cdE9yOiBrdygnb3InKSxcblx0UGFzczoga3coJ3Bhc3MnKSxcblx0UmVnaW9uOiBrdygncmVnaW9uJyksXG5cdFNldDoga3coJ3NldCEnKSxcblx0U3VwZXJEbzoga3coJ3N1cGVyIScpLFxuXHRTdXBlclZhbDoga3coJ3N1cGVyJyksXG5cdFN0YXRpYzoga3coJ3N0YXRpYycpLFxuXHRTd2l0Y2hEbzoga3coJ3N3aXRjaCEnKSxcblx0U3dpdGNoVmFsOiBrdygnc3dpdGNoJyksXG5cdFRocm93OiBrdygndGhyb3chJyksXG5cdFRvZG86IGt3KCd0b2RvJyksXG5cdFRydWU6IGt3KCd0cnVlJyksXG5cdFRyeURvOiBrdygndHJ5IScpLFxuXHRUcnlWYWw6IGt3KCd0cnknKSxcblx0VHlwZToga3dOb3ROYW1lKCc6JyksXG5cdFVuZGVmaW5lZDoga3coJ3VuZGVmaW5lZCcpLFxuXHRVbmxlc3NWYWw6IGt3KCd1bmxlc3MnKSxcblx0VW5sZXNzRG86IGt3KCd1bmxlc3MhJyksXG5cdEltcG9ydDoga3coJ2ltcG9ydCcpLFxuXHRJbXBvcnREbzoga3coJ2ltcG9ydCEnKSxcblx0SW1wb3J0TGF6eToga3coJ2ltcG9ydH4nKSxcblx0V2l0aDoga3coJ3dpdGgnKSxcblx0WWllbGQ6IGt3KCc8ficpLFxuXHRZaWVsZFRvOiBrdygnPH5+Jylcbn1cblxuLyoqXG5OYW1lIG9mIGEga2V5d29yZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtpbmRcbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24ga2V5d29yZE5hbWUoa2luZCkge1xuXHRyZXR1cm4ga2V5d29yZEtpbmRUb05hbWUuZ2V0KGtpbmQpXG59XG5cbi8qKlxuU2VlIGlmIHRoZSBuYW1lIGlzIGEga2V5d29yZCBhbmQgaWYgc28gcmV0dXJuIGl0cyBraW5kLlxuQHJldHVybiB7P0tleXdvcmRzfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSkge1xuXHRjb25zdCBraW5kID0ga2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpXG5cdHJldHVybiBraW5kID09PSB1bmRlZmluZWQgPyBudWxsIDoga2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZChraW5kKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRmFsc2U6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuRmFsc2Vcblx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTmFtZVxuXHRcdGNhc2UgS2V5d29yZHMuTnVsbDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OdWxsXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcnVlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlRydWVcblx0XHRjYXNlIEtleXdvcmRzLlVuZGVmaW5lZDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5VbmRlZmluZWRcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEdyb3VwIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNHcm91cChncm91cEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNLZXl3b3JkKGtleXdvcmRLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiBhbnkgb2YgdGhlIGdpdmVuIGtpbmRzLlxuQHBhcmFtIHtTZXR9IGtleXdvcmRLaW5kc1xuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNBbnlLZXl3b3JkKGtleXdvcmRLaW5kcywgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIHdob3NlIHZhbHVlIGNhbiBiZSB1c2VkIGFzIGEgcHJvcGVydHkgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbilcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIHJlc2VydmVkIHdvcmQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChyZXNlcnZlZEtleXdvcmRzLCB0b2tlbilcbn1cbiJdfQ==
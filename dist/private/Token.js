if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../CompileError', './MsAst'], function (exports, _CompileError, _MsAst) {
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
	'abstract', 'await!', 'data', 'del?', 'else!', 'final', 'gen', 'gen!', 'goto!', 'is', 'meta', 'out', 'to', 'until', 'until!', 'while!'];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRva2VuLmpzIiwicHJpdmF0ZS9Ub2tlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDZ0JlLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDtFQUNEOzs7Ozs7bUJBSm9CLEtBQUs7O0FBVW5CLE9BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUU7QUFDakMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOzs7OztBQUtWLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBOztBQUUxQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFDVixVQUFPLENBQUMsR0FBRSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUE7R0FDMUM7RUFDRDs7Ozs7Ozs7Ozs7O0FBVU0sT0FBTSxPQUFPLFNBQVMsS0FBSyxDQUFDO0FBQ2xDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3RCLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFDVixVQUFPLGtCQTNERCxJQUFJLEVBMkRFLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtHQUM3QztFQUNEOzs7Ozs7OztBQU1NLE9BQU0sSUFBSSxTQUFTLEtBQUssQ0FBQztBQUMvQixhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksZUFBZTtBQUNuQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFH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Q0FzVkcsU0FBUyxDQUFBO0FBQUEsQUFDN0I7QUFDQyxXQUFPLElBQUksQ0FBQTtBQUFBLEdBQ1o7RUFDRDs7Ozs7Ozs7QUFPTSxVQUFTLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFO0FBQ3pDLFNBQU8sS0FBSyxZQUFZLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQTtFQUN6RDs7Ozs7Ozs7QUFPTSxVQUFTLFNBQVMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFO0FBQzdDLFNBQU8sS0FBSyxZQUFZLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQTtFQUM3RDs7Ozs7Ozs7QUFPTSxVQUFTLFlBQVksQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFO0FBQ2pELFNBQU8sS0FBSyxZQUFZLE9BQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtFQUMvRDs7OztBQUdNLFVBQVMsYUFBYSxDQUFDLEtBQUssRUFBRTtBQUNwQyxTQUFPLFlBQVksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUE7RUFDeEM7Ozs7QUFHTSxVQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRTtBQUN4QyxTQUFPLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUM1QyIsImZpbGUiOiJwcml2YXRlL1Rva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7U3BlY2lhbFZhbHN9IGZyb20gJy4vTXNBc3QnXG5cbi8qKlxuTGV4ZWQgZWxlbWVudCBpbiBhIHRyZWUgb2YgVG9rZW5zLlxuXG5TaW5jZSB7QGxpbmsgbGV4fSBkb2VzIGdyb3VwaW5nLCB7QGxpbmsgcGFyc2V9IGF2b2lkcyBkb2luZyBtdWNoIG9mIHRoZSB3b3JrIHBhcnNlcnMgdXN1YWxseSBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIHtAbGluayBHcm91cH0gb2Yga2luZCBHX1BhcmVudGhlc2lzLlxuVGhpcyBhbHNvIG1lYW5zIHRoYXQgdGhlIG1hbnkgZGlmZmVyZW50IHtAbGluayBNc0FzdH0gdHlwZXMgYWxsIHBhcnNlIGluIGEgc2ltaWxhciBtYW5uZXIsXG5rZWVwaW5nIHRoZSBsYW5ndWFnZSBjb25zaXN0ZW50LlxuXG5CZXNpZGVzIHtAbGluayBHcm91cH0sIHtAbGluayBLZXl3b3JkfSwge0BsaW5rIE5hbWV9LCBhbmQge0BsaW5rIERvY0NvbW1lbnR9LFxue0BsaW5rIE51bWJlckxpdGVyYWx9IHZhbHVlcyBhcmUgYWxzbyB0cmVhdGVkIGFzIFRva2Vucy5cblxuQGFic3RyYWN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8qKlxuQ29udGFpbnMgbXVsdGlwbGUgc3ViLXRva2Vucy5cblNlZSB7QGxpbmsgR3JvdXBLaW5kfSBmb3IgZXhwbGFuYXRpb25zLlxuKi9cbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBzdWJUb2tlbnMsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqXG5cdFx0VG9rZW5zIHdpdGhpbiB0aGlzIGdyb3VwLlxuXHRcdEB0eXBlIHtBcnJheTxUb2tlbj59XG5cdFx0Ki9cblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdC8qKiBAdHlwZSB7R3JvdXBzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBgJHtncm91cEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCl9YFxuXHR9XG59XG5cbi8qKlxuQSBcImtleXdvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cbkl0IGRvZW5zbid0IG5lY2Vzc2FyaWx5IGhhdmUgdG8gYmUgc29tZXRoaW5nIHRoYXQgbWlnaHQgaGF2ZSBiZWVuIGEge0BsaW5rIE5hbWV9LlxuRm9yIGV4YW1wbGUsIHNlZSB7QGxpbmsgS2V5d29yZHMuT2JqRW50cnl9LlxuXG5UaGlzIGNhbiBldmVuIGluY2x1ZGUgb25lcyBsaWtlIGAuIGAgKGRlZmluZXMgYW4gb2JqZWN0IHByb3BlcnR5LCBhcyBpbiBga2V5LiB2YWx1ZWApLlxuS2luZCBpcyBhICoqKi4gU2VlIHRoZSBmdWxsIGxpc3QgYmVsb3cuXG4qL1xuZXhwb3J0IGNsYXNzIEtleXdvcmQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge0tleXdvcmRzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKGtleXdvcmRLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpKVxuXHR9XG59XG5cbi8qKlxuQW4gaWRlbnRpZmllci4gVXN1YWxseSB0aGUgbmFtZSBvZiBzb21lIGxvY2FsIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuQSBOYW1lIGlzIGd1YXJhbnRlZWQgdG8gbm90IGJlIGFueSBrZXl3b3JkLlxuKi9cbmV4cG9ydCBjbGFzcyBOYW1lIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKHRoaXMubmFtZSlcblx0fVxufVxuXG4vKipcbkRvY3VtZW50YXRpb24gY29tbWVudCAoYmVnaW5uaW5nIHdpdGggb25lIGB8YCByYXRoZXIgdGhhbiB0d28pLlxuTm9uLWRvYyBjb21tZW50cyBhcmUgaWdub3JlZCBieSB7QGxpbmsgbGV4fS5cblRoZXNlIGRvbid0IGFmZmVjdCBvdXRwdXQsIGJ1dCBhcmUgcGFzc2VkIHRvIHZhcmlvdXMge0BsaW5rIE1zQXN0fXMgZm9yIHVzZSBieSBvdGhlciB0b29scy5cbiovXG5leHBvcnQgY2xhc3MgRG9jQ29tbWVudCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCB0ZXh0KSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdHRoaXMudGV4dCA9IHRleHRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiAnZG9jIGNvbW1lbnQnXG5cdH1cbn1cblxubGV0IG5leHRHcm91cEtpbmQgPSAwXG5jb25zdFxuXHRncm91cEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdGcgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEdyb3VwS2luZFxuXHRcdGdyb3VwS2luZFRvTmFtZS5zZXQoa2luZCwgbmFtZSlcblx0XHRuZXh0R3JvdXBLaW5kID0gbmV4dEdyb3VwS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9XG5cbi8qKlxuS2luZHMgb2Yge0BsaW5rIEdyb3VwfS5cbkBlbnVtIHtudW1iZXJ9XG4qL1xuZXhwb3J0IGNvbnN0IEdyb3VwcyA9IHtcblx0LyoqXG5cdFRva2VucyBzdXJyb3VuZGVkIGJ5IHBhcmVudGhlc2VzLlxuXHRUaGVyZSBtYXkgYmUgbm8gY2xvc2luZyBwYXJlbnRoZXNpcy4gSW46XG5cblx0XHRhIChiXG5cdFx0XHRjXG5cblx0VGhlIHRva2VucyBhcmUgYSBHcm91cDxMaW5lPihOYW1lLCBHcm91cDxQYXJlbnRoZXNpcz4oLi4uKSlcblx0Ki9cblx0UGFyZW50aGVzaXM6IGcoJygpJyksXG5cdC8qKiBMaWtlIGBQYXJlbnRoZXNpc2AsIGJ1dCBzaW1wbGVyIGJlY2F1c2UgdGhlcmUgbXVzdCBiZSBhIGNsb3NpbmcgYF1gLiAqL1xuXHRCcmFja2V0OiBnKCdbXScpLFxuXHQvKipcblx0TGluZXMgaW4gYW4gaW5kZW50ZWQgYmxvY2suXG5cdFN1Yi10b2tlbnMgd2lsbCBhbHdheXMgYmUgYExpbmVgIGdyb3Vwcy5cblx0Tm90ZSB0aGF0IGBCbG9ja2BzIGRvIG5vdCBhbHdheXMgbWFwIHRvIEJsb2NrKiBNc0FzdHMuXG5cdCovXG5cdEJsb2NrOiBnKCdpbmRlbnRlZCBibG9jaycpLFxuXHQvKipcblx0VG9rZW5zIHdpdGhpbiBhIHF1b3RlLlxuXHRgc3ViVG9rZW5zYCBtYXkgYmUgc3RyaW5ncywgb3IgR19QYXJlbnRoZXNpcyBncm91cHMuXG5cdCovXG5cdFF1b3RlOiBnKCdxdW90ZScpLFxuXHQvKipcblx0VG9rZW5zIG9uIGEgbGluZS5cblx0VGhlIGluZGVudGVkIGJsb2NrIGZvbGxvd2luZyB0aGUgZW5kIG9mIHRoZSBsaW5lIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBwYXJ0IG9mIHRoZSBsaW5lIVxuXHRUaGlzIG1lYW5zIHRoYXQgaW4gdGhpcyBjb2RlOlxuXHRcdGFcblx0XHRcdGJcblx0XHRcdGNcblx0XHRkXG5cdFRoZXJlIGFyZSAyIGxpbmVzLCBvbmUgc3RhcnRpbmcgd2l0aCAnYScgYW5kIG9uZSBzdGFydGluZyB3aXRoICdkJy5cblx0VGhlIGZpcnN0IGxpbmUgY29udGFpbnMgJ2EnIGFuZCBhIGBCbG9ja2Agd2hpY2ggaW4gdHVybiBjb250YWlucyB0d28gb3RoZXIgbGluZXMuXG5cdCovXG5cdExpbmU6IGcoJ2xpbmUnKSxcblx0LyoqXG5cdEdyb3VwcyB0d28gb3IgbW9yZSB0b2tlbnMgdGhhdCBhcmUgKm5vdCogc2VwYXJhdGVkIGJ5IHNwYWNlcy5cblx0YGFbYl0uY2AgaXMgYW4gZXhhbXBsZS5cblx0QSBzaW5nbGUgdG9rZW4gb24gaXRzIG93biB3aWxsIG5vdCBiZSBnaXZlbiBhIGBTcGFjZWAgZ3JvdXAuXG5cdCovXG5cdFNwYWNlOiBnKCdzcGFjZScpXG59XG5cbi8qKlxuT3V0cHV0dGFibGUgZGVzY3JpcHRpb24gb2YgYSBncm91cCBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93R3JvdXBLaW5kKGdyb3VwS2luZCkge1xuXHRyZXR1cm4gZ3JvdXBLaW5kVG9OYW1lLmdldChncm91cEtpbmQpXG59XG5cbmxldCBuZXh0S2V5d29yZEtpbmQgPSAwXG5jb25zdFxuXHRrZXl3b3JkTmFtZVRvS2luZCA9IG5ldyBNYXAoKSxcblx0a2V5d29yZEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdG5hbWVLZXl3b3JkcyA9IG5ldyBTZXQoKSxcblx0cmVzZXJ2ZWRLZXl3b3JkcyA9IG5ldyBTZXQoKSxcblx0Ly8gVGhlc2Uga2V5d29yZHMgYXJlIHNwZWNpYWwgbmFtZXMuXG5cdC8vIFdoZW4gbGV4aW5nIGEgbmFtZSwgYSBtYXAgbG9va3VwIGlzIGRvbmUgYnkga2V5d29yZEtpbmRGcm9tTmFtZS5cblx0a3cgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0ga3dOb3ROYW1lKG5hbWUpXG5cdFx0bmFtZUtleXdvcmRzLmFkZChraW5kKVxuXHRcdGtleXdvcmROYW1lVG9LaW5kLnNldChuYW1lLCBraW5kKVxuXHRcdHJldHVybiBraW5kXG5cdH0sXG5cdC8vIFRoZXNlIGtleXdvcmRzIG11c3QgYmUgbGV4ZWQgc3BlY2lhbGx5LlxuXHRrd05vdE5hbWUgPSBkZWJ1Z05hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0S2V5d29yZEtpbmRcblx0XHRrZXl3b3JkS2luZFRvTmFtZS5zZXQoa2luZCwgZGVidWdOYW1lKVxuXHRcdG5leHRLZXl3b3JkS2luZCA9IG5leHRLZXl3b3JkS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9LFxuXHRrd1Jlc2VydmVkID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IGt3KG5hbWUpXG5cdFx0cmVzZXJ2ZWRLZXl3b3Jkcy5hZGQoa2luZClcblx0fVxuXG5jb25zdCByZXNlcnZlZF93b3JkcyA9IFtcblx0Ly8gSmF2YVNjcmlwdCByZXNlcnZlZCB3b3Jkc1xuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2F3YWl0Jyxcblx0J2NvbnN0Jyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luJyxcblx0J2luc3RhbmNlb2YnLFxuXHQnbGV0Jyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIG1hc29uIHJlc2VydmVkIHdvcmRzXG5cdCdhYnN0cmFjdCcsXG5cdCdhd2FpdCEnLFxuXHQnZGF0YScsXG5cdCdkZWw/Jyxcblx0J2Vsc2UhJyxcblx0J2ZpbmFsJyxcblx0J2dlbicsXG5cdCdnZW4hJyxcblx0J2dvdG8hJyxcblx0J2lzJyxcblx0J21ldGEnLFxuXHQnb3V0Jyxcblx0J3RvJyxcblx0J3VudGlsJyxcblx0J3VudGlsIScsXG5cdCd3aGlsZSEnXG5dXG5cbmZvciAoY29uc3QgbmFtZSBvZiByZXNlcnZlZF93b3Jkcylcblx0a3dSZXNlcnZlZChuYW1lKVxuXG4vKiogS2luZHMgb2Yge0BsaW5rIEtleXdvcmR9LiAqL1xuZXhwb3J0IGNvbnN0IEtleXdvcmRzID0ge1xuXHRBbmQ6IGt3KCdhbmQnKSxcblx0QXM6IGt3KCdhcycpLFxuXHRBc3NlcnQ6IGt3KCdhc3NlcnQhJyksXG5cdEFzc2VydE5vdDoga3coJ2ZvcmJpZCEnKSxcblx0QXNzaWduOiBrdygnPScpLFxuXHRBc3NpZ25NdXRhYmxlOiBrd05vdE5hbWUoJzo6PScpLFxuXHRMb2NhbE11dGF0ZToga3dOb3ROYW1lKCc6PScpLFxuXHRCcmVhazoga3coJ2JyZWFrIScpLFxuXHRCcmVha1dpdGhWYWw6IGt3KCdicmVhaycpLFxuXHRCdWlsdDoga3coJ2J1aWx0JyksXG5cdENhc2VEbzoga3coJ2Nhc2UhJyksXG5cdENhc2VWYWw6IGt3KCdjYXNlJyksXG5cdENhdGNoRG86IGt3KCdjYXRjaCEnKSxcblx0Q2F0Y2hWYWw6IGt3KCdjYXRjaCcpLFxuXHRDb25kOiBrdygnY29uZCcpLFxuXHRDbGFzczoga3coJ2NsYXNzJyksXG5cdENvbnN0cnVjdDoga3coJ2NvbnN0cnVjdCEnKSxcblx0RGVidWdnZXI6IGt3KCdkZWJ1Z2dlciEnKSxcblx0RGVsRG86IGt3KCdkZWwhJyksXG5cdERlbFZhbDoga3coJ2RlbCcpLFxuXHREbzoga3coJ2RvIScpLFxuXHREb3Q6IGt3Tm90TmFtZSgnLicpLFxuXHRFbGxpcHNpczoga3dOb3ROYW1lKCcuLi4gJyksXG5cdEVsc2U6IGt3KCdlbHNlJyksXG5cdEV4Y2VwdERvOiBrdygnZXhjZXB0IScpLFxuXHRFeGNlcHRWYWw6IGt3KCdleGNlcHQnKSxcblx0RmFsc2U6IGt3KCdmYWxzZScpLFxuXHRGaW5hbGx5OiBrdygnZmluYWxseSEnKSxcblx0Rm9jdXM6IGt3KCdfJyksXG5cdEZvckJhZzoga3coJ0Bmb3InKSxcblx0Rm9yRG86IGt3KCdmb3IhJyksXG5cdEZvclZhbDoga3coJ2ZvcicpLFxuXHRGdW46IGt3Tm90TmFtZSgnfCcpLFxuXHRGdW5Ebzoga3dOb3ROYW1lKCchfCcpLFxuXHRGdW5HZW46IGt3Tm90TmFtZSgnfnwnKSxcblx0RnVuR2VuRG86IGt3Tm90TmFtZSgnfiF8JyksXG5cdEZ1blRoaXM6IGt3Tm90TmFtZSgnLnwnKSxcblx0RnVuVGhpc0RvOiBrd05vdE5hbWUoJy4hfCcpLFxuXHRGdW5UaGlzR2VuOiBrd05vdE5hbWUoJy5+fCcpLFxuXHRGdW5UaGlzR2VuRG86IGt3Tm90TmFtZSgnLn4hfCcpLFxuXHRHZXQ6IGt3KCdnZXQnKSxcblx0SWZWYWw6IGt3KCdpZicpLFxuXHRJZkRvOiBrdygnaWYhJyksXG5cdElnbm9yZToga3coJ2lnbm9yZScpLFxuXHRMYXp5OiBrd05vdE5hbWUoJ34nKSxcblx0TWFwRW50cnk6IGt3KCctPicpLFxuXHROYW1lOiBrdygnbmFtZScpLFxuXHROZXc6IGt3KCduZXcnKSxcblx0Tm90OiBrdygnbm90JyksXG5cdE51bGw6IGt3KCdudWxsJyksXG5cdE9iakFzc2lnbjoga3dOb3ROYW1lKCcuICcpLFxuXHRPZjoga3coJ29mJyksXG5cdE9yOiBrdygnb3InKSxcblx0UGFzczoga3coJ3Bhc3MnKSxcblx0UmVnaW9uOiBrdygncmVnaW9uJyksXG5cdFNldDoga3coJ3NldCEnKSxcblx0U3VwZXJEbzoga3coJ3N1cGVyIScpLFxuXHRTdXBlclZhbDoga3coJ3N1cGVyJyksXG5cdFN0YXRpYzoga3coJ3N0YXRpYycpLFxuXHRTd2l0Y2hEbzoga3coJ3N3aXRjaCEnKSxcblx0U3dpdGNoVmFsOiBrdygnc3dpdGNoJyksXG5cdFRocm93OiBrdygndGhyb3chJyksXG5cdFRvZG86IGt3KCd0b2RvJyksXG5cdFRydWU6IGt3KCd0cnVlJyksXG5cdFRyeURvOiBrdygndHJ5IScpLFxuXHRUcnlWYWw6IGt3KCd0cnknKSxcblx0VHlwZToga3dOb3ROYW1lKCc6JyksXG5cdFVuZGVmaW5lZDoga3coJ3VuZGVmaW5lZCcpLFxuXHRVbmxlc3NWYWw6IGt3KCd1bmxlc3MnKSxcblx0VW5sZXNzRG86IGt3KCd1bmxlc3MhJyksXG5cdEltcG9ydDoga3coJ2ltcG9ydCcpLFxuXHRJbXBvcnREbzoga3coJ2ltcG9ydCEnKSxcblx0SW1wb3J0TGF6eToga3coJ2ltcG9ydH4nKSxcblx0V2l0aDoga3coJ3dpdGgnKSxcblx0WWllbGQ6IGt3KCc8ficpLFxuXHRZaWVsZFRvOiBrdygnPH5+Jylcbn1cblxuLyoqXG5OYW1lIG9mIGEga2V5d29yZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtpbmRcbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24ga2V5d29yZE5hbWUoa2luZCkge1xuXHRyZXR1cm4ga2V5d29yZEtpbmRUb05hbWUuZ2V0KGtpbmQpXG59XG5cbi8qKlxuU2VlIGlmIHRoZSBuYW1lIGlzIGEga2V5d29yZCBhbmQgaWYgc28gcmV0dXJuIGl0cyBraW5kLlxuQHJldHVybiB7P0tleXdvcmRzfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSkge1xuXHRjb25zdCBraW5kID0ga2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpXG5cdHJldHVybiBraW5kID09PSB1bmRlZmluZWQgPyBudWxsIDoga2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZChraW5kKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRmFsc2U6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuRmFsc2Vcblx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTmFtZVxuXHRcdGNhc2UgS2V5d29yZHMuTnVsbDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OdWxsXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcnVlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlRydWVcblx0XHRjYXNlIEtleXdvcmRzLlVuZGVmaW5lZDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5VbmRlZmluZWRcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEdyb3VwIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNHcm91cChncm91cEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNLZXl3b3JkKGtleXdvcmRLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiBhbnkgb2YgdGhlIGdpdmVuIGtpbmRzLlxuQHBhcmFtIHtTZXR9IGtleXdvcmRLaW5kc1xuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNBbnlLZXl3b3JkKGtleXdvcmRLaW5kcywgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIHdob3NlIHZhbHVlIGNhbiBiZSB1c2VkIGFzIGEgcHJvcGVydHkgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbilcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIHJlc2VydmVkIHdvcmQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChyZXNlcnZlZEtleXdvcmRzLCB0b2tlbilcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

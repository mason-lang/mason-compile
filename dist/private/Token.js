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
	      reservedKeywords = new Set();
	// These keywords are special names.
	// When lexing a name, a map lookup is done by keywordKindFromName.
	function kw(name) {
		const kind = kwNotName(name);
		nameKeywords.add(kind);
		keywordNameToKind.set(name, kind);
		return kind;
	}
	// These keywords must be lexed specially.
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

	const reservedWords = [
	// JavaScript reserved words
	'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public',

	// JavaScript keywords
	'arguments', 'async', 'await', 'const', 'delete', 'eval', 'in', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while',

	// Mason reserved words
	'!', 'abstract', 'actor', 'await!', 'data', 'del?', 'else!', 'final', 'is', 'meta', 'out', 'send', 'send!', 'to', 'type', 'until', 'until!', 'while!'];

	for (const name of reservedWords) kwReserved(name);

	/** Kinds of {@link Keyword}. */
	const Keywords = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCZSxPQUFNLEtBQUssQ0FBQztBQUMxQixhQUFXLENBQUMsR0FBRyxFQUFFO0FBQ2hCLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0dBQ2Q7RUFDRDs7Ozs7O21CQUpvQixLQUFLOztBQVVuQixPQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDaEMsYUFBVyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO0FBQ2pDLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7Ozs7QUFLVixPQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTs7QUFFMUIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7O0FBRUQsVUFBUSxHQUFHO0FBQ1YsVUFBTyxDQUFDLEdBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFBO0dBQzFDO0VBQ0Q7Ozs7Ozs7Ozs7OztBQVVNLE9BQU0sT0FBTyxTQUFTLEtBQUssQ0FBQztBQUNsQyxhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtBQUN0QixRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRVYsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7R0FDaEI7O0FBRUQsVUFBUSxHQUFHO0FBQ1YsVUFBTyxrQkEzREQsSUFBSSxFQTJERSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7R0FDN0M7RUFDRDs7Ozs7Ozs7QUFNTSxPQUFNLElBQUksU0FBUyxLQUFLLENBQUM7QUFDL0IsYUFBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLGVBQWU7QUFDbkMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1YsT0FBSSxDQUFDLElB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aWxlIjoiVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7U3BlY2lhbFZhbHN9IGZyb20gJy4vTXNBc3QnXG5cbi8qKlxuTGV4ZWQgZWxlbWVudCBpbiBhIHRyZWUgb2YgVG9rZW5zLlxuXG5TaW5jZSB7QGxpbmsgbGV4fSBkb2VzIGdyb3VwaW5nLCB7QGxpbmsgcGFyc2V9IGF2b2lkcyBkb2luZyBtdWNoIG9mIHRoZSB3b3JrIHBhcnNlcnMgdXN1YWxseSBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIHtAbGluayBHcm91cH0gb2Yga2luZCBHX1BhcmVudGhlc2lzLlxuVGhpcyBhbHNvIG1lYW5zIHRoYXQgdGhlIG1hbnkgZGlmZmVyZW50IHtAbGluayBNc0FzdH0gdHlwZXMgYWxsIHBhcnNlIGluIGEgc2ltaWxhciBtYW5uZXIsXG5rZWVwaW5nIHRoZSBsYW5ndWFnZSBjb25zaXN0ZW50LlxuXG5CZXNpZGVzIHtAbGluayBHcm91cH0sIHtAbGluayBLZXl3b3JkfSwge0BsaW5rIE5hbWV9LCBhbmQge0BsaW5rIERvY0NvbW1lbnR9LFxue0BsaW5rIE51bWJlckxpdGVyYWx9IHZhbHVlcyBhcmUgYWxzbyB0cmVhdGVkIGFzIFRva2Vucy5cblxuQGFic3RyYWN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8qKlxuQ29udGFpbnMgbXVsdGlwbGUgc3ViLXRva2Vucy5cblNlZSB7QGxpbmsgR3JvdXBLaW5kfSBmb3IgZXhwbGFuYXRpb25zLlxuKi9cbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBzdWJUb2tlbnMsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqXG5cdFx0VG9rZW5zIHdpdGhpbiB0aGlzIGdyb3VwLlxuXHRcdEB0eXBlIHtBcnJheTxUb2tlbj59XG5cdFx0Ki9cblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdC8qKiBAdHlwZSB7R3JvdXBzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBgJHtncm91cEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCl9YFxuXHR9XG59XG5cbi8qKlxuQSBcImtleXdvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cbkl0IGRvZW5zbid0IG5lY2Vzc2FyaWx5IGhhdmUgdG8gYmUgc29tZXRoaW5nIHRoYXQgbWlnaHQgaGF2ZSBiZWVuIGEge0BsaW5rIE5hbWV9LlxuRm9yIGV4YW1wbGUsIHNlZSB7QGxpbmsgS2V5d29yZHMuT2JqRW50cnl9LlxuXG5UaGlzIGNhbiBldmVuIGluY2x1ZGUgb25lcyBsaWtlIGAuIGAgKGRlZmluZXMgYW4gb2JqZWN0IHByb3BlcnR5LCBhcyBpbiBga2V5LiB2YWx1ZWApLlxuS2luZCBpcyBhICoqKi4gU2VlIHRoZSBmdWxsIGxpc3QgYmVsb3cuXG4qL1xuZXhwb3J0IGNsYXNzIEtleXdvcmQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge0tleXdvcmRzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKGtleXdvcmRLaW5kVG9OYW1lLmdldCh0aGlzLmtpbmQpKVxuXHR9XG59XG5cbi8qKlxuQW4gaWRlbnRpZmllci4gVXN1YWxseSB0aGUgbmFtZSBvZiBzb21lIGxvY2FsIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuQSBOYW1lIGlzIGd1YXJhbnRlZWQgdG8gbm90IGJlIGFueSBrZXl3b3JkLlxuKi9cbmV4cG9ydCBjbGFzcyBOYW1lIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG5hbWUgLyogU3RyaW5nICovKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdHRoaXMubmFtZSA9IG5hbWVcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBjb2RlKHRoaXMubmFtZSlcblx0fVxufVxuXG4vKipcbkRvY3VtZW50YXRpb24gY29tbWVudCAoYmVnaW5uaW5nIHdpdGggb25lIGB8YCByYXRoZXIgdGhhbiB0d28pLlxuTm9uLWRvYyBjb21tZW50cyBhcmUgaWdub3JlZCBieSB7QGxpbmsgbGV4fS5cblRoZXNlIGRvbid0IGFmZmVjdCBvdXRwdXQsIGJ1dCBhcmUgcGFzc2VkIHRvIHZhcmlvdXMge0BsaW5rIE1zQXN0fXMgZm9yIHVzZSBieSBvdGhlciB0b29scy5cbiovXG5leHBvcnQgY2xhc3MgRG9jQ29tbWVudCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCB0ZXh0KSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuXHRcdHRoaXMudGV4dCA9IHRleHRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiAnZG9jIGNvbW1lbnQnXG5cdH1cbn1cblxubGV0IG5leHRHcm91cEtpbmQgPSAwXG5jb25zdFxuXHRncm91cEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdGcgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0gbmV4dEdyb3VwS2luZFxuXHRcdGdyb3VwS2luZFRvTmFtZS5zZXQoa2luZCwgbmFtZSlcblx0XHRuZXh0R3JvdXBLaW5kID0gbmV4dEdyb3VwS2luZCArIDFcblx0XHRyZXR1cm4ga2luZFxuXHR9XG5cbi8qKlxuS2luZHMgb2Yge0BsaW5rIEdyb3VwfS5cbkBlbnVtIHtudW1iZXJ9XG4qL1xuZXhwb3J0IGNvbnN0IEdyb3VwcyA9IHtcblx0LyoqXG5cdFRva2VucyBzdXJyb3VuZGVkIGJ5IHBhcmVudGhlc2VzLlxuXHRUaGVyZSBtYXkgYmUgbm8gY2xvc2luZyBwYXJlbnRoZXNpcy4gSW46XG5cblx0XHRhIChiXG5cdFx0XHRjXG5cblx0VGhlIHRva2VucyBhcmUgYSBHcm91cDxMaW5lPihOYW1lLCBHcm91cDxQYXJlbnRoZXNpcz4oLi4uKSlcblx0Ki9cblx0UGFyZW50aGVzaXM6IGcoJygpJyksXG5cdC8qKiBMaWtlIGBQYXJlbnRoZXNpc2AsIGJ1dCBzaW1wbGVyIGJlY2F1c2UgdGhlcmUgbXVzdCBiZSBhIGNsb3NpbmcgYF1gLiAqL1xuXHRCcmFja2V0OiBnKCdbXScpLFxuXHQvKipcblx0TGluZXMgaW4gYW4gaW5kZW50ZWQgYmxvY2suXG5cdFN1Yi10b2tlbnMgd2lsbCBhbHdheXMgYmUgYExpbmVgIGdyb3Vwcy5cblx0Tm90ZSB0aGF0IGBCbG9ja2BzIGRvIG5vdCBhbHdheXMgbWFwIHRvIEJsb2NrKiBNc0FzdHMuXG5cdCovXG5cdEJsb2NrOiBnKCdpbmRlbnRlZCBibG9jaycpLFxuXHQvKipcblx0VG9rZW5zIHdpdGhpbiBhIHF1b3RlLlxuXHRgc3ViVG9rZW5zYCBtYXkgYmUgc3RyaW5ncywgb3IgR19QYXJlbnRoZXNpcyBncm91cHMuXG5cdCovXG5cdFF1b3RlOiBnKCdxdW90ZScpLFxuXHQvKipcblx0VG9rZW5zIG9uIGEgbGluZS5cblx0VGhlIGluZGVudGVkIGJsb2NrIGZvbGxvd2luZyB0aGUgZW5kIG9mIHRoZSBsaW5lIGlzIGNvbnNpZGVyZWQgdG8gYmUgYSBwYXJ0IG9mIHRoZSBsaW5lIVxuXHRUaGlzIG1lYW5zIHRoYXQgaW4gdGhpcyBjb2RlOlxuXHRcdGFcblx0XHRcdGJcblx0XHRcdGNcblx0XHRkXG5cdFRoZXJlIGFyZSAyIGxpbmVzLCBvbmUgc3RhcnRpbmcgd2l0aCAnYScgYW5kIG9uZSBzdGFydGluZyB3aXRoICdkJy5cblx0VGhlIGZpcnN0IGxpbmUgY29udGFpbnMgJ2EnIGFuZCBhIGBCbG9ja2Agd2hpY2ggaW4gdHVybiBjb250YWlucyB0d28gb3RoZXIgbGluZXMuXG5cdCovXG5cdExpbmU6IGcoJ2xpbmUnKSxcblx0LyoqXG5cdEdyb3VwcyB0d28gb3IgbW9yZSB0b2tlbnMgdGhhdCBhcmUgKm5vdCogc2VwYXJhdGVkIGJ5IHNwYWNlcy5cblx0YGFbYl0uY2AgaXMgYW4gZXhhbXBsZS5cblx0QSBzaW5nbGUgdG9rZW4gb24gaXRzIG93biB3aWxsIG5vdCBiZSBnaXZlbiBhIGBTcGFjZWAgZ3JvdXAuXG5cdCovXG5cdFNwYWNlOiBnKCdzcGFjZScpXG59XG5cbi8qKlxuT3V0cHV0dGFibGUgZGVzY3JpcHRpb24gb2YgYSBncm91cCBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93R3JvdXBLaW5kKGdyb3VwS2luZCkge1xuXHRyZXR1cm4gZ3JvdXBLaW5kVG9OYW1lLmdldChncm91cEtpbmQpXG59XG5cbmxldCBuZXh0S2V5d29yZEtpbmQgPSAwXG5jb25zdFxuXHRrZXl3b3JkTmFtZVRvS2luZCA9IG5ldyBNYXAoKSxcblx0a2V5d29yZEtpbmRUb05hbWUgPSBuZXcgTWFwKCksXG5cdG5hbWVLZXl3b3JkcyA9IG5ldyBTZXQoKSxcblx0cmVzZXJ2ZWRLZXl3b3JkcyA9IG5ldyBTZXQoKVxuLy8gVGhlc2Uga2V5d29yZHMgYXJlIHNwZWNpYWwgbmFtZXMuXG4vLyBXaGVuIGxleGluZyBhIG5hbWUsIGEgbWFwIGxvb2t1cCBpcyBkb25lIGJ5IGtleXdvcmRLaW5kRnJvbU5hbWUuXG5mdW5jdGlvbiBrdyhuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrd05vdE5hbWUobmFtZSlcblx0bmFtZUtleXdvcmRzLmFkZChraW5kKVxuXHRrZXl3b3JkTmFtZVRvS2luZC5zZXQobmFtZSwga2luZClcblx0cmV0dXJuIGtpbmRcbn1cbi8vIFRoZXNlIGtleXdvcmRzIG11c3QgYmUgbGV4ZWQgc3BlY2lhbGx5LlxuZnVuY3Rpb24ga3dOb3ROYW1lKGRlYnVnTmFtZSkge1xuXHRjb25zdCBraW5kID0gbmV4dEtleXdvcmRLaW5kXG5cdGtleXdvcmRLaW5kVG9OYW1lLnNldChraW5kLCBkZWJ1Z05hbWUpXG5cdG5leHRLZXl3b3JkS2luZCA9IG5leHRLZXl3b3JkS2luZCArIDFcblx0cmV0dXJuIGtpbmRcbn1cbmZ1bmN0aW9uIGt3UmVzZXJ2ZWQobmFtZSkge1xuXHRjb25zdCBraW5kID0ga3cobmFtZSlcblx0cmVzZXJ2ZWRLZXl3b3Jkcy5hZGQoa2luZClcbn1cblxuY29uc3QgcmVzZXJ2ZWRXb3JkcyA9IFtcblx0Ly8gSmF2YVNjcmlwdCByZXNlcnZlZCB3b3Jkc1xuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2FzeW5jJyxcblx0J2F3YWl0Jyxcblx0J2NvbnN0Jyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luJyxcblx0J2luc3RhbmNlb2YnLFxuXHQnbGV0Jyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIE1hc29uIHJlc2VydmVkIHdvcmRzXG5cdCchJyxcblx0J2Fic3RyYWN0Jyxcblx0J2FjdG9yJyxcblx0J2F3YWl0IScsXG5cdCdkYXRhJyxcblx0J2RlbD8nLFxuXHQnZWxzZSEnLFxuXHQnZmluYWwnLFxuXHQnaXMnLFxuXHQnbWV0YScsXG5cdCdvdXQnLFxuXHQnc2VuZCcsXG5cdCdzZW5kIScsXG5cdCd0bycsXG5cdCd0eXBlJyxcblx0J3VudGlsJyxcblx0J3VudGlsIScsXG5cdCd3aGlsZSEnXG5dXG5cbmZvciAoY29uc3QgbmFtZSBvZiByZXNlcnZlZFdvcmRzKVxuXHRrd1Jlc2VydmVkKG5hbWUpXG5cbi8qKiBLaW5kcyBvZiB7QGxpbmsgS2V5d29yZH0uICovXG5leHBvcnQgY29uc3QgS2V5d29yZHMgPSB7XG5cdEFtcGVyc2FuZDoga3dOb3ROYW1lKCcmJyksXG5cdEFuZDoga3coJ2FuZCcpLFxuXHRBczoga3coJ2FzJyksXG5cdEFzc2VydDoga3coJ2Fzc2VydCEnKSxcblx0QXNzZXJ0Tm90OiBrdygnZm9yYmlkIScpLFxuXHRBc3NpZ246IGt3KCc9JyksXG5cdEFzc2lnbk11dGFibGU6IGt3Tm90TmFtZSgnOjo9JyksXG5cdExvY2FsTXV0YXRlOiBrd05vdE5hbWUoJzo9JyksXG5cdEJyZWFrOiBrdygnYnJlYWshJyksXG5cdEJyZWFrV2l0aFZhbDoga3coJ2JyZWFrJyksXG5cdEJ1aWx0OiBrdygnYnVpbHQnKSxcblx0Q2FzZURvOiBrdygnY2FzZSEnKSxcblx0Q2FzZVZhbDoga3coJ2Nhc2UnKSxcblx0Q2F0Y2hEbzoga3coJ2NhdGNoIScpLFxuXHRDYXRjaFZhbDoga3coJ2NhdGNoJyksXG5cdENvbmQ6IGt3KCdjb25kJyksXG5cdENsYXNzOiBrdygnY2xhc3MnKSxcblx0Q29uc3RydWN0OiBrdygnY29uc3RydWN0IScpLFxuXHREZWJ1Z2dlcjoga3coJ2RlYnVnZ2VyIScpLFxuXHREZWxEbzoga3coJ2RlbCEnKSxcblx0RGVsVmFsOiBrdygnZGVsJyksXG5cdERvOiBrdygnZG8hJyksXG5cdERvdDoga3dOb3ROYW1lKCcuJyksXG5cdERvdDI6IGt3Tm90TmFtZSgnLi4nKSxcblx0RG90Mzoga3dOb3ROYW1lKCcuLi4gJyksXG5cdEVsc2U6IGt3KCdlbHNlJyksXG5cdEV4Y2VwdERvOiBrdygnZXhjZXB0IScpLFxuXHRFeGNlcHRWYWw6IGt3KCdleGNlcHQnKSxcblx0RmFsc2U6IGt3KCdmYWxzZScpLFxuXHRGaW5hbGx5OiBrdygnZmluYWxseSEnKSxcblx0Rm9jdXM6IGt3KCdfJyksXG5cdEZvckJhZzoga3coJ0Bmb3InKSxcblx0Rm9yRG86IGt3KCdmb3IhJyksXG5cdEZvclZhbDoga3coJ2ZvcicpLFxuXHRGdW46IGt3Tm90TmFtZSgnfCcpLFxuXHRGdW5Ebzoga3dOb3ROYW1lKCchfCcpLFxuXHRGdW5UaGlzOiBrd05vdE5hbWUoJy58JyksXG5cdEZ1blRoaXNEbzoga3dOb3ROYW1lKCcuIXwnKSxcblx0RnVuQXN5bmM6IGt3Tm90TmFtZSgnJHwnKSxcblx0RnVuQXN5bmNEbzoga3dOb3ROYW1lKCckIXwnKSxcblx0RnVuVGhpc0FzeW5jOiBrd05vdE5hbWUoJy4kfCcpLFxuXHRGdW5UaGlzQXN5bmNEbzoga3dOb3ROYW1lKCcuJCF8JyksXG5cdEZ1bkdlbjoga3dOb3ROYW1lKCd+fCcpLFxuXHRGdW5HZW5Ebzoga3dOb3ROYW1lKCd+IXwnKSxcblx0RnVuVGhpc0dlbjoga3dOb3ROYW1lKCcufnwnKSxcblx0RnVuVGhpc0dlbkRvOiBrd05vdE5hbWUoJy5+IXwnKSxcblx0R2V0OiBrdygnZ2V0JyksXG5cdElmVmFsOiBrdygnaWYnKSxcblx0SWZEbzoga3coJ2lmIScpLFxuXHRJZ25vcmU6IGt3KCdpZ25vcmUnKSxcblx0TGF6eToga3dOb3ROYW1lKCd+JyksXG5cdE1hcEVudHJ5OiBrdygnLT4nKSxcblx0TmFtZToga3coJ25hbWUnKSxcblx0TmV3OiBrdygnbmV3JyksXG5cdE5vdDoga3coJ25vdCcpLFxuXHROdWxsOiBrdygnbnVsbCcpLFxuXHRPYmpBc3NpZ246IGt3Tm90TmFtZSgnLiAnKSxcblx0T2Y6IGt3KCdvZicpLFxuXHRPcjoga3coJ29yJyksXG5cdFBhc3M6IGt3KCdwYXNzJyksXG5cdFJlZ2lvbjoga3coJ3JlZ2lvbicpLFxuXHRTZXQ6IGt3KCdzZXQhJyksXG5cdFN1cGVyRG86IGt3KCdzdXBlciEnKSxcblx0U3VwZXJWYWw6IGt3KCdzdXBlcicpLFxuXHRTdGF0aWM6IGt3KCdzdGF0aWMnKSxcblx0U3dpdGNoRG86IGt3KCdzd2l0Y2ghJyksXG5cdFN3aXRjaFZhbDoga3coJ3N3aXRjaCcpLFxuXHRUaWNrOiBrd05vdE5hbWUoJ1xcJycpLFxuXHRUaHJvdzoga3coJ3Rocm93IScpLFxuXHRUb2RvOiBrdygndG9kbycpLFxuXHRUcnVlOiBrdygndHJ1ZScpLFxuXHRUcnlEbzoga3coJ3RyeSEnKSxcblx0VHJ5VmFsOiBrdygndHJ5JyksXG5cdFR5cGU6IGt3Tm90TmFtZSgnOicpLFxuXHRVbmRlZmluZWQ6IGt3KCd1bmRlZmluZWQnKSxcblx0VW5sZXNzVmFsOiBrdygndW5sZXNzJyksXG5cdFVubGVzc0RvOiBrdygndW5sZXNzIScpLFxuXHRJbXBvcnQ6IGt3KCdpbXBvcnQnKSxcblx0SW1wb3J0RG86IGt3KCdpbXBvcnQhJyksXG5cdEltcG9ydExhenk6IGt3KCdpbXBvcnR+JyksXG5cdFdpdGg6IGt3KCd3aXRoJyksXG5cdFlpZWxkOiBrdygnPH4nKSxcblx0WWllbGRUbzoga3coJzx+ficpXG59XG5cbi8qKlxuTmFtZSBvZiBhIGtleXdvcmQuXG5AcGFyYW0ge0tleXdvcmRzfSBraW5kXG5AcmV0dXJuIHtzdHJpbmd9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGtleXdvcmROYW1lKGtpbmQpIHtcblx0cmV0dXJuIGtleXdvcmRLaW5kVG9OYW1lLmdldChraW5kKVxufVxuXG4vKipcblNlZSBpZiB0aGUgbmFtZSBpcyBhIGtleXdvcmQgYW5kIGlmIHNvIHJldHVybiBpdHMga2luZC5cbkByZXR1cm4gez9LZXl3b3Jkc31cbiovXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpIHtcblx0Y29uc3Qga2luZCA9IGtleXdvcmROYW1lVG9LaW5kLmdldChuYW1lKVxuXHRyZXR1cm4ga2luZCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGtpbmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wS2V5d29yZEtpbmRUb1NwZWNpYWxWYWx1ZUtpbmQoa2luZCkge1xuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZhbHNlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLkZhbHNlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5OYW1lOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLk5hbWVcblx0XHRjYXNlIEtleXdvcmRzLk51bGw6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTnVsbFxuXHRcdGNhc2UgS2V5d29yZHMuVHJ1ZTpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5UcnVlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5VbmRlZmluZWQ6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuVW5kZWZpbmVkXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBudWxsXG5cdH1cbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBHcm91cCBvZiB0aGUgZ2l2ZW4ga2luZC5cbkBwYXJhbSB7R3JvdXBzfSBncm91cEtpbmRcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR3JvdXAoZ3JvdXBLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBHcm91cCAmJiB0b2tlbi5raW5kID09PSBncm91cEtpbmRcbn1cblxuLyoqXG5XaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2V5d29yZEtpbmRcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzS2V5d29yZChrZXl3b3JkS2luZCwgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiB0b2tlbi5raW5kID09PSBrZXl3b3JkS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgYW55IG9mIHRoZSBnaXZlbiBraW5kcy5cbkBwYXJhbSB7U2V0fSBrZXl3b3JkS2luZHNcbkBwYXJhbSB7VG9rZW59IHRva2VuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQW55S2V5d29yZChrZXl3b3JkS2luZHMsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQgJiYga2V5d29yZEtpbmRzLmhhcyh0b2tlbi5raW5kKVxufVxuXG4vKiogV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCB3aG9zZSB2YWx1ZSBjYW4gYmUgdXNlZCBhcyBhIHByb3BlcnR5IG5hbWUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lS2V5d29yZCh0b2tlbikge1xuXHRyZXR1cm4gaXNBbnlLZXl3b3JkKG5hbWVLZXl3b3JkcywgdG9rZW4pXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSByZXNlcnZlZCB3b3JkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVzZXJ2ZWRLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQocmVzZXJ2ZWRLZXl3b3JkcywgdG9rZW4pXG59XG4iXX0=
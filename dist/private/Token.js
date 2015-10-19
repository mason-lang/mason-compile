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
	'abstract', 'await!', 'data', 'del', 'del?', 'del!', 'else!', 'final', 'gen', 'gen!', 'goto!', 'is', 'meta', 'out', 'to', 'until', 'until!', 'while!'];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRva2VuLmpzIiwicHJpdmF0ZS9Ub2tlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDZ0JlLE9BQU0sS0FBSyxDQUFDO0FBQzFCLGFBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDaEIsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZDtFQUNEOzs7Ozs7bUJBSm9CLEtBQUs7O0FBVW5CLE9BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNoQyxhQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUU7QUFDakMsUUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOzs7OztBQUtWLE9BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBOztBQUUxQixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFDVixVQUFPLENBQUMsR0FBRSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUE7R0FDMUM7RUFDRDs7Ozs7Ozs7Ozs7O0FBVU0sT0FBTSxPQUFPLFNBQVMsS0FBSyxDQUFDO0FBQ2xDLGFBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQ3RCLFFBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFVixPQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtHQUNoQjs7QUFFRCxVQUFRLEdBQUc7QUFDVixVQUFPLGtCQTNERCxJQUFJLEVBMkRFLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtHQUM3QztFQUNEOzs7Ozs7OztBQU1NLE9BQU0sSUFBSSxTQUFTLEtBQUssQ0FBQztBQUMvQixhQUFXLENBQUMsR0FBRyxFQUFFLElBQUksZUFBZTtBQUNuQyxRQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixPQUFJLENBQUMsSUFBSSxHQUFH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R0FDWjtFQUNEOzs7Ozs7OztBQU9NLFVBQVMsT0FBTyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUU7QUFDekMsU0FBTyxLQUFLLFlBQVksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFBO0VBQ3pEOzs7Ozs7OztBQU9NLFVBQVMsU0FBUyxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUU7QUFDN0MsU0FBTyxLQUFLLFlBQVksT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0VBQzdEOzs7Ozs7OztBQU9NLFVBQVMsWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUU7QUFDakQsU0FBTyxLQUFLLFlBQVksT0FBTyxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0VBQy9EOzs7O0FBR00sVUFBUyxhQUFhLENBQUMsS0FBSyxFQUFFO0FBQ3BDLFNBQU8sWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQTtFQUN4Qzs7OztBQUdNLFVBQVMsaUJBQWlCLENBQUMsS0FBSyxFQUFFO0FBQ3hDLFNBQU8sWUFBWSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQzVDIiwiZmlsZSI6InByaXZhdGUvVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtTcGVjaWFsVmFsc30gZnJvbSAnLi9Nc0FzdCdcblxuLyoqXG5MZXhlZCBlbGVtZW50IGluIGEgdHJlZSBvZiBUb2tlbnMuXG5cblNpbmNlIHtAbGluayBsZXh9IGRvZXMgZ3JvdXBpbmcsIHtAbGluayBwYXJzZX0gYXZvaWRzIGRvaW5nIG11Y2ggb2YgdGhlIHdvcmsgcGFyc2VycyB1c3VhbGx5IGRvO1xuaXQgZG9lc24ndCBoYXZlIHRvIGhhbmRsZSBhIFwibGVmdCBwYXJlbnRoZXNpc1wiLCBvbmx5IGEge0BsaW5rIEdyb3VwfSBvZiBraW5kIEdfUGFyZW50aGVzaXMuXG5UaGlzIGFsc28gbWVhbnMgdGhhdCB0aGUgbWFueSBkaWZmZXJlbnQge0BsaW5rIE1zQXN0fSB0eXBlcyBhbGwgcGFyc2UgaW4gYSBzaW1pbGFyIG1hbm5lcixcbmtlZXBpbmcgdGhlIGxhbmd1YWdlIGNvbnNpc3RlbnQuXG5cbkJlc2lkZXMge0BsaW5rIEdyb3VwfSwge0BsaW5rIEtleXdvcmR9LCB7QGxpbmsgTmFtZX0sIGFuZCB7QGxpbmsgRG9jQ29tbWVudH0sXG57QGxpbmsgTnVtYmVyTGl0ZXJhbH0gdmFsdWVzIGFyZSBhbHNvIHRyZWF0ZWQgYXMgVG9rZW5zLlxuXG5AYWJzdHJhY3RcbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cbn1cblxuLyoqXG5Db250YWlucyBtdWx0aXBsZSBzdWItdG9rZW5zLlxuU2VlIHtAbGluayBHcm91cEtpbmR9IGZvciBleHBsYW5hdGlvbnMuXG4qL1xuZXhwb3J0IGNsYXNzIEdyb3VwIGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHN1YlRva2Vucywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKipcblx0XHRUb2tlbnMgd2l0aGluIHRoaXMgZ3JvdXAuXG5cdFx0QHR5cGUge0FycmF5PFRva2VuPn1cblx0XHQqL1xuXHRcdHRoaXMuc3ViVG9rZW5zID0gc3ViVG9rZW5zXG5cdFx0LyoqIEB0eXBlIHtHcm91cHN9ICovXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGAke2dyb3VwS2luZFRvTmFtZS5nZXQodGhpcy5raW5kKX1gXG5cdH1cbn1cblxuLyoqXG5BIFwia2V5d29yZFwiIGlzIGFueSBzZXQgb2YgY2hhcmFjdGVycyB3aXRoIGEgcGFydGljdWxhciBtZWFuaW5nLlxuSXQgZG9lbnNuJ3QgbmVjZXNzYXJpbHkgaGF2ZSB0byBiZSBzb21ldGhpbmcgdGhhdCBtaWdodCBoYXZlIGJlZW4gYSB7QGxpbmsgTmFtZX0uXG5Gb3IgZXhhbXBsZSwgc2VlIHtAbGluayBLZXl3b3Jkcy5PYmpFbnRyeX0uXG5cblRoaXMgY2FuIGV2ZW4gaW5jbHVkZSBvbmVzIGxpa2UgYC4gYCAoZGVmaW5lcyBhbiBvYmplY3QgcHJvcGVydHksIGFzIGluIGBrZXkuIHZhbHVlYCkuXG5LaW5kIGlzIGEgKioqLiBTZWUgdGhlIGZ1bGwgbGlzdCBiZWxvdy5cbiovXG5leHBvcnQgY2xhc3MgS2V5d29yZCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBraW5kKSB7XG5cdFx0c3VwZXIobG9jKVxuXHRcdC8qKiBAdHlwZSB7S2V5d29yZHN9ICovXG5cdFx0dGhpcy5raW5kID0ga2luZFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGNvZGUoa2V5d29yZEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCkpXG5cdH1cbn1cblxuLyoqXG5BbiBpZGVudGlmaWVyLiBVc3VhbGx5IHRoZSBuYW1lIG9mIHNvbWUgbG9jYWwgdmFyaWFibGUgb3IgcHJvcGVydHkuXG5BIE5hbWUgaXMgZ3VhcmFudGVlZCB0byBub3QgYmUgYW55IGtleXdvcmQuXG4qL1xuZXhwb3J0IGNsYXNzIE5hbWUgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgbmFtZSAvKiBTdHJpbmcgKi8pIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0dGhpcy5uYW1lID0gbmFtZVxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIGNvZGUodGhpcy5uYW1lKVxuXHR9XG59XG5cbi8qKlxuRG9jdW1lbnRhdGlvbiBjb21tZW50IChiZWdpbm5pbmcgd2l0aCBvbmUgYHxgIHJhdGhlciB0aGFuIHR3bykuXG5Ob24tZG9jIGNvbW1lbnRzIGFyZSBpZ25vcmVkIGJ5IHtAbGluayBsZXh9LlxuVGhlc2UgZG9uJ3QgYWZmZWN0IG91dHB1dCwgYnV0IGFyZSBwYXNzZWQgdG8gdmFyaW91cyB7QGxpbmsgTXNBc3R9cyBmb3IgdXNlIGJ5IG90aGVyIHRvb2xzLlxuKi9cbmV4cG9ydCBjbGFzcyBEb2NDb21tZW50IGV4dGVuZHMgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIHRleHQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqIEB0eXBlIHtzdHJpbmd9ICovXG5cdFx0dGhpcy50ZXh0ID0gdGV4dFxuXHR9XG5cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuICdkb2MgY29tbWVudCdcblx0fVxufVxuXG5sZXQgbmV4dEdyb3VwS2luZCA9IDBcbmNvbnN0XG5cdGdyb3VwS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0ZyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBuZXh0R3JvdXBLaW5kXG5cdFx0Z3JvdXBLaW5kVG9OYW1lLnNldChraW5kLCBuYW1lKVxuXHRcdG5leHRHcm91cEtpbmQgPSBuZXh0R3JvdXBLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH1cblxuLyoqXG5LaW5kcyBvZiB7QGxpbmsgR3JvdXB9LlxuQGVudW0ge251bWJlcn1cbiovXG5leHBvcnQgY29uc3QgR3JvdXBzID0ge1xuXHQvKipcblx0VG9rZW5zIHN1cnJvdW5kZWQgYnkgcGFyZW50aGVzZXMuXG5cdFRoZXJlIG1heSBiZSBubyBjbG9zaW5nIHBhcmVudGhlc2lzLiBJbjpcblxuXHRcdGEgKGJcblx0XHRcdGNcblxuXHRUaGUgdG9rZW5zIGFyZSBhIEdyb3VwPExpbmU+KE5hbWUsIEdyb3VwPFBhcmVudGhlc2lzPiguLi4pKVxuXHQqL1xuXHRQYXJlbnRoZXNpczogZygnKCknKSxcblx0LyoqIExpa2UgYFBhcmVudGhlc2lzYCwgYnV0IHNpbXBsZXIgYmVjYXVzZSB0aGVyZSBtdXN0IGJlIGEgY2xvc2luZyBgXWAuICovXG5cdEJyYWNrZXQ6IGcoJ1tdJyksXG5cdC8qKlxuXHRMaW5lcyBpbiBhbiBpbmRlbnRlZCBibG9jay5cblx0U3ViLXRva2VucyB3aWxsIGFsd2F5cyBiZSBgTGluZWAgZ3JvdXBzLlxuXHROb3RlIHRoYXQgYEJsb2NrYHMgZG8gbm90IGFsd2F5cyBtYXAgdG8gQmxvY2sqIE1zQXN0cy5cblx0Ki9cblx0QmxvY2s6IGcoJ2luZGVudGVkIGJsb2NrJyksXG5cdC8qKlxuXHRUb2tlbnMgd2l0aGluIGEgcXVvdGUuXG5cdGBzdWJUb2tlbnNgIG1heSBiZSBzdHJpbmdzLCBvciBHX1BhcmVudGhlc2lzIGdyb3Vwcy5cblx0Ki9cblx0UXVvdGU6IGcoJ3F1b3RlJyksXG5cdC8qKlxuXHRUb2tlbnMgb24gYSBsaW5lLlxuXHRUaGUgaW5kZW50ZWQgYmxvY2sgZm9sbG93aW5nIHRoZSBlbmQgb2YgdGhlIGxpbmUgaXMgY29uc2lkZXJlZCB0byBiZSBhIHBhcnQgb2YgdGhlIGxpbmUhXG5cdFRoaXMgbWVhbnMgdGhhdCBpbiB0aGlzIGNvZGU6XG5cdFx0YVxuXHRcdFx0YlxuXHRcdFx0Y1xuXHRcdGRcblx0VGhlcmUgYXJlIDIgbGluZXMsIG9uZSBzdGFydGluZyB3aXRoICdhJyBhbmQgb25lIHN0YXJ0aW5nIHdpdGggJ2QnLlxuXHRUaGUgZmlyc3QgbGluZSBjb250YWlucyAnYScgYW5kIGEgYEJsb2NrYCB3aGljaCBpbiB0dXJuIGNvbnRhaW5zIHR3byBvdGhlciBsaW5lcy5cblx0Ki9cblx0TGluZTogZygnbGluZScpLFxuXHQvKipcblx0R3JvdXBzIHR3byBvciBtb3JlIHRva2VucyB0aGF0IGFyZSAqbm90KiBzZXBhcmF0ZWQgYnkgc3BhY2VzLlxuXHRgYVtiXS5jYCBpcyBhbiBleGFtcGxlLlxuXHRBIHNpbmdsZSB0b2tlbiBvbiBpdHMgb3duIHdpbGwgbm90IGJlIGdpdmVuIGEgYFNwYWNlYCBncm91cC5cblx0Ki9cblx0U3BhY2U6IGcoJ3NwYWNlJylcbn1cblxuLyoqXG5PdXRwdXR0YWJsZSBkZXNjcmlwdGlvbiBvZiBhIGdyb3VwIGtpbmQuXG5AcGFyYW0ge0dyb3Vwc30gZ3JvdXBLaW5kXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dHcm91cEtpbmQoZ3JvdXBLaW5kKSB7XG5cdHJldHVybiBncm91cEtpbmRUb05hbWUuZ2V0KGdyb3VwS2luZClcbn1cblxubGV0IG5leHRLZXl3b3JkS2luZCA9IDBcbmNvbnN0XG5cdGtleXdvcmROYW1lVG9LaW5kID0gbmV3IE1hcCgpLFxuXHRrZXl3b3JkS2luZFRvTmFtZSA9IG5ldyBNYXAoKSxcblx0bmFtZUtleXdvcmRzID0gbmV3IFNldCgpLFxuXHRyZXNlcnZlZEtleXdvcmRzID0gbmV3IFNldCgpLFxuXHQvLyBUaGVzZSBrZXl3b3JkcyBhcmUgc3BlY2lhbCBuYW1lcy5cblx0Ly8gV2hlbiBsZXhpbmcgYSBuYW1lLCBhIG1hcCBsb29rdXAgaXMgZG9uZSBieSBrZXl3b3JkS2luZEZyb21OYW1lLlxuXHRrdyA9IG5hbWUgPT4ge1xuXHRcdGNvbnN0IGtpbmQgPSBrd05vdE5hbWUobmFtZSlcblx0XHRuYW1lS2V5d29yZHMuYWRkKGtpbmQpXG5cdFx0a2V5d29yZE5hbWVUb0tpbmQuc2V0KG5hbWUsIGtpbmQpXG5cdFx0cmV0dXJuIGtpbmRcblx0fSxcblx0Ly8gVGhlc2Uga2V5d29yZHMgbXVzdCBiZSBsZXhlZCBzcGVjaWFsbHkuXG5cdGt3Tm90TmFtZSA9IGRlYnVnTmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IG5leHRLZXl3b3JkS2luZFxuXHRcdGtleXdvcmRLaW5kVG9OYW1lLnNldChraW5kLCBkZWJ1Z05hbWUpXG5cdFx0bmV4dEtleXdvcmRLaW5kID0gbmV4dEtleXdvcmRLaW5kICsgMVxuXHRcdHJldHVybiBraW5kXG5cdH0sXG5cdGt3UmVzZXJ2ZWQgPSBuYW1lID0+IHtcblx0XHRjb25zdCBraW5kID0ga3cobmFtZSlcblx0XHRyZXNlcnZlZEtleXdvcmRzLmFkZChraW5kKVxuXHR9XG5cbmNvbnN0IHJlc2VydmVkX3dvcmRzID0gW1xuXHQvLyBKYXZhU2NyaXB0IHJlc2VydmVkIHdvcmRzXG5cdCdlbnVtJyxcblx0J2ltcGxlbWVudHMnLFxuXHQnaW50ZXJmYWNlJyxcblx0J3BhY2thZ2UnLFxuXHQncHJpdmF0ZScsXG5cdCdwcm90ZWN0ZWQnLFxuXHQncHVibGljJyxcblxuXHQvLyBKYXZhU2NyaXB0IGtleXdvcmRzXG5cdCdhcmd1bWVudHMnLFxuXHQnYXdhaXQnLFxuXHQnY29uc3QnLFxuXHQnZGVsZXRlJyxcblx0J2V2YWwnLFxuXHQnaW4nLFxuXHQnaW5zdGFuY2VvZicsXG5cdCdsZXQnLFxuXHQncmV0dXJuJyxcblx0J3R5cGVvZicsXG5cdCd2YXInLFxuXHQndm9pZCcsXG5cdCd3aGlsZScsXG5cblx0Ly8gbWFzb24gcmVzZXJ2ZWQgd29yZHNcblx0J2Fic3RyYWN0Jyxcblx0J2F3YWl0IScsXG5cdCdkYXRhJyxcblx0J2RlbCcsXG5cdCdkZWw/Jyxcblx0J2RlbCEnLFxuXHQnZWxzZSEnLFxuXHQnZmluYWwnLFxuXHQnZ2VuJyxcblx0J2dlbiEnLFxuXHQnZ290byEnLFxuXHQnaXMnLFxuXHQnbWV0YScsXG5cdCdvdXQnLFxuXHQndG8nLFxuXHQndW50aWwnLFxuXHQndW50aWwhJyxcblx0J3doaWxlISdcbl1cblxuZm9yIChjb25zdCBuYW1lIG9mIHJlc2VydmVkX3dvcmRzKVxuXHRrd1Jlc2VydmVkKG5hbWUpXG5cbi8qKiBLaW5kcyBvZiB7QGxpbmsgS2V5d29yZH0uICovXG5leHBvcnQgY29uc3QgS2V5d29yZHMgPSB7XG5cdEFuZDoga3coJ2FuZCcpLFxuXHRBczoga3coJ2FzJyksXG5cdEFzc2VydDoga3coJ2Fzc2VydCEnKSxcblx0QXNzZXJ0Tm90OiBrdygnZm9yYmlkIScpLFxuXHRBc3NpZ246IGt3KCc9JyksXG5cdEFzc2lnbk11dGFibGU6IGt3Tm90TmFtZSgnOjo9JyksXG5cdExvY2FsTXV0YXRlOiBrd05vdE5hbWUoJzo9JyksXG5cdEJyZWFrOiBrdygnYnJlYWshJyksXG5cdEJyZWFrV2l0aFZhbDoga3coJ2JyZWFrJyksXG5cdEJ1aWx0OiBrdygnYnVpbHQnKSxcblx0Q2FzZURvOiBrdygnY2FzZSEnKSxcblx0Q2FzZVZhbDoga3coJ2Nhc2UnKSxcblx0Q2F0Y2hEbzoga3coJ2NhdGNoIScpLFxuXHRDYXRjaFZhbDoga3coJ2NhdGNoJyksXG5cdENvbmQ6IGt3KCdjb25kJyksXG5cdENsYXNzOiBrdygnY2xhc3MnKSxcblx0Q29uc3RydWN0OiBrdygnY29uc3RydWN0IScpLFxuXHREZWJ1Z2dlcjoga3coJ2RlYnVnZ2VyIScpLFxuXHREbzoga3coJ2RvIScpLFxuXHREb3Q6IGt3Tm90TmFtZSgnLicpLFxuXHRFbGxpcHNpczoga3dOb3ROYW1lKCcuLi4gJyksXG5cdEVsc2U6IGt3KCdlbHNlJyksXG5cdEV4Y2VwdERvOiBrdygnZXhjZXB0IScpLFxuXHRFeGNlcHRWYWw6IGt3KCdleGNlcHQnKSxcblx0RmFsc2U6IGt3KCdmYWxzZScpLFxuXHRGaW5hbGx5OiBrdygnZmluYWxseSEnKSxcblx0Rm9jdXM6IGt3KCdfJyksXG5cdEZvckJhZzoga3coJ0Bmb3InKSxcblx0Rm9yRG86IGt3KCdmb3IhJyksXG5cdEZvclZhbDoga3coJ2ZvcicpLFxuXHRGdW46IGt3Tm90TmFtZSgnfCcpLFxuXHRGdW5Ebzoga3dOb3ROYW1lKCchfCcpLFxuXHRGdW5HZW46IGt3Tm90TmFtZSgnfnwnKSxcblx0RnVuR2VuRG86IGt3Tm90TmFtZSgnfiF8JyksXG5cdEZ1blRoaXM6IGt3Tm90TmFtZSgnLnwnKSxcblx0RnVuVGhpc0RvOiBrd05vdE5hbWUoJy4hfCcpLFxuXHRGdW5UaGlzR2VuOiBrd05vdE5hbWUoJy5+fCcpLFxuXHRGdW5UaGlzR2VuRG86IGt3Tm90TmFtZSgnLn4hfCcpLFxuXHRHZXQ6IGt3KCdnZXQnKSxcblx0SWZWYWw6IGt3KCdpZicpLFxuXHRJZkRvOiBrdygnaWYhJyksXG5cdElnbm9yZToga3coJ2lnbm9yZScpLFxuXHRMYXp5OiBrd05vdE5hbWUoJ34nKSxcblx0TWFwRW50cnk6IGt3KCctPicpLFxuXHROYW1lOiBrdygnbmFtZScpLFxuXHROZXc6IGt3KCduZXcnKSxcblx0Tm90OiBrdygnbm90JyksXG5cdE51bGw6IGt3KCdudWxsJyksXG5cdE9iakFzc2lnbjoga3dOb3ROYW1lKCcuICcpLFxuXHRPZjoga3coJ29mJyksXG5cdE9yOiBrdygnb3InKSxcblx0UGFzczoga3coJ3Bhc3MnKSxcblx0UmVnaW9uOiBrdygncmVnaW9uJyksXG5cdFNldDoga3coJ3NldCEnKSxcblx0U3VwZXJEbzoga3coJ3N1cGVyIScpLFxuXHRTdXBlclZhbDoga3coJ3N1cGVyJyksXG5cdFN0YXRpYzoga3coJ3N0YXRpYycpLFxuXHRTd2l0Y2hEbzoga3coJ3N3aXRjaCEnKSxcblx0U3dpdGNoVmFsOiBrdygnc3dpdGNoJyksXG5cdFRocm93OiBrdygndGhyb3chJyksXG5cdFRvZG86IGt3KCd0b2RvJyksXG5cdFRydWU6IGt3KCd0cnVlJyksXG5cdFRyeURvOiBrdygndHJ5IScpLFxuXHRUcnlWYWw6IGt3KCd0cnknKSxcblx0VHlwZToga3dOb3ROYW1lKCc6JyksXG5cdFVuZGVmaW5lZDoga3coJ3VuZGVmaW5lZCcpLFxuXHRVbmxlc3NWYWw6IGt3KCd1bmxlc3MnKSxcblx0VW5sZXNzRG86IGt3KCd1bmxlc3MhJyksXG5cdEltcG9ydDoga3coJ2ltcG9ydCcpLFxuXHRJbXBvcnREbzoga3coJ2ltcG9ydCEnKSxcblx0SW1wb3J0TGF6eToga3coJ2ltcG9ydH4nKSxcblx0V2l0aDoga3coJ3dpdGgnKSxcblx0WWllbGQ6IGt3KCc8ficpLFxuXHRZaWVsZFRvOiBrdygnPH5+Jylcbn1cblxuLyoqXG5OYW1lIG9mIGEga2V5d29yZC5cbkBwYXJhbSB7S2V5d29yZHN9IGtpbmRcbkByZXR1cm4ge3N0cmluZ31cbiovXG5leHBvcnQgZnVuY3Rpb24ga2V5d29yZE5hbWUoa2luZCkge1xuXHRyZXR1cm4ga2V5d29yZEtpbmRUb05hbWUuZ2V0KGtpbmQpXG59XG5cbi8qKlxuU2VlIGlmIHRoZSBuYW1lIGlzIGEga2V5d29yZCBhbmQgaWYgc28gcmV0dXJuIGl0cyBraW5kLlxuQHJldHVybiB7P0tleXdvcmRzfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSkge1xuXHRjb25zdCBraW5kID0ga2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpXG5cdHJldHVybiBraW5kID09PSB1bmRlZmluZWQgPyBudWxsIDoga2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZChraW5kKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRmFsc2U6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuRmFsc2Vcblx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTmFtZVxuXHRcdGNhc2UgS2V5d29yZHMuTnVsbDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OdWxsXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcnVlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlRydWVcblx0XHRjYXNlIEtleXdvcmRzLlVuZGVmaW5lZDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5VbmRlZmluZWRcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEdyb3VwIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNHcm91cChncm91cEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNLZXl3b3JkKGtleXdvcmRLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiBhbnkgb2YgdGhlIGdpdmVuIGtpbmRzLlxuQHBhcmFtIHtTZXR9IGtleXdvcmRLaW5kc1xuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNBbnlLZXl3b3JkKGtleXdvcmRLaW5kcywgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIHdob3NlIHZhbHVlIGNhbiBiZSB1c2VkIGFzIGEgcHJvcGVydHkgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbilcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIHJlc2VydmVkIHdvcmQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChyZXNlcnZlZEtleXdvcmRzLCB0b2tlbilcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

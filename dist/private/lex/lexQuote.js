'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', '../Token', '../util', './chars', './groupContext', './lexPlain', './sourceContext'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lexPlain'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.Token, global.util, global.chars, global.groupContext, global.lexPlain, global.sourceContext);
		global.lexQuote = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _context, _Token, _util, _chars, _groupContext, _lexPlain, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lexQuote;

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function lexQuote(indent) {
		const quoteIndent = indent + 1;
		const isIndented = (0, _sourceContext.tryEatNewline)();

		if (isIndented) {
			const actualIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
			(0, _context.check)(actualIndent === quoteIndent, _sourceContext.pos, 'Indented quote must have exactly one more indent than previous line.');
		}

		let read = '';

		function maybeOutputRead() {
			if (read !== '') {
				(0, _groupContext.addToCurrentGroup)(read);
				read = '';
			}
		}

		function locSingle() {
			return (0, _Loc.singleCharLoc)((0, _sourceContext.pos)());
		}

		(0, _groupContext.openGroup)(locSingle().start, _Token.Groups.Quote);

		eatChars: while (true) {
			const char = (0, _sourceContext.eat)();

			switch (char) {
				case _chars.Chars.Backslash:
					{
						const next = (0, _sourceContext.eat)();
						read = read + `\\${ String.fromCharCode(next) }`;
						break;
					}

				case _chars.Chars.Backtick:
					read = read + '\\`';
					break;

				case _chars.Chars.OpenBrace:
					{
						maybeOutputRead();
						const l = locSingle();
						(0, _groupContext.openParenthesis)(l);
						(0, _lexPlain2.default)(true);
						(0, _groupContext.closeParenthesis)(l);
						break;
					}

				case _chars.Chars.Newline:
					{
						const originalPos = (0, _sourceContext.pos)();
						originalPos.column = originalPos.column - 1;
						(0, _context.check)(isIndented, locSingle, 'Unclosed quote.');
						const numNewlines = (0, _sourceContext.skipNewlines)();
						const newIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);

						if (newIndent < quoteIndent) {
							(0, _sourceContext.stepBackMany)(originalPos, numNewlines + newIndent);
							(0, _util.assert)((0, _sourceContext.peek)() === _chars.Chars.Newline);
							break eatChars;
						} else read = read + '\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent);

						break;
					}

				case _chars.Chars.Quote:
					if (!isIndented) break eatChars;

				default:
					read = read + String.fromCharCode(char);
			}
		}

		maybeOutputRead();
		warnForSimpleQuote(_groupContext.curGroup);
		(0, _groupContext.closeGroup)((0, _sourceContext.pos)(), _Token.Groups.Quote);
	}

	function warnForSimpleQuote(quoteGroup) {
		const tokens = quoteGroup.subTokens;

		if (tokens.length === 1) {
			const name = tokens[0];
			if (typeof name === 'string' && isName(name)) (0, _context.warn)((0, _sourceContext.pos)(), `Quoted text could be a simple quote ${ (0, _CompileError.code)(`'${ name }`) }.`);
		}
	}

	function isName(str) {
		const cc0 = str.charCodeAt(0);
		if ((0, _chars.isDigit)(cc0) || cc0 === _chars.Chars.Tilde) return false;

		for (let i = 0; i < str.length; i = i + 1) if (!(0, _chars.isNameCharacter)(str.charCodeAt(i))) return false;

		return true;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsZXhRdW90ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=
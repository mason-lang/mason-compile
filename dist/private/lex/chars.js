'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError);
		global.chars = mod.exports;
	}
})(this, function (exports, _CompileError) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.isNameCharacter = exports.isDigitHex = exports.isDigitOctal = exports.isDigitBinary = exports.isDigit = exports.Chars = undefined;
	exports.showChar = showChar;

	function cc(_) {
		return _.charCodeAt(0);
	}

	const Chars = exports.Chars = {
		Ampersand: cc('&'),
		Backslash: cc('\\'),
		Backtick: cc('`'),
		Bang: cc('!'),
		Bar: cc('|'),
		Caret: cc('^'),
		Cash: cc('$'),
		CloseBrace: cc('}'),
		CloseBracket: cc(']'),
		CloseParenthesis: cc(')'),
		Colon: cc(':'),
		Comma: cc(','),
		Dot: cc('.'),
		Equal: cc('='),
		Hyphen: cc('-'),
		LetterB: cc('b'),
		LetterO: cc('o'),
		LetterX: cc('x'),
		N0: cc('0'),
		N1: cc('1'),
		N2: cc('2'),
		N3: cc('3'),
		N4: cc('4'),
		N5: cc('5'),
		N6: cc('6'),
		N7: cc('7'),
		N8: cc('8'),
		N9: cc('9'),
		Newline: cc('\n'),
		Null: cc('\0'),
		OpenBrace: cc('{'),
		OpenBracket: cc('['),
		OpenParenthesis: cc('('),
		Percent: cc('%'),
		Quote: cc('"'),
		Semicolon: cc(';'),
		Space: cc(' '),
		Star: cc('*'),
		Tab: cc('\t'),
		Tick: cc('\''),
		Tilde: cc('~')
	};

	function showChar(char) {
		return (0, _CompileError.code)(String.fromCharCode(char));
	}

	function charPred(chars) {
		let negate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		let src = 'switch(ch) {\n';

		for (let i = 0; i < chars.length; i = i + 1) src = `${ src }case ${ chars.charCodeAt(i) }: `;

		src = `${ src } return ${ !negate }\ndefault: return ${ negate }\n}`;
		return Function('ch', src);
	}

	const isDigit = exports.isDigit = charPred('0123456789'),
	      isDigitBinary = exports.isDigitBinary = charPred('01'),
	      isDigitOctal = exports.isDigitOctal = charPred('01234567'),
	      isDigitHex = exports.isDigitHex = charPred('0123456789abcdef');
	const reservedCharacters = '`#%^\\;,';
	const isNameCharacter = exports.isNameCharacter = charPred('()[]{}\'&.:| \n\t"' + reservedCharacters, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjaGFycy5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=
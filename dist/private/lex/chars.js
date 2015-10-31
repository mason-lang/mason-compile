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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9jaGFycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBaURnQixRQUFRLEdBQVIsUUFBUTs7Ozs7O09BM0NYLEtBQUssV0FBTCxLQUFLLEdBQUc7QUFDcEIsV0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDbEIsV0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDbkIsVUFBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDakIsTUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDYixLQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNaLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsTUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDYixZQUFVLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNuQixjQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNyQixrQkFBZ0IsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsT0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZCxLQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNaLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsUUFBTSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZixTQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNoQixTQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNoQixTQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNoQixJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLElBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ1gsSUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLElBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ1gsSUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLElBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ1gsSUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLFNBQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2pCLE1BQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2QsV0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDbEIsYUFBVyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3hCLFNBQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2hCLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsV0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDbEIsT0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZCxLQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNiLE1BQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2QsT0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7RUFDZDs7VUFFZSxRQUFROzs7OztNQUlDLE1BQU0seURBQUMsS0FBSzs7Ozs7Ozs7O09BU3BDLE9BQU8sV0FBUCxPQUFPLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztPQUNoQyxhQUFhLFdBQWIsYUFBYSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7T0FDOUIsWUFBWSxXQUFaLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO09BQ25DLFVBQVUsV0FBVixVQUFVLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDOztPQUk3QixlQUFlLFdBQWYsZUFBZSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMiLCJmaWxlIjoiY2hhcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcblxuZnVuY3Rpb24gY2MoXykge1xuXHRyZXR1cm4gXy5jaGFyQ29kZUF0KDApXG59XG5cbmV4cG9ydCBjb25zdCBDaGFycyA9IHtcblx0QW1wZXJzYW5kOiBjYygnJicpLFxuXHRCYWNrc2xhc2g6IGNjKCdcXFxcJyksXG5cdEJhY2t0aWNrOiBjYygnYCcpLFxuXHRCYW5nOiBjYygnIScpLFxuXHRCYXI6IGNjKCd8JyksXG5cdENhcmV0OiBjYygnXicpLFxuXHRDYXNoOiBjYygnJCcpLFxuXHRDbG9zZUJyYWNlOiBjYygnfScpLFxuXHRDbG9zZUJyYWNrZXQ6IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXM6IGNjKCcpJyksXG5cdENvbG9uOiBjYygnOicpLFxuXHRDb21tYTogY2MoJywnKSxcblx0RG90OiBjYygnLicpLFxuXHRFcXVhbDogY2MoJz0nKSxcblx0SHlwaGVuOiBjYygnLScpLFxuXHRMZXR0ZXJCOiBjYygnYicpLFxuXHRMZXR0ZXJPOiBjYygnbycpLFxuXHRMZXR0ZXJYOiBjYygneCcpLFxuXHROMDogY2MoJzAnKSxcblx0TjE6IGNjKCcxJyksXG5cdE4yOiBjYygnMicpLFxuXHROMzogY2MoJzMnKSxcblx0TjQ6IGNjKCc0JyksXG5cdE41OiBjYygnNScpLFxuXHRONjogY2MoJzYnKSxcblx0Tjc6IGNjKCc3JyksXG5cdE44OiBjYygnOCcpLFxuXHROOTogY2MoJzknKSxcblx0TmV3bGluZTogY2MoJ1xcbicpLFxuXHROdWxsOiBjYygnXFwwJyksXG5cdE9wZW5CcmFjZTogY2MoJ3snKSxcblx0T3BlbkJyYWNrZXQ6IGNjKCdbJyksXG5cdE9wZW5QYXJlbnRoZXNpczogY2MoJygnKSxcblx0UGVyY2VudDogY2MoJyUnKSxcblx0UXVvdGU6IGNjKCdcIicpLFxuXHRTZW1pY29sb246IGNjKCc7JyksXG5cdFNwYWNlOiBjYygnICcpLFxuXHRUYWI6IGNjKCdcXHQnKSxcblx0VGljazogY2MoJ1xcJycpLFxuXHRUaWxkZTogY2MoJ34nKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0NoYXIoY2hhcikge1xuXHRyZXR1cm4gY29kZShTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpKVxufVxuXG5mdW5jdGlvbiBjaGFyUHJlZChjaGFycywgbmVnYXRlPWZhbHNlKSB7XG5cdGxldCBzcmMgPSAnc3dpdGNoKGNoKSB7XFxuJ1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSA9IGkgKyAxKVxuXHRcdHNyYyA9IGAke3NyY31jYXNlICR7Y2hhcnMuY2hhckNvZGVBdChpKX06IGBcblx0c3JjID0gYCR7c3JjfSByZXR1cm4gJHshbmVnYXRlfVxcbmRlZmF1bHQ6IHJldHVybiAke25lZ2F0ZX1cXG59YFxuXHRyZXR1cm4gRnVuY3Rpb24oJ2NoJywgc3JjKVxufVxuXG5leHBvcnQgY29uc3Rcblx0aXNEaWdpdCA9IGNoYXJQcmVkKCcwMTIzNDU2Nzg5JyksXG5cdGlzRGlnaXRCaW5hcnkgPSBjaGFyUHJlZCgnMDEnKSxcblx0aXNEaWdpdE9jdGFsID0gY2hhclByZWQoJzAxMjM0NTY3JyksXG5cdGlzRGlnaXRIZXggPSBjaGFyUHJlZCgnMDEyMzQ1Njc4OWFiY2RlZicpXG5cbi8vIEFueXRoaW5nIG5vdCBleHBsaWNpdGx5IHJlc2VydmVkIGlzIGEgdmFsaWQgbmFtZSBjaGFyYWN0ZXIuXG5jb25zdCByZXNlcnZlZENoYXJhY3RlcnMgPSAnYCMlXlxcXFw7LCdcbmV4cG9ydCBjb25zdCBpc05hbWVDaGFyYWN0ZXIgPSBjaGFyUHJlZCgnKClbXXt9XFwnJi46fCBcXG5cXHRcIicgKyByZXNlcnZlZENoYXJhY3RlcnMsIHRydWUpXG4iXX0=
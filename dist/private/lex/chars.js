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
	const Chars = exports.Chars = {
		Ampersand: '&',
		Backslash: '\\',
		Backtick: '`',
		Bang: '!',
		Bar: '|',
		Caret: '^',
		Cash: '$',
		CloseBracket: ']',
		CloseParenthesis: ')',
		Colon: ':',
		Comma: ',',
		Dot: '.',
		Equal: '=',
		G: 'g',
		Hash: '#',
		Hyphen: '-',
		I: 'i',
		LetterB: 'b',
		LetterO: 'o',
		LetterX: 'x',
		M: 'm',
		N0: '0',
		N1: '1',
		N2: '2',
		N3: '3',
		N4: '4',
		N5: '5',
		N6: '6',
		N7: '7',
		N8: '8',
		N9: '9',
		Newline: '\n',
		Null: '\0',
		OpenBracket: '[',
		OpenParenthesis: '(',
		Percent: '%',
		Quote: '"',
		Semicolon: ';',
		Space: ' ',
		Star: '*',
		Tab: '\t',
		Tick: '\'',
		Tilde: '~',
		Y: 'y'
	};

	for (const key in Chars) Chars[key] = Chars[key].charCodeAt(0);

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
	const reservedCharacters = '#%^\\;,';
	const isNameCharacter = exports.isNameCharacter = charPred(`\`&()[]{}|:". \n\t${ reservedCharacters }`, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9jaGFycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBbURnQixRQUFRLEdBQVIsUUFBUTtPQWpEWCxLQUFLLFdBQUwsS0FBSyxHQUFHO0FBQ3BCLFdBQVMsRUFBRSxHQUFHO0FBQ2QsV0FBUyxFQUFFLElBQUk7QUFDZixVQUFRLEVBQUUsR0FBRztBQUNiLE1BQUksRUFBRSxHQUFHO0FBQ1QsS0FBRyxFQUFFLEdBQUc7QUFDUixPQUFLLEVBQUUsR0FBRztBQUNWLE1BQUksRUFBRSxHQUFHO0FBQ1QsY0FBWSxFQUFFLEdBQUc7QUFDakIsa0JBQWdCLEVBQUUsR0FBRztBQUNyQixPQUFLLEVBQUUsR0FBRztBQUNWLE9BQUssRUFBRSxHQUFHO0FBQ1YsS0FBRyxFQUFFLEdBQUc7QUFDUixPQUFLLEVBQUUsR0FBRztBQUNWLEdBQUMsRUFBRSxHQUFHO0FBQ04sTUFBSSxFQUFFLEdBQUc7QUFDVCxRQUFNLEVBQUUsR0FBRztBQUNYLEdBQUMsRUFBRSxHQUFHO0FBQ04sU0FBTyxFQUFFLEdBQUc7QUFDWixTQUFPLEVBQUUsR0FBRztBQUNaLFNBQU8sRUFBRSxHQUFHO0FBQ1osR0FBQyxFQUFFLEdBQUc7QUFDTixJQUFFLEVBQUUsR0FBRztBQUNQLElBQUUsRUFBRSxHQUFHO0FBQ1AsSUFBRSxFQUFFLEdBQUc7QUFDUCxJQUFFLEVBQUUsR0FBRztBQUNQLElBQUUsRUFBRSxHQUFHO0FBQ1AsSUFBRSxFQUFFLEdBQUc7QUFDUCxJQUFFLEVBQUUsR0FBRztBQUNQLElBQUUsRUFBRSxHQUFHO0FBQ1AsSUFBRSxFQUFFLEdBQUc7QUFDUCxJQUFFLEVBQUUsR0FBRztBQUNQLFNBQU8sRUFBRSxJQUFJO0FBQ2IsTUFBSSxFQUFFLElBQUk7QUFDVixhQUFXLEVBQUUsR0FBRztBQUNoQixpQkFBZSxFQUFFLEdBQUc7QUFDcEIsU0FBTyxFQUFFLEdBQUc7QUFDWixPQUFLLEVBQUUsR0FBRztBQUNWLFdBQVMsRUFBRSxHQUFHO0FBQ2QsT0FBSyxFQUFFLEdBQUc7QUFDVixNQUFJLEVBQUUsR0FBRztBQUNULEtBQUcsRUFBRSxJQUFJO0FBQ1QsTUFBSSxFQUFFLElBQUk7QUFDVixPQUFLLEVBQUUsR0FBRztBQUNWLEdBQUMsRUFBRSxHQUFHO0VBQ047Ozs7VUFJZSxRQUFROzs7OztNQUlDLE1BQU0seURBQUcsS0FBSzs7Ozs7Ozs7O09BU3RDLE9BQU8sV0FBUCxPQUFPLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztPQUNoQyxhQUFhLFdBQWIsYUFBYSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7T0FDOUIsWUFBWSxXQUFaLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO09BQ25DLFVBQVUsV0FBVixVQUFVLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDOztPQUk3QixlQUFlLFdBQWYsZUFBZSxHQUFHLFFBQVEsQ0FBQyxDQUFDLGtCQUFrQixHQUFFLGtCQUFrQixFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMiLCJmaWxlIjoiY2hhcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcblxuZXhwb3J0IGNvbnN0IENoYXJzID0ge1xuXHRBbXBlcnNhbmQ6ICcmJyxcblx0QmFja3NsYXNoOiAnXFxcXCcsXG5cdEJhY2t0aWNrOiAnYCcsXG5cdEJhbmc6ICchJyxcblx0QmFyOiAnfCcsXG5cdENhcmV0OiAnXicsXG5cdENhc2g6ICckJyxcblx0Q2xvc2VCcmFja2V0OiAnXScsXG5cdENsb3NlUGFyZW50aGVzaXM6ICcpJyxcblx0Q29sb246ICc6Jyxcblx0Q29tbWE6ICcsJyxcblx0RG90OiAnLicsXG5cdEVxdWFsOiAnPScsXG5cdEc6ICdnJyxcblx0SGFzaDogJyMnLFxuXHRIeXBoZW46ICctJyxcblx0STogJ2knLFxuXHRMZXR0ZXJCOiAnYicsXG5cdExldHRlck86ICdvJyxcblx0TGV0dGVyWDogJ3gnLFxuXHRNOiAnbScsXG5cdE4wOiAnMCcsXG5cdE4xOiAnMScsXG5cdE4yOiAnMicsXG5cdE4zOiAnMycsXG5cdE40OiAnNCcsXG5cdE41OiAnNScsXG5cdE42OiAnNicsXG5cdE43OiAnNycsXG5cdE44OiAnOCcsXG5cdE45OiAnOScsXG5cdE5ld2xpbmU6ICdcXG4nLFxuXHROdWxsOiAnXFwwJyxcblx0T3BlbkJyYWNrZXQ6ICdbJyxcblx0T3BlblBhcmVudGhlc2lzOiAnKCcsXG5cdFBlcmNlbnQ6ICclJyxcblx0UXVvdGU6ICdcIicsXG5cdFNlbWljb2xvbjogJzsnLFxuXHRTcGFjZTogJyAnLFxuXHRTdGFyOiAnKicsXG5cdFRhYjogJ1xcdCcsXG5cdFRpY2s6ICdcXCcnLFxuXHRUaWxkZTogJ34nLFxuXHRZOiAneSdcbn1cbmZvciAoY29uc3Qga2V5IGluIENoYXJzKVxuXHRDaGFyc1trZXldID0gQ2hhcnNba2V5XS5jaGFyQ29kZUF0KDApXG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2hhcihjaGFyKSB7XG5cdHJldHVybiBjb2RlKFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcikpXG59XG5cbmZ1bmN0aW9uIGNoYXJQcmVkKGNoYXJzLCBuZWdhdGUgPSBmYWxzZSkge1xuXHRsZXQgc3JjID0gJ3N3aXRjaChjaCkge1xcbidcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRzcmMgPSBgJHtzcmN9Y2FzZSAke2NoYXJzLmNoYXJDb2RlQXQoaSl9OiBgXG5cdHNyYyA9IGAke3NyY30gcmV0dXJuICR7IW5lZ2F0ZX1cXG5kZWZhdWx0OiByZXR1cm4gJHtuZWdhdGV9XFxufWBcblx0cmV0dXJuIEZ1bmN0aW9uKCdjaCcsIHNyYylcbn1cblxuZXhwb3J0IGNvbnN0XG5cdGlzRGlnaXQgPSBjaGFyUHJlZCgnMDEyMzQ1Njc4OScpLFxuXHRpc0RpZ2l0QmluYXJ5ID0gY2hhclByZWQoJzAxJyksXG5cdGlzRGlnaXRPY3RhbCA9IGNoYXJQcmVkKCcwMTIzNDU2NycpLFxuXHRpc0RpZ2l0SGV4ID0gY2hhclByZWQoJzAxMjM0NTY3ODlhYmNkZWYnKVxuXG4vLyBBbnl0aGluZyBub3QgZXhwbGljaXRseSByZXNlcnZlZCBpcyBhIHZhbGlkIG5hbWUgY2hhcmFjdGVyLlxuY29uc3QgcmVzZXJ2ZWRDaGFyYWN0ZXJzID0gJyMlXlxcXFw7LCdcbmV4cG9ydCBjb25zdCBpc05hbWVDaGFyYWN0ZXIgPSBjaGFyUHJlZChgXFxgJigpW117fXw6XCIuIFxcblxcdCR7cmVzZXJ2ZWRDaGFyYWN0ZXJzfWAsIHRydWUpXG4iXX0=
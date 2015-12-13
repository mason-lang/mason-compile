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
		CloseBrace: '}',
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
		OpenBrace: '{',
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
	const isNameCharacter = exports.isNameCharacter = charPred(`\`&()[]{}|:'". \n\t${ reservedCharacters }`, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9jaGFycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBcURnQixRQUFRLEdBQVIsUUFBUTtPQW5EWCxLQUFLLFdBQUwsS0FBSyxHQUFHO0FBQ3BCLFdBQVMsRUFBRSxHQUFHO0FBQ2QsV0FBUyxFQUFFLElBQUk7QUFDZixVQUFRLEVBQUUsR0FBRztBQUNiLE1BQUksRUFBRSxHQUFHO0FBQ1QsS0FBRyxFQUFFLEdBQUc7QUFDUixPQUFLLEVBQUUsR0FBRztBQUNWLE1BQUksRUFBRSxHQUFHO0FBQ1QsWUFBVSxFQUFFLEdBQUc7QUFDZixjQUFZLEVBQUUsR0FBRztBQUNqQixrQkFBZ0IsRUFBRSxHQUFHO0FBQ3JCLE9BQUssRUFBRSxHQUFHO0FBQ1YsT0FBSyxFQUFFLEdBQUc7QUFDVixLQUFHLEVBQUUsR0FBRztBQUNSLE9BQUssRUFBRSxHQUFHO0FBQ1YsR0FBQyxFQUFFLEdBQUc7QUFDTixNQUFJLEVBQUUsR0FBRztBQUNULFFBQU0sRUFBRSxHQUFHO0FBQ1gsR0FBQyxFQUFFLEdBQUc7QUFDTixTQUFPLEVBQUUsR0FBRztBQUNaLFNBQU8sRUFBRSxHQUFHO0FBQ1osU0FBTyxFQUFFLEdBQUc7QUFDWixHQUFDLEVBQUUsR0FBRztBQUNOLElBQUUsRUFBRSxHQUFHO0FBQ1AsSUFBRSxFQUFFLEdBQUc7QUFDUCxJQUFFLEVBQUUsR0FBRztBQUNQLElBQUUsRUFBRSxHQUFHO0FBQ1AsSUFBRSxFQUFFLEdBQUc7QUFDUCxJQUFFLEVBQUUsR0FBRztBQUNQLElBQUUsRUFBRSxHQUFHO0FBQ1AsSUFBRSxFQUFFLEdBQUc7QUFDUCxJQUFFLEVBQUUsR0FBRztBQUNQLElBQUUsRUFBRSxHQUFHO0FBQ1AsU0FBTyxFQUFFLElBQUk7QUFDYixNQUFJLEVBQUUsSUFBSTtBQUNWLFdBQVMsRUFBRSxHQUFHO0FBQ2QsYUFBVyxFQUFFLEdBQUc7QUFDaEIsaUJBQWUsRUFBRSxHQUFHO0FBQ3BCLFNBQU8sRUFBRSxHQUFHO0FBQ1osT0FBSyxFQUFFLEdBQUc7QUFDVixXQUFTLEVBQUUsR0FBRztBQUNkLE9BQUssRUFBRSxHQUFHO0FBQ1YsTUFBSSxFQUFFLEdBQUc7QUFDVCxLQUFHLEVBQUUsSUFBSTtBQUNULE1BQUksRUFBRSxJQUFJO0FBQ1YsT0FBSyxFQUFFLEdBQUc7QUFDVixHQUFDLEVBQUUsR0FBRztFQUNOOzs7O1VBSWUsUUFBUTs7Ozs7TUFJQyxNQUFNLHlEQUFHLEtBQUs7Ozs7Ozs7OztPQVN0QyxPQUFPLFdBQVAsT0FBTyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUM7T0FDaEMsYUFBYSxXQUFiLGFBQWEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO09BQzlCLFlBQVksV0FBWixZQUFZLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztPQUNuQyxVQUFVLFdBQVYsVUFBVSxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQzs7T0FJN0IsZUFBZSxXQUFmLGVBQWUsR0FBRyxRQUFRLENBQUMsQ0FBQyxtQkFBbUIsR0FBRSxrQkFBa0IsRUFBQyxDQUFDLEVBQUUsSUFBSSxDQUFDIiwiZmlsZSI6ImNoYXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5cbmV4cG9ydCBjb25zdCBDaGFycyA9IHtcblx0QW1wZXJzYW5kOiAnJicsXG5cdEJhY2tzbGFzaDogJ1xcXFwnLFxuXHRCYWNrdGljazogJ2AnLFxuXHRCYW5nOiAnIScsXG5cdEJhcjogJ3wnLFxuXHRDYXJldDogJ14nLFxuXHRDYXNoOiAnJCcsXG5cdENsb3NlQnJhY2U6ICd9Jyxcblx0Q2xvc2VCcmFja2V0OiAnXScsXG5cdENsb3NlUGFyZW50aGVzaXM6ICcpJyxcblx0Q29sb246ICc6Jyxcblx0Q29tbWE6ICcsJyxcblx0RG90OiAnLicsXG5cdEVxdWFsOiAnPScsXG5cdEc6ICdnJyxcblx0SGFzaDogJyMnLFxuXHRIeXBoZW46ICctJyxcblx0STogJ2knLFxuXHRMZXR0ZXJCOiAnYicsXG5cdExldHRlck86ICdvJyxcblx0TGV0dGVyWDogJ3gnLFxuXHRNOiAnbScsXG5cdE4wOiAnMCcsXG5cdE4xOiAnMScsXG5cdE4yOiAnMicsXG5cdE4zOiAnMycsXG5cdE40OiAnNCcsXG5cdE41OiAnNScsXG5cdE42OiAnNicsXG5cdE43OiAnNycsXG5cdE44OiAnOCcsXG5cdE45OiAnOScsXG5cdE5ld2xpbmU6ICdcXG4nLFxuXHROdWxsOiAnXFwwJyxcblx0T3BlbkJyYWNlOiAneycsXG5cdE9wZW5CcmFja2V0OiAnWycsXG5cdE9wZW5QYXJlbnRoZXNpczogJygnLFxuXHRQZXJjZW50OiAnJScsXG5cdFF1b3RlOiAnXCInLFxuXHRTZW1pY29sb246ICc7Jyxcblx0U3BhY2U6ICcgJyxcblx0U3RhcjogJyonLFxuXHRUYWI6ICdcXHQnLFxuXHRUaWNrOiAnXFwnJyxcblx0VGlsZGU6ICd+Jyxcblx0WTogJ3knXG59XG5mb3IgKGNvbnN0IGtleSBpbiBDaGFycylcblx0Q2hhcnNba2V5XSA9IENoYXJzW2tleV0uY2hhckNvZGVBdCgwKVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0NoYXIoY2hhcikge1xuXHRyZXR1cm4gY29kZShTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpKVxufVxuXG5mdW5jdGlvbiBjaGFyUHJlZChjaGFycywgbmVnYXRlID0gZmFsc2UpIHtcblx0bGV0IHNyYyA9ICdzd2l0Y2goY2gpIHtcXG4nXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0c3JjID0gYCR7c3JjfWNhc2UgJHtjaGFycy5jaGFyQ29kZUF0KGkpfTogYFxuXHRzcmMgPSBgJHtzcmN9IHJldHVybiAkeyFuZWdhdGV9XFxuZGVmYXVsdDogcmV0dXJuICR7bmVnYXRlfVxcbn1gXG5cdHJldHVybiBGdW5jdGlvbignY2gnLCBzcmMpXG59XG5cbmV4cG9ydCBjb25zdFxuXHRpc0RpZ2l0ID0gY2hhclByZWQoJzAxMjM0NTY3ODknKSxcblx0aXNEaWdpdEJpbmFyeSA9IGNoYXJQcmVkKCcwMScpLFxuXHRpc0RpZ2l0T2N0YWwgPSBjaGFyUHJlZCgnMDEyMzQ1NjcnKSxcblx0aXNEaWdpdEhleCA9IGNoYXJQcmVkKCcwMTIzNDU2Nzg5YWJjZGVmJylcblxuLy8gQW55dGhpbmcgbm90IGV4cGxpY2l0bHkgcmVzZXJ2ZWQgaXMgYSB2YWxpZCBuYW1lIGNoYXJhY3Rlci5cbmNvbnN0IHJlc2VydmVkQ2hhcmFjdGVycyA9ICcjJV5cXFxcOywnXG5leHBvcnQgY29uc3QgaXNOYW1lQ2hhcmFjdGVyID0gY2hhclByZWQoYFxcYCYoKVtde318OidcIi4gXFxuXFx0JHtyZXNlcnZlZENoYXJhY3RlcnN9YCwgdHJ1ZSlcbiJdfQ==
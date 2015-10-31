'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../Token'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../Token'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.Token);
		global.checks = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _Token) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.checkEmpty = checkEmpty;
	exports.checkNonEmpty = checkNonEmpty;
	exports.unexpected = unexpected;

	function checkEmpty(tokens, message) {
		if (!tokens.isEmpty()) (0, _context.fail)(tokens.loc, message);
	}

	function checkNonEmpty(tokens, message) {
		if (tokens.isEmpty()) (0, _context.fail)(tokens.loc, message);
	}

	function unexpected(token) {
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ (0, _CompileError.code)((0, _Token.keywordName)(token.kind)) }.` : `Unexpected ${ token }.`;
		(0, _context.fail)(token.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL2NoZWNrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FLZ0IsVUFBVSxHQUFWLFVBQVU7U0FNVixhQUFhLEdBQWIsYUFBYTtTQU1iLFVBQVUsR0FBVixVQUFVOztVQVpWLFVBQVU7Ozs7VUFNVixhQUFhOzs7O1VBTWIsVUFBVSIsImZpbGUiOiJjaGVja3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7ZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7aXNSZXNlcnZlZEtleXdvcmQsIGtleXdvcmROYW1lfSBmcm9tICcuLi9Ub2tlbidcblxuLyoqIFRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0gaWYgYHRva2Vuc2AgaGFzIGNvbnRlbnQuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tFbXB0eSh0b2tlbnMsIG1lc3NhZ2UpIHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdGZhaWwodG9rZW5zLmxvYywgbWVzc2FnZSlcbn1cblxuLyoqIFRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0gaWYgYHRva2Vuc2AgaXMgZW1wdHkuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOb25FbXB0eSh0b2tlbnMsIG1lc3NhZ2UpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0ZmFpbCh0b2tlbnMubG9jLCBtZXNzYWdlKVxufVxuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBhYm91dCBlbmNvdW50ZXJpbmcgYW4gdW5wYXJzZWFibGUgdG9rZW4uICovXG5leHBvcnQgZnVuY3Rpb24gdW5leHBlY3RlZCh0b2tlbikge1xuXHRjb25zdCBtZXNzYWdlID0gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pID9cblx0XHRgUmVzZXJ2ZWQgd29yZCAke2NvZGUoa2V5d29yZE5hbWUodG9rZW4ua2luZCkpfS5gIDpcblx0XHRgVW5leHBlY3RlZCAke3Rva2VufS5gXG5cdGZhaWwodG9rZW4ubG9jLCBtZXNzYWdlKVxufVxuIl19
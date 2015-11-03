'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../Token'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../Token'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.Token);
		global.checks = mod.exports;
	}
})(this, function (exports, _context, _Token) {
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
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ token }.` : `Unexpected ${ token }.`;
		(0, _context.fail)(token.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL2NoZWNrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FJZ0IsVUFBVSxHQUFWLFVBQVU7U0FNVixhQUFhLEdBQWIsYUFBYTtTQU1iLFVBQVUsR0FBVixVQUFVOztVQVpWLFVBQVU7Ozs7VUFNVixhQUFhOzs7O1VBTWIsVUFBVSIsImZpbGUiOiJjaGVja3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2ZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge2lzUmVzZXJ2ZWRLZXl3b3JkfSBmcm9tICcuLi9Ub2tlbidcblxuLyoqIFRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0gaWYgYHRva2Vuc2AgaGFzIGNvbnRlbnQuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tFbXB0eSh0b2tlbnMsIG1lc3NhZ2UpIHtcblx0aWYgKCF0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdGZhaWwodG9rZW5zLmxvYywgbWVzc2FnZSlcbn1cblxuLyoqIFRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0gaWYgYHRva2Vuc2AgaXMgZW1wdHkuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOb25FbXB0eSh0b2tlbnMsIG1lc3NhZ2UpIHtcblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0ZmFpbCh0b2tlbnMubG9jLCBtZXNzYWdlKVxufVxuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBhYm91dCBlbmNvdW50ZXJpbmcgYW4gdW5wYXJzZWFibGUgdG9rZW4uICovXG5leHBvcnQgZnVuY3Rpb24gdW5leHBlY3RlZCh0b2tlbikge1xuXHRjb25zdCBtZXNzYWdlID0gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pID8gYFJlc2VydmVkIHdvcmQgJHt0b2tlbn0uYCA6IGBVbmV4cGVjdGVkICR7dG9rZW59LmBcblx0ZmFpbCh0b2tlbi5sb2MsIG1lc3NhZ2UpXG59XG4iXX0=
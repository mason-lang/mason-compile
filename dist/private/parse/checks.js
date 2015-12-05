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
	exports.checkKeyword = checkKeyword;
	exports.unexpected = unexpected;

	function checkEmpty(tokens, errorCode) {
		for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
			args[_key - 2] = arguments[_key];
		}

		(0, _context.check)(tokens.isEmpty(), tokens.loc, errorCode, ...args);
	}

	function checkNonEmpty(tokens, errorCode) {
		for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
			args[_key2 - 2] = arguments[_key2];
		}

		(0, _context.check)(!tokens.isEmpty(), tokens.loc, errorCode, ...args);
	}

	function checkKeyword(keyword, token) {
		(0, _context.check)((0, _Token.isKeyword)(keyword, token), token.loc, 'expectedKeyword');
	}

	function unexpected(token) {
		(0, _context.fail)(token.loc, (0, _Token.isReservedKeyword)(token) ? 'reservedWord' : 'unexpected', token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL2NoZWNrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FJZ0IsVUFBVSxHQUFWLFVBQVU7U0FLVixhQUFhLEdBQWIsYUFBYTtTQUtiLFlBQVksR0FBWixZQUFZO1NBS1osVUFBVSxHQUFWLFVBQVU7O1VBZlYsVUFBVTtvQ0FBdUIsSUFBSTtBQUFKLE9BQUk7Ozs7OztVQUtyQyxhQUFhO3FDQUF1QixJQUFJO0FBQUosT0FBSTs7Ozs7O1VBS3hDLFlBQVk7Ozs7VUFLWixVQUFVIiwiZmlsZSI6ImNoZWNrcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIGZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge2lzS2V5d29yZCwgaXNSZXNlcnZlZEtleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBpZiBgdG9rZW5zYCBoYXMgY29udGVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0VtcHR5KHRva2VucywgZXJyb3JDb2RlLCAuLi5hcmdzKSB7XG5cdGNoZWNrKHRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIGVycm9yQ29kZSwgLi4uYXJncylcbn1cblxuLyoqIFRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0gaWYgYHRva2Vuc2AgaXMgZW1wdHkuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tOb25FbXB0eSh0b2tlbnMsIGVycm9yQ29kZSwgLi4uYXJncykge1xuXHRjaGVjayghdG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgZXJyb3JDb2RlLCAuLi5hcmdzKVxufVxuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBpZiB0aGUgdG9rZW4gaXMgbm90IHRoZSBleHBlY3RlZCBrZXl3b3JkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrS2V5d29yZChrZXl3b3JkLCB0b2tlbikge1xuXHRjaGVjayhpc0tleXdvcmQoa2V5d29yZCwgdG9rZW4pLCB0b2tlbi5sb2MsICdleHBlY3RlZEtleXdvcmQnKVxufVxuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBhYm91dCBlbmNvdW50ZXJpbmcgYW4gdW5wYXJzZWFibGUgdG9rZW4uICovXG5leHBvcnQgZnVuY3Rpb24gdW5leHBlY3RlZCh0b2tlbikge1xuXHRmYWlsKHRva2VuLmxvYywgaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pID8gJ3Jlc2VydmVkV29yZCcgOiAndW5leHBlY3RlZCcsIHRva2VuKVxufVxuIl19
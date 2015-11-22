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

	function checkEmpty(tokens, message) {
		(0, _context.check)(tokens.isEmpty(), tokens.loc, message);
	}

	function checkNonEmpty(tokens, message) {
		(0, _context.check)(!tokens.isEmpty(), tokens.loc, message);
	}

	function checkKeyword(keyword, token) {
		(0, _context.check)((0, _Token.isKeyword)(keyword, token), token.loc, () => `Expected ${ (0, _Token.showKeyword)(keyword) }`);
	}

	function unexpected(token) {
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ token }.` : `Unexpected ${ token }.`;
		(0, _context.fail)(token.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL2NoZWNrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FJZ0IsVUFBVSxHQUFWLFVBQVU7U0FLVixhQUFhLEdBQWIsYUFBYTtTQUtiLFlBQVksR0FBWixZQUFZO1NBTVosVUFBVSxHQUFWLFVBQVU7O1VBaEJWLFVBQVU7Ozs7VUFLVixhQUFhOzs7O1VBS2IsWUFBWTs7OztVQU1aLFVBQVUiLCJmaWxlIjoiY2hlY2tzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7aXNLZXl3b3JkLCBpc1Jlc2VydmVkS2V5d29yZCwgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBpZiBgdG9rZW5zYCBoYXMgY29udGVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0VtcHR5KHRva2VucywgbWVzc2FnZSkge1xuXHRjaGVjayh0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKVxufVxuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBpZiBgdG9rZW5zYCBpcyBlbXB0eS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja05vbkVtcHR5KHRva2VucywgbWVzc2FnZSkge1xuXHRjaGVjayghdG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSlcbn1cblxuLyoqIFRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0gaWYgdGhlIHRva2VuIGlzIG5vdCB0aGUgZXhwZWN0ZWQga2V5d29yZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0tleXdvcmQoa2V5d29yZCwgdG9rZW4pIHtcblx0Y2hlY2soaXNLZXl3b3JkKGtleXdvcmQsIHRva2VuKSwgdG9rZW4ubG9jLCAoKSA9PlxuXHRcdGBFeHBlY3RlZCAke3Nob3dLZXl3b3JkKGtleXdvcmQpfWApXG59XG5cbi8qKiBUaHJvdyBhIHtAbGluayBDb21waWxlRXJyb3J9IGFib3V0IGVuY291bnRlcmluZyBhbiB1bnBhcnNlYWJsZSB0b2tlbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmV4cGVjdGVkKHRva2VuKSB7XG5cdGNvbnN0IG1lc3NhZ2UgPSBpc1Jlc2VydmVkS2V5d29yZCh0b2tlbikgPyBgUmVzZXJ2ZWQgd29yZCAke3Rva2VufS5gIDogYFVuZXhwZWN0ZWQgJHt0b2tlbn0uYFxuXHRmYWlsKHRva2VuLmxvYywgbWVzc2FnZSlcbn1cbiJdfQ==
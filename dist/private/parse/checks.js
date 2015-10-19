if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../context', '../Token'], function (exports, _CompileError, _context, _Token) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.checkEmpty = checkEmpty;
	exports.checkNonEmpty = checkNonEmpty;
	exports.unexpected = unexpected;

	/** Throw a {@link CompileError} if `tokens` has content. */

	function checkEmpty(tokens, message) {
		if (!tokens.isEmpty()) (0, _context.fail)(tokens.loc, message);
	}

	/** Throw a {@link CompileError} if `tokens` is empty. */

	function checkNonEmpty(tokens, message) {
		if (tokens.isEmpty()) (0, _context.fail)(tokens.loc, message);
	}

	/** Throw a {@link CompileError} about encountering an unparseable token. */

	function unexpected(token) {
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ (0, _CompileError.code)((0, _Token.keywordName)(token.kind)) }.` : `Unexpected ${ token }.`;
		(0, _context.fail)(token.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNoZWNrcy5qcyIsInByaXZhdGUvcGFyc2UvY2hlY2tzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7QUNLTyxVQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQzNDLE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQ3BCLGFBTk0sSUFBSSxFQU1MLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDMUI7Ozs7QUFHTSxVQUFTLGFBQWEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQzlDLE1BQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUNuQixhQVpNLElBQUksRUFZTCxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0VBQzFCOzs7O0FBR00sVUFBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0FBQ2pDLFFBQU0sT0FBTyxHQUFHLFdBaEJULGlCQUFpQixFQWdCVSxLQUFLLENBQUMsR0FDdkMsQ0FBQyxjQUFjLEdBQUUsa0JBbkJYLElBQUksRUFtQlksV0FqQkcsV0FBVyxFQWlCRixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FDakQsQ0FBQyxXQUFXLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLGVBcEJPLElBQUksRUFvQk4sS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUN4QiIsImZpbGUiOiJwcml2YXRlL3BhcnNlL2NoZWNrcy5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2ZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge2lzUmVzZXJ2ZWRLZXl3b3JkLCBrZXl3b3JkTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5cbi8qKiBUaHJvdyBhIHtAbGluayBDb21waWxlRXJyb3J9IGlmIGB0b2tlbnNgIGhhcyBjb250ZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRW1wdHkodG9rZW5zLCBtZXNzYWdlKSB7XG5cdGlmICghdG9rZW5zLmlzRW1wdHkoKSlcblx0XHRmYWlsKHRva2Vucy5sb2MsIG1lc3NhZ2UpXG59XG5cbi8qKiBUaHJvdyBhIHtAbGluayBDb21waWxlRXJyb3J9IGlmIGB0b2tlbnNgIGlzIGVtcHR5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTm9uRW1wdHkodG9rZW5zLCBtZXNzYWdlKSB7XG5cdGlmICh0b2tlbnMuaXNFbXB0eSgpKVxuXHRcdGZhaWwodG9rZW5zLmxvYywgbWVzc2FnZSlcbn1cblxuLyoqIFRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0gYWJvdXQgZW5jb3VudGVyaW5nIGFuIHVucGFyc2VhYmxlIHRva2VuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuZXhwZWN0ZWQodG9rZW4pIHtcblx0Y29uc3QgbWVzc2FnZSA9IGlzUmVzZXJ2ZWRLZXl3b3JkKHRva2VuKSA/XG5cdFx0YFJlc2VydmVkIHdvcmQgJHtjb2RlKGtleXdvcmROYW1lKHRva2VuLmtpbmQpKX0uYCA6XG5cdFx0YFVuZXhwZWN0ZWQgJHt0b2tlbn0uYFxuXHRmYWlsKHRva2VuLmxvYywgbWVzc2FnZSlcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

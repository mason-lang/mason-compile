if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../Token'], function (exports, _CompileError, _Token) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	// Since there are so many parsing functions,
	// it's faster (as of node v0.11.14) to have them all close over this mutable variable once
	// than to close over the parameter (as in lex.js, where that's much faster).
	let context;

	exports.context = context;
	const checkEmpty = (tokens, message) => {
		context.check(tokens.isEmpty(), tokens.loc, message);
	},
	      checkNonEmpty = (tokens, message) => {
		context.check(!tokens.isEmpty(), tokens.loc, message);
	},
	     
	// TODO:ES6 Should be able to just do `context = _context`, because it's a `let` declaration.
	setContext = _context => {
		exports.context = context = _context;
	},
	      unexpected = token => {
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ (0, _CompileError.code)((0, _Token.keywordName)(token.kind)) }.` : `Unexpected ${ token }.`;
		context.fail(token.loc, message);
	};
	exports.checkEmpty = checkEmpty;
	exports.checkNonEmpty = checkNonEmpty;
	exports.setContext = setContext;
	exports.unexpected = unexpected;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRleHQuanMiLCJwcml2YXRlL3BhcnNlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7QUNNTyxLQUFJLE9BQU8sQ0FBQTs7O0FBRVgsT0FDTixVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLO0FBQ2pDLFNBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDcEQ7T0FDRCxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLO0FBQ3BDLFNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUNyRDs7O0FBRUQsV0FBVSxHQUFHLFFBQVEsSUFBSTtBQUN4QixVQVhTLE9BQU8sR0FXaEIsT0FBTyxHQUFHLFFBQVEsQ0FBQTtFQUNsQjtPQUNELFVBQVUsR0FBRyxLQUFLLElBQUk7QUFDckIsUUFBTSxPQUFPLEdBQUcsV0FuQlYsaUJBQWlCLEVBbUJXLEtBQUssQ0FBQyxHQUN2QyxDQUFDLGNBQWMsR0FBRSxrQkFyQlosSUFBSSxFQXFCYSxXQXBCRSxXQUFXLEVBb0JELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUNqRCxDQUFDLFdBQVcsR0FBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdkIsU0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0VBQ2hDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7aXNSZXNlcnZlZEtleXdvcmQsIGtleXdvcmROYW1lfSBmcm9tICcuLi9Ub2tlbidcblxuLy8gU2luY2UgdGhlcmUgYXJlIHNvIG1hbnkgcGFyc2luZyBmdW5jdGlvbnMsXG4vLyBpdCdzIGZhc3RlciAoYXMgb2Ygbm9kZSB2MC4xMS4xNCkgdG8gaGF2ZSB0aGVtIGFsbCBjbG9zZSBvdmVyIHRoaXMgbXV0YWJsZSB2YXJpYWJsZSBvbmNlXG4vLyB0aGFuIHRvIGNsb3NlIG92ZXIgdGhlIHBhcmFtZXRlciAoYXMgaW4gbGV4LmpzLCB3aGVyZSB0aGF0J3MgbXVjaCBmYXN0ZXIpLlxuZXhwb3J0IGxldCBjb250ZXh0XG5cbmV4cG9ydCBjb25zdFxuXHRjaGVja0VtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT4ge1xuXHRcdGNvbnRleHQuY2hlY2sodG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSlcblx0fSxcblx0Y2hlY2tOb25FbXB0eSA9ICh0b2tlbnMsIG1lc3NhZ2UpID0+IHtcblx0XHRjb250ZXh0LmNoZWNrKCF0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKVxuXHR9LFxuXHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byBqdXN0IGRvIGBjb250ZXh0ID0gX2NvbnRleHRgLCBiZWNhdXNlIGl0J3MgYSBgbGV0YCBkZWNsYXJhdGlvbi5cblx0c2V0Q29udGV4dCA9IF9jb250ZXh0ID0+IHtcblx0XHRjb250ZXh0ID0gX2NvbnRleHRcblx0fSxcblx0dW5leHBlY3RlZCA9IHRva2VuID0+IHtcblx0XHRjb25zdCBtZXNzYWdlID0gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pID9cblx0XHRcdGBSZXNlcnZlZCB3b3JkICR7Y29kZShrZXl3b3JkTmFtZSh0b2tlbi5raW5kKSl9LmAgOlxuXHRcdFx0YFVuZXhwZWN0ZWQgJHt0b2tlbn0uYFxuXHRcdGNvbnRleHQuZmFpbCh0b2tlbi5sb2MsIG1lc3NhZ2UpXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

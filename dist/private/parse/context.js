if (typeof define !== 'function') var define = require('amdefine')(module);define(["exports"], function (exports) {
	// Since there are so many parsing functions,
	// it's faster (as of node v0.11.14) to have them all close over this mutable variable once
	// than to close over the parameter (as in lex.js, where that's much faster).
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	let context;

	exports.context = context;
	const checkEmpty = (tokens, message) => context.check(tokens.isEmpty(), tokens.loc, message),
	      checkNonEmpty = (tokens, message) => context.check(!tokens.isEmpty(), tokens.loc, message),
	     
	// TODO:ES6 Should be able to just do `context = _context`, because it's a `let` declaration.
	setContext = _context => {
		exports.context = context = _context;
	},
	      unexpected = token => context.fail(token.loc, `Unexpected ${ token }`);
	exports.checkEmpty = checkEmpty;
	exports.checkNonEmpty = checkNonEmpty;
	exports.setContext = setContext;
	exports.unexpected = unexpected;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRleHQuanMiLCJwcml2YXRlL3BhcnNlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0dPLEtBQUksT0FBTyxDQUFBOzs7QUFFWCxPQUNOLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO09BQ3JELGFBQWEsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7OztBQUV0RCxXQUFVLEdBQUcsUUFBUSxJQUFJO0FBQ3hCLFVBVFMsT0FBTyxHQVNoQixPQUFPLEdBQUcsUUFBUSxDQUFBO0VBQ2xCO09BQ0QsVUFBVSxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiLy8gU2luY2UgdGhlcmUgYXJlIHNvIG1hbnkgcGFyc2luZyBmdW5jdGlvbnMsXG4vLyBpdCdzIGZhc3RlciAoYXMgb2Ygbm9kZSB2MC4xMS4xNCkgdG8gaGF2ZSB0aGVtIGFsbCBjbG9zZSBvdmVyIHRoaXMgbXV0YWJsZSB2YXJpYWJsZSBvbmNlXG4vLyB0aGFuIHRvIGNsb3NlIG92ZXIgdGhlIHBhcmFtZXRlciAoYXMgaW4gbGV4LmpzLCB3aGVyZSB0aGF0J3MgbXVjaCBmYXN0ZXIpLlxuZXhwb3J0IGxldCBjb250ZXh0XG5cbmV4cG9ydCBjb25zdFxuXHRjaGVja0VtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKHRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpLFxuXHRjaGVja05vbkVtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT5cblx0XHRjb250ZXh0LmNoZWNrKCF0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKSxcblx0Ly8gVE9ETzpFUzYgU2hvdWxkIGJlIGFibGUgdG8ganVzdCBkbyBgY29udGV4dCA9IF9jb250ZXh0YCwgYmVjYXVzZSBpdCdzIGEgYGxldGAgZGVjbGFyYXRpb24uXG5cdHNldENvbnRleHQgPSBfY29udGV4dCA9PiB7XG5cdFx0Y29udGV4dCA9IF9jb250ZXh0XG5cdH0sXG5cdHVuZXhwZWN0ZWQgPSB0b2tlbiA9PiBjb250ZXh0LmZhaWwodG9rZW4ubG9jLCBgVW5leHBlY3RlZCAke3Rva2VufWApXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

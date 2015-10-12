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
		context.fail(token.loc, `Unexpected ${ token }`);
	};
	exports.checkEmpty = checkEmpty;
	exports.checkNonEmpty = checkNonEmpty;
	exports.setContext = setContext;
	exports.unexpected = unexpected;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRleHQuanMiLCJwcml2YXRlL3BhcnNlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0dPLEtBQUksT0FBTyxDQUFBOzs7QUFFWCxPQUNOLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQUs7QUFDakMsU0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUNwRDtPQUNELGFBQWEsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQUs7QUFDcEMsU0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0VBQ3JEOzs7QUFFRCxXQUFVLEdBQUcsUUFBUSxJQUFJO0FBQ3hCLFVBWFMsT0FBTyxHQVdoQixPQUFPLEdBQUcsUUFBUSxDQUFBO0VBQ2xCO09BQ0QsVUFBVSxHQUFHLEtBQUssSUFBSTtBQUNyQixTQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBO0VBQzlDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCIvLyBTaW5jZSB0aGVyZSBhcmUgc28gbWFueSBwYXJzaW5nIGZ1bmN0aW9ucyxcbi8vIGl0J3MgZmFzdGVyIChhcyBvZiBub2RlIHYwLjExLjE0KSB0byBoYXZlIHRoZW0gYWxsIGNsb3NlIG92ZXIgdGhpcyBtdXRhYmxlIHZhcmlhYmxlIG9uY2Vcbi8vIHRoYW4gdG8gY2xvc2Ugb3ZlciB0aGUgcGFyYW1ldGVyIChhcyBpbiBsZXguanMsIHdoZXJlIHRoYXQncyBtdWNoIGZhc3RlcikuXG5leHBvcnQgbGV0IGNvbnRleHRcblxuZXhwb3J0IGNvbnN0XG5cdGNoZWNrRW1wdHkgPSAodG9rZW5zLCBtZXNzYWdlKSA9PiB7XG5cdFx0Y29udGV4dC5jaGVjayh0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKVxuXHR9LFxuXHRjaGVja05vbkVtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT4ge1xuXHRcdGNvbnRleHQuY2hlY2soIXRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpXG5cdH0sXG5cdC8vIFRPRE86RVM2IFNob3VsZCBiZSBhYmxlIHRvIGp1c3QgZG8gYGNvbnRleHQgPSBfY29udGV4dGAsIGJlY2F1c2UgaXQncyBhIGBsZXRgIGRlY2xhcmF0aW9uLlxuXHRzZXRDb250ZXh0ID0gX2NvbnRleHQgPT4ge1xuXHRcdGNvbnRleHQgPSBfY29udGV4dFxuXHR9LFxuXHR1bmV4cGVjdGVkID0gdG9rZW4gPT4ge1xuXHRcdGNvbnRleHQuZmFpbCh0b2tlbi5sb2MsIGBVbmV4cGVjdGVkICR7dG9rZW59YClcblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

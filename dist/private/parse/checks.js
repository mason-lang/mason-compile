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
		(0, _context.check)(tokens.isEmpty(), tokens.loc, message);
	}

	function checkNonEmpty(tokens, message) {
		(0, _context.check)(!tokens.isEmpty(), tokens.loc, message);
	}

	function unexpected(token) {
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ token }.` : `Unexpected ${ token }.`;
		(0, _context.fail)(token.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL2NoZWNrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FJZ0IsVUFBVSxHQUFWLFVBQVU7U0FLVixhQUFhLEdBQWIsYUFBYTtTQUtiLFVBQVUsR0FBVixVQUFVOztVQVZWLFVBQVU7Ozs7VUFLVixhQUFhOzs7O1VBS2IsVUFBVSIsImZpbGUiOiJjaGVja3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrLCBmYWlsfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtpc1Jlc2VydmVkS2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5cbi8qKiBUaHJvdyBhIHtAbGluayBDb21waWxlRXJyb3J9IGlmIGB0b2tlbnNgIGhhcyBjb250ZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRW1wdHkodG9rZW5zLCBtZXNzYWdlKSB7XG5cdGNoZWNrKHRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpXG59XG5cbi8qKiBUaHJvdyBhIHtAbGluayBDb21waWxlRXJyb3J9IGlmIGB0b2tlbnNgIGlzIGVtcHR5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrTm9uRW1wdHkodG9rZW5zLCBtZXNzYWdlKSB7XG5cdGNoZWNrKCF0b2tlbnMuaXNFbXB0eSgpLCB0b2tlbnMubG9jLCBtZXNzYWdlKVxufVxuXG4vKiogVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfSBhYm91dCBlbmNvdW50ZXJpbmcgYW4gdW5wYXJzZWFibGUgdG9rZW4uICovXG5leHBvcnQgZnVuY3Rpb24gdW5leHBlY3RlZCh0b2tlbikge1xuXHRjb25zdCBtZXNzYWdlID0gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pID8gYFJlc2VydmVkIHdvcmQgJHt0b2tlbn0uYCA6IGBVbmV4cGVjdGVkICR7dG9rZW59LmBcblx0ZmFpbCh0b2tlbi5sb2MsIG1lc3NhZ2UpXG59XG4iXX0=
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.util = mod.exports;
	}
})(this, function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.keyword = keyword;
	exports.funKeyword = funKeyword;

	function keyword(kind) {
		addToCurrentGroup(new Keyword(loc(), kind));
	}

	function funKeyword(kind) {
		keyword(kind);
		// First arg in its own spaced group
		space(loc());
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNPLFVBQVMsT0FBTyxDQUFDLElBQUksRUFBRTtBQUM3QixtQkFBaUIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO0VBQzNDOztBQUNNLFVBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUNoQyxTQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRWIsT0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7RUFDWiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgZnVuY3Rpb24ga2V5d29yZChraW5kKSB7XG5cdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBLZXl3b3JkKGxvYygpLCBraW5kKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBmdW5LZXl3b3JkKGtpbmQpIHtcblx0a2V5d29yZChraW5kKVxuXHQvLyBGaXJzdCBhcmcgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXBcblx0c3BhY2UobG9jKCkpXG59XG4iXX0=
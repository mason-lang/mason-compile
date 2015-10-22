(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', './checks', '../Token'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('./checks'), require('../Token'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.checks, global.Token);
		global.parseName = mod.exports;
	}
})(this, function (exports, _checks, _Token) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.default = parseName;
	exports.tryParseName = tryParseName;

	/**
 Parse a {@link Name} or {@link Keyword} usable as one.
 @return {string}
 */

	function parseName(token) {
		const name = tryParseName(token);
		if (name === null) (0, _checks.unexpected)(token);
		return name;
	}

	/**
 Like {@link parseName} but returns `null` on failure.
 @return {?string}
 */

	function tryParseName(token) {
		return token instanceof _Token.Name ? token.name : (0, _Token.isNameKeyword)(token) ? (0, _Token.keywordName)(token.kind) : null;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBT3dCLFNBQVM7Ozs7Ozs7O0FBQWxCLFVBQVMsU0FBUyxDQUFDLEtBQUssRUFBRTtBQUN4QyxRQUFNLElBQUksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDaEMsTUFBSSxJQUFJLEtBQUssSUFBSSxFQUNoQixZQVZNLFVBQVUsRUFVTCxLQUFLLENBQUMsQ0FBQTtBQUNsQixTQUFPLElBQUksQ0FBQTtFQUNYOzs7Ozs7O0FBTU0sVUFBUyxZQUFZLENBQUMsS0FBSyxFQUFFO0FBQ25DLFNBQU8sS0FBSyxtQkFsQnVCLElBQUksQUFrQlgsR0FDM0IsS0FBSyxDQUFDLElBQUksR0FDVixXQXBCTSxhQUFhLEVBb0JMLEtBQUssQ0FBQyxHQUNwQixXQXJCcUIsV0FBVyxFQXFCcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUN2QixJQUFJLENBQUE7RUFDTCIsImZpbGUiOiJwYXJzZU5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3VuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtpc05hbWVLZXl3b3JkLCBrZXl3b3JkTmFtZSwgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5cbi8qKlxuUGFyc2UgYSB7QGxpbmsgTmFtZX0gb3Ige0BsaW5rIEtleXdvcmR9IHVzYWJsZSBhcyBvbmUuXG5AcmV0dXJuIHtzdHJpbmd9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VOYW1lKHRva2VuKSB7XG5cdGNvbnN0IG5hbWUgPSB0cnlQYXJzZU5hbWUodG9rZW4pXG5cdGlmIChuYW1lID09PSBudWxsKVxuXHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdHJldHVybiBuYW1lXG59XG5cbi8qKlxuTGlrZSB7QGxpbmsgcGFyc2VOYW1lfSBidXQgcmV0dXJucyBgbnVsbGAgb24gZmFpbHVyZS5cbkByZXR1cm4gez9zdHJpbmd9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeVBhcnNlTmFtZSh0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBOYW1lID9cblx0XHR0b2tlbi5uYW1lIDpcblx0XHRpc05hbWVLZXl3b3JkKHRva2VuKSA/XG5cdFx0a2V5d29yZE5hbWUodG9rZW4ua2luZCkgOlxuXHRcdG51bGxcbn1cbiJdfQ==
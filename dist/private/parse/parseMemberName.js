(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../Token', './checks', './parseName', './parseQuote', './Slice'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../Token'), require('./checks'), require('./parseName'), require('./parseQuote'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Token, global.checks, global.parseName, global.parseQuote, global.Slice);
		global.parseMemberName = mod.exports;
	}
})(this, function (exports, module, _Token, _checks, _parseName, _parseQuote, _Slice) {
	'use strict';

	module.exports = parseMemberName;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Parse a plain member (`a.b`) or computed member (`a."b"`).
 @param {Token} token
 @return {string|Quote}
 */

	function parseMemberName(token) {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return name;else if ((0, _Token.isGroup)(_Token.Groups.Quote, token)) return (0, _parseQuote2.default)(_Slice2.default.group(token));else (0, _checks.unexpected)(token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWVtYmVyTmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBV3dCLGVBQWU7Ozs7Ozs7Ozs7Ozs7O0FBQXhCLFVBQVMsZUFBZSxDQUFDLEtBQUssRUFBRTtBQUM5QyxRQUFNLElBQUksR0FBRyxlQVZOLFlBQVksRUFVTyxLQUFLLENBQUMsQ0FBQTtBQUNoQyxNQUFJLElBQUksS0FBSyxJQUFJLEVBQ2hCLE9BQU8sSUFBSSxDQUFBLEtBQ1AsSUFBSSxXQWZNLE9BQU8sRUFlTCxPQWZWLE1BQU0sQ0FlVyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ3BDLE9BQU8sMEJBQVcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsS0FFckMsWUFqQk0sVUFBVSxFQWlCTCxLQUFLLENBQUMsQ0FBQTtFQUNsQiIsImZpbGUiOiJwYXJzZU1lbWJlck5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0dyb3VwcywgaXNHcm91cH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3VuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHt0cnlQYXJzZU5hbWV9IGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuUGFyc2UgYSBwbGFpbiBtZW1iZXIgKGBhLmJgKSBvciBjb21wdXRlZCBtZW1iZXIgKGBhLlwiYlwiYCkuXG5AcGFyYW0ge1Rva2VufSB0b2tlblxuQHJldHVybiB7c3RyaW5nfFF1b3RlfVxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTWVtYmVyTmFtZSh0b2tlbikge1xuXHRjb25zdCBuYW1lID0gdHJ5UGFyc2VOYW1lKHRva2VuKVxuXHRpZiAobmFtZSAhPT0gbnVsbClcblx0XHRyZXR1cm4gbmFtZVxuXHRlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5RdW90ZSwgdG9rZW4pKVxuXHRcdHJldHVybiBwYXJzZVF1b3RlKFNsaWNlLmdyb3VwKHRva2VuKSlcblx0ZWxzZVxuXHRcdHVuZXhwZWN0ZWQodG9rZW4pXG59XG4iXX0=
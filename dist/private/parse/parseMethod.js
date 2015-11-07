'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', './checks', './parseFun', './parseMethodSplit'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('./checks'), require('./parseFun'), require('./parseMethodSplit'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.checks, global.parseFun, global.parseMethodSplit);
		global.parseMethod = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _checks, _parseFun, _parseMethodSplit2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseMethod;

	var _parseMethodSplit3 = _interopRequireDefault(_parseMethodSplit2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parseMethod(tokens) {
		var _parseMethodSplit = (0, _parseMethodSplit3.default)(tokens);

		const before = _parseMethodSplit.before;
		const kind = _parseMethodSplit.kind;
		const after = _parseMethodSplit.after;
		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _Token.showKeyword)(_Token.Keywords.Method) } and function.`);
		return new _MsAst.Method(tokens.loc, (0, _parseFun.parseFunLike)(kind, after));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFNd0IsV0FBVzs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZU1ldGhvZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWV0aG9kfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7S2V5d29yZHMsIHNob3dLZXl3b3JkfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2hlY2tFbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRnVuTGlrZX0gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZFNwbGl0IGZyb20gJy4vcGFyc2VNZXRob2RTcGxpdCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNZXRob2QodG9rZW5zKSB7XG5cdGNvbnN0IHtiZWZvcmUsIGtpbmQsIGFmdGVyfSA9IHBhcnNlTWV0aG9kU3BsaXQodG9rZW5zKVxuXHRjaGVja0VtcHR5KGJlZm9yZSwgKCkgPT5cblx0XHRgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYmV0d2VlbiAke3Nob3dLZXl3b3JkKEtleXdvcmRzLk1ldGhvZCl9IGFuZCBmdW5jdGlvbi5gKVxuXHRyZXR1cm4gbmV3IE1ldGhvZCh0b2tlbnMubG9jLCBwYXJzZUZ1bkxpa2Uoa2luZCwgYWZ0ZXIpKVxufVxuIl19
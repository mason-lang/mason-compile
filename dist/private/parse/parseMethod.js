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

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseMethod(tokens) {
		var _parseMethodSplit = (0, _parseMethodSplit3.default)(tokens);

		const before = _parseMethodSplit.before;
		const kind = _parseMethodSplit.kind;
		const after = _parseMethodSplit.after;
		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _Token.showKeyword)(_Token.Keywords.Method) } and function.`);
		return new _MsAst.Method(tokens.loc, (0, _parseFun.parseFunLike)(kind, after));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFNd0IsV0FBVzs7Ozs7Ozs7OztVQUFYLFdBQVciLCJmaWxlIjoicGFyc2VNZXRob2QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01ldGhvZH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0tleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NoZWNrRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUZ1bkxpa2V9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgcGFyc2VNZXRob2RTcGxpdCBmcm9tICcuL3BhcnNlTWV0aG9kU3BsaXQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTWV0aG9kKHRva2Vucykge1xuXHRjb25zdCB7YmVmb3JlLCBraW5kLCBhZnRlcn0gPSBwYXJzZU1ldGhvZFNwbGl0KHRva2Vucylcblx0Y2hlY2tFbXB0eShiZWZvcmUsICgpID0+XG5cdFx0YERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGJldHdlZW4gJHtzaG93S2V5d29yZChLZXl3b3Jkcy5NZXRob2QpfSBhbmQgZnVuY3Rpb24uYClcblx0cmV0dXJuIG5ldyBNZXRob2QodG9rZW5zLmxvYywgcGFyc2VGdW5MaWtlKGtpbmQsIGFmdGVyKSlcbn1cbiJdfQ==
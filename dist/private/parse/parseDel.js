'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', './checks', '../Token', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('./checks'), require('../Token'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.checks, global.Token, global.parse, global.Slice);
		global.parseDel = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _checks, _Token, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseDel;

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseDel(tokens) {
		(0, _context.check)(tokens.size() === 1, tokens.loc, 'delArgument');
		const spaced = tokens.head();
		if (!(0, _Token.isGroup)(_Token.Groups.Space, spaced)) (0, _checks.unexpected)(spaced);

		const parts = _Slice2.default.group(spaced);

		const last = parts.last();

		if ((0, _Token.isGroup)(_Token.Groups.Bracket, last)) {
			const object = (0, _parse.parseSpaced)(parts.rtail());
			const args = (0, _parse.parseExprParts)(_Slice2.default.group(last));
			return _MsAst.Call.delSub(tokens.loc, object, args);
		} else (0, _checks.unexpected)(spaced);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFPd0IsUUFBUTs7Ozs7Ozs7OztVQUFSLFFBQVEiLCJmaWxlIjoicGFyc2VEZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYWxsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7dW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3BhcnNlRXhwclBhcnRzLCBwYXJzZVNwYWNlZH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VEZWwodG9rZW5zKSB7XG5cdGNoZWNrKHRva2Vucy5zaXplKCkgPT09IDEsIHRva2Vucy5sb2MsICdkZWxBcmd1bWVudCcpXG5cdGNvbnN0IHNwYWNlZCA9IHRva2Vucy5oZWFkKClcblx0aWYgKCFpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgc3BhY2VkKSlcblx0XHR1bmV4cGVjdGVkKHNwYWNlZClcblxuXHRjb25zdCBwYXJ0cyA9IFNsaWNlLmdyb3VwKHNwYWNlZClcblx0Y29uc3QgbGFzdCA9IHBhcnRzLmxhc3QoKVxuXHRpZiAoaXNHcm91cChHcm91cHMuQnJhY2tldCwgbGFzdCkpIHtcblx0XHRjb25zdCBvYmplY3QgPSBwYXJzZVNwYWNlZChwYXJ0cy5ydGFpbCgpKVxuXHRcdGNvbnN0IGFyZ3MgPSBwYXJzZUV4cHJQYXJ0cyhTbGljZS5ncm91cChsYXN0KSlcblx0XHRyZXR1cm4gQ2FsbC5kZWxTdWIodG9rZW5zLmxvYywgb2JqZWN0LCBhcmdzKVxuXHR9IGVsc2Vcblx0XHR1bmV4cGVjdGVkKHNwYWNlZClcbn1cbiJdfQ==
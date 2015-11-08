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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parseDel(tokens) {
		(0, _context.check)(tokens.size() === 1, tokens.loc, () => `${ (0, _Token.showKeyword)(_Token.Keywords.Del) } takes only one argument.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFPd0IsUUFBUTs7Ozs7O1VBQVIsUUFBUSIsImZpbGUiOiJwYXJzZURlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NhbGx9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHt1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRGVsKHRva2Vucykge1xuXHRjaGVjayh0b2tlbnMuc2l6ZSgpID09PSAxLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkRlbCl9IHRha2VzIG9ubHkgb25lIGFyZ3VtZW50LmApXG5cdGNvbnN0IHNwYWNlZCA9IHRva2Vucy5oZWFkKClcblx0aWYgKCFpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgc3BhY2VkKSlcblx0XHR1bmV4cGVjdGVkKHNwYWNlZClcblxuXHRjb25zdCBwYXJ0cyA9IFNsaWNlLmdyb3VwKHNwYWNlZClcblx0Y29uc3QgbGFzdCA9IHBhcnRzLmxhc3QoKVxuXHRpZiAoaXNHcm91cChHcm91cHMuQnJhY2tldCwgbGFzdCkpIHtcblx0XHRjb25zdCBvYmplY3QgPSBwYXJzZVNwYWNlZChwYXJ0cy5ydGFpbCgpKVxuXHRcdGNvbnN0IGFyZ3MgPSBwYXJzZUV4cHJQYXJ0cyhTbGljZS5ncm91cChsYXN0KSlcblx0XHRyZXR1cm4gQ2FsbC5kZWxTdWIodG9rZW5zLmxvYywgb2JqZWN0LCBhcmdzKVxuXHR9IGVsc2Vcblx0XHR1bmV4cGVjdGVkKHNwYWNlZClcbn1cbiJdfQ==
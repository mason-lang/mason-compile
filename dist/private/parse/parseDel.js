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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFPd0IsUUFBUTs7Ozs7Ozs7OztVQUFSLFFBQVEiLCJmaWxlIjoicGFyc2VEZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYWxsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7dW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgS2V5d29yZHMsIHNob3dLZXl3b3JkfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7cGFyc2VFeHByUGFydHMsIHBhcnNlU3BhY2VkfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZURlbCh0b2tlbnMpIHtcblx0Y2hlY2sodG9rZW5zLnNpemUoKSA9PT0gMSwgdG9rZW5zLmxvYywgKCkgPT5cblx0XHRgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5EZWwpfSB0YWtlcyBvbmx5IG9uZSBhcmd1bWVudC5gKVxuXHRjb25zdCBzcGFjZWQgPSB0b2tlbnMuaGVhZCgpXG5cdGlmICghaXNHcm91cChHcm91cHMuU3BhY2UsIHNwYWNlZCkpXG5cdFx0dW5leHBlY3RlZChzcGFjZWQpXG5cblx0Y29uc3QgcGFydHMgPSBTbGljZS5ncm91cChzcGFjZWQpXG5cdGNvbnN0IGxhc3QgPSBwYXJ0cy5sYXN0KClcblx0aWYgKGlzR3JvdXAoR3JvdXBzLkJyYWNrZXQsIGxhc3QpKSB7XG5cdFx0Y29uc3Qgb2JqZWN0ID0gcGFyc2VTcGFjZWQocGFydHMucnRhaWwoKSlcblx0XHRjb25zdCBhcmdzID0gcGFyc2VFeHByUGFydHMoU2xpY2UuZ3JvdXAobGFzdCkpXG5cdFx0cmV0dXJuIENhbGwuZGVsU3ViKHRva2Vucy5sb2MsIG9iamVjdCwgYXJncylcblx0fSBlbHNlXG5cdFx0dW5leHBlY3RlZChzcGFjZWQpXG59XG4iXX0=
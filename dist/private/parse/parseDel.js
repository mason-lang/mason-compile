'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', './checks', '../Token', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('./checks'), require('../Token'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.checks, global.Token, global.parse, global.Slice);
		global.parseDel = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _checks, _Token, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseDel;

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parseDel(tokens) {
		(0, _context.check)(tokens.size() === 1, tokens.loc, () => `${ (0, _CompileError.code)('del') } takes only one argument.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFRd0IsUUFBUTs7Ozs7O1VBQVIsUUFBUSIsImZpbGUiOiJwYXJzZURlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge3VuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXB9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRGVsKHRva2Vucykge1xuXHRjaGVjayh0b2tlbnMuc2l6ZSgpID09PSAxLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGAke2NvZGUoJ2RlbCcpfSB0YWtlcyBvbmx5IG9uZSBhcmd1bWVudC5gKVxuXHRjb25zdCBzcGFjZWQgPSB0b2tlbnMuaGVhZCgpXG5cdGlmICghaXNHcm91cChHcm91cHMuU3BhY2UsIHNwYWNlZCkpXG5cdFx0dW5leHBlY3RlZChzcGFjZWQpXG5cblx0Y29uc3QgcGFydHMgPSBTbGljZS5ncm91cChzcGFjZWQpXG5cdGNvbnN0IGxhc3QgPSBwYXJ0cy5sYXN0KClcblx0aWYgKGlzR3JvdXAoR3JvdXBzLkJyYWNrZXQsIGxhc3QpKSB7XG5cdFx0Y29uc3Qgb2JqZWN0ID0gcGFyc2VTcGFjZWQocGFydHMucnRhaWwoKSlcblx0XHRjb25zdCBhcmdzID0gcGFyc2VFeHByUGFydHMoU2xpY2UuZ3JvdXAobGFzdCkpXG5cdFx0cmV0dXJuIENhbGwuZGVsU3ViKHRva2Vucy5sb2MsIG9iamVjdCwgYXJncylcblx0fSBlbHNlXG5cdFx0dW5leHBlY3RlZChzcGFjZWQpXG59XG4iXX0=
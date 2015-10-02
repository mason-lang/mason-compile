if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', './CompileError', './private/CompileContext', './private/CompileOptions', './private/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/util', './private/verify'], function (exports, module, _CompileError, _privateCompileContext, _privateCompileOptions, _privateLex, _privateParseParse, _privateRender, _privateTranspileTranspile, _privateUtil, _privateVerify) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _CompileContext = _interopRequireDefault(_privateCompileContext);

	var _CompileOptions = _interopRequireDefault(_privateCompileOptions);

	var _lex = _interopRequireDefault(_privateLex);

	var _parse = _interopRequireDefault(_privateParseParse);

	var _render = _interopRequireDefault(_privateRender);

	var _transpile = _interopRequireDefault(_privateTranspileTranspile);

	var _verify = _interopRequireDefault(_privateVerify);

	// See private/Opts.js for description of opts

	module.exports = (source, opts) => {
		(0, _privateUtil.type)(source, String);
		const context = new _CompileContext.default(new _CompileOptions.default(opts));
		try {
			const ast = (0, _parse.default)(context, (0, _lex.default)(context, source));
			const esAst = (0, _transpile.default)(context, ast, (0, _verify.default)(context, ast));
			const result = (0, _render.default)(context, esAst);
			return { warnings: context.warnings, result };
		} catch (error) {
			if (!(error instanceof _CompileError2.default)) throw error;
			return { warnings: context.warnings, result: error };
		}
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQVdlLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSztBQUNoQyxtQkFMTyxJQUFJLEVBS04sTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3BCLFFBQU0sT0FBTyxHQUFHLDRCQUFtQiw0QkFBbUIsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUM1RCxNQUFJO0FBQ0gsU0FBTSxHQUFHLEdBQUcsb0JBQU0sT0FBTyxFQUFFLGtCQUFJLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ2hELFNBQU0sS0FBSyxHQUFHLHdCQUFVLE9BQU8sRUFBRSxHQUFHLEVBQUUscUJBQU8sT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDM0QsU0FBTSxNQUFNLEdBQUcscUJBQU8sT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ3JDLFVBQU8sRUFBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUMsQ0FBQTtHQUMzQyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2YsT0FBSSxFQUFFLEtBQUssbUNBQXdCLEFBQUMsRUFDbkMsTUFBTSxLQUFLLENBQUE7QUFDWixVQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFBO0dBQ2xEO0VBQ0QiLCJmaWxlIjoiY29tcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21waWxlRXJyb3IgZnJvbSAnLi9Db21waWxlRXJyb3InXG5pbXBvcnQgQ29tcGlsZUNvbnRleHQgZnJvbSAnLi9wcml2YXRlL0NvbXBpbGVDb250ZXh0J1xuaW1wb3J0IENvbXBpbGVPcHRpb25zIGZyb20gJy4vcHJpdmF0ZS9Db21waWxlT3B0aW9ucydcbmltcG9ydCBsZXggZnJvbSAnLi9wcml2YXRlL2xleCdcbmltcG9ydCBwYXJzZSBmcm9tICcuL3ByaXZhdGUvcGFyc2UvcGFyc2UnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcHJpdmF0ZS9yZW5kZXInXG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4vcHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlJ1xuaW1wb3J0IHt0eXBlfSBmcm9tICcuL3ByaXZhdGUvdXRpbCdcbmltcG9ydCB2ZXJpZnkgZnJvbSAnLi9wcml2YXRlL3ZlcmlmeSdcblxuLy8gU2VlIHByaXZhdGUvT3B0cy5qcyBmb3IgZGVzY3JpcHRpb24gb2Ygb3B0c1xuZXhwb3J0IGRlZmF1bHQgKHNvdXJjZSwgb3B0cykgPT4ge1xuXHR0eXBlKHNvdXJjZSwgU3RyaW5nKVxuXHRjb25zdCBjb250ZXh0ID0gbmV3IENvbXBpbGVDb250ZXh0KG5ldyBDb21waWxlT3B0aW9ucyhvcHRzKSlcblx0dHJ5IHtcblx0XHRjb25zdCBhc3QgPSBwYXJzZShjb250ZXh0LCBsZXgoY29udGV4dCwgc291cmNlKSlcblx0XHRjb25zdCBlc0FzdCA9IHRyYW5zcGlsZShjb250ZXh0LCBhc3QsIHZlcmlmeShjb250ZXh0LCBhc3QpKVxuXHRcdGNvbnN0IHJlc3VsdCA9IHJlbmRlcihjb250ZXh0LCBlc0FzdClcblx0XHRyZXR1cm4ge3dhcm5pbmdzOiBjb250ZXh0Lndhcm5pbmdzLCByZXN1bHR9XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0aWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBDb21waWxlRXJyb3IpKVxuXHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRyZXR1cm4ge3dhcm5pbmdzOiBjb250ZXh0Lndhcm5pbmdzLCByZXN1bHQ6IGVycm9yfVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

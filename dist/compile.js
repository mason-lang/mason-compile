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
			if (error instanceof _CompileError2.default) return { warnings: context.warnings, result: error };else throw error;
		}
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQVdlLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSztBQUNoQyxtQkFMUSxJQUFJLEVBS1AsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3BCLFFBQU0sT0FBTyxHQUFHLDRCQUFtQiw0QkFBbUIsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUM1RCxNQUFJO0FBQ0gsU0FBTSxHQUFHLEdBQUcsb0JBQU0sT0FBTyxFQUFFLGtCQUFJLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ2hELFNBQU0sS0FBSyxHQUFHLHdCQUFVLE9BQU8sRUFBRSxHQUFHLEVBQUUscUJBQU8sT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDM0QsU0FBTSxNQUFNLEdBQUcscUJBQU8sT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQ3JDLFVBQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQTtHQUM3QyxDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2YsT0FBSSxLQUFLLGtDQUF3QixFQUNoQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFBLEtBRXBELE1BQU0sS0FBSyxDQUFBO0dBQ1o7RUFDRCIsImZpbGUiOiJjb21waWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbXBpbGVFcnJvciBmcm9tICcuL0NvbXBpbGVFcnJvcidcbmltcG9ydCBDb21waWxlQ29udGV4dCBmcm9tICcuL3ByaXZhdGUvQ29tcGlsZUNvbnRleHQnXG5pbXBvcnQgQ29tcGlsZU9wdGlvbnMgZnJvbSAnLi9wcml2YXRlL0NvbXBpbGVPcHRpb25zJ1xuaW1wb3J0IGxleCBmcm9tICcuL3ByaXZhdGUvbGV4J1xuaW1wb3J0IHBhcnNlIGZyb20gJy4vcHJpdmF0ZS9wYXJzZS9wYXJzZSdcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9wcml2YXRlL3JlbmRlcidcbmltcG9ydCB0cmFuc3BpbGUgZnJvbSAnLi9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUnXG5pbXBvcnQgeyB0eXBlIH0gZnJvbSAnLi9wcml2YXRlL3V0aWwnXG5pbXBvcnQgdmVyaWZ5IGZyb20gJy4vcHJpdmF0ZS92ZXJpZnknXG5cbi8vIFNlZSBwcml2YXRlL09wdHMuanMgZm9yIGRlc2NyaXB0aW9uIG9mIG9wdHNcbmV4cG9ydCBkZWZhdWx0IChzb3VyY2UsIG9wdHMpID0+IHtcblx0dHlwZShzb3VyY2UsIFN0cmluZylcblx0Y29uc3QgY29udGV4dCA9IG5ldyBDb21waWxlQ29udGV4dChuZXcgQ29tcGlsZU9wdGlvbnMob3B0cykpXG5cdHRyeSB7XG5cdFx0Y29uc3QgYXN0ID0gcGFyc2UoY29udGV4dCwgbGV4KGNvbnRleHQsIHNvdXJjZSkpXG5cdFx0Y29uc3QgZXNBc3QgPSB0cmFuc3BpbGUoY29udGV4dCwgYXN0LCB2ZXJpZnkoY29udGV4dCwgYXN0KSlcblx0XHRjb25zdCByZXN1bHQgPSByZW5kZXIoY29udGV4dCwgZXNBc3QpXG5cdFx0cmV0dXJuIHsgd2FybmluZ3M6IGNvbnRleHQud2FybmluZ3MsIHJlc3VsdCB9XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0aWYgKGVycm9yIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKVxuXHRcdFx0cmV0dXJuIHsgd2FybmluZ3M6IGNvbnRleHQud2FybmluZ3MsIHJlc3VsdDogZXJyb3IgfVxuXHRcdGVsc2Vcblx0XHRcdHRocm93IGVycm9yXG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
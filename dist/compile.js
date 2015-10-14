if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', './CompileError', './private/context', './private/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/util', './private/verify'], function (exports, module, _CompileError, _privateContext, _privateLex, _privateParseParse, _privateRender, _privateTranspileTranspile, _privateUtil, _privateVerify) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _lex = _interopRequireDefault(_privateLex);

	var _parse = _interopRequireDefault(_privateParseParse);

	var _render = _interopRequireDefault(_privateRender);

	var _transpile = _interopRequireDefault(_privateTranspileTranspile);

	var _verify = _interopRequireDefault(_privateVerify);

	// See private/CompileOptions for description of opts

	module.exports = (source, opts) => {
		(0, _privateUtil.type)(source, String);
		(0, _privateContext.setContext)(opts);
		try {
			const ast = (0, _parse.default)((0, _lex.default)(source));
			const esAst = (0, _transpile.default)(ast, (0, _verify.default)(ast));
			return { warnings: _privateContext.warnings, result: (0, _render.default)(esAst) };
		} catch (error) {
			if (!(error instanceof _CompileError2.default)) throw error;
			return { warnings: _privateContext.warnings, result: error };
		} finally {
			(0, _privateContext.unsetContext)();
		}
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBVWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLO0FBQ2hDLG1CQUxPLElBQUksRUFLTixNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDcEIsc0JBWE8sVUFBVSxFQVdOLElBQUksQ0FBQyxDQUFBO0FBQ2hCLE1BQUk7QUFDSCxTQUFNLEdBQUcsR0FBRyxvQkFBTSxrQkFBSSxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQzlCLFNBQU0sS0FBSyxHQUFHLHdCQUFVLEdBQUcsRUFBRSxxQkFBTyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ3pDLFVBQU8sRUFBQyxRQUFRLGtCQWZnQixRQUFRLEFBZXhCLEVBQUUsTUFBTSxFQUFFLHFCQUFPLEtBQUssQ0FBQyxFQUFDLENBQUE7R0FDeEMsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNmLE9BQUksRUFBRSxLQUFLLG1DQUF3QixBQUFDLEVBQ25DLE1BQU0sS0FBSyxDQUFBO0FBQ1osVUFBTyxFQUFDLFFBQVEsa0JBbkJnQixRQUFRLEFBbUJ4QixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQTtHQUNoQyxTQUFTO0FBQ1QsdUJBckJrQixZQUFZLEdBcUJoQixDQUFBO0dBQ2Q7RUFDRCIsImZpbGUiOiJjb21waWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbXBpbGVFcnJvciBmcm9tICcuL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7c2V0Q29udGV4dCwgdW5zZXRDb250ZXh0LCB3YXJuaW5nc30gZnJvbSAnLi9wcml2YXRlL2NvbnRleHQnXG5pbXBvcnQgbGV4IGZyb20gJy4vcHJpdmF0ZS9sZXgnXG5pbXBvcnQgcGFyc2UgZnJvbSAnLi9wcml2YXRlL3BhcnNlL3BhcnNlJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3ByaXZhdGUvcmVuZGVyJ1xuaW1wb3J0IHRyYW5zcGlsZSBmcm9tICcuL3ByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZSdcbmltcG9ydCB7dHlwZX0gZnJvbSAnLi9wcml2YXRlL3V0aWwnXG5pbXBvcnQgdmVyaWZ5IGZyb20gJy4vcHJpdmF0ZS92ZXJpZnknXG5cbi8vIFNlZSBwcml2YXRlL0NvbXBpbGVPcHRpb25zIGZvciBkZXNjcmlwdGlvbiBvZiBvcHRzXG5leHBvcnQgZGVmYXVsdCAoc291cmNlLCBvcHRzKSA9PiB7XG5cdHR5cGUoc291cmNlLCBTdHJpbmcpXG5cdHNldENvbnRleHQob3B0cylcblx0dHJ5IHtcblx0XHRjb25zdCBhc3QgPSBwYXJzZShsZXgoc291cmNlKSlcblx0XHRjb25zdCBlc0FzdCA9IHRyYW5zcGlsZShhc3QsIHZlcmlmeShhc3QpKVxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogcmVuZGVyKGVzQXN0KX1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRpZiAoIShlcnJvciBpbnN0YW5jZW9mIENvbXBpbGVFcnJvcikpXG5cdFx0XHR0aHJvdyBlcnJvclxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogZXJyb3J9XG5cdH0gZmluYWxseSB7XG5cdFx0dW5zZXRDb250ZXh0KClcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

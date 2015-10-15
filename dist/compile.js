if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './CompileError', './private/context', './private/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/util', './private/verify'], function (exports, _CompileError, _privateContext, _privateLex, _privateParseParse, _privateRender, _privateTranspileTranspile, _privateUtil, _privateVerify) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _lex = _interopRequireDefault(_privateLex);

	var _parse = _interopRequireDefault(_privateParseParse);

	var _render = _interopRequireDefault(_privateRender);

	var _transpile = _interopRequireDefault(_privateTranspileTranspile);

	var _verify = _interopRequireDefault(_privateVerify);

	// See private/CompileOptions for description of opts

	exports.default = (source, opts) => {
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

	const parseAst = (source, opts) => {
		(0, _privateUtil.type)(source, String);
		(0, _privateContext.setContext)(opts);
		try {
			const ast = (0, _parse.default)((0, _lex.default)(source));
			(0, _verify.default)(ast);
			return { warnings: _privateContext.warnings, result: ast };
		} catch (error) {
			if (!(error instanceof _CompileError2.default)) throw error;
			return { warnings: _privateContext.warnings, result: error };
		} finally {
			(0, _privateContext.unsetContext)();
		}
	};
	exports.parseAst = parseAst;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVVlLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSztBQUNoQyxtQkFMTyxJQUFJLEVBS04sTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3BCLHNCQVhPLFVBQVUsRUFXTixJQUFJLENBQUMsQ0FBQTtBQUNoQixNQUFJO0FBQ0gsU0FBTSxHQUFHLEdBQUcsb0JBQU0sa0JBQUksTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUM5QixTQUFNLEtBQUssR0FBRyx3QkFBVSxHQUFHLEVBQUUscUJBQU8sR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUN6QyxVQUFPLEVBQUMsUUFBUSxrQkFmZ0IsUUFBUSxBQWV4QixFQUFFLE1BQU0sRUFBRSxxQkFBTyxLQUFLLENBQUMsRUFBQyxDQUFBO0dBQ3hDLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZixPQUFJLEVBQUUsS0FBSyxtQ0FBd0IsQUFBQyxFQUNuQyxNQUFNLEtBQUssQ0FBQTtBQUNaLFVBQU8sRUFBQyxRQUFRLGtCQW5CZ0IsUUFBUSxBQW1CeEIsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUE7R0FDaEMsU0FBUztBQUNULHVCQXJCa0IsWUFBWSxHQXFCaEIsQ0FBQTtHQUNkO0VBQ0Q7O0FBRU0sT0FBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLO0FBQ3pDLG1CQXJCTyxJQUFJLEVBcUJOLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNwQixzQkEzQk8sVUFBVSxFQTJCTixJQUFJLENBQUMsQ0FBQTtBQUNoQixNQUFJO0FBQ0gsU0FBTSxHQUFHLEdBQUcsb0JBQU0sa0JBQUksTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUM5Qix3QkFBTyxHQUFHLENBQUMsQ0FBQTtBQUNYLFVBQU8sRUFBQyxRQUFRLGtCQS9CZ0IsUUFBUSxBQStCeEIsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFDLENBQUE7R0FDOUIsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNmLE9BQUksRUFBRSxLQUFLLG1DQUF3QixBQUFDLEVBQ25DLE1BQU0sS0FBSyxDQUFBO0FBQ1osVUFBTyxFQUFDLFFBQVEsa0JBbkNnQixRQUFRLEFBbUN4QixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQTtHQUNoQyxTQUFTO0FBQ1QsdUJBckNrQixZQUFZLEdBcUNoQixDQUFBO0dBQ2Q7RUFDRCxDQUFBIiwiZmlsZSI6ImNvbXBpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tcGlsZUVycm9yIGZyb20gJy4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtzZXRDb250ZXh0LCB1bnNldENvbnRleHQsIHdhcm5pbmdzfSBmcm9tICcuL3ByaXZhdGUvY29udGV4dCdcbmltcG9ydCBsZXggZnJvbSAnLi9wcml2YXRlL2xleCdcbmltcG9ydCBwYXJzZSBmcm9tICcuL3ByaXZhdGUvcGFyc2UvcGFyc2UnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcHJpdmF0ZS9yZW5kZXInXG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4vcHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlJ1xuaW1wb3J0IHt0eXBlfSBmcm9tICcuL3ByaXZhdGUvdXRpbCdcbmltcG9ydCB2ZXJpZnkgZnJvbSAnLi9wcml2YXRlL3ZlcmlmeSdcblxuLy8gU2VlIHByaXZhdGUvQ29tcGlsZU9wdGlvbnMgZm9yIGRlc2NyaXB0aW9uIG9mIG9wdHNcbmV4cG9ydCBkZWZhdWx0IChzb3VyY2UsIG9wdHMpID0+IHtcblx0dHlwZShzb3VyY2UsIFN0cmluZylcblx0c2V0Q29udGV4dChvcHRzKVxuXHR0cnkge1xuXHRcdGNvbnN0IGFzdCA9IHBhcnNlKGxleChzb3VyY2UpKVxuXHRcdGNvbnN0IGVzQXN0ID0gdHJhbnNwaWxlKGFzdCwgdmVyaWZ5KGFzdCkpXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0OiByZW5kZXIoZXNBc3QpfVxuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGlmICghKGVycm9yIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKSlcblx0XHRcdHRocm93IGVycm9yXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0OiBlcnJvcn1cblx0fSBmaW5hbGx5IHtcblx0XHR1bnNldENvbnRleHQoKVxuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBwYXJzZUFzdCA9IChzb3VyY2UsIG9wdHMpID0+IHtcblx0dHlwZShzb3VyY2UsIFN0cmluZylcblx0c2V0Q29udGV4dChvcHRzKVxuXHR0cnkge1xuXHRcdGNvbnN0IGFzdCA9IHBhcnNlKGxleChzb3VyY2UpKVxuXHRcdHZlcmlmeShhc3QpXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0OiBhc3R9XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0aWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBDb21waWxlRXJyb3IpKVxuXHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHQ6IGVycm9yfVxuXHR9IGZpbmFsbHkge1xuXHRcdHVuc2V0Q29udGV4dCgpXG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

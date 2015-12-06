'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './CompileError', './private/CompileOptions', './private/context', './private/lex/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/verify/verify'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./CompileError'), require('./private/CompileOptions'), require('./private/context'), require('./private/lex/lex'), require('./private/parse/parse'), require('./private/render'), require('./private/transpile/transpile'), require('./private/verify/verify'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.CompileOptions, global.context, global.lex, global.parse, global.render, global.transpile, global.verify);
		global.Compiler = mod.exports;
	}
})(this, function (exports, _CompileError, _CompileOptions, _context, _lex, _parse, _render, _transpile, _verify) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _CompileOptions2 = _interopRequireDefault(_CompileOptions);

	var _lex2 = _interopRequireDefault(_lex);

	var _parse2 = _interopRequireDefault(_parse);

	var _render2 = _interopRequireDefault(_render);

	var _transpile2 = _interopRequireDefault(_transpile);

	var _verify2 = _interopRequireDefault(_verify);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	class Compiler {
		constructor() {
			let options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			this.options = options instanceof _CompileOptions2.default ? options : new _CompileOptions2.default(options);
		}

		compile(source, filename) {
			return (0, _context.withContext)(this.options, filename, () => {
				const ast = (0, _parse2.default)((0, _lex2.default)(source));
				return (0, _render2.default)((0, _transpile2.default)(ast, (0, _verify2.default)(ast)));
			});
		}

		parse(source, filename) {
			return (0, _context.withContext)(this.options, filename, () => {
				const ast = (0, _parse2.default)((0, _lex2.default)(source));
				(0, _verify2.default)(ast);
				return ast;
			});
		}

		get CompileError() {
			return _CompileError2.default;
		}

	}

	exports.default = Compiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db21waWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FTcUIsUUFBUTs7T0FzQmhCLE9BQU8seURBQUcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkF0QkosUUFBUSIsImZpbGUiOiJDb21waWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21waWxlRXJyb3IgZnJvbSAnLi9Db21waWxlRXJyb3InXG5pbXBvcnQgQ29tcGlsZU9wdGlvbnMgZnJvbSAnLi9wcml2YXRlL0NvbXBpbGVPcHRpb25zJ1xuaW1wb3J0IHt3aXRoQ29udGV4dH0gZnJvbSAnLi9wcml2YXRlL2NvbnRleHQnXG5pbXBvcnQgbGV4IGZyb20gJy4vcHJpdmF0ZS9sZXgvbGV4J1xuaW1wb3J0IHBhcnNlIGZyb20gJy4vcHJpdmF0ZS9wYXJzZS9wYXJzZSdcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9wcml2YXRlL3JlbmRlcidcbmltcG9ydCB0cmFuc3BpbGUgZnJvbSAnLi9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUnXG5pbXBvcnQgdmVyaWZ5IGZyb20gJy4vcHJpdmF0ZS92ZXJpZnkvdmVyaWZ5J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21waWxlciB7XG5cdC8qKlxuXHRAcGFyYW0ge29iamVjdHxDb21waWxlT3B0aW9uc30gb3B0aW9uc1xuXHRcdEFyZ3VtZW50IGZvciBDb21waWxlT3B0aW9ucyBjb25zdHJ1Y3Rvciwgb3IgYSBDb21waWxlT3B0aW9ucy5cblx0QHBhcmFtIHsnXFx0J3xOdW1iZXJ9IFtvcHRpb25zLmluZGVudD0nXFx0J11cblx0XHRNYXNvbiBkb2VzIG5vdCBhbGxvdyBtaXhlZCBraW5kcyBvZiBpbmRlbnRhdGlvbixcblx0XHRzbyBpbmRlbnQgdHlwZSBtdXN0IGJlIHNldCBvbmNlIGhlcmUgYW5kIHVzZWQgY29uc2lzdGVudGx5LlxuXHRcdElmICdcXHQnLCB1c2UgdGFicyB0byBpbmRlbnQuXG5cdFx0SWYgYSBOdW1iZXIsIGluZGVudCB3aXRoIHRoYXQgbWFueSBzcGFjZXMuIFNob3VsZCBiZSBhbiBpbnQgMiB0aHJvdWdoIDguXG5cdEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5tc2xQYXRoPSdtc2wnXVxuXHRcdFBhdGggdG8gYG1zbGAuIFRoaXMgbWF5IGJlIGBtc2wvZGlzdGAuXG5cdEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tzPXRydWVdXG5cdFx0SWYgZmFsc2UsIGxlYXZlIG91dCB0eXBlIGNoZWNrcyBhbmQgYXNzZXJ0aW9ucy5cblx0QHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbmNsdWRlU291cmNlTWFwPXRydWVdIFNlZSBAcmV0dXJuIGZvciBkZXNjcmlwdGlvbi5cblx0QHBhcmFtIHtib29sZW59IFtvcHRpb25zLmltcG9ydEJvb3Q9dHJ1ZV1cblx0XHRNb3N0IG1hc29uIG1vZHVsZXMgaW5jbHVkZSBgbXNsL3ByaXZhdGUvYm9vdGAsIHdoaWNoIGBtc2xgLlxuXHRcdElmIHlvdSBkb24ndCB3YW50IHRvIGRvIHRoaXMsIG11Y2ggb2YgdGhlIGxhbmd1YWdlIHdpbGwgbm90IHdvcmsuXG5cdFx0VGhpcyBpcyBvbmx5IGludGVuZGVkIGZvciBjb21waWxpbmcgYG1zbGAgaXRzZWxmLlxuXHRAcGFyYW0ge3N0cmluZ30gbGFuZ3VhZ2Vcblx0XHRMYW5ndWFnZSB0byB1c2UgZm9yIGVycm9ycyBhbmQgd2FybmluZ3MuXG5cdFx0Q3VycmVudGx5IG11c3QgYmUgYCdlbmdsaXNoJ2AuXG5cdCovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgaW5zdGFuY2VvZiBDb21waWxlT3B0aW9ucyA/IG9wdGlvbnMgOiBuZXcgQ29tcGlsZU9wdGlvbnMob3B0aW9ucylcblx0fVxuXG5cdC8qKlxuXHRAcGFyYW0ge3N0cmluZ30gc291cmNlIE1hc29uIHNvdXJjZSBjb2RlIGZvciBhIHNpbmdsZSBtb2R1bGUuXG5cdEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSBQYXRoIG9mIHRoZSBzb3VyY2UgZmlsZS5cblx0QHJldHVybiB7e3dhcm5pbmdzOiBBcnJheTxXYXJuaW5nPiwgcmVzdWx0OiBDb21waWxlRXJyb3IgfCB7Y29kZTogc3RyaW5nLCBzb3VyY2VNYXA6IHN0cmluZ319fVxuXHRcdGBDb21waWxlRXJyb3JgcyBhcmUgbm90IHRocm93biwgYnV0IHJldHVybmVkLlxuXHRcdFRoaXMgYWxsb3dzIHVzIHRvIHJldHVybiBgd2FybmluZ3NgIGFzIHdlbGwuXG5cdFx0YHNvdXJjZU1hcGAgd2lsbCBiZSBlbXB0eSB1bmxlc3MgYG9wdHMuaW5jbHVkZVNvdXJjZU1hcGAuXG5cdCovXG5cdGNvbXBpbGUoc291cmNlLCBmaWxlbmFtZSkge1xuXHRcdHJldHVybiB3aXRoQ29udGV4dCh0aGlzLm9wdGlvbnMsIGZpbGVuYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBhc3QgPSBwYXJzZShsZXgoc291cmNlKSlcblx0XHRcdHJldHVybiByZW5kZXIodHJhbnNwaWxlKGFzdCwgdmVyaWZ5KGFzdCkpKVxuXHRcdH0pXG5cdH1cblxuXHQvKipcblx0UmV0dXJuIGEge0BsaW5rIE1zQXN0fSByYXRoZXIgdGhhbiB0cmFuc3BpbGluZyBpdCB0byBKYXZhU2NyaXB0LlxuXHRQYXJhbWV0ZXJzIGFyZSB0aGUgc2FtZSBhcyBgY29tcGlsZWAuXG5cdEByZXR1cm4ge3t3YXJuaW5nczogQXJyYXk8V2FybmluZz4sIHJlc3VsdDogQ29tcGlsZUVycm9yfE1zQXN0fX1cblx0Ki9cblx0cGFyc2Uoc291cmNlLCBmaWxlbmFtZSkge1xuXHRcdHJldHVybiB3aXRoQ29udGV4dCh0aGlzLm9wdGlvbnMsIGZpbGVuYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBhc3QgPSBwYXJzZShsZXgoc291cmNlKSlcblx0XHRcdHZlcmlmeShhc3QpXG5cdFx0XHRyZXR1cm4gYXN0XG5cdFx0fSlcblx0fVxuXG5cdC8qKlxuXHRHZXQgdGhlIENvbXBpbGVFcnJvciBjbGFzcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb21waWxlci5cblx0VGhpcyBpcyB1c2VkIGJ5IG1hc29uLW5vZGUtdXRpbCB0byBhdm9pZCBkZXBlbmRpbmcgb24gbWFzb24tY29tcGlsZSBkaXJlY3RseS5cblx0Ki9cblx0Z2V0IENvbXBpbGVFcnJvcigpIHtcblx0XHRyZXR1cm4gQ29tcGlsZUVycm9yXG5cdH1cbn1cbiJdfQ==
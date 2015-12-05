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
			this.options = new _CompileOptions2.default(options);
		}

		compile(source, filename) {
			return this._doInContext(filename, () => {
				const ast = (0, _parse2.default)((0, _lex2.default)(source));
				return (0, _render2.default)((0, _transpile2.default)(ast, (0, _verify2.default)(ast)));
			});
		}

		parse(source, filename) {
			return this._doInContext(filename, () => {
				const ast = (0, _parse2.default)((0, _lex2.default)(source));
				(0, _verify2.default)(ast);
				return ast;
			});
		}

		get CompileError() {
			return _CompileError2.default;
		}

		_doInContext(filename, getResult) {
			(0, _context.setContext)(this.options, filename);

			try {
				const result = getResult();
				return {
					warnings: _context.warnings,
					result
				};
			} catch (error) {
				if (!(error instanceof _CompileError2.default)) throw error;
				return {
					warnings: _context.warnings,
					result: error
				};
			} finally {
				(0, _context.unsetContext)();
			}
		}

	}

	exports.default = Compiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db21waWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FTcUIsUUFBUTs7T0FxQmhCLE9BQU8seURBQUcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQXJCSixRQUFRIiwiZmlsZSI6IkNvbXBpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbXBpbGVFcnJvciBmcm9tICcuL0NvbXBpbGVFcnJvcidcbmltcG9ydCBDb21waWxlT3B0aW9ucyBmcm9tICcuL3ByaXZhdGUvQ29tcGlsZU9wdGlvbnMnXG5pbXBvcnQge3NldENvbnRleHQsIHVuc2V0Q29udGV4dCwgd2FybmluZ3N9IGZyb20gJy4vcHJpdmF0ZS9jb250ZXh0J1xuaW1wb3J0IGxleCBmcm9tICcuL3ByaXZhdGUvbGV4L2xleCdcbmltcG9ydCBwYXJzZSBmcm9tICcuL3ByaXZhdGUvcGFyc2UvcGFyc2UnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcHJpdmF0ZS9yZW5kZXInXG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4vcHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlJ1xuaW1wb3J0IHZlcmlmeSBmcm9tICcuL3ByaXZhdGUvdmVyaWZ5L3ZlcmlmeSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGlsZXIge1xuXHQvKipcblx0QHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcblx0QHBhcmFtIHsnXFx0J3xOdW1iZXJ9IFtvcHRpb25zLmluZGVudD0nXFx0J11cblx0XHRNYXNvbiBkb2VzIG5vdCBhbGxvdyBtaXhlZCBraW5kcyBvZiBpbmRlbnRhdGlvbixcblx0XHRzbyBpbmRlbnQgdHlwZSBtdXN0IGJlIHNldCBvbmNlIGhlcmUgYW5kIHVzZWQgY29uc2lzdGVudGx5LlxuXHRcdElmICdcXHQnLCB1c2UgdGFicyB0byBpbmRlbnQuXG5cdFx0SWYgYSBOdW1iZXIsIGluZGVudCB3aXRoIHRoYXQgbWFueSBzcGFjZXMuIFNob3VsZCBiZSBhbiBpbnQgMiB0aHJvdWdoIDguXG5cdEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5tc2xQYXRoPSdtc2wnXVxuXHRcdFBhdGggdG8gYG1zbGAuIFRoaXMgbWF5IGJlIGBtc2wvZGlzdGAuXG5cdEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tzPXRydWVdXG5cdFx0SWYgZmFsc2UsIGxlYXZlIG91dCB0eXBlIGNoZWNrcyBhbmQgYXNzZXJ0aW9ucy5cblx0QHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbmNsdWRlU291cmNlTWFwPXRydWVdIFNlZSBAcmV0dXJuIGZvciBkZXNjcmlwdGlvbi5cblx0QHBhcmFtIHtib29sZW59IFtvcHRpb25zLmltcG9ydEJvb3Q9dHJ1ZV1cblx0XHRNb3N0IG1hc29uIG1vZHVsZXMgaW5jbHVkZSBgbXNsL3ByaXZhdGUvYm9vdGAsIHdoaWNoIGBtc2xgLlxuXHRcdElmIHlvdSBkb24ndCB3YW50IHRvIGRvIHRoaXMsIG11Y2ggb2YgdGhlIGxhbmd1YWdlIHdpbGwgbm90IHdvcmsuXG5cdFx0VGhpcyBpcyBvbmx5IGludGVuZGVkIGZvciBjb21waWxpbmcgYG1zbGAgaXRzZWxmLlxuXHRAcGFyYW0ge3N0cmluZ30gbGFuZ3VhZ2Vcblx0XHRMYW5ndWFnZSB0byB1c2UgZm9yIGVycm9ycyBhbmQgd2FybmluZ3MuXG5cdFx0Q3VycmVudGx5IG11c3QgYmUgYCdlbmdsaXNoJ2AuXG5cdCovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMub3B0aW9ucyA9IG5ldyBDb21waWxlT3B0aW9ucyhvcHRpb25zKVxuXHR9XG5cblx0LyoqXG5cdEBwYXJhbSB7c3RyaW5nfSBzb3VyY2UgTWFzb24gc291cmNlIGNvZGUgZm9yIGEgc2luZ2xlIG1vZHVsZS5cblx0QHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIFBhdGggb2YgdGhlIHNvdXJjZSBmaWxlLlxuXHRAcmV0dXJuIHt7d2FybmluZ3M6IEFycmF5PFdhcm5pbmc+LCByZXN1bHQ6IENvbXBpbGVFcnJvciB8IHtjb2RlOiBzdHJpbmcsIHNvdXJjZU1hcDogc3RyaW5nfX19XG5cdFx0YENvbXBpbGVFcnJvcmBzIGFyZSBub3QgdGhyb3duLCBidXQgcmV0dXJuZWQuXG5cdFx0VGhpcyBhbGxvd3MgdXMgdG8gcmV0dXJuIGB3YXJuaW5nc2AgYXMgd2VsbC5cblx0XHRgc291cmNlTWFwYCB3aWxsIGJlIGVtcHR5IHVubGVzcyBgb3B0cy5pbmNsdWRlU291cmNlTWFwYC5cblx0Ki9cblx0Y29tcGlsZShzb3VyY2UsIGZpbGVuYW1lKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2RvSW5Db250ZXh0KGZpbGVuYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBhc3QgPSBwYXJzZShsZXgoc291cmNlKSlcblx0XHRcdHJldHVybiByZW5kZXIodHJhbnNwaWxlKGFzdCwgdmVyaWZ5KGFzdCkpKVxuXHRcdH0pXG5cdH1cblxuXHQvKipcblx0UmV0dXJuIGEge0BsaW5rIE1zQXN0fSByYXRoZXIgdGhhbiB0cmFuc3BpbGluZyBpdCB0byBKYXZhU2NyaXB0LlxuXHRQYXJhbWV0ZXJzIGFyZSB0aGUgc2FtZSBhcyBgY29tcGlsZWAuXG5cdEByZXR1cm4ge3t3YXJuaW5nczogQXJyYXk8V2FybmluZz4sIHJlc3VsdDogQ29tcGlsZUVycm9yfE1zQXN0fX1cblx0Ki9cblx0cGFyc2Uoc291cmNlLCBmaWxlbmFtZSkge1xuXHRcdHJldHVybiB0aGlzLl9kb0luQ29udGV4dChmaWxlbmFtZSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgYXN0ID0gcGFyc2UobGV4KHNvdXJjZSkpXG5cdFx0XHR2ZXJpZnkoYXN0KVxuXHRcdFx0cmV0dXJuIGFzdFxuXHRcdH0pXG5cdH1cblxuXHQvKipcblx0R2V0IHRoZSBDb21waWxlRXJyb3IgY2xhc3MgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29tcGlsZXIuXG5cdFRoaXMgaXMgdXNlZCBieSBtYXNvbi1ub2RlLXV0aWwgdG8gYXZvaWQgZGVwZW5kaW5nIG9uIG1hc29uLWNvbXBpbGUgZGlyZWN0bHkuXG5cdCovXG5cdGdldCBDb21waWxlRXJyb3IoKSB7XG5cdFx0cmV0dXJuIENvbXBpbGVFcnJvclxuXHR9XG5cblx0X2RvSW5Db250ZXh0KGZpbGVuYW1lLCBnZXRSZXN1bHQpIHtcblx0XHRzZXRDb250ZXh0KHRoaXMub3B0aW9ucywgZmlsZW5hbWUpXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGdldFJlc3VsdCgpXG5cdFx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGlmICghKGVycm9yIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKSlcblx0XHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogZXJyb3J9XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHVuc2V0Q29udGV4dCgpXG5cdFx0fVxuXHR9XG59XG4iXX0=
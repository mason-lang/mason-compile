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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db21waWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FTcUIsUUFBUTs7T0FrQmhCLE9BQU8seURBQUcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWxCSixRQUFRIiwiZmlsZSI6IkNvbXBpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbXBpbGVFcnJvciBmcm9tICcuL0NvbXBpbGVFcnJvcidcbmltcG9ydCBDb21waWxlT3B0aW9ucyBmcm9tICcuL3ByaXZhdGUvQ29tcGlsZU9wdGlvbnMnXG5pbXBvcnQge3NldENvbnRleHQsIHVuc2V0Q29udGV4dCwgd2FybmluZ3N9IGZyb20gJy4vcHJpdmF0ZS9jb250ZXh0J1xuaW1wb3J0IGxleCBmcm9tICcuL3ByaXZhdGUvbGV4L2xleCdcbmltcG9ydCBwYXJzZSBmcm9tICcuL3ByaXZhdGUvcGFyc2UvcGFyc2UnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcHJpdmF0ZS9yZW5kZXInXG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4vcHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlJ1xuaW1wb3J0IHZlcmlmeSBmcm9tICcuL3ByaXZhdGUvdmVyaWZ5L3ZlcmlmeSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGlsZXIge1xuXHQvKipcblx0QHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcblx0QHBhcmFtIHsnXFx0J3xOdW1iZXJ9IFtvcHRpb25zLmluZGVudD0nXFx0J11cblx0XHRNYXNvbiBkb2VzIG5vdCBhbGxvdyBtaXhlZCBraW5kcyBvZiBpbmRlbnRhdGlvbixcblx0XHRzbyBpbmRlbnQgdHlwZSBtdXN0IGJlIHNldCBvbmNlIGhlcmUgYW5kIHVzZWQgY29uc2lzdGVudGx5LlxuXHRcdElmICdcXHQnLCB1c2UgdGFicyB0byBpbmRlbnQuXG5cdFx0SWYgYSBOdW1iZXIsIGluZGVudCB3aXRoIHRoYXQgbWFueSBzcGFjZXMuIFNob3VsZCBiZSBhbiBpbnQgMiB0aHJvdWdoIDguXG5cdEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5tc2xQYXRoPSdtc2wnXVxuXHRcdFBhdGggdG8gYG1zbGAuIFRoaXMgbWF5IGJlIGBtc2wvZGlzdGAuXG5cdEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tzPXRydWVdXG5cdFx0SWYgZmFsc2UsIGxlYXZlIG91dCB0eXBlIGNoZWNrcyBhbmQgYXNzZXJ0aW9ucy5cblx0QHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbmNsdWRlU291cmNlTWFwPXRydWVdIFNlZSBAcmV0dXJuIGZvciBkZXNjcmlwdGlvbi5cblx0QHBhcmFtIHtib29sZW59IFtvcHRpb25zLmltcG9ydEJvb3Q9dHJ1ZV1cblx0XHRNb3N0IG1hc29uIG1vZHVsZXMgaW5jbHVkZSBgbXNsL3ByaXZhdGUvYm9vdGAsIHdoaWNoIGBtc2xgLlxuXHRcdElmIHlvdSBkb24ndCB3YW50IHRvIGRvIHRoaXMsIG11Y2ggb2YgdGhlIGxhbmd1YWdlIHdpbGwgbm90IHdvcmsuXG5cdFx0VGhpcyBpcyBvbmx5IGludGVuZGVkIGZvciBjb21waWxpbmcgYG1zbGAgaXRzZWxmLlxuXHQqL1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLm9wdGlvbnMgPSBuZXcgQ29tcGlsZU9wdGlvbnMob3B0aW9ucylcblx0fVxuXG5cdC8qKlxuXHRAcGFyYW0ge3N0cmluZ30gc291cmNlIE1hc29uIHNvdXJjZSBjb2RlIGZvciBhIHNpbmdsZSBtb2R1bGUuXG5cdEByZXR1cm4ge3t3YXJuaW5nczogQXJyYXk8V2FybmluZz4sIHJlc3VsdDogQ29tcGlsZUVycm9yIHwgc3RyaW5nIHwge2NvZGUsIHNvdXJjZU1hcH19fVxuXHRcdGBDb21waWxlRXJyb3JgcyBhcmUgbm90IHRocm93biwgYnV0IHJldHVybmVkLlxuXHRcdFRoaXMgYWxsb3dzIHVzIHRvIHJldHVybiBgd2FybmluZ3NgIGFzIHdlbGwuXG5cblx0XHRJZiB0aGVyZSBpcyBubyBlcnJvcjpcblx0XHRgcmVzdWx0YCB3aWxsIGJlIGB7Y29kZTogc3RyaW5nLCBzb3VyY2VNYXA6IHN0cmluZ31gIGlmIGBvcHRzLmluY2x1ZGVTb3VyY2VNYXBgLlxuXHRcdE90aGVyd2lzZSwgaXQgd2lsbCBqdXN0IGJlIHRoZSBjb2RlIChhIHN0cmluZykuXG5cdCovXG5cdGNvbXBpbGUoc291cmNlLCBmaWxlbmFtZSkge1xuXHRcdHJldHVybiB0aGlzLl9kb0luQ29udGV4dChmaWxlbmFtZSwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgYXN0ID0gcGFyc2UobGV4KHNvdXJjZSkpXG5cdFx0XHRyZXR1cm4gcmVuZGVyKHRyYW5zcGlsZShhc3QsIHZlcmlmeShhc3QpKSlcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdFJldHVybiBhIHtAbGluayBNc0FzdH0gcmF0aGVyIHRoYW4gdHJhbnNwaWxpbmcgaXQgdG8gSmF2YVNjcmlwdC5cblx0UGFyYW1ldGVycyBhcmUgdGhlIHNhbWUgYXMgYGNvbXBpbGVgLlxuXHRAcmV0dXJuIHt7d2FybmluZ3M6IEFycmF5PFdhcm5pbmc+LCByZXN1bHQ6IENvbXBpbGVFcnJvcnxNc0FzdH19XG5cdCovXG5cdHBhcnNlKHNvdXJjZSwgZmlsZW5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5fZG9JbkNvbnRleHQoZmlsZW5hbWUsICgpID0+IHtcblx0XHRcdGNvbnN0IGFzdCA9IHBhcnNlKGxleChzb3VyY2UpKVxuXHRcdFx0dmVyaWZ5KGFzdClcblx0XHRcdHJldHVybiBhc3Rcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdEdldCB0aGUgQ29tcGlsZUVycm9yIGNsYXNzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbXBpbGVyLlxuXHRUaGlzIGlzIHVzZWQgYnkgbWFzb24tbm9kZS11dGlsIHRvIGF2b2lkIGRlcGVuZGluZyBvbiBtYXNvbi1jb21waWxlIGRpcmVjdGx5LlxuXHQqL1xuXHRnZXQgQ29tcGlsZUVycm9yKCkge1xuXHRcdHJldHVybiBDb21waWxlRXJyb3Jcblx0fVxuXG5cdF9kb0luQ29udGV4dChmaWxlbmFtZSwgZ2V0UmVzdWx0KSB7XG5cdFx0c2V0Q29udGV4dCh0aGlzLm9wdGlvbnMsIGZpbGVuYW1lKVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBnZXRSZXN1bHQoKVxuXHRcdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRpZiAoIShlcnJvciBpbnN0YW5jZW9mIENvbXBpbGVFcnJvcikpXG5cdFx0XHRcdHRocm93IGVycm9yXG5cdFx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHQ6IGVycm9yfVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR1bnNldENvbnRleHQoKVxuXHRcdH1cblx0fVxufVxuIl19
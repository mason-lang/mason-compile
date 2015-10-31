'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './CompileError', './private/context', './private/lex/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/util', './private/verify/verify'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./CompileError'), require('./private/context'), require('./private/lex/lex'), require('./private/parse/parse'), require('./private/render'), require('./private/transpile/transpile'), require('./private/util'), require('./private/verify/verify'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.lex, global.parse, global.render, global.transpile, global.util, global.verify);
		global.compile = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _lex, _parse, _render, _transpile, _util, _verify) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = compile;
	exports.parseAst = parseAst;

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _lex2 = _interopRequireDefault(_lex);

	var _parse2 = _interopRequireDefault(_parse);

	var _render2 = _interopRequireDefault(_render);

	var _transpile2 = _interopRequireDefault(_transpile);

	var _verify2 = _interopRequireDefault(_verify);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function compile(source) {
		let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
		(0, _util.type)(source, String);
		(0, _context.setContext)(opts);

		try {
			const ast = (0, _parse2.default)((0, _lex2.default)(source));
			const esAst = (0, _transpile2.default)(ast, (0, _verify2.default)(ast));
			return {
				warnings: _context.warnings,
				result: (0, _render2.default)(esAst)
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

	function parseAst(source) {
		let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
		(0, _util.type)(source, String);
		(0, _context.setContext)(opts);

		try {
			const ast = (0, _parse2.default)((0, _lex2.default)(source));
			(0, _verify2.default)(ast);
			return {
				warnings: _context.warnings,
				result: ast
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21waWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQ3dCLE9BQU87U0FvQmYsUUFBUSxHQUFSLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7VUFwQkEsT0FBTztNQUFTLElBQUkseURBQUMsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQW9CL0IsUUFBUTtNQUFTLElBQUkseURBQUMsRUFBRSIsImZpbGUiOiJjb21waWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbXBpbGVFcnJvciBmcm9tICcuL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7c2V0Q29udGV4dCwgdW5zZXRDb250ZXh0LCB3YXJuaW5nc30gZnJvbSAnLi9wcml2YXRlL2NvbnRleHQnXG5pbXBvcnQgbGV4IGZyb20gJy4vcHJpdmF0ZS9sZXgvbGV4J1xuaW1wb3J0IHBhcnNlIGZyb20gJy4vcHJpdmF0ZS9wYXJzZS9wYXJzZSdcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9wcml2YXRlL3JlbmRlcidcbmltcG9ydCB0cmFuc3BpbGUgZnJvbSAnLi9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUnXG5pbXBvcnQge3R5cGV9IGZyb20gJy4vcHJpdmF0ZS91dGlsJ1xuaW1wb3J0IHZlcmlmeSBmcm9tICcuL3ByaXZhdGUvdmVyaWZ5L3ZlcmlmeSdcblxuLyoqXG5AcGFyYW0ge3N0cmluZ30gc291cmNlIE1hc29uIHNvdXJjZSBjb2RlIGZvciBhIHNpbmdsZSBtb2R1bGUuXG5AcGFyYW0ge29iamVjdH0gb3B0c1xuQHBhcmFtIHsnXFx0J3xOdW1iZXJ9IFtvcHRzLmluZGVudD0nXFx0J11cblx0TWFzb24gZG9lcyBub3QgYWxsb3cgbWl4ZWQga2luZHMgb2YgaW5kZW50YXRpb24sXG5cdHNvIGluZGVudCB0eXBlIG11c3QgYmUgc2V0IG9uY2UgaGVyZSBhbmQgdXNlZCBjb25zaXN0ZW50bHkuXG5cdElmICdcXHQnLCB1c2UgdGFicyB0byBpbmRlbnQuXG5cdElmIGEgTnVtYmVyLCBpbmRlbnQgd2l0aCB0aGF0IG1hbnkgc3BhY2VzLiBTaG91bGQgYmUgYW4gaW50IDIgdGhyb3VnaCA4LlxuQHBhcmFtIHtib29sZWFufSBbb3B0cy5tc2xQYXRoPSdtc2wnXVxuXHRQYXRoIHRvIGBtc2xgLiBUaGlzIG1heSBiZSBgbXNsL2Rpc3RgLlxuQHBhcmFtIHtib29sZWFufSBbb3B0cy5jaGVja3M9dHJ1ZV1cblx0SWYgZmFsc2UsIGxlYXZlIG91dCB0eXBlIGNoZWNrcyBhbmQgYXNzZXJ0aW9ucy5cbkBwYXJhbSB7Ym9vbGVhbn0gW29wdHMuaW5jbHVkZVNvdXJjZU1hcD10cnVlXSBTZWUgQHJldHVybiBmb3IgZGVzY3JpcHRpb24uXG5AcGFyYW0ge2Jvb2xlbn0gW29wdHMuaW1wb3J0Qm9vdD10cnVlXVxuXHRNb3N0IG1hc29uIG1vZHVsZXMgaW5jbHVkZSBgbXNsL3ByaXZhdGUvYm9vdGAsIHdoaWNoIGBtc2xgLlxuXHRJZiB5b3UgZG9uJ3Qgd2FudCB0byBkbyB0aGlzLCBtdWNoIG9mIHRoZSBsYW5ndWFnZSB3aWxsIG5vdCB3b3JrLlxuXHRUaGlzIGlzIG9ubHkgaW50ZW5kZWQgZm9yIGNvbXBpbGluZyBgbXNsYCBpdHNlbGYuXG5AcmV0dXJuIHt7d2FybmluZ3M6IEFycmF5PFdhcm5pbmc+LCByZXN1bHQ6IENvbXBpbGVFcnJvcnxzdHJpbmd8e2NvZGU6IHN0cmluZywgc291cmNlTWFwOiBzdHJpbmd9fX1cblx0YENvbXBpbGVFcnJvcmBzIGFyZSBub3QgdGhyb3duLCBidXQgcmV0dXJuZWQuXG5cdFRoaXMgYWxsb3dzIHVzIHRvIHJldHVybiBgd2FybmluZ3NgIGFzIHdlbGwuXG5cblx0SWYgdGhlcmUgaXMgbm8gZXJyb3I6XG5cdGByZXN1bHRgIHdpbGwgYmUgYHtjb2RlOiBzdHJpbmcsIHNvdXJjZU1hcDogc3RyaW5nfWAgaWYgYG9wdHMuaW5jbHVkZVNvdXJjZU1hcGAuXG5cdE90aGVyd2lzZSwgaXQgd2lsbCBqdXN0IGJlIHRoZSBjb2RlIChhIHN0cmluZykuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29tcGlsZShzb3VyY2UsIG9wdHM9e30pIHtcblx0dHlwZShzb3VyY2UsIFN0cmluZylcblx0c2V0Q29udGV4dChvcHRzKVxuXHR0cnkge1xuXHRcdGNvbnN0IGFzdCA9IHBhcnNlKGxleChzb3VyY2UpKVxuXHRcdGNvbnN0IGVzQXN0ID0gdHJhbnNwaWxlKGFzdCwgdmVyaWZ5KGFzdCkpXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0OiByZW5kZXIoZXNBc3QpfVxuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGlmICghKGVycm9yIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKSlcblx0XHRcdHRocm93IGVycm9yXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0OiBlcnJvcn1cblx0fSBmaW5hbGx5IHtcblx0XHR1bnNldENvbnRleHQoKVxuXHR9XG59XG5cbi8qKlxuUmV0dXJucyBhIHtAbGluayBNc0FzdH0gcmF0aGVyIHRoYW4gdHJhbnNwaWxpbmcgaXQgdG8gSmF2YVNjcmlwdC5cblBhcmFtZXRlcnMgYXJlIHRoZSBzYW1lIGFzIGBjb21waWxlYC5cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VBc3Qoc291cmNlLCBvcHRzPXt9KSB7XG5cdHR5cGUoc291cmNlLCBTdHJpbmcpXG5cdHNldENvbnRleHQob3B0cylcblx0dHJ5IHtcblx0XHRjb25zdCBhc3QgPSBwYXJzZShsZXgoc291cmNlKSlcblx0XHR2ZXJpZnkoYXN0KVxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogYXN0fVxuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdGlmICghKGVycm9yIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKSlcblx0XHRcdHRocm93IGVycm9yXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0OiBlcnJvcn1cblx0fSBmaW5hbGx5IHtcblx0XHR1bnNldENvbnRleHQoKVxuXHR9XG59XG4iXX0=
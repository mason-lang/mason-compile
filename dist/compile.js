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

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21waWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQ3dCLE9BQU87U0FvQmYsUUFBUSxHQUFSLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBcEJBLE9BQU87TUFBUyxJQUFJLHlEQUFDLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFvQi9CLFFBQVE7TUFBUyxJQUFJLHlEQUFDLEVBQUUiLCJmaWxlIjoiY29tcGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21waWxlRXJyb3IgZnJvbSAnLi9Db21waWxlRXJyb3InXG5pbXBvcnQge3NldENvbnRleHQsIHVuc2V0Q29udGV4dCwgd2FybmluZ3N9IGZyb20gJy4vcHJpdmF0ZS9jb250ZXh0J1xuaW1wb3J0IGxleCBmcm9tICcuL3ByaXZhdGUvbGV4L2xleCdcbmltcG9ydCBwYXJzZSBmcm9tICcuL3ByaXZhdGUvcGFyc2UvcGFyc2UnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcHJpdmF0ZS9yZW5kZXInXG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4vcHJpdmF0ZS90cmFuc3BpbGUvdHJhbnNwaWxlJ1xuaW1wb3J0IHt0eXBlfSBmcm9tICcuL3ByaXZhdGUvdXRpbCdcbmltcG9ydCB2ZXJpZnkgZnJvbSAnLi9wcml2YXRlL3ZlcmlmeS92ZXJpZnknXG5cbi8qKlxuQHBhcmFtIHtzdHJpbmd9IHNvdXJjZSBNYXNvbiBzb3VyY2UgY29kZSBmb3IgYSBzaW5nbGUgbW9kdWxlLlxuQHBhcmFtIHtvYmplY3R9IG9wdHNcbkBwYXJhbSB7J1xcdCd8TnVtYmVyfSBbb3B0cy5pbmRlbnQ9J1xcdCddXG5cdE1hc29uIGRvZXMgbm90IGFsbG93IG1peGVkIGtpbmRzIG9mIGluZGVudGF0aW9uLFxuXHRzbyBpbmRlbnQgdHlwZSBtdXN0IGJlIHNldCBvbmNlIGhlcmUgYW5kIHVzZWQgY29uc2lzdGVudGx5LlxuXHRJZiAnXFx0JywgdXNlIHRhYnMgdG8gaW5kZW50LlxuXHRJZiBhIE51bWJlciwgaW5kZW50IHdpdGggdGhhdCBtYW55IHNwYWNlcy4gU2hvdWxkIGJlIGFuIGludCAyIHRocm91Z2ggOC5cbkBwYXJhbSB7Ym9vbGVhbn0gW29wdHMubXNsUGF0aD0nbXNsJ11cblx0UGF0aCB0byBgbXNsYC4gVGhpcyBtYXkgYmUgYG1zbC9kaXN0YC5cbkBwYXJhbSB7Ym9vbGVhbn0gW29wdHMuY2hlY2tzPXRydWVdXG5cdElmIGZhbHNlLCBsZWF2ZSBvdXQgdHlwZSBjaGVja3MgYW5kIGFzc2VydGlvbnMuXG5AcGFyYW0ge2Jvb2xlYW59IFtvcHRzLmluY2x1ZGVTb3VyY2VNYXA9dHJ1ZV0gU2VlIEByZXR1cm4gZm9yIGRlc2NyaXB0aW9uLlxuQHBhcmFtIHtib29sZW59IFtvcHRzLmltcG9ydEJvb3Q9dHJ1ZV1cblx0TW9zdCBtYXNvbiBtb2R1bGVzIGluY2x1ZGUgYG1zbC9wcml2YXRlL2Jvb3RgLCB3aGljaCBgbXNsYC5cblx0SWYgeW91IGRvbid0IHdhbnQgdG8gZG8gdGhpcywgbXVjaCBvZiB0aGUgbGFuZ3VhZ2Ugd2lsbCBub3Qgd29yay5cblx0VGhpcyBpcyBvbmx5IGludGVuZGVkIGZvciBjb21waWxpbmcgYG1zbGAgaXRzZWxmLlxuQHJldHVybiB7e3dhcm5pbmdzOiBBcnJheTxXYXJuaW5nPiwgcmVzdWx0OiBDb21waWxlRXJyb3J8c3RyaW5nfHtjb2RlOiBzdHJpbmcsIHNvdXJjZU1hcDogc3RyaW5nfX19XG5cdGBDb21waWxlRXJyb3JgcyBhcmUgbm90IHRocm93biwgYnV0IHJldHVybmVkLlxuXHRUaGlzIGFsbG93cyB1cyB0byByZXR1cm4gYHdhcm5pbmdzYCBhcyB3ZWxsLlxuXG5cdElmIHRoZXJlIGlzIG5vIGVycm9yOlxuXHRgcmVzdWx0YCB3aWxsIGJlIGB7Y29kZTogc3RyaW5nLCBzb3VyY2VNYXA6IHN0cmluZ31gIGlmIGBvcHRzLmluY2x1ZGVTb3VyY2VNYXBgLlxuXHRPdGhlcndpc2UsIGl0IHdpbGwganVzdCBiZSB0aGUgY29kZSAoYSBzdHJpbmcpLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbXBpbGUoc291cmNlLCBvcHRzPXt9KSB7XG5cdHR5cGUoc291cmNlLCBTdHJpbmcpXG5cdHNldENvbnRleHQob3B0cylcblx0dHJ5IHtcblx0XHRjb25zdCBhc3QgPSBwYXJzZShsZXgoc291cmNlKSlcblx0XHRjb25zdCBlc0FzdCA9IHRyYW5zcGlsZShhc3QsIHZlcmlmeShhc3QpKVxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogcmVuZGVyKGVzQXN0KX1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRpZiAoIShlcnJvciBpbnN0YW5jZW9mIENvbXBpbGVFcnJvcikpXG5cdFx0XHR0aHJvdyBlcnJvclxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogZXJyb3J9XG5cdH0gZmluYWxseSB7XG5cdFx0dW5zZXRDb250ZXh0KClcblx0fVxufVxuXG4vKipcblJldHVybnMgYSB7QGxpbmsgTXNBc3R9IHJhdGhlciB0aGFuIHRyYW5zcGlsaW5nIGl0IHRvIEphdmFTY3JpcHQuXG5QYXJhbWV0ZXJzIGFyZSB0aGUgc2FtZSBhcyBgY29tcGlsZWAuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXN0KHNvdXJjZSwgb3B0cz17fSkge1xuXHR0eXBlKHNvdXJjZSwgU3RyaW5nKVxuXHRzZXRDb250ZXh0KG9wdHMpXG5cdHRyeSB7XG5cdFx0Y29uc3QgYXN0ID0gcGFyc2UobGV4KHNvdXJjZSkpXG5cdFx0dmVyaWZ5KGFzdClcblx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHQ6IGFzdH1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRpZiAoIShlcnJvciBpbnN0YW5jZW9mIENvbXBpbGVFcnJvcikpXG5cdFx0XHR0aHJvdyBlcnJvclxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogZXJyb3J9XG5cdH0gZmluYWxseSB7XG5cdFx0dW5zZXRDb250ZXh0KClcblx0fVxufVxuIl19
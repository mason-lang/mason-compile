(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', './CompileError', './private/context', './private/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/util', './private/verify'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('./CompileError'), require('./private/context'), require('./private/lex'), require('./private/parse/parse'), require('./private/render'), require('./private/transpile/transpile'), require('./private/util'), require('./private/verify'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.lex, global.parse, global.render, global.transpile, global.util, global.verify);
		global.compile = mod.exports;
	}
})(this, function (exports, _CompileError, _privateContext, _privateLex, _privateParseParse, _privateRender, _privateTranspileTranspile, _privateUtil, _privateVerify) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.default = compile;
	exports.parseAst = parseAst;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _lex = _interopRequireDefault(_privateLex);

	var _parse = _interopRequireDefault(_privateParseParse);

	var _render = _interopRequireDefault(_privateRender);

	var _transpile = _interopRequireDefault(_privateTranspileTranspile);

	var _verify = _interopRequireDefault(_privateVerify);

	/**
 @param {string} source Mason source code for a single module.
 @param {object} opts
 @param {'\t'|Number} [opts.indent='\t']
 	Mason does not allow mixed kinds of indentation,
 	so indent type must be set once here and used consistently.
 	If '\t', use tabs to indent.
 	If a Number, indent with that many spaces. Should be an int 2 through 8.
 @param {boolean} [opts.mslPath='msl']
 	Path to `msl`. This may be `msl/dist`.
 @param {boolean} [opts.checks=true]
 	If false, leave out type checks and assertions.
 @param {boolean} [opts.includeSourceMap=true] See @return for description.
 @param {boolen} [opts.importBoot=true]
 	Most mason modules include `msl/private/boot`, which `msl`.
 	If you don't want to do this, much of the language will not work.
 	This is only intended for compiling `msl` itself.
 @return {{warnings: Array<Warning>, result: CompileError|string|{code: string, sourceMap: string}}}
 	`CompileError`s are not thrown, but returned.
 	This allows us to return `warnings` as well.
 
 	If there is no error:
 	`result` will be `{code: string, sourceMap: string}` if `opts.includeSourceMap`.
 	Otherwise, it will just be the code (a string).
 */

	function compile(source) {
		let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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
	}

	/**
 Returns a {@link MsAst} rather than transpiling it to JavaScript.
 Parameters are the same as `compile`.
 */

	function parseAst(source) {
		let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21waWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQ3dCLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBaEIsVUFBUyxPQUFPLENBQUMsTUFBTSxFQUFXO01BQVQsSUFBSSx5REFBQyxFQUFFOztBQUM5QyxtQkE3Qk8sSUFBSSxFQTZCTixNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDcEIsc0JBbkNPLFVBQVUsRUFtQ04sSUFBSSxDQUFDLENBQUE7QUFDaEIsTUFBSTtBQUNILFNBQU0sR0FBRyxHQUFHLG9CQUFNLGtCQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDOUIsU0FBTSxLQUFLLEdBQUcsd0JBQVUsR0FBRyxFQUFFLHFCQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDekMsVUFBTyxFQUFDLFFBQVEsa0JBdkNnQixRQUFRLEFBdUN4QixFQUFFLE1BQU0sRUFBRSxxQkFBTyxLQUFLLENBQUMsRUFBQyxDQUFBO0dBQ3hDLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZixPQUFJLEVBQUUsS0FBSyxtQ0FBd0IsQUFBQyxFQUNuQyxNQUFNLEtBQUssQ0FBQTtBQUNaLFVBQU8sRUFBQyxRQUFRLGtCQTNDZ0IsUUFBUSxBQTJDeEIsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUE7R0FDaEMsU0FBUztBQUNULHVCQTdDa0IsWUFBWSxHQTZDaEIsQ0FBQTtHQUNkO0VBQ0Q7Ozs7Ozs7QUFNTSxVQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQVc7TUFBVCxJQUFJLHlEQUFDLEVBQUU7O0FBQ3ZDLG1CQWpETyxJQUFJLEVBaUROLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNwQixzQkF2RE8sVUFBVSxFQXVETixJQUFJLENBQUMsQ0FBQTtBQUNoQixNQUFJO0FBQ0gsU0FBTSxHQUFHLEdBQUcsb0JBQU0sa0JBQUksTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUM5Qix3QkFBTyxHQUFHLENBQUMsQ0FBQTtBQUNYLFVBQU8sRUFBQyxRQUFRLGtCQTNEZ0IsUUFBUSxBQTJEeEIsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFDLENBQUE7R0FDOUIsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNmLE9BQUksRUFBRSxLQUFLLG1DQUF3QixBQUFDLEVBQ25DLE1BQU0sS0FBSyxDQUFBO0FBQ1osVUFBTyxFQUFDLFFBQVEsa0JBL0RnQixRQUFRLEFBK0R4QixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQTtHQUNoQyxTQUFTO0FBQ1QsdUJBakVrQixZQUFZLEdBaUVoQixDQUFBO0dBQ2Q7RUFDRCIsImZpbGUiOiJjb21waWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbXBpbGVFcnJvciBmcm9tICcuL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7c2V0Q29udGV4dCwgdW5zZXRDb250ZXh0LCB3YXJuaW5nc30gZnJvbSAnLi9wcml2YXRlL2NvbnRleHQnXG5pbXBvcnQgbGV4IGZyb20gJy4vcHJpdmF0ZS9sZXgnXG5pbXBvcnQgcGFyc2UgZnJvbSAnLi9wcml2YXRlL3BhcnNlL3BhcnNlJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3ByaXZhdGUvcmVuZGVyJ1xuaW1wb3J0IHRyYW5zcGlsZSBmcm9tICcuL3ByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZSdcbmltcG9ydCB7dHlwZX0gZnJvbSAnLi9wcml2YXRlL3V0aWwnXG5pbXBvcnQgdmVyaWZ5IGZyb20gJy4vcHJpdmF0ZS92ZXJpZnknXG5cbi8qKlxuQHBhcmFtIHtzdHJpbmd9IHNvdXJjZSBNYXNvbiBzb3VyY2UgY29kZSBmb3IgYSBzaW5nbGUgbW9kdWxlLlxuQHBhcmFtIHtvYmplY3R9IG9wdHNcbkBwYXJhbSB7J1xcdCd8TnVtYmVyfSBbb3B0cy5pbmRlbnQ9J1xcdCddXG5cdE1hc29uIGRvZXMgbm90IGFsbG93IG1peGVkIGtpbmRzIG9mIGluZGVudGF0aW9uLFxuXHRzbyBpbmRlbnQgdHlwZSBtdXN0IGJlIHNldCBvbmNlIGhlcmUgYW5kIHVzZWQgY29uc2lzdGVudGx5LlxuXHRJZiAnXFx0JywgdXNlIHRhYnMgdG8gaW5kZW50LlxuXHRJZiBhIE51bWJlciwgaW5kZW50IHdpdGggdGhhdCBtYW55IHNwYWNlcy4gU2hvdWxkIGJlIGFuIGludCAyIHRocm91Z2ggOC5cbkBwYXJhbSB7Ym9vbGVhbn0gW29wdHMubXNsUGF0aD0nbXNsJ11cblx0UGF0aCB0byBgbXNsYC4gVGhpcyBtYXkgYmUgYG1zbC9kaXN0YC5cbkBwYXJhbSB7Ym9vbGVhbn0gW29wdHMuY2hlY2tzPXRydWVdXG5cdElmIGZhbHNlLCBsZWF2ZSBvdXQgdHlwZSBjaGVja3MgYW5kIGFzc2VydGlvbnMuXG5AcGFyYW0ge2Jvb2xlYW59IFtvcHRzLmluY2x1ZGVTb3VyY2VNYXA9dHJ1ZV0gU2VlIEByZXR1cm4gZm9yIGRlc2NyaXB0aW9uLlxuQHBhcmFtIHtib29sZW59IFtvcHRzLmltcG9ydEJvb3Q9dHJ1ZV1cblx0TW9zdCBtYXNvbiBtb2R1bGVzIGluY2x1ZGUgYG1zbC9wcml2YXRlL2Jvb3RgLCB3aGljaCBgbXNsYC5cblx0SWYgeW91IGRvbid0IHdhbnQgdG8gZG8gdGhpcywgbXVjaCBvZiB0aGUgbGFuZ3VhZ2Ugd2lsbCBub3Qgd29yay5cblx0VGhpcyBpcyBvbmx5IGludGVuZGVkIGZvciBjb21waWxpbmcgYG1zbGAgaXRzZWxmLlxuQHJldHVybiB7e3dhcm5pbmdzOiBBcnJheTxXYXJuaW5nPiwgcmVzdWx0OiBDb21waWxlRXJyb3J8c3RyaW5nfHtjb2RlOiBzdHJpbmcsIHNvdXJjZU1hcDogc3RyaW5nfX19XG5cdGBDb21waWxlRXJyb3JgcyBhcmUgbm90IHRocm93biwgYnV0IHJldHVybmVkLlxuXHRUaGlzIGFsbG93cyB1cyB0byByZXR1cm4gYHdhcm5pbmdzYCBhcyB3ZWxsLlxuXG5cdElmIHRoZXJlIGlzIG5vIGVycm9yOlxuXHRgcmVzdWx0YCB3aWxsIGJlIGB7Y29kZTogc3RyaW5nLCBzb3VyY2VNYXA6IHN0cmluZ31gIGlmIGBvcHRzLmluY2x1ZGVTb3VyY2VNYXBgLlxuXHRPdGhlcndpc2UsIGl0IHdpbGwganVzdCBiZSB0aGUgY29kZSAoYSBzdHJpbmcpLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbXBpbGUoc291cmNlLCBvcHRzPXt9KSB7XG5cdHR5cGUoc291cmNlLCBTdHJpbmcpXG5cdHNldENvbnRleHQob3B0cylcblx0dHJ5IHtcblx0XHRjb25zdCBhc3QgPSBwYXJzZShsZXgoc291cmNlKSlcblx0XHRjb25zdCBlc0FzdCA9IHRyYW5zcGlsZShhc3QsIHZlcmlmeShhc3QpKVxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogcmVuZGVyKGVzQXN0KX1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRpZiAoIShlcnJvciBpbnN0YW5jZW9mIENvbXBpbGVFcnJvcikpXG5cdFx0XHR0aHJvdyBlcnJvclxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogZXJyb3J9XG5cdH0gZmluYWxseSB7XG5cdFx0dW5zZXRDb250ZXh0KClcblx0fVxufVxuXG4vKipcblJldHVybnMgYSB7QGxpbmsgTXNBc3R9IHJhdGhlciB0aGFuIHRyYW5zcGlsaW5nIGl0IHRvIEphdmFTY3JpcHQuXG5QYXJhbWV0ZXJzIGFyZSB0aGUgc2FtZSBhcyBgY29tcGlsZWAuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXN0KHNvdXJjZSwgb3B0cz17fSkge1xuXHR0eXBlKHNvdXJjZSwgU3RyaW5nKVxuXHRzZXRDb250ZXh0KG9wdHMpXG5cdHRyeSB7XG5cdFx0Y29uc3QgYXN0ID0gcGFyc2UobGV4KHNvdXJjZSkpXG5cdFx0dmVyaWZ5KGFzdClcblx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHQ6IGFzdH1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRpZiAoIShlcnJvciBpbnN0YW5jZW9mIENvbXBpbGVFcnJvcikpXG5cdFx0XHR0aHJvdyBlcnJvclxuXHRcdHJldHVybiB7d2FybmluZ3MsIHJlc3VsdDogZXJyb3J9XG5cdH0gZmluYWxseSB7XG5cdFx0dW5zZXRDb250ZXh0KClcblx0fVxufVxuIl19
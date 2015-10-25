(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', './CompileError', './private/context', './private/lex', './private/parse/parse', './private/render', './private/transpile/transpile', './private/util', './private/verify/verify'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('./CompileError'), require('./private/context'), require('./private/lex'), require('./private/parse/parse'), require('./private/render'), require('./private/transpile/transpile'), require('./private/util'), require('./private/verify/verify'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.lex, global.parse, global.render, global.transpile, global.util, global.verify);
		global.compile = mod.exports;
	}
})(this, function (exports, _CompileError, _privateContext, _privateLex, _privateParseParse, _privateRender, _privateTranspileTranspile, _privateUtil, _privateVerifyVerify) {
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

	var _verify = _interopRequireDefault(_privateVerifyVerify);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21waWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQ3dCLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBaEIsVUFBUyxPQUFPLENBQUMsTUFBTSxFQUFXO01BQVQsSUFBSSx5REFBQyxFQUFFOztBQUM5QyxtQkE3Qk8sSUFBSSxFQTZCTixNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDcEIsc0JBbkNPLFVBQVUsRUFtQ04sSUFBSSxDQUFDLENBQUE7QUFDaEIsTUFBSTtBQUNILFNBQU0sR0FBRyxHQUFHLG9CQUFNLGtCQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDOUIsU0FBTSxLQUFLLEdBQUcsd0JBQVUsR0FBRyxFQUFFLHFCQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDekMsVUFBTyxFQUFDLFFBQVEsa0JBdkNnQixRQUFRLEFBdUN4QixFQUFFLE1BQU0sRUFBRSxxQkFBTyxLQUFLLENBQUMsRUFBQyxDQUFBO0dBQ3hDLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZixPQUFJLEVBQUUsS0FBSyxtQ0FBd0IsQUFBQyxFQUNuQyxNQUFNLEtBQUssQ0FBQTtBQUNaLFVBQU8sRUFBQyxRQUFRLGtCQTNDZ0IsUUFBUSxBQTJDeEIsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDLENBQUE7R0FDaEMsU0FBUztBQUNULHVCQTdDa0IsWUFBWSxHQTZDaEIsQ0FBQTtHQUNkO0VBQ0Q7Ozs7Ozs7QUFNTSxVQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQVc7TUFBVCxJQUFJLHlEQUFDLEVBQUU7O0FBQ3ZDLG1CQWpETyxJQUFJLEVBaUROLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNwQixzQkF2RE8sVUFBVSxFQXVETixJQUFJLENBQUMsQ0FBQTtBQUNoQixNQUFJO0FBQ0gsU0FBTSxHQUFHLEdBQUcsb0JBQU0sa0JBQUksTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUM5Qix3QkFBTyxHQUFHLENBQUMsQ0FBQTtBQUNYLFVBQU8sRUFBQyxRQUFRLGtCQTNEZ0IsUUFBUSxBQTJEeEIsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFDLENBQUE7R0FDOUIsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNmLE9BQUksRUFBRSxLQUFLLG1DQUF3QixBQUFDLEVBQ25DLE1BQU0sS0FBSyxDQUFBO0FBQ1osVUFBTyxFQUFDLFFBQVEsa0JBL0RnQixRQUFRLEFBK0R4QixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQTtHQUNoQyxTQUFTO0FBQ1QsdUJBakVrQixZQUFZLEdBaUVoQixDQUFBO0dBQ2Q7RUFDRCIsImZpbGUiOiJjb21waWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbXBpbGVFcnJvciBmcm9tICcuL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7c2V0Q29udGV4dCwgdW5zZXRDb250ZXh0LCB3YXJuaW5nc30gZnJvbSAnLi9wcml2YXRlL2NvbnRleHQnXG5pbXBvcnQgbGV4IGZyb20gJy4vcHJpdmF0ZS9sZXgnXG5pbXBvcnQgcGFyc2UgZnJvbSAnLi9wcml2YXRlL3BhcnNlL3BhcnNlJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3ByaXZhdGUvcmVuZGVyJ1xuaW1wb3J0IHRyYW5zcGlsZSBmcm9tICcuL3ByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZSdcbmltcG9ydCB7dHlwZX0gZnJvbSAnLi9wcml2YXRlL3V0aWwnXG5pbXBvcnQgdmVyaWZ5IGZyb20gJy4vcHJpdmF0ZS92ZXJpZnkvdmVyaWZ5J1xuXG4vKipcbkBwYXJhbSB7c3RyaW5nfSBzb3VyY2UgTWFzb24gc291cmNlIGNvZGUgZm9yIGEgc2luZ2xlIG1vZHVsZS5cbkBwYXJhbSB7b2JqZWN0fSBvcHRzXG5AcGFyYW0geydcXHQnfE51bWJlcn0gW29wdHMuaW5kZW50PSdcXHQnXVxuXHRNYXNvbiBkb2VzIG5vdCBhbGxvdyBtaXhlZCBraW5kcyBvZiBpbmRlbnRhdGlvbixcblx0c28gaW5kZW50IHR5cGUgbXVzdCBiZSBzZXQgb25jZSBoZXJlIGFuZCB1c2VkIGNvbnNpc3RlbnRseS5cblx0SWYgJ1xcdCcsIHVzZSB0YWJzIHRvIGluZGVudC5cblx0SWYgYSBOdW1iZXIsIGluZGVudCB3aXRoIHRoYXQgbWFueSBzcGFjZXMuIFNob3VsZCBiZSBhbiBpbnQgMiB0aHJvdWdoIDguXG5AcGFyYW0ge2Jvb2xlYW59IFtvcHRzLm1zbFBhdGg9J21zbCddXG5cdFBhdGggdG8gYG1zbGAuIFRoaXMgbWF5IGJlIGBtc2wvZGlzdGAuXG5AcGFyYW0ge2Jvb2xlYW59IFtvcHRzLmNoZWNrcz10cnVlXVxuXHRJZiBmYWxzZSwgbGVhdmUgb3V0IHR5cGUgY2hlY2tzIGFuZCBhc3NlcnRpb25zLlxuQHBhcmFtIHtib29sZWFufSBbb3B0cy5pbmNsdWRlU291cmNlTWFwPXRydWVdIFNlZSBAcmV0dXJuIGZvciBkZXNjcmlwdGlvbi5cbkBwYXJhbSB7Ym9vbGVufSBbb3B0cy5pbXBvcnRCb290PXRydWVdXG5cdE1vc3QgbWFzb24gbW9kdWxlcyBpbmNsdWRlIGBtc2wvcHJpdmF0ZS9ib290YCwgd2hpY2ggYG1zbGAuXG5cdElmIHlvdSBkb24ndCB3YW50IHRvIGRvIHRoaXMsIG11Y2ggb2YgdGhlIGxhbmd1YWdlIHdpbGwgbm90IHdvcmsuXG5cdFRoaXMgaXMgb25seSBpbnRlbmRlZCBmb3IgY29tcGlsaW5nIGBtc2xgIGl0c2VsZi5cbkByZXR1cm4ge3t3YXJuaW5nczogQXJyYXk8V2FybmluZz4sIHJlc3VsdDogQ29tcGlsZUVycm9yfHN0cmluZ3x7Y29kZTogc3RyaW5nLCBzb3VyY2VNYXA6IHN0cmluZ319fVxuXHRgQ29tcGlsZUVycm9yYHMgYXJlIG5vdCB0aHJvd24sIGJ1dCByZXR1cm5lZC5cblx0VGhpcyBhbGxvd3MgdXMgdG8gcmV0dXJuIGB3YXJuaW5nc2AgYXMgd2VsbC5cblxuXHRJZiB0aGVyZSBpcyBubyBlcnJvcjpcblx0YHJlc3VsdGAgd2lsbCBiZSBge2NvZGU6IHN0cmluZywgc291cmNlTWFwOiBzdHJpbmd9YCBpZiBgb3B0cy5pbmNsdWRlU291cmNlTWFwYC5cblx0T3RoZXJ3aXNlLCBpdCB3aWxsIGp1c3QgYmUgdGhlIGNvZGUgKGEgc3RyaW5nKS5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb21waWxlKHNvdXJjZSwgb3B0cz17fSkge1xuXHR0eXBlKHNvdXJjZSwgU3RyaW5nKVxuXHRzZXRDb250ZXh0KG9wdHMpXG5cdHRyeSB7XG5cdFx0Y29uc3QgYXN0ID0gcGFyc2UobGV4KHNvdXJjZSkpXG5cdFx0Y29uc3QgZXNBc3QgPSB0cmFuc3BpbGUoYXN0LCB2ZXJpZnkoYXN0KSlcblx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHQ6IHJlbmRlcihlc0FzdCl9XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0aWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBDb21waWxlRXJyb3IpKVxuXHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHQ6IGVycm9yfVxuXHR9IGZpbmFsbHkge1xuXHRcdHVuc2V0Q29udGV4dCgpXG5cdH1cbn1cblxuLyoqXG5SZXR1cm5zIGEge0BsaW5rIE1zQXN0fSByYXRoZXIgdGhhbiB0cmFuc3BpbGluZyBpdCB0byBKYXZhU2NyaXB0LlxuUGFyYW1ldGVycyBhcmUgdGhlIHNhbWUgYXMgYGNvbXBpbGVgLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFzdChzb3VyY2UsIG9wdHM9e30pIHtcblx0dHlwZShzb3VyY2UsIFN0cmluZylcblx0c2V0Q29udGV4dChvcHRzKVxuXHR0cnkge1xuXHRcdGNvbnN0IGFzdCA9IHBhcnNlKGxleChzb3VyY2UpKVxuXHRcdHZlcmlmeShhc3QpXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0OiBhc3R9XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0aWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBDb21waWxlRXJyb3IpKVxuXHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRyZXR1cm4ge3dhcm5pbmdzLCByZXN1bHQ6IGVycm9yfVxuXHR9IGZpbmFsbHkge1xuXHRcdHVuc2V0Q29udGV4dCgpXG5cdH1cbn1cbiJdfQ==
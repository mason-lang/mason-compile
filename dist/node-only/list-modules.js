if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', 'esast/dist/render', 'q-io/fs', 'path', '../MsAst', '../private/CompileContext', '../private/CompileOptions', '../private/transpile/transpile', '../private/util', '../private/VerifyResults'], function (exports, module, _esastDistLoc, _esastDistRender, _qIoFs, _path, _MsAst, _privateCompileContext, _privateCompileOptions, _privateTranspileTranspile, _privateUtil, _privateVerifyResults) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _render = _interopRequireDefault(_esastDistRender);

	var _fs = _interopRequireDefault(_qIoFs);

	var _CompileContext = _interopRequireDefault(_privateCompileContext);

	var _CompileOptions = _interopRequireDefault(_privateCompileOptions);

	var _transpile = _interopRequireDefault(_privateTranspileTranspile);

	var _VerifyResults = _interopRequireDefault(_privateVerifyResults);

	// Searches a directory and creates a module whose default export is
	// a list of the paths of every module in that directory, relative to it.

	module.exports = (dirPath, opts) => _fs.default.listTree(dirPath).then(files => {
		const moduleFiles = (0, _privateUtil.flatOpMap)(files, _ => (0, _privateUtil.opIf)(acceptModule(opts, _), () => `./${ (0, _path.relative)(dirPath, _.slice(0, _.length - ext.length)) }`));
		// Sort to keep it deterministic.
		moduleFiles.sort();
		// Dummy Loc. We will not use source maps.
		const loc = (0, _esastDistLoc.singleCharLoc)(_esastDistLoc.StartPos);
		// Sort to keep it deterministic.
		const modulesBag = (0, _MsAst.BagSimple)(loc, moduleFiles.map(_ => _MsAst.Quote.forString(loc, _)));
		const module = (0, _MsAst.Module)(loc, [], [], [], [], [], modulesBag);
		return (0, _render.default)((0, _transpile.default)(new _CompileContext.default(options), module, new _VerifyResults.default()));
	});

	const ext = '.js';
	const acceptModule = (opts, path) => path.endsWith(ext) && !(opts.exclude && opts.exclude.test(path));
	const options = new _CompileOptions.default({
		includeSourceMap: false,
		includeModuleName: false
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGUtb25seS9saXN0LW1vZHVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBYWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUM1QixZQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJO0FBQ2xDLFFBQU0sV0FBVyxHQUFHLGlCQVBiLFNBQVMsRUFPYyxLQUFLLEVBQUUsQ0FBQyxJQUNyQyxpQkFSaUIsSUFBSSxFQVFoQixZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQzNCLENBQUMsRUFBRSxHQUFFLFVBZEEsUUFBUSxFQWNDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRS9ELGFBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFbEIsUUFBTSxHQUFHLEdBQUcsa0JBckJMLGFBQWEsZ0JBQUUsUUFBUSxDQXFCSyxDQUFBOztBQUVuQyxRQUFNLFVBQVUsR0FBRyxXQW5CWixTQUFTLEVBbUJhLEdBQUcsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxPQW5CN0IsS0FBSyxDQW1COEIsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEYsUUFBTSxNQUFNLEdBQUcsV0FwQkcsTUFBTSxFQW9CRixHQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUMvRCxTQUFPLHFCQUFPLHdCQUFVLDRCQUFtQixPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsNEJBQW1CLENBQUMsQ0FBQyxDQUFBO0VBQ2xGLENBQUM7O0FBRUgsT0FBTSxHQUFHLEdBQUcsS0FBSyxDQUFBO0FBQ2pCLE9BQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksS0FDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFBO0FBQ2pFLE9BQU0sT0FBTyxHQUFHLDRCQUFtQjtBQUNsQyxrQkFBZ0IsRUFBRSxLQUFLO0FBQ3ZCLG1CQUFpQixFQUFFLEtBQUs7RUFDeEIsQ0FBQyxDQUFBIiwiZmlsZSI6Im5vZGUtb25seS9saXN0LW1vZHVsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaW5nbGVDaGFyTG9jLCBTdGFydFBvcyB9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHJlbmRlciBmcm9tICdlc2FzdC9kaXN0L3JlbmRlcidcbmltcG9ydCBmcyBmcm9tICdxLWlvL2ZzJ1xuaW1wb3J0IHsgcmVsYXRpdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgQmFnU2ltcGxlLCBNb2R1bGUsIFF1b3RlIH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQgQ29tcGlsZUNvbnRleHQgZnJvbSAnLi4vcHJpdmF0ZS9Db21waWxlQ29udGV4dCdcbmltcG9ydCBDb21waWxlT3B0aW9ucyBmcm9tICcuLi9wcml2YXRlL0NvbXBpbGVPcHRpb25zJ1xuaW1wb3J0IHRyYW5zcGlsZSBmcm9tICcuLi9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGUnXG5pbXBvcnQgeyBmbGF0T3BNYXAsIG9wSWYgfSBmcm9tICcuLi9wcml2YXRlL3V0aWwnXG5pbXBvcnQgVmVyaWZ5UmVzdWx0cyBmcm9tICcuLi9wcml2YXRlL1ZlcmlmeVJlc3VsdHMnXG5cbi8vIFNlYXJjaGVzIGEgZGlyZWN0b3J5IGFuZCBjcmVhdGVzIGEgbW9kdWxlIHdob3NlIGRlZmF1bHQgZXhwb3J0IGlzXG4vLyBhIGxpc3Qgb2YgdGhlIHBhdGhzIG9mIGV2ZXJ5IG1vZHVsZSBpbiB0aGF0IGRpcmVjdG9yeSwgcmVsYXRpdmUgdG8gaXQuXG5leHBvcnQgZGVmYXVsdCAoZGlyUGF0aCwgb3B0cykgPT5cblx0ZnMubGlzdFRyZWUoZGlyUGF0aCkudGhlbihmaWxlcyA9PiB7XG5cdFx0Y29uc3QgbW9kdWxlRmlsZXMgPSBmbGF0T3BNYXAoZmlsZXMsIF8gPT5cblx0XHRcdG9wSWYoYWNjZXB0TW9kdWxlKG9wdHMsIF8pLCAoKSA9PlxuXHRcdFx0XHRgLi8ke3JlbGF0aXZlKGRpclBhdGgsIF8uc2xpY2UoMCwgXy5sZW5ndGggLSBleHQubGVuZ3RoKSl9YCkpXG5cdFx0Ly8gU29ydCB0byBrZWVwIGl0IGRldGVybWluaXN0aWMuXG5cdFx0bW9kdWxlRmlsZXMuc29ydCgpXG5cdFx0Ly8gRHVtbXkgTG9jLiBXZSB3aWxsIG5vdCB1c2Ugc291cmNlIG1hcHMuXG5cdFx0Y29uc3QgbG9jID0gc2luZ2xlQ2hhckxvYyhTdGFydFBvcylcblx0XHQvLyBTb3J0IHRvIGtlZXAgaXQgZGV0ZXJtaW5pc3RpYy5cblx0XHRjb25zdCBtb2R1bGVzQmFnID0gQmFnU2ltcGxlKGxvYywgbW9kdWxlRmlsZXMubWFwKF8gPT4gUXVvdGUuZm9yU3RyaW5nKGxvYywgXykpKVxuXHRcdGNvbnN0IG1vZHVsZSA9IE1vZHVsZShsb2MsIFsgXSwgWyBdLCBbIF0sIFsgXSwgWyBdLCBtb2R1bGVzQmFnKVxuXHRcdHJldHVybiByZW5kZXIodHJhbnNwaWxlKG5ldyBDb21waWxlQ29udGV4dChvcHRpb25zKSwgbW9kdWxlLCBuZXcgVmVyaWZ5UmVzdWx0cygpKSlcblx0fSlcblxuY29uc3QgZXh0ID0gJy5qcydcbmNvbnN0IGFjY2VwdE1vZHVsZSA9IChvcHRzLCBwYXRoKSA9PlxuXHRwYXRoLmVuZHNXaXRoKGV4dCkgJiYgIShvcHRzLmV4Y2x1ZGUgJiYgb3B0cy5leGNsdWRlLnRlc3QocGF0aCkpXG5jb25zdCBvcHRpb25zID0gbmV3IENvbXBpbGVPcHRpb25zKHtcblx0aW5jbHVkZVNvdXJjZU1hcDogZmFsc2UsXG5cdGluY2x1ZGVNb2R1bGVOYW1lOiBmYWxzZVxufSlcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
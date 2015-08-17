if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', 'esast/dist/render', 'q-io/fs', 'path', '../private/MsAst', '../private/CompileContext', '../private/CompileOptions', '../private/transpile/transpile', '../private/util', '../private/VerifyResults'], function (exports, module, _esastDistLoc, _esastDistRender, _qIoFs, _path, _privateMsAst, _privateCompileContext, _privateCompileOptions, _privateTranspileTranspile, _privateUtil, _privateVerifyResults) {
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
		const modulesBag = new _privateMsAst.BagSimple(loc, moduleFiles.map(_ => _privateMsAst.Quote.forString(loc, _)));
		const module = new _privateMsAst.Module(loc, [], [], [], [], [], modulesBag);
		return (0, _render.default)((0, _transpile.default)(new _CompileContext.default(options), module, new _VerifyResults.default()));
	});

	const ext = '.js';
	const acceptModule = (opts, path) => path.endsWith(ext) && !(opts.exclude && opts.exclude.test(path));
	const options = new _CompileOptions.default({
		includeSourceMap: false,
		includeModuleName: false
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGUtb25seS9saXN0LW1vZHVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBYWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUM1QixZQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJO0FBQ2xDLFFBQU0sV0FBVyxHQUFHLGlCQVBiLFNBQVMsRUFPYyxLQUFLLEVBQUUsQ0FBQyxJQUNyQyxpQkFSaUIsSUFBSSxFQVFoQixZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQzNCLENBQUMsRUFBRSxHQUFFLFVBZEEsUUFBUSxFQWNDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRS9ELGFBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFbEIsUUFBTSxHQUFHLEdBQUcsa0JBckJMLGFBQWEsZ0JBQUUsUUFBUSxDQXFCSyxDQUFBOztBQUVuQyxRQUFNLFVBQVUsR0FBRyxrQkFuQlosU0FBUyxDQW1CaUIsR0FBRyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLGNBbkJqQyxLQUFLLENBbUJrQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNwRixRQUFNLE1BQU0sR0FBRyxrQkFwQkcsTUFBTSxDQW9CRSxHQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUNuRSxTQUFPLHFCQUFPLHdCQUFVLDRCQUFtQixPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsNEJBQW1CLENBQUMsQ0FBQyxDQUFBO0VBQ2xGLENBQUM7O0FBRUgsT0FBTSxHQUFHLEdBQUcsS0FBSyxDQUFBO0FBQ2pCLE9BQU0sWUFBWSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksS0FDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFBO0FBQ2pFLE9BQU0sT0FBTyxHQUFHLDRCQUFtQjtBQUNsQyxrQkFBZ0IsRUFBRSxLQUFLO0FBQ3ZCLG1CQUFpQixFQUFFLEtBQUs7RUFDeEIsQ0FBQyxDQUFBIiwiZmlsZSI6Im5vZGUtb25seS9saXN0LW1vZHVsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaW5nbGVDaGFyTG9jLCBTdGFydFBvcyB9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHJlbmRlciBmcm9tICdlc2FzdC9kaXN0L3JlbmRlcidcbmltcG9ydCBmcyBmcm9tICdxLWlvL2ZzJ1xuaW1wb3J0IHsgcmVsYXRpdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgQmFnU2ltcGxlLCBNb2R1bGUsIFF1b3RlIH0gZnJvbSAnLi4vcHJpdmF0ZS9Nc0FzdCdcbmltcG9ydCBDb21waWxlQ29udGV4dCBmcm9tICcuLi9wcml2YXRlL0NvbXBpbGVDb250ZXh0J1xuaW1wb3J0IENvbXBpbGVPcHRpb25zIGZyb20gJy4uL3ByaXZhdGUvQ29tcGlsZU9wdGlvbnMnXG5pbXBvcnQgdHJhbnNwaWxlIGZyb20gJy4uL3ByaXZhdGUvdHJhbnNwaWxlL3RyYW5zcGlsZSdcbmltcG9ydCB7IGZsYXRPcE1hcCwgb3BJZiB9IGZyb20gJy4uL3ByaXZhdGUvdXRpbCdcbmltcG9ydCBWZXJpZnlSZXN1bHRzIGZyb20gJy4uL3ByaXZhdGUvVmVyaWZ5UmVzdWx0cydcblxuLy8gU2VhcmNoZXMgYSBkaXJlY3RvcnkgYW5kIGNyZWF0ZXMgYSBtb2R1bGUgd2hvc2UgZGVmYXVsdCBleHBvcnQgaXNcbi8vIGEgbGlzdCBvZiB0aGUgcGF0aHMgb2YgZXZlcnkgbW9kdWxlIGluIHRoYXQgZGlyZWN0b3J5LCByZWxhdGl2ZSB0byBpdC5cbmV4cG9ydCBkZWZhdWx0IChkaXJQYXRoLCBvcHRzKSA9PlxuXHRmcy5saXN0VHJlZShkaXJQYXRoKS50aGVuKGZpbGVzID0+IHtcblx0XHRjb25zdCBtb2R1bGVGaWxlcyA9IGZsYXRPcE1hcChmaWxlcywgXyA9PlxuXHRcdFx0b3BJZihhY2NlcHRNb2R1bGUob3B0cywgXyksICgpID0+XG5cdFx0XHRcdGAuLyR7cmVsYXRpdmUoZGlyUGF0aCwgXy5zbGljZSgwLCBfLmxlbmd0aCAtIGV4dC5sZW5ndGgpKX1gKSlcblx0XHQvLyBTb3J0IHRvIGtlZXAgaXQgZGV0ZXJtaW5pc3RpYy5cblx0XHRtb2R1bGVGaWxlcy5zb3J0KClcblx0XHQvLyBEdW1teSBMb2MuIFdlIHdpbGwgbm90IHVzZSBzb3VyY2UgbWFwcy5cblx0XHRjb25zdCBsb2MgPSBzaW5nbGVDaGFyTG9jKFN0YXJ0UG9zKVxuXHRcdC8vIFNvcnQgdG8ga2VlcCBpdCBkZXRlcm1pbmlzdGljLlxuXHRcdGNvbnN0IG1vZHVsZXNCYWcgPSBuZXcgQmFnU2ltcGxlKGxvYywgbW9kdWxlRmlsZXMubWFwKF8gPT4gUXVvdGUuZm9yU3RyaW5nKGxvYywgXykpKVxuXHRcdGNvbnN0IG1vZHVsZSA9IG5ldyBNb2R1bGUobG9jLCBbIF0sIFsgXSwgWyBdLCBbIF0sIFsgXSwgbW9kdWxlc0JhZylcblx0XHRyZXR1cm4gcmVuZGVyKHRyYW5zcGlsZShuZXcgQ29tcGlsZUNvbnRleHQob3B0aW9ucyksIG1vZHVsZSwgbmV3IFZlcmlmeVJlc3VsdHMoKSkpXG5cdH0pXG5cbmNvbnN0IGV4dCA9ICcuanMnXG5jb25zdCBhY2NlcHRNb2R1bGUgPSAob3B0cywgcGF0aCkgPT5cblx0cGF0aC5lbmRzV2l0aChleHQpICYmICEob3B0cy5leGNsdWRlICYmIG9wdHMuZXhjbHVkZS50ZXN0KHBhdGgpKVxuY29uc3Qgb3B0aW9ucyA9IG5ldyBDb21waWxlT3B0aW9ucyh7XG5cdGluY2x1ZGVTb3VyY2VNYXA6IGZhbHNlLFxuXHRpbmNsdWRlTW9kdWxlTmFtZTogZmFsc2Vcbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/render'], function (exports, module, _esastDistRender) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _render = _interopRequireDefault(_esastDistRender);

	module.exports = (context, esAst) => context.opts.includeSourceMap() ? (0, _esastDistRender.renderWithSourceMap)(esAst, context.opts.modulePath(), `./${ context.opts.jsBaseName() }`) : (0, _render.default)(esAst);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlci5qcyIsInByaXZhdGUvcmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O2tCQ0VlLENBQUMsT0FBTyxFQUFFLEtBQUssS0FDN0IsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUM5QixxQkFKYyxtQkFBbUIsRUFJYixLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFDLENBQUMsQ0FBQyxHQUN2RixxQkFBTyxLQUFLLENBQUMiLCJmaWxlIjoicHJpdmF0ZS9yZW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCByZW5kZXIsIHtyZW5kZXJXaXRoU291cmNlTWFwfSBmcm9tICdlc2FzdC9kaXN0L3JlbmRlcidcblxuZXhwb3J0IGRlZmF1bHQgKGNvbnRleHQsIGVzQXN0KSA9PlxuXHRjb250ZXh0Lm9wdHMuaW5jbHVkZVNvdXJjZU1hcCgpID9cblx0XHRyZW5kZXJXaXRoU291cmNlTWFwKGVzQXN0LCBjb250ZXh0Lm9wdHMubW9kdWxlUGF0aCgpLCBgLi8ke2NvbnRleHQub3B0cy5qc0Jhc2VOYW1lKCl9YCkgOlxuXHRcdHJlbmRlcihlc0FzdClcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

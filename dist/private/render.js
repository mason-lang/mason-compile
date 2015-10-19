if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/render', './context'], function (exports, module, _esastDistRender, _context) {
	'use strict';

	module.exports = render;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _esRender = _interopRequireDefault(_esastDistRender);

	/** Renders the transpiled Ast. */

	function render(esAst) {
		return _context.options.includeSourceMap() ? (0, _esastDistRender.renderWithSourceMap)(esAst, _context.options.modulePath(), `./${ _context.options.jsBaseName() }`) : (0, _esRender.default)(esAst);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlci5qcyIsInByaXZhdGUvcmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7a0JDSXdCLE1BQU07Ozs7Ozs7O0FBQWYsVUFBUyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ3JDLFNBQU8sU0FKQSxPQUFPLENBSUMsZ0JBQWdCLEVBQUUsR0FDaEMscUJBTmdCLG1CQUFtQixFQU1mLEtBQUssRUFBRSxTQUxyQixPQUFPLENBS3NCLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFFLFNBTGhELE9BQU8sQ0FLaUQsVUFBVSxFQUFFLEVBQUMsQ0FBQyxDQUFDLEdBQzdFLHVCQUFTLEtBQUssQ0FBQyxDQUFBO0VBQ2hCIiwiZmlsZSI6InByaXZhdGUvcmVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgZXNSZW5kZXIsIHtyZW5kZXJXaXRoU291cmNlTWFwfSBmcm9tICdlc2FzdC9kaXN0L3JlbmRlcidcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi9jb250ZXh0J1xuXG4vKiogUmVuZGVycyB0aGUgdHJhbnNwaWxlZCBBc3QuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIoZXNBc3QpIHtcblx0cmV0dXJuIG9wdGlvbnMuaW5jbHVkZVNvdXJjZU1hcCgpID9cblx0XHRyZW5kZXJXaXRoU291cmNlTWFwKGVzQXN0LCBvcHRpb25zLm1vZHVsZVBhdGgoKSwgYC4vJHtvcHRpb25zLmpzQmFzZU5hbWUoKX1gKSA6XG5cdFx0ZXNSZW5kZXIoZXNBc3QpXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

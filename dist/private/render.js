if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/render', './context'], function (exports, module, _esastDistRender, _context) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _render = _interopRequireDefault(_esastDistRender);

	module.exports = esAst => _context.options.includeSourceMap() ? (0, _esastDistRender.renderWithSourceMap)(esAst, _context.options.modulePath(), `./${ _context.options.jsBaseName() }`) : (0, _render.default)(esAst);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbmRlci5qcyIsInByaXZhdGUvcmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O2tCQ0dlLEtBQUssSUFDbkIsU0FITyxPQUFPLENBR04sZ0JBQWdCLEVBQUUsR0FDekIscUJBTGMsbUJBQW1CLEVBS2IsS0FBSyxFQUFFLFNBSnJCLE9BQU8sQ0FJc0IsVUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUUsU0FKaEQsT0FBTyxDQUlpRCxVQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsR0FDN0UscUJBQU8sS0FBSyxDQUFDIiwiZmlsZSI6InByaXZhdGUvcmVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgcmVuZGVyLCB7cmVuZGVyV2l0aFNvdXJjZU1hcH0gZnJvbSAnZXNhc3QvZGlzdC9yZW5kZXInXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4vY29udGV4dCdcblxuZXhwb3J0IGRlZmF1bHQgZXNBc3QgPT5cblx0b3B0aW9ucy5pbmNsdWRlU291cmNlTWFwKCkgP1xuXHRcdHJlbmRlcldpdGhTb3VyY2VNYXAoZXNBc3QsIG9wdGlvbnMubW9kdWxlUGF0aCgpLCBgLi8ke29wdGlvbnMuanNCYXNlTmFtZSgpfWApIDpcblx0XHRyZW5kZXIoZXNBc3QpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', 'esast/dist/render', './context'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('esast/dist/render'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.esRender, global.context);
		global.render = mod.exports;
	}
})(this, function (exports, module, _esastDistRender, _context) {
	'use strict';

	module.exports = render;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _esRender = _interopRequireDefault(_esastDistRender);

	/** Renders the transpiled Ast. */

	function render(esAst) {
		return _context.options.includeSourceMap() ? (0, _esastDistRender.renderWithSourceMap)(esAst, _context.options.modulePath(), `./${ _context.options.jsBaseName() }`) : (0, _esRender.default)(esAst);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL3JlbmRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBSXdCLE1BQU07Ozs7Ozs7O0FBQWYsVUFBUyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ3JDLFNBQU8sU0FKQSxPQUFPLENBSUMsZ0JBQWdCLEVBQUUsR0FDaEMscUJBTmdCLG1CQUFtQixFQU1mLEtBQUssRUFBRSxTQUxyQixPQUFPLENBS3NCLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFFLFNBTGhELE9BQU8sQ0FLaUQsVUFBVSxFQUFFLEVBQUMsQ0FBQyxDQUFDLEdBQzdFLHVCQUFTLEtBQUssQ0FBQyxDQUFBO0VBQ2hCIiwiZmlsZSI6InJlbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBlc1JlbmRlciwge3JlbmRlcldpdGhTb3VyY2VNYXB9IGZyb20gJ2VzYXN0L2Rpc3QvcmVuZGVyJ1xuaW1wb3J0IHtvcHRpb25zfSBmcm9tICcuL2NvbnRleHQnXG5cbi8qKiBSZW5kZXJzIHRoZSB0cmFuc3BpbGVkIEFzdC4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlcihlc0FzdCkge1xuXHRyZXR1cm4gb3B0aW9ucy5pbmNsdWRlU291cmNlTWFwKCkgP1xuXHRcdHJlbmRlcldpdGhTb3VyY2VNYXAoZXNBc3QsIG9wdGlvbnMubW9kdWxlUGF0aCgpLCBgLi8ke29wdGlvbnMuanNCYXNlTmFtZSgpfWApIDpcblx0XHRlc1JlbmRlcihlc0FzdClcbn1cbiJdfQ==
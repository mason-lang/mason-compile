'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/render', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/render'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.render, global.context);
		global.render = mod.exports;
	}
})(this, function (exports, _render, _context) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = render;

	var _render2 = _interopRequireDefault(_render);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function render(esAst) {
		return _context.options.includeSourceMap() ? (0, _render.renderWithSourceMap)(esAst, _context.options.modulePath(), `./${ _context.options.jsBaseName() }`) : (0, _render2.default)(esAst);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL3JlbmRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBSXdCLE1BQU07Ozs7Ozs7Ozs7VUFBTixNQUFNIiwiZmlsZSI6InJlbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBlc1JlbmRlciwge3JlbmRlcldpdGhTb3VyY2VNYXB9IGZyb20gJ2VzYXN0L2Rpc3QvcmVuZGVyJ1xuaW1wb3J0IHtvcHRpb25zfSBmcm9tICcuL2NvbnRleHQnXG5cbi8qKiBSZW5kZXJzIHRoZSB0cmFuc3BpbGVkIEFzdC4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlcihlc0FzdCkge1xuXHRyZXR1cm4gb3B0aW9ucy5pbmNsdWRlU291cmNlTWFwKCkgP1xuXHRcdHJlbmRlcldpdGhTb3VyY2VNYXAoZXNBc3QsIG9wdGlvbnMubW9kdWxlUGF0aCgpLCBgLi8ke29wdGlvbnMuanNCYXNlTmFtZSgpfWApIDpcblx0XHRlc1JlbmRlcihlc0FzdClcbn1cbiJdfQ==
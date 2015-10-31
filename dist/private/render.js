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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function render(esAst) {
		return _context.options.includeSourceMap() ? (0, _render.renderWithSourceMap)(esAst, _context.options.modulePath(), `./${ _context.options.jsBaseName() }`) : (0, _render2.default)(esAst);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL3JlbmRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBSXdCLE1BQU07Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGVzUmVuZGVyLCB7cmVuZGVyV2l0aFNvdXJjZU1hcH0gZnJvbSAnZXNhc3QvZGlzdC9yZW5kZXInXG5pbXBvcnQge29wdGlvbnN9IGZyb20gJy4vY29udGV4dCdcblxuLyoqIFJlbmRlcnMgdGhlIHRyYW5zcGlsZWQgQXN0LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyKGVzQXN0KSB7XG5cdHJldHVybiBvcHRpb25zLmluY2x1ZGVTb3VyY2VNYXAoKSA/XG5cdFx0cmVuZGVyV2l0aFNvdXJjZU1hcChlc0FzdCwgb3B0aW9ucy5tb2R1bGVQYXRoKCksIGAuLyR7b3B0aW9ucy5qc0Jhc2VOYW1lKCl9YCkgOlxuXHRcdGVzUmVuZGVyKGVzQXN0KVxufVxuIl19
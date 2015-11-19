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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJyZW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6W119
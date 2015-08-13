if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/render'], function (exports, module, _esastDistRender) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _render = _interopRequireDefault(_esastDistRender);

	module.exports = (context, esAst) => context.opts.includeSourceMap() ? (0, _esastDistRender.renderWithSourceMap)(esAst, context.opts.modulePath(), `./${ context.opts.jsBaseName() }`) : (0, _render.default)(esAst);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvcmVuZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7a0JBRWUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxLQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQzlCLHFCQUplLG1CQUFtQixFQUlkLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUMsQ0FBQyxDQUFDLEdBQ3ZGLHFCQUFPLEtBQUssQ0FBQyIsImZpbGUiOiJwcml2YXRlL3JlbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZW5kZXIsIHsgcmVuZGVyV2l0aFNvdXJjZU1hcCB9IGZyb20gJ2VzYXN0L2Rpc3QvcmVuZGVyJ1xuXG5leHBvcnQgZGVmYXVsdCAoY29udGV4dCwgZXNBc3QpID0+XG5cdGNvbnRleHQub3B0cy5pbmNsdWRlU291cmNlTWFwKCkgP1xuXHRcdHJlbmRlcldpdGhTb3VyY2VNYXAoZXNBc3QsIGNvbnRleHQub3B0cy5tb2R1bGVQYXRoKCksIGAuLyR7Y29udGV4dC5vcHRzLmpzQmFzZU5hbWUoKX1gKSA6XG5cdFx0cmVuZGVyKGVzQXN0KVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
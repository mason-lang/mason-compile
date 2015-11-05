'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', './groupContext', './lexPlain', './sourceContext', './loadLex*'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('./groupContext'), require('./lexPlain'), require('./sourceContext'), require('./loadLex*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.groupContext, global.lexPlain, global.sourceContext, global.loadLex);
		global.lex = mod.exports;
	}
})(this, function (exports, _Loc, _groupContext, _lexPlain, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lex;

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function lex(sourceString) {
		if (!sourceString.endsWith('\n')) sourceString = `${ sourceString }\n`;
		sourceString = `${ sourceString }\0`;
		(0, _groupContext.setupGroupContext)();
		(0, _sourceContext.setupSourceContext)(sourceString);
		(0, _groupContext.openLine)(_Loc.StartPos);
		(0, _lexPlain2.default)(false);
		const endPos = (0, _sourceContext.pos)();
		return (0, _groupContext.tearDownGroupContext)(endPos);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdCd0IsR0FBRzs7Ozs7O1VBQUgsR0FBRyIsImZpbGUiOiJsZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbG9hZExleConXG5pbXBvcnQge1BvcywgU3RhcnRQb3N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtvcGVuTGluZSwgc2V0dXBHcm91cENvbnRleHQsIHRlYXJEb3duR3JvdXBDb250ZXh0fSBmcm9tICcuL2dyb3VwQ29udGV4dCdcbmltcG9ydCBsZXhQbGFpbiBmcm9tICcuL2xleFBsYWluJ1xuaW1wb3J0IHtwb3MsIHNldHVwU291cmNlQ29udGV4dH0gZnJvbSAnLi9zb3VyY2VDb250ZXh0J1xuXG4vKipcbkxleGVzIHRoZSBzb3VyY2UgY29kZSBpbnRvIHtAbGluayBUb2tlbn1zLlxuVGhlIE1hc29uIGxleGVyIGFsc28gZ3JvdXBzIHRva2VucyBhcyBwYXJ0IG9mIGxleGluZy5cblRoaXMgbWFrZXMgd3JpdGluZyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciBlYXN5LlxuU2VlIHtAbGluayBHcm91cH0uXG5cbkBwYXJhbSB7c3RyaW5nfSBzb3VyY2VTdHJpbmdcbkByZXR1cm4ge0dyb3VwPEdyb3Vwcy5CbG9jaz59XG5cdEJsb2NrIHRva2VuIHJlcHJlc2VudGluZyB0aGUgd2hvbGUgbW9kdWxlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleChzb3VyY2VTdHJpbmcpIHtcblx0Ly8gQWxnb3JpdGhtIHJlcXVpcmVzIHRyYWlsaW5nIG5ld2xpbmUgdG8gY2xvc2UgYW55IGJsb2Nrcy5cblx0aWYgKCFzb3VyY2VTdHJpbmcuZW5kc1dpdGgoJ1xcbicpKVxuXHRcdHNvdXJjZVN0cmluZyA9IGAke3NvdXJjZVN0cmluZ31cXG5gXG5cblx0Lypcblx0VXNlIGEgMC10ZXJtaW5hdGVkIHN0cmluZyBzbyB0aGF0IHdlIGNhbiB1c2UgYDBgIGFzIGEgc3dpdGNoIGNhc2UgaW4gbGV4UGxhaW4uXG5cdFRoaXMgaXMgZmFzdGVyIHRoYW4gY2hlY2tpbmcgd2hldGhlciBpbmRleCA9PT0gbGVuZ3RoLlxuXHQoSWYgd2UgY2hlY2sgcGFzdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcgd2UgZ2V0IGBOYU5gLCB3aGljaCBjYW4ndCBiZSBzd2l0Y2hlZCBvbi4pXG5cdCovXG5cdHNvdXJjZVN0cmluZyA9IGAke3NvdXJjZVN0cmluZ31cXDBgXG5cblx0c2V0dXBHcm91cENvbnRleHQoKVxuXHRzZXR1cFNvdXJjZUNvbnRleHQoc291cmNlU3RyaW5nKVxuXG5cdG9wZW5MaW5lKFN0YXJ0UG9zKVxuXG5cdGxleFBsYWluKGZhbHNlKVxuXG5cdGNvbnN0IGVuZFBvcyA9IHBvcygpXG5cdHJldHVybiB0ZWFyRG93bkdyb3VwQ29udGV4dChlbmRQb3MpXG59XG4iXX0=
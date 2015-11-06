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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQWdCd0IsR0FBRzs7Ozs7O1VBQUgsR0FBRyIsImZpbGUiOiJsZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbG9hZExleConXG5pbXBvcnQge1N0YXJ0UG9zfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7b3BlbkxpbmUsIHNldHVwR3JvdXBDb250ZXh0LCB0ZWFyRG93bkdyb3VwQ29udGV4dH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQgbGV4UGxhaW4gZnJvbSAnLi9sZXhQbGFpbidcbmltcG9ydCB7cG9zLCBzZXR1cFNvdXJjZUNvbnRleHR9IGZyb20gJy4vc291cmNlQ29udGV4dCdcblxuLyoqXG5MZXhlcyB0aGUgc291cmNlIGNvZGUgaW50byB7QGxpbmsgVG9rZW59cy5cblRoZSBNYXNvbiBsZXhlciBhbHNvIGdyb3VwcyB0b2tlbnMgYXMgcGFydCBvZiBsZXhpbmcuXG5UaGlzIG1ha2VzIHdyaXRpbmcgYSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIgZWFzeS5cblNlZSB7QGxpbmsgR3JvdXB9LlxuXG5AcGFyYW0ge3N0cmluZ30gc291cmNlU3RyaW5nXG5AcmV0dXJuIHtHcm91cDxHcm91cHMuQmxvY2s+fVxuXHRCbG9jayB0b2tlbiByZXByZXNlbnRpbmcgdGhlIHdob2xlIG1vZHVsZS5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsZXgoc291cmNlU3RyaW5nKSB7XG5cdC8vIEFsZ29yaXRobSByZXF1aXJlcyB0cmFpbGluZyBuZXdsaW5lIHRvIGNsb3NlIGFueSBibG9ja3MuXG5cdGlmICghc291cmNlU3RyaW5nLmVuZHNXaXRoKCdcXG4nKSlcblx0XHRzb3VyY2VTdHJpbmcgPSBgJHtzb3VyY2VTdHJpbmd9XFxuYFxuXG5cdC8qXG5cdFVzZSBhIDAtdGVybWluYXRlZCBzdHJpbmcgc28gdGhhdCB3ZSBjYW4gdXNlIGAwYCBhcyBhIHN3aXRjaCBjYXNlIGluIGxleFBsYWluLlxuXHRUaGlzIGlzIGZhc3RlciB0aGFuIGNoZWNraW5nIHdoZXRoZXIgaW5kZXggPT09IGxlbmd0aC5cblx0KElmIHdlIGNoZWNrIHBhc3QgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIHdlIGdldCBgTmFOYCwgd2hpY2ggY2FuJ3QgYmUgc3dpdGNoZWQgb24uKVxuXHQqL1xuXHRzb3VyY2VTdHJpbmcgPSBgJHtzb3VyY2VTdHJpbmd9XFwwYFxuXG5cdHNldHVwR3JvdXBDb250ZXh0KClcblx0c2V0dXBTb3VyY2VDb250ZXh0KHNvdXJjZVN0cmluZylcblxuXHRvcGVuTGluZShTdGFydFBvcylcblxuXHRsZXhQbGFpbihmYWxzZSlcblxuXHRjb25zdCBlbmRQb3MgPSBwb3MoKVxuXHRyZXR1cm4gdGVhckRvd25Hcm91cENvbnRleHQoZW5kUG9zKVxufVxuIl19
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', './loadLex*', 'esast/dist/Loc', '../context', './groupContext', './lexPlain', './sourceContext'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('./loadLex*'), require('esast/dist/Loc'), require('../context'), require('./groupContext'), require('./lexPlain'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.loadLex, global.Loc, global.context, global.groupContext, global.lexPlain, global.sourceContext);
		global.lex = mod.exports;
	}
})(this, function (exports, module, _loadLex, _esastDistLoc, _context, _groupContext, _lexPlain, _sourceContext) {
	'use strict';

	module.exports = lex;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	/**
 Lexes the source code into {@link Token}s.
 The Mason lexer also groups tokens as part of lexing.
 This makes writing a recursive-descent parser easy.
 See {@link Group}.
 
 @param {string} sourceString
 @return {Group<Groups.Block>}
 	Block token representing the whole module.
 */

	function lex(sourceString) {
		// Algorithm requires trailing newline to close any blocks.
		(0, _context.check)(sourceString.endsWith('\n'), _esastDistLoc.StartLoc, 'Source code must end in newline.');

		/*
  Use a 0-terminated string so that we can use `0` as a switch case in lexPlain.
  This is faster than checking whether index === length.
  (If we check past the end of the string we get `NaN`, which can't be switched on.)
  */
		sourceString = `${ sourceString }\0`;

		(0, _groupContext.setupGroupContext)();
		(0, _sourceContext.setupSourceContext)(sourceString);

		(0, _groupContext.openLine)(_esastDistLoc.StartPos);

		(0, _lexPlain2.default)(false);

		const endPos = (0, _sourceContext.pos)();
		return (0, _groupContext.tearDownGroupContext)(endPos);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O2tCQWlCd0IsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBWixVQUFTLEdBQUcsQ0FBQyxZQUFZLEVBQUU7O0FBRXpDLGVBakJPLEtBQUssRUFpQk4sWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBbEIxQixRQUFRLEVBa0I4QixrQ0FBa0MsQ0FBQyxDQUFBOzs7Ozs7O0FBT2hGLGNBQVksR0FBRyxDQUFDLEdBQUUsWUFBWSxFQUFDLEVBQUUsQ0FBQyxDQUFBOztBQUVsQyxvQkF6QmlCLGlCQUFpQixHQXlCZixDQUFBO0FBQ25CLHFCQXhCWSxrQkFBa0IsRUF3QlgsWUFBWSxDQUFDLENBQUE7O0FBRWhDLG9CQTVCTyxRQUFRLGdCQUZFLFFBQVEsQ0E4QlAsQ0FBQTs7QUFFbEIsMEJBQVMsS0FBSyxDQUFDLENBQUE7O0FBRWYsUUFBTSxNQUFNLEdBQUcsbUJBOUJSLEdBQUcsR0E4QlUsQ0FBQTtBQUNwQixTQUFPLGtCQWpDNkIsb0JBQW9CLEVBaUM1QixNQUFNLENBQUMsQ0FBQTtFQUNuQyIsImZpbGUiOiJsZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbG9hZExleConXG5pbXBvcnQge1N0YXJ0TG9jLCBTdGFydFBvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtvcGVuTGluZSwgc2V0dXBHcm91cENvbnRleHQsIHRlYXJEb3duR3JvdXBDb250ZXh0fSBmcm9tICcuL2dyb3VwQ29udGV4dCdcbmltcG9ydCBsZXhQbGFpbiBmcm9tICcuL2xleFBsYWluJ1xuaW1wb3J0IHtwb3MsIHNldHVwU291cmNlQ29udGV4dH0gZnJvbSAnLi9zb3VyY2VDb250ZXh0J1xuXG4vKipcbkxleGVzIHRoZSBzb3VyY2UgY29kZSBpbnRvIHtAbGluayBUb2tlbn1zLlxuVGhlIE1hc29uIGxleGVyIGFsc28gZ3JvdXBzIHRva2VucyBhcyBwYXJ0IG9mIGxleGluZy5cblRoaXMgbWFrZXMgd3JpdGluZyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciBlYXN5LlxuU2VlIHtAbGluayBHcm91cH0uXG5cbkBwYXJhbSB7c3RyaW5nfSBzb3VyY2VTdHJpbmdcbkByZXR1cm4ge0dyb3VwPEdyb3Vwcy5CbG9jaz59XG5cdEJsb2NrIHRva2VuIHJlcHJlc2VudGluZyB0aGUgd2hvbGUgbW9kdWxlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleChzb3VyY2VTdHJpbmcpIHtcblx0Ly8gQWxnb3JpdGhtIHJlcXVpcmVzIHRyYWlsaW5nIG5ld2xpbmUgdG8gY2xvc2UgYW55IGJsb2Nrcy5cblx0Y2hlY2soc291cmNlU3RyaW5nLmVuZHNXaXRoKCdcXG4nKSwgU3RhcnRMb2MsICdTb3VyY2UgY29kZSBtdXN0IGVuZCBpbiBuZXdsaW5lLicpXG5cblx0Lypcblx0VXNlIGEgMC10ZXJtaW5hdGVkIHN0cmluZyBzbyB0aGF0IHdlIGNhbiB1c2UgYDBgIGFzIGEgc3dpdGNoIGNhc2UgaW4gbGV4UGxhaW4uXG5cdFRoaXMgaXMgZmFzdGVyIHRoYW4gY2hlY2tpbmcgd2hldGhlciBpbmRleCA9PT0gbGVuZ3RoLlxuXHQoSWYgd2UgY2hlY2sgcGFzdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcgd2UgZ2V0IGBOYU5gLCB3aGljaCBjYW4ndCBiZSBzd2l0Y2hlZCBvbi4pXG5cdCovXG5cdHNvdXJjZVN0cmluZyA9IGAke3NvdXJjZVN0cmluZ31cXDBgXG5cblx0c2V0dXBHcm91cENvbnRleHQoKVxuXHRzZXR1cFNvdXJjZUNvbnRleHQoc291cmNlU3RyaW5nKVxuXG5cdG9wZW5MaW5lKFN0YXJ0UG9zKVxuXG5cdGxleFBsYWluKGZhbHNlKVxuXG5cdGNvbnN0IGVuZFBvcyA9IHBvcygpXG5cdHJldHVybiB0ZWFyRG93bkdyb3VwQ29udGV4dChlbmRQb3MpXG59XG4iXX0=
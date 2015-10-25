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
		(0, _context.check)(sourceString.endsWith('\n'), () => lastCharPos(sourceString), 'Source code must end in newline.');

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

	function lastCharPos(str) {
		const splits = str.split('\n');
		return new _esastDistLoc.Pos(splits.length, splits[splits.length - 1].length);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O2tCQWlCd0IsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBWixVQUFTLEdBQUcsQ0FBQyxZQUFZLEVBQUU7O0FBRXpDLGVBakJPLEtBQUssRUFpQk4sWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFDakUsa0NBQWtDLENBQUMsQ0FBQTs7Ozs7OztBQU9wQyxjQUFZLEdBQUcsQ0FBQyxHQUFFLFlBQVksRUFBQyxFQUFFLENBQUMsQ0FBQTs7QUFFbEMsb0JBMUJpQixpQkFBaUIsR0EwQmYsQ0FBQTtBQUNuQixxQkF6Qlksa0JBQWtCLEVBeUJYLFlBQVksQ0FBQyxDQUFBOztBQUVoQyxvQkE3Qk8sUUFBUSxnQkFGSCxRQUFRLENBK0JGLENBQUE7O0FBRWxCLDBCQUFTLEtBQUssQ0FBQyxDQUFBOztBQUVmLFFBQU0sTUFBTSxHQUFHLG1CQS9CUixHQUFHLEdBK0JVLENBQUE7QUFDcEIsU0FBTyxrQkFsQzZCLG9CQUFvQixFQWtDNUIsTUFBTSxDQUFDLENBQUE7RUFDbkM7O0FBRUQsVUFBUyxXQUFXLENBQUMsR0FBRyxFQUFFO0FBQ3pCLFFBQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDOUIsU0FBTyxrQkF6Q0EsR0FBRyxDQTBDVCxNQUFNLENBQUMsTUFBTSxFQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0VBQ2hDIiwiZmlsZSI6ImxleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9sb2FkTGV4KidcbmltcG9ydCB7UG9zLCBTdGFydFBvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtvcGVuTGluZSwgc2V0dXBHcm91cENvbnRleHQsIHRlYXJEb3duR3JvdXBDb250ZXh0fSBmcm9tICcuL2dyb3VwQ29udGV4dCdcbmltcG9ydCBsZXhQbGFpbiBmcm9tICcuL2xleFBsYWluJ1xuaW1wb3J0IHtwb3MsIHNldHVwU291cmNlQ29udGV4dH0gZnJvbSAnLi9zb3VyY2VDb250ZXh0J1xuXG4vKipcbkxleGVzIHRoZSBzb3VyY2UgY29kZSBpbnRvIHtAbGluayBUb2tlbn1zLlxuVGhlIE1hc29uIGxleGVyIGFsc28gZ3JvdXBzIHRva2VucyBhcyBwYXJ0IG9mIGxleGluZy5cblRoaXMgbWFrZXMgd3JpdGluZyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciBlYXN5LlxuU2VlIHtAbGluayBHcm91cH0uXG5cbkBwYXJhbSB7c3RyaW5nfSBzb3VyY2VTdHJpbmdcbkByZXR1cm4ge0dyb3VwPEdyb3Vwcy5CbG9jaz59XG5cdEJsb2NrIHRva2VuIHJlcHJlc2VudGluZyB0aGUgd2hvbGUgbW9kdWxlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleChzb3VyY2VTdHJpbmcpIHtcblx0Ly8gQWxnb3JpdGhtIHJlcXVpcmVzIHRyYWlsaW5nIG5ld2xpbmUgdG8gY2xvc2UgYW55IGJsb2Nrcy5cblx0Y2hlY2soc291cmNlU3RyaW5nLmVuZHNXaXRoKCdcXG4nKSwgKCkgPT4gbGFzdENoYXJQb3Moc291cmNlU3RyaW5nKSxcblx0XHQnU291cmNlIGNvZGUgbXVzdCBlbmQgaW4gbmV3bGluZS4nKVxuXG5cdC8qXG5cdFVzZSBhIDAtdGVybWluYXRlZCBzdHJpbmcgc28gdGhhdCB3ZSBjYW4gdXNlIGAwYCBhcyBhIHN3aXRjaCBjYXNlIGluIGxleFBsYWluLlxuXHRUaGlzIGlzIGZhc3RlciB0aGFuIGNoZWNraW5nIHdoZXRoZXIgaW5kZXggPT09IGxlbmd0aC5cblx0KElmIHdlIGNoZWNrIHBhc3QgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIHdlIGdldCBgTmFOYCwgd2hpY2ggY2FuJ3QgYmUgc3dpdGNoZWQgb24uKVxuXHQqL1xuXHRzb3VyY2VTdHJpbmcgPSBgJHtzb3VyY2VTdHJpbmd9XFwwYFxuXG5cdHNldHVwR3JvdXBDb250ZXh0KClcblx0c2V0dXBTb3VyY2VDb250ZXh0KHNvdXJjZVN0cmluZylcblxuXHRvcGVuTGluZShTdGFydFBvcylcblxuXHRsZXhQbGFpbihmYWxzZSlcblxuXHRjb25zdCBlbmRQb3MgPSBwb3MoKVxuXHRyZXR1cm4gdGVhckRvd25Hcm91cENvbnRleHQoZW5kUG9zKVxufVxuXG5mdW5jdGlvbiBsYXN0Q2hhclBvcyhzdHIpIHtcblx0Y29uc3Qgc3BsaXRzID0gc3RyLnNwbGl0KCdcXG4nKVxuXHRyZXR1cm4gbmV3IFBvcyhcblx0XHRzcGxpdHMubGVuZ3RoLFxuXHRcdHNwbGl0c1tzcGxpdHMubGVuZ3RoLTFdLmxlbmd0aClcbn1cbiJdfQ==
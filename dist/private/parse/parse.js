(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', './loadParse*', './parseModule', './Slice'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('./loadParse*'), require('./parseModule'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.loadParse, global.parseModule, global.Slice);
		global.parse = mod.exports;
	}
})(this, function (exports, module, _loadParse, _parseModule, _Slice) {
	'use strict';

	module.exports = parse;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseModule2 = _interopRequireDefault(_parseModule);

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 This converts a Token tree to a MsAst.
 This is a recursive-descent parser, made easier by two facts:
 	* We have already grouped tokens.
 	* Most of the time, an ast's type is determined by the first token.
 
 There are exceptions such as assignment statements (indicated by a `=` somewhere in the middle).
 For those we must iterate through tokens and split.
 (See {@link Slice#opSplitOnce} and {@link Slice#opSplitMany}.)
 
 @param {Group<Groups.Block>} rootToken
 @return {Module}
 */

	function parse(rootToken) {
		return (0, _parseModule2.default)(_Slice2.default.group(rootToken));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztrQkFpQndCLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBZCxVQUFTLEtBQUssQ0FBQyxTQUFTLEVBQUU7QUFDeEMsU0FBTywyQkFBWSxnQkFBTSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtFQUMxQyIsImZpbGUiOiJwYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9sb2FkUGFyc2UqJ1xuaW1wb3J0IHBhcnNlTW9kdWxlIGZyb20gJy4vcGFyc2VNb2R1bGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5UaGlzIGNvbnZlcnRzIGEgVG9rZW4gdHJlZSB0byBhIE1zQXN0LlxuVGhpcyBpcyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciwgbWFkZSBlYXNpZXIgYnkgdHdvIGZhY3RzOlxuXHQqIFdlIGhhdmUgYWxyZWFkeSBncm91cGVkIHRva2Vucy5cblx0KiBNb3N0IG9mIHRoZSB0aW1lLCBhbiBhc3QncyB0eXBlIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IHRva2VuLlxuXG5UaGVyZSBhcmUgZXhjZXB0aW9ucyBzdWNoIGFzIGFzc2lnbm1lbnQgc3RhdGVtZW50cyAoaW5kaWNhdGVkIGJ5IGEgYD1gIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlKS5cbkZvciB0aG9zZSB3ZSBtdXN0IGl0ZXJhdGUgdGhyb3VnaCB0b2tlbnMgYW5kIHNwbGl0LlxuKFNlZSB7QGxpbmsgU2xpY2Ujb3BTcGxpdE9uY2V9IGFuZCB7QGxpbmsgU2xpY2Ujb3BTcGxpdE1hbnl9LilcblxuQHBhcmFtIHtHcm91cDxHcm91cHMuQmxvY2s+fSByb290VG9rZW5cbkByZXR1cm4ge01vZHVsZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZShyb290VG9rZW4pIHtcblx0cmV0dXJuIHBhcnNlTW9kdWxlKFNsaWNlLmdyb3VwKHJvb3RUb2tlbikpXG59XG4iXX0=
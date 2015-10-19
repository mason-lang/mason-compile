if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', './loadParse*', './parseModule', './Slice'], function (exports, module, _loadParse, _parseModule, _Slice) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2tCQ2lCd0IsS0FBSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFkLFVBQVMsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN4QyxTQUFPLDJCQUFZLGdCQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0VBQzFDIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCAnLi9sb2FkUGFyc2UqJ1xuaW1wb3J0IHBhcnNlTW9kdWxlIGZyb20gJy4vcGFyc2VNb2R1bGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5UaGlzIGNvbnZlcnRzIGEgVG9rZW4gdHJlZSB0byBhIE1zQXN0LlxuVGhpcyBpcyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciwgbWFkZSBlYXNpZXIgYnkgdHdvIGZhY3RzOlxuXHQqIFdlIGhhdmUgYWxyZWFkeSBncm91cGVkIHRva2Vucy5cblx0KiBNb3N0IG9mIHRoZSB0aW1lLCBhbiBhc3QncyB0eXBlIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IHRva2VuLlxuXG5UaGVyZSBhcmUgZXhjZXB0aW9ucyBzdWNoIGFzIGFzc2lnbm1lbnQgc3RhdGVtZW50cyAoaW5kaWNhdGVkIGJ5IGEgYD1gIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlKS5cbkZvciB0aG9zZSB3ZSBtdXN0IGl0ZXJhdGUgdGhyb3VnaCB0b2tlbnMgYW5kIHNwbGl0LlxuKFNlZSB7QGxpbmsgU2xpY2Ujb3BTcGxpdE9uY2V9IGFuZCB7QGxpbmsgU2xpY2Ujb3BTcGxpdE1hbnl9LilcblxuQHBhcmFtIHtHcm91cDxHcm91cHMuQmxvY2s+fSByb290VG9rZW5cbkByZXR1cm4ge01vZHVsZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZShyb290VG9rZW4pIHtcblx0cmV0dXJuIHBhcnNlTW9kdWxlKFNsaWNlLmdyb3VwKHJvb3RUb2tlbikpXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

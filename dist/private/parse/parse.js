if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', './loadParse*', './parseModule', './Slice'], function (exports, module, _loadParse, _parseModule, _Slice) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseModule2 = _interopRequireDefault(_parseModule);

	var _Slice2 = _interopRequireDefault(_Slice);

	/*
 This converts a Token tree to a MsAst.
 This is a recursive-descent parser, made easier by two facts:
 	* We have already grouped tokens.
 	* Most of the time, an ast's type is determined by the first token.
 
 There are exceptions such as assignment statements (indicated by a `=` somewhere in the middle).
 For those we must iterate through tokens and split.
 (See Slice.opSplitOnceWhere and Slice.opSplitManyWhere.)
 */

	module.exports = rootToken => (0, _parseModule2.default)(_Slice2.default.group(rootToken));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JDY2UsU0FBUyxJQUN2QiwyQkFBWSxnQkFBTSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0ICcuL2xvYWRQYXJzZSonXG5pbXBvcnQgcGFyc2VNb2R1bGUgZnJvbSAnLi9wYXJzZU1vZHVsZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKlxuVGhpcyBjb252ZXJ0cyBhIFRva2VuIHRyZWUgdG8gYSBNc0FzdC5cblRoaXMgaXMgYSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIsIG1hZGUgZWFzaWVyIGJ5IHR3byBmYWN0czpcblx0KiBXZSBoYXZlIGFscmVhZHkgZ3JvdXBlZCB0b2tlbnMuXG5cdCogTW9zdCBvZiB0aGUgdGltZSwgYW4gYXN0J3MgdHlwZSBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCB0b2tlbi5cblxuVGhlcmUgYXJlIGV4Y2VwdGlvbnMgc3VjaCBhcyBhc3NpZ25tZW50IHN0YXRlbWVudHMgKGluZGljYXRlZCBieSBhIGA9YCBzb21ld2hlcmUgaW4gdGhlIG1pZGRsZSkuXG5Gb3IgdGhvc2Ugd2UgbXVzdCBpdGVyYXRlIHRocm91Z2ggdG9rZW5zIGFuZCBzcGxpdC5cbihTZWUgU2xpY2Uub3BTcGxpdE9uY2VXaGVyZSBhbmQgU2xpY2Uub3BTcGxpdE1hbnlXaGVyZS4pXG4qL1xuZXhwb3J0IGRlZmF1bHQgcm9vdFRva2VuID0+XG5cdHBhcnNlTW9kdWxlKFNsaWNlLmdyb3VwKHJvb3RUb2tlbikpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==

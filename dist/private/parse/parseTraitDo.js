'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../util', './parse*', './parseBlock', './parseMethodImpls'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseMethodImpls'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.util, global.parse, global.parseBlock, global.parseMethodImpls);
		global.parseTraitDo = mod.exports;
	}
})(this, function (exports, _MsAst, _util, _parse, _parseBlock, _parseMethodImpls) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseTraitDo;

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function parseTraitDo(tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];

		var _parseNExprParts = (0, _parse.parseNExprParts)(before, 2, 'argsTraitDo');

		var _parseNExprParts2 = _slicedToArray(_parseNExprParts, 2);

		const implementor = _parseNExprParts2[0];
		const trait = _parseNExprParts2[1];

		var _ifElse = (0, _util.ifElse)(opBlock, _parseMethodImpls.parseStaticsAndMethods, () => [[], []]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const statics = _ifElse2[0];
		const methods = _ifElse2[1];
		return new _MsAst.TraitDo(tokens.loc, implementor, trait, statics, methods);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlVHJhaXREby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBTXdCLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBWixZQUFZIiwiZmlsZSI6InBhcnNlVHJhaXREby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VHJhaXREb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lmRWxzZX0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7cGFyc2VORXhwclBhcnRzfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kT3BCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHtwYXJzZVN0YXRpY3NBbmRNZXRob2RzfSBmcm9tICcuL3BhcnNlTWV0aG9kSW1wbHMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlVHJhaXREbyh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y29uc3QgW2ltcGxlbWVudG9yLCB0cmFpdF0gPSBwYXJzZU5FeHByUGFydHMoYmVmb3JlLCAyLCAnYXJnc1RyYWl0RG8nKVxuXHRjb25zdCBbc3RhdGljcywgbWV0aG9kc10gPSBpZkVsc2Uob3BCbG9jaywgcGFyc2VTdGF0aWNzQW5kTWV0aG9kcywgKCkgPT4gW1tdLCBbXV0pXG5cdHJldHVybiBuZXcgVHJhaXREbyh0b2tlbnMubG9jLCBpbXBsZW1lbnRvciwgdHJhaXQsIHN0YXRpY3MsIG1ldGhvZHMpXG59XG4iXX0=
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', './parse*'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('./parse*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.parse);
		global.parseQuote = mod.exports;
	}
})(this, function (exports, _MsAst, _parse) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseQuote;

	function parseQuote(tokens) {
		return new _MsAst.QuotePlain(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : (0, _parse.parseSingle)(_)));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlUXVvdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQUl3QixVQUFVOztVQUFWLFVBQVUiLCJmaWxlIjoicGFyc2VRdW90ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UXVvdGVQbGFpbn0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge3BhcnNlU2luZ2xlfSBmcm9tICcuL3BhcnNlKidcblxuLyoqIFBhcnNlIHRva2VucyBpbiBhIHtAbGluayBHcm91cHMuUXVvdGV9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VRdW90ZSh0b2tlbnMpIHtcblx0cmV0dXJuIG5ldyBRdW90ZVBsYWluKHRva2Vucy5sb2MsIHRva2Vucy5tYXAoXyA9PiB0eXBlb2YgXyA9PT0gJ3N0cmluZycgPyBfIDogcGFyc2VTaW5nbGUoXykpKVxufVxuIl19
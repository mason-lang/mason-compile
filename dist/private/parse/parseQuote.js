(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../MsAst', './parse*'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../MsAst'), require('./parse*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.MsAst, global.parse);
		global.parseQuote = mod.exports;
	}
})(this, function (exports, module, _MsAst, _parse) {
	'use strict';

	module.exports = parseQuote;

	/** Parse tokens in a {@link Groups.Quote}. */

	function parseQuote(tokens) {
		return new _MsAst.Quote(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : (0, _parse.parseSingle)(_)));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlUXVvdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O2tCQUl3QixVQUFVOzs7O0FBQW5CLFVBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUMxQyxTQUFPLFdBTEEsS0FBSyxDQUtLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRyxXQUpsRSxXQUFXLEVBSW1FLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUN6RiIsImZpbGUiOiJwYXJzZVF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtRdW90ZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge3BhcnNlU2luZ2xlfSBmcm9tICcuL3BhcnNlKidcblxuLyoqIFBhcnNlIHRva2VucyBpbiBhIHtAbGluayBHcm91cHMuUXVvdGV9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VRdW90ZSh0b2tlbnMpIHtcblx0cmV0dXJuIG5ldyBRdW90ZSh0b2tlbnMubG9jLCB0b2tlbnMubWFwKF8gPT4gdHlwZW9mIF8gPT09ICdzdHJpbmcnID8gXyA6IHBhcnNlU2luZ2xlKF8pKSlcbn1cbiJdfQ==
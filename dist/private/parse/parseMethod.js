'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', './checks', './parseFun', './parseMethodSplit'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('./checks'), require('./parseFun'), require('./parseMethodSplit'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.checks, global.parseFun, global.parseMethodSplit);
		global.parseMethod = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _checks, _parseFun, _parseMethodSplit2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseMethod;

	var _parseMethodSplit3 = _interopRequireDefault(_parseMethodSplit2);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseMethod(tokens) {
		var _parseMethodSplit = (0, _parseMethodSplit3.default)(tokens);

		const before = _parseMethodSplit.before;
		const kind = _parseMethodSplit.kind;
		const after = _parseMethodSplit.after;
		(0, _checks.checkEmpty)(before, () => `Did not expect anything between ${ (0, _Token.showKeyword)(_Token.Keywords.Method) } and function.`);
		return new _MsAst.Method(tokens.loc, (0, _parseFun.parseFunLike)(kind, after));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZU1ldGhvZC5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=
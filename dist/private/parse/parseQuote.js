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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZVF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './private/Token'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./private/Token'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Token);
		global.info = mod.exports;
	}
})(this, function (exports, _Token) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.reservedKeywords = exports.keywords = undefined;
	const keywords = exports.keywords = Object.keys(_Token.Keywords).map(key => (0, _Token.keywordName)(_Token.Keywords[key])).sort();

	const reservedKeywords = exports.reservedKeywords = _Token.reservedKeywords.sort();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJpbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
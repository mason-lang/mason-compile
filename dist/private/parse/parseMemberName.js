'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../Token', './checks', './parseName', './parseQuote', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../Token'), require('./checks'), require('./parseName'), require('./parseQuote'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Token, global.checks, global.parseName, global.parseQuote, global.Slice);
		global.parseMemberName = mod.exports;
	}
})(this, function (exports, _Token, _checks, _parseName, _parseQuote, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseMemberName;

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseMemberName(token) {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return name;else if ((0, _Token.isGroup)(_Token.Groups.Quote, token)) return (0, _parseQuote2.default)(_Slice2.default.group(token));else (0, _checks.unexpected)(token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZU1lbWJlck5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6W119
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['./parseClass', './parseExcept', './parseExpr', './parseSingle', './parseSpaced', './parseSwitch', './parse*'], factory);
	} else if (typeof exports !== "undefined") {
		factory(require('./parseClass'), require('./parseExcept'), require('./parseExpr'), require('./parseSingle'), require('./parseSpaced'), require('./parseSwitch'), require('./parse*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(global.parseClass, global.parseExcept, global.parseExpr, global.parseSingle, global.parseSpaced, global.parseSwitch, global.parse);
		global.loadParse = mod.exports;
	}
})(this, function (_parseClass, _parseExcept, _parseExpr, _parseSingle, _parseSpaced, _parseSwitch, _parse) {
	var _parseClass2 = _interopRequireDefault(_parseClass);

	var _parseExcept2 = _interopRequireDefault(_parseExcept);

	var _parseExpr2 = _interopRequireDefault(_parseExpr);

	var _parseSingle2 = _interopRequireDefault(_parseSingle);

	var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

	var _parseSwitch2 = _interopRequireDefault(_parseSwitch);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	(0, _parse.load)({
		opParseExpr: _parseExpr.opParseExpr,
		parseClass: _parseClass2.default,
		parseExcept: _parseExcept2.default,
		parseExpr: _parseExpr2.default,
		parseExprParts: _parseExpr.parseExprParts,
		parseSingle: _parseSingle2.default,
		parseSpaced: _parseSpaced2.default,
		parseSwitch: _parseSwitch2.default
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsb2FkUGFyc2UqLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
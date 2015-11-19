"use strict";

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.parse = mod.exports;
	}
})(this, function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.load = load;
	let opParseExpr = exports.opParseExpr = undefined;
	let parseClass = exports.parseClass = undefined;
	let parseExcept = exports.parseExcept = undefined;
	let parseExpr = exports.parseExpr = undefined;
	let parseExprParts = exports.parseExprParts = undefined;
	let parseSingle = exports.parseSingle = undefined;
	let parseSpaced = exports.parseSpaced = undefined;
	let parseSwitch = exports.parseSwitch = undefined;

	function load(_) {
		exports.opParseExpr = opParseExpr = _.opParseExpr;
		exports.parseClass = parseClass = _.parseClass;
		exports.parseExcept = parseExcept = _.parseExcept;
		exports.parseExpr = parseExpr = _.parseExpr;
		exports.parseExprParts = parseExprParts = _.parseExprParts;
		exports.parseSingle = parseSingle = _.parseSingle;
		exports.parseSpaced = parseSpaced = _.parseSpaced;
		exports.parseSwitch = parseSwitch = _.parseSwitch;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZSouanMiLCJzb3VyY2VzQ29udGVudCI6W119
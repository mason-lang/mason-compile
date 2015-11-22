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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlKi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FXZ0IsSUFBSSxHQUFKLElBQUk7S0FUVCxXQUFXLFdBQVgsV0FBVztLQUNYLFVBQVUsV0FBVixVQUFVO0tBQ1YsV0FBVyxXQUFYLFdBQVc7S0FDWCxTQUFTLFdBQVQsU0FBUztLQUNULGNBQWMsV0FBZCxjQUFjO0tBQ2QsV0FBVyxXQUFYLFdBQVc7S0FDWCxXQUFXLFdBQVgsV0FBVztLQUNYLFdBQVcsV0FBWCxXQUFXOztVQUVOLElBQUk7VUFUVCxXQUFXLEdBVXJCLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVztVQVRqQixVQUFVLEdBVXBCLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVTtVQVRmLFdBQVcsR0FVckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXO1VBVGpCLFNBQVMsR0FVbkIsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTO1VBVGIsY0FBYyxHQVV4QixjQUFjLEdBQUcsQ0FBQyxDQUFDLGNBQWM7VUFUdkIsV0FBVyxHQVVyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVc7VUFUakIsV0FBVyxHQVVyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVc7VUFUakIsV0FBVyxHQVVyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVciLCJmaWxlIjoicGFyc2UqLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVE9ETzpFUzYgUmVjdXJzaXZlIG1vZHVsZXMgc2hvdWxkIHdvcmssIHNvIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWNlc3NhcnkuXG5cbmV4cG9ydCBsZXQgb3BQYXJzZUV4cHJcbmV4cG9ydCBsZXQgcGFyc2VDbGFzc1xuZXhwb3J0IGxldCBwYXJzZUV4Y2VwdFxuZXhwb3J0IGxldCBwYXJzZUV4cHJcbmV4cG9ydCBsZXQgcGFyc2VFeHByUGFydHNcbmV4cG9ydCBsZXQgcGFyc2VTaW5nbGVcbmV4cG9ydCBsZXQgcGFyc2VTcGFjZWRcbmV4cG9ydCBsZXQgcGFyc2VTd2l0Y2hcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoXykge1xuXHRvcFBhcnNlRXhwciA9IF8ub3BQYXJzZUV4cHJcblx0cGFyc2VDbGFzcyA9IF8ucGFyc2VDbGFzc1xuXHRwYXJzZUV4Y2VwdCA9IF8ucGFyc2VFeGNlcHRcblx0cGFyc2VFeHByID0gXy5wYXJzZUV4cHJcblx0cGFyc2VFeHByUGFydHMgPSBfLnBhcnNlRXhwclBhcnRzXG5cdHBhcnNlU2luZ2xlID0gXy5wYXJzZVNpbmdsZVxuXHRwYXJzZVNwYWNlZCA9IF8ucGFyc2VTcGFjZWRcblx0cGFyc2VTd2l0Y2ggPSBfLnBhcnNlU3dpdGNoXG59XG4iXX0=
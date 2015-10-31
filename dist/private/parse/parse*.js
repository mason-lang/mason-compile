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
	let parseClass = exports.parseClass = undefined;
	let parseExcept = exports.parseExcept = undefined;
	let parseExpr = exports.parseExpr = undefined;
	let parseExprParts = exports.parseExprParts = undefined;
	let parseSingle = exports.parseSingle = undefined;
	let parseSpaced = exports.parseSpaced = undefined;
	let parseSwitch = exports.parseSwitch = undefined;

	function load(_) {
		exports.parseClass = parseClass = _.parseClass;
		exports.parseExcept = parseExcept = _.parseExcept;
		exports.parseExpr = parseExpr = _.parseExpr;
		exports.parseExprParts = parseExprParts = _.parseExprParts;
		exports.parseSingle = parseSingle = _.parseSingle;
		exports.parseSpaced = parseSpaced = _.parseSpaced;
		exports.parseSwitch = parseSwitch = _.parseSwitch;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlKi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FVZ0IsSUFBSSxHQUFKLElBQUk7S0FSVCxVQUFVLFdBQVYsVUFBVTtLQUNWLFdBQVcsV0FBWCxXQUFXO0tBQ1gsU0FBUyxXQUFULFNBQVM7S0FDVCxjQUFjLFdBQWQsY0FBYztLQUNkLFdBQVcsV0FBWCxXQUFXO0tBQ1gsV0FBVyxXQUFYLFdBQVc7S0FDWCxXQUFXLFdBQVgsV0FBVzs7VUFFTixJQUFJO1VBUlQsVUFBVSxHQVNwQixVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVU7VUFSZixXQUFXLEdBU3JCLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVztVQVJqQixTQUFTLEdBU25CLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUztVQVJiLGNBQWMsR0FTeEIsY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjO1VBUnZCLFdBQVcsR0FTckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXO1VBUmpCLFdBQVcsR0FTckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXO1VBUmpCLFdBQVcsR0FTckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXIiwiZmlsZSI6InBhcnNlKi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRPRE86RVM2IFJlY3Vyc2l2ZSBtb2R1bGVzIHNob3VsZCB3b3JrLCBzbyB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5LlxuXG5leHBvcnQgbGV0IHBhcnNlQ2xhc3NcbmV4cG9ydCBsZXQgcGFyc2VFeGNlcHRcbmV4cG9ydCBsZXQgcGFyc2VFeHByXG5leHBvcnQgbGV0IHBhcnNlRXhwclBhcnRzXG5leHBvcnQgbGV0IHBhcnNlU2luZ2xlXG5leHBvcnQgbGV0IHBhcnNlU3BhY2VkXG5leHBvcnQgbGV0IHBhcnNlU3dpdGNoXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkKF8pIHtcblx0cGFyc2VDbGFzcyA9IF8ucGFyc2VDbGFzc1xuXHRwYXJzZUV4Y2VwdCA9IF8ucGFyc2VFeGNlcHRcblx0cGFyc2VFeHByID0gXy5wYXJzZUV4cHJcblx0cGFyc2VFeHByUGFydHMgPSBfLnBhcnNlRXhwclBhcnRzXG5cdHBhcnNlU2luZ2xlID0gXy5wYXJzZVNpbmdsZVxuXHRwYXJzZVNwYWNlZCA9IF8ucGFyc2VTcGFjZWRcblx0cGFyc2VTd2l0Y2ggPSBfLnBhcnNlU3dpdGNoXG59XG4iXX0=
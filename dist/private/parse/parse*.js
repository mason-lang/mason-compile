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
	// TODO:ES6 Recursive modules should work, so this should not be necessary.

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.load = load;
	let parseClass;
	exports.parseClass = parseClass;
	let parseExcept;
	exports.parseExcept = parseExcept;
	let parseExpr;
	exports.parseExpr = parseExpr;
	let parseExprParts;
	exports.parseExprParts = parseExprParts;
	let parseSingle;
	exports.parseSingle = parseSingle;
	let parseSpaced;
	exports.parseSpaced = parseSpaced;
	let parseSwitch;

	exports.parseSwitch = parseSwitch;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlKi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFTyxLQUFJLFVBQVUsQ0FBQTs7QUFDZCxLQUFJLFdBQVcsQ0FBQTs7QUFDZixLQUFJLFNBQVMsQ0FBQTs7QUFDYixLQUFJLGNBQWMsQ0FBQTs7QUFDbEIsS0FBSSxXQUFXLENBQUE7O0FBQ2YsS0FBSSxXQUFXLENBQUE7O0FBQ2YsS0FBSSxXQUFXLENBQUE7Ozs7QUFFZixVQUFTLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDdkIsVUFUVSxVQUFVLEdBU3BCLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFBO0FBQ3pCLFVBVFUsV0FBVyxHQVNyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQTtBQUMzQixVQVRVLFNBQVMsR0FTbkIsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUE7QUFDdkIsVUFUVSxjQUFjLEdBU3hCLGNBQWMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFBO0FBQ2pDLFVBVFUsV0FBVyxHQVNyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQTtBQUMzQixVQVRVLFdBQVcsR0FTckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUE7QUFDM0IsVUFUVSxXQUFXLEdBU3JCLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFBO0VBQzNCIiwiZmlsZSI6InBhcnNlKi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRPRE86RVM2IFJlY3Vyc2l2ZSBtb2R1bGVzIHNob3VsZCB3b3JrLCBzbyB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5LlxuXG5leHBvcnQgbGV0IHBhcnNlQ2xhc3NcbmV4cG9ydCBsZXQgcGFyc2VFeGNlcHRcbmV4cG9ydCBsZXQgcGFyc2VFeHByXG5leHBvcnQgbGV0IHBhcnNlRXhwclBhcnRzXG5leHBvcnQgbGV0IHBhcnNlU2luZ2xlXG5leHBvcnQgbGV0IHBhcnNlU3BhY2VkXG5leHBvcnQgbGV0IHBhcnNlU3dpdGNoXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkKF8pIHtcblx0cGFyc2VDbGFzcyA9IF8ucGFyc2VDbGFzc1xuXHRwYXJzZUV4Y2VwdCA9IF8ucGFyc2VFeGNlcHRcblx0cGFyc2VFeHByID0gXy5wYXJzZUV4cHJcblx0cGFyc2VFeHByUGFydHMgPSBfLnBhcnNlRXhwclBhcnRzXG5cdHBhcnNlU2luZ2xlID0gXy5wYXJzZVNpbmdsZVxuXHRwYXJzZVNwYWNlZCA9IF8ucGFyc2VTcGFjZWRcblx0cGFyc2VTd2l0Y2ggPSBfLnBhcnNlU3dpdGNoXG59XG4iXX0=
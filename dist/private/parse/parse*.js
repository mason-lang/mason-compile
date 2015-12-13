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
	let parseNExprParts = exports.parseNExprParts = undefined;
	let parseSingle = exports.parseSingle = undefined;
	let parseSpaced = exports.parseSpaced = undefined;
	let parseSwitch = exports.parseSwitch = undefined;
	let parseTraitDo = exports.parseTraitDo = undefined;

	function load(_) {
		exports.opParseExpr = opParseExpr = _.opParseExpr;
		exports.parseClass = parseClass = _.parseClass;
		exports.parseExcept = parseExcept = _.parseExcept;
		exports.parseExpr = parseExpr = _.parseExpr;
		exports.parseExprParts = parseExprParts = _.parseExprParts;
		exports.parseNExprParts = parseNExprParts = _.parseNExprParts;
		exports.parseSingle = parseSingle = _.parseSingle;
		exports.parseSpaced = parseSpaced = _.parseSpaced;
		exports.parseSwitch = parseSwitch = _.parseSwitch;
		exports.parseTraitDo = parseTraitDo = _.parseTraitDo;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlKi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FhZ0IsSUFBSSxHQUFKLElBQUk7S0FYVCxXQUFXLFdBQVgsV0FBVztLQUNYLFVBQVUsV0FBVixVQUFVO0tBQ1YsV0FBVyxXQUFYLFdBQVc7S0FDWCxTQUFTLFdBQVQsU0FBUztLQUNULGNBQWMsV0FBZCxjQUFjO0tBQ2QsZUFBZSxXQUFmLGVBQWU7S0FDZixXQUFXLFdBQVgsV0FBVztLQUNYLFdBQVcsV0FBWCxXQUFXO0tBQ1gsV0FBVyxXQUFYLFdBQVc7S0FDWCxZQUFZLFdBQVosWUFBWTs7VUFFUCxJQUFJO1VBWFQsV0FBVyxHQVlyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVc7VUFYakIsVUFBVSxHQVlwQixVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVU7VUFYZixXQUFXLEdBWXJCLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVztVQVhqQixTQUFTLEdBWW5CLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUztVQVhiLGNBQWMsR0FZeEIsY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjO1VBWHZCLGVBQWUsR0FZekIsZUFBZSxHQUFHLENBQUMsQ0FBQyxlQUFlO1VBWHpCLFdBQVcsR0FZckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXO1VBWGpCLFdBQVcsR0FZckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXO1VBWGpCLFdBQVcsR0FZckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXO1VBWGpCLFlBQVksR0FZdEIsWUFBWSxHQUFHLENBQUMsQ0FBQyxZQUFZIiwiZmlsZSI6InBhcnNlKi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRPRE86RVM2IFJlY3Vyc2l2ZSBtb2R1bGVzIHNob3VsZCB3b3JrLCBzbyB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5LlxuXG5leHBvcnQgbGV0IG9wUGFyc2VFeHByXG5leHBvcnQgbGV0IHBhcnNlQ2xhc3NcbmV4cG9ydCBsZXQgcGFyc2VFeGNlcHRcbmV4cG9ydCBsZXQgcGFyc2VFeHByXG5leHBvcnQgbGV0IHBhcnNlRXhwclBhcnRzXG5leHBvcnQgbGV0IHBhcnNlTkV4cHJQYXJ0c1xuZXhwb3J0IGxldCBwYXJzZVNpbmdsZVxuZXhwb3J0IGxldCBwYXJzZVNwYWNlZFxuZXhwb3J0IGxldCBwYXJzZVN3aXRjaFxuZXhwb3J0IGxldCBwYXJzZVRyYWl0RG9cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoXykge1xuXHRvcFBhcnNlRXhwciA9IF8ub3BQYXJzZUV4cHJcblx0cGFyc2VDbGFzcyA9IF8ucGFyc2VDbGFzc1xuXHRwYXJzZUV4Y2VwdCA9IF8ucGFyc2VFeGNlcHRcblx0cGFyc2VFeHByID0gXy5wYXJzZUV4cHJcblx0cGFyc2VFeHByUGFydHMgPSBfLnBhcnNlRXhwclBhcnRzXG5cdHBhcnNlTkV4cHJQYXJ0cyA9IF8ucGFyc2VORXhwclBhcnRzXG5cdHBhcnNlU2luZ2xlID0gXy5wYXJzZVNpbmdsZVxuXHRwYXJzZVNwYWNlZCA9IF8ucGFyc2VTcGFjZWRcblx0cGFyc2VTd2l0Y2ggPSBfLnBhcnNlU3dpdGNoXG5cdHBhcnNlVHJhaXREbyA9IF8ucGFyc2VUcmFpdERvXG59XG4iXX0=
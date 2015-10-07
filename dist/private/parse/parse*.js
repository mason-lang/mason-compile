if (typeof define !== 'function') var define = require('amdefine')(module);define(["exports"], function (exports) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlKi5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2UqLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNFTyxLQUFJLFVBQVUsQ0FBQTs7QUFDZCxLQUFJLFdBQVcsQ0FBQTs7QUFDZixLQUFJLFNBQVMsQ0FBQTs7QUFDYixLQUFJLGNBQWMsQ0FBQTs7QUFDbEIsS0FBSSxXQUFXLENBQUE7O0FBQ2YsS0FBSSxXQUFXLENBQUE7O0FBQ2YsS0FBSSxXQUFXLENBQUE7Ozs7QUFFZixVQUFTLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDdkIsVUFUVSxVQUFVLEdBU3BCLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFBO0FBQ3pCLFVBVFUsV0FBVyxHQVNyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQTtBQUMzQixVQVRVLFNBQVMsR0FTbkIsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUE7QUFDdkIsVUFUVSxjQUFjLEdBU3hCLGNBQWMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFBO0FBQ2pDLFVBVFUsV0FBVyxHQVNyQixXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQTtBQUMzQixVQVRVLFdBQVcsR0FTckIsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUE7QUFDM0IsVUFUVSxXQUFXLEdBU3JCLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFBO0VBQzNCIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2UqLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCIvLyBUT0RPOkVTNiBSZWN1cnNpdmUgbW9kdWxlcyBzaG91bGQgd29yaywgc28gdGhpcyBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeS5cblxuZXhwb3J0IGxldCBwYXJzZUNsYXNzXG5leHBvcnQgbGV0IHBhcnNlRXhjZXB0XG5leHBvcnQgbGV0IHBhcnNlRXhwclxuZXhwb3J0IGxldCBwYXJzZUV4cHJQYXJ0c1xuZXhwb3J0IGxldCBwYXJzZVNpbmdsZVxuZXhwb3J0IGxldCBwYXJzZVNwYWNlZFxuZXhwb3J0IGxldCBwYXJzZVN3aXRjaFxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZChfKSB7XG5cdHBhcnNlQ2xhc3MgPSBfLnBhcnNlQ2xhc3Ncblx0cGFyc2VFeGNlcHQgPSBfLnBhcnNlRXhjZXB0XG5cdHBhcnNlRXhwciA9IF8ucGFyc2VFeHByXG5cdHBhcnNlRXhwclBhcnRzID0gXy5wYXJzZUV4cHJQYXJ0c1xuXHRwYXJzZVNpbmdsZSA9IF8ucGFyc2VTaW5nbGVcblx0cGFyc2VTcGFjZWQgPSBfLnBhcnNlU3BhY2VkXG5cdHBhcnNlU3dpdGNoID0gXy5wYXJzZVN3aXRjaFxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

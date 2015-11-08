'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './context', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./context'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.SK);
		global.util = mod.exports;
	}
})(this, function (exports, _context, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.verifyOp = verifyOp;
	exports.verifyName = verifyName;
	exports.setName = setName;

	var _SK2 = _interopRequireDefault(_SK);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function verifyOp(_, sk) {
		if (_ !== null) _.verify(sk);
	}

	function verifyName(_) {
		if (typeof _ !== 'string') _.verify(_SK2.default.Val);
	}

	function setName(expr) {
		_context.results.names.set(expr, _context.name);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUlnQixRQUFRLEdBQVIsUUFBUTtTQU1SLFVBQVUsR0FBVixVQUFVO1NBS1YsT0FBTyxHQUFQLE9BQU87Ozs7OztVQVhQLFFBQVE7Ozs7VUFNUixVQUFVOzs7O1VBS1YsT0FBTyIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtuYW1lLCByZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqIFZlcmlmeSBpZiBpdCBleGlzdHMuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5T3AoXywgc2spIHtcblx0aWYgKF8gIT09IG51bGwpXG5cdFx0Xy52ZXJpZnkoc2spXG59XG5cbi8qKiBWZXJpZnkgaWYgaXQncyBub3QgYSBzdHJpbmcuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5TmFtZShfKSB7XG5cdGlmICh0eXBlb2YgXyAhPT0gJ3N0cmluZycpXG5cdFx0Xy52ZXJpZnkoU0suVmFsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TmFtZShleHByKSB7XG5cdHJlc3VsdHMubmFtZXMuc2V0KGV4cHIsIG5hbWUpXG59XG4iXX0=
'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', './context', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('./context'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.context, global.SK);
		global.util = mod.exports;
	}
})(this, function (exports, _context, _context2, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.verifyOp = verifyOp;
	exports.verifyName = verifyName;
	exports.setName = setName;
	exports.okToNotUseIfFocus = okToNotUseIfFocus;
	exports.verifyNotLazy = verifyNotLazy;

	var _SK2 = _interopRequireDefault(_SK);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function verifyOp(_, sk) {
		if (_ !== null) _.verify(sk);
	}

	function verifyName(_) {
		if (typeof _ !== 'string') _.verify(_SK2.default.Val);
	}

	function setName(expr) {
		_context2.results.names.set(expr, _context2.name);
	}

	function okToNotUseIfFocus(localDeclare) {
		if (localDeclare.name === '_') _context2.okToNotUse.add(localDeclare);
	}

	function verifyNotLazy(localDeclare, message) {
		(0, _context.check)(!localDeclare.isLazy(), localDeclare.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUtnQixRQUFRLEdBQVIsUUFBUTtTQU1SLFVBQVUsR0FBVixVQUFVO1NBS1YsT0FBTyxHQUFQLE9BQU87U0FJUCxpQkFBaUIsR0FBakIsaUJBQWlCO1NBS2pCLGFBQWEsR0FBYixhQUFhOzs7Ozs7Ozs7O1VBcEJiLFFBQVE7Ozs7VUFNUixVQUFVOzs7O1VBS1YsT0FBTzs7OztVQUlQLGlCQUFpQjs7OztVQUtqQixhQUFhIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtuYW1lLCBva1RvTm90VXNlLCByZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqIFZlcmlmeSBpZiBpdCBleGlzdHMuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5T3AoXywgc2spIHtcblx0aWYgKF8gIT09IG51bGwpXG5cdFx0Xy52ZXJpZnkoc2spXG59XG5cbi8qKiBWZXJpZnkgaWYgaXQncyBub3QgYSBzdHJpbmcuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5TmFtZShfKSB7XG5cdGlmICh0eXBlb2YgXyAhPT0gJ3N0cmluZycpXG5cdFx0Xy52ZXJpZnkoU0suVmFsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TmFtZShleHByKSB7XG5cdHJlc3VsdHMubmFtZXMuc2V0KGV4cHIsIG5hbWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBva1RvTm90VXNlSWZGb2N1cyhsb2NhbERlY2xhcmUpIHtcblx0aWYgKGxvY2FsRGVjbGFyZS5uYW1lID09PSAnXycpXG5cdFx0b2tUb05vdFVzZS5hZGQobG9jYWxEZWNsYXJlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5Tm90TGF6eShsb2NhbERlY2xhcmUsIG1lc3NhZ2UpIHtcblx0Y2hlY2soIWxvY2FsRGVjbGFyZS5pc0xhenkoKSwgbG9jYWxEZWNsYXJlLmxvYywgbWVzc2FnZSlcbn1cbiJdfQ==
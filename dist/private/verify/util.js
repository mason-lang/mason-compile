'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context);
		global.util = mod.exports;
	}
})(this, function (exports, _context) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.verifyOp = verifyOp;
	exports.verifyName = verifyName;
	exports.setName = setName;

	function verifyOp(_) {
		if (_ !== null) _.verify();
	}

	function verifyName(_) {
		if (typeof _ !== 'string') _.verify();
	}

	function setName(expr) {
		_context.results.names.set(expr, _context.name);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUdnQixRQUFRLEdBQVIsUUFBUTtTQU1SLFVBQVUsR0FBVixVQUFVO1NBS1YsT0FBTyxHQUFQLE9BQU87O1VBWFAsUUFBUTs7OztVQU1SLFVBQVU7Ozs7VUFLVixPQUFPIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge25hbWUsIHJlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcblxuLyoqIFZlcmlmeSBpZiBpdCBleGlzdHMuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5T3AoXykge1xuXHRpZiAoXyAhPT0gbnVsbClcblx0XHRfLnZlcmlmeSgpXG59XG5cbi8qKiBWZXJpZnkgaWYgaXQncyBub3QgYSBzdHJpbmcuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5TmFtZShfKSB7XG5cdGlmICh0eXBlb2YgXyAhPT0gJ3N0cmluZycpXG5cdFx0Xy52ZXJpZnkoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TmFtZShleHByKSB7XG5cdHJlc3VsdHMubmFtZXMuc2V0KGV4cHIsIG5hbWUpXG59XG4iXX0=
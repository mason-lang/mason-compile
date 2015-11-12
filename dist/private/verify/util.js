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
		_context.results.names.set(expr, _context.name);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUlnQixRQUFRLEdBQVIsUUFBUTtTQU1SLFVBQVUsR0FBVixVQUFVO1NBS1YsT0FBTyxHQUFQLE9BQU87Ozs7Ozs7Ozs7VUFYUCxRQUFROzs7O1VBTVIsVUFBVTs7OztVQUtWLE9BQU8iLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7bmFtZSwgcmVzdWx0c30gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IFNLIGZyb20gJy4vU0snXG5cbi8qKiBWZXJpZnkgaWYgaXQgZXhpc3RzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeU9wKF8sIHNrKSB7XG5cdGlmIChfICE9PSBudWxsKVxuXHRcdF8udmVyaWZ5KHNrKVxufVxuXG4vKiogVmVyaWZ5IGlmIGl0J3Mgbm90IGEgc3RyaW5nLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeU5hbWUoXykge1xuXHRpZiAodHlwZW9mIF8gIT09ICdzdHJpbmcnKVxuXHRcdF8udmVyaWZ5KFNLLlZhbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE5hbWUoZXhwcikge1xuXHRyZXN1bHRzLm5hbWVzLnNldChleHByLCBuYW1lKVxufVxuIl19
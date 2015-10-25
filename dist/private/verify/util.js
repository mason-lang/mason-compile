(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', './context'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context);
		global.util = mod.exports;
	}
})(this, function (exports, _context) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.verifyOp = verifyOp;
	exports.verifyName = verifyName;
	exports.setName = setName;

	/** Verify if it exists. */

	function verifyOp(_) {
		if (_ !== null) _.verify();
	}

	/** Verify if it's not a string. */

	function verifyName(_) {
		if (typeof _ !== 'string') _.verify();
	}

	function setName(expr) {
		_context.results.names.set(expr, _context.name);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdPLFVBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUMzQixNQUFJLENBQUMsS0FBSyxJQUFJLEVBQ2IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFBO0VBQ1g7Ozs7QUFHTSxVQUFTLFVBQVUsQ0FBQyxDQUFDLEVBQUU7QUFDN0IsTUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQ3hCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtFQUNYOztBQUVNLFVBQVMsT0FBTyxDQUFDLElBQUksRUFBRTtBQUM3QixXQWZhLE9BQU8sQ0FlWixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksV0FmZixJQUFJLENBZWtCLENBQUE7RUFDN0IiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7bmFtZSwgcmVzdWx0c30gZnJvbSAnLi9jb250ZXh0J1xuXG4vKiogVmVyaWZ5IGlmIGl0IGV4aXN0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlPcChfKSB7XG5cdGlmIChfICE9PSBudWxsKVxuXHRcdF8udmVyaWZ5KClcbn1cblxuLyoqIFZlcmlmeSBpZiBpdCdzIG5vdCBhIHN0cmluZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlOYW1lKF8pIHtcblx0aWYgKHR5cGVvZiBfICE9PSAnc3RyaW5nJylcblx0XHRfLnZlcmlmeSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXROYW1lKGV4cHIpIHtcblx0cmVzdWx0cy5uYW1lcy5zZXQoZXhwciwgbmFtZSlcbn1cbiJdfQ==
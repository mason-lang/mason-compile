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
	exports.makeUseOptional = makeUseOptional;
	exports.makeUseOptionalIfFocus = makeUseOptionalIfFocus;
	exports.verifyEach = verifyEach;
	exports.verifyOp = verifyOp;
	exports.verifyName = verifyName;
	exports.setName = setName;
	exports.verifyNotLazy = verifyNotLazy;

	var _SK2 = _interopRequireDefault(_SK);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function makeUseOptional(localDeclare) {
		_context2.okToNotUse.add(localDeclare);
	}

	function makeUseOptionalIfFocus(localDeclare) {
		if (localDeclare.name === '_') makeUseOptional(localDeclare);
	}

	function verifyEach(asts, sk) {
		for (const _ of asts) _.verify(sk);
	}

	function verifyOp(opAst, arg) {
		if (opAst !== null) opAst.verify(arg);
	}

	function verifyName(_) {
		if (typeof _ !== 'string') _.verify(_SK2.default.Val);
	}

	function setName(expr) {
		_context2.results.names.set(expr, _context2.name);
	}

	function verifyNotLazy(localDeclare, message) {
		(0, _context.check)(!localDeclare.isLazy(), localDeclare.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUtnQixlQUFlLEdBQWYsZUFBZTtTQVFmLHNCQUFzQixHQUF0QixzQkFBc0I7U0FVdEIsVUFBVSxHQUFWLFVBQVU7U0FVVixRQUFRLEdBQVIsUUFBUTtTQU1SLFVBQVUsR0FBVixVQUFVO1NBS1YsT0FBTyxHQUFQLE9BQU87U0FJUCxhQUFhLEdBQWIsYUFBYTs7Ozs7Ozs7OztVQTNDYixlQUFlOzs7O1VBUWYsc0JBQXNCOzs7O1VBVXRCLFVBQVU7Ozs7VUFVVixRQUFROzs7O1VBTVIsVUFBVTs7OztVQUtWLE9BQU87Ozs7VUFJUCxhQUFhIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtuYW1lLCBva1RvTm90VXNlLCByZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqIE1hcmsgYSBMb2NhbERlY2xhcmUgYXMgT0sgdG8gbm90IHVzZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVXNlT3B0aW9uYWwobG9jYWxEZWNsYXJlKSB7XG5cdG9rVG9Ob3RVc2UuYWRkKGxvY2FsRGVjbGFyZSlcbn1cblxuLyoqXG5Gb3IgQXN0cyB0aGF0IHVzZSB0aGUgZm9jdXMgYnkgZGVmYXVsdCwgbWFrZSBpdCBPSyB0byBub3QgdXNlIHRoZSB2YXJpYWJsZSB3aGVuIGl0J3MgdGhlIGZvY3VzLlxuKElmIHRoZSB1c2VyIHNwZWNpZmllZCBhIG5hbWUsIHRoZXkgaW50ZW5kZWQgdG8gdXNlIGl0LilcbiovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVVzZU9wdGlvbmFsSWZGb2N1cyhsb2NhbERlY2xhcmUpIHtcblx0aWYgKGxvY2FsRGVjbGFyZS5uYW1lID09PSAnXycpXG5cdFx0bWFrZVVzZU9wdGlvbmFsKGxvY2FsRGVjbGFyZSlcbn1cblxuLyoqXG5WZXJpZnkgZWFjaCBvZiBhc3RzLlxuQHBhcmFtIHtBcnJheTxNc0FzdD59IGFzdHNcbkBwYXJhbSB7U0t9IFtza10gT3B0aW9uYWwgU0sgb2YgZWFjaCBhc3QuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeUVhY2goYXN0cywgc2spIHtcblx0Zm9yIChjb25zdCBfIG9mIGFzdHMpXG5cdFx0Xy52ZXJpZnkoc2spXG59XG5cbi8qKlxuVmVyaWZ5IG9wQXN0IGlmIGl0IGV4aXN0cy5cbkBwYXJhbSB7P01zQXN0fSBvcEFzdFxuQHBhcmFtIFthcmddIEFyZ3VtZW50IHRvIHBhc3MgdG8gXy52ZXJpZnkuIFVzdWFsbHkgYW4ge0BsaW5rIFNLfS5cbiovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5T3Aob3BBc3QsIGFyZykge1xuXHRpZiAob3BBc3QgIT09IG51bGwpXG5cdFx0b3BBc3QudmVyaWZ5KGFyZylcbn1cblxuLyoqIFZlcmlmeSBpZiBpdCdzIG5vdCBhIHN0cmluZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlOYW1lKF8pIHtcblx0aWYgKHR5cGVvZiBfICE9PSAnc3RyaW5nJylcblx0XHRfLnZlcmlmeShTSy5WYWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXROYW1lKGV4cHIpIHtcblx0cmVzdWx0cy5uYW1lcy5zZXQoZXhwciwgbmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeU5vdExhenkobG9jYWxEZWNsYXJlLCBtZXNzYWdlKSB7XG5cdGNoZWNrKCFsb2NhbERlY2xhcmUuaXNMYXp5KCksIGxvY2FsRGVjbGFyZS5sb2MsIG1lc3NhZ2UpXG59XG4iXX0=
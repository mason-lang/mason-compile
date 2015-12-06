'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', './context', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('./context'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.context, global.SK);
		global.util = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _context2, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.makeUseOptional = makeUseOptional;
	exports.makeUseOptionalIfFocus = makeUseOptionalIfFocus;
	exports.verifyEach = verifyEach;
	exports.verifyEachValOrSpread = verifyEachValOrSpread;
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

	function verifyEachValOrSpread(asts) {
		for (const _ of asts) _.verify(_ instanceof _MsAst.Spread ? null : _SK2.default.Val);
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

	function verifyNotLazy(localDeclare, code) {
		(0, _context.check)(!localDeclare.isLazy(), localDeclare.loc, code);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQU1nQixlQUFlLEdBQWYsZUFBZTtTQVFmLHNCQUFzQixHQUF0QixzQkFBc0I7U0FVdEIsVUFBVSxHQUFWLFVBQVU7U0FNVixxQkFBcUIsR0FBckIscUJBQXFCO1NBV3JCLFFBQVEsR0FBUixRQUFRO1NBTVIsVUFBVSxHQUFWLFVBQVU7U0FLVixPQUFPLEdBQVAsT0FBTztTQUlQLGFBQWEsR0FBYixhQUFhOzs7Ozs7Ozs7O1VBbERiLGVBQWU7Ozs7VUFRZixzQkFBc0I7Ozs7VUFVdEIsVUFBVTs7OztVQU1WLHFCQUFxQjs7OztVQVdyQixRQUFROzs7O1VBTVIsVUFBVTs7OztVQUtWLE9BQU87Ozs7VUFJUCxhQUFhIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtTcHJlYWR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtuYW1lLCBva1RvTm90VXNlLCByZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqIE1hcmsgYSBMb2NhbERlY2xhcmUgYXMgT0sgdG8gbm90IHVzZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVXNlT3B0aW9uYWwobG9jYWxEZWNsYXJlKSB7XG5cdG9rVG9Ob3RVc2UuYWRkKGxvY2FsRGVjbGFyZSlcbn1cblxuLyoqXG5Gb3IgQXN0cyB0aGF0IHVzZSB0aGUgZm9jdXMgYnkgZGVmYXVsdCwgbWFrZSBpdCBPSyB0byBub3QgdXNlIHRoZSB2YXJpYWJsZSB3aGVuIGl0J3MgdGhlIGZvY3VzLlxuKElmIHRoZSB1c2VyIHNwZWNpZmllZCBhIG5hbWUsIHRoZXkgaW50ZW5kZWQgdG8gdXNlIGl0LilcbiovXG5leHBvcnQgZnVuY3Rpb24gbWFrZVVzZU9wdGlvbmFsSWZGb2N1cyhsb2NhbERlY2xhcmUpIHtcblx0aWYgKGxvY2FsRGVjbGFyZS5uYW1lID09PSAnXycpXG5cdFx0bWFrZVVzZU9wdGlvbmFsKGxvY2FsRGVjbGFyZSlcbn1cblxuLyoqXG5WZXJpZnkgZWFjaCBvZiBhc3RzLlxuQHBhcmFtIHtBcnJheTxNc0FzdD59IGFzdHNcbkBwYXJhbSB7U0t9IFtza10gT3B0aW9uYWwgU0sgb2YgZWFjaCBhc3QuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeUVhY2goYXN0cywgc2spIHtcblx0Zm9yIChjb25zdCBfIG9mIGFzdHMpXG5cdFx0Xy52ZXJpZnkoc2spXG59XG5cbi8qKiBWZXJpZnkgdmFsdWVzLCBhY2NlcHRpbmcgU3ByZWFkcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlFYWNoVmFsT3JTcHJlYWQoYXN0cykge1xuXHRmb3IgKGNvbnN0IF8gb2YgYXN0cylcblx0XHQvLyBgbnVsbGAgc2lnbmlmaWVzIHRvIFNwcmVhZCB0aGF0IHdlIHJlY29nbml6ZSBpdFxuXHRcdF8udmVyaWZ5KF8gaW5zdGFuY2VvZiBTcHJlYWQgPyBudWxsIDogU0suVmFsKVxufVxuXG4vKipcblZlcmlmeSBvcEFzdCBpZiBpdCBleGlzdHMuXG5AcGFyYW0gez9Nc0FzdH0gb3BBc3RcbkBwYXJhbSBbYXJnXSBBcmd1bWVudCB0byBwYXNzIHRvIF8udmVyaWZ5LiBVc3VhbGx5IGFuIHtAbGluayBTS30uXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeU9wKG9wQXN0LCBhcmcpIHtcblx0aWYgKG9wQXN0ICE9PSBudWxsKVxuXHRcdG9wQXN0LnZlcmlmeShhcmcpXG59XG5cbi8qKiBWZXJpZnkgaWYgaXQncyBub3QgYSBzdHJpbmcuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5TmFtZShfKSB7XG5cdGlmICh0eXBlb2YgXyAhPT0gJ3N0cmluZycpXG5cdFx0Xy52ZXJpZnkoU0suVmFsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TmFtZShleHByKSB7XG5cdHJlc3VsdHMubmFtZXMuc2V0KGV4cHIsIG5hbWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlOb3RMYXp5KGxvY2FsRGVjbGFyZSwgY29kZSkge1xuXHRjaGVjayghbG9jYWxEZWNsYXJlLmlzTGF6eSgpLCBsb2NhbERlY2xhcmUubG9jLCBjb2RlKVxufVxuIl19
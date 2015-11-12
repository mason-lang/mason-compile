'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../VerifyResults', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../VerifyResults'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.VerifyResults, global.SK);
		global.context = mod.exports;
	}
})(this, function (exports, _MsAst, _VerifyResults, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.name = exports.results = exports.method = exports.funKind = exports.pendingBlockLocals = exports.opLoop = exports.okToNotUse = exports.locals = undefined;
	exports.setup = setup;
	exports.tearDown = tearDown;
	exports.withInFunKind = withInFunKind;
	exports.withLoop = withLoop;
	exports.withMethod = withMethod;
	exports.withName = withName;
	exports.withIife = withIife;
	exports.withIifeIf = withIifeIf;
	exports.withIifeIfVal = withIifeIfVal;
	exports.setPendingBlockLocals = setPendingBlockLocals;

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	var _SK2 = _interopRequireDefault(_SK);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	let locals = exports.locals = undefined;
	let okToNotUse = exports.okToNotUse = undefined;
	let opLoop = exports.opLoop = undefined;
	let pendingBlockLocals = exports.pendingBlockLocals = undefined;
	let funKind = exports.funKind = undefined;
	let method = exports.method = undefined;
	let results = exports.results = undefined;
	let name = exports.name = undefined;

	function setup() {
		exports.locals = locals = new Map();
		exports.pendingBlockLocals = pendingBlockLocals = [];
		exports.funKind = funKind = _MsAst.Funs.Plain;
		exports.okToNotUse = okToNotUse = new Set();
		exports.opLoop = opLoop = null;
		exports.method = method = null;
		exports.results = results = new _VerifyResults2.default();
	}

	function tearDown() {
		exports.locals = locals = exports.okToNotUse = okToNotUse = exports.opLoop = opLoop = exports.pendingBlockLocals = pendingBlockLocals = exports.method = method = exports.results = results = null;
	}

	function withInFunKind(newFunKind, action) {
		const oldFunKind = funKind;
		exports.funKind = funKind = newFunKind;
		action();
		exports.funKind = funKind = oldFunKind;
	}

	function withLoop(newLoop, action) {
		const oldLoop = opLoop;
		exports.opLoop = opLoop = newLoop;
		action();
		exports.opLoop = opLoop = oldLoop;
	}

	function withMethod(newMethod, action) {
		const oldMethod = method;
		exports.method = method = newMethod;
		action();
		exports.method = method = oldMethod;
	}

	function withName(newName, action) {
		const oldName = name;
		exports.name = name = newName;
		action();
		exports.name = name = oldName;
	}

	function withIife(action) {
		withLoop(null, action);
	}

	function withIifeIf(cond, action) {
		if (cond) withIife(action);else action();
	}

	function withIifeIfVal(sk, action) {
		withIifeIf(sk === _SK2.default.Val, action);
	}

	function setPendingBlockLocals(val) {
		exports.pendingBlockLocals = pendingBlockLocals = val;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FvQ2dCLEtBQUssR0FBTCxLQUFLO1NBV0wsUUFBUSxHQUFSLFFBQVE7U0FJUixhQUFhLEdBQWIsYUFBYTtTQU9iLFFBQVEsR0FBUixRQUFRO1NBT1IsVUFBVSxHQUFWLFVBQVU7U0FPVixRQUFRLEdBQVIsUUFBUTtTQVFSLFFBQVEsR0FBUixRQUFRO1NBSVIsVUFBVSxHQUFWLFVBQVU7U0FRVixhQUFhLEdBQWIsYUFBYTtTQUtiLHFCQUFxQixHQUFyQixxQkFBcUI7Ozs7Ozs7Ozs7OztLQTVGMUIsTUFBTSxXQUFOLE1BQU07S0FFTixVQUFVLFdBQVYsVUFBVTtLQUNWLE1BQU0sV0FBTixNQUFNO0tBZU4sa0JBQWtCLFdBQWxCLGtCQUFrQjtLQUtsQixPQUFPLFdBQVAsT0FBTztLQUVQLE1BQU0sV0FBTixNQUFNO0tBRU4sT0FBTyxXQUFQLE9BQU87S0FFUCxJQUFJLFdBQUosSUFBSTs7VUFFQyxLQUFLO1VBL0JWLE1BQU0sR0FnQ2hCLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRTtVQWRSLGtCQUFrQixHQWU1QixrQkFBa0IsR0FBRyxFQUFFO1VBVmIsT0FBTyxHQVdqQixPQUFPLEdBQUcsT0F2Q0gsSUFBSSxDQXVDSSxLQUFLO1VBaENWLFVBQVUsR0FpQ3BCLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRTtVQWhDWixNQUFNLEdBaUNoQixNQUFNLEdBQUcsSUFBSTtVQVhILE1BQU0sR0FZaEIsTUFBTSxHQUFHLElBQUk7VUFWSCxPQUFPLEdBV2pCLE9BQU8sR0FBRyw2QkFBbUI7OztVQUlkLFFBQVE7VUExQ2IsTUFBTSxHQTJDaEIsTUFBTSxXQXpDSSxVQUFVLEdBeUNYLFVBQVUsV0F4Q1QsTUFBTSxHQXdDTSxNQUFNLFdBekJsQixrQkFBa0IsR0F5Qkcsa0JBQWtCLFdBbEJ2QyxNQUFNLEdBa0JvQyxNQUFNLFdBaEJoRCxPQUFPLEdBZ0I0QyxPQUFPLEdBQUcsSUFBSTs7O1VBRzVELGFBQWE7O1VBdkJsQixPQUFPLEdBeUJqQixPQUFPLEdBQUcsVUFBVTs7VUF6QlYsT0FBTyxHQTJCakIsT0FBTyxHQUFHLFVBQVU7OztVQUdMLFFBQVE7O1VBbERiLE1BQU0sR0FvRGhCLE1BQU0sR0FBRyxPQUFPOztVQXBETixNQUFNLEdBc0RoQixNQUFNLEdBQUcsT0FBTzs7O1VBR0QsVUFBVTs7VUFuQ2YsTUFBTSxHQXFDaEIsTUFBTSxHQUFHLFNBQVM7O1VBckNSLE1BQU0sR0F1Q2hCLE1BQU0sR0FBRyxTQUFTOzs7VUFHSCxRQUFROztVQXRDYixJQUFJLEdBd0NkLElBQUksR0FBRyxPQUFPOztVQXhDSixJQUFJLEdBMENkLElBQUksR0FBRyxPQUFPOzs7VUFJQyxRQUFROzs7O1VBSVIsVUFBVTs7OztVQVFWLGFBQWE7Ozs7VUFLYixxQkFBcUI7VUExRTFCLGtCQUFrQixHQTJFNUIsa0JBQWtCLEdBQUcsR0FBRyIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtGdW5zfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCBWZXJpZnlSZXN1bHRzIGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqIE1hcCBmcm9tIG5hbWVzIHRvIExvY2FsRGVjbGFyZXMuICovXG5leHBvcnQgbGV0IGxvY2Fsc1xuLyoqIExvY2FscyB0aGF0IGRvbid0IGhhdmUgdG8gYmUgYWNjZXNzZWQuICovXG5leHBvcnQgbGV0IG9rVG9Ob3RVc2VcbmV4cG9ydCBsZXQgb3BMb29wXG4vKipcbkxvY2FscyBmb3IgdGhpcyBibG9jay5cblRoZXNlIGFyZSBhZGRlZCB0byBsb2NhbHMgd2hlbiBlbnRlcmluZyBhIEZ1bmN0aW9uIG9yIGxhenkgZXZhbHVhdGlvbi5cbkluOlxuXHRhID0gfFxuXHRcdGJcblx0YiA9IDFcbmBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cbkhvd2V2ZXI6XG5cdGEgPSBiXG5cdGIgPSAxXG53aWxsIGZhaWwgdG8gdmVyaWZ5LCBiZWNhdXNlIGBiYCBjb21lcyBhZnRlciBgYWAgYW5kIGlzIG5vdCBhY2Nlc3NlZCBpbnNpZGUgYSBmdW5jdGlvbi5cbkl0IHdvdWxkIHdvcmsgZm9yIGB+YSBpcyBiYCwgdGhvdWdoLlxuKi9cbmV4cG9ydCBsZXQgcGVuZGluZ0Jsb2NrTG9jYWxzXG4vKipcbktpbmQgb2YgZnVuY3Rpb24gd2UgYXJlIGN1cnJlbnRseSBpbi5cbihGdW5zLlBsYWluIGlmIG5vdCBpbiBhIGZ1bmN0aW9uLilcbiovXG5leHBvcnQgbGV0IGZ1bktpbmRcbi8qKiBDdXJyZW50IG1ldGhvZCB3ZSBhcmUgaW4sIG9yIGEgQ29uc3RydWN0b3IsIG9yIG51bGwuICovXG5leHBvcnQgbGV0IG1ldGhvZFxuLyoqIEB0eXBlIHtWZXJpZnlSZXN1bHRzfSAqL1xuZXhwb3J0IGxldCByZXN1bHRzXG4vKiogTmFtZSBvZiB0aGUgY2xvc2VzdCBBc3NpZ25TaW5nbGUuICovXG5leHBvcnQgbGV0IG5hbWVcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCkge1xuXHRsb2NhbHMgPSBuZXcgTWFwKClcblx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gW11cblx0ZnVuS2luZCA9IEZ1bnMuUGxhaW5cblx0b2tUb05vdFVzZSA9IG5ldyBTZXQoKVxuXHRvcExvb3AgPSBudWxsXG5cdG1ldGhvZCA9IG51bGxcblx0cmVzdWx0cyA9IG5ldyBWZXJpZnlSZXN1bHRzKClcbn1cblxuLy8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duKCkge1xuXHRsb2NhbHMgPSBva1RvTm90VXNlID0gb3BMb29wID0gcGVuZGluZ0Jsb2NrTG9jYWxzID0gbWV0aG9kID0gcmVzdWx0cyA9IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJbkZ1bktpbmQobmV3RnVuS2luZCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZEZ1bktpbmQgPSBmdW5LaW5kXG5cdGZ1bktpbmQgPSBuZXdGdW5LaW5kXG5cdGFjdGlvbigpXG5cdGZ1bktpbmQgPSBvbGRGdW5LaW5kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTG9vcChuZXdMb29wLCBhY3Rpb24pIHtcblx0Y29uc3Qgb2xkTG9vcCA9IG9wTG9vcFxuXHRvcExvb3AgPSBuZXdMb29wXG5cdGFjdGlvbigpXG5cdG9wTG9vcCA9IG9sZExvb3Bcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhNZXRob2QobmV3TWV0aG9kLCBhY3Rpb24pIHtcblx0Y29uc3Qgb2xkTWV0aG9kID0gbWV0aG9kXG5cdG1ldGhvZCA9IG5ld01ldGhvZFxuXHRhY3Rpb24oKVxuXHRtZXRob2QgPSBvbGRNZXRob2Rcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhOYW1lKG5ld05hbWUsIGFjdGlvbikge1xuXHRjb25zdCBvbGROYW1lID0gbmFtZVxuXHRuYW1lID0gbmV3TmFtZVxuXHRhY3Rpb24oKVxuXHRuYW1lID0gb2xkTmFtZVxufVxuXG4vKiogQ2FuJ3QgYnJlYWsgb3V0IG9mIGxvb3AgaW5zaWRlIG9mIElJRkUuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aElpZmUoYWN0aW9uKSB7XG5cdHdpdGhMb29wKG51bGwsIGFjdGlvbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJaWZlSWYoY29uZCwgYWN0aW9uKSB7XG5cdGlmIChjb25kKVxuXHRcdHdpdGhJaWZlKGFjdGlvbilcblx0ZWxzZVxuXHRcdGFjdGlvbigpXG59XG5cbi8qKiBUaGUgdmFsdWUgZm9ybSBvZiBzb21lIGV4cHJlc3Npb25zIG5lZWQgdG8gYmUgd3JhcHBlZCBpbiBhbiBJSUZFLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJaWZlSWZWYWwoc2ssIGFjdGlvbikge1xuXHR3aXRoSWlmZUlmKHNrID09PSBTSy5WYWwsIGFjdGlvbilcbn1cblxuLy8gVE9ETzpFUzYgU2hvdWxkbid0IG5lZWQgdGhpc1xuZXhwb3J0IGZ1bmN0aW9uIHNldFBlbmRpbmdCbG9ja0xvY2Fscyh2YWwpIHtcblx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gdmFsXG59XG4iXX0=
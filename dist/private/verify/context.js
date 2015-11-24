'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../VerifyResults', './locals', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../VerifyResults'), require('./locals'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.VerifyResults, global.locals, global.SK);
		global.context = mod.exports;
	}
})(this, function (exports, _MsAst, _VerifyResults, _locals, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.isInSwitch = exports.name = exports.results = exports.method = exports.funKind = exports.pendingBlockLocals = exports.opLoop = exports.okToNotUse = exports.locals = undefined;
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
	exports.withInSwitch = withInSwitch;
	exports.withFun = withFun;

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
	let isInSwitch = exports.isInSwitch = undefined;

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
		withLoop(null, () => {
			withInSwitch(false, action);
		});
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

	function withInSwitch(newInSwitch, action) {
		const oldInSwitch = isInSwitch;
		exports.isInSwitch = isInSwitch = newInSwitch;
		action();
		exports.isInSwitch = isInSwitch = oldInSwitch;
	}

	function withFun(funKind, action) {
		(0, _locals.withBlockLocals)(() => {
			withInFunKind(funKind, () => {
				withIife(action);
			});
		});
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0EwQ2dCLEtBQUssR0FBTCxLQUFLO1NBV0wsUUFBUSxHQUFSLFFBQVE7U0FJUixhQUFhLEdBQWIsYUFBYTtTQU9iLFFBQVEsR0FBUixRQUFRO1NBT1IsVUFBVSxHQUFWLFVBQVU7U0FPVixRQUFRLEdBQVIsUUFBUTtTQVFSLFFBQVEsR0FBUixRQUFRO1NBTVIsVUFBVSxHQUFWLFVBQVU7U0FRVixhQUFhLEdBQWIsYUFBYTtTQUtiLHFCQUFxQixHQUFyQixxQkFBcUI7U0FJckIsWUFBWSxHQUFaLFlBQVk7U0FPWixPQUFPLEdBQVAsT0FBTzs7Ozs7Ozs7Ozs7O0tBOUdaLE1BQU0sV0FBTixNQUFNO0tBRU4sVUFBVSxXQUFWLFVBQVU7S0FDVixNQUFNLFdBQU4sTUFBTTtLQWVOLGtCQUFrQixXQUFsQixrQkFBa0I7S0FLbEIsT0FBTyxXQUFQLE9BQU87S0FFUCxNQUFNLFdBQU4sTUFBTTtLQUVOLE9BQU8sV0FBUCxPQUFPO0tBRVAsSUFBSSxXQUFKLElBQUk7S0FLSixVQUFVLFdBQVYsVUFBVTs7VUFFTCxLQUFLO1VBcENWLE1BQU0sR0FxQ2hCLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRTtVQW5CUixrQkFBa0IsR0FvQjVCLGtCQUFrQixHQUFHLEVBQUU7VUFmYixPQUFPLEdBZ0JqQixPQUFPLEdBQUcsT0E3Q0gsSUFBSSxDQTZDSSxLQUFLO1VBckNWLFVBQVUsR0FzQ3BCLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRTtVQXJDWixNQUFNLEdBc0NoQixNQUFNLEdBQUcsSUFBSTtVQWhCSCxNQUFNLEdBaUJoQixNQUFNLEdBQUcsSUFBSTtVQWZILE9BQU8sR0FnQmpCLE9BQU8sR0FBRyw2QkFBbUI7OztVQUlkLFFBQVE7VUEvQ2IsTUFBTSxHQWdEaEIsTUFBTSxXQTlDSSxVQUFVLEdBOENYLFVBQVUsV0E3Q1QsTUFBTSxHQTZDTSxNQUFNLFdBOUJsQixrQkFBa0IsR0E4Qkcsa0JBQWtCLFdBdkJ2QyxNQUFNLEdBdUJvQyxNQUFNLFdBckJoRCxPQUFPLEdBcUI0QyxPQUFPLEdBQUcsSUFBSTs7O1VBRzVELGFBQWE7O1VBNUJsQixPQUFPLEdBOEJqQixPQUFPLEdBQUcsVUFBVTs7VUE5QlYsT0FBTyxHQWdDakIsT0FBTyxHQUFHLFVBQVU7OztVQUdMLFFBQVE7O1VBdkRiLE1BQU0sR0F5RGhCLE1BQU0sR0FBRyxPQUFPOztVQXpETixNQUFNLEdBMkRoQixNQUFNLEdBQUcsT0FBTzs7O1VBR0QsVUFBVTs7VUF4Q2YsTUFBTSxHQTBDaEIsTUFBTSxHQUFHLFNBQVM7O1VBMUNSLE1BQU0sR0E0Q2hCLE1BQU0sR0FBRyxTQUFTOzs7VUFHSCxRQUFROztVQTNDYixJQUFJLEdBNkNkLElBQUksR0FBRyxPQUFPOztVQTdDSixJQUFJLEdBK0NkLElBQUksR0FBRyxPQUFPOzs7VUFJQyxRQUFROzs7Ozs7VUFNUixVQUFVOzs7O1VBUVYsYUFBYTs7OztVQUtiLHFCQUFxQjtVQWpGMUIsa0JBQWtCLEdBa0Y1QixrQkFBa0IsR0FBRyxHQUFHOzs7VUFHVCxZQUFZOztVQXJFakIsVUFBVSxHQXVFcEIsVUFBVSxHQUFHLFdBQVc7O1VBdkVkLFVBQVUsR0F5RXBCLFVBQVUsR0FBRyxXQUFXOzs7VUFHVCxPQUFPIiwiZmlsZSI6ImNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Z1bnN9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IFZlcmlmeVJlc3VsdHMgZnJvbSAnLi4vVmVyaWZ5UmVzdWx0cydcbmltcG9ydCB7d2l0aEJsb2NrTG9jYWxzfSBmcm9tICcuL2xvY2FscydcbmltcG9ydCBTSyBmcm9tICcuL1NLJ1xuXG4vKiogTWFwIGZyb20gbmFtZXMgdG8gTG9jYWxEZWNsYXJlcy4gKi9cbmV4cG9ydCBsZXQgbG9jYWxzXG4vKiogTG9jYWxzIHRoYXQgZG9uJ3QgaGF2ZSB0byBiZSBhY2Nlc3NlZC4gKi9cbmV4cG9ydCBsZXQgb2tUb05vdFVzZVxuZXhwb3J0IGxldCBvcExvb3Bcbi8qKlxuTG9jYWxzIGZvciB0aGlzIGJsb2NrLlxuVGhlc2UgYXJlIGFkZGVkIHRvIGxvY2FscyB3aGVuIGVudGVyaW5nIGEgRnVuY3Rpb24gb3IgbGF6eSBldmFsdWF0aW9uLlxuSW46XG5cdGEgPSB8XG5cdFx0YlxuXHRiID0gMVxuYGJgIHdpbGwgYmUgYSBwZW5kaW5nIGxvY2FsLlxuSG93ZXZlcjpcblx0YSA9IGJcblx0YiA9IDFcbndpbGwgZmFpbCB0byB2ZXJpZnksIGJlY2F1c2UgYGJgIGNvbWVzIGFmdGVyIGBhYCBhbmQgaXMgbm90IGFjY2Vzc2VkIGluc2lkZSBhIGZ1bmN0aW9uLlxuSXQgd291bGQgd29yayBmb3IgYH5hIGlzIGJgLCB0aG91Z2guXG4qL1xuZXhwb3J0IGxldCBwZW5kaW5nQmxvY2tMb2NhbHNcbi8qKlxuS2luZCBvZiBmdW5jdGlvbiB3ZSBhcmUgY3VycmVudGx5IGluLlxuKEZ1bnMuUGxhaW4gaWYgbm90IGluIGEgZnVuY3Rpb24uKVxuKi9cbmV4cG9ydCBsZXQgZnVuS2luZFxuLyoqIEN1cnJlbnQgbWV0aG9kIHdlIGFyZSBpbiwgb3IgYSBDb25zdHJ1Y3Rvciwgb3IgbnVsbC4gKi9cbmV4cG9ydCBsZXQgbWV0aG9kXG4vKiogQHR5cGUge1ZlcmlmeVJlc3VsdHN9ICovXG5leHBvcnQgbGV0IHJlc3VsdHNcbi8qKiBOYW1lIG9mIHRoZSBjbG9zZXN0IEFzc2lnblNpbmdsZS4gKi9cbmV4cG9ydCBsZXQgbmFtZVxuLyoqXG5XaGV0aGVyIHdlJ3JlIGluIGEgYHN3aXRjaGAgaW5zaWRlIG9mIGEgYGZvcmAuXG5JZiB0aGVyZSdzIGEgYGJyZWFrYCBzdGF0ZW1lbnQsIHRoZSBsb29wIHdpbGwgbmVlZCBhIGxhYmVsLlxuKi9cbmV4cG9ydCBsZXQgaXNJblN3aXRjaFxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKSB7XG5cdGxvY2FscyA9IG5ldyBNYXAoKVxuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSBbXVxuXHRmdW5LaW5kID0gRnVucy5QbGFpblxuXHRva1RvTm90VXNlID0gbmV3IFNldCgpXG5cdG9wTG9vcCA9IG51bGxcblx0bWV0aG9kID0gbnVsbFxuXHRyZXN1bHRzID0gbmV3IFZlcmlmeVJlc3VsdHMoKVxufVxuXG4vLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5leHBvcnQgZnVuY3Rpb24gdGVhckRvd24oKSB7XG5cdGxvY2FscyA9IG9rVG9Ob3RVc2UgPSBvcExvb3AgPSBwZW5kaW5nQmxvY2tMb2NhbHMgPSBtZXRob2QgPSByZXN1bHRzID0gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aEluRnVuS2luZChuZXdGdW5LaW5kLCBhY3Rpb24pIHtcblx0Y29uc3Qgb2xkRnVuS2luZCA9IGZ1bktpbmRcblx0ZnVuS2luZCA9IG5ld0Z1bktpbmRcblx0YWN0aW9uKClcblx0ZnVuS2luZCA9IG9sZEZ1bktpbmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMb29wKG5ld0xvb3AsIGFjdGlvbikge1xuXHRjb25zdCBvbGRMb29wID0gb3BMb29wXG5cdG9wTG9vcCA9IG5ld0xvb3Bcblx0YWN0aW9uKClcblx0b3BMb29wID0gb2xkTG9vcFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aE1ldGhvZChuZXdNZXRob2QsIGFjdGlvbikge1xuXHRjb25zdCBvbGRNZXRob2QgPSBtZXRob2Rcblx0bWV0aG9kID0gbmV3TWV0aG9kXG5cdGFjdGlvbigpXG5cdG1ldGhvZCA9IG9sZE1ldGhvZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aE5hbWUobmV3TmFtZSwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZE5hbWUgPSBuYW1lXG5cdG5hbWUgPSBuZXdOYW1lXG5cdGFjdGlvbigpXG5cdG5hbWUgPSBvbGROYW1lXG59XG5cbi8qKiBDYW4ndCBicmVhayBvdXQgb2YgbG9vcCBpbnNpZGUgb2YgSUlGRS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSWlmZShhY3Rpb24pIHtcblx0d2l0aExvb3AobnVsbCwgKCkgPT4ge1xuXHRcdHdpdGhJblN3aXRjaChmYWxzZSwgYWN0aW9uKVxuXHR9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aElpZmVJZihjb25kLCBhY3Rpb24pIHtcblx0aWYgKGNvbmQpXG5cdFx0d2l0aElpZmUoYWN0aW9uKVxuXHRlbHNlXG5cdFx0YWN0aW9uKClcbn1cblxuLyoqIFRoZSB2YWx1ZSBmb3JtIG9mIHNvbWUgZXhwcmVzc2lvbnMgbmVlZCB0byBiZSB3cmFwcGVkIGluIGFuIElJRkUuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aElpZmVJZlZhbChzaywgYWN0aW9uKSB7XG5cdHdpdGhJaWZlSWYoc2sgPT09IFNLLlZhbCwgYWN0aW9uKVxufVxuXG4vLyBUT0RPOkVTNiBTaG91bGRuJ3QgbmVlZCB0aGlzXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVuZGluZ0Jsb2NrTG9jYWxzKHZhbCkge1xuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSB2YWxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJblN3aXRjaChuZXdJblN3aXRjaCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZEluU3dpdGNoID0gaXNJblN3aXRjaFxuXHRpc0luU3dpdGNoID0gbmV3SW5Td2l0Y2hcblx0YWN0aW9uKClcblx0aXNJblN3aXRjaCA9IG9sZEluU3dpdGNoXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRnVuKGZ1bktpbmQsIGFjdGlvbikge1xuXHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4ge1xuXHRcdHdpdGhJbkZ1bktpbmQoZnVuS2luZCwgKCkgPT4ge1xuXHRcdFx0d2l0aElpZmUoYWN0aW9uKVxuXHRcdH0pXG5cdH0pXG59XG4iXX0=
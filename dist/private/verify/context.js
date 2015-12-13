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
	exports.withLoop = withLoop;
	exports.withMethod = withMethod;
	exports.withName = withName;
	exports.withIife = withIife;
	exports.withIifeIf = withIifeIf;
	exports.withIifeIfVal = withIifeIfVal;
	exports.setPendingBlockLocals = setPendingBlockLocals;
	exports.withInSwitch = withInSwitch;
	exports.withFun = withFun;
	exports.withMethods = withMethods;

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

	function withMethods(action) {
		withFun(_MsAst.Funs.Plain, action);
	}

	function withInFunKind(newFunKind, action) {
		const oldFunKind = funKind;
		exports.funKind = funKind = newFunKind;
		action();
		exports.funKind = funKind = oldFunKind;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0EwQ2dCLEtBQUssR0FBTCxLQUFLO1NBV0wsUUFBUSxHQUFSLFFBQVE7U0FJUixRQUFRLEdBQVIsUUFBUTtTQU9SLFVBQVUsR0FBVixVQUFVO1NBT1YsUUFBUSxHQUFSLFFBQVE7U0FRUixRQUFRLEdBQVIsUUFBUTtTQU1SLFVBQVUsR0FBVixVQUFVO1NBUVYsYUFBYSxHQUFiLGFBQWE7U0FLYixxQkFBcUIsR0FBckIscUJBQXFCO1NBSXJCLFlBQVksR0FBWixZQUFZO1NBT1osT0FBTyxHQUFQLE9BQU87U0FRUCxXQUFXLEdBQVgsV0FBVzs7Ozs7Ozs7Ozs7O0tBL0doQixNQUFNLFdBQU4sTUFBTTtLQUVOLFVBQVUsV0FBVixVQUFVO0tBQ1YsTUFBTSxXQUFOLE1BQU07S0FlTixrQkFBa0IsV0FBbEIsa0JBQWtCO0tBS2xCLE9BQU8sV0FBUCxPQUFPO0tBRVAsTUFBTSxXQUFOLE1BQU07S0FFTixPQUFPLFdBQVAsT0FBTztLQUVQLElBQUksV0FBSixJQUFJO0tBS0osVUFBVSxXQUFWLFVBQVU7O1VBRUwsS0FBSztVQXBDVixNQUFNLEdBcUNoQixNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7VUFuQlIsa0JBQWtCLEdBb0I1QixrQkFBa0IsR0FBRyxFQUFFO1VBZmIsT0FBTyxHQWdCakIsT0FBTyxHQUFHLFlBQUssS0FBSztVQXJDVixVQUFVLEdBc0NwQixVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUU7VUFyQ1osTUFBTSxHQXNDaEIsTUFBTSxHQUFHLElBQUk7VUFoQkgsTUFBTSxHQWlCaEIsTUFBTSxHQUFHLElBQUk7VUFmSCxPQUFPLEdBZ0JqQixPQUFPLEdBQUcsNkJBQW1COzs7VUFJZCxRQUFRO1VBL0NiLE1BQU0sR0FnRGhCLE1BQU0sV0E5Q0ksVUFBVSxHQThDWCxVQUFVLFdBN0NULE1BQU0sR0E2Q00sTUFBTSxXQTlCbEIsa0JBQWtCLEdBOEJHLGtCQUFrQixXQXZCdkMsTUFBTSxHQXVCb0MsTUFBTSxXQXJCaEQsT0FBTyxHQXFCNEMsT0FBTyxHQUFHLElBQUk7OztVQUc1RCxRQUFROztVQWhEYixNQUFNLEdBa0RoQixNQUFNLEdBQUcsT0FBTzs7VUFsRE4sTUFBTSxHQW9EaEIsTUFBTSxHQUFHLE9BQU87OztVQUdELFVBQVU7O1VBakNmLE1BQU0sR0FtQ2hCLE1BQU0sR0FBRyxTQUFTOztVQW5DUixNQUFNLEdBcUNoQixNQUFNLEdBQUcsU0FBUzs7O1VBR0gsUUFBUTs7VUFwQ2IsSUFBSSxHQXNDZCxJQUFJLEdBQUcsT0FBTzs7VUF0Q0osSUFBSSxHQXdDZCxJQUFJLEdBQUcsT0FBTzs7O1VBSUMsUUFBUTs7Ozs7O1VBTVIsVUFBVTs7OztVQVFWLGFBQWE7Ozs7VUFLYixxQkFBcUI7VUExRTFCLGtCQUFrQixHQTJFNUIsa0JBQWtCLEdBQUcsR0FBRzs7O1VBR1QsWUFBWTs7VUE5RGpCLFVBQVUsR0FnRXBCLFVBQVUsR0FBRyxXQUFXOztVQWhFZCxVQUFVLEdBa0VwQixVQUFVLEdBQUcsV0FBVzs7O1VBR1QsT0FBTzs7Ozs7Ozs7VUFRUCxXQUFXOzs7Ozs7VUF4RmhCLE9BQU8sR0E4RmpCLE9BQU8sR0FBRyxVQUFVOztVQTlGVixPQUFPLEdBZ0dqQixPQUFPLEdBQUcsVUFBVSIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtGdW5zfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCBWZXJpZnlSZXN1bHRzIGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQge3dpdGhCbG9ja0xvY2Fsc30gZnJvbSAnLi9sb2NhbHMnXG5pbXBvcnQgU0sgZnJvbSAnLi9TSydcblxuLyoqIE1hcCBmcm9tIG5hbWVzIHRvIExvY2FsRGVjbGFyZXMuICovXG5leHBvcnQgbGV0IGxvY2Fsc1xuLyoqIExvY2FscyB0aGF0IGRvbid0IGhhdmUgdG8gYmUgYWNjZXNzZWQuICovXG5leHBvcnQgbGV0IG9rVG9Ob3RVc2VcbmV4cG9ydCBsZXQgb3BMb29wXG4vKipcbkxvY2FscyBmb3IgdGhpcyBibG9jay5cblRoZXNlIGFyZSBhZGRlZCB0byBsb2NhbHMgd2hlbiBlbnRlcmluZyBhIEZ1bmN0aW9uIG9yIGxhenkgZXZhbHVhdGlvbi5cbkluOlxuXHRhID0gfFxuXHRcdGJcblx0YiA9IDFcbmBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cbkhvd2V2ZXI6XG5cdGEgPSBiXG5cdGIgPSAxXG53aWxsIGZhaWwgdG8gdmVyaWZ5LCBiZWNhdXNlIGBiYCBjb21lcyBhZnRlciBgYWAgYW5kIGlzIG5vdCBhY2Nlc3NlZCBpbnNpZGUgYSBmdW5jdGlvbi5cbkl0IHdvdWxkIHdvcmsgZm9yIGB+YSBpcyBiYCwgdGhvdWdoLlxuKi9cbmV4cG9ydCBsZXQgcGVuZGluZ0Jsb2NrTG9jYWxzXG4vKipcbktpbmQgb2YgZnVuY3Rpb24gd2UgYXJlIGN1cnJlbnRseSBpbi5cbihGdW5zLlBsYWluIGlmIG5vdCBpbiBhIGZ1bmN0aW9uLilcbiovXG5leHBvcnQgbGV0IGZ1bktpbmRcbi8qKiBDdXJyZW50IG1ldGhvZCB3ZSBhcmUgaW4sIG9yIGEgQ29uc3RydWN0b3IsIG9yIG51bGwuICovXG5leHBvcnQgbGV0IG1ldGhvZFxuLyoqIEB0eXBlIHtWZXJpZnlSZXN1bHRzfSAqL1xuZXhwb3J0IGxldCByZXN1bHRzXG4vKiogTmFtZSBvZiB0aGUgY2xvc2VzdCBBc3NpZ25TaW5nbGUuICovXG5leHBvcnQgbGV0IG5hbWVcbi8qKlxuV2hldGhlciB3ZSdyZSBpbiBhIGBzd2l0Y2hgIGluc2lkZSBvZiBhIGBmb3JgLlxuSWYgdGhlcmUncyBhIGBicmVha2Agc3RhdGVtZW50LCB0aGUgbG9vcCB3aWxsIG5lZWQgYSBsYWJlbC5cbiovXG5leHBvcnQgbGV0IGlzSW5Td2l0Y2hcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCkge1xuXHRsb2NhbHMgPSBuZXcgTWFwKClcblx0cGVuZGluZ0Jsb2NrTG9jYWxzID0gW11cblx0ZnVuS2luZCA9IEZ1bnMuUGxhaW5cblx0b2tUb05vdFVzZSA9IG5ldyBTZXQoKVxuXHRvcExvb3AgPSBudWxsXG5cdG1ldGhvZCA9IG51bGxcblx0cmVzdWx0cyA9IG5ldyBWZXJpZnlSZXN1bHRzKClcbn1cblxuLy8gUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duKCkge1xuXHRsb2NhbHMgPSBva1RvTm90VXNlID0gb3BMb29wID0gcGVuZGluZ0Jsb2NrTG9jYWxzID0gbWV0aG9kID0gcmVzdWx0cyA9IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhMb29wKG5ld0xvb3AsIGFjdGlvbikge1xuXHRjb25zdCBvbGRMb29wID0gb3BMb29wXG5cdG9wTG9vcCA9IG5ld0xvb3Bcblx0YWN0aW9uKClcblx0b3BMb29wID0gb2xkTG9vcFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aE1ldGhvZChuZXdNZXRob2QsIGFjdGlvbikge1xuXHRjb25zdCBvbGRNZXRob2QgPSBtZXRob2Rcblx0bWV0aG9kID0gbmV3TWV0aG9kXG5cdGFjdGlvbigpXG5cdG1ldGhvZCA9IG9sZE1ldGhvZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aE5hbWUobmV3TmFtZSwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZE5hbWUgPSBuYW1lXG5cdG5hbWUgPSBuZXdOYW1lXG5cdGFjdGlvbigpXG5cdG5hbWUgPSBvbGROYW1lXG59XG5cbi8qKiBDYW4ndCBicmVhayBvdXQgb2YgbG9vcCBpbnNpZGUgb2YgSUlGRS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSWlmZShhY3Rpb24pIHtcblx0d2l0aExvb3AobnVsbCwgKCkgPT4ge1xuXHRcdHdpdGhJblN3aXRjaChmYWxzZSwgYWN0aW9uKVxuXHR9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aElpZmVJZihjb25kLCBhY3Rpb24pIHtcblx0aWYgKGNvbmQpXG5cdFx0d2l0aElpZmUoYWN0aW9uKVxuXHRlbHNlXG5cdFx0YWN0aW9uKClcbn1cblxuLyoqIFRoZSB2YWx1ZSBmb3JtIG9mIHNvbWUgZXhwcmVzc2lvbnMgbmVlZCB0byBiZSB3cmFwcGVkIGluIGFuIElJRkUuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aElpZmVJZlZhbChzaywgYWN0aW9uKSB7XG5cdHdpdGhJaWZlSWYoc2sgPT09IFNLLlZhbCwgYWN0aW9uKVxufVxuXG4vLyBUT0RPOkVTNiBTaG91bGRuJ3QgbmVlZCB0aGlzXG5leHBvcnQgZnVuY3Rpb24gc2V0UGVuZGluZ0Jsb2NrTG9jYWxzKHZhbCkge1xuXHRwZW5kaW5nQmxvY2tMb2NhbHMgPSB2YWxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJblN3aXRjaChuZXdJblN3aXRjaCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZEluU3dpdGNoID0gaXNJblN3aXRjaFxuXHRpc0luU3dpdGNoID0gbmV3SW5Td2l0Y2hcblx0YWN0aW9uKClcblx0aXNJblN3aXRjaCA9IG9sZEluU3dpdGNoXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRnVuKGZ1bktpbmQsIGFjdGlvbikge1xuXHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4ge1xuXHRcdHdpdGhJbkZ1bktpbmQoZnVuS2luZCwgKCkgPT4ge1xuXHRcdFx0d2l0aElpZmUoYWN0aW9uKVxuXHRcdH0pXG5cdH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTWV0aG9kcyhhY3Rpb24pIHtcblx0d2l0aEZ1bihGdW5zLlBsYWluLCBhY3Rpb24pXG59XG5cbmZ1bmN0aW9uIHdpdGhJbkZ1bktpbmQobmV3RnVuS2luZCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZEZ1bktpbmQgPSBmdW5LaW5kXG5cdGZ1bktpbmQgPSBuZXdGdW5LaW5kXG5cdGFjdGlvbigpXG5cdGZ1bktpbmQgPSBvbGRGdW5LaW5kXG59XG4iXX0=
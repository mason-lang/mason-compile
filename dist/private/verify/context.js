(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../MsAst', '../VerifyResults'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../MsAst'), require('../VerifyResults'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.VerifyResults);
		global.context = mod.exports;
	}
})(this, function (exports, _MsAst, _VerifyResults) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.setup = setup;
	exports.tearDown = tearDown;
	exports.withInFunKind = withInFunKind;
	exports.withLoop = withLoop;
	exports.withMethod = withMethod;
	exports.withName = withName;
	exports.withIIFE = withIIFE;
	exports.setPendingBlockLocals = setPendingBlockLocals;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	/** Map from names to LocalDeclares. */
	let locals;
	exports.locals = locals;
	/** Locals that don't have to be accessed. */
	let okToNotUse;
	exports.okToNotUse = okToNotUse;
	let opLoop;
	exports.opLoop = opLoop;
	/**
 Locals for this block.
 These are added to locals when entering a Function or lazy evaluation.
 In:
 	a = |
 		b
 	b = 1
 `b` will be a pending local.
 However:
 	a = b
 	b = 1
 will fail to verify, because `b` comes after `a` and is not accessed inside a function.
 It would work for `~a is b`, though.
 */
	let pendingBlockLocals;
	exports.pendingBlockLocals = pendingBlockLocals;
	/**
 Kind of function we are currently in.
 (Funs.Plain if not in a function.)
 */
	let funKind;
	exports.funKind = funKind;
	/** Current method we are in, or a Constructor, or null. */
	let method;
	exports.method = method;
	/** @type {VerifyResults} */
	let results;
	exports.results = results;
	/** Name of the closest AssignSingle. */
	let name;

	exports.name = name;

	function setup() {
		exports.locals = locals = new Map();
		exports.pendingBlockLocals = pendingBlockLocals = [];
		exports.funKind = funKind = _MsAst.Funs.Plain;
		exports.okToNotUse = okToNotUse = new Set();
		exports.opLoop = opLoop = null;
		exports.method = method = null;
		exports.results = results = new _VerifyResults2.default();
	}

	// Release for garbage collection.

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

	// Can't break out of loop inside of IIFE.

	function withIIFE(action) {
		withLoop(false, action);
	}

	// TODO:ES6 Shouldn't need this

	function setPendingBlockLocals(val) {
		exports.pendingBlockLocals = pendingBlockLocals = val;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSU8sS0FBSSxNQUFNLENBQUE7OztBQUVWLEtBQUksVUFBVSxDQUFBOztBQUNkLEtBQUksTUFBTSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZVYsS0FBSSxrQkFBa0IsQ0FBQTs7Ozs7O0FBS3RCLEtBQUksT0FBTyxDQUFBOzs7QUFFWCxLQUFJLE1BQU0sQ0FBQTs7O0FBRVYsS0FBSSxPQUFPLENBQUE7OztBQUVYLEtBQUksSUFBSSxDQUFBOzs7O0FBRVIsVUFBUyxLQUFLLEdBQUc7QUFDdkIsVUFoQ1UsTUFBTSxHQWdDaEIsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDbEIsVUFmVSxrQkFBa0IsR0FlNUIsa0JBQWtCLEdBQUcsRUFBRSxDQUFBO0FBQ3ZCLFVBWFUsT0FBTyxHQVdqQixPQUFPLEdBQUcsT0F0Q0gsSUFBSSxDQXNDSSxLQUFLLENBQUE7QUFDcEIsVUFqQ1UsVUFBVSxHQWlDcEIsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEIsVUFqQ1UsTUFBTSxHQWlDaEIsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNiLFVBWlUsTUFBTSxHQVloQixNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsVUFYVSxPQUFPLEdBV2pCLE9BQU8sR0FBRyw2QkFBbUIsQ0FBQTtFQUM3Qjs7OztBQUdNLFVBQVMsUUFBUSxHQUFHO0FBQzFCLFVBM0NVLE1BQU0sR0EyQ2hCLE1BQU0sV0F6Q0ksVUFBVSxHQXlDWCxVQUFVLFdBeENULE1BQU0sR0F3Q00sTUFBTSxXQXpCbEIsa0JBQWtCLEdBeUJHLGtCQUFrQixXQWxCdkMsTUFBTSxHQWtCb0MsTUFBTSxXQWhCaEQsT0FBTyxHQWdCNEMsT0FBTyxHQUFHLElBQUksQ0FBQTtFQUMzRTs7QUFFTSxVQUFTLGFBQWEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFO0FBQ2pELFFBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQTtBQUMxQixVQXpCVSxPQUFPLEdBeUJqQixPQUFPLEdBQUcsVUFBVSxDQUFBO0FBQ3BCLFFBQU0sRUFBRSxDQUFBO0FBQ1IsVUEzQlUsT0FBTyxHQTJCakIsT0FBTyxHQUFHLFVBQVUsQ0FBQTtFQUNwQjs7QUFFTSxVQUFTLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3pDLFFBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQTtBQUN0QixVQXBEVSxNQUFNLEdBb0RoQixNQUFNLEdBQUcsT0FBTyxDQUFBO0FBQ2hCLFFBQU0sRUFBRSxDQUFBO0FBQ1IsVUF0RFUsTUFBTSxHQXNEaEIsTUFBTSxHQUFHLE9BQU8sQ0FBQTtFQUNoQjs7QUFFTSxVQUFTLFVBQVUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQzdDLFFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQTtBQUN4QixVQXJDVSxNQUFNLEdBcUNoQixNQUFNLEdBQUcsU0FBUyxDQUFBO0FBQ2xCLFFBQU0sRUFBRSxDQUFBO0FBQ1IsVUF2Q1UsTUFBTSxHQXVDaEIsTUFBTSxHQUFHLFNBQVMsQ0FBQTtFQUNsQjs7QUFFTSxVQUFTLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3pDLFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQTtBQUNwQixVQXhDVSxJQUFJLEdBd0NkLElBQUksR0FBRyxPQUFPLENBQUE7QUFDZCxRQUFNLEVBQUUsQ0FBQTtBQUNSLFVBMUNVLElBQUksR0EwQ2QsSUFBSSxHQUFHLE9BQU8sQ0FBQTtFQUNkOzs7O0FBR00sVUFBUyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDdkI7Ozs7QUFHTSxVQUFTLHFCQUFxQixDQUFDLEdBQUcsRUFBRTtBQUMxQyxVQS9EVSxrQkFBa0IsR0ErRDVCLGtCQUFrQixHQUFHLEdBQUcsQ0FBQTtFQUN4QiIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtGdW5zfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCBWZXJpZnlSZXN1bHRzIGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5cbi8qKiBNYXAgZnJvbSBuYW1lcyB0byBMb2NhbERlY2xhcmVzLiAqL1xuZXhwb3J0IGxldCBsb2NhbHNcbi8qKiBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLiAqL1xuZXhwb3J0IGxldCBva1RvTm90VXNlXG5leHBvcnQgbGV0IG9wTG9vcFxuLyoqXG5Mb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5UaGVzZSBhcmUgYWRkZWQgdG8gbG9jYWxzIHdoZW4gZW50ZXJpbmcgYSBGdW5jdGlvbiBvciBsYXp5IGV2YWx1YXRpb24uXG5Jbjpcblx0YSA9IHxcblx0XHRiXG5cdGIgPSAxXG5gYmAgd2lsbCBiZSBhIHBlbmRpbmcgbG9jYWwuXG5Ib3dldmVyOlxuXHRhID0gYlxuXHRiID0gMVxud2lsbCBmYWlsIHRvIHZlcmlmeSwgYmVjYXVzZSBgYmAgY29tZXMgYWZ0ZXIgYGFgIGFuZCBpcyBub3QgYWNjZXNzZWQgaW5zaWRlIGEgZnVuY3Rpb24uXG5JdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cbiovXG5leHBvcnQgbGV0IHBlbmRpbmdCbG9ja0xvY2Fsc1xuLyoqXG5LaW5kIG9mIGZ1bmN0aW9uIHdlIGFyZSBjdXJyZW50bHkgaW4uXG4oRnVucy5QbGFpbiBpZiBub3QgaW4gYSBmdW5jdGlvbi4pXG4qL1xuZXhwb3J0IGxldCBmdW5LaW5kXG4vKiogQ3VycmVudCBtZXRob2Qgd2UgYXJlIGluLCBvciBhIENvbnN0cnVjdG9yLCBvciBudWxsLiAqL1xuZXhwb3J0IGxldCBtZXRob2Rcbi8qKiBAdHlwZSB7VmVyaWZ5UmVzdWx0c30gKi9cbmV4cG9ydCBsZXQgcmVzdWx0c1xuLyoqIE5hbWUgb2YgdGhlIGNsb3Nlc3QgQXNzaWduU2luZ2xlLiAqL1xuZXhwb3J0IGxldCBuYW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcblx0bG9jYWxzID0gbmV3IE1hcCgpXG5cdHBlbmRpbmdCbG9ja0xvY2FscyA9IFtdXG5cdGZ1bktpbmQgPSBGdW5zLlBsYWluXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRtZXRob2QgPSBudWxsXG5cdHJlc3VsdHMgPSBuZXcgVmVyaWZ5UmVzdWx0cygpXG59XG5cbi8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbmV4cG9ydCBmdW5jdGlvbiB0ZWFyRG93bigpIHtcblx0bG9jYWxzID0gb2tUb05vdFVzZSA9IG9wTG9vcCA9IHBlbmRpbmdCbG9ja0xvY2FscyA9IG1ldGhvZCA9IHJlc3VsdHMgPSBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSW5GdW5LaW5kKG5ld0Z1bktpbmQsIGFjdGlvbikge1xuXHRjb25zdCBvbGRGdW5LaW5kID0gZnVuS2luZFxuXHRmdW5LaW5kID0gbmV3RnVuS2luZFxuXHRhY3Rpb24oKVxuXHRmdW5LaW5kID0gb2xkRnVuS2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aExvb3AobmV3TG9vcCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZExvb3AgPSBvcExvb3Bcblx0b3BMb29wID0gbmV3TG9vcFxuXHRhY3Rpb24oKVxuXHRvcExvb3AgPSBvbGRMb29wXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTWV0aG9kKG5ld01ldGhvZCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZE1ldGhvZCA9IG1ldGhvZFxuXHRtZXRob2QgPSBuZXdNZXRob2Rcblx0YWN0aW9uKClcblx0bWV0aG9kID0gb2xkTWV0aG9kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTmFtZShuZXdOYW1lLCBhY3Rpb24pIHtcblx0Y29uc3Qgb2xkTmFtZSA9IG5hbWVcblx0bmFtZSA9IG5ld05hbWVcblx0YWN0aW9uKClcblx0bmFtZSA9IG9sZE5hbWVcbn1cblxuLy8gQ2FuJ3QgYnJlYWsgb3V0IG9mIGxvb3AgaW5zaWRlIG9mIElJRkUuXG5leHBvcnQgZnVuY3Rpb24gd2l0aElJRkUoYWN0aW9uKSB7XG5cdHdpdGhMb29wKGZhbHNlLCBhY3Rpb24pXG59XG5cbi8vIFRPRE86RVM2IFNob3VsZG4ndCBuZWVkIHRoaXNcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZW5kaW5nQmxvY2tMb2NhbHModmFsKSB7XG5cdHBlbmRpbmdCbG9ja0xvY2FscyA9IHZhbFxufVxuIl19
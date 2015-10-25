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
		global.verifyContext = mod.exports;
	}
})(this, function (exports, _MsAst, _VerifyResults) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.setup = setup;
	exports.tearDown = tearDown;
	exports.setName = setName;
	exports.withInFunKind = withInFunKind;
	exports.withLoop = withLoop;
	exports.withMethod = withMethod;
	exports.withName = withName;
	exports.withIIFE = withIIFE;
	exports.setPendingBlockLocals = setPendingBlockLocals;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	//doc all
	//all: consider moving (probably make a locals.js)

	//use actual docs, not comments, for `export lets`
	//convert to multiple `export lets`, not just one big one

	// Use a trick like in parse.js and have everything close over these mutable variables.
	let
	// Map from names to LocalDeclares.
	locals,
	// Locals that don't have to be accessed.
	okToNotUse, opLoop,
	/*
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
	pendingBlockLocals,
	// Kind of function we are currently in. (Funs.Plain if not in a function.)
	funKind,
	// Current method we are in, or a Constructor, or null.
	method, results;
	exports.locals = locals;
	exports.okToNotUse = okToNotUse;
	exports.opLoop = opLoop;
	exports.pendingBlockLocals = pendingBlockLocals;
	exports.funKind = funKind;
	exports.method = method;
	exports.results = results;
	let
	// Name of the closest AssignSingle
	name;

	function setup() {
		exports.locals = locals = new Map();
		exports.pendingBlockLocals = pendingBlockLocals = [];
		exports.funKind = funKind = _MsAst.Funs.Plain;
		exports.okToNotUse = okToNotUse = new Set();
		exports.opLoop = opLoop = null;
		exports.method = method = null;
		exports.results = results = new _VerifyResults2.default();
	}

	//Release for garbage collection.

	function tearDown() {
		exports.locals = locals = exports.okToNotUse = okToNotUse = exports.opLoop = opLoop = exports.pendingBlockLocals = pendingBlockLocals = exports.method = method = exports.results = results = null;
	}

	function setName(expr) {
		results.names.set(expr, name);
	}

	//These functions change verifier state and efficiently return to the old state when finished.

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
		name = newName;
		action();
		name = oldName;
	}

	// Can't break out of loop inside of IIFE.

	function withIIFE(action) {
		withLoop(false, action);
	}

	//TODO:ES6 Shouldn't need

	function setPendingBlockLocals(val) {
		exports.pendingBlockLocals = pendingBlockLocals = val;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnlDb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVVPOztBQUVOLE9BQU07O0FBRU4sV0FBVSxFQUNWLE1BQU07Ozs7Ozs7Ozs7Ozs7OztBQWVOLG1CQUFrQjs7QUFFbEIsUUFBTzs7QUFFUCxPQUFNLEVBQ04sT0FBTyxDQUFBOzs7Ozs7OztBQUNSOztBQUVDLEtBQUksQ0FBQTs7QUFFRSxVQUFTLEtBQUssR0FBRztBQUN2QixVQTdCQSxNQUFNLEdBNkJOLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFVBWkEsa0JBQWtCLEdBWWxCLGtCQUFrQixHQUFHLEVBQUUsQ0FBQTtBQUN2QixVQVhBLE9BQU8sR0FXUCxPQUFPLEdBQUcsT0EzQ0gsSUFBSSxDQTJDSSxLQUFLLENBQUE7QUFDcEIsVUE5QkEsVUFBVSxHQThCVixVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN0QixVQTlCQSxNQUFNLEdBOEJOLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQVpBLE1BQU0sR0FZTixNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2IsVUFaQSxPQUFPLEdBWVAsT0FBTyxHQUFHLDZCQUFtQixDQUFBO0VBQzdCOzs7O0FBR00sVUFBUyxRQUFRLEdBQUc7QUFDMUIsVUF4Q0EsTUFBTSxHQXdDTixNQUFNLFdBdENOLFVBQVUsR0FzQ0QsVUFBVSxXQXJDbkIsTUFBTSxHQXFDZ0IsTUFBTSxXQXRCNUIsa0JBQWtCLEdBc0JhLGtCQUFrQixXQWxCakQsTUFBTSxHQWtCOEMsTUFBTSxXQWpCMUQsT0FBTyxHQWlCc0QsT0FBTyxHQUFHLElBQUksQ0FBQTtFQUMzRTs7QUFFTSxVQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDN0IsU0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0VBQzdCOzs7O0FBSU0sVUFBUyxhQUFhLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRTtBQUNqRCxRQUFNLFVBQVUsR0FBRyxPQUFPLENBQUE7QUFDMUIsVUEvQkEsT0FBTyxHQStCUCxPQUFPLEdBQUcsVUFBVSxDQUFBO0FBQ3BCLFFBQU0sRUFBRSxDQUFBO0FBQ1IsVUFqQ0EsT0FBTyxHQWlDUCxPQUFPLEdBQUcsVUFBVSxDQUFBO0VBQ3BCOztBQUVNLFVBQVMsUUFBUSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDekMsUUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFBO0FBQ3RCLFVBdkRBLE1BQU0sR0F1RE4sTUFBTSxHQUFHLE9BQU8sQ0FBQTtBQUNoQixRQUFNLEVBQUUsQ0FBQTtBQUNSLFVBekRBLE1BQU0sR0F5RE4sTUFBTSxHQUFHLE9BQU8sQ0FBQTtFQUNoQjs7QUFFTSxVQUFTLFVBQVUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFO0FBQzdDLFFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQTtBQUN4QixVQTNDQSxNQUFNLEdBMkNOLE1BQU0sR0FBRyxTQUFTLENBQUE7QUFDbEIsUUFBTSxFQUFFLENBQUE7QUFDUixVQTdDQSxNQUFNLEdBNkNOLE1BQU0sR0FBRyxTQUFTLENBQUE7RUFDbEI7O0FBRU0sVUFBUyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUN6QyxRQUFNLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDcEIsTUFBSSxHQUFHLE9BQU8sQ0FBQTtBQUNkLFFBQU0sRUFBRSxDQUFBO0FBQ1IsTUFBSSxHQUFHLE9BQU8sQ0FBQTtFQUNkOzs7O0FBR00sVUFBUyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ2hDLFVBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDdkI7Ozs7QUFHTSxVQUFTLHFCQUFxQixDQUFDLEdBQUcsRUFBRTtBQUMxQyxVQWxFQSxrQkFBa0IsR0FrRWxCLGtCQUFrQixHQUFHLEdBQUcsQ0FBQTtFQUN4QiIsImZpbGUiOiJ2ZXJpZnlDb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtGdW5zfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCBWZXJpZnlSZXN1bHRzIGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5cbi8vZG9jIGFsbFxuLy9hbGw6IGNvbnNpZGVyIG1vdmluZyAocHJvYmFibHkgbWFrZSBhIGxvY2Fscy5qcylcblxuLy91c2UgYWN0dWFsIGRvY3MsIG5vdCBjb21tZW50cywgZm9yIGBleHBvcnQgbGV0c2Bcbi8vY29udmVydCB0byBtdWx0aXBsZSBgZXhwb3J0IGxldHNgLCBub3QganVzdCBvbmUgYmlnIG9uZVxuXG4vLyBVc2UgYSB0cmljayBsaWtlIGluIHBhcnNlLmpzIGFuZCBoYXZlIGV2ZXJ5dGhpbmcgY2xvc2Ugb3ZlciB0aGVzZSBtdXRhYmxlIHZhcmlhYmxlcy5cbmV4cG9ydCBsZXRcblx0Ly8gTWFwIGZyb20gbmFtZXMgdG8gTG9jYWxEZWNsYXJlcy5cblx0bG9jYWxzLFxuXHQvLyBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLlxuXHRva1RvTm90VXNlLFxuXHRvcExvb3AsXG5cdC8qXG5cdExvY2FscyBmb3IgdGhpcyBibG9jay5cblx0VGhlc2UgYXJlIGFkZGVkIHRvIGxvY2FscyB3aGVuIGVudGVyaW5nIGEgRnVuY3Rpb24gb3IgbGF6eSBldmFsdWF0aW9uLlxuXHRJbjpcblx0XHRhID0gfFxuXHRcdFx0YlxuXHRcdGIgPSAxXG5cdGBiYCB3aWxsIGJlIGEgcGVuZGluZyBsb2NhbC5cblx0SG93ZXZlcjpcblx0XHRhID0gYlxuXHRcdGIgPSAxXG5cdHdpbGwgZmFpbCB0byB2ZXJpZnksIGJlY2F1c2UgYGJgIGNvbWVzIGFmdGVyIGBhYCBhbmQgaXMgbm90IGFjY2Vzc2VkIGluc2lkZSBhIGZ1bmN0aW9uLlxuXHRJdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cblx0Ki9cblx0cGVuZGluZ0Jsb2NrTG9jYWxzLFxuXHQvLyBLaW5kIG9mIGZ1bmN0aW9uIHdlIGFyZSBjdXJyZW50bHkgaW4uIChGdW5zLlBsYWluIGlmIG5vdCBpbiBhIGZ1bmN0aW9uLilcblx0ZnVuS2luZCxcblx0Ly8gQ3VycmVudCBtZXRob2Qgd2UgYXJlIGluLCBvciBhIENvbnN0cnVjdG9yLCBvciBudWxsLlxuXHRtZXRob2QsXG5cdHJlc3VsdHNcbmxldFxuXHQvLyBOYW1lIG9mIHRoZSBjbG9zZXN0IEFzc2lnblNpbmdsZVxuXHRuYW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcblx0bG9jYWxzID0gbmV3IE1hcCgpXG5cdHBlbmRpbmdCbG9ja0xvY2FscyA9IFtdXG5cdGZ1bktpbmQgPSBGdW5zLlBsYWluXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRtZXRob2QgPSBudWxsXG5cdHJlc3VsdHMgPSBuZXcgVmVyaWZ5UmVzdWx0cygpXG59XG5cbi8vUmVsZWFzZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duKCkge1xuXHRsb2NhbHMgPSBva1RvTm90VXNlID0gb3BMb29wID0gcGVuZGluZ0Jsb2NrTG9jYWxzID0gbWV0aG9kID0gcmVzdWx0cyA9IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE5hbWUoZXhwcikge1xuXHRyZXN1bHRzLm5hbWVzLnNldChleHByLCBuYW1lKVxufVxuXG4vL1RoZXNlIGZ1bmN0aW9ucyBjaGFuZ2UgdmVyaWZpZXIgc3RhdGUgYW5kIGVmZmljaWVudGx5IHJldHVybiB0byB0aGUgb2xkIHN0YXRlIHdoZW4gZmluaXNoZWQuXG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSW5GdW5LaW5kKG5ld0Z1bktpbmQsIGFjdGlvbikge1xuXHRjb25zdCBvbGRGdW5LaW5kID0gZnVuS2luZFxuXHRmdW5LaW5kID0gbmV3RnVuS2luZFxuXHRhY3Rpb24oKVxuXHRmdW5LaW5kID0gb2xkRnVuS2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aExvb3AobmV3TG9vcCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZExvb3AgPSBvcExvb3Bcblx0b3BMb29wID0gbmV3TG9vcFxuXHRhY3Rpb24oKVxuXHRvcExvb3AgPSBvbGRMb29wXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTWV0aG9kKG5ld01ldGhvZCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZE1ldGhvZCA9IG1ldGhvZFxuXHRtZXRob2QgPSBuZXdNZXRob2Rcblx0YWN0aW9uKClcblx0bWV0aG9kID0gb2xkTWV0aG9kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTmFtZShuZXdOYW1lLCBhY3Rpb24pIHtcblx0Y29uc3Qgb2xkTmFtZSA9IG5hbWVcblx0bmFtZSA9IG5ld05hbWVcblx0YWN0aW9uKClcblx0bmFtZSA9IG9sZE5hbWVcbn1cblxuLy8gQ2FuJ3QgYnJlYWsgb3V0IG9mIGxvb3AgaW5zaWRlIG9mIElJRkUuXG5leHBvcnQgZnVuY3Rpb24gd2l0aElJRkUoYWN0aW9uKSB7XG5cdHdpdGhMb29wKGZhbHNlLCBhY3Rpb24pXG59XG5cbi8vVE9ETzpFUzYgU2hvdWxkbid0IG5lZWRcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZW5kaW5nQmxvY2tMb2NhbHModmFsKSB7XG5cdHBlbmRpbmdCbG9ja0xvY2FscyA9IHZhbFxufVxuIl19
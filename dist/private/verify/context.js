'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../VerifyResults'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../VerifyResults'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.VerifyResults);
		global.context = mod.exports;
	}
})(this, function (exports, _MsAst, _VerifyResults) {
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
	exports.withIIFE = withIIFE;
	exports.setPendingBlockLocals = setPendingBlockLocals;

	var _VerifyResults2 = _interopRequireDefault(_VerifyResults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

	function withIIFE(action) {
		withLoop(false, action);
	}

	function setPendingBlockLocals(val) {
		exports.pendingBlockLocals = pendingBlockLocals = val;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FtQ2dCLEtBQUssR0FBTCxLQUFLO1NBV0wsUUFBUSxHQUFSLFFBQVE7U0FJUixhQUFhLEdBQWIsYUFBYTtTQU9iLFFBQVEsR0FBUixRQUFRO1NBT1IsVUFBVSxHQUFWLFVBQVU7U0FPVixRQUFRLEdBQVIsUUFBUTtTQVFSLFFBQVEsR0FBUixRQUFRO1NBS1IscUJBQXFCLEdBQXJCLHFCQUFxQjs7Ozs7O0tBaEYxQixNQUFNLFdBQU4sTUFBTTtLQUVOLFVBQVUsV0FBVixVQUFVO0tBQ1YsTUFBTSxXQUFOLE1BQU07S0FlTixrQkFBa0IsV0FBbEIsa0JBQWtCO0tBS2xCLE9BQU8sV0FBUCxPQUFPO0tBRVAsTUFBTSxXQUFOLE1BQU07S0FFTixPQUFPLFdBQVAsT0FBTztLQUVQLElBQUksV0FBSixJQUFJOztVQUVDLEtBQUs7VUEvQlYsTUFBTSxHQWdDaEIsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO1VBZFIsa0JBQWtCLEdBZTVCLGtCQUFrQixHQUFHLEVBQUU7VUFWYixPQUFPLEdBV2pCLE9BQU8sR0FBRyxPQXRDSCxJQUFJLENBc0NJLEtBQUs7VUFoQ1YsVUFBVSxHQWlDcEIsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFO1VBaENaLE1BQU0sR0FpQ2hCLE1BQU0sR0FBRyxJQUFJO1VBWEgsTUFBTSxHQVloQixNQUFNLEdBQUcsSUFBSTtVQVZILE9BQU8sR0FXakIsT0FBTyxHQUFHLDZCQUFtQjs7O1VBSWQsUUFBUTtVQTFDYixNQUFNLEdBMkNoQixNQUFNLFdBekNJLFVBQVUsR0F5Q1gsVUFBVSxXQXhDVCxNQUFNLEdBd0NNLE1BQU0sV0F6QmxCLGtCQUFrQixHQXlCRyxrQkFBa0IsV0FsQnZDLE1BQU0sR0FrQm9DLE1BQU0sV0FoQmhELE9BQU8sR0FnQjRDLE9BQU8sR0FBRyxJQUFJOzs7VUFHNUQsYUFBYTs7VUF2QmxCLE9BQU8sR0F5QmpCLE9BQU8sR0FBRyxVQUFVOztVQXpCVixPQUFPLEdBMkJqQixPQUFPLEdBQUcsVUFBVTs7O1VBR0wsUUFBUTs7VUFsRGIsTUFBTSxHQW9EaEIsTUFBTSxHQUFHLE9BQU87O1VBcEROLE1BQU0sR0FzRGhCLE1BQU0sR0FBRyxPQUFPOzs7VUFHRCxVQUFVOztVQW5DZixNQUFNLEdBcUNoQixNQUFNLEdBQUcsU0FBUzs7VUFyQ1IsTUFBTSxHQXVDaEIsTUFBTSxHQUFHLFNBQVM7OztVQUdILFFBQVE7O1VBdENiLElBQUksR0F3Q2QsSUFBSSxHQUFHLE9BQU87O1VBeENKLElBQUksR0EwQ2QsSUFBSSxHQUFHLE9BQU87OztVQUlDLFFBQVE7Ozs7VUFLUixxQkFBcUI7VUE5RDFCLGtCQUFrQixHQStENUIsa0JBQWtCLEdBQUcsR0FBRyIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtGdW5zfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCBWZXJpZnlSZXN1bHRzIGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5cbi8qKiBNYXAgZnJvbSBuYW1lcyB0byBMb2NhbERlY2xhcmVzLiAqL1xuZXhwb3J0IGxldCBsb2NhbHNcbi8qKiBMb2NhbHMgdGhhdCBkb24ndCBoYXZlIHRvIGJlIGFjY2Vzc2VkLiAqL1xuZXhwb3J0IGxldCBva1RvTm90VXNlXG5leHBvcnQgbGV0IG9wTG9vcFxuLyoqXG5Mb2NhbHMgZm9yIHRoaXMgYmxvY2suXG5UaGVzZSBhcmUgYWRkZWQgdG8gbG9jYWxzIHdoZW4gZW50ZXJpbmcgYSBGdW5jdGlvbiBvciBsYXp5IGV2YWx1YXRpb24uXG5Jbjpcblx0YSA9IHxcblx0XHRiXG5cdGIgPSAxXG5gYmAgd2lsbCBiZSBhIHBlbmRpbmcgbG9jYWwuXG5Ib3dldmVyOlxuXHRhID0gYlxuXHRiID0gMVxud2lsbCBmYWlsIHRvIHZlcmlmeSwgYmVjYXVzZSBgYmAgY29tZXMgYWZ0ZXIgYGFgIGFuZCBpcyBub3QgYWNjZXNzZWQgaW5zaWRlIGEgZnVuY3Rpb24uXG5JdCB3b3VsZCB3b3JrIGZvciBgfmEgaXMgYmAsIHRob3VnaC5cbiovXG5leHBvcnQgbGV0IHBlbmRpbmdCbG9ja0xvY2Fsc1xuLyoqXG5LaW5kIG9mIGZ1bmN0aW9uIHdlIGFyZSBjdXJyZW50bHkgaW4uXG4oRnVucy5QbGFpbiBpZiBub3QgaW4gYSBmdW5jdGlvbi4pXG4qL1xuZXhwb3J0IGxldCBmdW5LaW5kXG4vKiogQ3VycmVudCBtZXRob2Qgd2UgYXJlIGluLCBvciBhIENvbnN0cnVjdG9yLCBvciBudWxsLiAqL1xuZXhwb3J0IGxldCBtZXRob2Rcbi8qKiBAdHlwZSB7VmVyaWZ5UmVzdWx0c30gKi9cbmV4cG9ydCBsZXQgcmVzdWx0c1xuLyoqIE5hbWUgb2YgdGhlIGNsb3Nlc3QgQXNzaWduU2luZ2xlLiAqL1xuZXhwb3J0IGxldCBuYW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpIHtcblx0bG9jYWxzID0gbmV3IE1hcCgpXG5cdHBlbmRpbmdCbG9ja0xvY2FscyA9IFtdXG5cdGZ1bktpbmQgPSBGdW5zLlBsYWluXG5cdG9rVG9Ob3RVc2UgPSBuZXcgU2V0KClcblx0b3BMb29wID0gbnVsbFxuXHRtZXRob2QgPSBudWxsXG5cdHJlc3VsdHMgPSBuZXcgVmVyaWZ5UmVzdWx0cygpXG59XG5cbi8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbmV4cG9ydCBmdW5jdGlvbiB0ZWFyRG93bigpIHtcblx0bG9jYWxzID0gb2tUb05vdFVzZSA9IG9wTG9vcCA9IHBlbmRpbmdCbG9ja0xvY2FscyA9IG1ldGhvZCA9IHJlc3VsdHMgPSBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSW5GdW5LaW5kKG5ld0Z1bktpbmQsIGFjdGlvbikge1xuXHRjb25zdCBvbGRGdW5LaW5kID0gZnVuS2luZFxuXHRmdW5LaW5kID0gbmV3RnVuS2luZFxuXHRhY3Rpb24oKVxuXHRmdW5LaW5kID0gb2xkRnVuS2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aExvb3AobmV3TG9vcCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZExvb3AgPSBvcExvb3Bcblx0b3BMb29wID0gbmV3TG9vcFxuXHRhY3Rpb24oKVxuXHRvcExvb3AgPSBvbGRMb29wXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTWV0aG9kKG5ld01ldGhvZCwgYWN0aW9uKSB7XG5cdGNvbnN0IG9sZE1ldGhvZCA9IG1ldGhvZFxuXHRtZXRob2QgPSBuZXdNZXRob2Rcblx0YWN0aW9uKClcblx0bWV0aG9kID0gb2xkTWV0aG9kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoTmFtZShuZXdOYW1lLCBhY3Rpb24pIHtcblx0Y29uc3Qgb2xkTmFtZSA9IG5hbWVcblx0bmFtZSA9IG5ld05hbWVcblx0YWN0aW9uKClcblx0bmFtZSA9IG9sZE5hbWVcbn1cblxuLy8gQ2FuJ3QgYnJlYWsgb3V0IG9mIGxvb3AgaW5zaWRlIG9mIElJRkUuXG5leHBvcnQgZnVuY3Rpb24gd2l0aElJRkUoYWN0aW9uKSB7XG5cdHdpdGhMb29wKGZhbHNlLCBhY3Rpb24pXG59XG5cbi8vIFRPRE86RVM2IFNob3VsZG4ndCBuZWVkIHRoaXNcbmV4cG9ydCBmdW5jdGlvbiBzZXRQZW5kaW5nQmxvY2tMb2NhbHModmFsKSB7XG5cdHBlbmRpbmdCbG9ja0xvY2FscyA9IHZhbFxufVxuIl19
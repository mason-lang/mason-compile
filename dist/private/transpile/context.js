'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst);
		global.context = mod.exports;
	}
})(this, function (exports, _MsAst) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.nextDestructuredId = exports.funKind = exports.verifyResults = undefined;
	exports.setup = setup;
	exports.tearDown = tearDown;
	exports.getDestructuredId = getDestructuredId;
	exports.withFunKind = withFunKind;
	let verifyResults = exports.verifyResults = undefined;
	let funKind = exports.funKind = undefined;
	let nextDestructuredId = exports.nextDestructuredId = undefined;

	function setup(_verifyResults) {
		exports.verifyResults = verifyResults = _verifyResults;
		exports.funKind = funKind = _MsAst.Funs.Plain;
		exports.nextDestructuredId = nextDestructuredId = 0;
	}

	function tearDown() {
		exports.verifyResults = verifyResults = null;
	}

	function getDestructuredId() {
		const _ = nextDestructuredId;
		exports.nextDestructuredId = nextDestructuredId = nextDestructuredId + 1;
		return _;
	}

	function withFunKind(newFunKind, func) {
		const oldFunKind = funKind;
		exports.funKind = funKind = newFunKind;

		const _ = func();

		exports.funKind = funKind = oldFunKind;
		return _;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FPZ0IsS0FBSyxHQUFMLEtBQUs7U0FNTCxRQUFRLEdBQVIsUUFBUTtTQUtSLGlCQUFpQixHQUFqQixpQkFBaUI7U0FNakIsV0FBVyxHQUFYLFdBQVc7S0F0QmhCLGFBQWEsV0FBYixhQUFhO0tBRWIsT0FBTyxXQUFQLE9BQU87S0FDUCxrQkFBa0IsV0FBbEIsa0JBQWtCOztVQUViLEtBQUs7VUFMVixhQUFhLEdBTXZCLGFBQWEsR0FBRyxjQUFjO1VBSnBCLE9BQU8sR0FLakIsT0FBTyxHQUFHLE9BVEgsSUFBSSxDQVNJLEtBQUs7VUFKVixrQkFBa0IsR0FLNUIsa0JBQWtCLEdBQUcsQ0FBQzs7O1VBR1AsUUFBUTtVQVhiLGFBQWEsR0FhdkIsYUFBYSxHQUFHLElBQUk7OztVQUdMLGlCQUFpQjs7VUFidEIsa0JBQWtCLEdBZTVCLGtCQUFrQixHQUFHLGtCQUFrQixHQUFHLENBQUM7Ozs7VUFJNUIsV0FBVzs7VUFwQmhCLE9BQU8sR0FzQmpCLE9BQU8sR0FBRyxVQUFVOzs7O1VBdEJWLE9BQU8sR0F3QmpCLE9BQU8sR0FBRyxVQUFVIiwiZmlsZSI6ImNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Z1bnN9IGZyb20gJy4uL01zQXN0J1xuXG5leHBvcnQgbGV0IHZlcmlmeVJlc3VsdHNcbi8qKiBXaGV0aGVyIHdlIGFyZSBpbiBhbiBhc3luYy9nZW5lcmF0b3IgZnVuY3Rpb24uICovXG5leHBvcnQgbGV0IGZ1bktpbmRcbmV4cG9ydCBsZXQgbmV4dERlc3RydWN0dXJlZElkXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cChfdmVyaWZ5UmVzdWx0cykge1xuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0ZnVuS2luZCA9IEZ1bnMuUGxhaW5cblx0bmV4dERlc3RydWN0dXJlZElkID0gMFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVhckRvd24oKSB7XG5cdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0dmVyaWZ5UmVzdWx0cyA9IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlc3RydWN0dXJlZElkKCkge1xuXHRjb25zdCBfID0gbmV4dERlc3RydWN0dXJlZElkXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IG5leHREZXN0cnVjdHVyZWRJZCArIDFcblx0cmV0dXJuIF9cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhGdW5LaW5kKG5ld0Z1bktpbmQsIGZ1bmMpIHtcblx0Y29uc3Qgb2xkRnVuS2luZCA9IGZ1bktpbmRcblx0ZnVuS2luZCA9IG5ld0Z1bktpbmRcblx0Y29uc3QgXyA9IGZ1bmMoKVxuXHRmdW5LaW5kID0gb2xkRnVuS2luZFxuXHRyZXR1cm4gX1xufVxuIl19
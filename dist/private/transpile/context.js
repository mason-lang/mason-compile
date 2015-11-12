"use strict";

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.context = mod.exports;
	}
})(this, function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.setup = setup;
	exports.tearDown = tearDown;
	exports.getDestructuredId = getDestructuredId;
	exports.withInGenerator = withInGenerator;
	let verifyResults = exports.verifyResults = undefined;
	let isInGenerator = exports.isInGenerator = undefined;
	let nextDestructuredId = exports.nextDestructuredId = undefined;

	function setup(_verifyResults) {
		exports.verifyResults = verifyResults = _verifyResults;
		exports.isInGenerator = isInGenerator = false;
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

	function withInGenerator(newInGenerator, func) {
		const oldInGenerator = isInGenerator;
		exports.isInGenerator = isInGenerator = newInGenerator;

		const _ = func();

		exports.isInGenerator = isInGenerator = oldInGenerator;
		return _;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUtnQixLQUFLLEdBQUwsS0FBSztTQU1MLFFBQVEsR0FBUixRQUFRO1NBS1IsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQU1qQixlQUFlLEdBQWYsZUFBZTtLQXRCcEIsYUFBYSxXQUFiLGFBQWE7S0FFYixhQUFhLFdBQWIsYUFBYTtLQUNiLGtCQUFrQixXQUFsQixrQkFBa0I7O1VBRWIsS0FBSztVQUxWLGFBQWEsR0FNdkIsYUFBYSxHQUFHLGNBQWM7VUFKcEIsYUFBYSxHQUt2QixhQUFhLEdBQUcsS0FBSztVQUpYLGtCQUFrQixHQUs1QixrQkFBa0IsR0FBRyxDQUFDOzs7VUFHUCxRQUFRO1VBWGIsYUFBYSxHQWF2QixhQUFhLEdBQUcsSUFBSTs7O1VBR0wsaUJBQWlCOztVQWJ0QixrQkFBa0IsR0FlNUIsa0JBQWtCLEdBQUcsa0JBQWtCLEdBQUcsQ0FBQzs7OztVQUk1QixlQUFlOztVQXBCcEIsYUFBYSxHQXNCdkIsYUFBYSxHQUFHLGNBQWM7Ozs7VUF0QnBCLGFBQWEsR0F3QnZCLGFBQWEsR0FBRyxjQUFjIiwiZmlsZSI6ImNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgbGV0IHZlcmlmeVJlc3VsdHNcbi8qKiBXaGV0aGVyIHdlIGFyZSBpbiBhbiBhc3luYy9nZW5lcmF0b3IgZnVuY3Rpb24uICovXG5leHBvcnQgbGV0IGlzSW5HZW5lcmF0b3JcbmV4cG9ydCBsZXQgbmV4dERlc3RydWN0dXJlZElkXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cChfdmVyaWZ5UmVzdWx0cykge1xuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IDBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duKCkge1xuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdHZlcmlmeVJlc3VsdHMgPSBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXN0cnVjdHVyZWRJZCgpIHtcblx0Y29uc3QgXyA9IG5leHREZXN0cnVjdHVyZWRJZFxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSBuZXh0RGVzdHJ1Y3R1cmVkSWQgKyAxXG5cdHJldHVybiBfXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSW5HZW5lcmF0b3IobmV3SW5HZW5lcmF0b3IsIGZ1bmMpIHtcblx0Y29uc3Qgb2xkSW5HZW5lcmF0b3IgPSBpc0luR2VuZXJhdG9yXG5cdGlzSW5HZW5lcmF0b3IgPSBuZXdJbkdlbmVyYXRvclxuXHRjb25zdCBfID0gZnVuYygpXG5cdGlzSW5HZW5lcmF0b3IgPSBvbGRJbkdlbmVyYXRvclxuXHRyZXR1cm4gX1xufVxuIl19
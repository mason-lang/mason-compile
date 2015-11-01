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
	exports.withInConstructor = withInConstructor;
	exports.withInGenerator = withInGenerator;
	let verifyResults = exports.verifyResults = undefined;
	let isInGenerator = exports.isInGenerator = undefined;
	let isInConstructor = exports.isInConstructor = undefined;
	let nextDestructuredId = exports.nextDestructuredId = undefined;

	function setup(_verifyResults) {
		exports.verifyResults = verifyResults = _verifyResults;
		exports.isInGenerator = isInGenerator = false;
		exports.isInConstructor = isInConstructor = false;
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

	function withInConstructor(func) {
		const oldInConstructor = isInConstructor;
		exports.isInConstructor = isInConstructor = true;

		const _ = func();

		exports.isInConstructor = isInConstructor = oldInConstructor;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQU1nQixLQUFLLEdBQUwsS0FBSztTQU9MLFFBQVEsR0FBUixRQUFRO1NBS1IsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQU1qQixpQkFBaUIsR0FBakIsaUJBQWlCO1NBUWpCLGVBQWUsR0FBZixlQUFlO0tBaENwQixhQUFhLFdBQWIsYUFBYTtLQUViLGFBQWEsV0FBYixhQUFhO0tBQ2IsZUFBZSxXQUFmLGVBQWU7S0FDZixrQkFBa0IsV0FBbEIsa0JBQWtCOztVQUViLEtBQUs7VUFOVixhQUFhLEdBT3ZCLGFBQWEsR0FBRyxjQUFjO1VBTHBCLGFBQWEsR0FNdkIsYUFBYSxHQUFHLEtBQUs7VUFMWCxlQUFlLEdBTXpCLGVBQWUsR0FBRyxLQUFLO1VBTGIsa0JBQWtCLEdBTTVCLGtCQUFrQixHQUFHLENBQUM7OztVQUdQLFFBQVE7VUFiYixhQUFhLEdBZXZCLGFBQWEsR0FBRyxJQUFJOzs7VUFHTCxpQkFBaUI7O1VBZHRCLGtCQUFrQixHQWdCNUIsa0JBQWtCLEdBQUcsa0JBQWtCLEdBQUcsQ0FBQzs7OztVQUk1QixpQkFBaUI7O1VBckJ0QixlQUFlLEdBdUJ6QixlQUFlLEdBQUcsSUFBSTs7OztVQXZCWixlQUFlLEdBeUJ6QixlQUFlLEdBQUcsZ0JBQWdCOzs7O1VBSW5CLGVBQWU7O1VBOUJwQixhQUFhLEdBZ0N2QixhQUFhLEdBQUcsY0FBYzs7OztVQWhDcEIsYUFBYSxHQWtDdkIsYUFBYSxHQUFHLGNBQWMiLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBsZXQgdmVyaWZ5UmVzdWx0c1xuLyoqIFdoZXRoZXIgd2UgYXJlIGluIGFuIGFzeW5jL2dlbmVyYXRvciBmdW5jdGlvbi4gKi9cbmV4cG9ydCBsZXQgaXNJbkdlbmVyYXRvclxuZXhwb3J0IGxldCBpc0luQ29uc3RydWN0b3JcbmV4cG9ydCBsZXQgbmV4dERlc3RydWN0dXJlZElkXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cChfdmVyaWZ5UmVzdWx0cykge1xuXHR2ZXJpZnlSZXN1bHRzID0gX3ZlcmlmeVJlc3VsdHNcblx0aXNJbkdlbmVyYXRvciA9IGZhbHNlXG5cdGlzSW5Db25zdHJ1Y3RvciA9IGZhbHNlXG5cdG5leHREZXN0cnVjdHVyZWRJZCA9IDBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlYXJEb3duKCkge1xuXHQvLyBSZWxlYXNlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG5cdHZlcmlmeVJlc3VsdHMgPSBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXN0cnVjdHVyZWRJZCgpIHtcblx0Y29uc3QgXyA9IG5leHREZXN0cnVjdHVyZWRJZFxuXHRuZXh0RGVzdHJ1Y3R1cmVkSWQgPSBuZXh0RGVzdHJ1Y3R1cmVkSWQgKyAxXG5cdHJldHVybiBfXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoSW5Db25zdHJ1Y3RvcihmdW5jKSB7XG5cdGNvbnN0IG9sZEluQ29uc3RydWN0b3IgPSBpc0luQ29uc3RydWN0b3Jcblx0aXNJbkNvbnN0cnVjdG9yID0gdHJ1ZVxuXHRjb25zdCBfID0gZnVuYygpXG5cdGlzSW5Db25zdHJ1Y3RvciA9IG9sZEluQ29uc3RydWN0b3Jcblx0cmV0dXJuIF9cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhJbkdlbmVyYXRvcihuZXdJbkdlbmVyYXRvciwgZnVuYykge1xuXHRjb25zdCBvbGRJbkdlbmVyYXRvciA9IGlzSW5HZW5lcmF0b3Jcblx0aXNJbkdlbmVyYXRvciA9IG5ld0luR2VuZXJhdG9yXG5cdGNvbnN0IF8gPSBmdW5jKClcblx0aXNJbkdlbmVyYXRvciA9IG9sZEluR2VuZXJhdG9yXG5cdHJldHVybiBfXG59XG4iXX0=
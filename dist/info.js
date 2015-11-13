'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './private/Token'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./private/Token'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Token);
		global.info = mod.exports;
	}
})(this, function (exports, _Token) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.reservedKeywords = exports.keywords = undefined;
	const keywords = exports.keywords = Object.keys(_Token.Keywords).map(key => (0, _Token.keywordName)(_Token.Keywords[key])).sort();
	const reservedKeywords = exports.reservedKeywords = Array(..._Token.reservedKeywords).map(_Token.keywordName).sort();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FNYSxRQUFRLFdBQVIsUUFBUSxHQUNwQixNQUFNLENBQUMsSUFBSSxRQVBKLFFBQVEsQ0FPTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksV0FQaEIsV0FBVyxFQU9pQixPQVB0QyxRQUFRLENBT3VDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7T0FNdkQsZ0JBQWdCLFdBQWhCLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxVQWJQLGdCQUFnQixBQWFFLENBQUMsQ0FBQyxHQUFHLFFBYnBDLFdBQVcsQ0Fhc0MsQ0FBQyxJQUFJLEVBQUUiLCJmaWxlIjoiaW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7S2V5d29yZHMsIGtleXdvcmROYW1lLCByZXNlcnZlZEtleXdvcmRzIGFzIHJlc2VydmVkfSBmcm9tICcuL3ByaXZhdGUvVG9rZW4nXG5cbi8qKlxuQXJyYXkgb2YgdGhlIG5hbWVzIG9mIGV2ZXJ5IGtleXdvcmQsIG5vdCBpbmNsdWRpbmcgcmVzZXJ2ZWQgd29yZHMuXG5BbHBoYWJldGljYWxseSBzb3J0ZWQuXG4qL1xuZXhwb3J0IGNvbnN0IGtleXdvcmRzID1cblx0T2JqZWN0LmtleXMoS2V5d29yZHMpLm1hcChrZXkgPT4ga2V5d29yZE5hbWUoS2V5d29yZHNba2V5XSkpLnNvcnQoKVxuXG4vKipcbkFycmF5IG9mIHRoZSBuYW1lcyBvZiBldmVyeSByZXNlcnZlZCB3b3JkLlxuQWxwaGFiZXRpY2FsbHkgc29ydGVkLlxuKi9cbmV4cG9ydCBjb25zdCByZXNlcnZlZEtleXdvcmRzID0gQXJyYXkoLi4ucmVzZXJ2ZWQpLm1hcChrZXl3b3JkTmFtZSkuc29ydCgpXG4iXX0=
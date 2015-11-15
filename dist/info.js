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

	const reservedKeywords = exports.reservedKeywords = _Token.reservedKeywords.sort();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FNYSxRQUFRLFdBQVIsUUFBUSxHQUNwQixNQUFNLENBQUMsSUFBSSxRQVBKLFFBQVEsQ0FPTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksV0FQaEIsV0FBVyxFQU9pQixPQVB0QyxRQUFRLENBT3VDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7O09BTXZELGdCQUFnQixXQUFoQixnQkFBZ0IsR0FBRyxPQWJELGdCQUFnQixDQWFOLElBQUksRUFBRSIsImZpbGUiOiJpbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtLZXl3b3Jkcywga2V5d29yZE5hbWUsIHJlc2VydmVkS2V5d29yZHMgYXMgcmVzZXJ2ZWR9IGZyb20gJy4vcHJpdmF0ZS9Ub2tlbidcblxuLyoqXG5BcnJheSBvZiB0aGUgbmFtZXMgb2YgZXZlcnkga2V5d29yZCwgbm90IGluY2x1ZGluZyByZXNlcnZlZCB3b3Jkcy5cbkFscGhhYmV0aWNhbGx5IHNvcnRlZC5cbiovXG5leHBvcnQgY29uc3Qga2V5d29yZHMgPVxuXHRPYmplY3Qua2V5cyhLZXl3b3JkcykubWFwKGtleSA9PiBrZXl3b3JkTmFtZShLZXl3b3Jkc1trZXldKSkuc29ydCgpXG5cbi8qKlxuQXJyYXkgb2YgdGhlIG5hbWVzIG9mIGV2ZXJ5IHJlc2VydmVkIHdvcmQuXG5BbHBoYWJldGljYWxseSBzb3J0ZWQuXG4qL1xuZXhwb3J0IGNvbnN0IHJlc2VydmVkS2V5d29yZHMgPSByZXNlcnZlZC5zb3J0KClcbiJdfQ==
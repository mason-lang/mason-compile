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
		global.CompileError = mod.exports;
	}
})(this, function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	class CompileError extends Error {
		constructor(warning) {
			super(warning.message);
			this.warning = warning;
		}

	}

	exports.default = CompileError;

	class Warning {
		constructor(loc, message) {
			this.loc = loc;
			this.message = message;
		}

		*messageParts(codeFormatter) {
			const message = this.message;
			const codeRegex = /{{(.*?)}}/g;
			let prevIdx = 0;

			while (true) {
				const match = codeRegex.exec(message);

				if (match === null) {
					yield message.slice(prevIdx, message.length);
					break;
				} else {
					yield message.slice(prevIdx, match.index);
					yield codeFormatter(match[1]);
					prevIdx = codeRegex.lastIndex;
				}
			}
		}

	}

	exports.Warning = Warning;

	const code = exports.code = str => `{{${ str }}}`;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db21waWxlRXJyb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQUdxQixZQUFZOzs7Ozs7OzttQkFBWixZQUFZOztPQVlwQixPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBUCxPQUFPLEdBQVAsT0FBTzs7T0F3Q1AsSUFBSSxXQUFKLElBQUksR0FBRyxHQUFHLElBQ3RCLENBQUMsRUFBRSxHQUFFLEdBQUcsRUFBQyxFQUFFLENBQUMiLCJmaWxlIjoiQ29tcGlsZUVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5BbnkgZXJyb3IgdGhyb3duIGJ5IHRoZSBjb21waWxlciBkdWUgdG8gYSBwcm9ibGVtIHdpdGggdGhlIGlucHV0IHNvdXJjZSBjb2RlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3Iod2FybmluZykge1xuXHRcdHN1cGVyKHdhcm5pbmcubWVzc2FnZSlcblx0XHQvKiogTG9jYXRpb24gYW5kIGRlc2NyaXB0aW9uIG9mIHRoZSBlcnJvci4gKi9cblx0XHR0aGlzLndhcm5pbmcgPSB3YXJuaW5nXG5cdH1cbn1cblxuLyoqXG5BbnkgcHJvYmxlbSB3aXRoIHNvdXJjZSBjb2RlLlxuRGVzcGl0ZSB0aGUgbmFtZSwgdGhpcyBpcyB1c2VkIGZvciBib3RoIHdhcm5pbmdzIGFuZCBlcnJvcnMuXG4qL1xuZXhwb3J0IGNsYXNzIFdhcm5pbmcge1xuXHRjb25zdHJ1Y3Rvcihsb2MsIG1lc3NhZ2UpIHtcblx0XHQvKipcblx0XHRTb3VyY2UgbG9jYXRpb24gb2YgdGhlIHByb2JsZW0uXG5cdFx0QHR5cGUge0xvY31cblx0XHQqL1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0LyoqXG5cdFx0VGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUgcHJvYmxlbS5cblx0XHRAdHlwZSB7c3RyaW5nfVxuXHRcdCovXG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuXHR9XG5cblx0LyoqXG5cdEFwcGxpZXMgYGNvZGVGb3JtYXR0ZXJgIHRvIHBhcnRzIG9mIGB0aGlzLm1lc3NhZ2VgIGNyZWF0ZWQgYnkge0BsaW5rIGNvZGV9LlxuXHRAcGFyYW0ge2Z1bmN0aW9uKGNvZGU6IHN0cmluZyl9IGNvZGVGb3JtYXR0ZXJcblx0QHJldHVyblxuXHRcdEdlbmVyYXRvciB5aWVsZGluZyBzdHJpbmdzIChmb3Igbm9uLWBjb2RlYClcblx0XHRhbmQgcmVzdWx0cyBvZiBgZm9ybWF0dGVyKGNvZGUpYCBmb3IgYGNvZGVgIHBhcnRzLlxuXHQqL1xuXHQqIG1lc3NhZ2VQYXJ0cyhjb2RlRm9ybWF0dGVyKSB7XG5cdFx0Y29uc3QgbWVzc2FnZSA9IHRoaXMubWVzc2FnZVxuXHRcdGNvbnN0IGNvZGVSZWdleCA9IC97eyguKj8pfX0vZ1xuXHRcdGxldCBwcmV2SWR4ID0gMFxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjb25zdCBtYXRjaCA9IGNvZGVSZWdleC5leGVjKG1lc3NhZ2UpXG5cdFx0XHRpZiAobWF0Y2ggPT09IG51bGwpIHtcblx0XHRcdFx0eWllbGQgbWVzc2FnZS5zbGljZShwcmV2SWR4LCBtZXNzYWdlLmxlbmd0aClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHlpZWxkIG1lc3NhZ2Uuc2xpY2UocHJldklkeCwgbWF0Y2guaW5kZXgpXG5cdFx0XHRcdHlpZWxkIGNvZGVGb3JtYXR0ZXIobWF0Y2hbMV0pXG5cdFx0XHRcdHByZXZJZHggPSBjb2RlUmVnZXgubGFzdEluZGV4XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8qKiBVc2VkIHdoZW4gZ2VuZXJhdGluZyB3YXJuaW5nIG1lc3NhZ2VzIHRvIGhpZ2hsaWdodCBhIHBhcnQgb2YgdGhhdCBtZXNzYWdlLiAqL1xuZXhwb3J0IGNvbnN0IGNvZGUgPSBzdHIgPT5cblx0YHt7JHtzdHJ9fX1gXG4iXX0=
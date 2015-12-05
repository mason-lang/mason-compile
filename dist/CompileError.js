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
		constructor(errorMessage) {
			super(errorMessage.message);
			this.errorMessage = errorMessage;
		}

	}

	exports.default = CompileError;

	class ErrorMessage {
		constructor(loc, message) {
			this.loc = loc;
			this.message = message;
		}

		*messageParts(codeFormatter) {
			const message = this.message;
			const codeRegex = /{{(.*?)}}/g;
			let prevIdx = 0;

			for (;;) {
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

	exports.ErrorMessage = ErrorMessage;

	const code = exports.code = str => `{{${ str }}}`;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db21waWxlRXJyb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQUdxQixZQUFZOzs7Ozs7OzttQkFBWixZQUFZOztPQVlwQixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FBWixZQUFZLEdBQVosWUFBWTs7T0F3Q1osSUFBSSxXQUFKLElBQUksR0FBRyxHQUFHLElBQ3RCLENBQUMsRUFBRSxHQUFFLEdBQUcsRUFBQyxFQUFFLENBQUMiLCJmaWxlIjoiQ29tcGlsZUVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5BbnkgZXJyb3IgdGhyb3duIGJ5IHRoZSBjb21waWxlciBkdWUgdG8gYSBwcm9ibGVtIHdpdGggdGhlIGlucHV0IHNvdXJjZSBjb2RlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3IoZXJyb3JNZXNzYWdlKSB7XG5cdFx0c3VwZXIoZXJyb3JNZXNzYWdlLm1lc3NhZ2UpXG5cdFx0LyoqIExvY2F0aW9uIGFuZCBkZXNjcmlwdGlvbiBvZiB0aGUgZXJyb3IuICovXG5cdFx0dGhpcy5lcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2Vcblx0fVxufVxuXG4vKipcbkFueSBwcm9ibGVtIHdpdGggc291cmNlIGNvZGUuXG5Vc2VkIGZvciBib3RoIGVycm9ycyBhbmQgd2FybmluZ3MuXG4qL1xuZXhwb3J0IGNsYXNzIEVycm9yTWVzc2FnZSB7XG5cdGNvbnN0cnVjdG9yKGxvYywgbWVzc2FnZSkge1xuXHRcdC8qKlxuXHRcdFNvdXJjZSBsb2NhdGlvbiBvZiB0aGUgcHJvYmxlbS5cblx0XHRAdHlwZSB7TG9jfVxuXHRcdCovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHQvKipcblx0XHRUZXh0IGRlc2NyaXB0aW9uIG9mIHRoZSBwcm9ibGVtLlxuXHRcdEB0eXBlIHtzdHJpbmd9XG5cdFx0Ki9cblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG5cdH1cblxuXHQvKipcblx0QXBwbGllcyBgY29kZUZvcm1hdHRlcmAgdG8gcGFydHMgb2YgYHRoaXMubWVzc2FnZWAgY3JlYXRlZCBieSB7QGxpbmsgY29kZX0uXG5cdEBwYXJhbSB7ZnVuY3Rpb24oY29kZTogc3RyaW5nKX0gY29kZUZvcm1hdHRlclxuXHRAcmV0dXJuXG5cdFx0R2VuZXJhdG9yIHlpZWxkaW5nIHN0cmluZ3MgKGZvciBub24tYGNvZGVgKVxuXHRcdGFuZCByZXN1bHRzIG9mIGBmb3JtYXR0ZXIoY29kZSlgIGZvciBgY29kZWAgcGFydHMuXG5cdCovXG5cdCogbWVzc2FnZVBhcnRzKGNvZGVGb3JtYXR0ZXIpIHtcblx0XHRjb25zdCBtZXNzYWdlID0gdGhpcy5tZXNzYWdlXG5cdFx0Y29uc3QgY29kZVJlZ2V4ID0gL3t7KC4qPyl9fS9nXG5cdFx0bGV0IHByZXZJZHggPSAwXG5cdFx0Zm9yICg7Oykge1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBjb2RlUmVnZXguZXhlYyhtZXNzYWdlKVxuXHRcdFx0aWYgKG1hdGNoID09PSBudWxsKSB7XG5cdFx0XHRcdHlpZWxkIG1lc3NhZ2Uuc2xpY2UocHJldklkeCwgbWVzc2FnZS5sZW5ndGgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR5aWVsZCBtZXNzYWdlLnNsaWNlKHByZXZJZHgsIG1hdGNoLmluZGV4KVxuXHRcdFx0XHR5aWVsZCBjb2RlRm9ybWF0dGVyKG1hdGNoWzFdKVxuXHRcdFx0XHRwcmV2SWR4ID0gY29kZVJlZ2V4Lmxhc3RJbmRleFxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG4vKiogVXNlZCB3aGVuIGdlbmVyYXRpbmcgbWVzc2FnZXMgdG8gaGlnaGxpZ2h0IGEgcGFydCBvZiB0aGF0IG1lc3NhZ2UuICovXG5leHBvcnQgY29uc3QgY29kZSA9IHN0ciA9PlxuXHRge3ske3N0cn19fWBcbiJdfQ==
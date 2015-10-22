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
	/**
 Any error thrown by the compiler due to a problem with the input source code.
 */
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	class CompileError extends Error {
		constructor(warning) {
			super(warning.message);
			/** Location and description of the error. */
			this.warning = warning;
		}
	}

	/**
 Any problem with source code.
 Despite the name, this is used for both warnings and errors.
 */
	exports.default = CompileError;

	class Warning {
		constructor(loc, /* Loc */message /* String */) {
			/** Source location of the problem. */
			this.loc = loc;
			/** Text description of the problem. */
			this.message = message;
		}

		/**
  Applies `codeFormatter` to parts of `this.message` created by {@link code}.
  @param {function(code: string)} codeFormatter
  @return
  	Generator yielding strings (for non-`code`)
  	and results of `formatter(code)` for `code` parts.
  */
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

	/** Used when generating warning messages to highlight a part of that message. */
	exports.Warning = Warning;
	const code = str => `{{${ str }}}`;
	exports.code = code;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db21waWxlRXJyb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdlLE9BQU0sWUFBWSxTQUFTLEtBQUssQ0FBQztBQUMvQyxhQUFXLENBQUMsT0FBTyxFQUFFO0FBQ3BCLFFBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7O0FBRXRCLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0dBQ3RCO0VBQ0Q7Ozs7OzttQkFOb0IsWUFBWTs7QUFZMUIsT0FBTSxPQUFPLENBQUM7QUFDcEIsYUFBVyxDQUFDLEdBQUcsV0FBWSxPQUFPLGVBQWU7O0FBRWhELE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBOztBQUVkLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0dBQ3RCOzs7Ozs7Ozs7QUFTRCxHQUFFLFlBQVksQ0FBQyxhQUFhLEVBQUU7QUFDN0IsU0FBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQTtBQUM1QixTQUFNLFNBQVMsR0FBRyxZQUFZLENBQUE7QUFDOUIsT0FBSSxPQUFPLEdBQUcsQ0FBQyxDQUFBO0FBQ2YsVUFBTyxJQUFJLEVBQUU7QUFDWixVQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3JDLFFBQUksS0FBSyxLQUFLLElBQUksRUFBRTtBQUNuQixXQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM1QyxXQUFLO0tBQ0wsTUFBTTtBQUNOLFdBQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3pDLFdBQU0sYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzdCLFlBQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFBO0tBQzdCO0lBQ0Q7R0FDRDtFQUNEOzs7O0FBR00sT0FBTSxJQUFJLEdBQUcsR0FBRyxJQUN0QixDQUFDLEVBQUUsR0FBRSxHQUFHLEVBQUMsRUFBRSxDQUFDLENBQUEiLCJmaWxlIjoiQ29tcGlsZUVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5BbnkgZXJyb3IgdGhyb3duIGJ5IHRoZSBjb21waWxlciBkdWUgdG8gYSBwcm9ibGVtIHdpdGggdGhlIGlucHV0IHNvdXJjZSBjb2RlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3Iod2FybmluZykge1xuXHRcdHN1cGVyKHdhcm5pbmcubWVzc2FnZSlcblx0XHQvKiogTG9jYXRpb24gYW5kIGRlc2NyaXB0aW9uIG9mIHRoZSBlcnJvci4gKi9cblx0XHR0aGlzLndhcm5pbmcgPSB3YXJuaW5nXG5cdH1cbn1cblxuLyoqXG5BbnkgcHJvYmxlbSB3aXRoIHNvdXJjZSBjb2RlLlxuRGVzcGl0ZSB0aGUgbmFtZSwgdGhpcyBpcyB1c2VkIGZvciBib3RoIHdhcm5pbmdzIGFuZCBlcnJvcnMuXG4qL1xuZXhwb3J0IGNsYXNzIFdhcm5pbmcge1xuXHRjb25zdHJ1Y3Rvcihsb2MgLyogTG9jICovLCBtZXNzYWdlIC8qIFN0cmluZyAqLykge1xuXHRcdC8qKiBTb3VyY2UgbG9jYXRpb24gb2YgdGhlIHByb2JsZW0uICovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHQvKiogVGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUgcHJvYmxlbS4gKi9cblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG5cdH1cblxuXHQvKipcblx0QXBwbGllcyBgY29kZUZvcm1hdHRlcmAgdG8gcGFydHMgb2YgYHRoaXMubWVzc2FnZWAgY3JlYXRlZCBieSB7QGxpbmsgY29kZX0uXG5cdEBwYXJhbSB7ZnVuY3Rpb24oY29kZTogc3RyaW5nKX0gY29kZUZvcm1hdHRlclxuXHRAcmV0dXJuXG5cdFx0R2VuZXJhdG9yIHlpZWxkaW5nIHN0cmluZ3MgKGZvciBub24tYGNvZGVgKVxuXHRcdGFuZCByZXN1bHRzIG9mIGBmb3JtYXR0ZXIoY29kZSlgIGZvciBgY29kZWAgcGFydHMuXG5cdCovXG5cdCogbWVzc2FnZVBhcnRzKGNvZGVGb3JtYXR0ZXIpIHtcblx0XHRjb25zdCBtZXNzYWdlID0gdGhpcy5tZXNzYWdlXG5cdFx0Y29uc3QgY29kZVJlZ2V4ID0gL3t7KC4qPyl9fS9nXG5cdFx0bGV0IHByZXZJZHggPSAwXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gY29kZVJlZ2V4LmV4ZWMobWVzc2FnZSlcblx0XHRcdGlmIChtYXRjaCA9PT0gbnVsbCkge1xuXHRcdFx0XHR5aWVsZCBtZXNzYWdlLnNsaWNlKHByZXZJZHgsIG1lc3NhZ2UubGVuZ3RoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0eWllbGQgbWVzc2FnZS5zbGljZShwcmV2SWR4LCBtYXRjaC5pbmRleClcblx0XHRcdFx0eWllbGQgY29kZUZvcm1hdHRlcihtYXRjaFsxXSlcblx0XHRcdFx0cHJldklkeCA9IGNvZGVSZWdleC5sYXN0SW5kZXhcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuLyoqIFVzZWQgd2hlbiBnZW5lcmF0aW5nIHdhcm5pbmcgbWVzc2FnZXMgdG8gaGlnaGxpZ2h0IGEgcGFydCBvZiB0aGF0IG1lc3NhZ2UuICovXG5leHBvcnQgY29uc3QgY29kZSA9IHN0ciA9PlxuXHRge3ske3N0cn19fWBcbiJdfQ==
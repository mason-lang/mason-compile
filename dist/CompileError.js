if (typeof define !== 'function') var define = require('amdefine')(module);define(["exports"], function (exports) {
	/**
 Any error thrown by the compiler due to a problem with the input source code.
 */
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.formatCode = formatCode;

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
	}

	/** Used when generating warning messages to highlight a part of that message. */
	exports.Warning = Warning;
	const code = str => `{{${ str }}}`;

	exports.code = code;
	/**
 Applies `formatter` to parts of `this.message` created by {@link code}.
 @return
 	Generator yielding strings (for non-`code`)
 	and results of `formatter(code)` for parts made by {@link code}.
 */

	function* formatCode(message, formatter) {
		const codeRegex = /{{(.*?)}}/g;
		let prevIdx = 0;
		while (true) {
			const match = codeRegex.exec(message);
			if (match === null) {
				yield message.slice(prevIdx, message.length);
				break;
			} else {
				yield message.slice(prevIdx, match.index);
				yield formatter(match[1]);
				prevIdx = codeRegex.lastIndex;
			}
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbXBpbGVFcnJvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUFHZSxPQUFNLFlBQVksU0FBUyxLQUFLLENBQUM7QUFDL0MsYUFBVyxDQUFDLE9BQU8sRUFBRTtBQUNwQixRQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBOztBQUV0QixPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtHQUN0QjtFQUNEOzs7Ozs7bUJBTm9CLFlBQVk7O0FBWTFCLE9BQU0sT0FBTyxDQUFDO0FBQ3BCLGFBQVcsQ0FBQyxHQUFHLFdBQVksT0FBTyxlQUFlOztBQUVoRCxPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTs7QUFFZCxPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtHQUN0QjtFQUNEOzs7O0FBR00sT0FBTSxJQUFJLEdBQUcsR0FBRyxJQUN0QixDQUFDLEVBQUUsR0FBRSxHQUFHLEVBQUMsRUFBRSxDQUFDLENBQUE7Ozs7Ozs7Ozs7QUFRTixXQUFVLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFO0FBQy9DLFFBQU0sU0FBUyxHQUFHLFlBQVksQ0FBQTtBQUM5QixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUE7QUFDZixTQUFPLElBQUksRUFBRTtBQUNaLFNBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDckMsT0FBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ25CLFVBQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzVDLFVBQUs7SUFDTCxNQUFNO0FBQ04sVUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDekMsVUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsV0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUE7SUFDN0I7R0FDRDtFQUNEIiwiZmlsZSI6IkNvbXBpbGVFcnJvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuQW55IGVycm9yIHRocm93biBieSB0aGUgY29tcGlsZXIgZHVlIHRvIGEgcHJvYmxlbSB3aXRoIHRoZSBpbnB1dCBzb3VyY2UgY29kZS5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21waWxlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKHdhcm5pbmcpIHtcblx0XHRzdXBlcih3YXJuaW5nLm1lc3NhZ2UpXG5cdFx0LyoqIExvY2F0aW9uIGFuZCBkZXNjcmlwdGlvbiBvZiB0aGUgZXJyb3IuICovXG5cdFx0dGhpcy53YXJuaW5nID0gd2FybmluZ1xuXHR9XG59XG5cbi8qKlxuQW55IHByb2JsZW0gd2l0aCBzb3VyY2UgY29kZS5cbkRlc3BpdGUgdGhlIG5hbWUsIHRoaXMgaXMgdXNlZCBmb3IgYm90aCB3YXJuaW5ncyBhbmQgZXJyb3JzLlxuKi9cbmV4cG9ydCBjbGFzcyBXYXJuaW5nIHtcblx0Y29uc3RydWN0b3IobG9jIC8qIExvYyAqLywgbWVzc2FnZSAvKiBTdHJpbmcgKi8pIHtcblx0XHQvKiogU291cmNlIGxvY2F0aW9uIG9mIHRoZSBwcm9ibGVtLiAqL1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0LyoqIFRleHQgZGVzY3JpcHRpb24gb2YgdGhlIHByb2JsZW0uICovXG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuXHR9XG59XG5cbi8qKiBVc2VkIHdoZW4gZ2VuZXJhdGluZyB3YXJuaW5nIG1lc3NhZ2VzIHRvIGhpZ2hsaWdodCBhIHBhcnQgb2YgdGhhdCBtZXNzYWdlLiAqL1xuZXhwb3J0IGNvbnN0IGNvZGUgPSBzdHIgPT5cblx0YHt7JHtzdHJ9fX1gXG5cbi8qKlxuQXBwbGllcyBgZm9ybWF0dGVyYCB0byBwYXJ0cyBvZiBgdGhpcy5tZXNzYWdlYCBjcmVhdGVkIGJ5IHtAbGluayBjb2RlfS5cbkByZXR1cm5cblx0R2VuZXJhdG9yIHlpZWxkaW5nIHN0cmluZ3MgKGZvciBub24tYGNvZGVgKVxuXHRhbmQgcmVzdWx0cyBvZiBgZm9ybWF0dGVyKGNvZGUpYCBmb3IgcGFydHMgbWFkZSBieSB7QGxpbmsgY29kZX0uXG4qL1xuZXhwb3J0IGZ1bmN0aW9uKiBmb3JtYXRDb2RlKG1lc3NhZ2UsIGZvcm1hdHRlcikge1xuXHRjb25zdCBjb2RlUmVnZXggPSAve3soLio/KX19L2dcblx0bGV0IHByZXZJZHggPSAwXG5cdHdoaWxlICh0cnVlKSB7XG5cdFx0Y29uc3QgbWF0Y2ggPSBjb2RlUmVnZXguZXhlYyhtZXNzYWdlKVxuXHRcdGlmIChtYXRjaCA9PT0gbnVsbCkge1xuXHRcdFx0eWllbGQgbWVzc2FnZS5zbGljZShwcmV2SWR4LCBtZXNzYWdlLmxlbmd0aClcblx0XHRcdGJyZWFrXG5cdFx0fSBlbHNlIHtcblx0XHRcdHlpZWxkIG1lc3NhZ2Uuc2xpY2UocHJldklkeCwgbWF0Y2guaW5kZXgpXG5cdFx0XHR5aWVsZCBmb3JtYXR0ZXIobWF0Y2hbMV0pXG5cdFx0XHRwcmV2SWR4ID0gY29kZVJlZ2V4Lmxhc3RJbmRleFxuXHRcdH1cblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

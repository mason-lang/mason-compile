if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './private/util'], function (exports, _privateUtil) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.default = CompileError;

	function CompileError(warning) {
		if (!(this instanceof CompileError)) return new CompileError(warning);
		(0, _privateUtil.type)(warning, Warning);
		this.warning = warning;
		// In case it's not caught and formatted:
		this.message = warning.message;
		this.stack = new Error(warning.message).stack;
	}

	CompileError.prototype = Object.create(Error.prototype);

	class Warning {
		constructor(loc, /* Loc */message /* String */) {
			this.loc = loc;
			this.message = message;
		}
	}

	exports.Warning = Warning;
	const code = str => `{{${ str }}}`,
	      formatCode = function* (str, formatter) {
		const rgx = /{{(.*?)}}/g;
		let prevIdx = 0;
		while (true) {
			const match = rgx.exec(str);
			if (match === null) {
				yield str.slice(prevIdx, str.length);
				break;
			} else {
				yield str.slice(prevIdx, match.index);
				yield formatter(match[1]);
				prevIdx = rgx.lastIndex;
			}
		}
	};
	exports.code = code;
	exports.formatCode = formatCode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbXBpbGVFcnJvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O21CQUV3QixZQUFZOztBQUFyQixVQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDN0MsTUFBSSxFQUFFLElBQUksWUFBWSxZQUFZLENBQUEsQUFBQyxFQUNsQyxPQUFPLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2pDLG1CQUxPLElBQUksRUFLTixPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7O0FBRXRCLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtBQUM5QixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUE7RUFDN0M7O0FBQ0QsYUFBWSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFaEQsT0FBTSxPQUFPLENBQUM7QUFDcEIsYUFBVyxDQUFDLEdBQUcsV0FBWSxPQUFPLGVBQWU7QUFDaEQsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtHQUN0QjtFQUNEOzs7QUFFTSxPQUNOLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQztPQUMxQixVQUFVLEdBQUcsV0FBVSxHQUFHLEVBQUUsU0FBUyxFQUFFO0FBQ3RDLFFBQU0sR0FBRyxHQUFHLFlBQVksQ0FBQTtBQUN4QixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUE7QUFDZixTQUFPLElBQUksRUFBRTtBQUNaLFNBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDM0IsT0FBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ25CLFVBQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3BDLFVBQUs7SUFDTCxNQUFNO0FBQ04sVUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDckMsVUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsV0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUE7SUFDdkI7R0FDRDtFQUNELENBQUEiLCJmaWxlIjoiQ29tcGlsZUVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt0eXBlfSBmcm9tICcuL3ByaXZhdGUvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ29tcGlsZUVycm9yKHdhcm5pbmcpIHtcblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIENvbXBpbGVFcnJvcikpXG5cdFx0cmV0dXJuIG5ldyBDb21waWxlRXJyb3Iod2FybmluZylcblx0dHlwZSh3YXJuaW5nLCBXYXJuaW5nKVxuXHR0aGlzLndhcm5pbmcgPSB3YXJuaW5nXG5cdC8vIEluIGNhc2UgaXQncyBub3QgY2F1Z2h0IGFuZCBmb3JtYXR0ZWQ6XG5cdHRoaXMubWVzc2FnZSA9IHdhcm5pbmcubWVzc2FnZVxuXHR0aGlzLnN0YWNrID0gbmV3IEVycm9yKHdhcm5pbmcubWVzc2FnZSkuc3RhY2tcbn1cbkNvbXBpbGVFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSlcblxuZXhwb3J0IGNsYXNzIFdhcm5pbmcge1xuXHRjb25zdHJ1Y3Rvcihsb2MgLyogTG9jICovLCBtZXNzYWdlIC8qIFN0cmluZyAqLykge1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuXHR9XG59XG5cbmV4cG9ydCBjb25zdFxuXHRjb2RlID0gc3RyID0+IGB7eyR7c3RyfX19YCxcblx0Zm9ybWF0Q29kZSA9IGZ1bmN0aW9uKihzdHIsIGZvcm1hdHRlcikge1xuXHRcdGNvbnN0IHJneCA9IC97eyguKj8pfX0vZ1xuXHRcdGxldCBwcmV2SWR4ID0gMFxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjb25zdCBtYXRjaCA9IHJneC5leGVjKHN0cilcblx0XHRcdGlmIChtYXRjaCA9PT0gbnVsbCkge1xuXHRcdFx0XHR5aWVsZCBzdHIuc2xpY2UocHJldklkeCwgc3RyLmxlbmd0aClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHlpZWxkIHN0ci5zbGljZShwcmV2SWR4LCBtYXRjaC5pbmRleClcblx0XHRcdFx0eWllbGQgZm9ybWF0dGVyKG1hdGNoWzFdKVxuXHRcdFx0XHRwcmV2SWR4ID0gcmd4Lmxhc3RJbmRleFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

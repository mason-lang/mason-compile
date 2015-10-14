if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './private/util'], function (exports, _privateUtil) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.formatCode = formatCode;

	class CompileError extends Error {
		constructor(warning) {
			(0, _privateUtil.type)(warning, Warning);
			super(warning.message);
			this.warning = warning;
		}
	}

	exports.default = CompileError;

	class Warning {
		constructor(loc, /* Loc */message /* String */) {
			this.loc = loc;
			this.message = message;
		}
	}

	exports.Warning = Warning;
	const code = str => `{{${ str }}}`;

	exports.code = code;

	function* formatCode(str, formatter) {
		const codeRegex = /{{(.*?)}}/g;
		let prevIdx = 0;
		while (true) {
			const match = codeRegex.exec(str);
			if (match === null) {
				yield str.slice(prevIdx, str.length);
				break;
			} else {
				yield str.slice(prevIdx, match.index);
				yield formatter(match[1]);
				prevIdx = codeRegex.lastIndex;
			}
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbXBpbGVFcnJvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7QUFFZSxPQUFNLFlBQVksU0FBUyxLQUFLLENBQUM7QUFDL0MsYUFBVyxDQUFDLE9BQU8sRUFBRTtBQUNwQixvQkFKTSxJQUFJLEVBSUwsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ3RCLFFBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDdEIsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7R0FDdEI7RUFDRDs7bUJBTm9CLFlBQVk7O0FBUTFCLE9BQU0sT0FBTyxDQUFDO0FBQ3BCLGFBQVcsQ0FBQyxHQUFHLFdBQVksT0FBTyxlQUFlO0FBQ2hELE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0FBQ2QsT0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7R0FDdEI7RUFDRDs7O0FBRU0sT0FBTSxJQUFJLEdBQUcsR0FBRyxJQUN0QixDQUFDLEVBQUUsR0FBRSxHQUFHLEVBQUMsRUFBRSxDQUFDLENBQUE7Ozs7QUFFTixXQUFVLFVBQVUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFO0FBQzNDLFFBQU0sU0FBUyxHQUFHLFlBQVksQ0FBQTtBQUM5QixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUE7QUFDZixTQUFPLElBQUksRUFBRTtBQUNaLFNBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDakMsT0FBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ25CLFVBQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3BDLFVBQUs7SUFDTCxNQUFNO0FBQ04sVUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDckMsVUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsV0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUE7SUFDN0I7R0FDRDtFQUNEIiwiZmlsZSI6IkNvbXBpbGVFcnJvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7dHlwZX0gZnJvbSAnLi9wcml2YXRlL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3Iod2FybmluZykge1xuXHRcdHR5cGUod2FybmluZywgV2FybmluZylcblx0XHRzdXBlcih3YXJuaW5nLm1lc3NhZ2UpXG5cdFx0dGhpcy53YXJuaW5nID0gd2FybmluZ1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBXYXJuaW5nIHtcblx0Y29uc3RydWN0b3IobG9jIC8qIExvYyAqLywgbWVzc2FnZSAvKiBTdHJpbmcgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2Vcblx0fVxufVxuXG5leHBvcnQgY29uc3QgY29kZSA9IHN0ciA9PlxuXHRge3ske3N0cn19fWBcblxuZXhwb3J0IGZ1bmN0aW9uKiBmb3JtYXRDb2RlKHN0ciwgZm9ybWF0dGVyKSB7XG5cdGNvbnN0IGNvZGVSZWdleCA9IC97eyguKj8pfX0vZ1xuXHRsZXQgcHJldklkeCA9IDBcblx0d2hpbGUgKHRydWUpIHtcblx0XHRjb25zdCBtYXRjaCA9IGNvZGVSZWdleC5leGVjKHN0cilcblx0XHRpZiAobWF0Y2ggPT09IG51bGwpIHtcblx0XHRcdHlpZWxkIHN0ci5zbGljZShwcmV2SWR4LCBzdHIubGVuZ3RoKVxuXHRcdFx0YnJlYWtcblx0XHR9IGVsc2Uge1xuXHRcdFx0eWllbGQgc3RyLnNsaWNlKHByZXZJZHgsIG1hdGNoLmluZGV4KVxuXHRcdFx0eWllbGQgZm9ybWF0dGVyKG1hdGNoWzFdKVxuXHRcdFx0cHJldklkeCA9IGNvZGVSZWdleC5sYXN0SW5kZXhcblx0XHR9XG5cdH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9

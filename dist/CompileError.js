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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbXBpbGVFcnJvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7bUJBRXdCLFlBQVk7O0FBQXJCLFVBQVMsWUFBWSxDQUFDLE9BQU8sRUFBRTtBQUM3QyxNQUFJLEVBQUUsSUFBSSxZQUFZLFlBQVksQ0FBQSxBQUFDLEVBQ2xDLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDakMsbUJBTFEsSUFBSSxFQUtQLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUN0QixNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0FBQzlCLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQTtFQUM3Qzs7QUFDRCxhQUFZLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBOztBQUVoRCxPQUFNLE9BQU8sQ0FBQztBQUNwQixhQUFXLENBQUMsR0FBRyxXQUFZLE9BQU8sZUFBZTtBQUNoRCxPQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUNkLE9BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0dBQ3RCO0VBQ0Q7OztBQUVNLE9BQ04sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRSxHQUFHLEVBQUMsRUFBRSxDQUFDO09BQzFCLFVBQVUsR0FBRyxXQUFVLEdBQUcsRUFBRSxTQUFTLEVBQUU7QUFDdEMsUUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFBO0FBQ3hCLE1BQUksT0FBTyxHQUFHLENBQUMsQ0FBQTtBQUNmLFNBQU8sSUFBSSxFQUFFO0FBQ1osU0FBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUMzQixPQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDbkIsVUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDcEMsVUFBSztJQUNMLE1BQU07QUFDTixVQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNyQyxVQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6QixXQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQTtJQUN2QjtHQUNEO0VBQ0QsQ0FBQSIsImZpbGUiOiJDb21waWxlRXJyb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0eXBlIH0gZnJvbSAnLi9wcml2YXRlL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENvbXBpbGVFcnJvcih3YXJuaW5nKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb21waWxlRXJyb3IpKVxuXHRcdHJldHVybiBuZXcgQ29tcGlsZUVycm9yKHdhcm5pbmcpXG5cdHR5cGUod2FybmluZywgV2FybmluZylcblx0dGhpcy53YXJuaW5nID0gd2FybmluZ1xuXHQvLyBJbiBjYXNlIGl0J3Mgbm90IGNhdWdodCBhbmQgZm9ybWF0dGVkOlxuXHR0aGlzLm1lc3NhZ2UgPSB3YXJuaW5nLm1lc3NhZ2Vcblx0dGhpcy5zdGFjayA9IG5ldyBFcnJvcih3YXJuaW5nLm1lc3NhZ2UpLnN0YWNrXG59XG5Db21waWxlRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpXG5cbmV4cG9ydCBjbGFzcyBXYXJuaW5nIHtcblx0Y29uc3RydWN0b3IobG9jIC8qIExvYyAqLywgbWVzc2FnZSAvKiBTdHJpbmcgKi8pIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2Vcblx0fVxufVxuXG5leHBvcnQgY29uc3Rcblx0Y29kZSA9IHN0ciA9PiBge3ske3N0cn19fWAsXG5cdGZvcm1hdENvZGUgPSBmdW5jdGlvbiooc3RyLCBmb3JtYXR0ZXIpIHtcblx0XHRjb25zdCByZ3ggPSAve3soLio/KX19L2dcblx0XHRsZXQgcHJldklkeCA9IDBcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSByZ3guZXhlYyhzdHIpXG5cdFx0XHRpZiAobWF0Y2ggPT09IG51bGwpIHtcblx0XHRcdFx0eWllbGQgc3RyLnNsaWNlKHByZXZJZHgsIHN0ci5sZW5ndGgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR5aWVsZCBzdHIuc2xpY2UocHJldklkeCwgbWF0Y2guaW5kZXgpXG5cdFx0XHRcdHlpZWxkIGZvcm1hdHRlcihtYXRjaFsxXSlcblx0XHRcdFx0cHJldklkeCA9IHJneC5sYXN0SW5kZXhcblx0XHRcdH1cblx0XHR9XG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
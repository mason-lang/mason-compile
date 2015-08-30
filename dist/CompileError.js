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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbXBpbGVFcnJvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O21CQUV3QixZQUFZOztBQUFyQixVQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDN0MsTUFBSSxFQUFFLElBQUksWUFBWSxZQUFZLENBQUEsQUFBQyxFQUNsQyxPQUFPLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2pDLG1CQUxRLElBQUksRUFLUCxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7O0FBRXRCLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtBQUM5QixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUE7RUFDN0M7O0FBQ0QsYUFBWSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFaEQsT0FBTSxPQUFPLENBQUM7QUFDcEIsYUFBVyxDQUFDLEdBQUcsV0FBWSxPQUFPLGVBQWU7QUFDaEQsT0FBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDZCxPQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtHQUN0QjtFQUNEOzs7QUFFTSxPQUNOLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQztPQUMxQixVQUFVLEdBQUcsV0FBVSxHQUFHLEVBQUUsU0FBUyxFQUFFO0FBQ3RDLFFBQU0sR0FBRyxHQUFHLFlBQVksQ0FBQTtBQUN4QixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUE7QUFDZixTQUFPLElBQUksRUFBRTtBQUNaLFNBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDM0IsT0FBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ25CLFVBQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3BDLFVBQUs7SUFDTCxNQUFNO0FBQ04sVUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDckMsVUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsV0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUE7SUFDdkI7R0FDRDtFQUNELENBQUEiLCJmaWxlIjoiQ29tcGlsZUVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdHlwZSB9IGZyb20gJy4vcHJpdmF0ZS91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21waWxlRXJyb3Iod2FybmluZykge1xuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKSlcblx0XHRyZXR1cm4gbmV3IENvbXBpbGVFcnJvcih3YXJuaW5nKVxuXHR0eXBlKHdhcm5pbmcsIFdhcm5pbmcpXG5cdHRoaXMud2FybmluZyA9IHdhcm5pbmdcblx0Ly8gSW4gY2FzZSBpdCdzIG5vdCBjYXVnaHQgYW5kIGZvcm1hdHRlZDpcblx0dGhpcy5tZXNzYWdlID0gd2FybmluZy5tZXNzYWdlXG5cdHRoaXMuc3RhY2sgPSBuZXcgRXJyb3Iod2FybmluZy5tZXNzYWdlKS5zdGFja1xufVxuQ29tcGlsZUVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuXG5leHBvcnQgY2xhc3MgV2FybmluZyB7XG5cdGNvbnN0cnVjdG9yKGxvYyAvKiBMb2MgKi8sIG1lc3NhZ2UgLyogU3RyaW5nICovKSB7XG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0XG5cdGNvZGUgPSBzdHIgPT4gYHt7JHtzdHJ9fX1gLFxuXHRmb3JtYXRDb2RlID0gZnVuY3Rpb24qKHN0ciwgZm9ybWF0dGVyKSB7XG5cdFx0Y29uc3Qgcmd4ID0gL3t7KC4qPyl9fS9nXG5cdFx0bGV0IHByZXZJZHggPSAwXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gcmd4LmV4ZWMoc3RyKVxuXHRcdFx0aWYgKG1hdGNoID09PSBudWxsKSB7XG5cdFx0XHRcdHlpZWxkIHN0ci5zbGljZShwcmV2SWR4LCBzdHIubGVuZ3RoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0eWllbGQgc3RyLnNsaWNlKHByZXZJZHgsIG1hdGNoLmluZGV4KVxuXHRcdFx0XHR5aWVsZCBmb3JtYXR0ZXIobWF0Y2hbMV0pXG5cdFx0XHRcdHByZXZJZHggPSByZ3gubGFzdEluZGV4XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
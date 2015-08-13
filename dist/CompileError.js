if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/Loc', 'tupl/dist/tupl', './private/util'], function (exports, _esastDistLoc, _tuplDistTupl, _privateUtil) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.default = CompileError;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	var _tupl = _interopRequireDefault(_tuplDistTupl);

	function CompileError(warning) {
		if (!(this instanceof CompileError)) return new CompileError(warning);
		(0, _privateUtil.type)(warning, Warning);
		this.warning = warning;
		// In case it's not caught and formatted:
		this.message = warning.message;
		this.stack = new Error(warning.message).stack;
	}

	CompileError.prototype = Object.create(Error.prototype);

	const Warning = (0, _tupl.default)('Warning', Object, 'doc', ['loc', _Loc.default, 'message', String]),
	      code = str => `{{${ str }}}`,
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
	exports.Warning = Warning;
	exports.code = code;
	exports.formatCode = formatCode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbXBpbGVFcnJvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7bUJBSXdCLFlBQVk7Ozs7Ozs7O0FBQXJCLFVBQVMsWUFBWSxDQUFDLE9BQU8sRUFBRTtBQUM3QyxNQUFJLEVBQUUsSUFBSSxZQUFZLFlBQVksQ0FBQSxBQUFDLEVBQ2xDLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDakMsbUJBTFEsSUFBSSxFQUtQLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUN0QixNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0FBQzlCLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQTtFQUM3Qzs7QUFDRCxhQUFZLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBOztBQUVoRCxPQUNOLE9BQU8sR0FBRyxtQkFBSyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFFLEtBQUssZ0JBQU8sU0FBUyxFQUFFLE1BQU0sQ0FBRSxDQUFDO09BQzNFLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQztPQUMxQixVQUFVLEdBQUcsV0FBVSxHQUFHLEVBQUUsU0FBUyxFQUFFO0FBQ3RDLFFBQU0sR0FBRyxHQUFHLFlBQVksQ0FBQTtBQUN4QixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUE7QUFDZixTQUFPLElBQUksRUFBRTtBQUNaLFNBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDM0IsT0FBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ25CLFVBQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3BDLFVBQUs7SUFDTCxNQUFNO0FBQ04sVUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDckMsVUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsV0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUE7SUFDdkI7R0FDRDtFQUNELENBQUEiLCJmaWxlIjoiQ29tcGlsZUVycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB0dXBsIGZyb20gJ3R1cGwvZGlzdC90dXBsJ1xuaW1wb3J0IHsgdHlwZSB9IGZyb20gJy4vcHJpdmF0ZS91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb21waWxlRXJyb3Iod2FybmluZykge1xuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKSlcblx0XHRyZXR1cm4gbmV3IENvbXBpbGVFcnJvcih3YXJuaW5nKVxuXHR0eXBlKHdhcm5pbmcsIFdhcm5pbmcpXG5cdHRoaXMud2FybmluZyA9IHdhcm5pbmdcblx0Ly8gSW4gY2FzZSBpdCdzIG5vdCBjYXVnaHQgYW5kIGZvcm1hdHRlZDpcblx0dGhpcy5tZXNzYWdlID0gd2FybmluZy5tZXNzYWdlXG5cdHRoaXMuc3RhY2sgPSBuZXcgRXJyb3Iod2FybmluZy5tZXNzYWdlKS5zdGFja1xufVxuQ29tcGlsZUVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuXG5leHBvcnQgY29uc3Rcblx0V2FybmluZyA9IHR1cGwoJ1dhcm5pbmcnLCBPYmplY3QsICdkb2MnLCBbICdsb2MnLCBMb2MsICdtZXNzYWdlJywgU3RyaW5nIF0pLFxuXHRjb2RlID0gc3RyID0+IGB7eyR7c3RyfX19YCxcblx0Zm9ybWF0Q29kZSA9IGZ1bmN0aW9uKihzdHIsIGZvcm1hdHRlcikge1xuXHRcdGNvbnN0IHJneCA9IC97eyguKj8pfX0vZ1xuXHRcdGxldCBwcmV2SWR4ID0gMFxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjb25zdCBtYXRjaCA9IHJneC5leGVjKHN0cilcblx0XHRcdGlmIChtYXRjaCA9PT0gbnVsbCkge1xuXHRcdFx0XHR5aWVsZCBzdHIuc2xpY2UocHJldklkeCwgc3RyLmxlbmd0aClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHlpZWxkIHN0ci5zbGljZShwcmV2SWR4LCBtYXRjaC5pbmRleClcblx0XHRcdFx0eWllbGQgZm9ybWF0dGVyKG1hdGNoWzFdKVxuXHRcdFx0XHRwcmV2SWR4ID0gcmd4Lmxhc3RJbmRleFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
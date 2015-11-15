'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.defaultBuiltins = mod.exports;
	}
})(this, function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		global: [
		// Standard globals
		'Array', 'Boolean', 'console', 'Date', 'Error', 'Function', 'Intl', 'JSON', 'Proxy', 'Math', 'Number', 'Object', 'Reflect', 'RegExp', 'SIMD', 'String', 'Symbol',

		// Errors
		'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',

		// ArrayBuffer and views
		'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array', 'Int16Array', 'Int32Array', 'Int8Array', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray',

		// URI functions
		'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent'

		// Missing globals:
		// eval: Want to discourage use
		// isFinite, isNaN, parseFloat, parseInt: use Number.xxx functions
		// Map, Set: have different meanings for msl. Use Id-Map and Id-Set for native versions.
		// WeakMap, WeakSet: use Weak-Id-Map and Weak-Id-Set
		],
		'msl.@.?': ['_', '?None', 'Opt->?', '?->Opt', '?-or', '?-cond', '?some', 'un-?'],
		'msl.@.@': ['_', '++', '++~', '+!', '++!', '--', '--~', '-!', '--!', 'all?', 'any?', 'count', 'each!', 'empty?', 'empty!', '?find', 'fold', '@flat-map', '@flat-map~', '@flatten', '@flatten~', 'iterator', '@keep', '@keep~', '@map', '@map~'],
		'msl.@.@-Type': ['empty'],
		'msl.@.Map.Id-Map': ['_'],
		'msl.@.Map.Hash-Map': ['_'],
		'msl.@.Map.Map': ['_', '?get', '@keys', 'make-map', 'map=?', '@values'],
		'msl.@.Range': ['_'],
		'msl.@.Seq.Seq': ['_', '+>!', '@drop', '@drop~', '@drop-while', '@drop-while~', 'first', '?first', '@indexes', 'last', '?last', '?nth', '@reverse', '@reverse~', '@rtail', '@slice', '@slice~', '@split', '@split~', 'seq=?', '@tail', '@take', '@take~', '@take-while', '@take-while~', '@zip', '@zip~'],
		'msl.@.Seq.Stream': ['_'],
		'msl.@.Set.Id-Set': ['_'],
		'msl.@.Set.Set': ['_', 'set=?'],
		'msl.$': ['_'],
		'msl.compare': ['=?', '<?', '<=?', '>?', '>=?', '?min', 'min', '?min-by', 'min-by', '?max', 'max', '?max-by', 'max-by', 'same?'],
		'msl.Function': ['Action', 'identity'],
		'msl.js': ['defined?', 'id=?', 'null?'],
		'msl.math.methods': ['+', '-', '*', '/'],
		'msl.math.Number': ['divisible?', 'Int', 'int/', 'log-base', 'modulo', 'nearest-ceil', 'nearest-floor', 'nearest-round', 'Nat', 'remainder', 'square'],
		'msl.math.util': ['average', 'sum'],
		'msl.methods': ['sub', 'set-sub!', 'del-sub!'],
		'msl.to-string': ['_', 'inspect'],
		'msl.Type.Method': ['_', 'impl!', 'impl-for', 'self-impl!'],
		'msl.Type.Kind': ['_', 'kind!', 'self-kind!'],
		'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
		'msl.Type.Type': ['_', '=>', 'contains?', 'extract']
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWU7QUFDZCxRQUFNLEVBQUU7O0FBRVAsU0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVE7OztBQUdSLGFBQVcsRUFDWCxlQUFlLEVBQ2YsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixhQUFhLEVBQ2IsV0FBVyxFQUNYLFVBQVU7OztBQUdWLGVBQWEsRUFDYixVQUFVLEVBQ1YsY0FBYyxFQUNkLGNBQWMsRUFDZCxZQUFZLEVBQ1osWUFBWSxFQUNaLFdBQVcsRUFDWCxhQUFhLEVBQ2IsYUFBYSxFQUNiLFlBQVksRUFDWixtQkFBbUI7OztBQUduQixhQUFXLEVBQ1gsb0JBQW9CLEVBQ3BCLFdBQVcsRUFDWDs7Ozs7OztBQUFvQixHQU9wQjtBQUNELFdBQVMsRUFBRSxDQUNWLEdBQUcsRUFDSCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLENBQ047QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sTUFBTSxFQUNOLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxFQUNOLFdBQVcsRUFDWCxZQUFZLEVBQ1osVUFBVSxFQUNWLFdBQVcsRUFDWCxVQUFVLEVBQ1YsT0FBTyxFQUNQLFFBQVEsRUFDUixNQUFNLEVBQ04sT0FBTyxDQUNQO0FBQ0QsZ0JBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUN6QixvQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN6QixzQkFBb0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUMzQixpQkFBZSxFQUFFLENBQ2hCLEdBQUcsRUFDSCxNQUFNLEVBQ04sT0FBTyxFQUNQLFVBQVUsRUFDVixPQUFPLEVBQ1AsU0FBUyxDQUNUO0FBQ0QsZUFBYSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3BCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILEtBQUssRUFDTCxPQUFPLEVBQ1AsUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsT0FBTyxFQUNQLFFBQVEsRUFDUixVQUFVLEVBQ1YsTUFBTSxFQUNOLE9BQU8sRUFDUCxNQUFNLEVBQ04sVUFBVSxFQUNWLFdBQVcsRUFDWCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBQ1IsU0FBUyxFQUNULE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixhQUFhLEVBQ2IsY0FBYyxFQUNkLE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxvQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN6QixvQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN6QixpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztBQUMvQixTQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZCxlQUFhLEVBQUUsQ0FDZCxJQUFJLEVBQ0osSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixNQUFNLEVBQ04sS0FBSyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsT0FBTyxDQUNQO0FBQ0QsZ0JBQWMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUM7QUFDdEMsVUFBUSxFQUFFLENBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxvQkFBa0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN4QyxtQkFBaUIsRUFBRSxDQUNsQixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixVQUFVLEVBQ1YsUUFBUSxFQUNSLGNBQWMsRUFDZCxlQUFlLEVBQ2YsZUFBZSxFQUNmLEtBQUssRUFDTCxXQUFXLEVBQ1gsUUFBUSxDQUNSO0FBQ0QsaUJBQWUsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7QUFDbkMsZUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUM7QUFDOUMsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUM7QUFDakMsbUJBQWlCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUM7QUFDM0QsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDO0FBQzdDLHNCQUFvQixFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7QUFDNUMsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQztFQUNwRCIsImZpbGUiOiJkZWZhdWx0QnVpbHRpbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG5cdGdsb2JhbDogW1xuXHRcdC8vIFN0YW5kYXJkIGdsb2JhbHNcblx0XHQnQXJyYXknLFxuXHRcdCdCb29sZWFuJyxcblx0XHQnY29uc29sZScsXG5cdFx0J0RhdGUnLFxuXHRcdCdFcnJvcicsXG5cdFx0J0Z1bmN0aW9uJyxcblx0XHQnSW50bCcsXG5cdFx0J0pTT04nLFxuXHRcdCdQcm94eScsXG5cdFx0J01hdGgnLFxuXHRcdCdOdW1iZXInLFxuXHRcdCdPYmplY3QnLFxuXHRcdCdSZWZsZWN0Jyxcblx0XHQnUmVnRXhwJyxcblx0XHQnU0lNRCcsXG5cdFx0J1N0cmluZycsXG5cdFx0J1N5bWJvbCcsXG5cblx0XHQvLyBFcnJvcnNcblx0XHQnRXZhbEVycm9yJyxcblx0XHQnSW50ZXJuYWxFcnJvcicsXG5cdFx0J1JhbmdlRXJyb3InLFxuXHRcdCdSZWZlcmVuY2VFcnJvcicsXG5cdFx0J1N5bnRheEVycm9yJyxcblx0XHQnVHlwZUVycm9yJyxcblx0XHQnVVJJRXJyb3InLFxuXG5cdFx0Ly8gQXJyYXlCdWZmZXIgYW5kIHZpZXdzXG5cdFx0J0FycmF5QnVmZmVyJyxcblx0XHQnRGF0YVZpZXcnLFxuXHRcdCdGbG9hdDMyQXJyYXknLFxuXHRcdCdGbG9hdDY0QXJyYXknLFxuXHRcdCdJbnQxNkFycmF5Jyxcblx0XHQnSW50MzJBcnJheScsXG5cdFx0J0ludDhBcnJheScsXG5cdFx0J1VpbnQxNkFycmF5Jyxcblx0XHQnVWludDMyQXJyYXknLFxuXHRcdCdVaW50OEFycmF5Jyxcblx0XHQnVWludDhDbGFtcGVkQXJyYXknLFxuXG5cdFx0Ly8gVVJJIGZ1bmN0aW9uc1xuXHRcdCdkZWNvZGVVUkknLFxuXHRcdCdkZWNvZGVVUklDb21wb25lbnQnLFxuXHRcdCdlbmNvZGVVUkknLFxuXHRcdCdlbmNvZGVVUklDb21wb25lbnQnXG5cblx0XHQvLyBNaXNzaW5nIGdsb2JhbHM6XG5cdFx0Ly8gZXZhbDogV2FudCB0byBkaXNjb3VyYWdlIHVzZVxuXHRcdC8vIGlzRmluaXRlLCBpc05hTiwgcGFyc2VGbG9hdCwgcGFyc2VJbnQ6IHVzZSBOdW1iZXIueHh4IGZ1bmN0aW9uc1xuXHRcdC8vIE1hcCwgU2V0OiBoYXZlIGRpZmZlcmVudCBtZWFuaW5ncyBmb3IgbXNsLiBVc2UgSWQtTWFwIGFuZCBJZC1TZXQgZm9yIG5hdGl2ZSB2ZXJzaW9ucy5cblx0XHQvLyBXZWFrTWFwLCBXZWFrU2V0OiB1c2UgV2Vhay1JZC1NYXAgYW5kIFdlYWstSWQtU2V0XG5cdF0sXG5cdCdtc2wuQC4/JzogW1xuXHRcdCdfJyxcblx0XHQnP05vbmUnLFxuXHRcdCdPcHQtPj8nLFxuXHRcdCc/LT5PcHQnLFxuXHRcdCc/LW9yJyxcblx0XHQnPy1jb25kJyxcblx0XHQnP3NvbWUnLFxuXHRcdCd1bi0/J1xuXHRdLFxuXHQnbXNsLkAuQCc6IFtcblx0XHQnXycsXG5cdFx0JysrJyxcblx0XHQnKyt+Jyxcblx0XHQnKyEnLFxuXHRcdCcrKyEnLFxuXHRcdCctLScsXG5cdFx0Jy0tficsXG5cdFx0Jy0hJyxcblx0XHQnLS0hJyxcblx0XHQnYWxsPycsXG5cdFx0J2FueT8nLFxuXHRcdCdjb3VudCcsXG5cdFx0J2VhY2ghJyxcblx0XHQnZW1wdHk/Jyxcblx0XHQnZW1wdHkhJyxcblx0XHQnP2ZpbmQnLFxuXHRcdCdmb2xkJyxcblx0XHQnQGZsYXQtbWFwJyxcblx0XHQnQGZsYXQtbWFwficsXG5cdFx0J0BmbGF0dGVuJyxcblx0XHQnQGZsYXR0ZW5+Jyxcblx0XHQnaXRlcmF0b3InLFxuXHRcdCdAa2VlcCcsXG5cdFx0J0BrZWVwficsXG5cdFx0J0BtYXAnLFxuXHRcdCdAbWFwficsXG5cdF0sXG5cdCdtc2wuQC5ALVR5cGUnOiBbJ2VtcHR5J10sXG5cdCdtc2wuQC5NYXAuSWQtTWFwJzogWydfJ10sXG5cdCdtc2wuQC5NYXAuSGFzaC1NYXAnOiBbJ18nXSxcblx0J21zbC5ALk1hcC5NYXAnOiBbXG5cdFx0J18nLFxuXHRcdCc/Z2V0Jyxcblx0XHQnQGtleXMnLFxuXHRcdCdtYWtlLW1hcCcsXG5cdFx0J21hcD0/Jyxcblx0XHQnQHZhbHVlcydcblx0XSxcblx0J21zbC5ALlJhbmdlJzogWydfJ10sXG5cdCdtc2wuQC5TZXEuU2VxJzogW1xuXHRcdCdfJyxcblx0XHQnKz4hJyxcblx0XHQnQGRyb3AnLFxuXHRcdCdAZHJvcH4nLFxuXHRcdCdAZHJvcC13aGlsZScsXG5cdFx0J0Bkcm9wLXdoaWxlficsXG5cdFx0J2ZpcnN0Jyxcblx0XHQnP2ZpcnN0Jyxcblx0XHQnQGluZGV4ZXMnLFxuXHRcdCdsYXN0Jyxcblx0XHQnP2xhc3QnLFxuXHRcdCc/bnRoJyxcblx0XHQnQHJldmVyc2UnLFxuXHRcdCdAcmV2ZXJzZX4nLFxuXHRcdCdAcnRhaWwnLFxuXHRcdCdAc2xpY2UnLFxuXHRcdCdAc2xpY2V+Jyxcblx0XHQnQHNwbGl0Jyxcblx0XHQnQHNwbGl0ficsXG5cdFx0J3NlcT0/Jyxcblx0XHQnQHRhaWwnLFxuXHRcdCdAdGFrZScsXG5cdFx0J0B0YWtlficsXG5cdFx0J0B0YWtlLXdoaWxlJyxcblx0XHQnQHRha2Utd2hpbGV+Jyxcblx0XHQnQHppcCcsXG5cdFx0J0B6aXB+J1xuXHRdLFxuXHQnbXNsLkAuU2VxLlN0cmVhbSc6IFsnXyddLFxuXHQnbXNsLkAuU2V0LklkLVNldCc6IFsnXyddLFxuXHQnbXNsLkAuU2V0LlNldCc6IFsnXycsICdzZXQ9PyddLFxuXHQnbXNsLiQnOiBbJ18nXSxcblx0J21zbC5jb21wYXJlJzogW1xuXHRcdCc9PycsXG5cdFx0Jzw/Jyxcblx0XHQnPD0/Jyxcblx0XHQnPj8nLFxuXHRcdCc+PT8nLFxuXHRcdCc/bWluJyxcblx0XHQnbWluJyxcblx0XHQnP21pbi1ieScsXG5cdFx0J21pbi1ieScsXG5cdFx0Jz9tYXgnLFxuXHRcdCdtYXgnLFxuXHRcdCc/bWF4LWJ5Jyxcblx0XHQnbWF4LWJ5Jyxcblx0XHQnc2FtZT8nXG5cdF0sXG5cdCdtc2wuRnVuY3Rpb24nOiBbJ0FjdGlvbicsICdpZGVudGl0eSddLFxuXHQnbXNsLmpzJzogW1xuXHRcdCdkZWZpbmVkPycsXG5cdFx0J2lkPT8nLFxuXHRcdCdudWxsPydcblx0XSxcblx0J21zbC5tYXRoLm1ldGhvZHMnOiBbJysnLCAnLScsICcqJywgJy8nXSxcblx0J21zbC5tYXRoLk51bWJlcic6IFtcblx0XHQnZGl2aXNpYmxlPycsXG5cdFx0J0ludCcsXG5cdFx0J2ludC8nLFxuXHRcdCdsb2ctYmFzZScsXG5cdFx0J21vZHVsbycsXG5cdFx0J25lYXJlc3QtY2VpbCcsXG5cdFx0J25lYXJlc3QtZmxvb3InLFxuXHRcdCduZWFyZXN0LXJvdW5kJyxcblx0XHQnTmF0Jyxcblx0XHQncmVtYWluZGVyJyxcblx0XHQnc3F1YXJlJ1xuXHRdLFxuXHQnbXNsLm1hdGgudXRpbCc6IFsnYXZlcmFnZScsICdzdW0nXSxcblx0J21zbC5tZXRob2RzJzogWydzdWInLCAnc2V0LXN1YiEnLCAnZGVsLXN1YiEnXSxcblx0J21zbC50by1zdHJpbmcnOiBbJ18nLCAnaW5zcGVjdCddLFxuXHQnbXNsLlR5cGUuTWV0aG9kJzogWydfJywgJ2ltcGwhJywgJ2ltcGwtZm9yJywgJ3NlbGYtaW1wbCEnXSxcblx0J21zbC5UeXBlLktpbmQnOiBbJ18nLCAna2luZCEnLCAnc2VsZi1raW5kISddLFxuXHQnbXNsLlR5cGUuUHJlZC1UeXBlJzogWydfJywgJ0FueScsICdPYmpMaXQnXSxcblx0J21zbC5UeXBlLlR5cGUnOiBbJ18nLCAnPT4nLCAnY29udGFpbnM/JywgJ2V4dHJhY3QnXVxufVxuIl19
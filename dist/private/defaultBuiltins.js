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
		'Array', 'Boolean', 'console', 'Date', 'Error', 'Function', 'Intl', 'JSON', 'Promise', 'Proxy', 'Math', 'Number', 'Object', 'Reflect', 'RegExp', 'SIMD', 'String', 'Symbol',

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
		'msl.@.@': ['_', '++', '++~', '+!', '++!', '--', '--~', '-!', '--!', 'all?', 'any?', 'count', 'each!', 'empty', 'empty!', 'empty?', '?find', 'fold', '@flat-map', '@flat-map~', '@flatten', '@flatten~', 'iterator', '@keep', '@keep~', '@toss', '@toss~', '@map', '@map~'],
		'msl.@.Map.Id-Map': ['_'],
		'msl.@.Map.Hash-Map': ['_'],
		'msl.@.Map.Map': ['_', '?get', '@keys', 'make-map', 'map=?', '@values'],
		'msl.@.Range': ['_'],
		'msl.@.Seq.Seq': ['_', '+>!', '@drop', '@drop~', '@drop-while', '@drop-while~', 'first', '?first', '@indexes', 'last', '?last', '?nth', '@reverse', '@reverse~', '@rtail', '@slice', '@slice~', '@split', '@split~', 'seq=?', '@tail', '@take', '@take~', '@take-while', '@take-while~', '@zip', '@zip~'],
		'msl.@.Seq.Stream': ['_'],
		'msl.@.Set.Id-Set': ['_'],
		'msl.@.Set.Set': ['_', 'set=?'],
		'msl.compare': ['=?', '<?', '<=?', '>?', '>=?', '?min', 'min', '?min-by', 'min-by', '?max', 'max', '?max-by', 'max-by', 'same?'],
		'msl.Function': ['Action', 'identity'],
		'msl.js': ['defined?', 'exists?', 'id=?', 'null?'],
		'msl.math.methods': ['+', '-', '*', '/'],
		'msl.math.Number': ['divisible?', 'Int', 'int/', 'log-base', 'modulo', 'nearest-ceil', 'nearest-floor', 'nearest-round', 'Nat', 'remainder', 'square'],
		'msl.math.util': ['average', 'sum'],
		'msl.methods': ['sub', 'set-sub!', 'del-sub!'],
		'msl.to-string': ['_', 'inspect'],
		'msl.Type.Method': ['_', 'impl!', 'impl-for', 'self-impl!'],
		'msl.Type.Trait': ['_'],
		'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
		'msl.Type.primitive': ['Bool', 'Num', 'Str', 'Sym'],
		'msl.Type.Type': ['_', '=>', 'has-instance?', 'extract']
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWU7QUFDZCxRQUFNLEVBQUU7O0FBRVAsU0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixTQUFTLEVBQ1QsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFROzs7QUFHUixhQUFXLEVBQ1gsZUFBZSxFQUNmLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFdBQVcsRUFDWCxVQUFVOzs7QUFHVixlQUFhLEVBQ2IsVUFBVSxFQUNWLGNBQWMsRUFDZCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEVBQ1gsYUFBYSxFQUNiLGFBQWEsRUFDYixZQUFZLEVBQ1osbUJBQW1COzs7QUFHbkIsYUFBVyxFQUNYLG9CQUFvQixFQUNwQixXQUFXLEVBQ1g7Ozs7Ozs7QUFBb0IsR0FPcEI7QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxDQUNOO0FBQ0QsV0FBUyxFQUFFLENBQ1YsR0FBRyxFQUNILElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFVBQVUsRUFDVixPQUFPLEVBQ1AsUUFBUSxFQUNSLE9BQU8sRUFDUCxRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLHNCQUFvQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzNCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILE1BQU0sRUFDTixPQUFPLEVBQ1AsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLENBQ1Q7QUFDRCxlQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsS0FBSyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixTQUFTLEVBQ1QsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO0FBQy9CLGVBQWEsRUFBRSxDQUNkLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQztBQUN0QyxVQUFRLEVBQUUsQ0FDVCxVQUFVLEVBQ1YsU0FBUyxFQUNULE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxvQkFBa0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN4QyxtQkFBaUIsRUFBRSxDQUNsQixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixVQUFVLEVBQ1YsUUFBUSxFQUNSLGNBQWMsRUFDZCxlQUFlLEVBQ2YsZUFBZSxFQUNmLEtBQUssRUFDTCxXQUFXLEVBQ1gsUUFBUSxDQUNSO0FBQ0QsaUJBQWUsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7QUFDbkMsZUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUM7QUFDOUMsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUM7QUFDakMsbUJBQWlCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUM7QUFDM0Qsa0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDdkIsc0JBQW9CLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUM1QyxzQkFBb0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztBQUNuRCxpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsU0FBUyxDQUFDO0VBQ3hEIiwiZmlsZSI6ImRlZmF1bHRCdWlsdGlucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcblx0Z2xvYmFsOiBbXG5cdFx0Ly8gU3RhbmRhcmQgZ2xvYmFsc1xuXHRcdCdBcnJheScsXG5cdFx0J0Jvb2xlYW4nLFxuXHRcdCdjb25zb2xlJyxcblx0XHQnRGF0ZScsXG5cdFx0J0Vycm9yJyxcblx0XHQnRnVuY3Rpb24nLFxuXHRcdCdJbnRsJyxcblx0XHQnSlNPTicsXG5cdFx0J1Byb21pc2UnLFxuXHRcdCdQcm94eScsXG5cdFx0J01hdGgnLFxuXHRcdCdOdW1iZXInLFxuXHRcdCdPYmplY3QnLFxuXHRcdCdSZWZsZWN0Jyxcblx0XHQnUmVnRXhwJyxcblx0XHQnU0lNRCcsXG5cdFx0J1N0cmluZycsXG5cdFx0J1N5bWJvbCcsXG5cblx0XHQvLyBFcnJvcnNcblx0XHQnRXZhbEVycm9yJyxcblx0XHQnSW50ZXJuYWxFcnJvcicsXG5cdFx0J1JhbmdlRXJyb3InLFxuXHRcdCdSZWZlcmVuY2VFcnJvcicsXG5cdFx0J1N5bnRheEVycm9yJyxcblx0XHQnVHlwZUVycm9yJyxcblx0XHQnVVJJRXJyb3InLFxuXG5cdFx0Ly8gQXJyYXlCdWZmZXIgYW5kIHZpZXdzXG5cdFx0J0FycmF5QnVmZmVyJyxcblx0XHQnRGF0YVZpZXcnLFxuXHRcdCdGbG9hdDMyQXJyYXknLFxuXHRcdCdGbG9hdDY0QXJyYXknLFxuXHRcdCdJbnQxNkFycmF5Jyxcblx0XHQnSW50MzJBcnJheScsXG5cdFx0J0ludDhBcnJheScsXG5cdFx0J1VpbnQxNkFycmF5Jyxcblx0XHQnVWludDMyQXJyYXknLFxuXHRcdCdVaW50OEFycmF5Jyxcblx0XHQnVWludDhDbGFtcGVkQXJyYXknLFxuXG5cdFx0Ly8gVVJJIGZ1bmN0aW9uc1xuXHRcdCdkZWNvZGVVUkknLFxuXHRcdCdkZWNvZGVVUklDb21wb25lbnQnLFxuXHRcdCdlbmNvZGVVUkknLFxuXHRcdCdlbmNvZGVVUklDb21wb25lbnQnXG5cblx0XHQvLyBNaXNzaW5nIGdsb2JhbHM6XG5cdFx0Ly8gZXZhbDogV2FudCB0byBkaXNjb3VyYWdlIHVzZVxuXHRcdC8vIGlzRmluaXRlLCBpc05hTiwgcGFyc2VGbG9hdCwgcGFyc2VJbnQ6IHVzZSBOdW1iZXIueHh4IGZ1bmN0aW9uc1xuXHRcdC8vIE1hcCwgU2V0OiBoYXZlIGRpZmZlcmVudCBtZWFuaW5ncyBmb3IgbXNsLiBVc2UgSWQtTWFwIGFuZCBJZC1TZXQgZm9yIG5hdGl2ZSB2ZXJzaW9ucy5cblx0XHQvLyBXZWFrTWFwLCBXZWFrU2V0OiB1c2UgV2Vhay1JZC1NYXAgYW5kIFdlYWstSWQtU2V0XG5cdF0sXG5cdCdtc2wuQC4/JzogW1xuXHRcdCdfJyxcblx0XHQnP05vbmUnLFxuXHRcdCdPcHQtPj8nLFxuXHRcdCc/LT5PcHQnLFxuXHRcdCc/LW9yJyxcblx0XHQnPy1jb25kJyxcblx0XHQnP3NvbWUnLFxuXHRcdCd1bi0/J1xuXHRdLFxuXHQnbXNsLkAuQCc6IFtcblx0XHQnXycsXG5cdFx0JysrJyxcblx0XHQnKyt+Jyxcblx0XHQnKyEnLFxuXHRcdCcrKyEnLFxuXHRcdCctLScsXG5cdFx0Jy0tficsXG5cdFx0Jy0hJyxcblx0XHQnLS0hJyxcblx0XHQnYWxsPycsXG5cdFx0J2FueT8nLFxuXHRcdCdjb3VudCcsXG5cdFx0J2VhY2ghJyxcblx0XHQnZW1wdHknLFxuXHRcdCdlbXB0eSEnLFxuXHRcdCdlbXB0eT8nLFxuXHRcdCc/ZmluZCcsXG5cdFx0J2ZvbGQnLFxuXHRcdCdAZmxhdC1tYXAnLFxuXHRcdCdAZmxhdC1tYXB+Jyxcblx0XHQnQGZsYXR0ZW4nLFxuXHRcdCdAZmxhdHRlbn4nLFxuXHRcdCdpdGVyYXRvcicsXG5cdFx0J0BrZWVwJyxcblx0XHQnQGtlZXB+Jyxcblx0XHQnQHRvc3MnLFxuXHRcdCdAdG9zc34nLFxuXHRcdCdAbWFwJyxcblx0XHQnQG1hcH4nXG5cdF0sXG5cdCdtc2wuQC5NYXAuSWQtTWFwJzogWydfJ10sXG5cdCdtc2wuQC5NYXAuSGFzaC1NYXAnOiBbJ18nXSxcblx0J21zbC5ALk1hcC5NYXAnOiBbXG5cdFx0J18nLFxuXHRcdCc/Z2V0Jyxcblx0XHQnQGtleXMnLFxuXHRcdCdtYWtlLW1hcCcsXG5cdFx0J21hcD0/Jyxcblx0XHQnQHZhbHVlcydcblx0XSxcblx0J21zbC5ALlJhbmdlJzogWydfJ10sXG5cdCdtc2wuQC5TZXEuU2VxJzogW1xuXHRcdCdfJyxcblx0XHQnKz4hJyxcblx0XHQnQGRyb3AnLFxuXHRcdCdAZHJvcH4nLFxuXHRcdCdAZHJvcC13aGlsZScsXG5cdFx0J0Bkcm9wLXdoaWxlficsXG5cdFx0J2ZpcnN0Jyxcblx0XHQnP2ZpcnN0Jyxcblx0XHQnQGluZGV4ZXMnLFxuXHRcdCdsYXN0Jyxcblx0XHQnP2xhc3QnLFxuXHRcdCc/bnRoJyxcblx0XHQnQHJldmVyc2UnLFxuXHRcdCdAcmV2ZXJzZX4nLFxuXHRcdCdAcnRhaWwnLFxuXHRcdCdAc2xpY2UnLFxuXHRcdCdAc2xpY2V+Jyxcblx0XHQnQHNwbGl0Jyxcblx0XHQnQHNwbGl0ficsXG5cdFx0J3NlcT0/Jyxcblx0XHQnQHRhaWwnLFxuXHRcdCdAdGFrZScsXG5cdFx0J0B0YWtlficsXG5cdFx0J0B0YWtlLXdoaWxlJyxcblx0XHQnQHRha2Utd2hpbGV+Jyxcblx0XHQnQHppcCcsXG5cdFx0J0B6aXB+J1xuXHRdLFxuXHQnbXNsLkAuU2VxLlN0cmVhbSc6IFsnXyddLFxuXHQnbXNsLkAuU2V0LklkLVNldCc6IFsnXyddLFxuXHQnbXNsLkAuU2V0LlNldCc6IFsnXycsICdzZXQ9PyddLFxuXHQnbXNsLmNvbXBhcmUnOiBbXG5cdFx0Jz0/Jyxcblx0XHQnPD8nLFxuXHRcdCc8PT8nLFxuXHRcdCc+PycsXG5cdFx0Jz49PycsXG5cdFx0Jz9taW4nLFxuXHRcdCdtaW4nLFxuXHRcdCc/bWluLWJ5Jyxcblx0XHQnbWluLWJ5Jyxcblx0XHQnP21heCcsXG5cdFx0J21heCcsXG5cdFx0Jz9tYXgtYnknLFxuXHRcdCdtYXgtYnknLFxuXHRcdCdzYW1lPydcblx0XSxcblx0J21zbC5GdW5jdGlvbic6IFsnQWN0aW9uJywgJ2lkZW50aXR5J10sXG5cdCdtc2wuanMnOiBbXG5cdFx0J2RlZmluZWQ/Jyxcblx0XHQnZXhpc3RzPycsXG5cdFx0J2lkPT8nLFxuXHRcdCdudWxsPydcblx0XSxcblx0J21zbC5tYXRoLm1ldGhvZHMnOiBbJysnLCAnLScsICcqJywgJy8nXSxcblx0J21zbC5tYXRoLk51bWJlcic6IFtcblx0XHQnZGl2aXNpYmxlPycsXG5cdFx0J0ludCcsXG5cdFx0J2ludC8nLFxuXHRcdCdsb2ctYmFzZScsXG5cdFx0J21vZHVsbycsXG5cdFx0J25lYXJlc3QtY2VpbCcsXG5cdFx0J25lYXJlc3QtZmxvb3InLFxuXHRcdCduZWFyZXN0LXJvdW5kJyxcblx0XHQnTmF0Jyxcblx0XHQncmVtYWluZGVyJyxcblx0XHQnc3F1YXJlJ1xuXHRdLFxuXHQnbXNsLm1hdGgudXRpbCc6IFsnYXZlcmFnZScsICdzdW0nXSxcblx0J21zbC5tZXRob2RzJzogWydzdWInLCAnc2V0LXN1YiEnLCAnZGVsLXN1YiEnXSxcblx0J21zbC50by1zdHJpbmcnOiBbJ18nLCAnaW5zcGVjdCddLFxuXHQnbXNsLlR5cGUuTWV0aG9kJzogWydfJywgJ2ltcGwhJywgJ2ltcGwtZm9yJywgJ3NlbGYtaW1wbCEnXSxcblx0J21zbC5UeXBlLlRyYWl0JzogWydfJ10sXG5cdCdtc2wuVHlwZS5QcmVkLVR5cGUnOiBbJ18nLCAnQW55JywgJ09iakxpdCddLFxuXHQnbXNsLlR5cGUucHJpbWl0aXZlJzogWydCb29sJywgJ051bScsICdTdHInLCAnU3ltJ10sXG5cdCdtc2wuVHlwZS5UeXBlJzogWydfJywgJz0+JywgJ2hhcy1pbnN0YW5jZT8nLCAnZXh0cmFjdCddXG59XG4iXX0=
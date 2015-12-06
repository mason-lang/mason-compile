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
		'msl.@.@': ['_', '++', '++~', '+!', '++!', '--', '--~', '-!', '--!', 'all?', 'any?', 'count', 'each!', 'empty?', 'empty!', '?find', 'fold', '@flat-map', '@flat-map~', '@flatten', '@flatten~', 'iterator', '@keep', '@keep~', '@toss', '@toss~', '@map', '@map~'],
		'msl.@.@-Type': ['empty'],
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
		'msl.Type.Kind': ['_', 'kind!', 'self-kind!'],
		'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
		'msl.Type.primitive': ['Bool', 'Num', 'Str', 'Sym'],
		'msl.Type.Type': ['_', '=>', 'has-instance?', 'extract']
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWU7QUFDZCxRQUFNLEVBQUU7O0FBRVAsU0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixTQUFTLEVBQ1QsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFROzs7QUFHUixhQUFXLEVBQ1gsZUFBZSxFQUNmLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFdBQVcsRUFDWCxVQUFVOzs7QUFHVixlQUFhLEVBQ2IsVUFBVSxFQUNWLGNBQWMsRUFDZCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEVBQ1gsYUFBYSxFQUNiLGFBQWEsRUFDYixZQUFZLEVBQ1osbUJBQW1COzs7QUFHbkIsYUFBVyxFQUNYLG9CQUFvQixFQUNwQixXQUFXLEVBQ1g7Ozs7Ozs7QUFBb0IsR0FPcEI7QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxDQUNOO0FBQ0QsV0FBUyxFQUFFLENBQ1YsR0FBRyxFQUNILElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixXQUFXLEVBQ1gsWUFBWSxFQUNaLFVBQVUsRUFDVixXQUFXLEVBQ1gsVUFBVSxFQUNWLE9BQU8sRUFDUCxRQUFRLEVBQ1IsT0FBTyxFQUNQLFFBQVEsRUFDUixNQUFNLEVBQ04sT0FBTyxDQUNQO0FBQ0QsZ0JBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUN6QixvQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN6QixzQkFBb0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUMzQixpQkFBZSxFQUFFLENBQ2hCLEdBQUcsRUFDSCxNQUFNLEVBQ04sT0FBTyxFQUNQLFVBQVUsRUFDVixPQUFPLEVBQ1AsU0FBUyxDQUNUO0FBQ0QsZUFBYSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3BCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILEtBQUssRUFDTCxPQUFPLEVBQ1AsUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsT0FBTyxFQUNQLFFBQVEsRUFDUixVQUFVLEVBQ1YsTUFBTSxFQUNOLE9BQU8sRUFDUCxNQUFNLEVBQ04sVUFBVSxFQUNWLFdBQVcsRUFDWCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBQ1IsU0FBUyxFQUNULE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixhQUFhLEVBQ2IsY0FBYyxFQUNkLE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxvQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN6QixvQkFBa0IsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN6QixpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztBQUMvQixlQUFhLEVBQUUsQ0FDZCxJQUFJLEVBQ0osSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixNQUFNLEVBQ04sS0FBSyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsT0FBTyxDQUNQO0FBQ0QsZ0JBQWMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUM7QUFDdEMsVUFBUSxFQUFFLENBQ1QsVUFBVSxFQUNWLFNBQVMsRUFDVCxNQUFNLEVBQ04sT0FBTyxDQUNQO0FBQ0Qsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDeEMsbUJBQWlCLEVBQUUsQ0FDbEIsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLFFBQVEsRUFDUixjQUFjLEVBQ2QsZUFBZSxFQUNmLGVBQWUsRUFDZixLQUFLLEVBQ0wsV0FBVyxFQUNYLFFBQVEsQ0FDUjtBQUNELGlCQUFlLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO0FBQ25DLGVBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO0FBQzlDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0FBQ2pDLG1CQUFpQixFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDO0FBQzNELGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQztBQUM3QyxzQkFBb0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0FBQzVDLHNCQUFvQixFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0FBQ25ELGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxTQUFTLENBQUM7RUFDeEQiLCJmaWxlIjoiZGVmYXVsdEJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRnbG9iYWw6IFtcblx0XHQvLyBTdGFuZGFyZCBnbG9iYWxzXG5cdFx0J0FycmF5Jyxcblx0XHQnQm9vbGVhbicsXG5cdFx0J2NvbnNvbGUnLFxuXHRcdCdEYXRlJyxcblx0XHQnRXJyb3InLFxuXHRcdCdGdW5jdGlvbicsXG5cdFx0J0ludGwnLFxuXHRcdCdKU09OJyxcblx0XHQnUHJvbWlzZScsXG5cdFx0J1Byb3h5Jyxcblx0XHQnTWF0aCcsXG5cdFx0J051bWJlcicsXG5cdFx0J09iamVjdCcsXG5cdFx0J1JlZmxlY3QnLFxuXHRcdCdSZWdFeHAnLFxuXHRcdCdTSU1EJyxcblx0XHQnU3RyaW5nJyxcblx0XHQnU3ltYm9sJyxcblxuXHRcdC8vIEVycm9yc1xuXHRcdCdFdmFsRXJyb3InLFxuXHRcdCdJbnRlcm5hbEVycm9yJyxcblx0XHQnUmFuZ2VFcnJvcicsXG5cdFx0J1JlZmVyZW5jZUVycm9yJyxcblx0XHQnU3ludGF4RXJyb3InLFxuXHRcdCdUeXBlRXJyb3InLFxuXHRcdCdVUklFcnJvcicsXG5cblx0XHQvLyBBcnJheUJ1ZmZlciBhbmQgdmlld3Ncblx0XHQnQXJyYXlCdWZmZXInLFxuXHRcdCdEYXRhVmlldycsXG5cdFx0J0Zsb2F0MzJBcnJheScsXG5cdFx0J0Zsb2F0NjRBcnJheScsXG5cdFx0J0ludDE2QXJyYXknLFxuXHRcdCdJbnQzMkFycmF5Jyxcblx0XHQnSW50OEFycmF5Jyxcblx0XHQnVWludDE2QXJyYXknLFxuXHRcdCdVaW50MzJBcnJheScsXG5cdFx0J1VpbnQ4QXJyYXknLFxuXHRcdCdVaW50OENsYW1wZWRBcnJheScsXG5cblx0XHQvLyBVUkkgZnVuY3Rpb25zXG5cdFx0J2RlY29kZVVSSScsXG5cdFx0J2RlY29kZVVSSUNvbXBvbmVudCcsXG5cdFx0J2VuY29kZVVSSScsXG5cdFx0J2VuY29kZVVSSUNvbXBvbmVudCdcblxuXHRcdC8vIE1pc3NpbmcgZ2xvYmFsczpcblx0XHQvLyBldmFsOiBXYW50IHRvIGRpc2NvdXJhZ2UgdXNlXG5cdFx0Ly8gaXNGaW5pdGUsIGlzTmFOLCBwYXJzZUZsb2F0LCBwYXJzZUludDogdXNlIE51bWJlci54eHggZnVuY3Rpb25zXG5cdFx0Ly8gTWFwLCBTZXQ6IGhhdmUgZGlmZmVyZW50IG1lYW5pbmdzIGZvciBtc2wuIFVzZSBJZC1NYXAgYW5kIElkLVNldCBmb3IgbmF0aXZlIHZlcnNpb25zLlxuXHRcdC8vIFdlYWtNYXAsIFdlYWtTZXQ6IHVzZSBXZWFrLUlkLU1hcCBhbmQgV2Vhay1JZC1TZXRcblx0XSxcblx0J21zbC5ALj8nOiBbXG5cdFx0J18nLFxuXHRcdCc/Tm9uZScsXG5cdFx0J09wdC0+PycsXG5cdFx0Jz8tPk9wdCcsXG5cdFx0Jz8tb3InLFxuXHRcdCc/LWNvbmQnLFxuXHRcdCc/c29tZScsXG5cdFx0J3VuLT8nXG5cdF0sXG5cdCdtc2wuQC5AJzogW1xuXHRcdCdfJyxcblx0XHQnKysnLFxuXHRcdCcrK34nLFxuXHRcdCcrIScsXG5cdFx0JysrIScsXG5cdFx0Jy0tJyxcblx0XHQnLS1+Jyxcblx0XHQnLSEnLFxuXHRcdCctLSEnLFxuXHRcdCdhbGw/Jyxcblx0XHQnYW55PycsXG5cdFx0J2NvdW50Jyxcblx0XHQnZWFjaCEnLFxuXHRcdCdlbXB0eT8nLFxuXHRcdCdlbXB0eSEnLFxuXHRcdCc/ZmluZCcsXG5cdFx0J2ZvbGQnLFxuXHRcdCdAZmxhdC1tYXAnLFxuXHRcdCdAZmxhdC1tYXB+Jyxcblx0XHQnQGZsYXR0ZW4nLFxuXHRcdCdAZmxhdHRlbn4nLFxuXHRcdCdpdGVyYXRvcicsXG5cdFx0J0BrZWVwJyxcblx0XHQnQGtlZXB+Jyxcblx0XHQnQHRvc3MnLFxuXHRcdCdAdG9zc34nLFxuXHRcdCdAbWFwJyxcblx0XHQnQG1hcH4nXG5cdF0sXG5cdCdtc2wuQC5ALVR5cGUnOiBbJ2VtcHR5J10sXG5cdCdtc2wuQC5NYXAuSWQtTWFwJzogWydfJ10sXG5cdCdtc2wuQC5NYXAuSGFzaC1NYXAnOiBbJ18nXSxcblx0J21zbC5ALk1hcC5NYXAnOiBbXG5cdFx0J18nLFxuXHRcdCc/Z2V0Jyxcblx0XHQnQGtleXMnLFxuXHRcdCdtYWtlLW1hcCcsXG5cdFx0J21hcD0/Jyxcblx0XHQnQHZhbHVlcydcblx0XSxcblx0J21zbC5ALlJhbmdlJzogWydfJ10sXG5cdCdtc2wuQC5TZXEuU2VxJzogW1xuXHRcdCdfJyxcblx0XHQnKz4hJyxcblx0XHQnQGRyb3AnLFxuXHRcdCdAZHJvcH4nLFxuXHRcdCdAZHJvcC13aGlsZScsXG5cdFx0J0Bkcm9wLXdoaWxlficsXG5cdFx0J2ZpcnN0Jyxcblx0XHQnP2ZpcnN0Jyxcblx0XHQnQGluZGV4ZXMnLFxuXHRcdCdsYXN0Jyxcblx0XHQnP2xhc3QnLFxuXHRcdCc/bnRoJyxcblx0XHQnQHJldmVyc2UnLFxuXHRcdCdAcmV2ZXJzZX4nLFxuXHRcdCdAcnRhaWwnLFxuXHRcdCdAc2xpY2UnLFxuXHRcdCdAc2xpY2V+Jyxcblx0XHQnQHNwbGl0Jyxcblx0XHQnQHNwbGl0ficsXG5cdFx0J3NlcT0/Jyxcblx0XHQnQHRhaWwnLFxuXHRcdCdAdGFrZScsXG5cdFx0J0B0YWtlficsXG5cdFx0J0B0YWtlLXdoaWxlJyxcblx0XHQnQHRha2Utd2hpbGV+Jyxcblx0XHQnQHppcCcsXG5cdFx0J0B6aXB+J1xuXHRdLFxuXHQnbXNsLkAuU2VxLlN0cmVhbSc6IFsnXyddLFxuXHQnbXNsLkAuU2V0LklkLVNldCc6IFsnXyddLFxuXHQnbXNsLkAuU2V0LlNldCc6IFsnXycsICdzZXQ9PyddLFxuXHQnbXNsLmNvbXBhcmUnOiBbXG5cdFx0Jz0/Jyxcblx0XHQnPD8nLFxuXHRcdCc8PT8nLFxuXHRcdCc+PycsXG5cdFx0Jz49PycsXG5cdFx0Jz9taW4nLFxuXHRcdCdtaW4nLFxuXHRcdCc/bWluLWJ5Jyxcblx0XHQnbWluLWJ5Jyxcblx0XHQnP21heCcsXG5cdFx0J21heCcsXG5cdFx0Jz9tYXgtYnknLFxuXHRcdCdtYXgtYnknLFxuXHRcdCdzYW1lPydcblx0XSxcblx0J21zbC5GdW5jdGlvbic6IFsnQWN0aW9uJywgJ2lkZW50aXR5J10sXG5cdCdtc2wuanMnOiBbXG5cdFx0J2RlZmluZWQ/Jyxcblx0XHQnZXhpc3RzPycsXG5cdFx0J2lkPT8nLFxuXHRcdCdudWxsPydcblx0XSxcblx0J21zbC5tYXRoLm1ldGhvZHMnOiBbJysnLCAnLScsICcqJywgJy8nXSxcblx0J21zbC5tYXRoLk51bWJlcic6IFtcblx0XHQnZGl2aXNpYmxlPycsXG5cdFx0J0ludCcsXG5cdFx0J2ludC8nLFxuXHRcdCdsb2ctYmFzZScsXG5cdFx0J21vZHVsbycsXG5cdFx0J25lYXJlc3QtY2VpbCcsXG5cdFx0J25lYXJlc3QtZmxvb3InLFxuXHRcdCduZWFyZXN0LXJvdW5kJyxcblx0XHQnTmF0Jyxcblx0XHQncmVtYWluZGVyJyxcblx0XHQnc3F1YXJlJ1xuXHRdLFxuXHQnbXNsLm1hdGgudXRpbCc6IFsnYXZlcmFnZScsICdzdW0nXSxcblx0J21zbC5tZXRob2RzJzogWydzdWInLCAnc2V0LXN1YiEnLCAnZGVsLXN1YiEnXSxcblx0J21zbC50by1zdHJpbmcnOiBbJ18nLCAnaW5zcGVjdCddLFxuXHQnbXNsLlR5cGUuTWV0aG9kJzogWydfJywgJ2ltcGwhJywgJ2ltcGwtZm9yJywgJ3NlbGYtaW1wbCEnXSxcblx0J21zbC5UeXBlLktpbmQnOiBbJ18nLCAna2luZCEnLCAnc2VsZi1raW5kISddLFxuXHQnbXNsLlR5cGUuUHJlZC1UeXBlJzogWydfJywgJ0FueScsICdPYmpMaXQnXSxcblx0J21zbC5UeXBlLnByaW1pdGl2ZSc6IFsnQm9vbCcsICdOdW0nLCAnU3RyJywgJ1N5bSddLFxuXHQnbXNsLlR5cGUuVHlwZSc6IFsnXycsICc9PicsICdoYXMtaW5zdGFuY2U/JywgJ2V4dHJhY3QnXVxufVxuIl19
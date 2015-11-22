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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWU7QUFDZCxRQUFNLEVBQUU7O0FBRVAsU0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixTQUFTLEVBQ1QsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFROzs7QUFHUixhQUFXLEVBQ1gsZUFBZSxFQUNmLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFdBQVcsRUFDWCxVQUFVOzs7QUFHVixlQUFhLEVBQ2IsVUFBVSxFQUNWLGNBQWMsRUFDZCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEVBQ1gsYUFBYSxFQUNiLGFBQWEsRUFDYixZQUFZLEVBQ1osbUJBQW1COzs7QUFHbkIsYUFBVyxFQUNYLG9CQUFvQixFQUNwQixXQUFXLEVBQ1g7Ozs7Ozs7QUFBb0IsR0FPcEI7QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxDQUNOO0FBQ0QsV0FBUyxFQUFFLENBQ1YsR0FBRyxFQUNILElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixXQUFXLEVBQ1gsWUFBWSxFQUNaLFVBQVUsRUFDVixXQUFXLEVBQ1gsVUFBVSxFQUNWLE9BQU8sRUFDUCxRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELGdCQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDekIsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsc0JBQW9CLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDM0IsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsT0FBTyxFQUNQLFNBQVMsQ0FDVDtBQUNELGVBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNwQixpQkFBZSxFQUFFLENBQ2hCLEdBQUcsRUFDSCxLQUFLLEVBQ0wsT0FBTyxFQUNQLFFBQVEsRUFDUixhQUFhLEVBQ2IsY0FBYyxFQUNkLE9BQU8sRUFDUCxRQUFRLEVBQ1IsVUFBVSxFQUNWLE1BQU0sRUFDTixPQUFPLEVBQ1AsTUFBTSxFQUNOLFVBQVUsRUFDVixXQUFXLEVBQ1gsUUFBUSxFQUNSLFFBQVEsRUFDUixTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxNQUFNLEVBQ04sT0FBTyxDQUNQO0FBQ0Qsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7QUFDL0IsZUFBYSxFQUFFLENBQ2QsSUFBSSxFQUNKLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sS0FBSyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE9BQU8sQ0FDUDtBQUNELGdCQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDO0FBQ3RDLFVBQVEsRUFBRSxDQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxDQUNQO0FBQ0Qsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDeEMsbUJBQWlCLEVBQUUsQ0FDbEIsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLFFBQVEsRUFDUixjQUFjLEVBQ2QsZUFBZSxFQUNmLGVBQWUsRUFDZixLQUFLLEVBQ0wsV0FBVyxFQUNYLFFBQVEsQ0FDUjtBQUNELGlCQUFlLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO0FBQ25DLGVBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO0FBQzlDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0FBQ2pDLG1CQUFpQixFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDO0FBQzNELGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQztBQUM3QyxzQkFBb0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0FBQzVDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUM7RUFDcEQiLCJmaWxlIjoiZGVmYXVsdEJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRnbG9iYWw6IFtcblx0XHQvLyBTdGFuZGFyZCBnbG9iYWxzXG5cdFx0J0FycmF5Jyxcblx0XHQnQm9vbGVhbicsXG5cdFx0J2NvbnNvbGUnLFxuXHRcdCdEYXRlJyxcblx0XHQnRXJyb3InLFxuXHRcdCdGdW5jdGlvbicsXG5cdFx0J0ludGwnLFxuXHRcdCdKU09OJyxcblx0XHQnUHJvbWlzZScsXG5cdFx0J1Byb3h5Jyxcblx0XHQnTWF0aCcsXG5cdFx0J051bWJlcicsXG5cdFx0J09iamVjdCcsXG5cdFx0J1JlZmxlY3QnLFxuXHRcdCdSZWdFeHAnLFxuXHRcdCdTSU1EJyxcblx0XHQnU3RyaW5nJyxcblx0XHQnU3ltYm9sJyxcblxuXHRcdC8vIEVycm9yc1xuXHRcdCdFdmFsRXJyb3InLFxuXHRcdCdJbnRlcm5hbEVycm9yJyxcblx0XHQnUmFuZ2VFcnJvcicsXG5cdFx0J1JlZmVyZW5jZUVycm9yJyxcblx0XHQnU3ludGF4RXJyb3InLFxuXHRcdCdUeXBlRXJyb3InLFxuXHRcdCdVUklFcnJvcicsXG5cblx0XHQvLyBBcnJheUJ1ZmZlciBhbmQgdmlld3Ncblx0XHQnQXJyYXlCdWZmZXInLFxuXHRcdCdEYXRhVmlldycsXG5cdFx0J0Zsb2F0MzJBcnJheScsXG5cdFx0J0Zsb2F0NjRBcnJheScsXG5cdFx0J0ludDE2QXJyYXknLFxuXHRcdCdJbnQzMkFycmF5Jyxcblx0XHQnSW50OEFycmF5Jyxcblx0XHQnVWludDE2QXJyYXknLFxuXHRcdCdVaW50MzJBcnJheScsXG5cdFx0J1VpbnQ4QXJyYXknLFxuXHRcdCdVaW50OENsYW1wZWRBcnJheScsXG5cblx0XHQvLyBVUkkgZnVuY3Rpb25zXG5cdFx0J2RlY29kZVVSSScsXG5cdFx0J2RlY29kZVVSSUNvbXBvbmVudCcsXG5cdFx0J2VuY29kZVVSSScsXG5cdFx0J2VuY29kZVVSSUNvbXBvbmVudCdcblxuXHRcdC8vIE1pc3NpbmcgZ2xvYmFsczpcblx0XHQvLyBldmFsOiBXYW50IHRvIGRpc2NvdXJhZ2UgdXNlXG5cdFx0Ly8gaXNGaW5pdGUsIGlzTmFOLCBwYXJzZUZsb2F0LCBwYXJzZUludDogdXNlIE51bWJlci54eHggZnVuY3Rpb25zXG5cdFx0Ly8gTWFwLCBTZXQ6IGhhdmUgZGlmZmVyZW50IG1lYW5pbmdzIGZvciBtc2wuIFVzZSBJZC1NYXAgYW5kIElkLVNldCBmb3IgbmF0aXZlIHZlcnNpb25zLlxuXHRcdC8vIFdlYWtNYXAsIFdlYWtTZXQ6IHVzZSBXZWFrLUlkLU1hcCBhbmQgV2Vhay1JZC1TZXRcblx0XSxcblx0J21zbC5ALj8nOiBbXG5cdFx0J18nLFxuXHRcdCc/Tm9uZScsXG5cdFx0J09wdC0+PycsXG5cdFx0Jz8tPk9wdCcsXG5cdFx0Jz8tb3InLFxuXHRcdCc/LWNvbmQnLFxuXHRcdCc/c29tZScsXG5cdFx0J3VuLT8nXG5cdF0sXG5cdCdtc2wuQC5AJzogW1xuXHRcdCdfJyxcblx0XHQnKysnLFxuXHRcdCcrK34nLFxuXHRcdCcrIScsXG5cdFx0JysrIScsXG5cdFx0Jy0tJyxcblx0XHQnLS1+Jyxcblx0XHQnLSEnLFxuXHRcdCctLSEnLFxuXHRcdCdhbGw/Jyxcblx0XHQnYW55PycsXG5cdFx0J2NvdW50Jyxcblx0XHQnZWFjaCEnLFxuXHRcdCdlbXB0eT8nLFxuXHRcdCdlbXB0eSEnLFxuXHRcdCc/ZmluZCcsXG5cdFx0J2ZvbGQnLFxuXHRcdCdAZmxhdC1tYXAnLFxuXHRcdCdAZmxhdC1tYXB+Jyxcblx0XHQnQGZsYXR0ZW4nLFxuXHRcdCdAZmxhdHRlbn4nLFxuXHRcdCdpdGVyYXRvcicsXG5cdFx0J0BrZWVwJyxcblx0XHQnQGtlZXB+Jyxcblx0XHQnQG1hcCcsXG5cdFx0J0BtYXB+J1xuXHRdLFxuXHQnbXNsLkAuQC1UeXBlJzogWydlbXB0eSddLFxuXHQnbXNsLkAuTWFwLklkLU1hcCc6IFsnXyddLFxuXHQnbXNsLkAuTWFwLkhhc2gtTWFwJzogWydfJ10sXG5cdCdtc2wuQC5NYXAuTWFwJzogW1xuXHRcdCdfJyxcblx0XHQnP2dldCcsXG5cdFx0J0BrZXlzJyxcblx0XHQnbWFrZS1tYXAnLFxuXHRcdCdtYXA9PycsXG5cdFx0J0B2YWx1ZXMnXG5cdF0sXG5cdCdtc2wuQC5SYW5nZSc6IFsnXyddLFxuXHQnbXNsLkAuU2VxLlNlcSc6IFtcblx0XHQnXycsXG5cdFx0Jys+IScsXG5cdFx0J0Bkcm9wJyxcblx0XHQnQGRyb3B+Jyxcblx0XHQnQGRyb3Atd2hpbGUnLFxuXHRcdCdAZHJvcC13aGlsZX4nLFxuXHRcdCdmaXJzdCcsXG5cdFx0Jz9maXJzdCcsXG5cdFx0J0BpbmRleGVzJyxcblx0XHQnbGFzdCcsXG5cdFx0Jz9sYXN0Jyxcblx0XHQnP250aCcsXG5cdFx0J0ByZXZlcnNlJyxcblx0XHQnQHJldmVyc2V+Jyxcblx0XHQnQHJ0YWlsJyxcblx0XHQnQHNsaWNlJyxcblx0XHQnQHNsaWNlficsXG5cdFx0J0BzcGxpdCcsXG5cdFx0J0BzcGxpdH4nLFxuXHRcdCdzZXE9PycsXG5cdFx0J0B0YWlsJyxcblx0XHQnQHRha2UnLFxuXHRcdCdAdGFrZX4nLFxuXHRcdCdAdGFrZS13aGlsZScsXG5cdFx0J0B0YWtlLXdoaWxlficsXG5cdFx0J0B6aXAnLFxuXHRcdCdAemlwfidcblx0XSxcblx0J21zbC5ALlNlcS5TdHJlYW0nOiBbJ18nXSxcblx0J21zbC5ALlNldC5JZC1TZXQnOiBbJ18nXSxcblx0J21zbC5ALlNldC5TZXQnOiBbJ18nLCAnc2V0PT8nXSxcblx0J21zbC5jb21wYXJlJzogW1xuXHRcdCc9PycsXG5cdFx0Jzw/Jyxcblx0XHQnPD0/Jyxcblx0XHQnPj8nLFxuXHRcdCc+PT8nLFxuXHRcdCc/bWluJyxcblx0XHQnbWluJyxcblx0XHQnP21pbi1ieScsXG5cdFx0J21pbi1ieScsXG5cdFx0Jz9tYXgnLFxuXHRcdCdtYXgnLFxuXHRcdCc/bWF4LWJ5Jyxcblx0XHQnbWF4LWJ5Jyxcblx0XHQnc2FtZT8nXG5cdF0sXG5cdCdtc2wuRnVuY3Rpb24nOiBbJ0FjdGlvbicsICdpZGVudGl0eSddLFxuXHQnbXNsLmpzJzogW1xuXHRcdCdkZWZpbmVkPycsXG5cdFx0J2lkPT8nLFxuXHRcdCdudWxsPydcblx0XSxcblx0J21zbC5tYXRoLm1ldGhvZHMnOiBbJysnLCAnLScsICcqJywgJy8nXSxcblx0J21zbC5tYXRoLk51bWJlcic6IFtcblx0XHQnZGl2aXNpYmxlPycsXG5cdFx0J0ludCcsXG5cdFx0J2ludC8nLFxuXHRcdCdsb2ctYmFzZScsXG5cdFx0J21vZHVsbycsXG5cdFx0J25lYXJlc3QtY2VpbCcsXG5cdFx0J25lYXJlc3QtZmxvb3InLFxuXHRcdCduZWFyZXN0LXJvdW5kJyxcblx0XHQnTmF0Jyxcblx0XHQncmVtYWluZGVyJyxcblx0XHQnc3F1YXJlJ1xuXHRdLFxuXHQnbXNsLm1hdGgudXRpbCc6IFsnYXZlcmFnZScsICdzdW0nXSxcblx0J21zbC5tZXRob2RzJzogWydzdWInLCAnc2V0LXN1YiEnLCAnZGVsLXN1YiEnXSxcblx0J21zbC50by1zdHJpbmcnOiBbJ18nLCAnaW5zcGVjdCddLFxuXHQnbXNsLlR5cGUuTWV0aG9kJzogWydfJywgJ2ltcGwhJywgJ2ltcGwtZm9yJywgJ3NlbGYtaW1wbCEnXSxcblx0J21zbC5UeXBlLktpbmQnOiBbJ18nLCAna2luZCEnLCAnc2VsZi1raW5kISddLFxuXHQnbXNsLlR5cGUuUHJlZC1UeXBlJzogWydfJywgJ0FueScsICdPYmpMaXQnXSxcblx0J21zbC5UeXBlLlR5cGUnOiBbJ18nLCAnPT4nLCAnY29udGFpbnM/JywgJ2V4dHJhY3QnXVxufVxuIl19
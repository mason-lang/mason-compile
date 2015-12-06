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
		'msl.Type.Type': ['_', '=>', 'contains?', 'extract']
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWU7QUFDZCxRQUFNLEVBQUU7O0FBRVAsU0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixTQUFTLEVBQ1QsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFROzs7QUFHUixhQUFXLEVBQ1gsZUFBZSxFQUNmLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFdBQVcsRUFDWCxVQUFVOzs7QUFHVixlQUFhLEVBQ2IsVUFBVSxFQUNWLGNBQWMsRUFDZCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEVBQ1gsYUFBYSxFQUNiLGFBQWEsRUFDYixZQUFZLEVBQ1osbUJBQW1COzs7QUFHbkIsYUFBVyxFQUNYLG9CQUFvQixFQUNwQixXQUFXLEVBQ1g7Ozs7Ozs7QUFBb0IsR0FPcEI7QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxDQUNOO0FBQ0QsV0FBUyxFQUFFLENBQ1YsR0FBRyxFQUNILElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixXQUFXLEVBQ1gsWUFBWSxFQUNaLFVBQVUsRUFDVixXQUFXLEVBQ1gsVUFBVSxFQUNWLE9BQU8sRUFDUCxRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELGdCQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDekIsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsc0JBQW9CLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDM0IsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsT0FBTyxFQUNQLFNBQVMsQ0FDVDtBQUNELGVBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNwQixpQkFBZSxFQUFFLENBQ2hCLEdBQUcsRUFDSCxLQUFLLEVBQ0wsT0FBTyxFQUNQLFFBQVEsRUFDUixhQUFhLEVBQ2IsY0FBYyxFQUNkLE9BQU8sRUFDUCxRQUFRLEVBQ1IsVUFBVSxFQUNWLE1BQU0sRUFDTixPQUFPLEVBQ1AsTUFBTSxFQUNOLFVBQVUsRUFDVixXQUFXLEVBQ1gsUUFBUSxFQUNSLFFBQVEsRUFDUixTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxNQUFNLEVBQ04sT0FBTyxDQUNQO0FBQ0Qsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7QUFDL0IsZUFBYSxFQUFFLENBQ2QsSUFBSSxFQUNKLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sS0FBSyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE9BQU8sQ0FDUDtBQUNELGdCQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDO0FBQ3RDLFVBQVEsRUFBRSxDQUNULFVBQVUsRUFDVixTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3hDLG1CQUFpQixFQUFFLENBQ2xCLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFVBQVUsRUFDVixRQUFRLEVBQ1IsY0FBYyxFQUNkLGVBQWUsRUFDZixlQUFlLEVBQ2YsS0FBSyxFQUNMLFdBQVcsRUFDWCxRQUFRLENBQ1I7QUFDRCxpQkFBZSxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQztBQUNuQyxlQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQztBQUM5QyxpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztBQUNqQyxtQkFBaUIsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQztBQUMzRCxpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUM7QUFDN0Msc0JBQW9CLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUM1QyxzQkFBb0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztBQUNuRCxpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDO0VBQ3BEIiwiZmlsZSI6ImRlZmF1bHRCdWlsdGlucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcblx0Z2xvYmFsOiBbXG5cdFx0Ly8gU3RhbmRhcmQgZ2xvYmFsc1xuXHRcdCdBcnJheScsXG5cdFx0J0Jvb2xlYW4nLFxuXHRcdCdjb25zb2xlJyxcblx0XHQnRGF0ZScsXG5cdFx0J0Vycm9yJyxcblx0XHQnRnVuY3Rpb24nLFxuXHRcdCdJbnRsJyxcblx0XHQnSlNPTicsXG5cdFx0J1Byb21pc2UnLFxuXHRcdCdQcm94eScsXG5cdFx0J01hdGgnLFxuXHRcdCdOdW1iZXInLFxuXHRcdCdPYmplY3QnLFxuXHRcdCdSZWZsZWN0Jyxcblx0XHQnUmVnRXhwJyxcblx0XHQnU0lNRCcsXG5cdFx0J1N0cmluZycsXG5cdFx0J1N5bWJvbCcsXG5cblx0XHQvLyBFcnJvcnNcblx0XHQnRXZhbEVycm9yJyxcblx0XHQnSW50ZXJuYWxFcnJvcicsXG5cdFx0J1JhbmdlRXJyb3InLFxuXHRcdCdSZWZlcmVuY2VFcnJvcicsXG5cdFx0J1N5bnRheEVycm9yJyxcblx0XHQnVHlwZUVycm9yJyxcblx0XHQnVVJJRXJyb3InLFxuXG5cdFx0Ly8gQXJyYXlCdWZmZXIgYW5kIHZpZXdzXG5cdFx0J0FycmF5QnVmZmVyJyxcblx0XHQnRGF0YVZpZXcnLFxuXHRcdCdGbG9hdDMyQXJyYXknLFxuXHRcdCdGbG9hdDY0QXJyYXknLFxuXHRcdCdJbnQxNkFycmF5Jyxcblx0XHQnSW50MzJBcnJheScsXG5cdFx0J0ludDhBcnJheScsXG5cdFx0J1VpbnQxNkFycmF5Jyxcblx0XHQnVWludDMyQXJyYXknLFxuXHRcdCdVaW50OEFycmF5Jyxcblx0XHQnVWludDhDbGFtcGVkQXJyYXknLFxuXG5cdFx0Ly8gVVJJIGZ1bmN0aW9uc1xuXHRcdCdkZWNvZGVVUkknLFxuXHRcdCdkZWNvZGVVUklDb21wb25lbnQnLFxuXHRcdCdlbmNvZGVVUkknLFxuXHRcdCdlbmNvZGVVUklDb21wb25lbnQnXG5cblx0XHQvLyBNaXNzaW5nIGdsb2JhbHM6XG5cdFx0Ly8gZXZhbDogV2FudCB0byBkaXNjb3VyYWdlIHVzZVxuXHRcdC8vIGlzRmluaXRlLCBpc05hTiwgcGFyc2VGbG9hdCwgcGFyc2VJbnQ6IHVzZSBOdW1iZXIueHh4IGZ1bmN0aW9uc1xuXHRcdC8vIE1hcCwgU2V0OiBoYXZlIGRpZmZlcmVudCBtZWFuaW5ncyBmb3IgbXNsLiBVc2UgSWQtTWFwIGFuZCBJZC1TZXQgZm9yIG5hdGl2ZSB2ZXJzaW9ucy5cblx0XHQvLyBXZWFrTWFwLCBXZWFrU2V0OiB1c2UgV2Vhay1JZC1NYXAgYW5kIFdlYWstSWQtU2V0XG5cdF0sXG5cdCdtc2wuQC4/JzogW1xuXHRcdCdfJyxcblx0XHQnP05vbmUnLFxuXHRcdCdPcHQtPj8nLFxuXHRcdCc/LT5PcHQnLFxuXHRcdCc/LW9yJyxcblx0XHQnPy1jb25kJyxcblx0XHQnP3NvbWUnLFxuXHRcdCd1bi0/J1xuXHRdLFxuXHQnbXNsLkAuQCc6IFtcblx0XHQnXycsXG5cdFx0JysrJyxcblx0XHQnKyt+Jyxcblx0XHQnKyEnLFxuXHRcdCcrKyEnLFxuXHRcdCctLScsXG5cdFx0Jy0tficsXG5cdFx0Jy0hJyxcblx0XHQnLS0hJyxcblx0XHQnYWxsPycsXG5cdFx0J2FueT8nLFxuXHRcdCdjb3VudCcsXG5cdFx0J2VhY2ghJyxcblx0XHQnZW1wdHk/Jyxcblx0XHQnZW1wdHkhJyxcblx0XHQnP2ZpbmQnLFxuXHRcdCdmb2xkJyxcblx0XHQnQGZsYXQtbWFwJyxcblx0XHQnQGZsYXQtbWFwficsXG5cdFx0J0BmbGF0dGVuJyxcblx0XHQnQGZsYXR0ZW5+Jyxcblx0XHQnaXRlcmF0b3InLFxuXHRcdCdAa2VlcCcsXG5cdFx0J0BrZWVwficsXG5cdFx0J0BtYXAnLFxuXHRcdCdAbWFwfidcblx0XSxcblx0J21zbC5ALkAtVHlwZSc6IFsnZW1wdHknXSxcblx0J21zbC5ALk1hcC5JZC1NYXAnOiBbJ18nXSxcblx0J21zbC5ALk1hcC5IYXNoLU1hcCc6IFsnXyddLFxuXHQnbXNsLkAuTWFwLk1hcCc6IFtcblx0XHQnXycsXG5cdFx0Jz9nZXQnLFxuXHRcdCdAa2V5cycsXG5cdFx0J21ha2UtbWFwJyxcblx0XHQnbWFwPT8nLFxuXHRcdCdAdmFsdWVzJ1xuXHRdLFxuXHQnbXNsLkAuUmFuZ2UnOiBbJ18nXSxcblx0J21zbC5ALlNlcS5TZXEnOiBbXG5cdFx0J18nLFxuXHRcdCcrPiEnLFxuXHRcdCdAZHJvcCcsXG5cdFx0J0Bkcm9wficsXG5cdFx0J0Bkcm9wLXdoaWxlJyxcblx0XHQnQGRyb3Atd2hpbGV+Jyxcblx0XHQnZmlyc3QnLFxuXHRcdCc/Zmlyc3QnLFxuXHRcdCdAaW5kZXhlcycsXG5cdFx0J2xhc3QnLFxuXHRcdCc/bGFzdCcsXG5cdFx0Jz9udGgnLFxuXHRcdCdAcmV2ZXJzZScsXG5cdFx0J0ByZXZlcnNlficsXG5cdFx0J0BydGFpbCcsXG5cdFx0J0BzbGljZScsXG5cdFx0J0BzbGljZX4nLFxuXHRcdCdAc3BsaXQnLFxuXHRcdCdAc3BsaXR+Jyxcblx0XHQnc2VxPT8nLFxuXHRcdCdAdGFpbCcsXG5cdFx0J0B0YWtlJyxcblx0XHQnQHRha2V+Jyxcblx0XHQnQHRha2Utd2hpbGUnLFxuXHRcdCdAdGFrZS13aGlsZX4nLFxuXHRcdCdAemlwJyxcblx0XHQnQHppcH4nXG5cdF0sXG5cdCdtc2wuQC5TZXEuU3RyZWFtJzogWydfJ10sXG5cdCdtc2wuQC5TZXQuSWQtU2V0JzogWydfJ10sXG5cdCdtc2wuQC5TZXQuU2V0JzogWydfJywgJ3NldD0/J10sXG5cdCdtc2wuY29tcGFyZSc6IFtcblx0XHQnPT8nLFxuXHRcdCc8PycsXG5cdFx0Jzw9PycsXG5cdFx0Jz4/Jyxcblx0XHQnPj0/Jyxcblx0XHQnP21pbicsXG5cdFx0J21pbicsXG5cdFx0Jz9taW4tYnknLFxuXHRcdCdtaW4tYnknLFxuXHRcdCc/bWF4Jyxcblx0XHQnbWF4Jyxcblx0XHQnP21heC1ieScsXG5cdFx0J21heC1ieScsXG5cdFx0J3NhbWU/J1xuXHRdLFxuXHQnbXNsLkZ1bmN0aW9uJzogWydBY3Rpb24nLCAnaWRlbnRpdHknXSxcblx0J21zbC5qcyc6IFtcblx0XHQnZGVmaW5lZD8nLFxuXHRcdCdleGlzdHM/Jyxcblx0XHQnaWQ9PycsXG5cdFx0J251bGw/J1xuXHRdLFxuXHQnbXNsLm1hdGgubWV0aG9kcyc6IFsnKycsICctJywgJyonLCAnLyddLFxuXHQnbXNsLm1hdGguTnVtYmVyJzogW1xuXHRcdCdkaXZpc2libGU/Jyxcblx0XHQnSW50Jyxcblx0XHQnaW50LycsXG5cdFx0J2xvZy1iYXNlJyxcblx0XHQnbW9kdWxvJyxcblx0XHQnbmVhcmVzdC1jZWlsJyxcblx0XHQnbmVhcmVzdC1mbG9vcicsXG5cdFx0J25lYXJlc3Qtcm91bmQnLFxuXHRcdCdOYXQnLFxuXHRcdCdyZW1haW5kZXInLFxuXHRcdCdzcXVhcmUnXG5cdF0sXG5cdCdtc2wubWF0aC51dGlsJzogWydhdmVyYWdlJywgJ3N1bSddLFxuXHQnbXNsLm1ldGhvZHMnOiBbJ3N1YicsICdzZXQtc3ViIScsICdkZWwtc3ViISddLFxuXHQnbXNsLnRvLXN0cmluZyc6IFsnXycsICdpbnNwZWN0J10sXG5cdCdtc2wuVHlwZS5NZXRob2QnOiBbJ18nLCAnaW1wbCEnLCAnaW1wbC1mb3InLCAnc2VsZi1pbXBsISddLFxuXHQnbXNsLlR5cGUuS2luZCc6IFsnXycsICdraW5kIScsICdzZWxmLWtpbmQhJ10sXG5cdCdtc2wuVHlwZS5QcmVkLVR5cGUnOiBbJ18nLCAnQW55JywgJ09iakxpdCddLFxuXHQnbXNsLlR5cGUucHJpbWl0aXZlJzogWydCb29sJywgJ051bScsICdTdHInLCAnU3ltJ10sXG5cdCdtc2wuVHlwZS5UeXBlJzogWydfJywgJz0+JywgJ2NvbnRhaW5zPycsICdleHRyYWN0J11cbn1cbiJdfQ==
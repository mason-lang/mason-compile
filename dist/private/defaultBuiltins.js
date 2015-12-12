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
		'msl.Type.Kind': ['_', 'kind!', 'self-kind!'],
		'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
		'msl.Type.primitive': ['Bool', 'Num', 'Str', 'Sym'],
		'msl.Type.Type': ['_', '=>', 'has-instance?', 'extract']
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWU7QUFDZCxRQUFNLEVBQUU7O0FBRVAsU0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixTQUFTLEVBQ1QsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFROzs7QUFHUixhQUFXLEVBQ1gsZUFBZSxFQUNmLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFdBQVcsRUFDWCxVQUFVOzs7QUFHVixlQUFhLEVBQ2IsVUFBVSxFQUNWLGNBQWMsRUFDZCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFlBQVksRUFDWixXQUFXLEVBQ1gsYUFBYSxFQUNiLGFBQWEsRUFDYixZQUFZLEVBQ1osbUJBQW1COzs7QUFHbkIsYUFBVyxFQUNYLG9CQUFvQixFQUNwQixXQUFXLEVBQ1g7Ozs7Ozs7QUFBb0IsR0FPcEI7QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixPQUFPLEVBQ1AsTUFBTSxDQUNOO0FBQ0QsV0FBUyxFQUFFLENBQ1YsR0FBRyxFQUNILElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFVBQVUsRUFDVixPQUFPLEVBQ1AsUUFBUSxFQUNSLE9BQU8sRUFDUCxRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLHNCQUFvQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzNCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILE1BQU0sRUFDTixPQUFPLEVBQ1AsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLENBQ1Q7QUFDRCxlQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsS0FBSyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixTQUFTLEVBQ1QsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO0FBQy9CLGVBQWEsRUFBRSxDQUNkLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQztBQUN0QyxVQUFRLEVBQUUsQ0FDVCxVQUFVLEVBQ1YsU0FBUyxFQUNULE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxvQkFBa0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUN4QyxtQkFBaUIsRUFBRSxDQUNsQixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixVQUFVLEVBQ1YsUUFBUSxFQUNSLGNBQWMsRUFDZCxlQUFlLEVBQ2YsZUFBZSxFQUNmLEtBQUssRUFDTCxXQUFXLEVBQ1gsUUFBUSxDQUNSO0FBQ0QsaUJBQWUsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7QUFDbkMsZUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUM7QUFDOUMsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUM7QUFDakMsbUJBQWlCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUM7QUFDM0QsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDO0FBQzdDLHNCQUFvQixFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7QUFDNUMsc0JBQW9CLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7QUFDbkQsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLFNBQVMsQ0FBQztFQUN4RCIsImZpbGUiOiJkZWZhdWx0QnVpbHRpbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG5cdGdsb2JhbDogW1xuXHRcdC8vIFN0YW5kYXJkIGdsb2JhbHNcblx0XHQnQXJyYXknLFxuXHRcdCdCb29sZWFuJyxcblx0XHQnY29uc29sZScsXG5cdFx0J0RhdGUnLFxuXHRcdCdFcnJvcicsXG5cdFx0J0Z1bmN0aW9uJyxcblx0XHQnSW50bCcsXG5cdFx0J0pTT04nLFxuXHRcdCdQcm9taXNlJyxcblx0XHQnUHJveHknLFxuXHRcdCdNYXRoJyxcblx0XHQnTnVtYmVyJyxcblx0XHQnT2JqZWN0Jyxcblx0XHQnUmVmbGVjdCcsXG5cdFx0J1JlZ0V4cCcsXG5cdFx0J1NJTUQnLFxuXHRcdCdTdHJpbmcnLFxuXHRcdCdTeW1ib2wnLFxuXG5cdFx0Ly8gRXJyb3JzXG5cdFx0J0V2YWxFcnJvcicsXG5cdFx0J0ludGVybmFsRXJyb3InLFxuXHRcdCdSYW5nZUVycm9yJyxcblx0XHQnUmVmZXJlbmNlRXJyb3InLFxuXHRcdCdTeW50YXhFcnJvcicsXG5cdFx0J1R5cGVFcnJvcicsXG5cdFx0J1VSSUVycm9yJyxcblxuXHRcdC8vIEFycmF5QnVmZmVyIGFuZCB2aWV3c1xuXHRcdCdBcnJheUJ1ZmZlcicsXG5cdFx0J0RhdGFWaWV3Jyxcblx0XHQnRmxvYXQzMkFycmF5Jyxcblx0XHQnRmxvYXQ2NEFycmF5Jyxcblx0XHQnSW50MTZBcnJheScsXG5cdFx0J0ludDMyQXJyYXknLFxuXHRcdCdJbnQ4QXJyYXknLFxuXHRcdCdVaW50MTZBcnJheScsXG5cdFx0J1VpbnQzMkFycmF5Jyxcblx0XHQnVWludDhBcnJheScsXG5cdFx0J1VpbnQ4Q2xhbXBlZEFycmF5JyxcblxuXHRcdC8vIFVSSSBmdW5jdGlvbnNcblx0XHQnZGVjb2RlVVJJJyxcblx0XHQnZGVjb2RlVVJJQ29tcG9uZW50Jyxcblx0XHQnZW5jb2RlVVJJJyxcblx0XHQnZW5jb2RlVVJJQ29tcG9uZW50J1xuXG5cdFx0Ly8gTWlzc2luZyBnbG9iYWxzOlxuXHRcdC8vIGV2YWw6IFdhbnQgdG8gZGlzY291cmFnZSB1c2Vcblx0XHQvLyBpc0Zpbml0ZSwgaXNOYU4sIHBhcnNlRmxvYXQsIHBhcnNlSW50OiB1c2UgTnVtYmVyLnh4eCBmdW5jdGlvbnNcblx0XHQvLyBNYXAsIFNldDogaGF2ZSBkaWZmZXJlbnQgbWVhbmluZ3MgZm9yIG1zbC4gVXNlIElkLU1hcCBhbmQgSWQtU2V0IGZvciBuYXRpdmUgdmVyc2lvbnMuXG5cdFx0Ly8gV2Vha01hcCwgV2Vha1NldDogdXNlIFdlYWstSWQtTWFwIGFuZCBXZWFrLUlkLVNldFxuXHRdLFxuXHQnbXNsLkAuPyc6IFtcblx0XHQnXycsXG5cdFx0Jz9Ob25lJyxcblx0XHQnT3B0LT4/Jyxcblx0XHQnPy0+T3B0Jyxcblx0XHQnPy1vcicsXG5cdFx0Jz8tY29uZCcsXG5cdFx0Jz9zb21lJyxcblx0XHQndW4tPydcblx0XSxcblx0J21zbC5ALkAnOiBbXG5cdFx0J18nLFxuXHRcdCcrKycsXG5cdFx0JysrficsXG5cdFx0JyshJyxcblx0XHQnKyshJyxcblx0XHQnLS0nLFxuXHRcdCctLX4nLFxuXHRcdCctIScsXG5cdFx0Jy0tIScsXG5cdFx0J2FsbD8nLFxuXHRcdCdhbnk/Jyxcblx0XHQnY291bnQnLFxuXHRcdCdlYWNoIScsXG5cdFx0J2VtcHR5Jyxcblx0XHQnZW1wdHkhJyxcblx0XHQnZW1wdHk/Jyxcblx0XHQnP2ZpbmQnLFxuXHRcdCdmb2xkJyxcblx0XHQnQGZsYXQtbWFwJyxcblx0XHQnQGZsYXQtbWFwficsXG5cdFx0J0BmbGF0dGVuJyxcblx0XHQnQGZsYXR0ZW5+Jyxcblx0XHQnaXRlcmF0b3InLFxuXHRcdCdAa2VlcCcsXG5cdFx0J0BrZWVwficsXG5cdFx0J0B0b3NzJyxcblx0XHQnQHRvc3N+Jyxcblx0XHQnQG1hcCcsXG5cdFx0J0BtYXB+J1xuXHRdLFxuXHQnbXNsLkAuTWFwLklkLU1hcCc6IFsnXyddLFxuXHQnbXNsLkAuTWFwLkhhc2gtTWFwJzogWydfJ10sXG5cdCdtc2wuQC5NYXAuTWFwJzogW1xuXHRcdCdfJyxcblx0XHQnP2dldCcsXG5cdFx0J0BrZXlzJyxcblx0XHQnbWFrZS1tYXAnLFxuXHRcdCdtYXA9PycsXG5cdFx0J0B2YWx1ZXMnXG5cdF0sXG5cdCdtc2wuQC5SYW5nZSc6IFsnXyddLFxuXHQnbXNsLkAuU2VxLlNlcSc6IFtcblx0XHQnXycsXG5cdFx0Jys+IScsXG5cdFx0J0Bkcm9wJyxcblx0XHQnQGRyb3B+Jyxcblx0XHQnQGRyb3Atd2hpbGUnLFxuXHRcdCdAZHJvcC13aGlsZX4nLFxuXHRcdCdmaXJzdCcsXG5cdFx0Jz9maXJzdCcsXG5cdFx0J0BpbmRleGVzJyxcblx0XHQnbGFzdCcsXG5cdFx0Jz9sYXN0Jyxcblx0XHQnP250aCcsXG5cdFx0J0ByZXZlcnNlJyxcblx0XHQnQHJldmVyc2V+Jyxcblx0XHQnQHJ0YWlsJyxcblx0XHQnQHNsaWNlJyxcblx0XHQnQHNsaWNlficsXG5cdFx0J0BzcGxpdCcsXG5cdFx0J0BzcGxpdH4nLFxuXHRcdCdzZXE9PycsXG5cdFx0J0B0YWlsJyxcblx0XHQnQHRha2UnLFxuXHRcdCdAdGFrZX4nLFxuXHRcdCdAdGFrZS13aGlsZScsXG5cdFx0J0B0YWtlLXdoaWxlficsXG5cdFx0J0B6aXAnLFxuXHRcdCdAemlwfidcblx0XSxcblx0J21zbC5ALlNlcS5TdHJlYW0nOiBbJ18nXSxcblx0J21zbC5ALlNldC5JZC1TZXQnOiBbJ18nXSxcblx0J21zbC5ALlNldC5TZXQnOiBbJ18nLCAnc2V0PT8nXSxcblx0J21zbC5jb21wYXJlJzogW1xuXHRcdCc9PycsXG5cdFx0Jzw/Jyxcblx0XHQnPD0/Jyxcblx0XHQnPj8nLFxuXHRcdCc+PT8nLFxuXHRcdCc/bWluJyxcblx0XHQnbWluJyxcblx0XHQnP21pbi1ieScsXG5cdFx0J21pbi1ieScsXG5cdFx0Jz9tYXgnLFxuXHRcdCdtYXgnLFxuXHRcdCc/bWF4LWJ5Jyxcblx0XHQnbWF4LWJ5Jyxcblx0XHQnc2FtZT8nXG5cdF0sXG5cdCdtc2wuRnVuY3Rpb24nOiBbJ0FjdGlvbicsICdpZGVudGl0eSddLFxuXHQnbXNsLmpzJzogW1xuXHRcdCdkZWZpbmVkPycsXG5cdFx0J2V4aXN0cz8nLFxuXHRcdCdpZD0/Jyxcblx0XHQnbnVsbD8nXG5cdF0sXG5cdCdtc2wubWF0aC5tZXRob2RzJzogWycrJywgJy0nLCAnKicsICcvJ10sXG5cdCdtc2wubWF0aC5OdW1iZXInOiBbXG5cdFx0J2RpdmlzaWJsZT8nLFxuXHRcdCdJbnQnLFxuXHRcdCdpbnQvJyxcblx0XHQnbG9nLWJhc2UnLFxuXHRcdCdtb2R1bG8nLFxuXHRcdCduZWFyZXN0LWNlaWwnLFxuXHRcdCduZWFyZXN0LWZsb29yJyxcblx0XHQnbmVhcmVzdC1yb3VuZCcsXG5cdFx0J05hdCcsXG5cdFx0J3JlbWFpbmRlcicsXG5cdFx0J3NxdWFyZSdcblx0XSxcblx0J21zbC5tYXRoLnV0aWwnOiBbJ2F2ZXJhZ2UnLCAnc3VtJ10sXG5cdCdtc2wubWV0aG9kcyc6IFsnc3ViJywgJ3NldC1zdWIhJywgJ2RlbC1zdWIhJ10sXG5cdCdtc2wudG8tc3RyaW5nJzogWydfJywgJ2luc3BlY3QnXSxcblx0J21zbC5UeXBlLk1ldGhvZCc6IFsnXycsICdpbXBsIScsICdpbXBsLWZvcicsICdzZWxmLWltcGwhJ10sXG5cdCdtc2wuVHlwZS5LaW5kJzogWydfJywgJ2tpbmQhJywgJ3NlbGYta2luZCEnXSxcblx0J21zbC5UeXBlLlByZWQtVHlwZSc6IFsnXycsICdBbnknLCAnT2JqTGl0J10sXG5cdCdtc2wuVHlwZS5wcmltaXRpdmUnOiBbJ0Jvb2wnLCAnTnVtJywgJ1N0cicsICdTeW0nXSxcblx0J21zbC5UeXBlLlR5cGUnOiBbJ18nLCAnPT4nLCAnaGFzLWluc3RhbmNlPycsICdleHRyYWN0J11cbn1cbiJdfQ==
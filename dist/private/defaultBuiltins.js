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
		'msl.@.?': ['_', '?None', 'Opt->?', '?->Opt', '?-or', '?some', 'un-?'],
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
		'msl.math.Number': ['divisible?', 'Int', 'int/', 'modulo', 'Nat', 'remainder', 'square'],
		'msl.math.util': ['average', 'sum'],
		'msl.methods': ['sub', 'set-sub!', 'del-sub!'],
		'msl.to-string': ['_', 'inspect'],
		'msl.Type.Method': ['_', 'impl!', 'impl-for', 'self-impl!'],
		'msl.Type.Kind': ['_', 'kind!', 'self-kind!'],
		'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
		'msl.Type.Type': ['_', '=>', 'contains?', 'extract']
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWU7QUFDZCxRQUFNLEVBQUU7O0FBRVAsU0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsTUFBTSxFQUNOLE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVE7OztBQUdSLGFBQVcsRUFDWCxlQUFlLEVBQ2YsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixhQUFhLEVBQ2IsV0FBVyxFQUNYLFVBQVU7OztBQUdWLGVBQWEsRUFDYixVQUFVLEVBQ1YsY0FBYyxFQUNkLGNBQWMsRUFDZCxZQUFZLEVBQ1osWUFBWSxFQUNaLFdBQVcsRUFDWCxhQUFhLEVBQ2IsYUFBYSxFQUNiLFlBQVksRUFDWixtQkFBbUI7OztBQUduQixhQUFXLEVBQ1gsb0JBQW9CLEVBQ3BCLFdBQVcsRUFDWDs7Ozs7OztBQUFvQixHQU9wQjtBQUNELFdBQVMsRUFBRSxDQUNWLEdBQUcsRUFDSCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sQ0FDTjtBQUNELFdBQVMsRUFBRSxDQUNWLEdBQUcsRUFDSCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLE1BQU0sRUFDTixNQUFNLEVBQ04sT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFVBQVUsRUFDVixPQUFPLEVBQ1AsUUFBUSxFQUNSLE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLHNCQUFvQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzNCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILE1BQU0sRUFDTixPQUFPLEVBQ1AsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLENBQ1Q7QUFDRCxlQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsS0FBSyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixTQUFTLEVBQ1QsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO0FBQy9CLFNBQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNkLGVBQWEsRUFBRSxDQUNkLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQztBQUN0QyxVQUFRLEVBQUUsQ0FDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3hDLG1CQUFpQixFQUFFLENBQ2xCLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFFBQVEsRUFDUixLQUFLLEVBQ0wsV0FBVyxFQUNYLFFBQVEsQ0FDUjtBQUNELGlCQUFlLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO0FBQ25DLGVBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO0FBQzlDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0FBQ2pDLG1CQUFpQixFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDO0FBQzNELGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQztBQUM3QyxzQkFBb0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0FBQzVDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUM7RUFDcEQiLCJmaWxlIjoiZGVmYXVsdEJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRnbG9iYWw6IFtcblx0XHQvLyBTdGFuZGFyZCBnbG9iYWxzXG5cdFx0J0FycmF5Jyxcblx0XHQnQm9vbGVhbicsXG5cdFx0J2NvbnNvbGUnLFxuXHRcdCdEYXRlJyxcblx0XHQnRXJyb3InLFxuXHRcdCdGdW5jdGlvbicsXG5cdFx0J0ludGwnLFxuXHRcdCdKU09OJyxcblx0XHQnUHJveHknLFxuXHRcdCdNYXRoJyxcblx0XHQnTnVtYmVyJyxcblx0XHQnT2JqZWN0Jyxcblx0XHQnUmVmbGVjdCcsXG5cdFx0J1JlZ0V4cCcsXG5cdFx0J1NJTUQnLFxuXHRcdCdTdHJpbmcnLFxuXHRcdCdTeW1ib2wnLFxuXG5cdFx0Ly8gRXJyb3JzXG5cdFx0J0V2YWxFcnJvcicsXG5cdFx0J0ludGVybmFsRXJyb3InLFxuXHRcdCdSYW5nZUVycm9yJyxcblx0XHQnUmVmZXJlbmNlRXJyb3InLFxuXHRcdCdTeW50YXhFcnJvcicsXG5cdFx0J1R5cGVFcnJvcicsXG5cdFx0J1VSSUVycm9yJyxcblxuXHRcdC8vIEFycmF5QnVmZmVyIGFuZCB2aWV3c1xuXHRcdCdBcnJheUJ1ZmZlcicsXG5cdFx0J0RhdGFWaWV3Jyxcblx0XHQnRmxvYXQzMkFycmF5Jyxcblx0XHQnRmxvYXQ2NEFycmF5Jyxcblx0XHQnSW50MTZBcnJheScsXG5cdFx0J0ludDMyQXJyYXknLFxuXHRcdCdJbnQ4QXJyYXknLFxuXHRcdCdVaW50MTZBcnJheScsXG5cdFx0J1VpbnQzMkFycmF5Jyxcblx0XHQnVWludDhBcnJheScsXG5cdFx0J1VpbnQ4Q2xhbXBlZEFycmF5JyxcblxuXHRcdC8vIFVSSSBmdW5jdGlvbnNcblx0XHQnZGVjb2RlVVJJJyxcblx0XHQnZGVjb2RlVVJJQ29tcG9uZW50Jyxcblx0XHQnZW5jb2RlVVJJJyxcblx0XHQnZW5jb2RlVVJJQ29tcG9uZW50J1xuXG5cdFx0Ly8gTWlzc2luZyBnbG9iYWxzOlxuXHRcdC8vIGV2YWw6IFdhbnQgdG8gZGlzY291cmFnZSB1c2Vcblx0XHQvLyBpc0Zpbml0ZSwgaXNOYU4sIHBhcnNlRmxvYXQsIHBhcnNlSW50OiB1c2UgTnVtYmVyLnh4eCBmdW5jdGlvbnNcblx0XHQvLyBNYXAsIFNldDogaGF2ZSBkaWZmZXJlbnQgbWVhbmluZ3MgZm9yIG1zbC4gVXNlIElkLU1hcCBhbmQgSWQtU2V0IGZvciBuYXRpdmUgdmVyc2lvbnMuXG5cdFx0Ly8gV2Vha01hcCwgV2Vha1NldDogdXNlIFdlYWstSWQtTWFwIGFuZCBXZWFrLUlkLVNldFxuXHRdLFxuXHQnbXNsLkAuPyc6IFtcblx0XHQnXycsXG5cdFx0Jz9Ob25lJyxcblx0XHQnT3B0LT4/Jyxcblx0XHQnPy0+T3B0Jyxcblx0XHQnPy1vcicsXG5cdFx0Jz9zb21lJyxcblx0XHQndW4tPydcblx0XSxcblx0J21zbC5ALkAnOiBbXG5cdFx0J18nLFxuXHRcdCcrKycsXG5cdFx0JysrficsXG5cdFx0JyshJyxcblx0XHQnKyshJyxcblx0XHQnLS0nLFxuXHRcdCctLX4nLFxuXHRcdCctIScsXG5cdFx0Jy0tIScsXG5cdFx0J2FsbD8nLFxuXHRcdCdhbnk/Jyxcblx0XHQnY291bnQnLFxuXHRcdCdlYWNoIScsXG5cdFx0J2VtcHR5PycsXG5cdFx0J2VtcHR5IScsXG5cdFx0Jz9maW5kJyxcblx0XHQnZm9sZCcsXG5cdFx0J0BmbGF0LW1hcCcsXG5cdFx0J0BmbGF0LW1hcH4nLFxuXHRcdCdAZmxhdHRlbicsXG5cdFx0J0BmbGF0dGVuficsXG5cdFx0J2l0ZXJhdG9yJyxcblx0XHQnQGtlZXAnLFxuXHRcdCdAa2VlcH4nLFxuXHRcdCdAbWFwJyxcblx0XHQnQG1hcH4nLFxuXHRdLFxuXHQnbXNsLkAuQC1UeXBlJzogWydlbXB0eSddLFxuXHQnbXNsLkAuTWFwLklkLU1hcCc6IFsnXyddLFxuXHQnbXNsLkAuTWFwLkhhc2gtTWFwJzogWydfJ10sXG5cdCdtc2wuQC5NYXAuTWFwJzogW1xuXHRcdCdfJyxcblx0XHQnP2dldCcsXG5cdFx0J0BrZXlzJyxcblx0XHQnbWFrZS1tYXAnLFxuXHRcdCdtYXA9PycsXG5cdFx0J0B2YWx1ZXMnXG5cdF0sXG5cdCdtc2wuQC5SYW5nZSc6IFsnXyddLFxuXHQnbXNsLkAuU2VxLlNlcSc6IFtcblx0XHQnXycsXG5cdFx0Jys+IScsXG5cdFx0J0Bkcm9wJyxcblx0XHQnQGRyb3B+Jyxcblx0XHQnQGRyb3Atd2hpbGUnLFxuXHRcdCdAZHJvcC13aGlsZX4nLFxuXHRcdCdmaXJzdCcsXG5cdFx0Jz9maXJzdCcsXG5cdFx0J0BpbmRleGVzJyxcblx0XHQnbGFzdCcsXG5cdFx0Jz9sYXN0Jyxcblx0XHQnP250aCcsXG5cdFx0J0ByZXZlcnNlJyxcblx0XHQnQHJldmVyc2V+Jyxcblx0XHQnQHJ0YWlsJyxcblx0XHQnQHNsaWNlJyxcblx0XHQnQHNsaWNlficsXG5cdFx0J0BzcGxpdCcsXG5cdFx0J0BzcGxpdH4nLFxuXHRcdCdzZXE9PycsXG5cdFx0J0B0YWlsJyxcblx0XHQnQHRha2UnLFxuXHRcdCdAdGFrZX4nLFxuXHRcdCdAdGFrZS13aGlsZScsXG5cdFx0J0B0YWtlLXdoaWxlficsXG5cdFx0J0B6aXAnLFxuXHRcdCdAemlwfidcblx0XSxcblx0J21zbC5ALlNlcS5TdHJlYW0nOiBbJ18nXSxcblx0J21zbC5ALlNldC5JZC1TZXQnOiBbJ18nXSxcblx0J21zbC5ALlNldC5TZXQnOiBbJ18nLCAnc2V0PT8nXSxcblx0J21zbC4kJzogWydfJ10sXG5cdCdtc2wuY29tcGFyZSc6IFtcblx0XHQnPT8nLFxuXHRcdCc8PycsXG5cdFx0Jzw9PycsXG5cdFx0Jz4/Jyxcblx0XHQnPj0/Jyxcblx0XHQnP21pbicsXG5cdFx0J21pbicsXG5cdFx0Jz9taW4tYnknLFxuXHRcdCdtaW4tYnknLFxuXHRcdCc/bWF4Jyxcblx0XHQnbWF4Jyxcblx0XHQnP21heC1ieScsXG5cdFx0J21heC1ieScsXG5cdFx0J3NhbWU/J1xuXHRdLFxuXHQnbXNsLkZ1bmN0aW9uJzogWydBY3Rpb24nLCAnaWRlbnRpdHknXSxcblx0J21zbC5qcyc6IFtcblx0XHQnZGVmaW5lZD8nLFxuXHRcdCdpZD0/Jyxcblx0XHQnbnVsbD8nXG5cdF0sXG5cdCdtc2wubWF0aC5tZXRob2RzJzogWycrJywgJy0nLCAnKicsICcvJ10sXG5cdCdtc2wubWF0aC5OdW1iZXInOiBbXG5cdFx0J2RpdmlzaWJsZT8nLFxuXHRcdCdJbnQnLFxuXHRcdCdpbnQvJyxcblx0XHQnbW9kdWxvJyxcblx0XHQnTmF0Jyxcblx0XHQncmVtYWluZGVyJyxcblx0XHQnc3F1YXJlJ1xuXHRdLFxuXHQnbXNsLm1hdGgudXRpbCc6IFsnYXZlcmFnZScsICdzdW0nXSxcblx0J21zbC5tZXRob2RzJzogWydzdWInLCAnc2V0LXN1YiEnLCAnZGVsLXN1YiEnXSxcblx0J21zbC50by1zdHJpbmcnOiBbJ18nLCAnaW5zcGVjdCddLFxuXHQnbXNsLlR5cGUuTWV0aG9kJzogWydfJywgJ2ltcGwhJywgJ2ltcGwtZm9yJywgJ3NlbGYtaW1wbCEnXSxcblx0J21zbC5UeXBlLktpbmQnOiBbJ18nLCAna2luZCEnLCAnc2VsZi1raW5kISddLFxuXHQnbXNsLlR5cGUuUHJlZC1UeXBlJzogWydfJywgJ0FueScsICdPYmpMaXQnXSxcblx0J21zbC5UeXBlLlR5cGUnOiBbJ18nLCAnPT4nLCAnY29udGFpbnM/JywgJ2V4dHJhY3QnXVxufVxuIl19
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod);
		global.defaultBuiltins = mod.exports;
	}
})(this, function (exports, module) {
	'use strict';

	module.exports = {
		global: ['Array', 'Boolean', 'Error', 'Function', 'Math', 'Number', 'Object', 'RegExp', 'String', 'Symbol'],
		'msl.@.?': ['_', '?None', 'Opt->?', '?->Opt', '?-or', '?some', 'un-?'],
		'msl.@.@': ['_', '++', '++~', '+!', '++!', '--', '--~', '-!', '--!', 'all?', 'any?', 'count', 'empty?', 'empty!', '?find', 'fold', '@flat-map', '@flat-map~', '@flatten', '@flatten~', 'iterator', '@keep', '@keep~', '@map', '@map~'],
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
		'msl.Generator': ['gen-next!'],
		'msl.js': ['defined?', 'id=?'],
		'msl.math.methods': ['+', '-', '*', '/'],
		'msl.math.Number': ['divisible?', 'Int', 'int/', 'modulo', 'Nat', 'neg', 'log', 'remainder'],
		'msl.math.util': ['average', 'sum'],
		'msl.methods': ['sub', 'set-sub!', 'del-sub!'],
		'msl.to-string': ['_', 'inspect'],
		'msl.Type.Method': ['_', 'impl!', 'impl-for', 'self-impl!'],
		'msl.Type.Kind': ['_', 'kind!', 'self-kind!'],
		'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
		'msl.Type.Type': ['_', '=>', 'contains?', 'extract']
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBQWU7QUFDZCxRQUFNLEVBQUUsQ0FDUCxPQUFPLEVBQ1AsU0FBUyxFQUNULE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLENBQ1I7QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sRUFDUCxNQUFNLENBQ047QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sTUFBTSxFQUNOLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFVBQVUsRUFDVixPQUFPLEVBQ1AsUUFBUSxFQUNSLE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLHNCQUFvQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzNCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILE1BQU0sRUFDTixPQUFPLEVBQ1AsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLENBQ1Q7QUFDRCxlQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsS0FBSyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixTQUFTLEVBQ1QsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO0FBQy9CLFNBQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNkLGVBQWEsRUFBRSxDQUNkLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQztBQUN0QyxpQkFBZSxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzlCLFVBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUM7QUFDOUIsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDeEMsbUJBQWlCLEVBQUUsQ0FDbEIsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04sUUFBUSxFQUNSLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFdBQVcsQ0FDWDtBQUNELGlCQUFlLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO0FBQ25DLGVBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO0FBQzlDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0FBQ2pDLG1CQUFpQixFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDO0FBQzNELGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQztBQUM3QyxzQkFBb0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0FBQzVDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUM7RUFDcEQiLCJmaWxlIjoiZGVmYXVsdEJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRnbG9iYWw6IFtcblx0XHQnQXJyYXknLFxuXHRcdCdCb29sZWFuJyxcblx0XHQnRXJyb3InLFxuXHRcdCdGdW5jdGlvbicsXG5cdFx0J01hdGgnLFxuXHRcdCdOdW1iZXInLFxuXHRcdCdPYmplY3QnLFxuXHRcdCdSZWdFeHAnLFxuXHRcdCdTdHJpbmcnLFxuXHRcdCdTeW1ib2wnXG5cdF0sXG5cdCdtc2wuQC4/JzogW1xuXHRcdCdfJyxcblx0XHQnP05vbmUnLFxuXHRcdCdPcHQtPj8nLFxuXHRcdCc/LT5PcHQnLFxuXHRcdCc/LW9yJyxcblx0XHQnP3NvbWUnLFxuXHRcdCd1bi0/J1xuXHRdLFxuXHQnbXNsLkAuQCc6IFtcblx0XHQnXycsXG5cdFx0JysrJyxcblx0XHQnKyt+Jyxcblx0XHQnKyEnLFxuXHRcdCcrKyEnLFxuXHRcdCctLScsXG5cdFx0Jy0tficsXG5cdFx0Jy0hJyxcblx0XHQnLS0hJyxcblx0XHQnYWxsPycsXG5cdFx0J2FueT8nLFxuXHRcdCdjb3VudCcsXG5cdFx0J2VtcHR5PycsXG5cdFx0J2VtcHR5IScsXG5cdFx0Jz9maW5kJyxcblx0XHQnZm9sZCcsXG5cdFx0J0BmbGF0LW1hcCcsXG5cdFx0J0BmbGF0LW1hcH4nLFxuXHRcdCdAZmxhdHRlbicsXG5cdFx0J0BmbGF0dGVuficsXG5cdFx0J2l0ZXJhdG9yJyxcblx0XHQnQGtlZXAnLFxuXHRcdCdAa2VlcH4nLFxuXHRcdCdAbWFwJyxcblx0XHQnQG1hcH4nLFxuXHRdLFxuXHQnbXNsLkAuQC1UeXBlJzogWydlbXB0eSddLFxuXHQnbXNsLkAuTWFwLklkLU1hcCc6IFsnXyddLFxuXHQnbXNsLkAuTWFwLkhhc2gtTWFwJzogWydfJ10sXG5cdCdtc2wuQC5NYXAuTWFwJzogW1xuXHRcdCdfJyxcblx0XHQnP2dldCcsXG5cdFx0J0BrZXlzJyxcblx0XHQnbWFrZS1tYXAnLFxuXHRcdCdtYXA9PycsXG5cdFx0J0B2YWx1ZXMnXG5cdF0sXG5cdCdtc2wuQC5SYW5nZSc6IFsnXyddLFxuXHQnbXNsLkAuU2VxLlNlcSc6IFtcblx0XHQnXycsXG5cdFx0Jys+IScsXG5cdFx0J0Bkcm9wJyxcblx0XHQnQGRyb3B+Jyxcblx0XHQnQGRyb3Atd2hpbGUnLFxuXHRcdCdAZHJvcC13aGlsZX4nLFxuXHRcdCdmaXJzdCcsXG5cdFx0Jz9maXJzdCcsXG5cdFx0J0BpbmRleGVzJyxcblx0XHQnbGFzdCcsXG5cdFx0Jz9sYXN0Jyxcblx0XHQnP250aCcsXG5cdFx0J0ByZXZlcnNlJyxcblx0XHQnQHJldmVyc2V+Jyxcblx0XHQnQHJ0YWlsJyxcblx0XHQnQHNsaWNlJyxcblx0XHQnQHNsaWNlficsXG5cdFx0J0BzcGxpdCcsXG5cdFx0J0BzcGxpdH4nLFxuXHRcdCdzZXE9PycsXG5cdFx0J0B0YWlsJyxcblx0XHQnQHRha2UnLFxuXHRcdCdAdGFrZX4nLFxuXHRcdCdAdGFrZS13aGlsZScsXG5cdFx0J0B0YWtlLXdoaWxlficsXG5cdFx0J0B6aXAnLFxuXHRcdCdAemlwfidcblx0XSxcblx0J21zbC5ALlNlcS5TdHJlYW0nOiBbJ18nXSxcblx0J21zbC5ALlNldC5JZC1TZXQnOiBbJ18nXSxcblx0J21zbC5ALlNldC5TZXQnOiBbJ18nLCAnc2V0PT8nXSxcblx0J21zbC4kJzogWydfJ10sXG5cdCdtc2wuY29tcGFyZSc6IFtcblx0XHQnPT8nLFxuXHRcdCc8PycsXG5cdFx0Jzw9PycsXG5cdFx0Jz4/Jyxcblx0XHQnPj0/Jyxcblx0XHQnP21pbicsXG5cdFx0J21pbicsXG5cdFx0Jz9taW4tYnknLFxuXHRcdCdtaW4tYnknLFxuXHRcdCc/bWF4Jyxcblx0XHQnbWF4Jyxcblx0XHQnP21heC1ieScsXG5cdFx0J21heC1ieScsXG5cdFx0J3NhbWU/J1xuXHRdLFxuXHQnbXNsLkZ1bmN0aW9uJzogWydBY3Rpb24nLCAnaWRlbnRpdHknXSxcblx0J21zbC5HZW5lcmF0b3InOiBbJ2dlbi1uZXh0ISddLFxuXHQnbXNsLmpzJzogWydkZWZpbmVkPycsICdpZD0/J10sXG5cdCdtc2wubWF0aC5tZXRob2RzJzogWycrJywgJy0nLCAnKicsICcvJ10sXG5cdCdtc2wubWF0aC5OdW1iZXInOiBbXG5cdFx0J2RpdmlzaWJsZT8nLFxuXHRcdCdJbnQnLFxuXHRcdCdpbnQvJyxcblx0XHQnbW9kdWxvJyxcblx0XHQnTmF0Jyxcblx0XHQnbmVnJyxcblx0XHQnbG9nJyxcblx0XHQncmVtYWluZGVyJ1xuXHRdLFxuXHQnbXNsLm1hdGgudXRpbCc6IFsnYXZlcmFnZScsICdzdW0nXSxcblx0J21zbC5tZXRob2RzJzogWydzdWInLCAnc2V0LXN1YiEnLCAnZGVsLXN1YiEnXSxcblx0J21zbC50by1zdHJpbmcnOiBbJ18nLCAnaW5zcGVjdCddLFxuXHQnbXNsLlR5cGUuTWV0aG9kJzogWydfJywgJ2ltcGwhJywgJ2ltcGwtZm9yJywgJ3NlbGYtaW1wbCEnXSxcblx0J21zbC5UeXBlLktpbmQnOiBbJ18nLCAna2luZCEnLCAnc2VsZi1raW5kISddLFxuXHQnbXNsLlR5cGUuUHJlZC1UeXBlJzogWydfJywgJ0FueScsICdPYmpMaXQnXSxcblx0J21zbC5UeXBlLlR5cGUnOiBbJ18nLCAnPT4nLCAnY29udGFpbnM/JywgJ2V4dHJhY3QnXVxufVxuIl19
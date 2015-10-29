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
		global: ['Array', 'Boolean', 'console', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object', 'RegExp', 'String', 'Symbol'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBQWU7QUFDZCxRQUFNLEVBQUUsQ0FDUCxPQUFPLEVBQ1AsU0FBUyxFQUNULFNBQVMsRUFDVCxNQUFNLEVBQ04sT0FBTyxFQUNQLFVBQVUsRUFDVixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsQ0FDUjtBQUNELFdBQVMsRUFBRSxDQUNWLEdBQUcsRUFDSCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sQ0FDTjtBQUNELFdBQVMsRUFBRSxDQUNWLEdBQUcsRUFDSCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLE1BQU0sRUFDTixNQUFNLEVBQ04sT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFVBQVUsRUFDVixPQUFPLEVBQ1AsUUFBUSxFQUNSLE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLHNCQUFvQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzNCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILE1BQU0sRUFDTixPQUFPLEVBQ1AsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLENBQ1Q7QUFDRCxlQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsS0FBSyxFQUNMLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sRUFDTixVQUFVLEVBQ1YsV0FBVyxFQUNYLFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULFFBQVEsRUFDUixTQUFTLEVBQ1QsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLGFBQWEsRUFDYixjQUFjLEVBQ2QsTUFBTSxFQUNOLE9BQU8sQ0FDUDtBQUNELG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDO0FBQy9CLFNBQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNkLGVBQWEsRUFBRSxDQUNkLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQztBQUN0QyxpQkFBZSxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzlCLFVBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUM7QUFDOUIsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDeEMsbUJBQWlCLEVBQUUsQ0FDbEIsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04sUUFBUSxFQUNSLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFdBQVcsQ0FDWDtBQUNELGlCQUFlLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO0FBQ25DLGVBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO0FBQzlDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDO0FBQ2pDLG1CQUFpQixFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDO0FBQzNELGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQztBQUM3QyxzQkFBb0IsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO0FBQzVDLGlCQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUM7RUFDcEQiLCJmaWxlIjoiZGVmYXVsdEJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRnbG9iYWw6IFtcblx0XHQnQXJyYXknLFxuXHRcdCdCb29sZWFuJyxcblx0XHQnY29uc29sZScsXG5cdFx0J0RhdGUnLFxuXHRcdCdFcnJvcicsXG5cdFx0J0Z1bmN0aW9uJyxcblx0XHQnTWF0aCcsXG5cdFx0J051bWJlcicsXG5cdFx0J09iamVjdCcsXG5cdFx0J1JlZ0V4cCcsXG5cdFx0J1N0cmluZycsXG5cdFx0J1N5bWJvbCdcblx0XSxcblx0J21zbC5ALj8nOiBbXG5cdFx0J18nLFxuXHRcdCc/Tm9uZScsXG5cdFx0J09wdC0+PycsXG5cdFx0Jz8tPk9wdCcsXG5cdFx0Jz8tb3InLFxuXHRcdCc/c29tZScsXG5cdFx0J3VuLT8nXG5cdF0sXG5cdCdtc2wuQC5AJzogW1xuXHRcdCdfJyxcblx0XHQnKysnLFxuXHRcdCcrK34nLFxuXHRcdCcrIScsXG5cdFx0JysrIScsXG5cdFx0Jy0tJyxcblx0XHQnLS1+Jyxcblx0XHQnLSEnLFxuXHRcdCctLSEnLFxuXHRcdCdhbGw/Jyxcblx0XHQnYW55PycsXG5cdFx0J2NvdW50Jyxcblx0XHQnZWFjaCEnLFxuXHRcdCdlbXB0eT8nLFxuXHRcdCdlbXB0eSEnLFxuXHRcdCc/ZmluZCcsXG5cdFx0J2ZvbGQnLFxuXHRcdCdAZmxhdC1tYXAnLFxuXHRcdCdAZmxhdC1tYXB+Jyxcblx0XHQnQGZsYXR0ZW4nLFxuXHRcdCdAZmxhdHRlbn4nLFxuXHRcdCdpdGVyYXRvcicsXG5cdFx0J0BrZWVwJyxcblx0XHQnQGtlZXB+Jyxcblx0XHQnQG1hcCcsXG5cdFx0J0BtYXB+Jyxcblx0XSxcblx0J21zbC5ALkAtVHlwZSc6IFsnZW1wdHknXSxcblx0J21zbC5ALk1hcC5JZC1NYXAnOiBbJ18nXSxcblx0J21zbC5ALk1hcC5IYXNoLU1hcCc6IFsnXyddLFxuXHQnbXNsLkAuTWFwLk1hcCc6IFtcblx0XHQnXycsXG5cdFx0Jz9nZXQnLFxuXHRcdCdAa2V5cycsXG5cdFx0J21ha2UtbWFwJyxcblx0XHQnbWFwPT8nLFxuXHRcdCdAdmFsdWVzJ1xuXHRdLFxuXHQnbXNsLkAuUmFuZ2UnOiBbJ18nXSxcblx0J21zbC5ALlNlcS5TZXEnOiBbXG5cdFx0J18nLFxuXHRcdCcrPiEnLFxuXHRcdCdAZHJvcCcsXG5cdFx0J0Bkcm9wficsXG5cdFx0J0Bkcm9wLXdoaWxlJyxcblx0XHQnQGRyb3Atd2hpbGV+Jyxcblx0XHQnZmlyc3QnLFxuXHRcdCc/Zmlyc3QnLFxuXHRcdCdAaW5kZXhlcycsXG5cdFx0J2xhc3QnLFxuXHRcdCc/bGFzdCcsXG5cdFx0Jz9udGgnLFxuXHRcdCdAcmV2ZXJzZScsXG5cdFx0J0ByZXZlcnNlficsXG5cdFx0J0BydGFpbCcsXG5cdFx0J0BzbGljZScsXG5cdFx0J0BzbGljZX4nLFxuXHRcdCdAc3BsaXQnLFxuXHRcdCdAc3BsaXR+Jyxcblx0XHQnc2VxPT8nLFxuXHRcdCdAdGFpbCcsXG5cdFx0J0B0YWtlJyxcblx0XHQnQHRha2V+Jyxcblx0XHQnQHRha2Utd2hpbGUnLFxuXHRcdCdAdGFrZS13aGlsZX4nLFxuXHRcdCdAemlwJyxcblx0XHQnQHppcH4nXG5cdF0sXG5cdCdtc2wuQC5TZXEuU3RyZWFtJzogWydfJ10sXG5cdCdtc2wuQC5TZXQuSWQtU2V0JzogWydfJ10sXG5cdCdtc2wuQC5TZXQuU2V0JzogWydfJywgJ3NldD0/J10sXG5cdCdtc2wuJCc6IFsnXyddLFxuXHQnbXNsLmNvbXBhcmUnOiBbXG5cdFx0Jz0/Jyxcblx0XHQnPD8nLFxuXHRcdCc8PT8nLFxuXHRcdCc+PycsXG5cdFx0Jz49PycsXG5cdFx0Jz9taW4nLFxuXHRcdCdtaW4nLFxuXHRcdCc/bWluLWJ5Jyxcblx0XHQnbWluLWJ5Jyxcblx0XHQnP21heCcsXG5cdFx0J21heCcsXG5cdFx0Jz9tYXgtYnknLFxuXHRcdCdtYXgtYnknLFxuXHRcdCdzYW1lPydcblx0XSxcblx0J21zbC5GdW5jdGlvbic6IFsnQWN0aW9uJywgJ2lkZW50aXR5J10sXG5cdCdtc2wuR2VuZXJhdG9yJzogWydnZW4tbmV4dCEnXSxcblx0J21zbC5qcyc6IFsnZGVmaW5lZD8nLCAnaWQ9PyddLFxuXHQnbXNsLm1hdGgubWV0aG9kcyc6IFsnKycsICctJywgJyonLCAnLyddLFxuXHQnbXNsLm1hdGguTnVtYmVyJzogW1xuXHRcdCdkaXZpc2libGU/Jyxcblx0XHQnSW50Jyxcblx0XHQnaW50LycsXG5cdFx0J21vZHVsbycsXG5cdFx0J05hdCcsXG5cdFx0J25lZycsXG5cdFx0J2xvZycsXG5cdFx0J3JlbWFpbmRlcidcblx0XSxcblx0J21zbC5tYXRoLnV0aWwnOiBbJ2F2ZXJhZ2UnLCAnc3VtJ10sXG5cdCdtc2wubWV0aG9kcyc6IFsnc3ViJywgJ3NldC1zdWIhJywgJ2RlbC1zdWIhJ10sXG5cdCdtc2wudG8tc3RyaW5nJzogWydfJywgJ2luc3BlY3QnXSxcblx0J21zbC5UeXBlLk1ldGhvZCc6IFsnXycsICdpbXBsIScsICdpbXBsLWZvcicsICdzZWxmLWltcGwhJ10sXG5cdCdtc2wuVHlwZS5LaW5kJzogWydfJywgJ2tpbmQhJywgJ3NlbGYta2luZCEnXSxcblx0J21zbC5UeXBlLlByZWQtVHlwZSc6IFsnXycsICdBbnknLCAnT2JqTGl0J10sXG5cdCdtc2wuVHlwZS5UeXBlJzogWydfJywgJz0+JywgJ2NvbnRhaW5zPycsICdleHRyYWN0J11cbn1cbiJdfQ==
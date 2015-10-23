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
		'msl.@.Seq.Seq': ['_', '@drop', '@drop~', '@drop-while', '@drop-while~', 'first', '?first', '@indexes', 'last', '?last', '?nth', '@reverse', '@reverse~', '@rtail', '@slice', '@slice~', '@split', '@split~', 'seq=?', '@tail', '@take', '@take~', '@take-while', '@take-while~', '@zip', '@zip~'],
		'msl.@.Seq.Stream': ['_'],
		'msl.@.Set.Id-Set': ['_'],
		'msl.@.Set.Set': ['_', 'set=?'],
		'msl.$': ['_'],
		'msl.compare': ['=?', '<?', '<=?', '>?', '>=?', '?min', 'min', '?min-by', 'min-by', '?max', 'max', '?max-by', 'max-by', 'same?'],
		'msl.Function': ['identity'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2RlZmF1bHRCdWlsdGlucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBQWU7QUFDZCxRQUFNLEVBQUUsQ0FDUCxPQUFPLEVBQ1AsU0FBUyxFQUNULE9BQU8sRUFDUCxVQUFVLEVBQ1YsTUFBTSxFQUNOLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLENBQ1I7QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sRUFDUCxNQUFNLENBQ047QUFDRCxXQUFTLEVBQUUsQ0FDVixHQUFHLEVBQ0gsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sTUFBTSxFQUNOLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixVQUFVLEVBQ1YsV0FBVyxFQUNYLFVBQVUsRUFDVixPQUFPLEVBQ1AsUUFBUSxFQUNSLE1BQU0sRUFDTixPQUFPLENBQ1A7QUFDRCxnQkFBYyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3pCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLHNCQUFvQixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzNCLGlCQUFlLEVBQUUsQ0FDaEIsR0FBRyxFQUNILE1BQU0sRUFDTixPQUFPLEVBQ1AsVUFBVSxFQUNWLE9BQU8sRUFDUCxTQUFTLENBQ1Q7QUFDRCxlQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxDQUNoQixHQUFHLEVBQ0gsT0FBTyxFQUNQLFFBQVEsRUFDUixhQUFhLEVBQ2IsY0FBYyxFQUNkLE9BQU8sRUFDUCxRQUFRLEVBQ1IsVUFBVSxFQUNWLE1BQU0sRUFDTixPQUFPLEVBQ1AsTUFBTSxFQUNOLFVBQVUsRUFDVixXQUFXLEVBQ1gsUUFBUSxFQUNSLFFBQVEsRUFDUixTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxNQUFNLEVBQ04sT0FBTyxDQUNQO0FBQ0Qsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsb0JBQWtCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekIsaUJBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7QUFDL0IsU0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsZUFBYSxFQUFFLENBQ2QsSUFBSSxFQUNKLElBQUksRUFDSixLQUFLLEVBQ0wsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sS0FBSyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLE9BQU8sQ0FDUDtBQUNELGdCQUFjLEVBQUUsQ0FBQyxVQUFVLENBQUM7QUFDNUIsaUJBQWUsRUFBRSxDQUFDLFdBQVcsQ0FBQztBQUM5QixVQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDO0FBQzlCLG9CQUFrQixFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQ3hDLG1CQUFpQixFQUFFLENBQ2xCLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFFBQVEsRUFDUixLQUFLLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTCxXQUFXLENBQ1g7QUFDRCxpQkFBZSxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQztBQUNuQyxlQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQztBQUM5QyxpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQztBQUNqQyxtQkFBaUIsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQztBQUMzRCxpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUM7QUFDN0Msc0JBQW9CLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUM1QyxpQkFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDO0VBQ3BEIiwiZmlsZSI6ImRlZmF1bHRCdWlsdGlucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcblx0Z2xvYmFsOiBbXG5cdFx0J0FycmF5Jyxcblx0XHQnQm9vbGVhbicsXG5cdFx0J0Vycm9yJyxcblx0XHQnRnVuY3Rpb24nLFxuXHRcdCdNYXRoJyxcblx0XHQnTnVtYmVyJyxcblx0XHQnT2JqZWN0Jyxcblx0XHQnUmVnRXhwJyxcblx0XHQnU3RyaW5nJyxcblx0XHQnU3ltYm9sJ1xuXHRdLFxuXHQnbXNsLkAuPyc6IFtcblx0XHQnXycsXG5cdFx0Jz9Ob25lJyxcblx0XHQnT3B0LT4/Jyxcblx0XHQnPy0+T3B0Jyxcblx0XHQnPy1vcicsXG5cdFx0Jz9zb21lJyxcblx0XHQndW4tPydcblx0XSxcblx0J21zbC5ALkAnOiBbXG5cdFx0J18nLFxuXHRcdCcrKycsXG5cdFx0JysrficsXG5cdFx0JyshJyxcblx0XHQnKyshJyxcblx0XHQnLS0nLFxuXHRcdCctLX4nLFxuXHRcdCctIScsXG5cdFx0Jy0tIScsXG5cdFx0J2FsbD8nLFxuXHRcdCdhbnk/Jyxcblx0XHQnY291bnQnLFxuXHRcdCdlbXB0eT8nLFxuXHRcdCdlbXB0eSEnLFxuXHRcdCc/ZmluZCcsXG5cdFx0J2ZvbGQnLFxuXHRcdCdAZmxhdC1tYXAnLFxuXHRcdCdAZmxhdC1tYXB+Jyxcblx0XHQnQGZsYXR0ZW4nLFxuXHRcdCdAZmxhdHRlbn4nLFxuXHRcdCdpdGVyYXRvcicsXG5cdFx0J0BrZWVwJyxcblx0XHQnQGtlZXB+Jyxcblx0XHQnQG1hcCcsXG5cdFx0J0BtYXB+Jyxcblx0XSxcblx0J21zbC5ALkAtVHlwZSc6IFsnZW1wdHknXSxcblx0J21zbC5ALk1hcC5JZC1NYXAnOiBbJ18nXSxcblx0J21zbC5ALk1hcC5IYXNoLU1hcCc6IFsnXyddLFxuXHQnbXNsLkAuTWFwLk1hcCc6IFtcblx0XHQnXycsXG5cdFx0Jz9nZXQnLFxuXHRcdCdAa2V5cycsXG5cdFx0J21ha2UtbWFwJyxcblx0XHQnbWFwPT8nLFxuXHRcdCdAdmFsdWVzJ1xuXHRdLFxuXHQnbXNsLkAuUmFuZ2UnOiBbJ18nXSxcblx0J21zbC5ALlNlcS5TZXEnOiBbXG5cdFx0J18nLFxuXHRcdCdAZHJvcCcsXG5cdFx0J0Bkcm9wficsXG5cdFx0J0Bkcm9wLXdoaWxlJyxcblx0XHQnQGRyb3Atd2hpbGV+Jyxcblx0XHQnZmlyc3QnLFxuXHRcdCc/Zmlyc3QnLFxuXHRcdCdAaW5kZXhlcycsXG5cdFx0J2xhc3QnLFxuXHRcdCc/bGFzdCcsXG5cdFx0Jz9udGgnLFxuXHRcdCdAcmV2ZXJzZScsXG5cdFx0J0ByZXZlcnNlficsXG5cdFx0J0BydGFpbCcsXG5cdFx0J0BzbGljZScsXG5cdFx0J0BzbGljZX4nLFxuXHRcdCdAc3BsaXQnLFxuXHRcdCdAc3BsaXR+Jyxcblx0XHQnc2VxPT8nLFxuXHRcdCdAdGFpbCcsXG5cdFx0J0B0YWtlJyxcblx0XHQnQHRha2V+Jyxcblx0XHQnQHRha2Utd2hpbGUnLFxuXHRcdCdAdGFrZS13aGlsZX4nLFxuXHRcdCdAemlwJyxcblx0XHQnQHppcH4nXG5cdF0sXG5cdCdtc2wuQC5TZXEuU3RyZWFtJzogWydfJ10sXG5cdCdtc2wuQC5TZXQuSWQtU2V0JzogWydfJ10sXG5cdCdtc2wuQC5TZXQuU2V0JzogWydfJywgJ3NldD0/J10sXG5cdCdtc2wuJCc6IFsnXyddLFxuXHQnbXNsLmNvbXBhcmUnOiBbXG5cdFx0Jz0/Jyxcblx0XHQnPD8nLFxuXHRcdCc8PT8nLFxuXHRcdCc+PycsXG5cdFx0Jz49PycsXG5cdFx0Jz9taW4nLFxuXHRcdCdtaW4nLFxuXHRcdCc/bWluLWJ5Jyxcblx0XHQnbWluLWJ5Jyxcblx0XHQnP21heCcsXG5cdFx0J21heCcsXG5cdFx0Jz9tYXgtYnknLFxuXHRcdCdtYXgtYnknLFxuXHRcdCdzYW1lPydcblx0XSxcblx0J21zbC5GdW5jdGlvbic6IFsnaWRlbnRpdHknXSxcblx0J21zbC5HZW5lcmF0b3InOiBbJ2dlbi1uZXh0ISddLFxuXHQnbXNsLmpzJzogWydkZWZpbmVkPycsICdpZD0/J10sXG5cdCdtc2wubWF0aC5tZXRob2RzJzogWycrJywgJy0nLCAnKicsICcvJ10sXG5cdCdtc2wubWF0aC5OdW1iZXInOiBbXG5cdFx0J2RpdmlzaWJsZT8nLFxuXHRcdCdJbnQnLFxuXHRcdCdpbnQvJyxcblx0XHQnbW9kdWxvJyxcblx0XHQnTmF0Jyxcblx0XHQnbmVnJyxcblx0XHQnbG9nJyxcblx0XHQncmVtYWluZGVyJ1xuXHRdLFxuXHQnbXNsLm1hdGgudXRpbCc6IFsnYXZlcmFnZScsICdzdW0nXSxcblx0J21zbC5tZXRob2RzJzogWydzdWInLCAnc2V0LXN1YiEnLCAnZGVsLXN1YiEnXSxcblx0J21zbC50by1zdHJpbmcnOiBbJ18nLCAnaW5zcGVjdCddLFxuXHQnbXNsLlR5cGUuTWV0aG9kJzogWydfJywgJ2ltcGwhJywgJ2ltcGwtZm9yJywgJ3NlbGYtaW1wbCEnXSxcblx0J21zbC5UeXBlLktpbmQnOiBbJ18nLCAna2luZCEnLCAnc2VsZi1raW5kISddLFxuXHQnbXNsLlR5cGUuUHJlZC1UeXBlJzogWydfJywgJ0FueScsICdPYmpMaXQnXSxcblx0J21zbC5UeXBlLlR5cGUnOiBbJ18nLCAnPT4nLCAnY29udGFpbnM/JywgJ2V4dHJhY3QnXVxufVxuIl19
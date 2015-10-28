(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', './util'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.util);
		global.astConstants = mod.exports;
	}
})(this, function (exports, _esastDistAst, _esastDistUtil, _util) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	const GlobalError = new _esastDistAst.Identifier('Error'),
	      GlobalInfinity = new _esastDistAst.Identifier('Infinity'),
	      IdArguments = new _esastDistAst.Identifier('arguments'),
	      IdBuilt = new _esastDistAst.Identifier('built'),
	      IdError = new _esastDistAst.Identifier('Error'),
	      IdExports = new _esastDistAst.Identifier('exports'),
	      IdExtract = new _esastDistAst.Identifier('_$'),
	      IdFocus = new _esastDistAst.Identifier('_'),
	     
	// TODO:ES6 Shouldn't need, just use arrow functions.
	IdLexicalThis = new _esastDistAst.Identifier('_this'),
	      IdSuper = new _esastDistAst.Identifier('super'),
	      LitEmptyArray = new _esastDistAst.ArrayExpression([]),
	      LitEmptyString = new _esastDistAst.Literal(''),
	      LitNull = new _esastDistAst.Literal(null),
	      LitStrThrow = new _esastDistAst.Literal('An error occurred.'),
	      LitTrue = new _esastDistAst.Literal(true),
	      LitZero = new _esastDistAst.Literal(0),
	      ReturnBuilt = new _esastDistAst.ReturnStatement(IdBuilt),
	      SwitchCaseNoMatch = new _esastDistAst.SwitchCase(undefined, [(0, _util.throwErrorFromString)('No branch of `switch` matches.')]),
	      SymbolIterator = (0, _esastDistUtil.member)(new _esastDistAst.Identifier('Symbol'), 'iterator'),
	      ThrowAssertFail = (0, _util.throwErrorFromString)('Assertion failed.'),
	      ThrowNoCaseMatch = (0, _util.throwErrorFromString)('No branch of `case` matches.'),
	      ArraySliceCall = (0, _esastDistUtil.member)((0, _esastDistUtil.member)(LitEmptyArray, 'slice'), 'call'),
	      DeclareBuiltBag = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(IdBuilt, LitEmptyArray)]),
	      DeclareBuiltMap = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(IdBuilt, new _esastDistAst.NewExpression((0, _esastDistUtil.member)(new _esastDistAst.Identifier('global'), 'Map'), []))]),
	      DeclareBuiltObj = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(IdBuilt, new _esastDistAst.ObjectExpression([]))]),
	      DeclareLexicalThis = new _esastDistAst.VariableDeclaration('const', [new _esastDistAst.VariableDeclarator(IdLexicalThis, new _esastDistAst.ThisExpression())]),
	      ExportsDefault = (0, _esastDistUtil.member)(IdExports, 'default');
	exports.GlobalError = GlobalError;
	exports.GlobalInfinity = GlobalInfinity;
	exports.IdArguments = IdArguments;
	exports.IdBuilt = IdBuilt;
	exports.IdError = IdError;
	exports.IdExports = IdExports;
	exports.IdExtract = IdExtract;
	exports.IdFocus = IdFocus;
	exports.IdLexicalThis = IdLexicalThis;
	exports.IdSuper = IdSuper;
	exports.LitEmptyArray = LitEmptyArray;
	exports.LitEmptyString = LitEmptyString;
	exports.LitNull = LitNull;
	exports.LitStrThrow = LitStrThrow;
	exports.LitTrue = LitTrue;
	exports.LitZero = LitZero;
	exports.ReturnBuilt = ReturnBuilt;
	exports.SwitchCaseNoMatch = SwitchCaseNoMatch;
	exports.SymbolIterator = SymbolIterator;
	exports.ThrowAssertFail = ThrowAssertFail;
	exports.ThrowNoCaseMatch = ThrowNoCaseMatch;
	exports.ArraySliceCall = ArraySliceCall;
	exports.DeclareBuiltBag = DeclareBuiltBag;
	exports.DeclareBuiltMap = DeclareBuiltMap;
	exports.DeclareBuiltObj = DeclareBuiltObj;
	exports.DeclareLexicalThis = DeclareLexicalThis;
	exports.ExportsDefault = ExportsDefault;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9hc3QtY29uc3RhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtPLE9BQ04sV0FBVyxHQUFHLGtCQU5VLFVBQVUsQ0FNTCxPQUFPLENBQUM7T0FDckMsY0FBYyxHQUFHLGtCQVBPLFVBQVUsQ0FPRixVQUFVLENBQUM7T0FDM0MsV0FBVyxHQUFHLGtCQVJVLFVBQVUsQ0FRTCxXQUFXLENBQUM7T0FDekMsT0FBTyxHQUFHLGtCQVRjLFVBQVUsQ0FTVCxPQUFPLENBQUM7T0FDakMsT0FBTyxHQUFHLGtCQVZjLFVBQVUsQ0FVVCxPQUFPLENBQUM7T0FDakMsU0FBUyxHQUFHLGtCQVhZLFVBQVUsQ0FXUCxTQUFTLENBQUM7T0FDckMsU0FBUyxHQUFHLGtCQVpZLFVBQVUsQ0FZUCxJQUFJLENBQUM7T0FDaEMsT0FBTyxHQUFHLGtCQWJjLFVBQVUsQ0FhVCxHQUFHLENBQUM7OztBQUU3QixjQUFhLEdBQUcsa0JBZlEsVUFBVSxDQWVILE9BQU8sQ0FBQztPQUN2QyxPQUFPLEdBQUcsa0JBaEJjLFVBQVUsQ0FnQlQsT0FBTyxDQUFDO09BQ2pDLGFBQWEsR0FBRyxrQkFqQlQsZUFBZSxDQWlCYyxFQUFFLENBQUM7T0FDdkMsY0FBYyxHQUFHLGtCQWxCbUIsT0FBTyxDQWtCZCxFQUFFLENBQUM7T0FDaEMsT0FBTyxHQUFHLGtCQW5CMEIsT0FBTyxDQW1CckIsSUFBSSxDQUFDO09BQzNCLFdBQVcsR0FBRyxrQkFwQnNCLE9BQU8sQ0FvQmpCLG9CQUFvQixDQUFDO09BQy9DLE9BQU8sR0FBRyxrQkFyQjBCLE9BQU8sQ0FxQnJCLElBQUksQ0FBQztPQUMzQixPQUFPLEdBQUcsa0JBdEIwQixPQUFPLENBc0JyQixDQUFDLENBQUM7T0FDeEIsV0FBVyxHQUFHLGtCQXZCZ0UsZUFBZSxDQXVCM0QsT0FBTyxDQUFDO09BQzFDLGlCQUFpQixHQUFHLGtCQXZCcEIsVUFBVSxDQXVCeUIsU0FBUyxFQUFFLENBQzdDLFVBdEJNLG9CQUFvQixFQXNCTCxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7T0FDekQsY0FBYyxHQUFHLG1CQXhCVixNQUFNLEVBd0JXLGtCQTFCQSxVQUFVLENBMEJLLFFBQVEsQ0FBQyxFQUFFLFVBQVUsQ0FBQztPQUM3RCxlQUFlLEdBQUcsVUF4Qlgsb0JBQW9CLEVBd0JZLG1CQUFtQixDQUFDO09BQzNELGdCQUFnQixHQUFHLFVBekJaLG9CQUFvQixFQXlCYSw4QkFBOEIsQ0FBQztPQUV2RSxjQUFjLEdBQUcsbUJBNUJWLE1BQU0sRUE0QlcsbUJBNUJqQixNQUFNLEVBNEJrQixhQUFhLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDO09BQy9ELGVBQWUsR0FBRyxrQkE5QlUsbUJBQW1CLENBOEJMLE9BQU8sRUFDaEQsQ0FBQyxrQkEvQitDLGtCQUFrQixDQStCMUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7T0FDbEQsZUFBZSxHQUFHLGtCQWhDVSxtQkFBbUIsQ0FnQ0wsT0FBTyxFQUFFLENBQ2xELGtCQWpDZ0Qsa0JBQWtCLENBaUMzQyxPQUFPLEVBQzdCLGtCQW5DMkMsYUFBYSxDQW1DdEMsbUJBakNiLE1BQU0sRUFpQ2Msa0JBbkNILFVBQVUsQ0FtQ1EsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ25FLGVBQWUsR0FBRyxrQkFuQ1UsbUJBQW1CLENBbUNMLE9BQU8sRUFBRSxDQUNsRCxrQkFwQ2dELGtCQUFrQixDQW9DM0MsT0FBTyxFQUFFLGtCQXJDMkIsZ0JBQWdCLENBcUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDNUQsa0JBQWtCLEdBQUcsa0JBckNPLG1CQUFtQixDQXFDRixPQUFPLEVBQ25ELENBQUMsa0JBdEMrQyxrQkFBa0IsQ0FzQzFDLGFBQWEsRUFBRSxrQkF0QzVCLGNBQWMsRUFzQ2tDLENBQUMsQ0FBQyxDQUFDO09BQy9ELGNBQWMsR0FBRyxtQkF0Q1YsTUFBTSxFQXNDVyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUEiLCJmaWxlIjoiYXN0LWNvbnN0YW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBJZGVudGlmaWVyLCBMaXRlcmFsLCBOZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBSZXR1cm5TdGF0ZW1lbnQsXG5cdFN3aXRjaENhc2UsIFRoaXNFeHByZXNzaW9uLCBWYXJpYWJsZURlY2xhcmF0aW9uLCBWYXJpYWJsZURlY2xhcmF0b3J9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHttZW1iZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7dGhyb3dFcnJvckZyb21TdHJpbmd9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGNvbnN0XG5cdEdsb2JhbEVycm9yID0gbmV3IElkZW50aWZpZXIoJ0Vycm9yJyksXG5cdEdsb2JhbEluZmluaXR5ID0gbmV3IElkZW50aWZpZXIoJ0luZmluaXR5JyksXG5cdElkQXJndW1lbnRzID0gbmV3IElkZW50aWZpZXIoJ2FyZ3VtZW50cycpLFxuXHRJZEJ1aWx0ID0gbmV3IElkZW50aWZpZXIoJ2J1aWx0JyksXG5cdElkRXJyb3IgPSBuZXcgSWRlbnRpZmllcignRXJyb3InKSxcblx0SWRFeHBvcnRzID0gbmV3IElkZW50aWZpZXIoJ2V4cG9ydHMnKSxcblx0SWRFeHRyYWN0ID0gbmV3IElkZW50aWZpZXIoJ18kJyksXG5cdElkRm9jdXMgPSBuZXcgSWRlbnRpZmllcignXycpLFxuXHQvLyBUT0RPOkVTNiBTaG91bGRuJ3QgbmVlZCwganVzdCB1c2UgYXJyb3cgZnVuY3Rpb25zLlxuXHRJZExleGljYWxUaGlzID0gbmV3IElkZW50aWZpZXIoJ190aGlzJyksXG5cdElkU3VwZXIgPSBuZXcgSWRlbnRpZmllcignc3VwZXInKSxcblx0TGl0RW1wdHlBcnJheSA9IG5ldyBBcnJheUV4cHJlc3Npb24oW10pLFxuXHRMaXRFbXB0eVN0cmluZyA9IG5ldyBMaXRlcmFsKCcnKSxcblx0TGl0TnVsbCA9IG5ldyBMaXRlcmFsKG51bGwpLFxuXHRMaXRTdHJUaHJvdyA9IG5ldyBMaXRlcmFsKCdBbiBlcnJvciBvY2N1cnJlZC4nKSxcblx0TGl0VHJ1ZSA9IG5ldyBMaXRlcmFsKHRydWUpLFxuXHRMaXRaZXJvID0gbmV3IExpdGVyYWwoMCksXG5cdFJldHVybkJ1aWx0ID0gbmV3IFJldHVyblN0YXRlbWVudChJZEJ1aWx0KSxcblx0U3dpdGNoQ2FzZU5vTWF0Y2ggPSBuZXcgU3dpdGNoQ2FzZSh1bmRlZmluZWQsIFtcblx0XHR0aHJvd0Vycm9yRnJvbVN0cmluZygnTm8gYnJhbmNoIG9mIGBzd2l0Y2hgIG1hdGNoZXMuJyldKSxcblx0U3ltYm9sSXRlcmF0b3IgPSBtZW1iZXIobmV3IElkZW50aWZpZXIoJ1N5bWJvbCcpLCAnaXRlcmF0b3InKSxcblx0VGhyb3dBc3NlcnRGYWlsID0gdGhyb3dFcnJvckZyb21TdHJpbmcoJ0Fzc2VydGlvbiBmYWlsZWQuJyksXG5cdFRocm93Tm9DYXNlTWF0Y2ggPSB0aHJvd0Vycm9yRnJvbVN0cmluZygnTm8gYnJhbmNoIG9mIGBjYXNlYCBtYXRjaGVzLicpLFxuXG5cdEFycmF5U2xpY2VDYWxsID0gbWVtYmVyKG1lbWJlcihMaXRFbXB0eUFycmF5LCAnc2xpY2UnKSwgJ2NhbGwnKSxcblx0RGVjbGFyZUJ1aWx0QmFnID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0Jyxcblx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LCBMaXRFbXB0eUFycmF5KV0pLFxuXHREZWNsYXJlQnVpbHRNYXAgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LFxuXHRcdFx0bmV3IE5ld0V4cHJlc3Npb24obWVtYmVyKG5ldyBJZGVudGlmaWVyKCdnbG9iYWwnKSwgJ01hcCcpLCBbXSkpXSksXG5cdERlY2xhcmVCdWlsdE9iaiA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkQnVpbHQsIG5ldyBPYmplY3RFeHByZXNzaW9uKFtdKSldKSxcblx0RGVjbGFyZUxleGljYWxUaGlzID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0Jyxcblx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZExleGljYWxUaGlzLCBuZXcgVGhpc0V4cHJlc3Npb24oKSldKSxcblx0RXhwb3J0c0RlZmF1bHQgPSBtZW1iZXIoSWRFeHBvcnRzLCAnZGVmYXVsdCcpXG4iXX0=
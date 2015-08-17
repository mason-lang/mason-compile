if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', './util'], function (exports, _esastDistAst, _esastDistUtil, _util) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	const EmptyTemplateElement = (0, _util.templateElementForString)(''),
	      IdArguments = (0, _esastDistAst.Identifier)('arguments'),
	      IdBuilt = (0, _esastDistAst.Identifier)('built'),
	      IdDefine = (0, _esastDistAst.Identifier)('define'),
	      IdError = _util._IdError,
	      IdExports = (0, _esastDistAst.Identifier)('exports'),
	      IdExtract = (0, _esastDistAst.Identifier)('_$'),
	     
	// TODO:ES6 Shouldn't need, just use arrow functions.
	IdLexicalThis = (0, _esastDistAst.Identifier)('_this'),
	      LitEmptyArray = (0, _esastDistAst.ArrayExpression)([]),
	      LitEmptyString = (0, _esastDistAst.Literal)(''),
	      LitNull = (0, _esastDistAst.Literal)(null),
	      LitStrExports = (0, _esastDistAst.Literal)('exports'),
	      LitStrThrow = (0, _esastDistAst.Literal)('An error occurred.'),
	      LitTrue = (0, _esastDistAst.Literal)(true),
	      LitZero = (0, _esastDistAst.Literal)(0),
	      ReturnBuilt = (0, _esastDistAst.ReturnStatement)(IdBuilt),
	      ReturnExports = (0, _esastDistAst.ReturnStatement)(IdExports),
	      ReturnRes = (0, _esastDistAst.ReturnStatement)((0, _esastDistAst.Identifier)('res')),
	      SwitchCaseNoMatch = (0, _esastDistAst.SwitchCase)(undefined, [(0, _util.throwErrorFromString)('No branch of `switch` matches.')]),
	      SymbolIterator = (0, _esastDistUtil.member)((0, _esastDistAst.Identifier)('Symbol'), 'iterator'),
	      ThrowAssertFail = (0, _util.throwErrorFromString)('Assertion failed.'),
	      ThrowNoCaseMatch = (0, _util.throwErrorFromString)('No branch of `case` matches.'),
	      UseStrict = (0, _esastDistAst.ExpressionStatement)((0, _esastDistAst.Literal)('use strict')),
	      ArraySliceCall = (0, _esastDistUtil.member)((0, _esastDistUtil.member)(LitEmptyArray, 'slice'), 'call'),
	     
	// if (typeof define !== 'function') var define = require('amdefine')(module)
	AmdefineHeader = (0, _esastDistAst.IfStatement)((0, _esastDistAst.BinaryExpression)('!==', (0, _esastDistAst.UnaryExpression)('typeof', IdDefine), (0, _esastDistAst.Literal)('function')), (0, _esastDistAst.VariableDeclaration)('var', [(0, _esastDistAst.VariableDeclarator)(IdDefine, (0, _esastDistAst.CallExpression)((0, _esastDistAst.CallExpression)((0, _esastDistAst.Identifier)('require'), [(0, _esastDistAst.Literal)('amdefine')]), [(0, _esastDistAst.Identifier)('module')]))])),
	      DeclareBuiltBag = (0, _esastDistAst.VariableDeclaration)('const', [(0, _esastDistAst.VariableDeclarator)(IdBuilt, LitEmptyArray)]),
	      DeclareBuiltMap = (0, _esastDistAst.VariableDeclaration)('const', [(0, _esastDistAst.VariableDeclarator)(IdBuilt, (0, _esastDistAst.NewExpression)((0, _esastDistUtil.member)((0, _esastDistAst.Identifier)('global'), 'Map'), []))]),
	      DeclareBuiltObj = (0, _esastDistAst.VariableDeclaration)('const', [(0, _esastDistAst.VariableDeclarator)(IdBuilt, (0, _esastDistAst.ObjectExpression)([]))]),
	      ExportsDefault = (0, _esastDistUtil.member)(IdExports, 'default'),
	      ExportsGet = (0, _esastDistUtil.member)(IdExports, '_get');
	exports.EmptyTemplateElement = EmptyTemplateElement;
	exports.IdArguments = IdArguments;
	exports.IdBuilt = IdBuilt;
	exports.IdDefine = IdDefine;
	exports.IdError = IdError;
	exports.IdExports = IdExports;
	exports.IdExtract = IdExtract;
	exports.IdLexicalThis = IdLexicalThis;
	exports.LitEmptyArray = LitEmptyArray;
	exports.LitEmptyString = LitEmptyString;
	exports.LitNull = LitNull;
	exports.LitStrExports = LitStrExports;
	exports.LitStrThrow = LitStrThrow;
	exports.LitTrue = LitTrue;
	exports.LitZero = LitZero;
	exports.ReturnBuilt = ReturnBuilt;
	exports.ReturnExports = ReturnExports;
	exports.ReturnRes = ReturnRes;
	exports.SwitchCaseNoMatch = SwitchCaseNoMatch;
	exports.SymbolIterator = SymbolIterator;
	exports.ThrowAssertFail = ThrowAssertFail;
	exports.ThrowNoCaseMatch = ThrowNoCaseMatch;
	exports.UseStrict = UseStrict;
	exports.ArraySliceCall = ArraySliceCall;
	exports.AmdefineHeader = AmdefineHeader;
	exports.DeclareBuiltBag = DeclareBuiltBag;
	exports.DeclareBuiltMap = DeclareBuiltMap;
	exports.DeclareBuiltObj = DeclareBuiltObj;
	exports.ExportsDefault = ExportsDefault;
	exports.ExportsGet = ExportsGet;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvdHJhbnNwaWxlL2FzdC1jb25zdGFudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTU8sT0FDTixvQkFBb0IsR0FBRyxVQUhMLHdCQUF3QixFQUdNLEVBQUUsQ0FBQztPQUNuRCxXQUFXLEdBQUcsa0JBUmtFLFVBQVUsRUFRakUsV0FBVyxDQUFDO09BQ3JDLE9BQU8sR0FBRyxrQkFUc0UsVUFBVSxFQVNyRSxPQUFPLENBQUM7T0FDN0IsUUFBUSxHQUFHLGtCQVZxRSxVQUFVLEVBVXBFLFFBQVEsQ0FBQztPQUMvQixPQUFPLFNBUEMsUUFBUSxBQU9FO09BQ2xCLFNBQVMsR0FBRyxrQkFab0UsVUFBVSxFQVluRSxTQUFTLENBQUM7T0FDakMsU0FBUyxHQUFHLGtCQWJvRSxVQUFVLEVBYW5FLElBQUksQ0FBQzs7O0FBRTVCLGNBQWEsR0FBRyxrQkFmZ0UsVUFBVSxFQWUvRCxPQUFPLENBQUM7T0FDbkMsYUFBYSxHQUFHLGtCQWhCUixlQUFlLEVBZ0JTLEVBQUUsQ0FBQztPQUNuQyxjQUFjLEdBQUcsa0JBaEJKLE9BQU8sRUFnQkssRUFBRSxDQUFDO09BQzVCLE9BQU8sR0FBRyxrQkFqQkcsT0FBTyxFQWlCRixJQUFJLENBQUM7T0FDdkIsYUFBYSxHQUFHLGtCQWxCSCxPQUFPLEVBa0JJLFNBQVMsQ0FBQztPQUNsQyxXQUFXLEdBQUcsa0JBbkJELE9BQU8sRUFtQkUsb0JBQW9CLENBQUM7T0FDM0MsT0FBTyxHQUFHLGtCQXBCRyxPQUFPLEVBb0JGLElBQUksQ0FBQztPQUN2QixPQUFPLEdBQUcsa0JBckJHLE9BQU8sRUFxQkYsQ0FBQyxDQUFDO09BQ3BCLFdBQVcsR0FBRyxrQkF0QnlDLGVBQWUsRUFzQnhDLE9BQU8sQ0FBQztPQUN0QyxhQUFhLEdBQUcsa0JBdkJ1QyxlQUFlLEVBdUJ0QyxTQUFTLENBQUM7T0FDMUMsU0FBUyxHQUFHLGtCQXhCMkMsZUFBZSxFQXdCMUMsa0JBekJvRCxVQUFVLEVBeUJuRCxLQUFLLENBQUMsQ0FBQztPQUM5QyxpQkFBaUIsR0FBRyxrQkF6Qm9ELFVBQVUsRUF5Qm5ELFNBQVMsRUFBRSxDQUN6QyxVQXZCMkMsb0JBQW9CLEVBdUIxQyxnQ0FBZ0MsQ0FBQyxDQUFFLENBQUM7T0FDMUQsY0FBYyxHQUFHLG1CQXpCVCxNQUFNLEVBeUJVLGtCQTVCd0QsVUFBVSxFQTRCdkQsUUFBUSxDQUFDLEVBQUUsVUFBVSxDQUFDO09BQ3pELGVBQWUsR0FBRyxVQXpCMEIsb0JBQW9CLEVBeUJ6QixtQkFBbUIsQ0FBQztPQUMzRCxnQkFBZ0IsR0FBRyxVQTFCeUIsb0JBQW9CLEVBMEJ4Qiw4QkFBOEIsQ0FBQztPQUN2RSxTQUFTLEdBQUcsa0JBL0IrQyxtQkFBbUIsRUErQjlDLGtCQTlCbkIsT0FBTyxFQThCb0IsWUFBWSxDQUFDLENBQUM7T0FFdEQsY0FBYyxHQUFHLG1CQTlCVCxNQUFNLEVBOEJVLG1CQTlCaEIsTUFBTSxFQThCaUIsYUFBYSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE1BQU0sQ0FBQzs7O0FBRS9ELGVBQWMsR0FBRyxrQkFsQ2pCLFdBQVcsRUFtQ1Ysa0JBcEN3QixnQkFBZ0IsRUFvQ3ZCLEtBQUssRUFBRSxrQkFsQ3pCLGVBQWUsRUFrQzBCLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxrQkFuQ2pELE9BQU8sRUFtQ2tELFVBQVUsQ0FBQyxDQUFDLEVBQ2pGLGtCQW5DZ0IsbUJBQW1CLEVBbUNmLEtBQUssRUFBRSxDQUMxQixrQkFwQ29DLGtCQUFrQixFQW9DbkMsUUFBUSxFQUFFLGtCQXRDWSxjQUFjLEVBdUN0RCxrQkF2Q3dDLGNBQWMsRUF1Q3ZDLGtCQXZDOEQsVUFBVSxFQXVDN0QsU0FBUyxDQUFDLEVBQUUsQ0FBRSxrQkF0QzlCLE9BQU8sRUFzQytCLFVBQVUsQ0FBQyxDQUFFLENBQUMsRUFDOUQsQ0FBRSxrQkF4QzJFLFVBQVUsRUF3QzFFLFFBQVEsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFFLENBQUMsQ0FBQztPQUNqQyxlQUFlLEdBQUcsa0JBdkNELG1CQUFtQixFQXVDRSxPQUFPLEVBQUUsQ0FBRSxrQkF2Q1gsa0JBQWtCLEVBdUNZLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBRSxDQUFDO09BQzlGLGVBQWUsR0FBRyxrQkF4Q0QsbUJBQW1CLEVBd0NFLE9BQU8sRUFBRSxDQUM5QyxrQkF6Q3FDLGtCQUFrQixFQXlDcEMsT0FBTyxFQUN6QixrQkEzQ29CLGFBQWEsRUEyQ25CLG1CQXpDUixNQUFNLEVBeUNTLGtCQTVDeUQsVUFBVSxFQTRDeEQsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRyxDQUFDLENBQUMsQ0FBRSxDQUFDO09BQzdELGVBQWUsR0FBRyxrQkEzQ0QsbUJBQW1CLEVBMkNFLE9BQU8sRUFBRSxDQUM5QyxrQkE1Q3FDLGtCQUFrQixFQTRDcEMsT0FBTyxFQUFFLGtCQTdDUSxnQkFBZ0IsRUE2Q1AsRUFBRyxDQUFDLENBQUMsQ0FBRSxDQUFDO09BQ3RELGNBQWMsR0FBRyxtQkE1Q1QsTUFBTSxFQTRDVSxTQUFTLEVBQUUsU0FBUyxDQUFDO09BQzdDLFVBQVUsR0FBRyxtQkE3Q0wsTUFBTSxFQTZDTSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS90cmFuc3BpbGUvYXN0LWNvbnN0YW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFycmF5RXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbiwgQ2FsbEV4cHJlc3Npb24sIEV4cHJlc3Npb25TdGF0ZW1lbnQsIElkZW50aWZpZXIsXG5cdElmU3RhdGVtZW50LCBMaXRlcmFsLCBOZXdFeHByZXNzaW9uLCBPYmplY3RFeHByZXNzaW9uLCBSZXR1cm5TdGF0ZW1lbnQsIFN3aXRjaENhc2UsXG5cdFVuYXJ5RXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yIH0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQgeyBtZW1iZXIgfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQgeyBfSWRFcnJvciwgdGVtcGxhdGVFbGVtZW50Rm9yU3RyaW5nLCB0aHJvd0Vycm9yRnJvbVN0cmluZyB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGNvbnN0XG5cdEVtcHR5VGVtcGxhdGVFbGVtZW50ID0gdGVtcGxhdGVFbGVtZW50Rm9yU3RyaW5nKCcnKSxcblx0SWRBcmd1bWVudHMgPSBJZGVudGlmaWVyKCdhcmd1bWVudHMnKSxcblx0SWRCdWlsdCA9IElkZW50aWZpZXIoJ2J1aWx0JyksXG5cdElkRGVmaW5lID0gSWRlbnRpZmllcignZGVmaW5lJyksXG5cdElkRXJyb3IgPSBfSWRFcnJvcixcblx0SWRFeHBvcnRzID0gSWRlbnRpZmllcignZXhwb3J0cycpLFxuXHRJZEV4dHJhY3QgPSBJZGVudGlmaWVyKCdfJCcpLFxuXHQvLyBUT0RPOkVTNiBTaG91bGRuJ3QgbmVlZCwganVzdCB1c2UgYXJyb3cgZnVuY3Rpb25zLlxuXHRJZExleGljYWxUaGlzID0gSWRlbnRpZmllcignX3RoaXMnKSxcblx0TGl0RW1wdHlBcnJheSA9IEFycmF5RXhwcmVzc2lvbihbXSksXG5cdExpdEVtcHR5U3RyaW5nID0gTGl0ZXJhbCgnJyksXG5cdExpdE51bGwgPSBMaXRlcmFsKG51bGwpLFxuXHRMaXRTdHJFeHBvcnRzID0gTGl0ZXJhbCgnZXhwb3J0cycpLFxuXHRMaXRTdHJUaHJvdyA9IExpdGVyYWwoJ0FuIGVycm9yIG9jY3VycmVkLicpLFxuXHRMaXRUcnVlID0gTGl0ZXJhbCh0cnVlKSxcblx0TGl0WmVybyA9IExpdGVyYWwoMCksXG5cdFJldHVybkJ1aWx0ID0gUmV0dXJuU3RhdGVtZW50KElkQnVpbHQpLFxuXHRSZXR1cm5FeHBvcnRzID0gUmV0dXJuU3RhdGVtZW50KElkRXhwb3J0cyksXG5cdFJldHVyblJlcyA9IFJldHVyblN0YXRlbWVudChJZGVudGlmaWVyKCdyZXMnKSksXG5cdFN3aXRjaENhc2VOb01hdGNoID0gU3dpdGNoQ2FzZSh1bmRlZmluZWQsIFtcblx0XHR0aHJvd0Vycm9yRnJvbVN0cmluZygnTm8gYnJhbmNoIG9mIGBzd2l0Y2hgIG1hdGNoZXMuJykgXSksXG5cdFN5bWJvbEl0ZXJhdG9yID0gbWVtYmVyKElkZW50aWZpZXIoJ1N5bWJvbCcpLCAnaXRlcmF0b3InKSxcblx0VGhyb3dBc3NlcnRGYWlsID0gdGhyb3dFcnJvckZyb21TdHJpbmcoJ0Fzc2VydGlvbiBmYWlsZWQuJyksXG5cdFRocm93Tm9DYXNlTWF0Y2ggPSB0aHJvd0Vycm9yRnJvbVN0cmluZygnTm8gYnJhbmNoIG9mIGBjYXNlYCBtYXRjaGVzLicpLFxuXHRVc2VTdHJpY3QgPSBFeHByZXNzaW9uU3RhdGVtZW50KExpdGVyYWwoJ3VzZSBzdHJpY3QnKSksXG5cblx0QXJyYXlTbGljZUNhbGwgPSBtZW1iZXIobWVtYmVyKExpdEVtcHR5QXJyYXksICdzbGljZScpLCAnY2FsbCcpLFxuXHQvLyBpZiAodHlwZW9mIGRlZmluZSAhPT0gJ2Z1bmN0aW9uJykgdmFyIGRlZmluZSA9IHJlcXVpcmUoJ2FtZGVmaW5lJykobW9kdWxlKVxuXHRBbWRlZmluZUhlYWRlciA9IElmU3RhdGVtZW50KFxuXHRcdEJpbmFyeUV4cHJlc3Npb24oJyE9PScsIFVuYXJ5RXhwcmVzc2lvbigndHlwZW9mJywgSWREZWZpbmUpLCBMaXRlcmFsKCdmdW5jdGlvbicpKSxcblx0XHRWYXJpYWJsZURlY2xhcmF0aW9uKCd2YXInLCBbXG5cdFx0XHRWYXJpYWJsZURlY2xhcmF0b3IoSWREZWZpbmUsIENhbGxFeHByZXNzaW9uKFxuXHRcdFx0XHRDYWxsRXhwcmVzc2lvbihJZGVudGlmaWVyKCdyZXF1aXJlJyksIFsgTGl0ZXJhbCgnYW1kZWZpbmUnKSBdKSxcblx0XHRcdFx0WyBJZGVudGlmaWVyKCdtb2R1bGUnKSBdKSkgXSkpLFxuXHREZWNsYXJlQnVpbHRCYWcgPSBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFsgVmFyaWFibGVEZWNsYXJhdG9yKElkQnVpbHQsIExpdEVtcHR5QXJyYXkpIF0pLFxuXHREZWNsYXJlQnVpbHRNYXAgPSBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCxcblx0XHRcdE5ld0V4cHJlc3Npb24obWVtYmVyKElkZW50aWZpZXIoJ2dsb2JhbCcpLCAnTWFwJyksIFsgXSkpIF0pLFxuXHREZWNsYXJlQnVpbHRPYmogPSBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsIFtcblx0XHRWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCwgT2JqZWN0RXhwcmVzc2lvbihbIF0pKSBdKSxcblx0RXhwb3J0c0RlZmF1bHQgPSBtZW1iZXIoSWRFeHBvcnRzLCAnZGVmYXVsdCcpLFxuXHRFeHBvcnRzR2V0ID0gbWVtYmVyKElkRXhwb3J0cywgJ19nZXQnKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
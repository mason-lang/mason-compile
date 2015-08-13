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
	      IdFunctionApplyCall = (0, _esastDistUtil.member)((0, _esastDistUtil.member)((0, _esastDistAst.Identifier)('Function'), 'apply'), 'call'),
	     
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
	exports.IdFunctionApplyCall = IdFunctionApplyCall;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvdHJhbnNwaWxlL2FzdC1jb25zdGFudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBTU8sT0FDTixvQkFBb0IsR0FBRyxVQUhMLHdCQUF3QixFQUdNLEVBQUUsQ0FBQztPQUNuRCxXQUFXLEdBQUcsa0JBUmtFLFVBQVUsRUFRakUsV0FBVyxDQUFDO09BQ3JDLE9BQU8sR0FBRyxrQkFUc0UsVUFBVSxFQVNyRSxPQUFPLENBQUM7T0FDN0IsUUFBUSxHQUFHLGtCQVZxRSxVQUFVLEVBVXBFLFFBQVEsQ0FBQztPQUMvQixPQUFPLFNBUEMsUUFBUSxBQU9FO09BQ2xCLFNBQVMsR0FBRyxrQkFab0UsVUFBVSxFQVluRSxTQUFTLENBQUM7T0FDakMsU0FBUyxHQUFHLGtCQWJvRSxVQUFVLEVBYW5FLElBQUksQ0FBQztPQUM1QixtQkFBbUIsR0FBRyxtQkFYZCxNQUFNLEVBV2UsbUJBWHJCLE1BQU0sRUFXc0Isa0JBZDRDLFVBQVUsRUFjM0MsVUFBVSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDOzs7QUFFN0UsY0FBYSxHQUFHLGtCQWhCZ0UsVUFBVSxFQWdCL0QsT0FBTyxDQUFDO09BQ25DLGFBQWEsR0FBRyxrQkFqQlIsZUFBZSxFQWlCUyxFQUFFLENBQUM7T0FDbkMsY0FBYyxHQUFHLGtCQWpCSixPQUFPLEVBaUJLLEVBQUUsQ0FBQztPQUM1QixPQUFPLEdBQUcsa0JBbEJHLE9BQU8sRUFrQkYsSUFBSSxDQUFDO09BQ3ZCLGFBQWEsR0FBRyxrQkFuQkgsT0FBTyxFQW1CSSxTQUFTLENBQUM7T0FDbEMsV0FBVyxHQUFHLGtCQXBCRCxPQUFPLEVBb0JFLG9CQUFvQixDQUFDO09BQzNDLE9BQU8sR0FBRyxrQkFyQkcsT0FBTyxFQXFCRixJQUFJLENBQUM7T0FDdkIsT0FBTyxHQUFHLGtCQXRCRyxPQUFPLEVBc0JGLENBQUMsQ0FBQztPQUNwQixXQUFXLEdBQUcsa0JBdkJ5QyxlQUFlLEVBdUJ4QyxPQUFPLENBQUM7T0FDdEMsYUFBYSxHQUFHLGtCQXhCdUMsZUFBZSxFQXdCdEMsU0FBUyxDQUFDO09BQzFDLFNBQVMsR0FBRyxrQkF6QjJDLGVBQWUsRUF5QjFDLGtCQTFCb0QsVUFBVSxFQTBCbkQsS0FBSyxDQUFDLENBQUM7T0FDOUMsaUJBQWlCLEdBQUcsa0JBMUJvRCxVQUFVLEVBMEJuRCxTQUFTLEVBQUUsQ0FDekMsVUF4QjJDLG9CQUFvQixFQXdCMUMsZ0NBQWdDLENBQUMsQ0FBRSxDQUFDO09BQzFELGNBQWMsR0FBRyxtQkExQlQsTUFBTSxFQTBCVSxrQkE3QndELFVBQVUsRUE2QnZELFFBQVEsQ0FBQyxFQUFFLFVBQVUsQ0FBQztPQUN6RCxlQUFlLEdBQUcsVUExQjBCLG9CQUFvQixFQTBCekIsbUJBQW1CLENBQUM7T0FDM0QsZ0JBQWdCLEdBQUcsVUEzQnlCLG9CQUFvQixFQTJCeEIsOEJBQThCLENBQUM7T0FDdkUsU0FBUyxHQUFHLGtCQWhDK0MsbUJBQW1CLEVBZ0M5QyxrQkEvQm5CLE9BQU8sRUErQm9CLFlBQVksQ0FBQyxDQUFDO09BRXRELGNBQWMsR0FBRyxtQkEvQlQsTUFBTSxFQStCVSxtQkEvQmhCLE1BQU0sRUErQmlCLGFBQWEsRUFBRSxPQUFPLENBQUMsRUFBRSxNQUFNLENBQUM7OztBQUUvRCxlQUFjLEdBQUcsa0JBbkNqQixXQUFXLEVBb0NWLGtCQXJDd0IsZ0JBQWdCLEVBcUN2QixLQUFLLEVBQUUsa0JBbkN6QixlQUFlLEVBbUMwQixRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsa0JBcENqRCxPQUFPLEVBb0NrRCxVQUFVLENBQUMsQ0FBQyxFQUNqRixrQkFwQ2dCLG1CQUFtQixFQW9DZixLQUFLLEVBQUUsQ0FDMUIsa0JBckNvQyxrQkFBa0IsRUFxQ25DLFFBQVEsRUFBRSxrQkF2Q1ksY0FBYyxFQXdDdEQsa0JBeEN3QyxjQUFjLEVBd0N2QyxrQkF4QzhELFVBQVUsRUF3QzdELFNBQVMsQ0FBQyxFQUFFLENBQUUsa0JBdkM5QixPQUFPLEVBdUMrQixVQUFVLENBQUMsQ0FBRSxDQUFDLEVBQzlELENBQUUsa0JBekMyRSxVQUFVLEVBeUMxRSxRQUFRLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBRSxDQUFDLENBQUM7T0FDakMsZUFBZSxHQUFHLGtCQXhDRCxtQkFBbUIsRUF3Q0UsT0FBTyxFQUFFLENBQUUsa0JBeENYLGtCQUFrQixFQXdDWSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUUsQ0FBQztPQUM5RixlQUFlLEdBQUcsa0JBekNELG1CQUFtQixFQXlDRSxPQUFPLEVBQUUsQ0FDOUMsa0JBMUNxQyxrQkFBa0IsRUEwQ3BDLE9BQU8sRUFDekIsa0JBNUNvQixhQUFhLEVBNENuQixtQkExQ1IsTUFBTSxFQTBDUyxrQkE3Q3lELFVBQVUsRUE2Q3hELFFBQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUcsQ0FBQyxDQUFDLENBQUUsQ0FBQztPQUM3RCxlQUFlLEdBQUcsa0JBNUNELG1CQUFtQixFQTRDRSxPQUFPLEVBQUUsQ0FDOUMsa0JBN0NxQyxrQkFBa0IsRUE2Q3BDLE9BQU8sRUFBRSxrQkE5Q1EsZ0JBQWdCLEVBOENQLEVBQUcsQ0FBQyxDQUFDLENBQUUsQ0FBQztPQUN0RCxjQUFjLEdBQUcsbUJBN0NULE1BQU0sRUE2Q1UsU0FBUyxFQUFFLFNBQVMsQ0FBQztPQUM3QyxVQUFVLEdBQUcsbUJBOUNMLE1BQU0sRUE4Q00sU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvdHJhbnNwaWxlL2FzdC1jb25zdGFudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcnJheUV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sIENhbGxFeHByZXNzaW9uLCBFeHByZXNzaW9uU3RhdGVtZW50LCBJZGVudGlmaWVyLFxuXHRJZlN0YXRlbWVudCwgTGl0ZXJhbCwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUmV0dXJuU3RhdGVtZW50LCBTd2l0Y2hDYXNlLFxuXHRVbmFyeUV4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlRGVjbGFyYXRvciB9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHsgbWVtYmVyIH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHsgX0lkRXJyb3IsIHRlbXBsYXRlRWxlbWVudEZvclN0cmluZywgdGhyb3dFcnJvckZyb21TdHJpbmcgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjb25zdFxuXHRFbXB0eVRlbXBsYXRlRWxlbWVudCA9IHRlbXBsYXRlRWxlbWVudEZvclN0cmluZygnJyksXG5cdElkQXJndW1lbnRzID0gSWRlbnRpZmllcignYXJndW1lbnRzJyksXG5cdElkQnVpbHQgPSBJZGVudGlmaWVyKCdidWlsdCcpLFxuXHRJZERlZmluZSA9IElkZW50aWZpZXIoJ2RlZmluZScpLFxuXHRJZEVycm9yID0gX0lkRXJyb3IsXG5cdElkRXhwb3J0cyA9IElkZW50aWZpZXIoJ2V4cG9ydHMnKSxcblx0SWRFeHRyYWN0ID0gSWRlbnRpZmllcignXyQnKSxcblx0SWRGdW5jdGlvbkFwcGx5Q2FsbCA9IG1lbWJlcihtZW1iZXIoSWRlbnRpZmllcignRnVuY3Rpb24nKSwgJ2FwcGx5JyksICdjYWxsJyksXG5cdC8vIFRPRE86RVM2IFNob3VsZG4ndCBuZWVkLCBqdXN0IHVzZSBhcnJvdyBmdW5jdGlvbnMuXG5cdElkTGV4aWNhbFRoaXMgPSBJZGVudGlmaWVyKCdfdGhpcycpLFxuXHRMaXRFbXB0eUFycmF5ID0gQXJyYXlFeHByZXNzaW9uKFtdKSxcblx0TGl0RW1wdHlTdHJpbmcgPSBMaXRlcmFsKCcnKSxcblx0TGl0TnVsbCA9IExpdGVyYWwobnVsbCksXG5cdExpdFN0ckV4cG9ydHMgPSBMaXRlcmFsKCdleHBvcnRzJyksXG5cdExpdFN0clRocm93ID0gTGl0ZXJhbCgnQW4gZXJyb3Igb2NjdXJyZWQuJyksXG5cdExpdFRydWUgPSBMaXRlcmFsKHRydWUpLFxuXHRMaXRaZXJvID0gTGl0ZXJhbCgwKSxcblx0UmV0dXJuQnVpbHQgPSBSZXR1cm5TdGF0ZW1lbnQoSWRCdWlsdCksXG5cdFJldHVybkV4cG9ydHMgPSBSZXR1cm5TdGF0ZW1lbnQoSWRFeHBvcnRzKSxcblx0UmV0dXJuUmVzID0gUmV0dXJuU3RhdGVtZW50KElkZW50aWZpZXIoJ3JlcycpKSxcblx0U3dpdGNoQ2FzZU5vTWF0Y2ggPSBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgW1xuXHRcdHRocm93RXJyb3JGcm9tU3RyaW5nKCdObyBicmFuY2ggb2YgYHN3aXRjaGAgbWF0Y2hlcy4nKSBdKSxcblx0U3ltYm9sSXRlcmF0b3IgPSBtZW1iZXIoSWRlbnRpZmllcignU3ltYm9sJyksICdpdGVyYXRvcicpLFxuXHRUaHJvd0Fzc2VydEZhaWwgPSB0aHJvd0Vycm9yRnJvbVN0cmluZygnQXNzZXJ0aW9uIGZhaWxlZC4nKSxcblx0VGhyb3dOb0Nhc2VNYXRjaCA9IHRocm93RXJyb3JGcm9tU3RyaW5nKCdObyBicmFuY2ggb2YgYGNhc2VgIG1hdGNoZXMuJyksXG5cdFVzZVN0cmljdCA9IEV4cHJlc3Npb25TdGF0ZW1lbnQoTGl0ZXJhbCgndXNlIHN0cmljdCcpKSxcblxuXHRBcnJheVNsaWNlQ2FsbCA9IG1lbWJlcihtZW1iZXIoTGl0RW1wdHlBcnJheSwgJ3NsaWNlJyksICdjYWxsJyksXG5cdC8vIGlmICh0eXBlb2YgZGVmaW5lICE9PSAnZnVuY3Rpb24nKSB2YXIgZGVmaW5lID0gcmVxdWlyZSgnYW1kZWZpbmUnKShtb2R1bGUpXG5cdEFtZGVmaW5lSGVhZGVyID0gSWZTdGF0ZW1lbnQoXG5cdFx0QmluYXJ5RXhwcmVzc2lvbignIT09JywgVW5hcnlFeHByZXNzaW9uKCd0eXBlb2YnLCBJZERlZmluZSksIExpdGVyYWwoJ2Z1bmN0aW9uJykpLFxuXHRcdFZhcmlhYmxlRGVjbGFyYXRpb24oJ3ZhcicsIFtcblx0XHRcdFZhcmlhYmxlRGVjbGFyYXRvcihJZERlZmluZSwgQ2FsbEV4cHJlc3Npb24oXG5cdFx0XHRcdENhbGxFeHByZXNzaW9uKElkZW50aWZpZXIoJ3JlcXVpcmUnKSwgWyBMaXRlcmFsKCdhbWRlZmluZScpIF0pLFxuXHRcdFx0XHRbIElkZW50aWZpZXIoJ21vZHVsZScpIF0pKSBdKSksXG5cdERlY2xhcmVCdWlsdEJhZyA9IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgWyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCwgTGl0RW1wdHlBcnJheSkgXSksXG5cdERlY2xhcmVCdWlsdE1hcCA9IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LFxuXHRcdFx0TmV3RXhwcmVzc2lvbihtZW1iZXIoSWRlbnRpZmllcignZ2xvYmFsJyksICdNYXAnKSwgWyBdKSkgXSksXG5cdERlY2xhcmVCdWlsdE9iaiA9IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LCBPYmplY3RFeHByZXNzaW9uKFsgXSkpIF0pLFxuXHRFeHBvcnRzRGVmYXVsdCA9IG1lbWJlcihJZEV4cG9ydHMsICdkZWZhdWx0JyksXG5cdEV4cG9ydHNHZXQgPSBtZW1iZXIoSWRFeHBvcnRzLCAnX2dldCcpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
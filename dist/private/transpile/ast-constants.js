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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9hc3QtY29uc3RhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtPLE9BQ04sV0FBVyxHQUFHLGtCQU5VLFVBQVUsQ0FNTCxPQUFPLENBQUM7T0FDckMsV0FBVyxHQUFHLGtCQVBVLFVBQVUsQ0FPTCxXQUFXLENBQUM7T0FDekMsT0FBTyxHQUFHLGtCQVJjLFVBQVUsQ0FRVCxPQUFPLENBQUM7T0FDakMsT0FBTyxHQUFHLGtCQVRjLFVBQVUsQ0FTVCxPQUFPLENBQUM7T0FDakMsU0FBUyxHQUFHLGtCQVZZLFVBQVUsQ0FVUCxTQUFTLENBQUM7T0FDckMsU0FBUyxHQUFHLGtCQVhZLFVBQVUsQ0FXUCxJQUFJLENBQUM7T0FDaEMsT0FBTyxHQUFHLGtCQVpjLFVBQVUsQ0FZVCxHQUFHLENBQUM7OztBQUU3QixjQUFhLEdBQUcsa0JBZFEsVUFBVSxDQWNILE9BQU8sQ0FBQztPQUN2QyxPQUFPLEdBQUcsa0JBZmMsVUFBVSxDQWVULE9BQU8sQ0FBQztPQUNqQyxhQUFhLEdBQUcsa0JBaEJULGVBQWUsQ0FnQmMsRUFBRSxDQUFDO09BQ3ZDLGNBQWMsR0FBRyxrQkFqQm1CLE9BQU8sQ0FpQmQsRUFBRSxDQUFDO09BQ2hDLE9BQU8sR0FBRyxrQkFsQjBCLE9BQU8sQ0FrQnJCLElBQUksQ0FBQztPQUMzQixXQUFXLEdBQUcsa0JBbkJzQixPQUFPLENBbUJqQixvQkFBb0IsQ0FBQztPQUMvQyxPQUFPLEdBQUcsa0JBcEIwQixPQUFPLENBb0JyQixJQUFJLENBQUM7T0FDM0IsT0FBTyxHQUFHLGtCQXJCMEIsT0FBTyxDQXFCckIsQ0FBQyxDQUFDO09BQ3hCLFdBQVcsR0FBRyxrQkF0QmdFLGVBQWUsQ0FzQjNELE9BQU8sQ0FBQztPQUMxQyxpQkFBaUIsR0FBRyxrQkF0QnBCLFVBQVUsQ0FzQnlCLFNBQVMsRUFBRSxDQUM3QyxVQXJCTSxvQkFBb0IsRUFxQkwsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO09BQ3pELGNBQWMsR0FBRyxtQkF2QlYsTUFBTSxFQXVCVyxrQkF6QkEsVUFBVSxDQXlCSyxRQUFRLENBQUMsRUFBRSxVQUFVLENBQUM7T0FDN0QsZUFBZSxHQUFHLFVBdkJYLG9CQUFvQixFQXVCWSxtQkFBbUIsQ0FBQztPQUMzRCxnQkFBZ0IsR0FBRyxVQXhCWixvQkFBb0IsRUF3QmEsOEJBQThCLENBQUM7T0FFdkUsY0FBYyxHQUFHLG1CQTNCVixNQUFNLEVBMkJXLG1CQTNCakIsTUFBTSxFQTJCa0IsYUFBYSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE1BQU0sQ0FBQztPQUMvRCxlQUFlLEdBQUcsa0JBN0JVLG1CQUFtQixDQTZCTCxPQUFPLEVBQ2hELENBQUMsa0JBOUIrQyxrQkFBa0IsQ0E4QjFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO09BQ2xELGVBQWUsR0FBRyxrQkEvQlUsbUJBQW1CLENBK0JMLE9BQU8sRUFBRSxDQUNsRCxrQkFoQ2dELGtCQUFrQixDQWdDM0MsT0FBTyxFQUM3QixrQkFsQzJDLGFBQWEsQ0FrQ3RDLG1CQWhDYixNQUFNLEVBZ0NjLGtCQWxDSCxVQUFVLENBa0NRLFFBQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNuRSxlQUFlLEdBQUcsa0JBbENVLG1CQUFtQixDQWtDTCxPQUFPLEVBQUUsQ0FDbEQsa0JBbkNnRCxrQkFBa0IsQ0FtQzNDLE9BQU8sRUFBRSxrQkFwQzJCLGdCQUFnQixDQW9DdEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzVELGtCQUFrQixHQUFHLGtCQXBDTyxtQkFBbUIsQ0FvQ0YsT0FBTyxFQUNuRCxDQUFDLGtCQXJDK0Msa0JBQWtCLENBcUMxQyxhQUFhLEVBQUUsa0JBckM1QixjQUFjLEVBcUNrQyxDQUFDLENBQUMsQ0FBQztPQUMvRCxjQUFjLEdBQUcsbUJBckNWLE1BQU0sRUFxQ1csU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFBIiwiZmlsZSI6ImFzdC1jb25zdGFudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTGl0ZXJhbCwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUmV0dXJuU3RhdGVtZW50LFxuXHRTd2l0Y2hDYXNlLCBUaGlzRXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7bWVtYmVyfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge3Rocm93RXJyb3JGcm9tU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjb25zdFxuXHRHbG9iYWxFcnJvciA9IG5ldyBJZGVudGlmaWVyKCdFcnJvcicpLFxuXHRJZEFyZ3VtZW50cyA9IG5ldyBJZGVudGlmaWVyKCdhcmd1bWVudHMnKSxcblx0SWRCdWlsdCA9IG5ldyBJZGVudGlmaWVyKCdidWlsdCcpLFxuXHRJZEVycm9yID0gbmV3IElkZW50aWZpZXIoJ0Vycm9yJyksXG5cdElkRXhwb3J0cyA9IG5ldyBJZGVudGlmaWVyKCdleHBvcnRzJyksXG5cdElkRXh0cmFjdCA9IG5ldyBJZGVudGlmaWVyKCdfJCcpLFxuXHRJZEZvY3VzID0gbmV3IElkZW50aWZpZXIoJ18nKSxcblx0Ly8gVE9ETzpFUzYgU2hvdWxkbid0IG5lZWQsIGp1c3QgdXNlIGFycm93IGZ1bmN0aW9ucy5cblx0SWRMZXhpY2FsVGhpcyA9IG5ldyBJZGVudGlmaWVyKCdfdGhpcycpLFxuXHRJZFN1cGVyID0gbmV3IElkZW50aWZpZXIoJ3N1cGVyJyksXG5cdExpdEVtcHR5QXJyYXkgPSBuZXcgQXJyYXlFeHByZXNzaW9uKFtdKSxcblx0TGl0RW1wdHlTdHJpbmcgPSBuZXcgTGl0ZXJhbCgnJyksXG5cdExpdE51bGwgPSBuZXcgTGl0ZXJhbChudWxsKSxcblx0TGl0U3RyVGhyb3cgPSBuZXcgTGl0ZXJhbCgnQW4gZXJyb3Igb2NjdXJyZWQuJyksXG5cdExpdFRydWUgPSBuZXcgTGl0ZXJhbCh0cnVlKSxcblx0TGl0WmVybyA9IG5ldyBMaXRlcmFsKDApLFxuXHRSZXR1cm5CdWlsdCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoSWRCdWlsdCksXG5cdFN3aXRjaENhc2VOb01hdGNoID0gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCBbXG5cdFx0dGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgc3dpdGNoYCBtYXRjaGVzLicpXSksXG5cdFN5bWJvbEl0ZXJhdG9yID0gbWVtYmVyKG5ldyBJZGVudGlmaWVyKCdTeW1ib2wnKSwgJ2l0ZXJhdG9yJyksXG5cdFRocm93QXNzZXJ0RmFpbCA9IHRocm93RXJyb3JGcm9tU3RyaW5nKCdBc3NlcnRpb24gZmFpbGVkLicpLFxuXHRUaHJvd05vQ2FzZU1hdGNoID0gdGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgY2FzZWAgbWF0Y2hlcy4nKSxcblxuXHRBcnJheVNsaWNlQ2FsbCA9IG1lbWJlcihtZW1iZXIoTGl0RW1wdHlBcnJheSwgJ3NsaWNlJyksICdjYWxsJyksXG5cdERlY2xhcmVCdWlsdEJhZyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCwgTGl0RW1wdHlBcnJheSldKSxcblx0RGVjbGFyZUJ1aWx0TWFwID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCxcblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKG1lbWJlcihuZXcgSWRlbnRpZmllcignZ2xvYmFsJyksICdNYXAnKSwgW10pKV0pLFxuXHREZWNsYXJlQnVpbHRPYmogPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LCBuZXcgT2JqZWN0RXhwcmVzc2lvbihbXSkpXSksXG5cdERlY2xhcmVMZXhpY2FsVGhpcyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRMZXhpY2FsVGhpcywgbmV3IFRoaXNFeHByZXNzaW9uKCkpXSksXG5cdEV4cG9ydHNEZWZhdWx0ID0gbWVtYmVyKElkRXhwb3J0cywgJ2RlZmF1bHQnKVxuIl19
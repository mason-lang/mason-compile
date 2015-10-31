'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.util);
		global.astConstants = mod.exports;
	}
})(this, function (exports, _ast, _util, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.ExportsDefault = exports.DeclareLexicalThis = exports.DeclareBuiltObj = exports.DeclareBuiltMap = exports.DeclareBuiltBag = exports.ArraySliceCall = exports.ThrowNoCaseMatch = exports.ThrowAssertFail = exports.SymbolIterator = exports.SwitchCaseNoMatch = exports.ReturnBuilt = exports.LitZero = exports.LitTrue = exports.LitStrThrow = exports.LitNull = exports.LitEmptyString = exports.LitEmptyArray = exports.IdSuper = exports.IdLexicalThis = exports.IdFocus = exports.IdExtract = exports.IdExports = exports.IdError = exports.IdBuilt = exports.IdArguments = exports.GlobalInfinity = exports.GlobalError = undefined;
	const GlobalError = exports.GlobalError = new _ast.Identifier('Error'),
	      GlobalInfinity = exports.GlobalInfinity = new _ast.Identifier('Infinity'),
	      IdArguments = exports.IdArguments = new _ast.Identifier('arguments'),
	      IdBuilt = exports.IdBuilt = new _ast.Identifier('built'),
	      IdError = exports.IdError = new _ast.Identifier('Error'),
	      IdExports = exports.IdExports = new _ast.Identifier('exports'),
	      IdExtract = exports.IdExtract = new _ast.Identifier('_$'),
	      IdFocus = exports.IdFocus = new _ast.Identifier('_'),
	      IdLexicalThis = exports.IdLexicalThis = new _ast.Identifier('_this'),
	      IdSuper = exports.IdSuper = new _ast.Identifier('super'),
	      LitEmptyArray = exports.LitEmptyArray = new _ast.ArrayExpression([]),
	      LitEmptyString = exports.LitEmptyString = new _ast.Literal(''),
	      LitNull = exports.LitNull = new _ast.Literal(null),
	      LitStrThrow = exports.LitStrThrow = new _ast.Literal('An error occurred.'),
	      LitTrue = exports.LitTrue = new _ast.Literal(true),
	      LitZero = exports.LitZero = new _ast.Literal(0),
	      ReturnBuilt = exports.ReturnBuilt = new _ast.ReturnStatement(IdBuilt),
	      SwitchCaseNoMatch = exports.SwitchCaseNoMatch = new _ast.SwitchCase(undefined, [(0, _util2.throwErrorFromString)('No branch of `switch` matches.')]),
	      SymbolIterator = exports.SymbolIterator = (0, _util.member)(new _ast.Identifier('Symbol'), 'iterator'),
	      ThrowAssertFail = exports.ThrowAssertFail = (0, _util2.throwErrorFromString)('Assertion failed.'),
	      ThrowNoCaseMatch = exports.ThrowNoCaseMatch = (0, _util2.throwErrorFromString)('No branch of `case` matches.'),
	      ArraySliceCall = exports.ArraySliceCall = (0, _util.member)((0, _util.member)(LitEmptyArray, 'slice'), 'call'),
	      DeclareBuiltBag = exports.DeclareBuiltBag = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(IdBuilt, LitEmptyArray)]),
	      DeclareBuiltMap = exports.DeclareBuiltMap = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(IdBuilt, new _ast.NewExpression((0, _util.member)(new _ast.Identifier('global'), 'Map'), []))]),
	      DeclareBuiltObj = exports.DeclareBuiltObj = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(IdBuilt, new _ast.ObjectExpression([]))]),
	      DeclareLexicalThis = exports.DeclareLexicalThis = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(IdLexicalThis, new _ast.ThisExpression())]),
	      ExportsDefault = exports.ExportsDefault = (0, _util.member)(IdExports, 'default');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9hc3QtY29uc3RhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FNQyxXQUFXLFdBQVgsV0FBVyxHQUFHLFNBTlUsVUFBVSxDQU1MLE9BQU8sQ0FBQztPQUNyQyxjQUFjLFdBQWQsY0FBYyxHQUFHLFNBUE8sVUFBVSxDQU9GLFVBQVUsQ0FBQztPQUMzQyxXQUFXLFdBQVgsV0FBVyxHQUFHLFNBUlUsVUFBVSxDQVFMLFdBQVcsQ0FBQztPQUN6QyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBVGMsVUFBVSxDQVNULE9BQU8sQ0FBQztPQUNqQyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBVmMsVUFBVSxDQVVULE9BQU8sQ0FBQztPQUNqQyxTQUFTLFdBQVQsU0FBUyxHQUFHLFNBWFksVUFBVSxDQVdQLFNBQVMsQ0FBQztPQUNyQyxTQUFTLFdBQVQsU0FBUyxHQUFHLFNBWlksVUFBVSxDQVlQLElBQUksQ0FBQztPQUNoQyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBYmMsVUFBVSxDQWFULEdBQUcsQ0FBQztPQUU3QixhQUFhLFdBQWIsYUFBYSxHQUFHLFNBZlEsVUFBVSxDQWVILE9BQU8sQ0FBQztPQUN2QyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBaEJjLFVBQVUsQ0FnQlQsT0FBTyxDQUFDO09BQ2pDLGFBQWEsV0FBYixhQUFhLEdBQUcsU0FqQlQsZUFBZSxDQWlCYyxFQUFFLENBQUM7T0FDdkMsY0FBYyxXQUFkLGNBQWMsR0FBRyxTQWxCbUIsT0FBTyxDQWtCZCxFQUFFLENBQUM7T0FDaEMsT0FBTyxXQUFQLE9BQU8sR0FBRyxTQW5CMEIsT0FBTyxDQW1CckIsSUFBSSxDQUFDO09BQzNCLFdBQVcsV0FBWCxXQUFXLEdBQUcsU0FwQnNCLE9BQU8sQ0FvQmpCLG9CQUFvQixDQUFDO09BQy9DLE9BQU8sV0FBUCxPQUFPLEdBQUcsU0FyQjBCLE9BQU8sQ0FxQnJCLElBQUksQ0FBQztPQUMzQixPQUFPLFdBQVAsT0FBTyxHQUFHLFNBdEIwQixPQUFPLENBc0JyQixDQUFDLENBQUM7T0FDeEIsV0FBVyxXQUFYLFdBQVcsR0FBRyxTQXZCZ0UsZUFBZSxDQXVCM0QsT0FBTyxDQUFDO09BQzFDLGlCQUFpQixXQUFqQixpQkFBaUIsR0FBRyxTQXZCcEIsVUFBVSxDQXVCeUIsU0FBUyxFQUFFLENBQzdDLFdBdEJNLG9CQUFvQixFQXNCTCxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7T0FDekQsY0FBYyxXQUFkLGNBQWMsR0FBRyxVQXhCVixNQUFNLEVBd0JXLFNBMUJBLFVBQVUsQ0EwQkssUUFBUSxDQUFDLEVBQUUsVUFBVSxDQUFDO09BQzdELGVBQWUsV0FBZixlQUFlLEdBQUcsV0F4Qlgsb0JBQW9CLEVBd0JZLG1CQUFtQixDQUFDO09BQzNELGdCQUFnQixXQUFoQixnQkFBZ0IsR0FBRyxXQXpCWixvQkFBb0IsRUF5QmEsOEJBQThCLENBQUM7T0FFdkUsY0FBYyxXQUFkLGNBQWMsR0FBRyxVQTVCVixNQUFNLEVBNEJXLFVBNUJqQixNQUFNLEVBNEJrQixhQUFhLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxDQUFDO09BQy9ELGVBQWUsV0FBZixlQUFlLEdBQUcsU0E5QlUsbUJBQW1CLENBOEJMLE9BQU8sRUFDaEQsQ0FBQyxTQS9CK0Msa0JBQWtCLENBK0IxQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztPQUNsRCxlQUFlLFdBQWYsZUFBZSxHQUFHLFNBaENVLG1CQUFtQixDQWdDTCxPQUFPLEVBQUUsQ0FDbEQsU0FqQ2dELGtCQUFrQixDQWlDM0MsT0FBTyxFQUM3QixTQW5DMkMsYUFBYSxDQW1DdEMsVUFqQ2IsTUFBTSxFQWlDYyxTQW5DSCxVQUFVLENBbUNRLFFBQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNuRSxlQUFlLFdBQWYsZUFBZSxHQUFHLFNBbkNVLG1CQUFtQixDQW1DTCxPQUFPLEVBQUUsQ0FDbEQsU0FwQ2dELGtCQUFrQixDQW9DM0MsT0FBTyxFQUFFLFNBckMyQixnQkFBZ0IsQ0FxQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUM1RCxrQkFBa0IsV0FBbEIsa0JBQWtCLEdBQUcsU0FyQ08sbUJBQW1CLENBcUNGLE9BQU8sRUFDbkQsQ0FBQyxTQXRDK0Msa0JBQWtCLENBc0MxQyxhQUFhLEVBQUUsU0F0QzVCLGNBQWMsRUFzQ2tDLENBQUMsQ0FBQyxDQUFDO09BQy9ELGNBQWMsV0FBZCxjQUFjLEdBQUcsVUF0Q1YsTUFBTSxFQXNDVyxTQUFTLEVBQUUsU0FBUyxDQUFDIiwiZmlsZSI6ImFzdC1jb25zdGFudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTGl0ZXJhbCwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUmV0dXJuU3RhdGVtZW50LFxuXHRTd2l0Y2hDYXNlLCBUaGlzRXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7bWVtYmVyfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge3Rocm93RXJyb3JGcm9tU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjb25zdFxuXHRHbG9iYWxFcnJvciA9IG5ldyBJZGVudGlmaWVyKCdFcnJvcicpLFxuXHRHbG9iYWxJbmZpbml0eSA9IG5ldyBJZGVudGlmaWVyKCdJbmZpbml0eScpLFxuXHRJZEFyZ3VtZW50cyA9IG5ldyBJZGVudGlmaWVyKCdhcmd1bWVudHMnKSxcblx0SWRCdWlsdCA9IG5ldyBJZGVudGlmaWVyKCdidWlsdCcpLFxuXHRJZEVycm9yID0gbmV3IElkZW50aWZpZXIoJ0Vycm9yJyksXG5cdElkRXhwb3J0cyA9IG5ldyBJZGVudGlmaWVyKCdleHBvcnRzJyksXG5cdElkRXh0cmFjdCA9IG5ldyBJZGVudGlmaWVyKCdfJCcpLFxuXHRJZEZvY3VzID0gbmV3IElkZW50aWZpZXIoJ18nKSxcblx0Ly8gVE9ETzpFUzYgU2hvdWxkbid0IG5lZWQsIGp1c3QgdXNlIGFycm93IGZ1bmN0aW9ucy5cblx0SWRMZXhpY2FsVGhpcyA9IG5ldyBJZGVudGlmaWVyKCdfdGhpcycpLFxuXHRJZFN1cGVyID0gbmV3IElkZW50aWZpZXIoJ3N1cGVyJyksXG5cdExpdEVtcHR5QXJyYXkgPSBuZXcgQXJyYXlFeHByZXNzaW9uKFtdKSxcblx0TGl0RW1wdHlTdHJpbmcgPSBuZXcgTGl0ZXJhbCgnJyksXG5cdExpdE51bGwgPSBuZXcgTGl0ZXJhbChudWxsKSxcblx0TGl0U3RyVGhyb3cgPSBuZXcgTGl0ZXJhbCgnQW4gZXJyb3Igb2NjdXJyZWQuJyksXG5cdExpdFRydWUgPSBuZXcgTGl0ZXJhbCh0cnVlKSxcblx0TGl0WmVybyA9IG5ldyBMaXRlcmFsKDApLFxuXHRSZXR1cm5CdWlsdCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoSWRCdWlsdCksXG5cdFN3aXRjaENhc2VOb01hdGNoID0gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCBbXG5cdFx0dGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgc3dpdGNoYCBtYXRjaGVzLicpXSksXG5cdFN5bWJvbEl0ZXJhdG9yID0gbWVtYmVyKG5ldyBJZGVudGlmaWVyKCdTeW1ib2wnKSwgJ2l0ZXJhdG9yJyksXG5cdFRocm93QXNzZXJ0RmFpbCA9IHRocm93RXJyb3JGcm9tU3RyaW5nKCdBc3NlcnRpb24gZmFpbGVkLicpLFxuXHRUaHJvd05vQ2FzZU1hdGNoID0gdGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgY2FzZWAgbWF0Y2hlcy4nKSxcblxuXHRBcnJheVNsaWNlQ2FsbCA9IG1lbWJlcihtZW1iZXIoTGl0RW1wdHlBcnJheSwgJ3NsaWNlJyksICdjYWxsJyksXG5cdERlY2xhcmVCdWlsdEJhZyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCwgTGl0RW1wdHlBcnJheSldKSxcblx0RGVjbGFyZUJ1aWx0TWFwID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCxcblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKG1lbWJlcihuZXcgSWRlbnRpZmllcignZ2xvYmFsJyksICdNYXAnKSwgW10pKV0pLFxuXHREZWNsYXJlQnVpbHRPYmogPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LCBuZXcgT2JqZWN0RXhwcmVzc2lvbihbXSkpXSksXG5cdERlY2xhcmVMZXhpY2FsVGhpcyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRMZXhpY2FsVGhpcywgbmV3IFRoaXNFeHByZXNzaW9uKCkpXSksXG5cdEV4cG9ydHNEZWZhdWx0ID0gbWVtYmVyKElkRXhwb3J0cywgJ2RlZmF1bHQnKVxuIl19
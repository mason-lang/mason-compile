if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/ast', 'esast/dist/util', './util'], function (exports, _esastDistAst, _esastDistUtil, _util) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzdC1jb25zdGFudHMuanMiLCJwcml2YXRlL3RyYW5zcGlsZS9hc3QtY29uc3RhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNLTyxPQUNOLFdBQVcsR0FBRyxrQkFOVSxVQUFVLENBTUwsT0FBTyxDQUFDO09BQ3JDLFdBQVcsR0FBRyxrQkFQVSxVQUFVLENBT0wsV0FBVyxDQUFDO09BQ3pDLE9BQU8sR0FBRyxrQkFSYyxVQUFVLENBUVQsT0FBTyxDQUFDO09BQ2pDLE9BQU8sR0FBRyxrQkFUYyxVQUFVLENBU1QsT0FBTyxDQUFDO09BQ2pDLFNBQVMsR0FBRyxrQkFWWSxVQUFVLENBVVAsU0FBUyxDQUFDO09BQ3JDLFNBQVMsR0FBRyxrQkFYWSxVQUFVLENBV1AsSUFBSSxDQUFDO09BQ2hDLE9BQU8sR0FBRyxrQkFaYyxVQUFVLENBWVQsR0FBRyxDQUFDOzs7QUFFN0IsY0FBYSxHQUFHLGtCQWRRLFVBQVUsQ0FjSCxPQUFPLENBQUM7T0FDdkMsT0FBTyxHQUFHLGtCQWZjLFVBQVUsQ0FlVCxPQUFPLENBQUM7T0FDakMsYUFBYSxHQUFHLGtCQWhCVCxlQUFlLENBZ0JjLEVBQUUsQ0FBQztPQUN2QyxjQUFjLEdBQUcsa0JBakJtQixPQUFPLENBaUJkLEVBQUUsQ0FBQztPQUNoQyxPQUFPLEdBQUcsa0JBbEIwQixPQUFPLENBa0JyQixJQUFJLENBQUM7T0FDM0IsV0FBVyxHQUFHLGtCQW5Cc0IsT0FBTyxDQW1CakIsb0JBQW9CLENBQUM7T0FDL0MsT0FBTyxHQUFHLGtCQXBCMEIsT0FBTyxDQW9CckIsSUFBSSxDQUFDO09BQzNCLE9BQU8sR0FBRyxrQkFyQjBCLE9BQU8sQ0FxQnJCLENBQUMsQ0FBQztPQUN4QixXQUFXLEdBQUcsa0JBdEJnRSxlQUFlLENBc0IzRCxPQUFPLENBQUM7T0FDMUMsaUJBQWlCLEdBQUcsa0JBdEJwQixVQUFVLENBc0J5QixTQUFTLEVBQUUsQ0FDN0MsVUFyQk0sb0JBQW9CLEVBcUJMLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztPQUN6RCxjQUFjLEdBQUcsbUJBdkJWLE1BQU0sRUF1Qlcsa0JBekJBLFVBQVUsQ0F5QkssUUFBUSxDQUFDLEVBQUUsVUFBVSxDQUFDO09BQzdELGVBQWUsR0FBRyxVQXZCWCxvQkFBb0IsRUF1QlksbUJBQW1CLENBQUM7T0FDM0QsZ0JBQWdCLEdBQUcsVUF4Qlosb0JBQW9CLEVBd0JhLDhCQUE4QixDQUFDO09BRXZFLGNBQWMsR0FBRyxtQkEzQlYsTUFBTSxFQTJCVyxtQkEzQmpCLE1BQU0sRUEyQmtCLGFBQWEsRUFBRSxPQUFPLENBQUMsRUFBRSxNQUFNLENBQUM7T0FDL0QsZUFBZSxHQUFHLGtCQTdCVSxtQkFBbUIsQ0E2QkwsT0FBTyxFQUNoRCxDQUFDLGtCQTlCK0Msa0JBQWtCLENBOEIxQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztPQUNsRCxlQUFlLEdBQUcsa0JBL0JVLG1CQUFtQixDQStCTCxPQUFPLEVBQUUsQ0FDbEQsa0JBaENnRCxrQkFBa0IsQ0FnQzNDLE9BQU8sRUFDN0Isa0JBbEMyQyxhQUFhLENBa0N0QyxtQkFoQ2IsTUFBTSxFQWdDYyxrQkFsQ0gsVUFBVSxDQWtDUSxRQUFRLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDbkUsZUFBZSxHQUFHLGtCQWxDVSxtQkFBbUIsQ0FrQ0wsT0FBTyxFQUFFLENBQ2xELGtCQW5DZ0Qsa0JBQWtCLENBbUMzQyxPQUFPLEVBQUUsa0JBcEMyQixnQkFBZ0IsQ0FvQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUM1RCxrQkFBa0IsR0FBRyxrQkFwQ08sbUJBQW1CLENBb0NGLE9BQU8sRUFDbkQsQ0FBQyxrQkFyQytDLGtCQUFrQixDQXFDMUMsYUFBYSxFQUFFLGtCQXJDNUIsY0FBYyxFQXFDa0MsQ0FBQyxDQUFDLENBQUM7T0FDL0QsY0FBYyxHQUFHLG1CQXJDVixNQUFNLEVBcUNXLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3RyYW5zcGlsZS9hc3QtY29uc3RhbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTGl0ZXJhbCwgTmV3RXhwcmVzc2lvbiwgT2JqZWN0RXhwcmVzc2lvbiwgUmV0dXJuU3RhdGVtZW50LFxuXHRTd2l0Y2hDYXNlLCBUaGlzRXhwcmVzc2lvbiwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7bWVtYmVyfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge3Rocm93RXJyb3JGcm9tU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjb25zdFxuXHRHbG9iYWxFcnJvciA9IG5ldyBJZGVudGlmaWVyKCdFcnJvcicpLFxuXHRJZEFyZ3VtZW50cyA9IG5ldyBJZGVudGlmaWVyKCdhcmd1bWVudHMnKSxcblx0SWRCdWlsdCA9IG5ldyBJZGVudGlmaWVyKCdidWlsdCcpLFxuXHRJZEVycm9yID0gbmV3IElkZW50aWZpZXIoJ0Vycm9yJyksXG5cdElkRXhwb3J0cyA9IG5ldyBJZGVudGlmaWVyKCdleHBvcnRzJyksXG5cdElkRXh0cmFjdCA9IG5ldyBJZGVudGlmaWVyKCdfJCcpLFxuXHRJZEZvY3VzID0gbmV3IElkZW50aWZpZXIoJ18nKSxcblx0Ly8gVE9ETzpFUzYgU2hvdWxkbid0IG5lZWQsIGp1c3QgdXNlIGFycm93IGZ1bmN0aW9ucy5cblx0SWRMZXhpY2FsVGhpcyA9IG5ldyBJZGVudGlmaWVyKCdfdGhpcycpLFxuXHRJZFN1cGVyID0gbmV3IElkZW50aWZpZXIoJ3N1cGVyJyksXG5cdExpdEVtcHR5QXJyYXkgPSBuZXcgQXJyYXlFeHByZXNzaW9uKFtdKSxcblx0TGl0RW1wdHlTdHJpbmcgPSBuZXcgTGl0ZXJhbCgnJyksXG5cdExpdE51bGwgPSBuZXcgTGl0ZXJhbChudWxsKSxcblx0TGl0U3RyVGhyb3cgPSBuZXcgTGl0ZXJhbCgnQW4gZXJyb3Igb2NjdXJyZWQuJyksXG5cdExpdFRydWUgPSBuZXcgTGl0ZXJhbCh0cnVlKSxcblx0TGl0WmVybyA9IG5ldyBMaXRlcmFsKDApLFxuXHRSZXR1cm5CdWlsdCA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoSWRCdWlsdCksXG5cdFN3aXRjaENhc2VOb01hdGNoID0gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCBbXG5cdFx0dGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgc3dpdGNoYCBtYXRjaGVzLicpXSksXG5cdFN5bWJvbEl0ZXJhdG9yID0gbWVtYmVyKG5ldyBJZGVudGlmaWVyKCdTeW1ib2wnKSwgJ2l0ZXJhdG9yJyksXG5cdFRocm93QXNzZXJ0RmFpbCA9IHRocm93RXJyb3JGcm9tU3RyaW5nKCdBc3NlcnRpb24gZmFpbGVkLicpLFxuXHRUaHJvd05vQ2FzZU1hdGNoID0gdGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgY2FzZWAgbWF0Y2hlcy4nKSxcblxuXHRBcnJheVNsaWNlQ2FsbCA9IG1lbWJlcihtZW1iZXIoTGl0RW1wdHlBcnJheSwgJ3NsaWNlJyksICdjYWxsJyksXG5cdERlY2xhcmVCdWlsdEJhZyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCwgTGl0RW1wdHlBcnJheSldKSxcblx0RGVjbGFyZUJ1aWx0TWFwID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCxcblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKG1lbWJlcihuZXcgSWRlbnRpZmllcignZ2xvYmFsJyksICdNYXAnKSwgW10pKV0pLFxuXHREZWNsYXJlQnVpbHRPYmogPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LCBuZXcgT2JqZWN0RXhwcmVzc2lvbihbXSkpXSksXG5cdERlY2xhcmVMZXhpY2FsVGhpcyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRMZXhpY2FsVGhpcywgbmV3IFRoaXNFeHByZXNzaW9uKCkpXSksXG5cdEV4cG9ydHNEZWZhdWx0ID0gbWVtYmVyKElkRXhwb3J0cywgJ2RlZmF1bHQnKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=

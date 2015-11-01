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
	exports.ExportsDefault = exports.DeclareLexicalThis = exports.DeclareBuiltObj = exports.DeclareBuiltMap = exports.DeclareBuiltBag = exports.ArraySliceCall = exports.ThrowNoCaseMatch = exports.ThrowAssertFail = exports.SymbolIterator = exports.SwitchCaseNoMatch = exports.ReturnFocus = exports.ReturnBuilt = exports.LitZero = exports.LitTrue = exports.LitStrThrow = exports.LitNull = exports.LitEmptyString = exports.LitEmptyArray = exports.IdSuper = exports.IdLexicalThis = exports.IdFocus = exports.IdExtract = exports.IdExports = exports.IdError = exports.IdBuilt = exports.IdArguments = exports.GlobalInfinity = exports.GlobalError = undefined;
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
	      ReturnFocus = exports.ReturnFocus = new _ast.ReturnStatement(IdFocus),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9hc3QtY29uc3RhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FNQyxXQUFXLFdBQVgsV0FBVyxHQUFHLFNBTlUsVUFBVSxDQU1MLE9BQU8sQ0FBQztPQUNyQyxjQUFjLFdBQWQsY0FBYyxHQUFHLFNBUE8sVUFBVSxDQU9GLFVBQVUsQ0FBQztPQUMzQyxXQUFXLFdBQVgsV0FBVyxHQUFHLFNBUlUsVUFBVSxDQVFMLFdBQVcsQ0FBQztPQUN6QyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBVGMsVUFBVSxDQVNULE9BQU8sQ0FBQztPQUNqQyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBVmMsVUFBVSxDQVVULE9BQU8sQ0FBQztPQUNqQyxTQUFTLFdBQVQsU0FBUyxHQUFHLFNBWFksVUFBVSxDQVdQLFNBQVMsQ0FBQztPQUNyQyxTQUFTLFdBQVQsU0FBUyxHQUFHLFNBWlksVUFBVSxDQVlQLElBQUksQ0FBQztPQUNoQyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBYmMsVUFBVSxDQWFULEdBQUcsQ0FBQztPQUU3QixhQUFhLFdBQWIsYUFBYSxHQUFHLFNBZlEsVUFBVSxDQWVILE9BQU8sQ0FBQztPQUN2QyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBaEJjLFVBQVUsQ0FnQlQsT0FBTyxDQUFDO09BQ2pDLGFBQWEsV0FBYixhQUFhLEdBQUcsU0FqQlQsZUFBZSxDQWlCYyxFQUFFLENBQUM7T0FDdkMsY0FBYyxXQUFkLGNBQWMsR0FBRyxTQWxCbUIsT0FBTyxDQWtCZCxFQUFFLENBQUM7T0FDaEMsT0FBTyxXQUFQLE9BQU8sR0FBRyxTQW5CMEIsT0FBTyxDQW1CckIsSUFBSSxDQUFDO09BQzNCLFdBQVcsV0FBWCxXQUFXLEdBQUcsU0FwQnNCLE9BQU8sQ0FvQmpCLG9CQUFvQixDQUFDO09BQy9DLE9BQU8sV0FBUCxPQUFPLEdBQUcsU0FyQjBCLE9BQU8sQ0FxQnJCLElBQUksQ0FBQztPQUMzQixPQUFPLFdBQVAsT0FBTyxHQUFHLFNBdEIwQixPQUFPLENBc0JyQixDQUFDLENBQUM7T0FDeEIsV0FBVyxXQUFYLFdBQVcsR0FBRyxTQXZCZ0UsZUFBZSxDQXVCM0QsT0FBTyxDQUFDO09BQzFDLFdBQVcsV0FBWCxXQUFXLEdBQUcsU0F4QmdFLGVBQWUsQ0F3QjNELE9BQU8sQ0FBQztPQUMxQyxpQkFBaUIsV0FBakIsaUJBQWlCLEdBQUcsU0F4QnBCLFVBQVUsQ0F3QnlCLFNBQVMsRUFBRSxDQUM3QyxXQXZCTSxvQkFBb0IsRUF1QkwsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO09BQ3pELGNBQWMsV0FBZCxjQUFjLEdBQUcsVUF6QlYsTUFBTSxFQXlCVyxTQTNCQSxVQUFVLENBMkJLLFFBQVEsQ0FBQyxFQUFFLFVBQVUsQ0FBQztPQUM3RCxlQUFlLFdBQWYsZUFBZSxHQUFHLFdBekJYLG9CQUFvQixFQXlCWSxtQkFBbUIsQ0FBQztPQUMzRCxnQkFBZ0IsV0FBaEIsZ0JBQWdCLEdBQUcsV0ExQlosb0JBQW9CLEVBMEJhLDhCQUE4QixDQUFDO09BRXZFLGNBQWMsV0FBZCxjQUFjLEdBQUcsVUE3QlYsTUFBTSxFQTZCVyxVQTdCakIsTUFBTSxFQTZCa0IsYUFBYSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE1BQU0sQ0FBQztPQUMvRCxlQUFlLFdBQWYsZUFBZSxHQUFHLFNBL0JVLG1CQUFtQixDQStCTCxPQUFPLEVBQ2hELENBQUMsU0FoQytDLGtCQUFrQixDQWdDMUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7T0FDbEQsZUFBZSxXQUFmLGVBQWUsR0FBRyxTQWpDVSxtQkFBbUIsQ0FpQ0wsT0FBTyxFQUFFLENBQ2xELFNBbENnRCxrQkFBa0IsQ0FrQzNDLE9BQU8sRUFDN0IsU0FwQzJDLGFBQWEsQ0FvQ3RDLFVBbENiLE1BQU0sRUFrQ2MsU0FwQ0gsVUFBVSxDQW9DUSxRQUFRLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDbkUsZUFBZSxXQUFmLGVBQWUsR0FBRyxTQXBDVSxtQkFBbUIsQ0FvQ0wsT0FBTyxFQUFFLENBQ2xELFNBckNnRCxrQkFBa0IsQ0FxQzNDLE9BQU8sRUFBRSxTQXRDMkIsZ0JBQWdCLENBc0N0QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDNUQsa0JBQWtCLFdBQWxCLGtCQUFrQixHQUFHLFNBdENPLG1CQUFtQixDQXNDRixPQUFPLEVBQ25ELENBQUMsU0F2QytDLGtCQUFrQixDQXVDMUMsYUFBYSxFQUFFLFNBdkM1QixjQUFjLEVBdUNrQyxDQUFDLENBQUMsQ0FBQztPQUMvRCxjQUFjLFdBQWQsY0FBYyxHQUFHLFVBdkNWLE1BQU0sRUF1Q1csU0FBUyxFQUFFLFNBQVMsQ0FBQyIsImZpbGUiOiJhc3QtY29uc3RhbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIElkZW50aWZpZXIsIExpdGVyYWwsIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sIFJldHVyblN0YXRlbWVudCxcblx0U3dpdGNoQ2FzZSwgVGhpc0V4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlRGVjbGFyYXRvcn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge21lbWJlcn0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHt0aHJvd0Vycm9yRnJvbVN0cmluZ30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgY29uc3Rcblx0R2xvYmFsRXJyb3IgPSBuZXcgSWRlbnRpZmllcignRXJyb3InKSxcblx0R2xvYmFsSW5maW5pdHkgPSBuZXcgSWRlbnRpZmllcignSW5maW5pdHknKSxcblx0SWRBcmd1bWVudHMgPSBuZXcgSWRlbnRpZmllcignYXJndW1lbnRzJyksXG5cdElkQnVpbHQgPSBuZXcgSWRlbnRpZmllcignYnVpbHQnKSxcblx0SWRFcnJvciA9IG5ldyBJZGVudGlmaWVyKCdFcnJvcicpLFxuXHRJZEV4cG9ydHMgPSBuZXcgSWRlbnRpZmllcignZXhwb3J0cycpLFxuXHRJZEV4dHJhY3QgPSBuZXcgSWRlbnRpZmllcignXyQnKSxcblx0SWRGb2N1cyA9IG5ldyBJZGVudGlmaWVyKCdfJyksXG5cdC8vIFRPRE86RVM2IFNob3VsZG4ndCBuZWVkLCBqdXN0IHVzZSBhcnJvdyBmdW5jdGlvbnMuXG5cdElkTGV4aWNhbFRoaXMgPSBuZXcgSWRlbnRpZmllcignX3RoaXMnKSxcblx0SWRTdXBlciA9IG5ldyBJZGVudGlmaWVyKCdzdXBlcicpLFxuXHRMaXRFbXB0eUFycmF5ID0gbmV3IEFycmF5RXhwcmVzc2lvbihbXSksXG5cdExpdEVtcHR5U3RyaW5nID0gbmV3IExpdGVyYWwoJycpLFxuXHRMaXROdWxsID0gbmV3IExpdGVyYWwobnVsbCksXG5cdExpdFN0clRocm93ID0gbmV3IExpdGVyYWwoJ0FuIGVycm9yIG9jY3VycmVkLicpLFxuXHRMaXRUcnVlID0gbmV3IExpdGVyYWwodHJ1ZSksXG5cdExpdFplcm8gPSBuZXcgTGl0ZXJhbCgwKSxcblx0UmV0dXJuQnVpbHQgPSBuZXcgUmV0dXJuU3RhdGVtZW50KElkQnVpbHQpLFxuXHRSZXR1cm5Gb2N1cyA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoSWRGb2N1cyksXG5cdFN3aXRjaENhc2VOb01hdGNoID0gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCBbXG5cdFx0dGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgc3dpdGNoYCBtYXRjaGVzLicpXSksXG5cdFN5bWJvbEl0ZXJhdG9yID0gbWVtYmVyKG5ldyBJZGVudGlmaWVyKCdTeW1ib2wnKSwgJ2l0ZXJhdG9yJyksXG5cdFRocm93QXNzZXJ0RmFpbCA9IHRocm93RXJyb3JGcm9tU3RyaW5nKCdBc3NlcnRpb24gZmFpbGVkLicpLFxuXHRUaHJvd05vQ2FzZU1hdGNoID0gdGhyb3dFcnJvckZyb21TdHJpbmcoJ05vIGJyYW5jaCBvZiBgY2FzZWAgbWF0Y2hlcy4nKSxcblxuXHRBcnJheVNsaWNlQ2FsbCA9IG1lbWJlcihtZW1iZXIoTGl0RW1wdHlBcnJheSwgJ3NsaWNlJyksICdjYWxsJyksXG5cdERlY2xhcmVCdWlsdEJhZyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCwgTGl0RW1wdHlBcnJheSldKSxcblx0RGVjbGFyZUJ1aWx0TWFwID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2NvbnN0JywgW1xuXHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRCdWlsdCxcblx0XHRcdG5ldyBOZXdFeHByZXNzaW9uKG1lbWJlcihuZXcgSWRlbnRpZmllcignZ2xvYmFsJyksICdNYXAnKSwgW10pKV0pLFxuXHREZWNsYXJlQnVpbHRPYmogPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLCBbXG5cdFx0bmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LCBuZXcgT2JqZWN0RXhwcmVzc2lvbihbXSkpXSksXG5cdERlY2xhcmVMZXhpY2FsVGhpcyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRMZXhpY2FsVGhpcywgbmV3IFRoaXNFeHByZXNzaW9uKCkpXSksXG5cdEV4cG9ydHNEZWZhdWx0ID0gbWVtYmVyKElkRXhwb3J0cywgJ2RlZmF1bHQnKVxuIl19
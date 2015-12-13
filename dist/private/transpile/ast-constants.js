'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util);
		global.astConstants = mod.exports;
	}
})(this, function (exports, _ast, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.SetLexicalThis = exports.LetLexicalThis = exports.DeclareLexicalThis = exports.DeclareBuiltObj = exports.DeclareBuiltMap = exports.DeclareBuiltBag = exports.This = exports.ReturnFocus = exports.LitNull = exports.IdSuper = exports.IdLexicalThis = exports.IdFocus = exports.IdExports = exports.IdError = exports.IdBuilt = exports.GlobalError = undefined;
	const GlobalError = exports.GlobalError = new _ast.Identifier('Error'),
	      IdBuilt = exports.IdBuilt = new _ast.Identifier('built'),
	      IdError = exports.IdError = new _ast.Identifier('Error'),
	      IdExports = exports.IdExports = new _ast.Identifier('exports'),
	      IdFocus = exports.IdFocus = new _ast.Identifier('_'),
	      IdLexicalThis = exports.IdLexicalThis = new _ast.Identifier('_this'),
	      IdSuper = exports.IdSuper = new _ast.Identifier('super'),
	      LitNull = exports.LitNull = new _ast.Literal(null),
	      ReturnFocus = exports.ReturnFocus = new _ast.ReturnStatement(IdFocus),
	      This = exports.This = new _ast.ThisExpression(),
	      DeclareBuiltBag = exports.DeclareBuiltBag = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdBuilt, new _ast.ArrayExpression([]))]),
	      DeclareBuiltMap = exports.DeclareBuiltMap = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdBuilt, new _ast.NewExpression((0, _util.member)(new _ast.Identifier('global'), 'Map'), []))]),
	      DeclareBuiltObj = exports.DeclareBuiltObj = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdBuilt, new _ast.ObjectExpression([]))]),
	      DeclareLexicalThis = exports.DeclareLexicalThis = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdLexicalThis, This)]),
	      LetLexicalThis = exports.LetLexicalThis = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdLexicalThis)]),
	      SetLexicalThis = exports.SetLexicalThis = new _ast.AssignmentExpression('=', IdLexicalThis, This);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS9hc3QtY29uc3RhbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FLQyxXQUFXLFdBQVgsV0FBVyxHQUFHLFNBTGdDLFVBQVUsQ0FLM0IsT0FBTyxDQUFDO09BQ3JDLE9BQU8sV0FBUCxPQUFPLEdBQUcsU0FOb0MsVUFBVSxDQU0vQixPQUFPLENBQUM7T0FDakMsT0FBTyxXQUFQLE9BQU8sR0FBRyxTQVBvQyxVQUFVLENBTy9CLE9BQU8sQ0FBQztPQUNqQyxTQUFTLFdBQVQsU0FBUyxHQUFHLFNBUmtDLFVBQVUsQ0FRN0IsU0FBUyxDQUFDO09BQ3JDLE9BQU8sV0FBUCxPQUFPLEdBQUcsU0FUb0MsVUFBVSxDQVMvQixHQUFHLENBQUM7T0FDN0IsYUFBYSxXQUFiLGFBQWEsR0FBRyxTQVY4QixVQUFVLENBVXpCLE9BQU8sQ0FBQztPQUN2QyxPQUFPLFdBQVAsT0FBTyxHQUFHLFNBWG9DLFVBQVUsQ0FXL0IsT0FBTyxDQUFDO09BQ2pDLE9BQU8sV0FBUCxPQUFPLEdBQUcsU0FaZ0QsT0FBTyxDQVkzQyxJQUFJLENBQUM7T0FDM0IsV0FBVyxXQUFYLFdBQVcsR0FBRyxTQVpkLGVBQWUsQ0FZbUIsT0FBTyxDQUFDO09BQzFDLElBQUksV0FBSixJQUFJLEdBQUcsU0FiVSxjQUFjLEVBYUo7T0FFM0IsZUFBZSxXQUFmLGVBQWUsR0FBRyxTQWZlLG1CQUFtQixDQWVWLEtBQUssRUFDOUMsQ0FBQyxTQWhCb0Qsa0JBQWtCLENBZ0IvQyxPQUFPLEVBQUUsU0FqQjNCLGVBQWUsQ0FpQmdDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUM1RCxlQUFlLFdBQWYsZUFBZSxHQUFHLFNBakJlLG1CQUFtQixDQWlCVixLQUFLLEVBQUUsQ0FDaEQsU0FsQnFELGtCQUFrQixDQWtCaEQsT0FBTyxFQUM3QixTQXBCaUUsYUFBYSxDQW9CNUQsVUFsQmIsTUFBTSxFQWtCYyxTQXBCbUIsVUFBVSxDQW9CZCxRQUFRLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDbkUsZUFBZSxXQUFmLGVBQWUsR0FBRyxTQXBCZSxtQkFBbUIsQ0FvQlYsS0FBSyxFQUFFLENBQ2hELFNBckJxRCxrQkFBa0IsQ0FxQmhELE9BQU8sRUFBRSxTQXRCaUQsZ0JBQWdCLENBc0I1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FFNUQsa0JBQWtCLFdBQWxCLGtCQUFrQixHQUFHLFNBdkJZLG1CQUFtQixDQXVCUCxLQUFLLEVBQ2pELENBQUMsU0F4Qm9ELGtCQUFrQixDQXdCL0MsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDL0MsY0FBYyxXQUFkLGNBQWMsR0FBRyxTQXpCZ0IsbUJBQW1CLENBeUJYLEtBQUssRUFBRSxDQUFDLFNBekJLLGtCQUFrQixDQXlCQSxhQUFhLENBQUMsQ0FBQyxDQUFDO09BQ3hGLGNBQWMsV0FBZCxjQUFjLEdBQUcsU0EzQk8sb0JBQW9CLENBMkJGLEdBQUcsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDIiwiZmlsZSI6ImFzdC1jb25zdGFudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FycmF5RXhwcmVzc2lvbiwgQXNzaWdubWVudEV4cHJlc3Npb24sIElkZW50aWZpZXIsIExpdGVyYWwsIE5ld0V4cHJlc3Npb24sIE9iamVjdEV4cHJlc3Npb24sXG5cdFJldHVyblN0YXRlbWVudCwgVGhpc0V4cHJlc3Npb24sIFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlRGVjbGFyYXRvcn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge21lbWJlcn0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuXG5leHBvcnQgY29uc3Rcblx0R2xvYmFsRXJyb3IgPSBuZXcgSWRlbnRpZmllcignRXJyb3InKSxcblx0SWRCdWlsdCA9IG5ldyBJZGVudGlmaWVyKCdidWlsdCcpLFxuXHRJZEVycm9yID0gbmV3IElkZW50aWZpZXIoJ0Vycm9yJyksXG5cdElkRXhwb3J0cyA9IG5ldyBJZGVudGlmaWVyKCdleHBvcnRzJyksXG5cdElkRm9jdXMgPSBuZXcgSWRlbnRpZmllcignXycpLFxuXHRJZExleGljYWxUaGlzID0gbmV3IElkZW50aWZpZXIoJ190aGlzJyksXG5cdElkU3VwZXIgPSBuZXcgSWRlbnRpZmllcignc3VwZXInKSxcblx0TGl0TnVsbCA9IG5ldyBMaXRlcmFsKG51bGwpLFxuXHRSZXR1cm5Gb2N1cyA9IG5ldyBSZXR1cm5TdGF0ZW1lbnQoSWRGb2N1cyksXG5cdFRoaXMgPSBuZXcgVGhpc0V4cHJlc3Npb24oKSxcblxuXHREZWNsYXJlQnVpbHRCYWcgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZEJ1aWx0LCBuZXcgQXJyYXlFeHByZXNzaW9uKFtdKSldKSxcblx0RGVjbGFyZUJ1aWx0TWFwID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsIFtcblx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkQnVpbHQsXG5cdFx0XHRuZXcgTmV3RXhwcmVzc2lvbihtZW1iZXIobmV3IElkZW50aWZpZXIoJ2dsb2JhbCcpLCAnTWFwJyksIFtdKSldKSxcblx0RGVjbGFyZUJ1aWx0T2JqID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsIFtcblx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkQnVpbHQsIG5ldyBPYmplY3RFeHByZXNzaW9uKFtdKSldKSxcblxuXHREZWNsYXJlTGV4aWNhbFRoaXMgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0Jyxcblx0XHRbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZExleGljYWxUaGlzLCBUaGlzKV0pLFxuXHRMZXRMZXhpY2FsVGhpcyA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBbbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihJZExleGljYWxUaGlzKV0pLFxuXHRTZXRMZXhpY2FsVGhpcyA9IG5ldyBBc3NpZ25tZW50RXhwcmVzc2lvbignPScsIElkTGV4aWNhbFRoaXMsIFRoaXMpXG4iXX0=
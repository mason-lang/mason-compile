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
	exports.SetLexicalThis = exports.LetLexicalThis = exports.DeclareLexicalThis = exports.ExportsDefault = exports.DeclareBuiltObj = exports.DeclareBuiltMap = exports.DeclareBuiltBag = exports.ArraySliceCall = exports.ThrowNoCaseMatch = exports.ThrowAssertFail = exports.SymbolIterator = exports.SwitchCaseNoMatch = exports.ReturnFocus = exports.ReturnBuilt = exports.LitZero = exports.LitTrue = exports.LitStrThrow = exports.LitNull = exports.LitEmptyString = exports.LitEmptyArray = exports.IdSuper = exports.IdLexicalThis = exports.IdFocus = exports.IdExtract = exports.IdExports = exports.IdError = exports.IdBuilt = exports.IdArguments = exports.GlobalInfinity = exports.GlobalError = undefined;
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
	      DeclareBuiltBag = exports.DeclareBuiltBag = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdBuilt, LitEmptyArray)]),
	      DeclareBuiltMap = exports.DeclareBuiltMap = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdBuilt, new _ast.NewExpression((0, _util.member)(new _ast.Identifier('global'), 'Map'), []))]),
	      DeclareBuiltObj = exports.DeclareBuiltObj = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdBuilt, new _ast.ObjectExpression([]))]),
	      ExportsDefault = exports.ExportsDefault = (0, _util.member)(IdExports, 'default'),
	      DeclareLexicalThis = exports.DeclareLexicalThis = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdLexicalThis, new _ast.ThisExpression())]),
	      LetLexicalThis = exports.LetLexicalThis = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdLexicalThis)]),
	      SetLexicalThis = exports.SetLexicalThis = new _ast.AssignmentExpression('=', IdLexicalThis, new _ast.ThisExpression());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhc3QtY29uc3RhbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast-create-util/lib/util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('esast-create-util/lib/util');
    exports.GlobalError = new ast_1.Identifier('Error'), exports.IdBuilt = new ast_1.Identifier('built'), exports.IdError = new ast_1.Identifier('Error'), exports.IdExports = new ast_1.Identifier('exports'), exports.IdFocus = new ast_1.Identifier('_'), exports.IdLexicalThis = new ast_1.Identifier('_this'), exports.IdSuper = new ast_1.Identifier('super'), exports.LitNull = new ast_1.LiteralNull(), exports.LitUndefined = new ast_1.UnaryExpression('void', new ast_1.LiteralNumber(0)), exports.ReturnFocus = new ast_1.ReturnStatement(exports.IdFocus), exports.This = new ast_1.ThisExpression(), exports.DeclareBuiltBag = new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(exports.IdBuilt, new ast_1.ArrayExpression([]))]), exports.DeclareBuiltMap = new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(exports.IdBuilt, new ast_1.NewExpression(util_1.member(new ast_1.Identifier('global'), 'Map'), []))]), exports.DeclareBuiltObj = new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(exports.IdBuilt, new ast_1.ObjectExpression([]))]), exports.DeclareLexicalThis = new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(exports.IdLexicalThis, exports.This)]), exports.LetLexicalThis = new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(exports.IdLexicalThis)]), exports.SetLexicalThis = new ast_1.AssignmentExpression('=', exports.IdLexicalThis, exports.This);
});
//# sourceMappingURL=ast-constants.js.map

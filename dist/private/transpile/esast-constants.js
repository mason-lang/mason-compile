(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/ObjectExpression', 'esast/lib/Statement', 'esast-create-util/lib/util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var ObjectExpression_1 = require('esast/lib/ObjectExpression');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    exports.GlobalError = new Identifier_1.default('Error'), exports.IdBuilt = new Identifier_1.default('built'), exports.IdError = new Identifier_1.default('Error'), exports.IdExports = new Identifier_1.default('exports'), exports.IdFocus = new Identifier_1.default('_'), exports.IdLexicalThis = new Identifier_1.default('_this'), exports.IdSuper = new Identifier_1.default('super'), exports.LitNull = new Expression_1.LiteralNull(), exports.LitUndefined = new Expression_1.UnaryExpression('void', new Expression_1.LiteralNumber(0)), exports.ReturnFocus = new Statement_1.ReturnStatement(exports.IdFocus), exports.This = new Expression_1.ThisExpression(), exports.DeclareBuiltBag = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.IdBuilt, new Expression_1.ArrayExpression([]))]), exports.DeclareBuiltMap = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.IdBuilt, new Expression_1.NewExpression(util_1.member(new Identifier_1.default('global'), 'Map'), []))]), exports.DeclareBuiltObj = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.IdBuilt, new ObjectExpression_1.default([]))]), exports.DeclareLexicalThis = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.IdLexicalThis, exports.This)]), exports.LetLexicalThis = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.IdLexicalThis)]), exports.SetLexicalThis = new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', exports.IdLexicalThis, exports.This));
});
//# sourceMappingURL=esast-constants.js.map

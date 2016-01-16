(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/ObjectExpression', 'esast/lib/Statement', 'esast-create-util/lib/util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Literal_1 = require('esast/lib/Literal');
    var ObjectExpression_1 = require('esast/lib/ObjectExpression');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    exports.esGlobalError = new Identifier_1.default('Error'), exports.idBuilt = new Identifier_1.default('built'), exports.idError = new Identifier_1.default('Error'), exports.idFocus = new Identifier_1.default('_'), exports.idLexicalThis = new Identifier_1.default('_this'), exports.litNull = new Literal_1.LiteralNull(), exports.litUndefined = new Expression_1.UnaryExpression('void', new Literal_1.LiteralNumber(0)), exports.returnFocus = new Statement_1.ReturnStatement(exports.idFocus), exports.esThis = new Expression_1.ThisExpression(), exports.declareBuiltBag = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.idBuilt, new Expression_1.ArrayExpression([]))]), exports.declareBuiltMap = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.idBuilt, new Expression_1.NewExpression(util_1.member(new Identifier_1.default('global'), 'Map'), []))]), exports.declareBuiltObj = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.idBuilt, new ObjectExpression_1.default([]))]), exports.declareLexicalThis = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.idLexicalThis, exports.esThis)]), exports.letLexicalThis = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(exports.idLexicalThis)]), exports.setLexicalThis = new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', exports.idLexicalThis, exports.esThis));
});
//# sourceMappingURL=esast-constants.js.map

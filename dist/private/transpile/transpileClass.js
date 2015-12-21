(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast-create-util/lib/util', 'op/Op', '../util', './ast-constants', './context', './transpileMethod', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var util_2 = require('../util');
    var ast_constants_1 = require('./ast-constants');
    var context_1 = require('./context');
    var transpileMethod_1 = require('./transpileMethod');
    var util_3 = require('./util');
    function transpileClass() {
        const opName = Op_1.opMap(context_1.verifyResults.opName(this), util_1.identifier);
        const methods = util_2.cat(this.statics.map(_ => transpileMethod_1.transpileMethodToDefinition(_, true)), Op_1.caseOp(this.opConstructor, util_3.t0, () => Op_1.opMap(this.opFields, _ => defaultConstructor(_, this.opSuperClass !== null))), this.methods.map(_ => transpileMethod_1.transpileMethodToDefinition(_, false)));
        const classExpr = new ast_1.ClassExpression(opName, Op_1.opMap(this.opSuperClass, util_3.t0), new ast_1.ClassBody(methods));
        if (this.opDo === null && !this.isRecord && util_2.isEmpty(this.traits)) return classExpr;else {
            const lead = util_2.cat(util_3.plainLet(ast_constants_1.IdFocus, classExpr), Op_1.opMap(this.opFields, beRecord), this.traits.map(_ => util_3.msCall('traitDo', ast_constants_1.IdFocus, util_3.t0(_))));
            const block = Op_1.caseOp(this.opDo, _ => util_3.t3(_.block, lead, null, ast_constants_1.ReturnFocus), () => new ast_1.BlockStatement(util_2.cat(lead, ast_constants_1.ReturnFocus)));
            return util_3.blockWrap(block);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileClass;
    function transpileConstructor() {
        return new ast_1.MethodDefinitionConstructor(context_1.verifyResults.constructorHasSuper(this) ? util_3.t2(this.fun, ast_constants_1.LetLexicalThis, true) : util_3.t1(this.fun, constructorSetMembers(this)));
    }
    exports.transpileConstructor = transpileConstructor;
    function constructorSetMembers(constructor) {
        return constructor.memberArgs.map(_ => util_3.msCall('newProperty', ast_constants_1.This, new ast_1.LiteralString(_.name), util_3.idForDeclareCached(_)));
    }
    exports.constructorSetMembers = constructorSetMembers;
    function beRecord(fields) {
        const fieldNames = new ast_1.ArrayExpression(fields.map(_ => new ast_1.LiteralString(_.name)));
        return util_3.msCall('beRecord', ast_constants_1.IdFocus, fieldNames);
    }
    function defaultConstructor(fields, classHasSuper) {
        const args = fields.map(_ => util_1.identifier(_.name));
        const opSuper = Op_1.opIf(classHasSuper, () => new ast_1.ExpressionStatement(new ast_1.CallExpression(ast_constants_1.IdSuper, [])));
        const fieldSetters = fields.map((_, i) => new ast_1.ExpressionStatement(new ast_1.AssignmentExpression('=', util_1.member(ast_constants_1.This, _.name), util_3.maybeWrapInCheckInstance(args[i], _.opType, _.name))));
        const body = new ast_1.BlockStatement(util_2.cat(opSuper, fieldSetters, FreezeThis));
        return new ast_1.MethodDefinitionConstructor(new ast_1.FunctionExpression(null, args, body));
    }
    const FreezeThis = new ast_1.ExpressionStatement(new ast_1.CallExpression(new ast_1.MemberExpressionPlain(new ast_1.Identifier('Object'), new ast_1.Identifier('freeze')), [ast_constants_1.This]));
});
//# sourceMappingURL=transpileClass.js.map

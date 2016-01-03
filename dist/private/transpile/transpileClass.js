(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Class', 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../util', './context', './esast-constants', './transpileBlock', './transpileFun', './transpileMethod', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Class_1 = require('esast/lib/Class');
    var Expression_1 = require('esast/lib/Expression');
    var Function_1 = require('esast/lib/Function');
    var Identifier_1 = require('esast/lib/Identifier');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var util_2 = require('../util');
    var context_1 = require('./context');
    var esast_constants_1 = require('./esast-constants');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileFun_1 = require('./transpileFun');
    var transpileMethod_1 = require('./transpileMethod');
    var transpileVal_1 = require('./transpileVal');
    var util_3 = require('./util');
    function transpileClassNoLoc(_) {
        const opFields = _.opFields;
        const opSuperClass = _.opSuperClass;
        const traits = _.traits;
        const opComment = _.opComment;
        const opDo = _.opDo;
        const statics = _.statics;
        const opConstructor = _.opConstructor;
        const methods = _.methods;
        const isRecord = _.isRecord;

        const opName = Op_1.opMap(context_1.verifyResults.opName(_), util_1.identifier);
        const methodAsts = util_2.cat(statics.map(_ => transpileMethod_1.transpileMethodToDefinition(_, true)), Op_1.caseOp(opConstructor, transpileConstructor, () => Op_1.opMap(opFields, _ => defaultConstructor(_, opSuperClass !== null))), methods.map(_ => transpileMethod_1.transpileMethodToDefinition(_, false)));
        const classExpr = new Class_1.ClassExpression(opName, Op_1.opMap(opSuperClass, transpileVal_1.default), new Class_1.ClassBody(methodAsts));
        if (opDo === null && !isRecord && util_2.isEmpty(traits)) return classExpr;else {
            const lead = util_2.cat(util_3.plainLet(esast_constants_1.IdFocus, classExpr), Op_1.opMap(opFields, beRecord), traits.map(_ => new Statement_1.ExpressionStatement(util_3.msCall('traitDo', esast_constants_1.IdFocus, transpileVal_1.default(_)))));
            const block = Op_1.caseOp(opDo, _ => transpileBlock_1.transpileBlockDoWithLeadAndFollow(_.block, lead, esast_constants_1.ReturnFocus), () => new Statement_1.BlockStatement(util_2.cat(lead, esast_constants_1.ReturnFocus)));
            return util_3.blockWrap(block);
        }
    }
    exports.transpileClassNoLoc = transpileClassNoLoc;
    function transpileConstructor(_) {
        const fun = _.fun;

        const funAst = context_1.verifyResults.constructorHasSuper(_) ? transpileFun_1.default(fun, [esast_constants_1.LetLexicalThis], true) : transpileFun_1.default(fun, constructorSetMembers(_));
        return util_3.loc(_, new Class_1.MethodDefinitionConstructor(funAst));
    }
    function constructorSetMembers(constructor) {
        return constructor.memberArgs.map(_ => util_3.loc(_, new Statement_1.ExpressionStatement(util_3.msCall('newProperty', esast_constants_1.This, new Expression_1.LiteralString(_.name), util_3.idForDeclareCached(_)))));
    }
    exports.constructorSetMembers = constructorSetMembers;
    function beRecord(fields) {
        const fieldNames = new Expression_1.ArrayExpression(fields.map(_ => new Expression_1.LiteralString(_.name)));
        return new Statement_1.ExpressionStatement(util_3.msCall('beRecord', esast_constants_1.IdFocus, fieldNames));
    }
    function defaultConstructor(fields, classHasSuper) {
        const args = fields.map(_ => util_1.identifier(_.name));
        const opSuper = Op_1.opIf(classHasSuper, () => new Statement_1.ExpressionStatement(new Expression_1.CallExpression(esast_constants_1.IdSuper, [])));
        const fieldSetters = fields.map((_, i) => new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', util_1.member(esast_constants_1.This, _.name), util_3.maybeWrapInCheckInstance(args[i], _.opType, _.name))));
        const body = new Statement_1.BlockStatement(util_2.cat(opSuper, fieldSetters, FreezeThis));
        return new Class_1.MethodDefinitionConstructor(new Function_1.FunctionExpression(null, args, body));
    }
    const FreezeThis = new Statement_1.ExpressionStatement(new Expression_1.CallExpression(new Expression_1.MemberExpressionPlain(new Identifier_1.default('Object'), new Identifier_1.default('freeze')), [esast_constants_1.This]));
});
//# sourceMappingURL=transpileClass.js.map

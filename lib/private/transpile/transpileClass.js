(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Class', 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../ast/Class', '../util', './context', './esast-constants', './ms', './transpileBlock', './transpileCall', './transpileClassTraitCommon', './transpileFun', './transpileLocals', './transpileMemberName', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Class_1 = require('esast/lib/Class');
    var Expression_1 = require('esast/lib/Expression');
    var Function_1 = require('esast/lib/Function');
    var Identifier_1 = require('esast/lib/Identifier');
    var Literal_1 = require('esast/lib/Literal');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var Class_2 = require('../ast/Class');
    var util_2 = require('../util');
    var context_1 = require('./context');
    var esast_constants_1 = require('./esast-constants');
    var ms_1 = require('./ms');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileCall_1 = require('./transpileCall');
    var transpileClassTraitCommon_1 = require('./transpileClassTraitCommon');
    var transpileFun_1 = require('./transpileFun');
    var transpileLocals_1 = require('./transpileLocals');
    var transpileMemberName_1 = require('./transpileMemberName');
    var transpileVal_1 = require('./transpileVal');
    var util_3 = require('./util');
    function transpileClassNoLoc(_) {
        const opFields = _.opFields;
        const opSuperClass = _.opSuperClass;
        const traits = _.traits;
        const opDo = _.opDo;
        const statics = _.statics;
        const opConstructor = _.opConstructor;
        const methods = _.methods;
        const isRecord = _.isRecord;

        const opName = Op_1.opMap(context_1.verifyResults.opName(_), util_1.identifier);
        const methodAsts = util_2.cat(statics.map(_ => transpileClassTraitCommon_1.transpileMethodToDefinition(_, true)), Op_1.caseOp(opConstructor, transpileConstructor, () => Op_1.opMap(opFields, _ => defaultConstructor(_, opSuperClass !== null))), methods.map(_ => transpileClassTraitCommon_1.transpileMethodToDefinition(_, false)));
        const classExpr = new Class_1.ClassExpression(opName, Op_1.opMap(opSuperClass, transpileVal_1.default), new Class_1.ClassBody(methodAsts));
        if (opDo === null && !isRecord && util_2.isEmpty(traits)) return classExpr;else {
            const lead = util_2.cat(transpileLocals_1.plainLet(esast_constants_1.idFocus, classExpr), Op_1.opMap(opFields, beRecord), traits.map(_ => new Statement_1.ExpressionStatement(ms_1.msCall('traitDo', esast_constants_1.idFocus, transpileVal_1.default(_)))));
            const block = Op_1.caseOp(opDo, _ => transpileBlock_1.transpileBlockDoWithLeadAndFollow(_.block, lead, esast_constants_1.returnFocus), () => new Statement_1.BlockStatement(util_2.cat(lead, esast_constants_1.returnFocus)));
            return transpileBlock_1.blockWrap(block);
        }
    }
    exports.transpileClassNoLoc = transpileClassNoLoc;
    function transpileConstructor(_) {
        const fun = _.fun;

        const funAst = context_1.verifyResults.constructorHasSuper(_) ? transpileFun_1.transpileFunBlock(fun, { leadStatements: [esast_constants_1.letLexicalThis], dontDeclareThis: true }) : transpileFun_1.transpileFunBlock(fun, { leadStatements: constructorSetMembers(_) });
        return util_3.loc(_, new Class_1.MethodDefinitionConstructor(funAst));
    }
    function constructorSetMembers(constructor) {
        return constructor.memberArgs.map(_ => util_3.loc(_, new Statement_1.ExpressionStatement(ms_1.msCall('newProperty', esast_constants_1.esThis, new Literal_1.LiteralString(_.name), transpileLocals_1.idForDeclareCached(_)))));
    }
    function beRecord(fields) {
        const fieldNames = new Expression_1.ArrayExpression(fields.map(_ => new Literal_1.LiteralString(_.name)));
        return new Statement_1.ExpressionStatement(ms_1.msCall('beRecord', esast_constants_1.idFocus, fieldNames));
    }
    function defaultConstructor(fields, classHasSuper) {
        const args = fields.map(_ => util_1.identifier(_.name));
        const opSuper = Op_1.opIf(classHasSuper, () => new Statement_1.ExpressionStatement(new Expression_1.CallExpression(idSuper, [])));
        const fieldSetters = fields.map((_, i) => new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', util_1.member(esast_constants_1.esThis, _.name), util_3.maybeWrapInCheckInstance(args[i], _.opType, _.name))));
        const body = new Statement_1.BlockStatement(util_2.cat(opSuper, fieldSetters, freezeThis));
        return new Class_1.MethodDefinitionConstructor(new Function_1.FunctionExpression(null, args, body));
    }
    const freezeThis = new Statement_1.ExpressionStatement(new Expression_1.CallExpression(new Expression_1.MemberExpressionPlain(new Identifier_1.default('Object'), new Identifier_1.default('freeze')), [esast_constants_1.esThis]));
    function transpileSuperCallDoNoLoc(_) {
        const args = _.args;

        const method = context_1.verifyResults.superCallToMethod.get(_);
        if (method instanceof Class_2.Constructor) {
            const call = new Statement_1.ExpressionStatement(new Expression_1.CallExpression(idSuper, args.map(transpileVal_1.default)));
            const memberSets = constructorSetMembers(method);
            return util_2.cat(call, memberSets, esast_constants_1.setLexicalThis);
        } else return new Statement_1.ExpressionStatement(superCall(_, method));
    }
    exports.transpileSuperCallDoNoLoc = transpileSuperCallDoNoLoc;
    function transpileSuperCallValNoLoc(_) {
        const method = context_1.verifyResults.superCallToMethod.get(_);
        if (method instanceof Class_2.Constructor) throw new Error();else return superCall(_, method);
    }
    exports.transpileSuperCallValNoLoc = transpileSuperCallValNoLoc;
    function superCall(_ref, method) {
        let args = _ref.args;

        return new Expression_1.CallExpression(transpileMemberName_1.transpileMember(idSuper, method.symbol), transpileCall_1.transpileArguments(args));
    }
    function transpileSuperMemberNoLoc(_ref2) {
        let name = _ref2.name;

        return transpileMemberName_1.transpileMember(idSuper, name);
    }
    exports.transpileSuperMemberNoLoc = transpileSuperMemberNoLoc;
    const idSuper = new Identifier_1.default('super');
});
//# sourceMappingURL=transpileClass.js.map

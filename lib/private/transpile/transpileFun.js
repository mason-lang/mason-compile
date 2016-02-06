(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../context', '../ast/Fun', '../util', './context', './esast-constants', './ms', './transpileBlock', './transpileLocals', './transpileMemberName', './transpileOperator', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const Function_1 = require('esast/lib/Function');
    const Identifier_1 = require('esast/lib/Identifier');
    const Literal_1 = require('esast/lib/Literal');
    const Statement_1 = require('esast/lib/Statement');
    const util_1 = require('esast-create-util/lib/util');
    const Op_1 = require('op/Op');
    const context_1 = require('../context');
    const Fun_1 = require('../ast/Fun');
    const util_2 = require('../util');
    const context_2 = require('./context');
    const esast_constants_1 = require('./esast-constants');
    const ms_1 = require('./ms');
    const transpileBlock_1 = require('./transpileBlock');
    const transpileLocals_1 = require('./transpileLocals');
    const transpileMemberName_1 = require('./transpileMemberName');
    const transpileOperator_1 = require('./transpileOperator');
    const transpileVal_1 = require('./transpileVal');
    const util_3 = require('./util');
    function transpileFunNoLoc(_) {
        if (_ instanceof Fun_1.FunBlock) return transpileFunBlockNoLoc(_);else if (_ instanceof Fun_1.FunGetter) return focusFun(transpileMemberName_1.transpileMember(esast_constants_1.idFocus, _.name));else if (_ instanceof Fun_1.FunMember) {
            const opObject = _.opObject;
            const name = _.name;

            const nameAst = transpileMemberName_1.default(name);
            return Op_1.caseOp(opObject, _ => ms_1.msCall('methodBound', transpileVal_1.default(_), nameAst), () => ms_1.msCall('methodUnbound', nameAst));
        } else if (_ instanceof Fun_1.FunOperator) return transpileOperator_1.transpileFunOperatorNoLoc(_);else if (_ instanceof Fun_1.FunSimple) return focusFun(transpileVal_1.default(_.value));else if (_ instanceof Fun_1.FunUnary) return transpileOperator_1.transpileFunUnaryNoLoc(_);else throw new Error(_.constructor.name);
    }
    exports.transpileFunNoLoc = transpileFunNoLoc;
    function transpileFunBlock(_) {
        let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return util_3.loc(_, transpileFunBlockNoLoc(_, opts));
    }
    exports.transpileFunBlock = transpileFunBlock;
    function transpileFunBlockNoLoc(_) {
        let opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        const args = _.args;
        const opRestArg = _.opRestArg;
        const block = _.block;
        const kind = _.kind;
        const opDeclareThis = _.opDeclareThis;
        const opReturnType = _.opReturnType;
        var _opts$leadStatements = opts.leadStatements;
        const leadStatements = _opts$leadStatements === undefined ? null : _opts$leadStatements;
        var _opts$dontDeclareThis = opts.dontDeclareThis;
        const dontDeclareThis = _opts$dontDeclareThis === undefined ? false : _opts$dontDeclareThis;

        return context_2.withFunKind(kind, () => {
            const nArgs = new Literal_1.LiteralNumber(args.length);
            const opDeclareRest = Op_1.opMap(opRestArg, rest => transpileLocals_1.makeDeclare(rest, new Expression_1.CallExpression(arraySliceCall, [idArguments, nArgs])));
            const argChecks = Op_1.opIf(context_1.compileOptions.checks, () => Op_1.flatMapOps(args, transpileLocals_1.opTypeCheckForLocalDeclare));
            const opDeclareThisAst = Op_1.opIf(opDeclareThis !== null && !dontDeclareThis, () => esast_constants_1.declareLexicalThis);
            const lead = util_2.cat(opDeclareRest, opDeclareThisAst, argChecks, leadStatements);
            const body = () => transpileBlock_1.default(block, { lead: lead, opReturnType: opReturnType });
            const argAsts = args.map(transpileLocals_1.transpileLocalDeclare);
            const id = Op_1.opMap(context_2.verifyResults.opName(_), util_1.identifier);
            switch (kind) {
                case 1:
                    {
                        const plainBody = transpileBlock_1.default(block, { opReturnType: opReturnType });
                        const genFunc = new Function_1.FunctionExpression(null, [], plainBody, { generator: true });
                        const ret = new Statement_1.ReturnStatement(ms_1.msCall('async', genFunc));
                        return new Function_1.FunctionExpression(id, argAsts, new Statement_1.BlockStatement(util_2.cat(lead, ret)));
                    }
                case 2:
                    return new Function_1.FunctionExpression(id, argAsts, body(), { generator: true });
                case 0:
                    return id === null && opDeclareThis === null && opDeclareRest === null ? new Function_1.ArrowFunctionExpression(argAsts, body()) : new Function_1.FunctionExpression(id, argAsts, body());
                default:
                    throw new Error(String(kind));
            }
        });
    }
    const arraySliceCall = util_1.member(util_1.member(new Expression_1.ArrayExpression([]), 'slice'), 'call');
    const idArguments = new Identifier_1.default('arguments');
    function focusFun(value) {
        return new Function_1.ArrowFunctionExpression([esast_constants_1.idFocus], value);
    }
});
//# sourceMappingURL=transpileFun.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../context', '../util', './context', './esast-constants', './transpileBlock', './transpileMisc', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Function_1 = require('esast/lib/Function');
    var Identifier_1 = require('esast/lib/Identifier');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var util_2 = require('../util');
    var context_2 = require('./context');
    var esast_constants_1 = require('./esast-constants');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileMisc_1 = require('./transpileMisc');
    var util_3 = require('./util');
    function transpileFun(_) {
        let leadStatements = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        let dontDeclareThis = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        return util_3.loc(_, transpileFunNoLoc(_, leadStatements, dontDeclareThis));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileFun;
    function transpileFunNoLoc(_) {
        let leadStatements = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        let dontDeclareThis = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        const args = _.args;
        const opRestArg = _.opRestArg;
        const block = _.block;
        const kind = _.kind;
        const opDeclareThis = _.opDeclareThis;
        const isDo = _.isDo;
        const opReturnType = _.opReturnType;

        return context_2.withFunKind(kind, () => {
            const nArgs = new Expression_1.LiteralNumber(args.length);
            const opDeclareRest = Op_1.opMap(opRestArg, rest => util_3.makeDeclare(rest, new Expression_1.CallExpression(ArraySliceCall, [IdArguments, nArgs])));
            const argChecks = Op_1.opIf(context_1.options.checks, () => Op_1.flatMapOps(args, util_3.opTypeCheckForLocalDeclare));
            const opDeclareThisAst = Op_1.opIf(opDeclareThis !== null && !dontDeclareThis, () => esast_constants_1.DeclareLexicalThis);
            const lead = util_2.cat(opDeclareRest, opDeclareThisAst, argChecks, leadStatements);
            const body = () => transpileBlock_1.default(block, lead, opReturnType);
            const argAsts = args.map(transpileMisc_1.transpileLocalDeclare);
            const id = Op_1.opMap(context_2.verifyResults.opName(_), util_1.identifier);
            switch (kind) {
                case 0:
                    return id === null && opDeclareThis === null && opDeclareRest === null ? new Function_1.ArrowFunctionExpression(argAsts, body()) : new Function_1.FunctionExpression(id, argAsts, body());
                case 1:
                    {
                        const plainBody = transpileBlock_1.default(block, null, opReturnType);
                        const genFunc = new Function_1.FunctionExpression(null, [], plainBody, { generator: true });
                        const ret = new Statement_1.ReturnStatement(util_3.msCall('async', genFunc));
                        return new Function_1.FunctionExpression(id, argAsts, new Statement_1.BlockStatement(util_2.cat(lead, ret)));
                    }
                case 2:
                    return new Function_1.FunctionExpression(id, argAsts, body(), { generator: true });
                default:
                    throw new Error(String(kind));
            }
        });
    }
    exports.transpileFunNoLoc = transpileFunNoLoc;
    const ArraySliceCall = util_1.member(util_1.member(new Expression_1.ArrayExpression([]), 'slice'), 'call');
    const IdArguments = new Identifier_1.default('arguments');
});
//# sourceMappingURL=transpileFun.js.map

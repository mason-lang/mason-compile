(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast-create-util/lib/util', 'op/Op', '../context', '../util', './ast-constants', './context', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var util_2 = require('../util');
    var ast_constants_1 = require('./ast-constants');
    var context_2 = require('./context');
    var util_3 = require('./util');
    function default_1() {
        let leadStatements = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        let dontDeclareThis = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return context_2.withFunKind(this.kind, () => {
            const nArgs = new ast_1.LiteralNumber(this.args.length);
            const opDeclareRest = Op_1.opMap(this.opRestArg, rest => util_3.makeDeclare(rest, new ast_1.CallExpression(ArraySliceCall, [IdArguments, nArgs])));
            const argChecks = Op_1.opIf(context_1.options.checks, () => Op_1.flatMapOps(this.args, util_3.opTypeCheckForLocalDeclare));
            const opDeclareThis = Op_1.opIf(this.opDeclareThis !== null && !dontDeclareThis, () => ast_constants_1.DeclareLexicalThis);
            const lead = util_2.cat(opDeclareRest, opDeclareThis, argChecks, leadStatements);
            const body = () => util_3.t2(this.block, lead, this.opReturnType);
            const args = this.args.map(util_3.t0);
            const id = Op_1.opMap(context_2.verifyResults.opName(this), util_1.identifier);
            switch (this.kind) {
                case 0:
                    return id === null && this.opDeclareThis === null && opDeclareRest === null ? new ast_1.ArrowFunctionExpression(args, body()) : new ast_1.FunctionExpression(id, args, body());
                case 1:
                    {
                        const plainBody = util_3.t2(this.block, null, this.opReturnType);
                        const genFunc = new ast_1.FunctionExpression(null, [], plainBody, { generator: true });
                        const ret = new ast_1.ReturnStatement(util_3.msCall('async', genFunc));
                        return new ast_1.FunctionExpression(id, args, new ast_1.BlockStatement(util_2.cat(lead, ret)));
                    }
                case 2:
                    return new ast_1.FunctionExpression(id, args, body(), { generator: true });
                default:
                    throw new Error(this.kind);
            }
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const ArraySliceCall = util_1.member(util_1.member(new ast_1.ArrayExpression([]), 'slice'), 'call');
    const IdArguments = new ast_1.Identifier('arguments');
});
//# sourceMappingURL=transpileFun.js.map

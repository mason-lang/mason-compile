(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', 'esast/lib/ast', '../util', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var ast_1 = require('esast/lib/ast');
    var util_1 = require('../util');
    var util_2 = require('./util');
    function default_1() {
        const block = this.opElse === null ? new ast_1.TryStatement(util_2.t0(this.try), transpileCatches(this.typedCatches, this.opCatchAll, false), Op_1.opMap(this.opFinally, util_2.t0)) : transpileWithElse(this, this.opElse);
        return util_2.blockWrapIfVal(this, block);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    function transpileCatch(needsErrorDeclare) {
        if (needsErrorDeclare) {
            const declareError = new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(util_2.t0(this.caught), IdError)]);
            return util_2.t1(this.block, declareError);
        } else return util_2.t0(this.block);
    }
    exports.transpileCatch = transpileCatch;
    function transpileWithElse(_, _else) {
        const _try = util_2.t1(_else, util_1.cat(util_2.tLines(_.try.lines), SetExceptElse));
        const _catch = transpileCatches(_.typedCatches, _.opCatchAll, true);
        return [LetExceptElse, new ast_1.TryStatement(_try, _catch, Op_1.opMap(_.opFinally, util_2.t0))];
    }
    function transpileCatches(typedCatches, opCatchAll, hasElse) {
        const allCatches = util_1.cat(typedCatches, opCatchAll);
        const needsErrorDeclare = !util_1.allSame(allCatches, _ => _.caught.name);
        const idError = needsErrorDeclare ? IdError : util_2.idForDeclareCached(allCatches[0].caught);
        const throwIfOnElse = () => new ast_1.IfStatement(IdExceptElse, new ast_1.ThrowStatement(idError));
        const catchAll = Op_1.caseOp(opCatchAll, _ => util_2.t1(_, needsErrorDeclare), () => new ast_1.ThrowStatement(idError));
        if (util_1.isEmpty(typedCatches)) {
            if (hasElse) catchAll.body.unshift(throwIfOnElse());
            return new ast_1.CatchClause(idError, catchAll);
        } else {
            let catches = catchAll;
            for (const typedCatch of util_1.reverseIter(typedCatches)) {
                const type = typedCatch.caught.opType;
                const cond = util_2.msCall('contains', util_2.t0(type), idError);
                const then = util_2.t1(typedCatch, needsErrorDeclare);
                catches = new ast_1.IfStatement(cond, then, catches);
            }
            return new ast_1.CatchClause(idError, new ast_1.BlockStatement(hasElse ? [throwIfOnElse(), catches] : [catches]));
        }
    }
    const IdError = new ast_1.Identifier('error_'),
          IdExceptElse = new ast_1.Identifier('exceptElse_'),
          LetExceptElse = new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(IdExceptElse, new ast_1.LiteralBoolean(false))]),
          SetExceptElse = new ast_1.AssignmentExpression('=', IdExceptElse, new ast_1.LiteralBoolean(true));
});
//# sourceMappingURL=transpileExcept.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Statement', 'op/Op', '../util', './transpileBlock', './transpileMisc', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var util_1 = require('../util');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileMisc_1 = require('./transpileMisc');
    var transpileVal_1 = require('./transpileVal');
    var util_2 = require('./util');
    function transpileExceptValNoLoc(_) {
        return util_2.blockWrap(new Statement_1.BlockStatement(util_1.toArray(transpileExceptDoNoLoc(_))));
    }
    exports.transpileExceptValNoLoc = transpileExceptValNoLoc;
    function transpileExceptDoNoLoc(_) {
        const _try = _.try;
        const typedCatches = _.typedCatches;
        const opCatchAll = _.opCatchAll;
        const opElse = _.opElse;
        const opFinally = _.opFinally;

        return Op_1.caseOp(opElse, _else => transpileWithElse(_, _else), () => new Statement_1.TryStatement(transpileBlock_1.default(_try), transpileCatches(typedCatches, opCatchAll, false), Op_1.opMap(opFinally, transpileBlock_1.transpileBlockDo)));
    }
    exports.transpileExceptDoNoLoc = transpileExceptDoNoLoc;
    function transpileWithElse(_, _else) {
        const _try = _.try;
        const typedCatches = _.typedCatches;
        const opCatchAll = _.opCatchAll;
        const opFinally = _.opFinally;

        const tryAst = transpileBlock_1.default(_else, util_1.cat(util_2.tLines(_try.lines), SetExceptElse));
        const catchAst = transpileCatches(typedCatches, opCatchAll, true);
        return [LetExceptElse, new Statement_1.TryStatement(tryAst, catchAst, Op_1.opMap(opFinally, transpileBlock_1.transpileBlockDo))];
    }
    function transpileCatches(typedCatches, opCatchAll, hasElse) {
        const allCatches = util_1.cat(typedCatches, opCatchAll);
        const needsErrorDeclare = !util_1.allSame(allCatches, _ => _.caught.name);
        const idError = needsErrorDeclare ? IdError : util_2.idForDeclareCached(allCatches[0].caught);
        const throwIfOnElse = () => new Statement_1.IfStatement(IdExceptElse, new Statement_1.ThrowStatement(idError));
        const catchAll = Op_1.caseOp(opCatchAll, _ => transpileCatch(_, needsErrorDeclare), () => new Statement_1.BlockStatement([new Statement_1.ThrowStatement(idError)]));
        const catchBlock = (() => {
            if (util_1.isEmpty(typedCatches)) {
                if (hasElse) catchAll.body.unshift(throwIfOnElse());
                return catchAll;
            } else {
                let catches = catchAll;
                for (const typedCatch of util_1.reverseIter(typedCatches)) {
                    const type = typedCatch.caught.opType;
                    const cond = util_2.msCall('contains', transpileVal_1.default(type), idError);
                    const then = transpileCatch(typedCatch, needsErrorDeclare);
                    catches = new Statement_1.IfStatement(cond, then, catches);
                }
                return new Statement_1.BlockStatement(hasElse ? [throwIfOnElse(), catches] : [catches]);
            }
        })();
        return new Statement_1.CatchClause(idError, catchBlock);
    }
    function transpileCatch(_, needsErrorDeclare) {
        const caught = _.caught;
        const block = _.block;

        return util_2.loc(_, (() => {
            if (needsErrorDeclare) {
                const declareError = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(transpileMisc_1.transpileLocalDeclare(caught), IdError)]);
                return transpileBlock_1.transpileBlockNoLoc(block, declareError);
            } else return transpileBlock_1.transpileBlockNoLoc(block);
        })());
    }
    const IdError = new Identifier_1.default('error_'),
          IdExceptElse = new Identifier_1.default('exceptElse_'),
          LetExceptElse = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(IdExceptElse, new Expression_1.LiteralBoolean(false))]),
          SetExceptElse = new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', IdExceptElse, new Expression_1.LiteralBoolean(true)));
});
//# sourceMappingURL=transpileExcept.js.map

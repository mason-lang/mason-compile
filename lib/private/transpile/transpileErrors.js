(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/Statement', 'op/Op', '../ast/Call', '../ast/Quote', '../ast/Val', '../util', './esast-constants', './ms', './throwErrorFromString', './transpileBlock', './transpileLocals', './transpileMemberName', './transpileQuote', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Literal_1 = require('esast/lib/Literal');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var Call_1 = require('../ast/Call');
    var Quote_1 = require('../ast/Quote');
    var Val_1 = require('../ast/Val');
    var util_1 = require('../util');
    var esast_constants_1 = require('./esast-constants');
    var ms_1 = require('./ms');
    var throwErrorFromString_1 = require('./throwErrorFromString');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileLocals_1 = require('./transpileLocals');
    var transpileMemberName_1 = require('./transpileMemberName');
    var transpileQuote_1 = require('./transpileQuote');
    var transpileVal_1 = require('./transpileVal');
    var util_2 = require('./util');
    function transpileAssertNoLoc(_ref) {
        let negate = _ref.negate;
        let condition = _ref.condition;
        let opThrown = _ref.opThrown;

        const failCond = () => {
            const cond = transpileVal_1.default(condition);
            return negate ? cond : new Expression_1.UnaryExpression('!', cond);
        };
        return Op_1.caseOp(opThrown, _ => new Statement_1.IfStatement(failCond(), doThrow(_)), () => {
            if (condition instanceof Call_1.default) {
                const called = condition.called;
                const args = condition.args;

                const argAsts = args.map(transpileVal_1.default);
                return new Statement_1.ExpressionStatement(called instanceof Val_1.Member ? ms_1.msCall(negate ? 'assertNotMember' : 'assertMember', transpileVal_1.default(called.object), transpileMemberName_1.default(called.name), ...argAsts) : ms_1.msCall(negate ? 'assertNot' : 'assert', transpileVal_1.default(called), ...argAsts));
            } else return new Statement_1.IfStatement(failCond(), throwAssertFail);
        });
    }
    exports.transpileAssertNoLoc = transpileAssertNoLoc;
    const throwAssertFail = throwErrorFromString_1.default('Assertion failed.');
    function transpileExceptValNoLoc(_) {
        return transpileBlock_1.blockWrap(new Statement_1.BlockStatement(util_1.toArray(transpileExceptDoNoLoc(_))));
    }
    exports.transpileExceptValNoLoc = transpileExceptValNoLoc;
    function transpileExceptDoNoLoc(_ref2) {
        let tried = _ref2.tried;
        let typedCatches = _ref2.typedCatches;
        let opCatchAll = _ref2.opCatchAll;
        let opElse = _ref2.opElse;
        let opFinally = _ref2.opFinally;

        return Op_1.caseOp(opElse, elseBlock => {
            const lead = util_1.cat(util_2.transpileLines(tried.lines), setExceptElse);
            const tryAst = transpileBlock_1.default(elseBlock, { lead: lead });
            const catchAst = transpileCatches(typedCatches, opCatchAll, true);
            return [letExceptElse, new Statement_1.TryStatement(tryAst, catchAst, Op_1.opMap(opFinally, transpileBlock_1.transpileBlockDo))];
        }, () => new Statement_1.TryStatement(transpileBlock_1.default(tried), transpileCatches(typedCatches, opCatchAll, false), Op_1.opMap(opFinally, transpileBlock_1.transpileBlockDo)));
    }
    exports.transpileExceptDoNoLoc = transpileExceptDoNoLoc;
    function transpileCatches(typedCatches, opCatchAll, hasElse) {
        const allCatches = util_1.cat(typedCatches, opCatchAll);
        const needsErrorDeclare = !util_1.allSame(allCatches, _ => _.caught.name);
        const idCaught = needsErrorDeclare ? idCaughtDefault : transpileLocals_1.idForDeclareCached(allCatches[0].caught);
        const throwIfOnElse = () => new Statement_1.IfStatement(idExceptElse, new Statement_1.ThrowStatement(idCaught));
        const catchAll = Op_1.caseOp(opCatchAll, _ => transpileCatch(_, needsErrorDeclare), () => new Statement_1.BlockStatement([new Statement_1.ThrowStatement(idCaught)]));
        const catchBlock = (() => {
            if (util_1.isEmpty(typedCatches)) {
                if (hasElse) catchAll.body.unshift(throwIfOnElse());
                return catchAll;
            } else {
                let catches = catchAll;
                for (const typedCatch of util_1.reverseIter(typedCatches)) {
                    const type = Op_1.orThrow(typedCatch.caught.opType);
                    const cond = ms_1.msCall('contains', transpileVal_1.default(type), idCaught);
                    const then = transpileCatch(typedCatch, needsErrorDeclare);
                    catches = new Statement_1.IfStatement(cond, then, catches);
                }
                return new Statement_1.BlockStatement(hasElse ? [throwIfOnElse(), catches] : [catches]);
            }
        })();
        return new Statement_1.CatchClause(idCaught, catchBlock);
    }
    function transpileCatch(_, needsErrorDeclare) {
        const caught = _.caught;
        const block = _.block;

        return util_2.loc(_, needsErrorDeclare ? transpileBlock_1.transpileBlockNoLoc(block, { lead: transpileLocals_1.plainLetForDeclare(caught, idCaughtDefault) }) : transpileBlock_1.transpileBlockNoLoc(block));
    }
    const idCaughtDefault = new Identifier_1.default('error_');
    const idExceptElse = new Identifier_1.default('exceptElse_');
    const letExceptElse = new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(idExceptElse, new Literal_1.LiteralBoolean(false))]);
    const setExceptElse = new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', idExceptElse, new Literal_1.LiteralBoolean(true)));
    function transpileThrow(_) {
        return util_2.loc(_, transpileThrowNoLoc(_));
    }
    exports.transpileThrow = transpileThrow;
    function transpileThrowNoLoc(_) {
        return Op_1.caseOp(_.opThrown, doThrow, () => new Statement_1.ThrowStatement(new Expression_1.NewExpression(esast_constants_1.esGlobalError, [litStrThrow])));
    }
    exports.transpileThrowNoLoc = transpileThrowNoLoc;
    const litStrThrow = new Literal_1.LiteralString('An error occurred.');
    function doThrow(thrown) {
        return new Statement_1.ThrowStatement(thrown instanceof Quote_1.default ? new Expression_1.NewExpression(esast_constants_1.esGlobalError, [transpileQuote_1.default(thrown)]) : transpileVal_1.default(thrown));
    }
});
//# sourceMappingURL=transpileErrors.js.map

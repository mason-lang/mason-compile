(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', './context', './locals', './SK', './util', './verifyBlock', './verifyDo', './verifyExcept', './verifyFor', './verifySK', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var SK_1 = require('./SK');
    var util_1 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyDo_1 = require('./verifyDo');
    var verifyExcept_1 = require('./verifyExcept');
    var verifyFor_1 = require('./verifyFor');
    var verifySK_1 = require('./verifySK');
    var verifyVal_1 = require('./verifyVal');
    function verifyValOrDo(_, sk) {
        if (_ instanceof MsAst_1.Await) {
            const loc = _.loc;
            const value = _.value;

            context_1.check(context_2.funKind === 1, loc, _ => _.misplacedAwait);
            verifyVal_1.default(value);
        } else if (_ instanceof MsAst_1.Call) {
            const called = _.called;
            const args = _.args;

            verifyVal_1.default(called);
            util_1.verifyEachValOrSpread(args);
        } else if (_ instanceof MsAst_1.Case) {
            const opCased = _.opCased;
            const parts = _.parts;
            const opElse = _.opElse;

            SK_1.markStatement(_, sk);
            context_2.withIifeIfVal(sk, () => {
                const doIt = () => {
                    for (const _ of parts) verifyCasePart(_, sk);
                    Op_1.opEach(opElse, _ => verifyBlock_1.verifyBlockSK(_, sk));
                };
                Op_1.caseOp(opCased, _ => {
                    verifyDo_1.default(_);
                    locals_1.verifyAndPlusLocal(_.assignee, doIt);
                }, doIt);
            });
        } else if (_ instanceof MsAst_1.Cond) {
            const test = _.test;
            const ifTrue = _.ifTrue;
            const ifFalse = _.ifFalse;

            verifyVal_1.default(test);
            verifySK_1.default(ifTrue, sk);
            verifySK_1.default(ifFalse, sk);
        } else if (_ instanceof MsAst_1.Conditional) {
            const test = _.test;
            const result = _.result;

            SK_1.markStatement(_, sk);
            verifyVal_1.default(test);
            context_2.withIifeIf(result instanceof MsAst_1.Block && sk === 1, () => {
                if (result instanceof MsAst_1.Block) verifyBlock_1.verifyBlockSK(result, sk);else verifySK_1.default(result, sk);
            });
        } else if (_ instanceof MsAst_1.Del) {
            const subbed = _.subbed;
            const args = _.args;

            verifyVal_1.default(subbed);
            verifyVal_1.verifyEachVal(args);
        } else if (_ instanceof MsAst_1.Except) verifyExcept_1.default(_, sk);else if (_ instanceof MsAst_1.For) {
            SK_1.markStatement(_, sk);
            verifyFor_1.default(_);
        } else if (_ instanceof MsAst_1.ForAsync) {
            const loc = _.loc;
            const iteratee = _.iteratee;
            const block = _.block;

            SK_1.markStatement(_, sk);
            context_1.check(sk !== 0 || context_2.funKind === 1, loc, _ => _.forAsyncNeedsAsync);
            verifyFor_1.withVerifyIteratee(iteratee, () => {
                context_2.withFun(1, () => {
                    verifyBlock_1.verifyBlockSK(block, SK_1.getBlockSK(block));
                });
            });
        } else if (_ instanceof MsAst_1.SuperCall) {
            const loc = _.loc;
            const args = _.args;

            const meth = Op_1.orThrow(context_2.method, () => context_1.fail(loc, _ => _.superNeedsMethod));
            context_2.results.superCallToMethod.set(_, meth);
            if (meth instanceof MsAst_1.Constructor) {
                context_1.check(sk === 0, loc, _ => _.superMustBeStatement);
                context_2.results.constructorToSuper.set(meth, _);
            }
            verifyVal_1.verifyEachVal(args);
        } else if (_ instanceof MsAst_1.Switch) {
            const switched = _.switched;
            const parts = _.parts;
            const opElse = _.opElse;

            SK_1.markStatement(_, sk);
            context_2.withIifeIfVal(sk, () => {
                context_2.withInSwitch(true, () => {
                    verifyVal_1.default(switched);
                    for (const _ of parts) verifySwitchPart(_, sk);
                    Op_1.opEach(opElse, _ => verifyBlock_1.verifyBlockSK(_, sk));
                });
            });
        } else if (_ instanceof MsAst_1.Throw) {
            verifyVal_1.verifyOpVal(_.opThrown);
        } else if (_ instanceof MsAst_1.With) {
            const value = _.value;
            const declare = _.declare;
            const block = _.block;

            SK_1.markStatement(_, sk);
            verifyVal_1.default(value);
            context_2.withIifeIfVal(sk, () => {
                if (sk === 1) util_1.makeUseOptionalIfFocus(declare);
                locals_1.verifyAndPlusLocal(declare, () => {
                    verifyBlock_1.verifyBlockDo(block);
                });
            });
        } else if (_ instanceof MsAst_1.Yield) {
            const loc = _.loc;
            const opValue = _.opValue;

            context_1.check(context_2.funKind === 2, loc, _ => _.misplacedYield(112));
            verifyVal_1.verifyOpVal(opValue);
        } else if (_ instanceof MsAst_1.YieldTo) {
            const loc = _.loc;
            const value = _.value;

            context_1.check(context_2.funKind === 2, loc, _ => _.misplacedYield(113));
            verifyVal_1.default(value);
        } else {
            throw new Error(_.constructor.name);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyValOrDo;
    function verifyCasePart(_ref, sk) {
        let test = _ref.test;
        let result = _ref.result;

        if (test instanceof MsAst_1.Pattern) {
            verifyVal_1.default(test.type);
            verifyVal_1.default(test.patterned);
            locals_1.verifyAndPlusLocals(test.locals, () => verifyBlock_1.verifyBlockSK(result, sk));
        } else {
            verifyVal_1.default(test);
            verifyBlock_1.verifyBlockSK(result, sk);
        }
    }
    function verifySwitchPart(_, sk) {
        const values = _.values;
        const result = _.result;

        SK_1.markStatement(_, sk);
        verifyVal_1.verifyEachVal(values);
        verifyBlock_1.verifyBlockSK(result, sk);
    }
});
//# sourceMappingURL=verifyValOrDo.js.map

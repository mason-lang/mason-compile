(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Loop', '../context', '../util', './context', './util', './SK', './verifyBlock', './verifyLocals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const Loop_1 = require('../ast/Loop');
    const context_1 = require('../context');
    const util_1 = require('../util');
    const context_2 = require('./context');
    const util_2 = require('./util');
    const SK_1 = require('./SK');
    const verifyBlock_1 = require('./verifyBlock');
    const verifyLocals_1 = require('./verifyLocals');
    const verifyVal_1 = require('./verifyVal');
    function verifyLoop(_, sk) {
        const opIteratee = _.opIteratee;
        const block = _.block;

        function verifyBlock() {
            context_2.withLoop({ loop: _, sk: sk }, () => verifyBlock_1.verifyBlockDo(block));
        }
        Op_1.caseOp(opIteratee, _ => withVerifyIteratee(_, verifyBlock), verifyBlock);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyLoop;
    function verifyForAsync(_, sk) {
        const loc = _.loc;
        const iteratee = _.iteratee;
        const block = _.block;

        if (sk === 0) context_1.check(context_2.funKind === 1, loc, _ => _.forAsyncNeedsAsync);
        withVerifyIteratee(iteratee, () => {
            context_2.withFun(1, () => {
                verifyBlock_1.verifyBlockSK(block, SK_1.getBlockSK(block));
            });
        });
    }
    exports.verifyForAsync = verifyForAsync;
    function withVerifyIteratee(_ref, action) {
        let element = _ref.element;
        let bag = _ref.bag;

        verifyVal_1.default(bag);
        util_2.verifyNotLazy(element, _ => _.noLazyIteratee);
        verifyLocals_1.verifyAndPlusLocal(element, action);
    }
    function verifyBreak(_) {
        const opValue = _.opValue;
        const loc = _.loc;

        verifyVal_1.verifyOpVal(opValue);

        var _Op_1$orThrow = Op_1.orThrow(context_2.opLoop, () => context_1.fail(loc, _ => _.misplacedBreak));

        const loop = _Op_1$orThrow.loop;
        const loopSK = _Op_1$orThrow.sk;

        if (loop instanceof Loop_1.For) {
            if (loopSK === 0) context_1.check(opValue === null, loc, _ => _.breakCantHaveValue);else context_1.check(opValue !== null, loc, _ => _.breakNeedsValue);
        } else {
            util_1.assert(loop instanceof Loop_1.ForBag);
            context_1.check(opValue === null, this.loc, _ => _.breakValInForBag);
        }
        if (context_2.isInSwitch) {
            context_2.results.loopsNeedingLabel.add(loop);
            context_2.results.breaksInSwitch.add(_);
        }
    }
    exports.verifyBreak = verifyBreak;
});
//# sourceMappingURL=verifyLoop.js.map

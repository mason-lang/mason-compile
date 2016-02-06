(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../util', './util', './verifyBlock', './verifyLocals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const context_1 = require('../context');
    const util_1 = require('../util');
    const util_2 = require('./util');
    const verifyBlock_1 = require('./verifyBlock');
    const verifyLocals_1 = require('./verifyLocals');
    const verifyVal_1 = require('./verifyVal');
    function verifyAssert(_ref) {
        let condition = _ref.condition;
        let opThrown = _ref.opThrown;

        verifyVal_1.default(condition);
        verifyVal_1.verifyOpVal(opThrown);
    }
    exports.verifyAssert = verifyAssert;
    function verifyExcept(_, sk) {
        const loc = _.loc;
        const tried = _.tried;
        const typedCatches = _.typedCatches;
        const opCatchAll = _.opCatchAll;
        const allCatches = _.allCatches;
        const opElse = _.opElse;
        const opFinally = _.opFinally;

        Op_1.caseOp(opElse, _ => {
            verifyLocals_1.plusLocals(verifyBlock_1.verifyBlockDo(tried), () => verifyBlock_1.verifyBlockSK(_, sk));
            if (util_1.isEmpty(allCatches)) context_1.warn(loc, _ => _.elseRequiresCatch);
        }, () => verifyBlock_1.verifyBlockSK(tried, sk));
        if (util_1.isEmpty(allCatches) && opFinally === null) context_1.warn(loc, _ => _.uselessExcept);
        for (const _ of typedCatches) verifyCatch(_, sk);
        Op_1.opEach(opCatchAll, _ => verifyCatch(_, sk));
        Op_1.opEach(opFinally, verifyBlock_1.verifyBlockDo);
    }
    exports.verifyExcept = verifyExcept;
    function verifyCatch(_ref2, sk) {
        let caught = _ref2.caught;
        let block = _ref2.block;

        util_2.makeUseOptionalIfFocus(caught);
        util_2.verifyNotLazy(caught, _ => _.noLazyCatch);
        verifyLocals_1.verifyAndPlusLocal(caught, () => {
            verifyBlock_1.verifyBlockSK(block, sk);
        });
    }
    function verifyThrow(_) {
        verifyVal_1.verifyOpVal(_.opThrown);
    }
    exports.verifyThrow = verifyThrow;
});
//# sourceMappingURL=verifyErrors.js.map

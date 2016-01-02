(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../util', './locals', './SK', './util', './verifyBlock'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var util_1 = require('../util');
    var locals_1 = require('./locals');
    var SK_1 = require('./SK');
    var util_2 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    function verifyExcept(_, sk) {
        const loc = _.loc;
        const _try = _.try;
        const typedCatches = _.typedCatches;
        const opCatchAll = _.opCatchAll;
        const allCatches = _.allCatches;
        const opElse = _.opElse;
        const opFinally = _.opFinally;

        SK_1.markStatement(_, sk);
        Op_1.caseOp(opElse, _ => {
            locals_1.plusLocals(verifyBlock_1.verifyBlockDo(_try), () => verifyBlock_1.verifyBlockSK(_, sk));
            if (util_1.isEmpty(allCatches)) context_1.warn(loc, _ => _.elseRequiresCatch);
        }, () => verifyBlock_1.verifyBlockSK(_try, sk));
        if (util_1.isEmpty(allCatches) && opFinally === null) context_1.warn(loc, _ => _.uselessExcept);
        for (const _ of typedCatches) verifyCatch(_, sk);
        Op_1.opEach(opCatchAll, _ => verifyCatch(_, sk));
        Op_1.opEach(opFinally, verifyBlock_1.verifyBlockDo);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyExcept;
    function verifyCatch(_ref, sk) {
        let caught = _ref.caught;
        let block = _ref.block;

        util_2.makeUseOptionalIfFocus(caught);
        util_2.verifyNotLazy(caught, _ => _.noLazyCatch);
        locals_1.verifyAndPlusLocal(caught, () => {
            verifyBlock_1.verifyBlockSK(block, sk);
        });
    }
});
//# sourceMappingURL=verifyExcept.js.map

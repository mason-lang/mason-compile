(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Case', './context', './verifyBlock', './verifyDo', './verifyLocals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const Case_1 = require('../ast/Case');
    const context_1 = require('./context');
    const verifyBlock_1 = require('./verifyBlock');
    const verifyDo_1 = require('./verifyDo');
    const verifyLocals_1 = require('./verifyLocals');
    const verifyVal_1 = require('./verifyVal');
    function verifyCase(_ref, sk) {
        let opCased = _ref.opCased;
        let parts = _ref.parts;
        let opElse = _ref.opElse;

        context_1.withIifeIfVal(sk, () => {
            const doIt = () => {
                for (const _ of parts) verifyCasePart(_, sk);
                Op_1.opEach(opElse, _ => verifyBlock_1.verifyBlockSK(_, sk));
            };
            Op_1.caseOp(opCased, _ => {
                verifyDo_1.default(_);
                verifyLocals_1.verifyAndPlusLocal(_.assignee, doIt);
            }, doIt);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyCase;
    function verifyCasePart(_ref2, sk) {
        let test = _ref2.test;
        let result = _ref2.result;

        if (test instanceof Case_1.Pattern) {
            verifyVal_1.default(test.type);
            verifyVal_1.default(test.patterned);
            verifyLocals_1.verifyAndPlusLocals(test.locals, () => verifyBlock_1.verifyBlockSK(result, sk));
        } else {
            verifyVal_1.default(test);
            verifyBlock_1.verifyBlockSK(result, sk);
        }
    }
});
//# sourceMappingURL=verifyCase.js.map

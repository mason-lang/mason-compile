(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './context', './util', './verifyBlock', './verifyLocals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('./context');
    var util_1 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyVal_1 = require('./verifyVal');
    function verifyWith(_ref, sk) {
        let value = _ref.value;
        let declare = _ref.declare;
        let block = _ref.block;

        verifyVal_1.default(value);
        context_1.withIifeIfVal(sk, () => {
            if (sk === 1) util_1.makeUseOptionalIfFocus(declare);
            verifyLocals_1.verifyAndPlusLocal(declare, () => {
                verifyBlock_1.verifyBlockDo(block);
            });
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyWith;
});
//# sourceMappingURL=verifyWith.js.map

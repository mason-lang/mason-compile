(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../util', './autoBlockKind', './context', './verifyLines', './verifyLocals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const context_1 = require('../context');
    const util_1 = require('../util');
    const autoBlockKind_1 = require('./autoBlockKind');
    const context_2 = require('./context');
    const verifyLines_1 = require('./verifyLines');
    const verifyLocals_1 = require('./verifyLocals');
    const verifyVal_1 = require('./verifyVal');
    function verifyBlockSK(_, sk) {
        if (sk === 0) verifyBlockDo(_);else verifyBlockVal(_);
    }
    exports.verifyBlockSK = verifyBlockSK;
    function verifyBlockVal(_) {
        const lines = _.lines;
        const loc = _.loc;

        context_1.check(!util_1.isEmpty(lines), loc, _ => _.blockNeedsContent);
        const kind = autoBlockKind_1.default(lines, loc);
        switch (kind) {
            case 3:
            case 4:
            case 5:
                verifyLines_1.verifyBuiltLines(lines, loc);
                break;
            case 1:
                verifyLines_1.default(lines);
                break;
            case 2:
                verifyLocals_1.plusLocals(verifyLines_1.default(util_1.rtail(lines)), () => verifyVal_1.ensureValAndVerify(util_1.last(lines)));
                break;
            default:
                throw new Error(String(kind));
        }
        context_2.results.blockToKind.set(_, kind);
    }
    exports.verifyBlockVal = verifyBlockVal;
    function verifyBlockDo(_) {
        context_2.results.blockToKind.set(_, 0);
        return verifyLines_1.default(_.lines);
    }
    exports.verifyBlockDo = verifyBlockDo;
});
//# sourceMappingURL=verifyBlock.js.map

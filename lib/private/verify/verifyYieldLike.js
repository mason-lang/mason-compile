(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/YieldLike', '../context', './context', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const YieldLike_1 = require('../ast/YieldLike');
    const context_1 = require('../context');
    const context_2 = require('./context');
    const verifyVal_1 = require('./verifyVal');
    function verifyYieldLike(_) {
        if (_ instanceof YieldLike_1.Yield) {
            const loc = _.loc;
            const opValue = _.opValue;

            context_1.check(context_2.funKind === 2, loc, _ => _.misplacedYield(18));
            verifyVal_1.verifyOpVal(opValue);
        } else if (_ instanceof YieldLike_1.YieldTo) {
            const loc = _.loc;
            const value = _.value;

            context_1.check(context_2.funKind === 2, loc, _ => _.misplacedYield(19));
            verifyVal_1.default(value);
        } else throw new Error(_.constructor.name);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyYieldLike;
});
//# sourceMappingURL=verifyYieldLike.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'op/Op', '../ast/YieldLike', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const Op_1 = require('op/Op');
    const YieldLike_1 = require('../ast/YieldLike');
    const transpileVal_1 = require('./transpileVal');
    function transpileYieldLikeNoLoc(_) {
        if (_ instanceof YieldLike_1.Yield) return new Expression_1.YieldExpression(Op_1.opMap(_.opValue, transpileVal_1.default));else if (_ instanceof YieldLike_1.YieldTo) return new Expression_1.YieldDelegateExpression(transpileVal_1.default(_.value));else throw new Error(_.constructor.name);
    }
    exports.transpileYieldLikeNoLoc = transpileYieldLikeNoLoc;
});
//# sourceMappingURL=transpileYieldLike.js.map

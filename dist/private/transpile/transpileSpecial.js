(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var context_1 = require('./context');
    function transpileSpecialValNoLoc(_) {
        switch (_.kind) {
            case 0:
                return new Expression_1.LiteralBoolean(false);
            case 1:
                return new Expression_1.LiteralString(context_1.verifyResults.name(_));
            case 2:
                return new Expression_1.LiteralNull();
            case 3:
                return new Expression_1.LiteralBoolean(true);
            case 4:
                return new Expression_1.UnaryExpression('void', LitZero);
            default:
                throw new Error(String(_.kind));
        }
    }
    exports.transpileSpecialValNoLoc = transpileSpecialValNoLoc;
    const LitZero = new Expression_1.LiteralNumber(0);
});
//# sourceMappingURL=transpileSpecial.js.map

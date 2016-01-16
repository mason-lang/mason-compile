(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var transpileVal_1 = require('./transpileVal');
    function transpileAwaitNoLoc(_ref) {
        let value = _ref.value;

        return new Expression_1.YieldExpression(transpileVal_1.default(value));
    }
    exports.transpileAwaitNoLoc = transpileAwaitNoLoc;
});
//# sourceMappingURL=transpileAwait.js.map

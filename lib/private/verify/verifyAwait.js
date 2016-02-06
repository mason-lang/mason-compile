(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', './context', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const context_1 = require('../context');
    const context_2 = require('./context');
    const verifyVal_1 = require('./verifyVal');
    function verifyAwait(_ref) {
        let loc = _ref.loc;
        let value = _ref.value;

        context_1.check(context_2.funKind === 1, loc, _ => _.misplacedAwait);
        verifyVal_1.default(value);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyAwait;
});
//# sourceMappingURL=verifyAwait.js.map

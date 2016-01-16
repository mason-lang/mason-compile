(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './verifyDo', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var verifyDo_1 = require('./verifyDo');
    var verifyVal_1 = require('./verifyVal');
    function verifySK(_, sk) {
        (sk === 1 ? verifyVal_1.ensureValAndVerify : verifyDo_1.ensureDoAndVerify)(_);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifySK;
});
//# sourceMappingURL=verifySK.js.map

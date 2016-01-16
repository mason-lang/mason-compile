(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './context', './verifyLocals', './verifyModule'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('./context');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyModule_1 = require('./verifyModule');
    function verify(module) {
        context_1.setup();
        verifyModule_1.default(module);
        verifyLocals_1.warnUnusedLocals();
        const res = context_1.results;
        context_1.tearDown();
        return res;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verify;
});
//# sourceMappingURL=verify.js.map

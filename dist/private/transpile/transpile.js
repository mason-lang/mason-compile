(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './context', './transpileModule'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('./context');
    var transpileModule_1 = require('./transpileModule');
    function transpile(moduleExpression, verifyResults) {
        context_1.setup(verifyResults);
        const res = transpileModule_1.default(moduleExpression);
        context_1.tearDown();
        return res;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpile;
});
//# sourceMappingURL=transpile.js.map

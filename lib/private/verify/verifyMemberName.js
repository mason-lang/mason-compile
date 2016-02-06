(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const verifyVal_1 = require('./verifyVal');
    function verifyMemberName(_) {
        if (typeof _ !== 'string') verifyVal_1.default(_);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyMemberName;
});
//# sourceMappingURL=verifyMemberName.js.map

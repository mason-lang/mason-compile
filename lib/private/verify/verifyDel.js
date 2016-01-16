(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var verifyVal_1 = require('./verifyVal');
    function verifyDel(_ref) {
        let subbed = _ref.subbed;
        let args = _ref.args;

        verifyVal_1.default(subbed);
        verifyVal_1.verifyEachVal(args);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyDel;
});
//# sourceMappingURL=verifyDel.js.map

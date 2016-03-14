(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    function isDigitDecimal(_) {
        return inRange(_, 48, 57);
    }
    exports.isDigitDecimal = isDigitDecimal;
    function inRange(_, min, max) {
        return min <= _ && _ <= max;
    }
});
//# sourceMappingURL=chars.js.map

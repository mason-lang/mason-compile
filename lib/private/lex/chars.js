(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    function isDigitBinary(_) {
        return _ === 48 || _ === 49;
    }
    exports.isDigitBinary = isDigitBinary;
    function isDigitOctal(_) {
        return inRange(_, 48, 55);
    }
    exports.isDigitOctal = isDigitOctal;
    function isDigitDecimal(_) {
        return inRange(_, 48, 57);
    }
    exports.isDigitDecimal = isDigitDecimal;
    function isDigitHex(_) {
        return isDigitDecimal(_) || inRange(_, 97, 102);
    }
    exports.isDigitHex = isDigitHex;
    function inRange(_, min, max) {
        return min <= _ && _ <= max;
    }
    function isNameCharacter(_) {
        switch (_) {
            case 96:
            case 38:
            case 40:
            case 41:
            case 91:
            case 93:
            case 123:
            case 125:
            case 124:
            case 58:
            case 39:
            case 34:
            case 46:
            case 32:
            case 10:
            case 9:
            case 35:
            case 94:
            case 92:
            case 59:
            case 44:
                return false;
            default:
                return true;
        }
    }
    exports.isNameCharacter = isNameCharacter;
});
//# sourceMappingURL=chars.js.map

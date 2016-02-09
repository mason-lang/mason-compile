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
        return !(_ < nameCharacters.length && nameCharacters[_] === 0);
    }
    exports.isNameCharacter = isNameCharacter;
    const nameCharacters = new Uint8Array(128);
    for (let i = 0; i < 128; i++) nameCharacters[i] = 1;
    const notNameCharacters = [96, 38, 40, 41, 91, 93, 123, 125, 124, 58, 39, 34, 46, 32, 10, 9, 35, 94, 92, 59, 44];
    for (const _ of notNameCharacters) nameCharacters[_] = 0;
});
//# sourceMappingURL=chars.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    function charPred(chars) {
        let negate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        let src = 'switch(ch) {\n';
        for (let i = 0; i < chars.length; i = i + 1) src = `${ src }case ${ chars.charCodeAt(i) }: `;
        src = `${ src } return ${ !negate }\ndefault: return ${ negate }\n}`;
        return Function('ch', src);
    }
    exports.isDigit = charPred('0123456789'), exports.isDigitBinary = charPred('01'), exports.isDigitOctal = charPred('01234567'), exports.isDigitHex = charPred('0123456789abcdef');
    const reservedCharacters = '#%^\\;,';
    exports.isNameCharacter = charPred(`\`&()[]{}|:'". \n\t${ reservedCharacters }`, true);
});
//# sourceMappingURL=chars.js.map

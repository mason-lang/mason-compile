(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../token/Token', './chars', './groupContext', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const Token_1 = require('../token/Token');
    const chars_1 = require('./chars');
    const groupContext_1 = require('./groupContext');
    const sourceContext_1 = require('./sourceContext');
    function lexNumber(startPos) {
        const startIndex = sourceContext_1.index - 1;
        if (sourceContext_1.peek(-1) === 48) {
            const p = sourceContext_1.peek();
            switch (p) {
                case 98:
                case 111:
                case 120:
                    {
                        sourceContext_1.skip();
                        const isDigitSpecial = p === 98 ? chars_1.isDigitBinary : p === 111 ? chars_1.isDigitOctal : chars_1.isDigitHex;
                        sourceContext_1.skipWhile(isDigitSpecial);
                        break;
                    }
                case 46:
                    skipAfterDecimalPoint();
                    break;
                default:
                    skipNormalNumber();
            }
        } else skipNormalNumber();
        const str = sourceContext_1.sourceString.slice(startIndex, sourceContext_1.index);
        const loc = new Loc_1.default(startPos, sourceContext_1.pos());
        groupContext_1.addToCurrentGroup(new Token_1.NumberToken(loc, str));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexNumber;
    function skipAfterDecimalPoint() {
        if (chars_1.isDigitDecimal(sourceContext_1.peek(1))) {
            sourceContext_1.skip();
            sourceContext_1.skipWhile(chars_1.isDigitDecimal);
        }
    }
    function skipNormalNumber() {
        sourceContext_1.skipWhile(chars_1.isDigitDecimal);
        if (sourceContext_1.peek() === 46) skipAfterDecimalPoint();
    }
});
//# sourceMappingURL=lexNumber.js.map

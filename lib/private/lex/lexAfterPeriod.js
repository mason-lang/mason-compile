(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../token/Group', './groupContext', './sourceContext', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Group_1 = require('../token/Group');
    const groupContext_1 = require('./groupContext');
    const sourceContext_1 = require('./sourceContext');
    const util_1 = require('./util');
    function lexAfterPeriod(startPos) {
        function kw(kind) {
            util_1.addKeywordPlain(startPos, kind);
        }
        function funKw(opts) {
            util_1.addKeywordFun(startPos, opts);
        }
        const peeked = sourceContext_1.peek();
        switch (peeked) {
            case 32:
            case 10:
                groupContext_1.closeSpaceOKIfEmpty(startPos);
                kw(23);
                break;
            case 125:
                groupContext_1.closeSpaceOKIfEmpty(startPos);
                kw(23);
                groupContext_1.openGroup(sourceContext_1.pos(), Group_1.GroupSpace);
                break;
            case 46:
                sourceContext_1.skip();
                if (sourceContext_1.tryEat(46)) kw(27);else kw(42);
                break;
            case 92:
                sourceContext_1.skip();
                funKw({ isThisFun: true });
                break;
            case 33:
                if (sourceContext_1.peek(1) === 92) {
                    sourceContext_1.skip(2);
                    funKw({ isDo: true, isThisFun: true });
                } else kw(41);
                break;
            case 42:
            case 36:
                const kind = peeked === 42 ? 2 : 1;
                if (sourceContext_1.peek(1) === 92) {
                    sourceContext_1.skip(2);
                    funKw({ isThisFun: true, kind: kind });
                } else if (sourceContext_1.peek(1) === 33 && sourceContext_1.peek(2) === 92) {
                    sourceContext_1.skip(3);
                    funKw({ isDo: true, isThisFun: true, kind: kind });
                } else kw(41);
                break;
            default:
                kw(41);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexAfterPeriod;
});
//# sourceMappingURL=lexAfterPeriod.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../token/Keyword'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Keyword_1 = require('../token/Keyword');
    function parseMethodSplit(tokens) {
        return Op_1.caseOp(tokens.opSplitOnce(_ => Keyword_1.isAnyKeyword(funKeywords, _)), _ref => {
            let before = _ref.before;
            let at = _ref.at;
            let after = _ref.after;
            return { before: before, kind: methodFunKind(at), after: after };
        }, () => {
            throw context_1.fail(tokens.loc, _ => _.expectedMethodSplit);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseMethodSplit;
    function methodFunKind(funKindToken) {
        switch (funKindToken.kind) {
            case 107:
                return 109;
            case 108:
                return 110;
            case 111:
                return 113;
            case 112:
                return 114;
            case 115:
                return 117;
            case 116:
                return 118;
            case 109:
            case 110:
            case 113:
            case 114:
            case 117:
            case 118:
                throw context_1.fail(funKindToken.loc, _ => _.implicitFunctionDot);
            default:
                throw context_1.fail(funKindToken.loc, _ => _.expectedFuncKind(funKindToken));
        }
    }
    const funKeywords = new Set([107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]);
});
//# sourceMappingURL=parseMethodSplit.js.map

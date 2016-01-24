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
        return Op_1.caseOp(tokens.opSplitOnce(Keyword_1.isFunKeyword), _ref => {
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
            case 114:
                return 116;
            case 115:
                return 117;
            case 118:
                return 120;
            case 119:
                return 121;
            case 122:
                return 124;
            case 123:
                return 125;
            default:
                throw context_1.fail(funKindToken.loc, _ => _.implicitFunctionDot);
        }
    }
});
//# sourceMappingURL=parseMethodSplit.js.map

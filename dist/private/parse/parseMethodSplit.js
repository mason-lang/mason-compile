(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Token_1 = require('../Token');
    function parseMethodSplit(tokens) {
        return Op_1.caseOp(tokens.opSplitOnce(_ => Token_1.isAnyKeyword(funKeywords, _)), _ref => {
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
            case 65:
                return 67;
            case 66:
                return 68;
            case 69:
                return 71;
            case 70:
                return 72;
            case 73:
                return 75;
            case 74:
                return 76;
            case 67:
            case 68:
            case 71:
            case 72:
            case 75:
            case 76:
                throw context_1.fail(funKindToken.loc, _ => _.implicitFunctionDot);
            default:
                throw context_1.fail(funKindToken.loc, _ => _.expectedFuncKind(funKindToken));
        }
    }
    const funKeywords = new Set([65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76]);
});
//# sourceMappingURL=parseMethodSplit.js.map

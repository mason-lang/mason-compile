(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../token/Keyword'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const context_1 = require('../context');
    const Keyword_1 = require('../token/Keyword');
    function parseMethodSplit(tokens) {
        return Op_1.caseOp(tokens.opSplitOnce(_ => _ instanceof Keyword_1.KeywordFun), _ref => {
            let before = _ref.before;
            let atToken = _ref.at;
            let after = _ref.after;
            const loc = atToken.loc;
            const options = atToken.options;

            context_1.check(!options.isThisFun, loc, _ => _.implicitFunctionDot);
            options.isThisFun = true;
            return { before: before, options: options, after: after };
        }, () => {
            throw context_1.fail(tokens.loc, _ => _.expectedMethodSplit);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseMethodSplit;
});
//# sourceMappingURL=parseMethodSplit.js.map

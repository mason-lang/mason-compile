(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Del', '../context', '../token/Group', './checks', './parseExpr', './parseSpaced', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Del_1 = require('../ast/Del');
    var context_1 = require('../context');
    var Group_1 = require('../token/Group');
    var checks_1 = require('./checks');
    var parseExpr_1 = require('./parseExpr');
    var parseSpaced_1 = require('./parseSpaced');
    var Slice_1 = require('./Slice');
    function parseDel(tokens) {
        context_1.check(tokens.size() === 1, tokens.loc, _ => _.argsDel);
        const spaced = tokens.head();
        if (spaced instanceof Group_1.GroupSpace) {
            const parts = Slice_1.Tokens.of(spaced);
            const last = parts.last();
            if (last instanceof Group_1.GroupBracket) {
                const object = parseSpaced_1.default(parts.rtail());
                const args = parseExpr_1.parseExprParts(Slice_1.Tokens.of(last));
                return new Del_1.default(tokens.loc, object, args);
            } else throw checks_1.unexpected(spaced);
        } else throw checks_1.unexpected(spaced);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseDel;
});
//# sourceMappingURL=parseDel.js.map

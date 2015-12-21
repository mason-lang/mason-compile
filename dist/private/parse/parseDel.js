(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../MsAst', './checks', '../Token', './parse*', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var checks_1 = require('./checks');
    var Token_1 = require('../Token');
    var parse_1 = require('./parse*');
    var Slice_1 = require('./Slice');
    function parseDel(tokens) {
        context_1.check(tokens.size() === 1, tokens.loc, _ => _.argsDel);
        const spaced = tokens.head();
        if (spaced instanceof Token_1.GroupSpace) {
            const parts = Slice_1.Tokens.of(spaced);
            const last = parts.last();
            if (last instanceof Token_1.GroupBracket) {
                const object = parse_1.parseSpaced(parts.rtail());
                const args = parse_1.parseExprParts(Slice_1.Tokens.of(last));
                return new MsAst_1.Del(tokens.loc, object, args);
            } else throw checks_1.unexpected(spaced);
        } else throw checks_1.unexpected(spaced);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseDel;
});
//# sourceMappingURL=parseDel.js.map

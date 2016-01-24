(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/locals', '../ast/Val', '../context', '../token/Group', '../token/Keyword', '../token/Token', './checks', './parseBlock', './parseExpr', './parseQuote', './parseSpaced', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var locals_1 = require('../ast/locals');
    var Val_1 = require('../ast/Val');
    var context_1 = require('../context');
    var Group_1 = require('../token/Group');
    var Keyword_1 = require('../token/Keyword');
    var Token_1 = require('../token/Token');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseExpr_1 = require('./parseExpr');
    var parseQuote_1 = require('./parseQuote');
    var parseSpaced_1 = require('./parseSpaced');
    var Slice_1 = require('./Slice');
    function parseSingle(token) {
        let isInSpaced = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        const loc = token.loc;

        if (token instanceof Token_1.NameToken) return new locals_1.LocalAccess(loc, token.name);else if (token instanceof Group_1.default) {
            if (token instanceof Group_1.GroupSpace) return parseSpaced_1.default(Slice_1.Tokens.of(token));else if (token instanceof Group_1.GroupParenthesis) {
                const slice = Slice_1.Tokens.of(token);
                if (slice.size() === 1 && !isInSpaced) context_1.warn(slice.loc, _ => _.extraParens);
                return parseExpr_1.default(slice);
            } else if (token instanceof Group_1.GroupBracket) return new Val_1.BagSimple(loc, parseExpr_1.parseExprParts(Slice_1.Tokens.of(token)));else if (token instanceof Group_1.GroupBlock) return parseBlock_1.parseBlockWrap(Slice_1.Lines.of(token));else if (token instanceof Group_1.GroupQuote) return parseQuote_1.default(Slice_1.default.of(token));else if (token instanceof Group_1.GroupRegExp) return parseQuote_1.parseRegExp(Slice_1.default.of(token), token.flags);else throw new Error(String(token.type));
        } else if (token instanceof Token_1.NumberToken) return new Val_1.NumberLiteral(token.loc, token.value);else if (token instanceof Keyword_1.default) switch (token.kind) {
            case 109:
                return locals_1.LocalAccess.focus(loc);
            default:
                return Op_1.orThrow(Op_1.opMap(Keyword_1.opKeywordKindToSpecialValueKind(token.kind), _ => new Val_1.SpecialVal(loc, _)), () => checks_1.unexpected(token));
        } else throw checks_1.unexpected(token);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseSingle;
});
//# sourceMappingURL=parseSingle.js.map

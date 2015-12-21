(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseQuote', './parse*', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseQuote_1 = require('./parseQuote');
    var parse_1 = require('./parse*');
    var Slice_1 = require('./Slice');
    function parseSingle(token) {
        let isInSpaced = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        const loc = token.loc;

        if (token instanceof Token_1.Name) return new MsAst_1.LocalAccess(loc, token.name);else if (token instanceof Token_1.Group) {
            if (token instanceof Token_1.GroupSpace) return parse_1.parseSpaced(Slice_1.Tokens.of(token));else if (token instanceof Token_1.GroupParenthesis) {
                const slice = Slice_1.Tokens.of(token);
                if (slice.size() === 1 && !isInSpaced) context_1.warn(slice.loc, _ => _.extraParens);
                return parse_1.parseExpr(slice);
            } else if (token instanceof Token_1.GroupBracket) return new MsAst_1.BagSimple(loc, parse_1.parseExprParts(Slice_1.Tokens.of(token)));else if (token instanceof Token_1.GroupBlock) return parseBlock_1.parseBlockWrap(Slice_1.Lines.of(token));else if (token instanceof Token_1.GroupQuote) return parseQuote_1.default(Slice_1.default.of(token));else if (token instanceof Token_1.GroupRegExp) return parseQuote_1.parseRegExp(Slice_1.default.of(token), token.flags);else throw new Error(String(token.type));
        } else if (token instanceof Token_1.NumberToken) return new MsAst_1.NumberLiteral(token.loc, token.value);else if (token instanceof Token_1.Keyword) switch (token.kind) {
            case 60:
                return MsAst_1.LocalAccess.focus(loc);
            default:
                return Op_1.orThrow(Op_1.opMap(Token_1.opKeywordKindToSpecialValueKind(token.kind), _ => new MsAst_1.SpecialVal(loc, _)), () => checks_1.unexpected(token));
        } else throw checks_1.unexpected(token);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseSingle;
});
//# sourceMappingURL=parseSingle.js.map

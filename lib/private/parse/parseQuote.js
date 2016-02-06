(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/locals', '../ast/Quote', '../token/Keyword', '../token/Token', '../util', './parseExpr', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    const locals_1 = require('../ast/locals');
    const Quote_1 = require('../ast/Quote');
    const Keyword_1 = require('../token/Keyword');
    const Token_1 = require('../token/Token');
    const util_1 = require('../util');
    const parseExpr_1 = require('./parseExpr');
    const Slice_1 = require('./Slice');
    function parseQuote(tokens) {
        return new Quote_1.QuoteTemplate(tokens.loc, parseParts(tokens));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseQuote;
    function parseRegExp(tokens, flags) {
        return new Quote_1.MsRegExp(tokens.loc, parseParts(tokens), flags);
    }
    exports.parseRegExp = parseRegExp;
    function parseParts(tokens) {
        return tokens.map(_ => {
            if (_ instanceof Token_1.StringToken) return _.value;else if (_ instanceof Token_1.NameToken) return new locals_1.LocalAccess(_.loc, _.name);else if (_ instanceof Keyword_1.default) {
                util_1.assert(_.kind === 109);
                return locals_1.LocalAccess.focus(_.loc);
            } else return parseExpr_1.default(Slice_1.Tokens.of(_));
        });
    }
});
//# sourceMappingURL=parseQuote.js.map

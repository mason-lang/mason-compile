(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/locals', '../ast/Val', '../token/Keyword', '../token/Token', '../util', './parseExpr', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var locals_1 = require('../ast/locals');
    var Val_1 = require('../ast/Val');
    var Keyword_1 = require('../token/Keyword');
    var Token_1 = require('../token/Token');
    var util_1 = require('../util');
    var parseExpr_1 = require('./parseExpr');
    var Slice_1 = require('./Slice');
    function parseQuote(tokens) {
        return new Val_1.QuotePlain(tokens.loc, parseParts(tokens));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseQuote;
    function parseRegExp(tokens, flags) {
        return new Val_1.MsRegExp(tokens.loc, parseParts(tokens), flags);
    }
    exports.parseRegExp = parseRegExp;
    function parseParts(tokens) {
        return tokens.map(_ => {
            if (_ instanceof Token_1.StringToken) return _.value;else if (_ instanceof Token_1.NameToken) return new locals_1.LocalAccess(_.loc, _.name);else if (_ instanceof Keyword_1.default) {
                util_1.assert(_.kind === 102);
                return locals_1.LocalAccess.focus(_.loc);
            } else return parseExpr_1.default(Slice_1.Tokens.of(_));
        });
    }
});
//# sourceMappingURL=parseQuote.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../MsAst', '../Token', '../util', './parseExpr', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var util_1 = require('../util');
    var parseExpr_1 = require('./parseExpr');
    var Slice_1 = require('./Slice');
    function parseQuote(tokens) {
        return new MsAst_1.QuotePlain(tokens.loc, parseParts(tokens));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseQuote;
    function parseRegExp(tokens, flags) {
        return new MsAst_1.MsRegExp(tokens.loc, parseParts(tokens), flags);
    }
    exports.parseRegExp = parseRegExp;
    function parseParts(tokens) {
        return tokens.map(_ => {
            if (_ instanceof Token_1.StringToken) return _.value;else if (_ instanceof Token_1.Name) return new MsAst_1.LocalAccess(_.loc, _.name);else if (_ instanceof Token_1.Keyword) {
                util_1.assert(_.kind === 60);
                return MsAst_1.LocalAccess.focus(_.loc);
            } else return parseExpr_1.default(Slice_1.Tokens.of(_));
        });
    }
});
//# sourceMappingURL=parseQuote.js.map

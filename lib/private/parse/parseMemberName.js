(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../token/Group', './checks', './parseExpr', './parseName', './parseQuote', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const Group_1 = require('../token/Group');
    const checks_1 = require('./checks');
    const parseExpr_1 = require('./parseExpr');
    const parseName_1 = require('./parseName');
    const parseQuote_1 = require('./parseQuote');
    const Slice_1 = require('./Slice');
    function parseMemberName(token) {
        const name = parseName_1.tryParseName(token);
        if (Op_1.nonNull(name)) return name;else if (token instanceof Group_1.GroupQuote) return parseQuote_1.default(Slice_1.default.of(token));else if (token instanceof Group_1.GroupParenthesis) return parseExpr_1.default(Slice_1.Tokens.of(token));else throw checks_1.unexpected(token);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseMemberName;
});
//# sourceMappingURL=parseMemberName.js.map

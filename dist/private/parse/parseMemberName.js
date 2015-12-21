(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../Token', './checks', './parseName', './parseQuote', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var Token_1 = require('../Token');
    var checks_1 = require('./checks');
    var parseName_1 = require('./parseName');
    var parseQuote_1 = require('./parseQuote');
    var Slice_1 = require('./Slice');
    function parseMemberName(token) {
        const name = parseName_1.tryParseName(token);
        if (Op_1.nonNull(name)) return name;else if (token instanceof Token_1.GroupQuote) return parseQuote_1.default(Slice_1.default.of(token));else throw checks_1.unexpected(token);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseMemberName;
});
//# sourceMappingURL=parseMemberName.js.map

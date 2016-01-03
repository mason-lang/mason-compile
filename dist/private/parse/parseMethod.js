(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Method', './checks', './parseFun', './parseMethodSplit'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Method_1 = require('../ast/Method');
    var checks_1 = require('./checks');
    var parseFun_1 = require('./parseFun');
    var parseMethodSplit_1 = require('./parseMethodSplit');
    function parseMethod(tokens) {
        var _parseMethodSplit_1$d = parseMethodSplit_1.default(tokens);

        const before = _parseMethodSplit_1$d.before;
        const kind = _parseMethodSplit_1$d.kind;
        const after = _parseMethodSplit_1$d.after;

        checks_1.checkEmpty(before, _ => _.unexpectedAfterMethod);
        return new Method_1.default(tokens.loc, parseFun_1.parseFunLike(kind, after));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseMethod;
});
//# sourceMappingURL=parseMethod.js.map

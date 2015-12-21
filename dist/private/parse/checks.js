(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var Token_1 = require('../Token');
    function checkEmpty(tokens, message) {
        context_1.check(tokens.isEmpty(), tokens.loc, message);
    }
    exports.checkEmpty = checkEmpty;
    function checkNonEmpty(tokens, message) {
        context_1.check(!tokens.isEmpty(), tokens.loc, message);
    }
    exports.checkNonEmpty = checkNonEmpty;
    function checkKeyword(keyword, token) {
        context_1.check(Token_1.isKeyword(keyword, token), token.loc, _ => _.expectedKeyword(keyword));
    }
    exports.checkKeyword = checkKeyword;
    function unexpected(token) {
        return context_1.fail(token.loc, _ => Token_1.isReservedKeyword(token) ? _.reservedWord(token) : _.unexpected(token));
    }
    exports.unexpected = unexpected;
});
//# sourceMappingURL=checks.js.map

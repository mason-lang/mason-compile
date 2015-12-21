(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './private/Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Token_1 = require('./private/Token');
    exports.keywords = Token_1.allKeywords.map(Token_1.keywordName).sort();
    exports.reservedKeywords = Token_1.reservedKeywords.map(Token_1.keywordName).sort();
});
//# sourceMappingURL=info.js.map

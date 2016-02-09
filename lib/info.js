(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './private/token/Keyword', './private/token/keywordNames'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Keyword_1 = require('./private/token/Keyword');
    const keywordNames_1 = require('./private/token/keywordNames');
    exports.keywords = Array.from(Keyword_1.allKeywords).sort();
    exports.reservedKeywords = Array.from(keywordNames_1.reservedWords).sort();
});
//# sourceMappingURL=info.js.map

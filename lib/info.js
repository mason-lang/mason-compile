(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './private/token/Keyword'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Keyword_1 = require('./private/token/Keyword');
    exports.keywords = Keyword_1.allKeywords.map(Keyword_1.keywordName).sort();
    exports.reservedKeywords = Array.from(Keyword_1.reservedKeywords()).map(Keyword_1.keywordName).sort();
});
//# sourceMappingURL=info.js.map

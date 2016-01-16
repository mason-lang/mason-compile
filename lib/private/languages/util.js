(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../token/Keyword'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Keyword_1 = require('../token/Keyword');
    function code(str) {
        return `{{${ str }}}`;
    }
    exports.code = code;
    function showChar(char) {
        return code(String.fromCharCode(char));
    }
    exports.showChar = showChar;
    function showKeyword(kind) {
        return code(Keyword_1.keywordName(kind));
    }
    exports.showKeyword = showKeyword;
});
//# sourceMappingURL=util.js.map

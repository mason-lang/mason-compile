(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './lexQuote', './lex*'], factory);
    }
})(function (require, exports) {
    "use strict";

    var lexQuote_1 = require('./lexQuote');
    var lex_1 = require('./lex*');
    lex_1.load(lexQuote_1.default);
});
//# sourceMappingURL=loadLex*.js.map

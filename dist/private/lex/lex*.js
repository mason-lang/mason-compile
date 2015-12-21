(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    function load(_lexQuote) {
        exports.lexQuote = _lexQuote;
    }
    exports.load = load;
});
//# sourceMappingURL=lex*.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './english'], factory);
    }
})(function (require, exports) {
    "use strict";

    const english_1 = require('./english');
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = { english: english_1.default };
});
//# sourceMappingURL=allLanguages.js.map

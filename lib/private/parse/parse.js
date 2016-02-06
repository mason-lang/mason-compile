(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './parseModule', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    const parseModule_1 = require('./parseModule');
    const Slice_1 = require('./Slice');
    function parse(rootToken) {
        return parseModule_1.default(Slice_1.Lines.of(rootToken));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parse;
});
//# sourceMappingURL=parse.js.map

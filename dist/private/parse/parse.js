(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './loadParse*', './parseModule', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    require('./loadParse*');
    var parseModule_1 = require('./parseModule');
    var Slice_1 = require('./Slice');
    function parse(rootToken) {
        return parseModule_1.default(Slice_1.Lines.of(rootToken));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parse;
});
//# sourceMappingURL=parse.js.map

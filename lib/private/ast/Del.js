(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    class Del extends LineContent_1.ValOrDo {
        constructor(loc, subbed, args) {
            super(loc);
            this.subbed = subbed;
            this.args = args;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Del;
});
//# sourceMappingURL=Del.js.map

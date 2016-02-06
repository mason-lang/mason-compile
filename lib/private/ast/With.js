(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    class With extends LineContent_1.ValOrDo {
        constructor(loc, declare, value, block) {
            super(loc);
            this.declare = declare;
            this.value = value;
            this.block = block;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = With;
});
//# sourceMappingURL=With.js.map

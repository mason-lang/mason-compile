(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    class Method extends LineContent_1.ValOnly {
        constructor(loc, fun) {
            super(loc);
            this.fun = fun;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Method;
});
//# sourceMappingURL=Method.js.map

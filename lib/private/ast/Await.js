(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    class Await extends LineContent_1.ValOrDo {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Await;
});
//# sourceMappingURL=Await.js.map

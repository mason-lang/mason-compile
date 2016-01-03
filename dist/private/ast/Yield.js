(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    class Yield extends LineContent_1.ValOrDo {
        constructor(loc) {
            let opValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            super(loc);
            this.opValue = opValue;
        }
    }
    exports.Yield = Yield;
    class YieldTo extends LineContent_1.ValOrDo {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.YieldTo = YieldTo;
});
//# sourceMappingURL=Yield.js.map

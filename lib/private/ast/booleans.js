(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    class Conditional extends LineContent_1.ValOrDo {
        constructor(loc, test, result, isUnless) {
            super(loc);
            this.test = test;
            this.result = result;
            this.isUnless = isUnless;
        }
    }
    exports.Conditional = Conditional;
    class Cond extends LineContent_1.ValOrDo {
        constructor(loc, test, ifTrue, ifFalse) {
            super(loc);
            this.test = test;
            this.ifTrue = ifTrue;
            this.ifFalse = ifFalse;
        }
    }
    exports.Cond = Cond;
});
//# sourceMappingURL=booleans.js.map

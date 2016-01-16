(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    class Call extends LineContent_1.ValOrDo {
        constructor(loc, called, args) {
            super(loc);
            this.called = called;
            this.args = args;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Call;
    class New extends LineContent_1.ValOnly {
        constructor(loc, type, args) {
            super(loc);
            this.type = type;
            this.args = args;
        }
    }
    exports.New = New;
    class Spread extends LineContent_1.ValOnly {
        constructor(loc, spreaded) {
            super(loc);
            this.spreaded = spreaded;
        }
    }
    exports.Spread = Spread;
});
//# sourceMappingURL=Call.js.map

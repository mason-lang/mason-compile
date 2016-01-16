(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    var MsAst_1 = require('./MsAst');
    class Switch extends LineContent_1.ValOrDo {
        constructor(loc, switched, parts, opElse) {
            super(loc);
            this.switched = switched;
            this.parts = parts;
            this.opElse = opElse;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Switch;
    class SwitchPart extends MsAst_1.default {
        constructor(loc, values, result) {
            super(loc);
            this.values = values;
            this.result = result;
        }
    }
    exports.SwitchPart = SwitchPart;
});
//# sourceMappingURL=Switch.js.map

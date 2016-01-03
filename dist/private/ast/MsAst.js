(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    class MsAst {
        constructor(loc) {
            this.loc = loc;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MsAst;
});
//# sourceMappingURL=MsAst.js.map

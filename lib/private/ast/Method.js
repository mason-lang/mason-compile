(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    const MsAst_1 = require('./MsAst');
    class Method extends LineContent_1.ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Method;
    class FunAbstract extends MsAst_1.default {
        constructor(loc, args, opRestArg, opReturnType, opComment) {
            super(loc);
            this.args = args;
            this.opRestArg = opRestArg;
            this.opReturnType = opReturnType;
            this.opComment = opComment;
            this.opReturnType = opReturnType;
        }
    }
    exports.FunAbstract = FunAbstract;
});
//# sourceMappingURL=Method.js.map

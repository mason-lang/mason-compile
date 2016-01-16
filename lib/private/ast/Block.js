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
    class Block extends MsAst_1.default {
        constructor(loc, opComment, lines) {
            super(loc);
            this.opComment = opComment;
            this.lines = lines;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Block;
    class BlockWrap extends LineContent_1.ValOnly {
        constructor(loc, block) {
            super(loc);
            this.block = block;
        }
    }
    exports.BlockWrap = BlockWrap;
});
//# sourceMappingURL=Block.js.map

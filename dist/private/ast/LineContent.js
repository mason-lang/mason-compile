(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    var MsAst_1 = require('./MsAst');
    class LineContent extends MsAst_1.default {
        isLineContent() {}
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = LineContent;
    function isVal(_) {
        return 'isVal' in _;
    }
    exports.isVal = isVal;
    function isDo(_) {
        return 'isDo' in _;
    }
    exports.isDo = isDo;
    class ValOrDo extends LineContent {
        isVal() {}
        isDo() {}
    }
    exports.ValOrDo = ValOrDo;
    class DoOnly extends LineContent {
        isDo() {}
        isDoOnly() {}
    }
    exports.DoOnly = DoOnly;
    class ValOnly extends LineContent {
        isVal() {}
        isValOnly() {}
    }
    exports.ValOnly = ValOnly;
});
//# sourceMappingURL=LineContent.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var context_1 = require('./context');
    function transpileSpecialDo() {
        switch (this.kind) {
            case 0:
                return new ast_1.DebuggerStatement();
            default:
                throw new Error(this.kind);
        }
    }
    exports.transpileSpecialDo = transpileSpecialDo;
    function transpileSpecialVal() {
        switch (this.kind) {
            case 0:
                return new ast_1.LiteralBoolean(false);
            case 1:
                return new ast_1.LiteralString(context_1.verifyResults.name(this));
            case 2:
                return new ast_1.LiteralNull();
            case 3:
                return new ast_1.LiteralBoolean(true);
            case 4:
                return new ast_1.UnaryExpression('void', LitZero);
            default:
                throw new Error(String(this.kind));
        }
    }
    exports.transpileSpecialVal = transpileSpecialVal;
    const LitZero = new ast_1.LiteralNumber(0);
});
//# sourceMappingURL=transpileSpecial.js.map

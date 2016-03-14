(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', './sourceContext'], factory);
    }
})(function (require, exports) {
    "use strict";

    const context_1 = require('../context');
    const sourceContext_1 = require('./sourceContext');
    function lexIndent() {
        const optIndent = context_1.compileOptions.indent;
        if (typeof optIndent === 'number') {
            const spaces = sourceContext_1.skipSpaces();
            context_1.check(spaces % optIndent === 0, sourceContext_1.pos, _ => _.badSpacedIndent(optIndent));
            return spaces / optIndent;
        } else {
            const indent = sourceContext_1.skipTabs();
            context_1.check(sourceContext_1.peek() !== 32, sourceContext_1.pos, _ => _.noLeadingSpace);
            return indent;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexIndent;
});
//# sourceMappingURL=lexIndent.js.map

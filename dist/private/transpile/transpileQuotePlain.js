(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', '../util', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('../util');
    var util_2 = require('./util');
    function default_1() {
        if (util_1.isEmpty(this.parts)) return LitEmptyString;else {
            const quasis = [];
            const expressions = [];
            if (typeof this.parts[0] !== 'string') quasis.push(ast_1.TemplateElement.empty);
            for (const part of this.parts) if (typeof part === 'string') quasis.push(ast_1.TemplateElement.forRawString(part));else {
                if (quasis.length === expressions.length) quasis.push(ast_1.TemplateElement.empty);
                expressions.push(util_2.t0(part));
            }
            if (quasis.length === expressions.length) quasis.push(ast_1.TemplateElement.empty);
            return new ast_1.TemplateLiteral(quasis, expressions);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const LitEmptyString = new ast_1.LiteralString('');
});
//# sourceMappingURL=transpileQuotePlain.js.map

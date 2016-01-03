(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', '../util', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var util_1 = require('../util');
    var transpileVal_1 = require('./transpileVal');
    var util_2 = require('./util');
    function transpileQuotePlain(_) {
        return util_2.loc(_, transpileQuotePlainNoLoc(_));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileQuotePlain;
    function transpileQuotePlainNoLoc(_ref) {
        let parts = _ref.parts;

        if (util_1.isEmpty(parts)) return new Expression_1.TemplateLiteral([Expression_1.TemplateElement.empty], []);else {
            const quasis = [];
            const expressions = [];
            if (typeof parts[0] !== 'string') quasis.push(Expression_1.TemplateElement.empty);
            for (const part of parts) if (typeof part === 'string') quasis.push(Expression_1.TemplateElement.forRawString(part));else {
                if (quasis.length === expressions.length) quasis.push(Expression_1.TemplateElement.empty);
                expressions.push(transpileVal_1.default(part));
            }
            if (quasis.length === expressions.length) quasis.push(Expression_1.TemplateElement.empty);
            return new Expression_1.TemplateLiteral(quasis, expressions);
        }
    }
    exports.transpileQuotePlainNoLoc = transpileQuotePlainNoLoc;
});
//# sourceMappingURL=transpileQuotePlain.js.map

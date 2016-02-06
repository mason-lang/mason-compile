(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Literal', 'esast/lib/TemplateLiteral', '../ast/Quote', '../util', './ms', './transpileMemberName', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const Literal_1 = require('esast/lib/Literal');
    const TemplateLiteral_1 = require('esast/lib/TemplateLiteral');
    const Quote_1 = require('../ast/Quote');
    const util_1 = require('../util');
    const ms_1 = require('./ms');
    const transpileMemberName_1 = require('./transpileMemberName');
    const transpileVal_1 = require('./transpileVal');
    const util_2 = require('./util');
    function transpileQuote(_) {
        return util_2.loc(_, transpileQuoteNoLoc(_));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileQuote;
    function transpileQuoteNoLoc(_) {
        if (_ instanceof Quote_1.QuoteTemplate) return transpileQuoteTemplateNoLoc(_);else if (_ instanceof Quote_1.QuoteSimple) return new Literal_1.LiteralString(_.value);else throw new Error();
    }
    exports.transpileQuoteNoLoc = transpileQuoteNoLoc;
    function transpileQuoteTemplate(_) {
        return util_2.loc(_, transpileQuoteTemplateNoLoc(_));
    }
    function transpileQuoteTemplateNoLoc(_ref) {
        let parts = _ref.parts;

        if (util_1.isEmpty(parts)) return new TemplateLiteral_1.default([TemplateLiteral_1.TemplateElement.empty], []);else {
            const quasis = [];
            const expressions = [];
            if (typeof parts[0] !== 'string') quasis.push(TemplateLiteral_1.TemplateElement.empty);
            for (const part of parts) if (typeof part === 'string') quasis.push(TemplateLiteral_1.TemplateElement.forRawString(part));else {
                if (quasis.length === expressions.length) quasis.push(TemplateLiteral_1.TemplateElement.empty);
                expressions.push(transpileVal_1.default(part));
            }
            if (quasis.length === expressions.length) quasis.push(TemplateLiteral_1.TemplateElement.empty);
            return new TemplateLiteral_1.default(quasis, expressions);
        }
    }
    function transpileQuoteTaggedNoLoc(_ref2) {
        let tag = _ref2.tag;
        let quote = _ref2.quote;

        return new TemplateLiteral_1.TaggedTemplateExpression(transpileVal_1.default(tag), transpileQuoteTemplate(quote));
    }
    exports.transpileQuoteTaggedNoLoc = transpileQuoteTaggedNoLoc;
    function transpileRegExpNoLoc(_) {
        const parts = _.parts;
        const flags = _.flags;

        if (parts.length === 0) return new Literal_1.LiteralRegExp(new RegExp('', flags));else {
            const firstPart = parts[0];
            return parts.length === 1 && typeof firstPart === 'string' ? new Literal_1.LiteralRegExp(new RegExp(firstPart.replace(/\n/g, '\\n'), flags)) : ms_1.msCall('regexp', new Expression_1.ArrayExpression(parts.map(transpileTemplatePart)), new Literal_1.LiteralString(flags));
        }
    }
    exports.transpileRegExpNoLoc = transpileRegExpNoLoc;
    const transpileTemplatePart = transpileMemberName_1.default;
});
//# sourceMappingURL=transpileQuote.js.map

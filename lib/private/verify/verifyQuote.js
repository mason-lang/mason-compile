(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Quote', '../context', './verifyMemberName', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Quote_1 = require('../ast/Quote');
    const context_1 = require('../context');
    const verifyMemberName_1 = require('./verifyMemberName');
    const verifyVal_1 = require('./verifyVal');
    function verifyQuote(_) {
        if (_ instanceof Quote_1.QuoteTemplate) verifyQuoteTemplate(_);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyQuote;
    function verifyQuoteTemplate(_ref) {
        let parts = _ref.parts;

        verifyTemplateParts(parts);
    }
    function verifyRegExp(_) {
        const loc = _.loc;
        const parts = _.parts;

        verifyTemplateParts(parts);
        const onlyPart = parts[0];
        if (parts.length === 1 && typeof onlyPart === 'string') try {
            new RegExp(onlyPart);
        } catch (err) {
            if (!(err instanceof SyntaxError)) throw err;
            throw context_1.fail(loc, _ => _.badRegExp(onlyPart));
        }
    }
    exports.verifyRegExp = verifyRegExp;
    function verifyQuoteTagged(_ref2) {
        let tag = _ref2.tag;
        let quote = _ref2.quote;

        verifyVal_1.default(tag);
        verifyQuoteTemplate(quote);
    }
    exports.verifyQuoteTagged = verifyQuoteTagged;
    function verifyTemplateParts(parts) {
        parts.forEach(verifyMemberName_1.default);
    }
});
//# sourceMappingURL=verifyQuote.js.map

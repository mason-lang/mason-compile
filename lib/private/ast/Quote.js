(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    class Quote extends LineContent_1.ValOnly {
        isQuote() {}
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Quote;
    class QuoteTemplate extends Quote {
        constructor(loc, parts) {
            super(loc);
            this.parts = parts;
        }
    }
    exports.QuoteTemplate = QuoteTemplate;
    class QuoteSimple extends Quote {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.QuoteSimple = QuoteSimple;
    class QuoteTagged extends LineContent_1.ValOnly {
        constructor(loc, tag, quote) {
            super(loc);
            this.tag = tag;
            this.quote = quote;
        }
    }
    exports.QuoteTagged = QuoteTagged;
    class MsRegExp extends LineContent_1.ValOnly {
        constructor(loc, parts) {
            let flags = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            super(loc);
            this.parts = parts;
            this.flags = flags;
        }
    }
    exports.MsRegExp = MsRegExp;
});
//# sourceMappingURL=Quote.js.map

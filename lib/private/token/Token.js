(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    class Token {
        constructor(loc) {
            this.loc = loc;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Token;
    class NameToken extends Token {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
    }
    exports.NameToken = NameToken;
    class DocComment extends Token {
        constructor(loc, text) {
            super(loc);
            this.text = text;
        }
    }
    exports.DocComment = DocComment;
    class NumberToken extends Token {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.NumberToken = NumberToken;
    class StringToken extends Token {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.StringToken = StringToken;
});
//# sourceMappingURL=Token.js.map

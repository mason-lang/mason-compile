(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../token/Group', '../token/Keyword', '../token/Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Group_1 = require('../token/Group');
    const Keyword_1 = require('../token/Keyword');
    const Token_1 = require('../token/Token');
    function code(str) {
        return `{{${ str }}}`;
    }
    exports.code = code;
    function showChar(char) {
        return code(String.fromCharCode(char));
    }
    exports.showChar = showChar;
    function showKeyword(kind) {
        return code(Keyword_1.keywordName(kind));
    }
    exports.showKeyword = showKeyword;
    function showGroupType(type) {
        return code((() => {
            switch (type) {
                case Group_1.GroupBlock:
                    return 'indented block';
                case Group_1.GroupQuote:
                    return 'quote';
                case Group_1.GroupRegExp:
                    return '``';
                case Group_1.GroupParenthesis:
                    return '()';
                case Group_1.GroupBracket:
                    return '[]';
                case Group_1.GroupBrace:
                    return '{}';
                default:
                    throw new Error(type.name);
            }
        })());
    }
    exports.showGroupType = showGroupType;
    function showGroup(group) {
        return showGroupType(group.type);
    }
    exports.showGroup = showGroup;
    function showToken(_) {
        if (_ instanceof Keyword_1.default) return showKeyword(_.kind);else if (_ instanceof Group_1.default) return showGroup(_);else if (_ instanceof Token_1.DocComment) return 'doc comment';else if (_ instanceof Token_1.NameToken) return code(_.name);else if (_ instanceof Token_1.NumberToken || _ instanceof Token_1.StringToken) return _.value;else throw new Error(_.constructor.name);
    }
    exports.showToken = showToken;
    function showLoc(_) {
        return code(_.toString());
    }
    exports.showLoc = showLoc;
});
//# sourceMappingURL=util.js.map

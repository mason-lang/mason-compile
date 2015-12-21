(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../CompileError'], factory);
    }
})(function (require, exports) {
    "use strict";

    var CompileError_1 = require('../CompileError');
    class Token {
        constructor(loc) {
            this.loc = loc;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Token;
    class Group extends Token {
        constructor(loc, subTokens) {
            super(loc);
            this.subTokens = subTokens;
        }
        get type() {
            return this.constructor;
        }
    }
    exports.Group = Group;
    class GroupBlock extends Group {
        showType() {
            return 'indented block';
        }
    }
    exports.GroupBlock = GroupBlock;
    class GroupQuote extends Group {
        showType() {
            return 'quote';
        }
    }
    exports.GroupQuote = GroupQuote;
    class GroupRegExp extends Group {
        showType() {
            return 'regexp';
        }
    }
    exports.GroupRegExp = GroupRegExp;
    class GroupParenthesis extends Group {
        showType() {
            return '()';
        }
    }
    exports.GroupParenthesis = GroupParenthesis;
    class GroupBracket extends Group {
        showType() {
            return '[]';
        }
    }
    exports.GroupBracket = GroupBracket;
    class GroupLine extends Group {
        showType() {
            return 'line';
        }
    }
    exports.GroupLine = GroupLine;
    class GroupSpace extends Group {
        showType() {
            return 'space';
        }
    }
    exports.GroupSpace = GroupSpace;
    class GroupInterpolation extends Group {
        showType() {
            return 'interpolation';
        }
    }
    exports.GroupInterpolation = GroupInterpolation;
    class Name extends Token {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
        toString() {
            return CompileError_1.code(this.name);
        }
    }
    exports.Name = Name;
    class DocComment extends Token {
        constructor(loc, text) {
            super(loc);
            this.text = text;
        }
        toString() {
            return 'doc comment';
        }
    }
    exports.DocComment = DocComment;
    class NumberToken extends Token {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
        toString() {
            return this.value;
        }
    }
    exports.NumberToken = NumberToken;
    class StringToken extends Token {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
        toString() {
            return this.value;
        }
    }
    exports.StringToken = StringToken;
    class Keyword extends Token {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        toString() {
            return showKeyword(this.kind);
        }
    }
    exports.Keyword = Keyword;
    exports.reservedKeywords = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
    const keywordKindToName = new Map([[0, 'enum'], [1, 'implements'], [2, 'interface'], [3, 'package'], [4, 'private'], [5, 'protected'], [6, 'public'], [7, 'arguments'], [8, 'delete'], [9, 'eval'], [10, 'in'], [11, 'instanceof'], [12, 'return'], [13, 'typeof'], [14, 'void'], [15, 'while'], [16, '!'], [17, '<'], [18, '<-'], [19, '>'], [20, 'actor'], [21, 'data'], [22, 'del?'], [23, 'do-while'], [24, 'do-until'], [25, 'final'], [26, 'is'], [27, 'meta'], [28, 'out'], [29, 'override'], [30, 'send'], [31, 'to'], [32, 'type'], [33, 'until'], [34, 'abstract'], [35, '&'], [36, 'and'], [37, 'as'], [38, 'assert'], [39, '='], [40, '$'], [41, 'break'], [42, 'built'], [43, 'case'], [44, 'catch'], [45, 'cond'], [46, 'class'], [47, ':'], [48, 'construct'], [49, 'debugger'], [50, 'del'], [51, 'do'], [52, '.'], [53, '..'], [54, '...'], [55, 'else'], [56, 'except'], [57, 'extends'], [58, 'false'], [59, 'finally'], [60, '_'], [61, 'for'], [62, '$for'], [63, '@for'], [64, 'forbid'], [65, '|'], [66, '!|'], [67, '.|'], [68, '.!|'], [69, '$|'], [70, '$!|'], [71, '.$|'], [72, '.$!|'], [73, '*|'], [74, '*!|'], [75, '.*|'], [76, '.*!|'], [77, 'get'], [78, 'if'], [79, 'ignore'], [80, 'import'], [81, 'import!'], [82, 'import~'], [83, '~'], [84, ':='], [85, '->'], [86, 'method'], [87, 'my'], [88, 'name'], [89, 'new'], [90, 'not'], [91, 'null'], [92, '. '], [93, 'of'], [94, 'or'], [95, 'pass'], [96, 'pipe'], [97, 'region'], [98, 'set'], [99, 'super'], [100, 'static'], [101, 'switch'], [102, '\''], [103, 'throw'], [104, 'todo'], [105, 'trait'], [106, 'trait!'], [107, 'true'], [108, 'try'], [109, 'undefined'], [110, 'unless'], [111, 'with'], [112, 'yield'], [113, 'yield*']]);
    const notNameKeywords = new Set([35, 47, 52, 53, 54, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 83, 84, 92, 102]);
    exports.allKeywords = (() => {
        const ks = new Set(keywordKindToName.keys());
        for (const _ of exports.reservedKeywords) ks.delete(_);
        return Array.from(ks);
    })();
    const nameKeywords = new Set(exports.allKeywords);
    for (const _ of notNameKeywords) nameKeywords.delete(_);
    const keywordNameToKind = new Map(Array.from(nameKeywords).map(_ => [keywordKindToName.get(_), _]));
    function keywordName(kind) {
        return keywordKindToName.get(kind);
    }
    exports.keywordName = keywordName;
    function showKeyword(kind) {
        return CompileError_1.code(keywordName(kind));
    }
    exports.showKeyword = showKeyword;
    function opKeywordKindFromName(name) {
        const kind = keywordNameToKind.get(name);
        return kind === undefined ? null : kind;
    }
    exports.opKeywordKindFromName = opKeywordKindFromName;
    function opKeywordKindToSpecialValueKind(kind) {
        switch (kind) {
            case 58:
                return 0;
            case 88:
                return 1;
            case 91:
                return 2;
            case 107:
                return 3;
            case 109:
                return 4;
            default:
                return null;
        }
    }
    exports.opKeywordKindToSpecialValueKind = opKeywordKindToSpecialValueKind;
    function isKeyword(keywordKind, token) {
        return token instanceof Keyword && token.kind === keywordKind;
    }
    exports.isKeyword = isKeyword;
    function isAnyKeyword(keywordKinds, token) {
        return token instanceof Keyword && keywordKinds.has(token.kind);
    }
    exports.isAnyKeyword = isAnyKeyword;
    function tryGetKeywordName(token) {
        return nameKeywords.has(token.kind) ? keywordName(token.kind) : null;
    }
    exports.tryGetKeywordName = tryGetKeywordName;
    function isReservedKeyword(token) {
        return token instanceof Keyword && reservedKeywordsSet.has(token.kind);
    }
    exports.isReservedKeyword = isReservedKeyword;
    const reservedKeywordsSet = new Set(exports.reservedKeywords);
});
//# sourceMappingURL=Token.js.map

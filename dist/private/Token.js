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
    function* reservedKeywords() {
        for (let i = 0; i < 77; i++) yield i;
    }
    exports.reservedKeywords = reservedKeywords;
    const keywordKindToName = new Map([[0, 'enum'], [1, 'from'], [2, 'implements'], [3, 'interface'], [4, 'package'], [5, 'private'], [6, 'protected'], [7, 'public'], [8, 'arguments'], [9, 'continue'], [10, 'delete'], [11, 'eval'], [12, 'in'], [13, 'instanceof'], [14, 'return'], [15, 'typeof'], [16, 'void'], [17, 'while'], [18, '!'], [19, '<'], [20, '<-'], [21, '>'], [22, 'data'], [23, 'declare'], [24, 'del?'], [25, 'do-while'], [26, 'do-until'], [27, 'final'], [28, 'implicit'], [29, 'is'], [30, 'macro'], [31, 'meta'], [32, 'mut'], [33, 'native'], [34, 'on'], [35, 'operator'], [36, 'out'], [37, 'override'], [38, 'pure'], [39, 'readonly'], [40, 'sealed'], [41, 'sizeof'], [42, 'struct'], [43, 'throws'], [44, 'to'], [45, 'type'], [46, 'until'], [47, 'use'], [48, 'virtual'], [49, 'actor'], [50, 'move'], [51, 'send'], [52, 'shared'], [53, 'synchronized'], [54, 'transient'], [55, 'volatile'], [56, 'any'], [57, 'boolean'], [58, 'int'], [59, 'int8'], [60, 'int16'], [61, 'int32'], [62, 'int64'], [63, 'uint'], [64, 'uint8'], [65, 'uint16'], [66, 'uint32'], [67, 'uint64'], [68, 'float'], [69, 'float32'], [70, 'float64'], [71, 'float128'], [72, 'number'], [73, 'object'], [74, 'ptr'], [75, 'string'], [76, 'symbol'], [77, 'abstract'], [78, '&'], [79, 'and'], [80, 'as'], [81, 'assert'], [82, '='], [83, '$'], [84, 'break'], [85, 'built'], [86, 'case'], [87, 'catch'], [88, 'cond'], [89, 'class'], [90, ':'], [91, 'construct'], [92, 'debugger'], [93, 'del'], [94, 'do'], [95, '.'], [96, '..'], [97, '...'], [98, 'else'], [99, 'except'], [100, 'extends'], [101, 'false'], [102, 'finally'], [103, '_'], [104, 'for'], [105, '$for'], [106, '@for'], [107, 'forbid'], [108, '|'], [109, '!|'], [110, '.|'], [111, '.!|'], [112, '$|'], [113, '$!|'], [114, '.$|'], [115, '.$!|'], [116, '*|'], [117, '*!|'], [118, '.*|'], [119, '.*!|'], [120, 'get'], [121, 'if'], [122, 'ignore'], [123, 'import'], [124, 'import!'], [125, 'import~'], [126, '~'], [127, ':='], [128, '->'], [129, 'method'], [130, 'my'], [131, 'name'], [132, 'new'], [133, 'not'], [134, 'null'], [135, '. '], [136, 'of'], [137, 'or'], [138, 'pass'], [139, 'pipe'], [140, 'region'], [141, 'set'], [142, 'super'], [143, 'static'], [144, 'switch'], [145, '\''], [146, 'throw'], [147, 'todo'], [148, 'trait'], [149, 'trait!'], [150, 'true'], [151, 'try'], [152, 'undefined'], [153, 'unless'], [154, 'with'], [155, 'yield'], [156, 'yield*']]);
    const notNameKeywords = new Set([78, 90, 95, 96, 97, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 126, 127, 135, 145]);
    exports.allKeywords = (() => {
        const ks = new Set(keywordKindToName.keys());
        for (const _ of reservedKeywords()) ks.delete(_);
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
            case 101:
                return 0;
            case 131:
                return 1;
            case 134:
                return 2;
            case 150:
                return 3;
            case 152:
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
    const reservedKeywordsSet = new Set(reservedKeywords());
});
//# sourceMappingURL=Token.js.map

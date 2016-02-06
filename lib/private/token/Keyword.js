(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../languages/util', './Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    const util_1 = require('../languages/util');
    const Token_1 = require('./Token');
    class Keyword extends Token_1.default {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        toString() {
            return util_1.showKeyword(this.kind);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Keyword;
    function* reservedKeywords() {
        for (let i = 0; i < 84; i++) yield i;
    }
    exports.reservedKeywords = reservedKeywords;
    const keywordKindToName = new Map([[0, 'enum'], [1, 'from'], [2, 'implements'], [3, 'interface'], [4, 'package'], [5, 'private'], [6, 'protected'], [7, 'public'], [8, 'arguments'], [9, 'continue'], [10, 'delete'], [11, 'eval'], [12, 'in'], [13, 'instanceof'], [14, 'return'], [15, 'typeof'], [16, 'void'], [17, 'while'], [18, '!'], [19, '<'], [20, '<-'], [21, '>'], [22, 'data'], [23, 'declare'], [24, 'del?'], [25, 'do-while'], [26, 'do-until'], [27, 'final'], [28, 'flags'], [29, 'implicit'], [30, 'is'], [31, 'macro'], [32, 'meta'], [33, 'mut'], [34, 'native'], [35, 'on'], [36, 'operator'], [37, 'out'], [38, 'pure'], [39, 'readonly'], [40, 'sealed'], [41, 'sizeof'], [42, 'struct'], [43, 'throws'], [44, 'to'], [45, 'type'], [46, 'until'], [47, 'use'], [48, 'actor'], [49, 'move'], [50, 'send'], [51, 'shared'], [52, 'synchronized'], [53, 'transient'], [54, 'volatile'], [55, 'any'], [56, 'boolean'], [57, 'int'], [58, 'int8'], [59, 'int16'], [60, 'int32'], [61, 'int64'], [62, 'uint'], [63, 'uint8'], [64, 'uint16'], [65, 'uint32'], [66, 'uint64'], [67, 'float'], [68, 'float32'], [69, 'float64'], [70, 'float128'], [71, 'bignum'], [72, 'decimal'], [73, 'decimal32'], [74, 'decimal64'], [75, 'decimal128'], [76, 'rational'], [77, 'complex'], [78, 'mixed'], [79, 'number'], [80, 'object'], [81, 'ptr'], [82, 'string'], [83, 'symbol'], [84, 'abstract'], [85, '&'], [86, 'as'], [87, 'assert'], [88, '='], [89, '$'], [90, 'break'], [91, 'built'], [92, 'case'], [93, 'catch'], [94, 'cond'], [95, 'class'], [96, ':'], [97, 'construct'], [98, 'debugger'], [99, 'del'], [100, 'do'], [101, '.'], [102, '..'], [103, '...'], [104, 'else'], [105, 'except'], [106, 'extends'], [107, 'false'], [108, 'finally'], [109, '_'], [110, 'for'], [111, '$for'], [112, '@for'], [113, 'forbid'], [114, '|'], [115, '!\\'], [116, '.\\'], [117, '.!\\'], [118, '$\\'], [119, '$!\\'], [120, '.$\\'], [121, '.$!\\'], [122, '*\\'], [123, '*!\\'], [124, '.*\\'], [125, '.*!\\'], [126, 'get'], [127, 'if'], [128, 'ignore'], [129, 'import'], [130, 'import!'], [131, 'import~'], [132, '~'], [133, ':='], [134, '->'], [135, 'method'], [136, 'my'], [137, 'name'], [138, 'new'], [139, 'null'], [140, '. '], [141, 'of'], [142, 'and'], [143, '/'], [144, '=?'], [145, '==?'], [146, '**'], [147, '>?'], [148, '>=?'], [149, '<?'], [150, '<=?'], [151, '-'], [152, 'or'], [153, '+'], [154, '%'], [155, '*'], [156, 'override'], [157, 'pass'], [158, 'pipe'], [159, 'region'], [160, 'set'], [161, 'super'], [162, 'static'], [163, 'switch'], [164, '\''], [165, 'throw'], [166, 'todo'], [167, 'trait'], [168, 'trait!'], [169, 'true'], [170, 'try'], [171, 'neg'], [172, 'not'], [173, 'undefined'], [174, 'unless'], [175, 'virtual'], [176, 'with'], [177, 'yield'], [178, 'yield*']]);
    const notNameKeywords = new Set([85, 96, 101, 102, 103, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 132, 133, 140, 164]);
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
    function opKeywordKindFromName(name) {
        const kind = keywordNameToKind.get(name);
        return kind === undefined ? null : kind;
    }
    exports.opKeywordKindFromName = opKeywordKindFromName;
    function opKeywordKindToSpecialValueKind(kind) {
        switch (kind) {
            case 107:
                return 0;
            case 137:
                return 1;
            case 139:
                return 2;
            case 169:
                return 3;
            case 173:
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
    function isFunKeyword(token) {
        return token instanceof Keyword && 114 <= token.kind && token.kind <= 125;
    }
    exports.isFunKeyword = isFunKeyword;
    function isOperatorKeyword(token) {
        return token instanceof Keyword && 142 <= token.kind && token.kind <= 155;
    }
    exports.isOperatorKeyword = isOperatorKeyword;
    function keywordKindToOperatorKind(kind) {
        return kind - 142;
    }
    exports.keywordKindToOperatorKind = keywordKindToOperatorKind;
    function isUnaryKeyword(token) {
        return token instanceof Keyword && 171 <= token.kind && token.kind <= 172;
    }
    exports.isUnaryKeyword = isUnaryKeyword;
    function keywordKindToUnaryKind(kind) {
        return kind - 171;
    }
    exports.keywordKindToUnaryKind = keywordKindToUnaryKind;
});
//# sourceMappingURL=Keyword.js.map

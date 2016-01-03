(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../CompileError', './Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    var CompileError_1 = require('../../CompileError');
    var Token_1 = require('./Token');
    class Keyword extends Token_1.default {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
        toString() {
            return showKeyword(this.kind);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Keyword;
    function* reservedKeywords() {
        for (let i = 0; i < 76; i++) yield i;
    }
    exports.reservedKeywords = reservedKeywords;
    const keywordKindToName = new Map([[0, 'enum'], [1, 'from'], [2, 'implements'], [3, 'interface'], [4, 'package'], [5, 'private'], [6, 'protected'], [7, 'public'], [8, 'arguments'], [9, 'continue'], [10, 'delete'], [11, 'eval'], [12, 'in'], [13, 'instanceof'], [14, 'return'], [15, 'typeof'], [16, 'void'], [17, 'while'], [18, '!'], [19, '<'], [20, '<-'], [21, '>'], [22, 'data'], [23, 'declare'], [24, 'del?'], [25, 'do-while'], [26, 'do-until'], [27, 'final'], [28, 'flags'], [29, 'implicit'], [30, 'is'], [31, 'macro'], [32, 'meta'], [33, 'mut'], [34, 'native'], [35, 'on'], [36, 'operator'], [37, 'out'], [38, 'pure'], [39, 'readonly'], [40, 'sealed'], [41, 'sizeof'], [42, 'struct'], [43, 'throws'], [44, 'to'], [45, 'type'], [46, 'until'], [47, 'use'], [48, 'actor'], [49, 'move'], [50, 'send'], [51, 'shared'], [52, 'synchronized'], [53, 'transient'], [54, 'volatile'], [55, 'any'], [56, 'boolean'], [57, 'int'], [58, 'int8'], [59, 'int16'], [60, 'int32'], [61, 'int64'], [62, 'uint'], [63, 'uint8'], [64, 'uint16'], [65, 'uint32'], [66, 'uint64'], [67, 'float'], [68, 'float32'], [69, 'float64'], [70, 'float128'], [71, 'number'], [72, 'object'], [73, 'ptr'], [74, 'string'], [75, 'symbol'], [76, 'abstract'], [77, '&'], [78, 'and'], [79, 'as'], [80, 'assert'], [81, '='], [82, '$'], [83, 'break'], [84, 'built'], [85, 'case'], [86, 'catch'], [87, 'cond'], [88, 'class'], [89, ':'], [90, 'construct'], [91, 'debugger'], [92, 'del'], [93, 'do'], [94, '.'], [95, '..'], [96, '...'], [97, 'else'], [98, 'except'], [99, 'extends'], [100, 'false'], [101, 'finally'], [102, '_'], [103, 'for'], [104, '$for'], [105, '@for'], [106, 'forbid'], [107, '|'], [108, '!|'], [109, '.|'], [110, '.!|'], [111, '$|'], [112, '$!|'], [113, '.$|'], [114, '.$!|'], [115, '*|'], [116, '*!|'], [117, '.*|'], [118, '.*!|'], [119, 'get'], [120, 'if'], [121, 'ignore'], [122, 'import'], [123, 'import!'], [124, 'import~'], [125, '~'], [126, ':='], [127, '->'], [128, 'method'], [129, 'my'], [130, 'name'], [131, 'new'], [132, 'not'], [133, 'null'], [134, '. '], [135, 'of'], [137, 'or'], [136, 'override'], [138, 'pass'], [139, 'pipe'], [140, 'region'], [141, 'set'], [142, 'super'], [143, 'static'], [144, 'switch'], [145, '\''], [146, 'throw'], [147, 'todo'], [148, 'trait'], [149, 'trait!'], [150, 'true'], [151, 'try'], [152, 'undefined'], [153, 'unless'], [154, 'virtual'], [155, 'with'], [156, 'yield'], [157, 'yield*']]);
    const notNameKeywords = new Set([77, 89, 94, 95, 96, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 125, 126, 134, 145]);
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
            case 100:
                return 0;
            case 130:
                return 1;
            case 133:
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
//# sourceMappingURL=Keyword.js.map

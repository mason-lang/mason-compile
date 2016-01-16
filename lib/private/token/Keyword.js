(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../languages/util', './Token'], factory);
    }
})(function (require, exports) {
    "use strict";

    var util_1 = require('../languages/util');
    var Token_1 = require('./Token');
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
        for (let i = 0; i < 77; i++) yield i;
    }
    exports.reservedKeywords = reservedKeywords;
    const keywordKindToName = new Map([[0, 'enum'], [1, 'from'], [2, 'implements'], [3, 'interface'], [4, 'package'], [5, 'private'], [6, 'protected'], [7, 'public'], [8, 'arguments'], [9, 'continue'], [10, 'delete'], [11, 'eval'], [12, 'in'], [13, 'instanceof'], [14, 'return'], [15, 'typeof'], [16, 'void'], [17, 'while'], [18, '!'], [19, '<'], [20, '<-'], [21, '>'], [22, 'data'], [23, 'declare'], [24, 'del?'], [25, 'do-while'], [26, 'do-until'], [27, 'final'], [28, 'flags'], [29, 'implicit'], [30, 'is'], [31, 'macro'], [32, 'meta'], [33, 'mut'], [34, 'native'], [35, 'on'], [36, 'operator'], [37, 'out'], [38, 'pure'], [39, 'readonly'], [40, 'sealed'], [41, 'sizeof'], [42, 'struct'], [43, 'throws'], [44, 'to'], [45, 'type'], [46, 'until'], [47, 'use'], [48, 'actor'], [49, 'move'], [50, 'send'], [51, 'shared'], [52, 'synchronized'], [53, 'transient'], [54, 'volatile'], [55, 'any'], [56, 'boolean'], [57, 'int'], [58, 'int8'], [59, 'int16'], [60, 'int32'], [61, 'int64'], [62, 'uint'], [63, 'uint8'], [64, 'uint16'], [65, 'uint32'], [66, 'uint64'], [67, 'float'], [68, 'float32'], [69, 'float64'], [70, 'float128'], [71, 'mixed'], [72, 'number'], [73, 'object'], [74, 'ptr'], [75, 'string'], [76, 'symbol'], [77, 'abstract'], [78, '&'], [79, 'and'], [80, 'as'], [81, 'assert'], [82, '='], [83, '$'], [84, 'break'], [85, 'built'], [86, 'case'], [87, 'catch'], [88, 'cond'], [89, 'class'], [90, ':'], [91, 'construct'], [92, 'debugger'], [93, 'del'], [94, 'do'], [95, '.'], [96, '..'], [97, '...'], [98, 'else'], [99, 'except'], [100, 'extends'], [101, 'false'], [102, 'finally'], [103, '_'], [104, 'for'], [105, '$for'], [106, '@for'], [107, 'forbid'], [108, '|'], [109, '!|'], [110, '.|'], [111, '.!|'], [112, '$|'], [113, '$!|'], [114, '.$|'], [115, '.$!|'], [116, '*|'], [117, '*!|'], [118, '.*|'], [119, '.*!|'], [120, 'get'], [121, 'if'], [122, 'ignore'], [123, 'import'], [124, 'import!'], [125, 'import~'], [126, '~'], [127, ':='], [128, '->'], [129, 'method'], [130, 'my'], [131, 'name'], [132, 'new'], [133, 'not'], [134, 'null'], [135, '. '], [136, 'of'], [138, 'or'], [137, 'override'], [139, 'pass'], [140, 'pipe'], [141, 'region'], [142, 'set'], [143, 'super'], [144, 'static'], [145, 'switch'], [146, '\''], [147, 'throw'], [148, 'todo'], [149, 'trait'], [150, 'trait!'], [151, 'true'], [152, 'try'], [153, 'undefined'], [154, 'unless'], [155, 'virtual'], [156, 'with'], [157, 'yield'], [158, 'yield*']]);
    const notNameKeywords = new Set([78, 90, 95, 96, 97, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 126, 127, 135, 146]);
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
            case 101:
                return 0;
            case 131:
                return 1;
            case 134:
                return 2;
            case 151:
                return 3;
            case 153:
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

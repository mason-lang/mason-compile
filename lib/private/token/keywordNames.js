(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    exports.kwToName = new Map([[33, 'abstract'], [34, '&'], [35, 'as'], [24, 'assert'], [20, '='], [21, ':='], [0, '$'], [25, 'break'], [36, 'built'], [1, 'case'], [37, 'catch'], [3, 'cond'], [2, 'class'], [38, ':'], [39, 'construct'], [26, 'debugger'], [4, 'del'], [40, 'do'], [41, '.'], [42, '..'], [27, '...'], [43, 'else'], [5, 'except'], [44, 'extends'], [45, 'finally'], [46, '_'], [6, 'for'], [7, '$for'], [8, '@for'], [28, 'forbid'], [47, 'get'], [9, 'if'], [29, 'ignore'], [48, 'import'], [49, 'import!'], [50, 'import~'], [51, '~'], [22, '->'], [52, 'my'], [10, 'new'], [23, '. '], [53, 'of'], [54, 'override'], [30, 'pass'], [12, 'pipe'], [11, 'poly'], [56, 'set'], [13, 'super'], [57, 'static'], [14, 'switch'], [58, '\''], [31, 'throw'], [15, 'trait'], [32, 'trait!'], [59, 'try'], [16, 'unless'], [60, 'virtual'], [17, 'with'], [18, 'yield'], [19, 'yield*']]);
    exports.operatorToName = new Map([[0, 'and'], [1, '/'], [2, '=?'], [3, '==?'], [4, '**'], [5, '>?'], [6, '>=?'], [7, '<?'], [8, '<=?'], [9, '-'], [10, 'or'], [11, '+'], [12, '%'], [13, '*']]);
    exports.unaryOperatorToName = new Map([[0, 'neg'], [1, 'not']]);
    exports.specialValToName = new Map([[0, 'false'], [1, 'name'], [2, 'null'], [3, 'true'], [4, 'undefined']]);
    exports.reservedWords = new Set(['enum', 'from', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'arguments', 'continue', 'delete', 'eval', 'in', 'instanceof', 'return', 'typeof', 'void', 'while', 'any', 'boolean', 'int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float', 'float32', 'float64', 'float128', 'bignum', 'decimal', 'decimal32', 'decimal64', 'decimal128', 'rational', 'complex', 'mixed', 'number', 'object', 'ptr', 'string', 'symbol', 'type', 'actor', 'move', 'send', 'shared', 'synchronized', 'transient', 'volatile', '!', '<', '<-', '>', 'data', 'declare', 'del?', 'do-while', 'do-until', 'final', 'flags', 'implicit', 'is', 'macro', 'meta', 'mut', 'native', 'nothrow', 'operator', 'out', 'pure', 'readonly', 'sealed', 'sizeof', 'struct', 'throws', 'to', 'until', 'use']);
});
//# sourceMappingURL=keywordNames.js.map

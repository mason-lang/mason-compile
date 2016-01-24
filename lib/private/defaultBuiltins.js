(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    const defaultBuiltins = {
        global: ['Array', 'Boolean', 'console', 'Date', 'Error', 'Function', 'Intl', 'JSON', 'Promise', 'Proxy', 'Math', 'Number', 'Object', 'Reflect', 'RegExp', 'SIMD', 'String', 'Symbol', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array', 'Int16Array', 'Int32Array', 'Int8Array', 'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent'],
        'msl.@.?': ['_', '?None', 'Opt->?', '?->Opt', '?-or', '?-cond', '?some', 'un-?'],
        'msl.@.@': ['_', '++', '++~', '+!', '++!', '--', '--~', '-!', '--!', 'all?', 'any?', 'count', 'each!', 'empty', 'empty!', 'empty?', '?find', 'fold', '@flat-map', '@flat-map~', '@flatten', '@flatten~', 'iterator', '@keep', '@keep~', '@toss', '@toss~', '@map', '@map~'],
        'msl.@.Map.Id-Map': ['_'],
        'msl.@.Map.Hash-Map': ['_'],
        'msl.@.Map.Map': ['_', '?get', '@keys', 'make-map', 'map=?', '@values'],
        'msl.@.Range': ['_'],
        'msl.@.Seq.Seq': ['_', '+>!', '@drop', '@drop~', '@drop-while', '@drop-while~', 'first', '?first', '@indexes', 'last', '?last', '?nth', '@reverse', '@reverse~', '@rtail', '@slice', '@slice~', '@split', '@split~', 'seq=?', '@tail', '@take', '@take~', '@take-while', '@take-while~', '@zip', '@zip~'],
        'msl.@.Seq.Stream': ['_'],
        'msl.@.Set.Id-Set': ['_'],
        'msl.@.Set.Set': ['_', 'set=?'],
        'msl.compare': ['?min', 'min', '?min-by', 'min-by', '?max', 'max', '?max-by', 'max-by', 'same?'],
        'msl.Function': ['Action', 'identity'],
        'msl.js': ['defined?', 'exists?', 'null?'],
        'msl.math.Number': ['divisible?', 'Int', 'int/', 'log-base', 'modulo', 'nearest-ceil', 'nearest-floor', 'nearest-round', 'Nat'],
        'msl.math.util': ['average', 'product', 'sum'],
        'msl.methods': ['sub', 'set-sub!', 'del-sub!'],
        'msl.to-string': ['_', 'inspect'],
        'msl.Type.Method': ['_', 'impl!', 'impl-for', 'self-impl!'],
        'msl.Type.Trait': ['_'],
        'msl.Type.Pred-Type': ['_', 'Any', 'ObjLit'],
        'msl.Type.primitive': ['Bool', 'Num', 'Str', 'Sym'],
        'msl.Type.Type': ['_', '=>', 'has-instance?', 'extract']
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = defaultBuiltins;
});
//# sourceMappingURL=defaultBuiltins.js.map

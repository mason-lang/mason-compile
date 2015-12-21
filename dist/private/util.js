(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    function allSame(array, mapper) {
        if (isEmpty(array)) return true;
        const val = mapper(array[0]);
        for (let i = 1; i < array.length; i = i + 1) if (mapper(array[i]) !== val) return false;
        return true;
    }
    exports.allSame = allSame;
    function assert(cond) {
        if (!cond) throw new Error('Assertion failed.');
    }
    exports.assert = assert;
    function cat() {
        const out = [];

        for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
            parts[_key] = arguments[_key];
        }

        for (const _ of parts) if (_ instanceof Array) out.push(..._);else if (Op_1.nonNull(_)) out.push(_);
        return out;
    }
    exports.cat = cat;
    function flatMap(mapped, mapper) {
        const out = [];
        for (let i = 0; i < mapped.length; i = i + 1) out.push(...mapper(mapped[i], i));
        return out;
    }
    exports.flatMap = flatMap;
    function head(array) {
        assert(!isEmpty(array));
        return array[0];
    }
    exports.head = head;
    function implementMany(types, methodName, impls) {
        for (const name in impls) types[name].prototype[methodName] = impls[name];
    }
    exports.implementMany = implementMany;
    function isEmpty(array) {
        return array.length === 0;
    }
    exports.isEmpty = isEmpty;
    function last(array) {
        assert(!isEmpty(array));
        return array[array.length - 1];
    }
    exports.last = last;
    function* reverseIter(array) {
        for (let i = array.length - 1; i >= 0; i = i - 1) yield array[i];
    }
    exports.reverseIter = reverseIter;
    function rtail(array) {
        assert(!isEmpty(array));
        return array.slice(0, array.length - 1);
    }
    exports.rtail = rtail;
    function tail(array) {
        assert(!isEmpty(array));
        return array.slice(1);
    }
    exports.tail = tail;
    function toArray(value) {
        return value instanceof Array ? value : [value];
    }
    exports.toArray = toArray;
    function applyDefaults(provided, defaults) {
        const out = {};
        for (const key in provided) {
            if (!(key in defaults)) throw new Error(`No such option ${ key }.`);
            out[key] = provided[key];
        }
        for (const key in defaults) if (!(key in out)) out[key] = defaults[key];
        return out;
    }
    exports.applyDefaults = applyDefaults;
});
//# sourceMappingURL=util.js.map

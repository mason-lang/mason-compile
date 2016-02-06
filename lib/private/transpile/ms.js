(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Identifier', 'esast-create-util/lib/util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const Identifier_1 = require('esast/lib/Identifier');
    const util_1 = require('esast-create-util/lib/util');
    function msCall(name) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        return new Expression_1.CallExpression(util_1.member(idMs, name), args);
    }
    exports.msCall = msCall;
    function msMember(name) {
        return util_1.member(idMs, name);
    }
    exports.msMember = msMember;
    const idMs = new Identifier_1.default('_ms');
});
//# sourceMappingURL=ms.js.map

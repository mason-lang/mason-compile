(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Block', './context', './verifyBlock', './verifySK', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Block_1 = require('../ast/Block');
    var context_1 = require('./context');
    var verifyBlock_1 = require('./verifyBlock');
    var verifySK_1 = require('./verifySK');
    var verifyVal_1 = require('./verifyVal');
    function verifyCond(_ref, sk) {
        let test = _ref.test;
        let ifTrue = _ref.ifTrue;
        let ifFalse = _ref.ifFalse;

        verifyVal_1.default(test);
        verifySK_1.default(ifTrue, sk);
        verifySK_1.default(ifFalse, sk);
    }
    exports.verifyCond = verifyCond;
    function verifyConditional(_ref2, sk) {
        let test = _ref2.test;
        let result = _ref2.result;

        verifyVal_1.default(test);
        context_1.withIifeIf(result instanceof Block_1.default && sk === 1, () => {
            if (result instanceof Block_1.default) verifyBlock_1.verifyBlockSK(result, sk);else verifySK_1.default(result, sk);
        });
    }
    exports.verifyConditional = verifyConditional;
});
//# sourceMappingURL=verifyBooleans.js.map

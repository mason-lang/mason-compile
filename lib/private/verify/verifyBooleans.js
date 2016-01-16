(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Block', '../context', './context', './verifyBlock', './verifySK', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Block_1 = require('../ast/Block');
    var context_1 = require('../context');
    var context_2 = require('./context');
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
        context_2.withIifeIf(result instanceof Block_1.default && sk === 1, () => {
            if (result instanceof Block_1.default) verifyBlock_1.verifyBlockSK(result, sk);else verifySK_1.default(result, sk);
        });
    }
    exports.verifyConditional = verifyConditional;
    function verifyLogic(_ref3) {
        let loc = _ref3.loc;
        let args = _ref3.args;

        context_1.check(args.length > 1, loc, _ => _.argsLogic);
        verifyVal_1.verifyEachVal(args);
    }
    exports.verifyLogic = verifyLogic;
    function verifyNot(_ref4) {
        let arg = _ref4.arg;

        verifyVal_1.default(arg);
    }
    exports.verifyNot = verifyNot;
});
//# sourceMappingURL=verifyBooleans.js.map

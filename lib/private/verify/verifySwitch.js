(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', './context', './verifyBlock', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('./context');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyVal_1 = require('./verifyVal');
    function verifySwitch(_ref, sk) {
        let switched = _ref.switched;
        let parts = _ref.parts;
        let opElse = _ref.opElse;

        context_1.withIifeIfVal(sk, () => {
            context_1.withInSwitch(true, () => {
                verifyVal_1.default(switched);
                for (const _ of parts) verifySwitchPart(_, sk);
                Op_1.opEach(opElse, _ => verifyBlock_1.verifyBlockSK(_, sk));
            });
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifySwitch;
    function verifySwitchPart(_, sk) {
        const values = _.values;
        const result = _.result;

        verifyVal_1.verifyEachVal(values);
        verifyBlock_1.verifyBlockSK(result, sk);
    }
});
//# sourceMappingURL=verifySwitch.js.map

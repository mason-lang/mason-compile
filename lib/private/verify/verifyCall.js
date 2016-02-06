(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Call', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Call_1 = require('../ast/Call');
    const verifyVal_1 = require('./verifyVal');
    function verifyCall(_ref) {
        let called = _ref.called;
        let args = _ref.args;

        verifyVal_1.default(called);
        verifyEachValOrSpread(args);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyCall;
    function verifyNew(_ref2) {
        let type = _ref2.type;
        let args = _ref2.args;

        verifyVal_1.default(type);
        verifyEachValOrSpread(args);
    }
    exports.verifyNew = verifyNew;
    function verifyEachValOrSpread(asts) {
        for (const _ of asts) if (_ instanceof Call_1.Spread) verifySpread(_);else verifyVal_1.default(_);
    }
    exports.verifyEachValOrSpread = verifyEachValOrSpread;
    function verifySpread(_ref3) {
        let spreaded = _ref3.spreaded;

        verifyVal_1.default(spreaded);
    }
});
//# sourceMappingURL=verifyCall.js.map

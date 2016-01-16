(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Fun', '../ast/Method', './util', './verifyFun', './verifyLocals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var Fun_1 = require('../ast/Fun');
    var Method_1 = require('../ast/Method');
    var util_1 = require('./util');
    var verifyFun_1 = require('./verifyFun');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyVal_1 = require('./verifyVal');
    function verifyMethod(_ref) {
        let value = _ref.value;

        if (value instanceof Fun_1.FunBlock) util_1.makeUseOptional(Op_1.orThrow(value.opDeclareThis));
        value.args.forEach(util_1.makeUseOptional);
        Op_1.opEach(value.opRestArg, util_1.makeUseOptional);
        verifyMethodValue(value);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyMethod;
    function verifyMethodValue(_) {
        if (_ instanceof Method_1.FunAbstract) verifyFunAbstract(_);else verifyFun_1.verifyFunBlock(_);
    }
    function verifyFunAbstract(_ref2) {
        let args = _ref2.args;
        let opRestArg = _ref2.opRestArg;
        let opReturnType = _ref2.opReturnType;

        for (const _ of args) verifyLocals_1.verifyLocalDeclare(_);
        Op_1.opEach(opRestArg, verifyLocals_1.verifyLocalDeclare);
        verifyVal_1.verifyOpVal(opReturnType);
    }
});
//# sourceMappingURL=verifyMethod.js.map

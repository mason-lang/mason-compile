(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/Await', '../ast/booleans', '../ast/Call', '../ast/Case', '../ast/Class', '../ast/Del', '../ast/errors', '../ast/Loop', '../ast/Switch', '../ast/With', '../ast/YieldLike', './verifyAwait', './verifyBooleans', './verifyCall', './verifyCase', './verifyClass', './verifyDel', './verifyErrors', './verifyLoop', './verifySwitch', './verifyWith', './verifyYieldLike'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Await_1 = require('../ast/Await');
    var booleans_1 = require('../ast/booleans');
    var Call_1 = require('../ast/Call');
    var Case_1 = require('../ast/Case');
    var Class_1 = require('../ast/Class');
    var Del_1 = require('../ast/Del');
    var errors_1 = require('../ast/errors');
    var Loop_1 = require('../ast/Loop');
    var Switch_1 = require('../ast/Switch');
    var With_1 = require('../ast/With');
    var YieldLike_1 = require('../ast/YieldLike');
    var verifyAwait_1 = require('./verifyAwait');
    var verifyBooleans_1 = require('./verifyBooleans');
    var verifyCall_1 = require('./verifyCall');
    var verifyCase_1 = require('./verifyCase');
    var verifyClass_1 = require('./verifyClass');
    var verifyDel_1 = require('./verifyDel');
    var verifyErrors_1 = require('./verifyErrors');
    var verifyLoop_1 = require('./verifyLoop');
    var verifySwitch_1 = require('./verifySwitch');
    var verifyWith_1 = require('./verifyWith');
    var verifyYieldLike_1 = require('./verifyYieldLike');
    function verifyValOrDo(_, sk) {
        if (_ instanceof Await_1.default) verifyAwait_1.default(_);else if (_ instanceof Call_1.default) verifyCall_1.default(_);else if (_ instanceof Case_1.default) verifyCase_1.default(_, sk);else if (_ instanceof booleans_1.Cond) verifyBooleans_1.verifyCond(_, sk);else if (_ instanceof booleans_1.Conditional) verifyBooleans_1.verifyConditional(_, sk);else if (_ instanceof Del_1.default) verifyDel_1.default(_);else if (_ instanceof errors_1.Except) verifyErrors_1.verifyExcept(_, sk);else if (_ instanceof Loop_1.For) verifyLoop_1.default(_, sk);else if (_ instanceof Loop_1.ForAsync) verifyLoop_1.verifyForAsync(_, sk);else if (_ instanceof Class_1.SuperCall) verifyClass_1.verifySuperCall(_, sk);else if (_ instanceof Switch_1.default) verifySwitch_1.default(_, sk);else if (_ instanceof With_1.default) verifyWith_1.default(_, sk);else if (_ instanceof YieldLike_1.default) verifyYieldLike_1.default(_);else throw new Error(_.constructor.name);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyValOrDo;
});
//# sourceMappingURL=verifyValOrDo.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../ast/Fun', '../ast/locals', '../util', './context', './verifyBlock', './verifyLocals', './verifyMemberName', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var Fun_1 = require('../ast/Fun');
    var locals_1 = require('../ast/locals');
    var util_1 = require('../util');
    var context_2 = require('./context');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyMemberName_1 = require('./verifyMemberName');
    var verifyVal_1 = require('./verifyVal');
    function verifyFun(_) {
        if (_ instanceof Fun_1.FunBlock) verifyFunBlock(_);else if (_ instanceof Fun_1.FunGetter) verifyMemberName_1.default(_.name);else if (_ instanceof Fun_1.FunMember) {
            const opObject = _.opObject;
            const name = _.name;

            verifyVal_1.verifyOpVal(opObject);
            verifyMemberName_1.default(name);
        } else if (_ instanceof Fun_1.FunOperator || _ instanceof Fun_1.FunUnary) {} else if (_ instanceof Fun_1.FunSimple) {
            const loc = _.loc;
            const value = _.value;

            context_2.withFun(0, () => {
                verifyLocals_1.registerAndPlusLocal(locals_1.LocalDeclare.focus(loc), () => {
                    verifyVal_1.default(value);
                });
            });
        } else throw new Error(_.constructor.name);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyFun;
    function verifyFunBlock(_ref) {
        let loc = _ref.loc;
        let opReturnType = _ref.opReturnType;
        let isDo = _ref.isDo;
        let opDeclareThis = _ref.opDeclareThis;
        let args = _ref.args;
        let opRestArg = _ref.opRestArg;
        let kind = _ref.kind;
        let block = _ref.block;

        context_1.check(opReturnType === null || !isDo, loc, _ => _.doFuncCantHaveType);
        verifyVal_1.verifyOpVal(opReturnType);
        const allArgs = util_1.cat(opDeclareThis, args, opRestArg);
        context_2.withFun(kind, () => {
            verifyLocals_1.verifyAndPlusLocals(allArgs, () => {
                verifyBlock_1.verifyBlockSK(block, isDo ? 0 : 1);
            });
        });
    }
    exports.verifyFunBlock = verifyFunBlock;
});
//# sourceMappingURL=verifyFun.js.map

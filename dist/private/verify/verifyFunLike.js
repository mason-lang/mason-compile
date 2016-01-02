(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../util', './context', './locals', './verifyBlock', './verifyLocalDeclare', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var util_1 = require('../util');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyLocalDeclare_1 = require('./verifyLocalDeclare');
    var verifyVal_1 = require('./verifyVal');
    function verifyFunLike(_) {
        const args = _.args;
        const opRestArg = _.opRestArg;
        const opReturnType = _.opReturnType;

        if (_ instanceof MsAst_1.FunAbstract) {
            for (const _ of args) verifyLocalDeclare_1.justVerifyLocalDeclare(_);
            Op_1.opEach(opRestArg, verifyLocalDeclare_1.justVerifyLocalDeclare);
            verifyVal_1.verifyOpVal(opReturnType);
        } else if (_ instanceof MsAst_1.Fun) {
            verifyFun(_);
        } else throw new Error();
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyFunLike;
    function verifyFun(_ref) {
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
            locals_1.verifyAndPlusLocals(allArgs, () => {
                verifyBlock_1.verifyBlockSK(block, isDo ? 0 : 1);
            });
        });
    }
    exports.verifyFun = verifyFun;
});
//# sourceMappingURL=verifyFunLike.js.map

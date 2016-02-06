(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/classTraitCommon', './context', './util', './verifyBlock', './verifyFun', './verifyLocals', './verifyMemberName'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const classTraitCommon_1 = require('../ast/classTraitCommon');
    const context_1 = require('./context');
    const util_1 = require('./util');
    const verifyBlock_1 = require('./verifyBlock');
    const verifyFun_1 = require('./verifyFun');
    const verifyLocals_1 = require('./verifyLocals');
    const verifyMemberName_1 = require('./verifyMemberName');
    function verifyMethodImplLike(_) {
        function doit(doVerify) {
            verifyMemberName_1.default(_.symbol);
            context_1.withMethod(_, doVerify);
        }
        if (_ instanceof classTraitCommon_1.MethodImpl) {
            const fun = _.fun;

            doit(() => {
                util_1.makeUseOptional(Op_1.orThrow(fun.opDeclareThis));
                verifyFun_1.verifyFunBlock(fun);
            });
        } else if (_ instanceof classTraitCommon_1.MethodGetter) {
            const declareThis = _.declareThis;
            const block = _.block;

            doit(() => {
                util_1.makeUseOptional(declareThis);
                verifyLocals_1.verifyAndPlusLocals([declareThis], () => {
                    verifyBlock_1.verifyBlockVal(block);
                });
            });
        } else if (_ instanceof classTraitCommon_1.MethodSetter) {
            const declareThis = _.declareThis;
            const declareFocus = _.declareFocus;
            const block = _.block;

            doit(() => {
                verifyLocals_1.verifyAndPlusLocals([declareThis, declareFocus], () => {
                    verifyBlock_1.verifyBlockDo(block);
                });
            });
        } else throw new Error(_.constructor.name);
    }
    exports.verifyMethodImplLike = verifyMethodImplLike;
    function verifyClassTraitDo(_ref) {
        let declareFocus = _ref.declareFocus;
        let block = _ref.block;

        context_1.withIife(() => {
            verifyLocals_1.verifyAndPlusLocal(declareFocus, () => verifyBlock_1.verifyBlockDo(block));
        });
    }
    exports.verifyClassTraitDo = verifyClassTraitDo;
});
//# sourceMappingURL=verifyClassTraitCommon.js.map

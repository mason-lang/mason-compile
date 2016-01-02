(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../MsAst', './context', './locals', './util', './verifyBlock', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var MsAst_1 = require('../MsAst');
    var context_1 = require('./context');
    var locals_1 = require('./locals');
    var util_1 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyVal_1 = require('./verifyVal');
    function verifyMethodImplLike(_) {
        function doit(doVerify) {
            util_1.verifyName(_.symbol);
            context_1.withMethod(_, doVerify);
        }
        if (_ instanceof MsAst_1.MethodImpl) {
            const fun = _.fun;

            doit(() => {
                util_1.makeUseOptional(Op_1.orThrow(fun.opDeclareThis));
                verifyVal_1.default(fun);
            });
        } else if (_ instanceof MsAst_1.MethodGetter) {
            const declareThis = _.declareThis;
            const block = _.block;

            doit(() => {
                util_1.makeUseOptional(declareThis);
                locals_1.verifyAndPlusLocals([declareThis], () => {
                    verifyBlock_1.verifyBlockVal(block);
                });
            });
        } else if (_ instanceof MsAst_1.MethodSetter) {
            const declareThis = _.declareThis;
            const declareFocus = _.declareFocus;
            const block = _.block;

            doit(() => {
                locals_1.verifyAndPlusLocals([declareThis, declareFocus], () => {
                    verifyBlock_1.verifyBlockDo(block);
                });
            });
        } else throw new Error();
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyMethodImplLike;
    function verifyClassTraitDo(_ref) {
        let declareFocus = _ref.declareFocus;
        let block = _ref.block;

        locals_1.verifyAndPlusLocal(declareFocus, () => verifyBlock_1.verifyBlockDo(block));
    }
    exports.verifyClassTraitDo = verifyClassTraitDo;
});
//# sourceMappingURL=verifyMethodImplLike.js.map

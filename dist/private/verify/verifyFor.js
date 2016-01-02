(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', './context', './locals', './util', './verifyBlock', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('./context');
    var locals_1 = require('./locals');
    var util_1 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyVal_1 = require('./verifyVal');
    function verifyFor(_) {
        const opIteratee = _.opIteratee;
        const block = _.block;

        function verifyForBlock() {
            context_1.withLoop(_, () => verifyBlock_1.verifyBlockDo(block));
        }
        Op_1.caseOp(opIteratee, _ => withVerifyIteratee(_, verifyForBlock), verifyForBlock);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyFor;
    function withVerifyIteratee(_ref, action) {
        let element = _ref.element;
        let bag = _ref.bag;

        verifyVal_1.default(bag);
        util_1.verifyNotLazy(element, _ => _.noLazyIteratee);
        locals_1.verifyAndPlusLocal(element, action);
    }
    exports.withVerifyIteratee = withVerifyIteratee;
});
//# sourceMappingURL=verifyFor.js.map

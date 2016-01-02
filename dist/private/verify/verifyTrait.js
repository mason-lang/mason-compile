(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', './context', './verifyMethodImplLike', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('./context');
    var verifyMethodImplLike_1 = require('./verifyMethodImplLike');
    var verifyVal_1 = require('./verifyVal');
    function verifyTrait(_ref) {
        let superTraits = _ref.superTraits;
        let opDo = _ref.opDo;
        let statics = _ref.statics;
        let methods = _ref.methods;

        verifyVal_1.verifyEachVal(superTraits);
        Op_1.opEach(opDo, verifyMethodImplLike_1.verifyClassTraitDo);
        context_1.withMethods(() => {
            for (const _ of statics) verifyMethodImplLike_1.default(_);
            for (const _ of methods) verifyMethodImplLike_1.default(_);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyTrait;
});
//# sourceMappingURL=verifyTrait.js.map

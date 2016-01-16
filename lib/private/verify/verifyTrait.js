(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', './context', './verifyClassTraitCommon', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('./context');
    var verifyClassTraitCommon_1 = require('./verifyClassTraitCommon');
    var verifyVal_1 = require('./verifyVal');
    function verifyTrait(_ref) {
        let superTraits = _ref.superTraits;
        let opDo = _ref.opDo;
        let statics = _ref.statics;
        let methods = _ref.methods;

        verifyVal_1.verifyEachVal(superTraits);
        Op_1.opEach(opDo, verifyClassTraitCommon_1.verifyClassTraitDo);
        context_1.withMethods(() => {
            for (const _ of statics) verifyClassTraitCommon_1.verifyMethodImplLike(_);
            for (const _ of methods) verifyClassTraitCommon_1.verifyMethodImplLike(_);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyTrait;
    function verifyTraitDo(_) {
        const implementor = _.implementor;
        const trait = _.trait;
        const statics = _.statics;
        const methods = _.methods;

        verifyVal_1.default(implementor);
        verifyVal_1.default(trait);
        context_1.withMethods(() => {
            for (const _ of statics) verifyClassTraitCommon_1.verifyMethodImplLike(_);
            for (const _ of methods) verifyClassTraitCommon_1.verifyMethodImplLike(_);
        });
    }
    exports.verifyTraitDo = verifyTraitDo;
});
//# sourceMappingURL=verifyTrait.js.map

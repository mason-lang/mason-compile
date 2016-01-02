(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', './context', './locals', './util', './verifyMethodImplLike', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var util_1 = require('./util');
    var verifyMethodImplLike_1 = require('./verifyMethodImplLike');
    var verifyVal_1 = require('./verifyVal');
    function verifyClass(_) {
        const opFields = _.opFields;
        const opSuperClass = _.opSuperClass;
        const traits = _.traits;
        const opDo = _.opDo;
        const statics = _.statics;
        const opConstructor = _.opConstructor;
        const methods = _.methods;

        Op_1.opEach(opFields, fields => {
            for (const _ of fields) verifyField(_);
        });
        verifyVal_1.verifyOpVal(opSuperClass);
        verifyVal_1.verifyEachVal(traits);
        context_2.withIife(() => {
            Op_1.opEach(opDo, verifyMethodImplLike_1.verifyClassTraitDo);
        });
        context_2.withMethods(() => {
            for (const _ of statics) verifyMethodImplLike_1.default(_);
            Op_1.opEach(opConstructor, _ => verifyConstructor(_, opSuperClass !== null));
            for (const _ of methods) verifyMethodImplLike_1.default(_);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyClass;
    function verifyConstructor(_, classHasSuper) {
        const loc = _.loc;
        const fun = _.fun;
        const memberArgs = _.memberArgs;

        util_1.makeUseOptional(Op_1.orThrow(fun.opDeclareThis));
        context_2.withMethod(_, () => verifyVal_1.default(fun));
        const superCall = context_2.results.constructorToSuper.get(_);
        if (classHasSuper) context_1.check(superCall !== undefined, loc, _ => _.superNeeded);else context_1.check(superCall === undefined, () => superCall.loc, _ => _.superForbidden);
        for (const arg of memberArgs) locals_1.setDeclareAccessed(arg, _);
    }
    function verifyField(_) {
        verifyVal_1.verifyOpVal(_.opType);
    }
});
//# sourceMappingURL=verifyClass.js.map

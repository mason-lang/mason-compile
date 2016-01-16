(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/Class', './context', './util', './verifyClassTraitCommon', './verifyLocals', './verifyMemberName', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Class_1 = require('../ast/Class');
    var context_2 = require('./context');
    var util_1 = require('./util');
    var verifyClassTraitCommon_1 = require('./verifyClassTraitCommon');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyMemberName_1 = require('./verifyMemberName');
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
        Op_1.opEach(opDo, verifyClassTraitCommon_1.verifyClassTraitDo);
        context_2.withMethods(() => {
            for (const _ of statics) verifyClassTraitCommon_1.verifyMethodImplLike(_);
            Op_1.opEach(opConstructor, _ => verifyConstructor(_, opSuperClass !== null));
            for (const _ of methods) verifyClassTraitCommon_1.verifyMethodImplLike(_);
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
        for (const arg of memberArgs) verifyLocals_1.setDeclareAccessed(arg, _);
    }
    function verifyField(_) {
        verifyVal_1.verifyOpVal(_.opType);
    }
    function verifySuperCall(_, sk) {
        const loc = _.loc;
        const args = _.args;

        const meth = Op_1.orThrow(context_2.method, () => context_1.fail(loc, _ => _.superNeedsMethod));
        context_2.results.superCallToMethod.set(_, meth);
        if (meth instanceof Class_1.Constructor) {
            context_1.check(sk === 0, loc, _ => _.superMustBeStatement);
            context_2.results.constructorToSuper.set(meth, _);
        }
        verifyVal_1.verifyEachVal(args);
    }
    exports.verifySuperCall = verifySuperCall;
    function verifySuperMember(_ref) {
        let loc = _ref.loc;
        let name = _ref.name;

        context_1.check(context_2.method !== null, loc, _ => _.superNeedsMethod);
        verifyMemberName_1.default(name);
    }
    exports.verifySuperMember = verifySuperMember;
});
//# sourceMappingURL=verifyClass.js.map

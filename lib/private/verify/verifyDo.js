(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/BuildEntry', '../ast/Do', '../ast/errors', '../ast/LineContent', '../ast/locals', '../ast/Loop', '../ast/Trait', './verifyBuildEntry', './verifyErrors', './verifyLocals', './verifyMemberName', './verifyLocals', './verifyLoop', './verifyTrait', './verifyVal', './verifyValOrDo'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var BuildEntry_1 = require('../ast/BuildEntry');
    var Do_1 = require('../ast/Do');
    var errors_1 = require('../ast/errors');
    var LineContent_1 = require('../ast/LineContent');
    var locals_1 = require('../ast/locals');
    var Loop_1 = require('../ast/Loop');
    var Trait_1 = require('../ast/Trait');
    var verifyBuildEntry_1 = require('./verifyBuildEntry');
    var verifyErrors_1 = require('./verifyErrors');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyMemberName_1 = require('./verifyMemberName');
    var verifyLocals_2 = require('./verifyLocals');
    var verifyLoop_1 = require('./verifyLoop');
    var verifyTrait_1 = require('./verifyTrait');
    var verifyVal_1 = require('./verifyVal');
    var verifyValOrDo_1 = require('./verifyValOrDo');
    function verifyDo(_) {
        if (_ instanceof errors_1.Assert) verifyErrors_1.verifyAssert(_);else if (_ instanceof locals_1.Assign) verifyLocals_1.verifyAssign(_);else if (_ instanceof BuildEntry_1.default) verifyBuildEntry_1.default(_);else if (_ instanceof Loop_1.Break) verifyLoop_1.verifyBreak(_);else if (_ instanceof Do_1.Ignore) {
            const ignoredNames = _.ignoredNames;

            for (const name of ignoredNames) verifyLocals_2.accessLocal(_, name);
        } else if (_ instanceof locals_1.LocalMutate) verifyLocals_1.verifyLocalMutate(_);else if (_ instanceof Do_1.MemberSet) {
            const object = _.object;
            const name = _.name;
            const opType = _.opType;
            const value = _.value;

            verifyVal_1.default(object);
            verifyMemberName_1.default(name);
            verifyVal_1.verifyOpVal(opType);
            verifyVal_1.default(value);
        } else if (_ instanceof Do_1.Pass) verifyVal_1.default(_.ignored);else if (_ instanceof Do_1.SetSub) {
            const object = _.object;
            const subbeds = _.subbeds;
            const opType = _.opType;
            const value = _.value;

            verifyVal_1.default(object);
            verifyVal_1.verifyEachVal(subbeds);
            verifyVal_1.verifyOpVal(opType);
            verifyVal_1.default(value);
        } else if (_ instanceof Do_1.SpecialDo) {} else if (_ instanceof errors_1.Throw) verifyErrors_1.verifyThrow(_);else if (_ instanceof Trait_1.TraitDo) verifyTrait_1.verifyTraitDo(_);else verifyValOrDo_1.default(_, 0);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyDo;
    function ensureDoAndVerify(_) {
        if (LineContent_1.isDo(_)) verifyDo(_);else throw context_1.fail(_.loc, _ => _.valueAsStatement);
    }
    exports.ensureDoAndVerify = ensureDoAndVerify;
    function verifyOpDo(_) {
        if (Op_1.nonNull(_)) verifyDo(_);
    }
    exports.verifyOpDo = verifyOpDo;
});
//# sourceMappingURL=verifyDo.js.map

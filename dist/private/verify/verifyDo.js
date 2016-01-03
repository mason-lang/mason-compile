(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/Block', '../ast/Class', '../ast/Do', '../ast/errors', '../ast/Fun', '../ast/LineContent', '../ast/locals', '../ast/Loop', '../ast/Method', '../ast/Trait', '../util', './context', './locals', './util', './verifyLocalDeclare', './verifyMethodImplLike', './verifyVal', './verifyValOrDo'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Block_1 = require('../ast/Block');
    var Class_1 = require('../ast/Class');
    var Do_1 = require('../ast/Do');
    var errors_1 = require('../ast/errors');
    var Fun_1 = require('../ast/Fun');
    var LineContent_1 = require('../ast/LineContent');
    var locals_1 = require('../ast/locals');
    var Loop_1 = require('../ast/Loop');
    var Method_1 = require('../ast/Method');
    var Trait_1 = require('../ast/Trait');
    var util_1 = require('../util');
    var context_2 = require('./context');
    var locals_2 = require('./locals');
    var util_2 = require('./util');
    var verifyLocalDeclare_1 = require('./verifyLocalDeclare');
    var verifyMethodImplLike_1 = require('./verifyMethodImplLike');
    var verifyVal_1 = require('./verifyVal');
    var verifyValOrDo_1 = require('./verifyValOrDo');
    function verifyDo(_) {
        if (_ instanceof errors_1.Assert) {
            verifyVal_1.default(_.condition);
            verifyVal_1.verifyOpVal(_.opThrown);
        } else if (_ instanceof locals_1.AssignSingle) {
            const assignee = _.assignee;
            const value = _.value;

            context_2.withName(assignee.name, () => {
                const doV = () => {
                    if (value instanceof Class_1.default || value instanceof Fun_1.default || value instanceof Method_1.default || value instanceof Trait_1.default) util_2.setName(value);
                    verifyLocalDeclare_1.justVerifyLocalDeclare(assignee);
                    verifyVal_1.default(value);
                };
                if (assignee.isLazy) locals_2.withBlockLocals(doV);else doV();
            });
        } else if (_ instanceof locals_1.AssignDestructure) {
            const assignees = _.assignees;
            const value = _.value;

            for (const _ of assignees) verifyLocalDeclare_1.justVerifyLocalDeclare(_);
            verifyVal_1.default(value);
        } else if (_ instanceof Block_1.BagEntry) {
            locals_2.accessLocal(_, 'built');
            verifyVal_1.default(_.value);
        } else if (_ instanceof Loop_1.Break) {
            const opValue = _.opValue;
            const loc = _.loc;

            verifyVal_1.verifyOpVal(opValue);
            const loop = Op_1.orThrow(context_2.opLoop, () => context_1.fail(loc, _ => _.misplacedBreak));
            if (loop instanceof Loop_1.For) {
                if (context_2.results.isStatement(loop)) context_1.check(opValue === null, loc, _ => _.breakCantHaveValue);else context_1.check(opValue !== null, loc, _ => _.breakNeedsValue);
            } else {
                util_1.assert(loop instanceof Loop_1.ForBag);
                context_1.check(opValue === null, this.loc, _ => _.breakValInForBag);
            }
            if (context_2.isInSwitch) {
                context_2.results.loopsNeedingLabel.add(loop);
                context_2.results.breaksInSwitch.add(_);
            }
        } else if (_ instanceof Do_1.Ignore) {
            const ignoredNames = _.ignoredNames;

            for (const name of ignoredNames) locals_2.accessLocal(_, name);
        } else if (_ instanceof locals_1.LocalMutate) verifyVal_1.default(_.value);else if (_ instanceof Block_1.MapEntry) {
            const key = _.key;
            const val = _.val;

            locals_2.accessLocal(_, 'built');
            verifyVal_1.default(key);
            verifyVal_1.default(val);
        } else if (_ instanceof Do_1.MemberSet) {
            const object = _.object;
            const name = _.name;
            const opType = _.opType;
            const value = _.value;

            verifyVal_1.default(object);
            util_2.verifyMemberName(name);
            verifyVal_1.verifyOpVal(opType);
            verifyVal_1.default(value);
        } else if (_ instanceof Block_1.ObjEntryAssign) {
            const assign = _.assign;

            if (!context_2.results.isObjEntryExport(_)) locals_2.accessLocal(_, 'built');
            verifyDo(assign);
            for (const assignee of assign.allAssignees()) locals_2.setDeclareAccessed(assignee, _);
        } else if (_ instanceof Block_1.ObjEntryPlain) {
            const loc = _.loc;
            const name = _.name;
            const value = _.value;

            if (context_2.results.isObjEntryExport(_)) context_1.check(typeof name === 'string', loc, _ => _.exportName);else {
                locals_2.accessLocal(_, 'built');
                util_2.verifyMemberName(name);
            }
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
        } else if (_ instanceof Do_1.SpecialDo) {} else if (_ instanceof Trait_1.TraitDo) {
            const implementor = _.implementor;
            const trait = _.trait;
            const statics = _.statics;
            const methods = _.methods;

            verifyVal_1.default(implementor);
            verifyVal_1.default(trait);
            context_2.withMethods(() => {
                for (const _ of statics) verifyMethodImplLike_1.default(_);
                for (const _ of methods) verifyMethodImplLike_1.default(_);
            });
        } else verifyValOrDo_1.default(_, 0);
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

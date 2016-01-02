(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../util', './context', './locals', './util', './verifyLocalDeclare', './verifyMethodImplLike', './verifyVal', './verifyValOrDo'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var util_1 = require('../util');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var util_2 = require('./util');
    var verifyLocalDeclare_1 = require('./verifyLocalDeclare');
    var verifyMethodImplLike_1 = require('./verifyMethodImplLike');
    var verifyVal_1 = require('./verifyVal');
    var verifyValOrDo_1 = require('./verifyValOrDo');
    function verifyDo(_) {
        if (_ instanceof MsAst_1.Assert) {
            verifyVal_1.default(_.condition);
            verifyVal_1.verifyOpVal(_.opThrown);
        } else if (_ instanceof MsAst_1.AssignSingle) {
            const assignee = _.assignee;
            const value = _.value;

            context_2.withName(assignee.name, () => {
                const doV = () => {
                    if (value instanceof MsAst_1.Class || value instanceof MsAst_1.Fun || value instanceof MsAst_1.Method || value instanceof MsAst_1.Trait) util_2.setName(value);
                    verifyLocalDeclare_1.justVerifyLocalDeclare(assignee);
                    verifyVal_1.default(value);
                };
                if (assignee.isLazy) locals_1.withBlockLocals(doV);else doV();
            });
        } else if (_ instanceof MsAst_1.AssignDestructure) {
            const assignees = _.assignees;
            const value = _.value;

            for (const _ of assignees) verifyLocalDeclare_1.justVerifyLocalDeclare(_);
            verifyVal_1.default(value);
        } else if (_ instanceof MsAst_1.BagEntry) {
            locals_1.accessLocal(_, 'built');
            verifyVal_1.default(_.value);
        } else if (_ instanceof MsAst_1.Break) {
            const opValue = _.opValue;
            const loc = _.loc;

            verifyVal_1.verifyOpVal(opValue);
            const loop = Op_1.orThrow(context_2.opLoop, () => context_1.fail(loc, _ => _.misplacedBreak));
            if (loop instanceof MsAst_1.For) {
                if (context_2.results.isStatement(loop)) context_1.check(opValue === null, loc, _ => _.breakCantHaveValue);else context_1.check(opValue !== null, loc, _ => _.breakNeedsValue);
            } else {
                util_1.assert(loop instanceof MsAst_1.ForBag);
                context_1.check(opValue === null, this.loc, _ => _.breakValInForBag);
            }
            if (context_2.isInSwitch) {
                context_2.results.loopsNeedingLabel.add(loop);
                context_2.results.breaksInSwitch.add(_);
            }
        } else if (_ instanceof MsAst_1.Ignore) {
            const ignoredNames = _.ignoredNames;

            for (const name of ignoredNames) locals_1.accessLocal(_, name);
        } else if (_ instanceof MsAst_1.LocalMutate) {
            verifyVal_1.default(_.value);
        } else if (_ instanceof MsAst_1.MapEntry) {
            const key = _.key;
            const val = _.val;

            locals_1.accessLocal(_, 'built');
            verifyVal_1.default(key);
            verifyVal_1.default(val);
        } else if (_ instanceof MsAst_1.MemberSet) {
            const object = _.object;
            const name = _.name;
            const opType = _.opType;
            const value = _.value;

            verifyVal_1.default(object);
            util_2.verifyName(name);
            verifyVal_1.verifyOpVal(opType);
            verifyVal_1.default(value);
        } else if (_ instanceof MsAst_1.ObjEntryAssign) {
            const assign = _.assign;

            if (!context_2.results.isObjEntryExport(_)) locals_1.accessLocal(_, 'built');
            verifyDo(assign);
            for (const assignee of assign.allAssignees()) locals_1.setDeclareAccessed(assignee, _);
        } else if (_ instanceof MsAst_1.ObjEntryPlain) {
            const loc = _.loc;
            const name = _.name;
            const value = _.value;

            if (context_2.results.isObjEntryExport(_)) context_1.check(typeof name === 'string', loc, _ => _.exportName);else {
                locals_1.accessLocal(_, 'built');
                util_2.verifyName(name);
            }
            verifyVal_1.default(value);
        } else if (_ instanceof MsAst_1.Pass) {
            verifyVal_1.default(_.ignored);
        } else if (_ instanceof MsAst_1.SetSub) {
            const object = _.object;
            const subbeds = _.subbeds;
            const opType = _.opType;
            const value = _.value;

            verifyVal_1.default(object);
            verifyVal_1.verifyEachVal(subbeds);
            verifyVal_1.verifyOpVal(opType);
            verifyVal_1.default(value);
        } else if (_ instanceof MsAst_1.SpecialDo) {} else if (_ instanceof MsAst_1.TraitDo) {
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
        } else {
            verifyValOrDo_1.default(_, 0);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyDo;
    function verifyDoP(_) {
        if (MsAst_1.isDo(_)) verifyDo(_);else throw context_1.fail(_.loc, _ => _.valueAsStatement);
    }
    exports.verifyDoP = verifyDoP;
    function verifyOpDo(_) {
        if (Op_1.nonNull(_)) verifyDo(_);
    }
    exports.verifyOpDo = verifyOpDo;
});
//# sourceMappingURL=verifyDo.js.map

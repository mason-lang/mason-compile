(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/Block', '../ast/booleans', '../ast/Call', '../ast/Class', '../ast/Fun', '../ast/LineContent', '../ast/locals', '../ast/Loop', '../ast/Method', '../ast/Trait', '../ast/Val', './context', './locals', './util', './verifyBlock', './verifyClass', './verifyFor', './verifyFunLike', './verifyFunLike', './verifyTrait', './verifyValOrDo'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Block_1 = require('../ast/Block');
    var booleans_1 = require('../ast/booleans');
    var Call_1 = require('../ast/Call');
    var Class_1 = require('../ast/Class');
    var Fun_1 = require('../ast/Fun');
    var LineContent_1 = require('../ast/LineContent');
    var locals_1 = require('../ast/locals');
    var Loop_1 = require('../ast/Loop');
    var Method_1 = require('../ast/Method');
    var Trait_1 = require('../ast/Trait');
    var Val_1 = require('../ast/Val');
    var context_2 = require('./context');
    var locals_2 = require('./locals');
    var util_1 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyClass_1 = require('./verifyClass');
    var verifyFor_1 = require('./verifyFor');
    var verifyFunLike_1 = require('./verifyFunLike');
    var verifyFunLike_2 = require('./verifyFunLike');
    var verifyTrait_1 = require('./verifyTrait');
    var verifyValOrDo_1 = require('./verifyValOrDo');
    function verifyVal(_) {
        if (_ instanceof Val_1.BagSimple) util_1.verifyEachValOrSpread(_.parts);else if (_ instanceof Block_1.BlockWrap) context_2.withIife(() => verifyBlock_1.verifyBlockVal(_.block));else if (_ instanceof Class_1.default) verifyClass_1.default(_);else if (_ instanceof Loop_1.ForBag) locals_2.verifyAndPlusLocal(_.built, () => verifyFor_1.default(_));else if (_ instanceof Fun_1.default) verifyFunLike_2.verifyFun(_);else if (_ instanceof Fun_1.GetterFun) util_1.verifyMemberName(_.name);else if (_ instanceof Val_1.InstanceOf) {
            const instance = _.instance;
            const type = _.type;

            verifyVal(instance);
            verifyVal(type);
        } else if (_ instanceof Val_1.Lazy) locals_2.withBlockLocals(() => verifyVal(_.value));else if (_ instanceof locals_1.LocalAccess) {
            const loc = _.loc;
            const name = _.name;

            const declare = context_2.locals.get(name);
            if (declare === undefined) {
                const builtinPath = Op_1.orThrow(context_1.options.opBuiltinPath(name), () => locals_2.missingLocalFail(loc, name));
                context_2.results.accessBuiltin(name, builtinPath);
            } else {
                context_2.results.localAccessToDeclare.set(_, declare);
                locals_2.setDeclareAccessed(declare, _);
            }
        } else if (_ instanceof booleans_1.Logic) {
            const loc = _.loc;
            const args = _.args;

            context_1.check(args.length > 1, loc, _ => _.argsLogic);
            verifyEachVal(args);
        } else if (_ instanceof Val_1.Member) {
            const object = _.object;
            const name = _.name;

            verifyVal(object);
            util_1.verifyMemberName(name);
        } else if (_ instanceof Fun_1.MemberFun) {
            const opObject = _.opObject;
            const name = _.name;

            verifyOpVal(opObject);
            util_1.verifyMemberName(name);
        } else if (_ instanceof Method_1.default) {
            const fun = _.fun;

            if (fun instanceof Fun_1.default) util_1.makeUseOptional(Op_1.orThrow(fun.opDeclareThis));
            fun.args.forEach(util_1.makeUseOptional);
            Op_1.opEach(fun.opRestArg, util_1.makeUseOptional);
            verifyFunLike_1.default(fun);
        } else if (_ instanceof Val_1.MsRegExp) {
            const loc = _.loc;
            const parts = _.parts;

            parts.forEach(util_1.verifyMemberName);
            const onlyPart = parts[0];
            if (parts.length === 1 && typeof onlyPart === 'string') try {
                new RegExp(onlyPart);
            } catch (err) {
                if (!(err instanceof SyntaxError)) throw err;
                throw context_1.fail(loc, _ => _.badRegExp(onlyPart));
            }
        } else if (_ instanceof Call_1.New) {
            const type = _.type;
            const args = _.args;

            verifyVal(type);
            util_1.verifyEachValOrSpread(args);
        } else if (_ instanceof booleans_1.Not) {
            verifyVal(_.arg);
        } else if (_ instanceof Val_1.NumberLiteral) {} else if (_ instanceof Val_1.ObjSimple) {
            const keys = new Set();
            for (const _ref of _.pairs) {
                const key = _ref.key;
                const value = _ref.value;
                const loc = _ref.loc;

                context_1.check(!keys.has(key), loc, _ => _.duplicateKey(key));
                keys.add(key);
                verifyVal(value);
            }
        } else if (_ instanceof Val_1.Pipe) {
            const loc = _.loc;
            const startValue = _.startValue;
            const pipes = _.pipes;

            verifyVal(startValue);
            for (const pipe of pipes) locals_2.registerAndPlusLocal(locals_1.LocalDeclare.focus(loc), () => {
                verifyVal(pipe);
            });
        } else if (_ instanceof Val_1.QuotePlain) {
            _.parts.forEach(util_1.verifyMemberName);
        } else if (_ instanceof Val_1.QuoteSimple) {} else if (_ instanceof Val_1.QuoteTaggedTemplate) {
            const tag = _.tag;
            const quote = _.quote;

            verifyVal(tag);
            verifyVal(quote);
        } else if (_ instanceof Val_1.Range) {
            const start = _.start;
            const opEnd = _.opEnd;

            verifyVal(start);
            verifyOpVal(opEnd);
        } else if (_ instanceof Fun_1.SimpleFun) {
            const loc = _.loc;
            const value = _.value;

            context_2.withFun(0, () => {
                locals_2.registerAndPlusLocal(locals_1.LocalDeclare.focus(loc), () => {
                    verifyVal(value);
                });
            });
        } else if (_ instanceof Val_1.SpecialVal) {
            util_1.setName(_);
        } else if (_ instanceof Val_1.Sub) {
            const subbed = _.subbed;
            const args = _.args;

            verifyVal(subbed);
            verifyEachVal(args);
        } else if (_ instanceof Class_1.SuperMember) {
            const loc = _.loc;
            const name = _.name;

            context_1.check(context_2.method !== null, loc, _ => _.superNeedsMethod);
            util_1.verifyMemberName(name);
        } else if (_ instanceof Trait_1.default) verifyTrait_1.default(_);else verifyValOrDo_1.default(_, 1);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyVal;
    function ensureValAndVerify(_) {
        if (LineContent_1.isVal(_)) verifyVal(_);else throw context_1.fail(_.loc, _ => _.statementAsValue);
    }
    exports.ensureValAndVerify = ensureValAndVerify;
    function verifyOpVal(_) {
        if (Op_1.nonNull(_)) verifyVal(_);
    }
    exports.verifyOpVal = verifyOpVal;
    function verifyEachVal(vals) {
        for (const _ of vals) verifyVal(_);
    }
    exports.verifyEachVal = verifyEachVal;
});
//# sourceMappingURL=verifyVal.js.map

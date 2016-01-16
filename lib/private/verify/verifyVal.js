(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/Block', '../ast/booleans', '../ast/Call', '../ast/Class', '../ast/Fun', '../ast/LineContent', '../ast/locals', '../ast/Loop', '../ast/Method', '../ast/Trait', '../ast/Quote', '../ast/Val', './context', './util', './verifyBlock', './verifyBooleans', './verifyCall', './verifyClass', './verifyFun', './verifyLocals', './verifyLoop', './verifyMemberName', './verifyMethod', './verifyQuote', './verifyTrait', './verifyValOrDo'], factory);
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
    var Quote_1 = require('../ast/Quote');
    var Val_1 = require('../ast/Val');
    var context_2 = require('./context');
    var util_1 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyBooleans_1 = require('./verifyBooleans');
    var verifyCall_1 = require('./verifyCall');
    var verifyClass_1 = require('./verifyClass');
    var verifyFun_1 = require('./verifyFun');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyLoop_1 = require('./verifyLoop');
    var verifyMemberName_1 = require('./verifyMemberName');
    var verifyMethod_1 = require('./verifyMethod');
    var verifyQuote_1 = require('./verifyQuote');
    var verifyTrait_1 = require('./verifyTrait');
    var verifyValOrDo_1 = require('./verifyValOrDo');
    function verifyVal(_) {
        if (_ instanceof Val_1.BagSimple) verifyCall_1.verifyEachValOrSpread(_.parts);else if (_ instanceof Block_1.BlockWrap) context_2.withIife(() => verifyBlock_1.verifyBlockVal(_.block));else if (_ instanceof Class_1.default) verifyClass_1.default(_);else if (_ instanceof Loop_1.ForBag) verifyLocals_1.verifyAndPlusLocal(_.built, () => verifyLoop_1.default(_, 1));else if (_ instanceof Fun_1.default) verifyFun_1.default(_);else if (_ instanceof Val_1.InstanceOf) {
            const instance = _.instance;
            const type = _.type;

            verifyVal(instance);
            verifyVal(type);
        } else if (_ instanceof Val_1.Lazy) verifyLocals_1.withBlockLocals(() => verifyVal(_.value));else if (_ instanceof locals_1.LocalAccess) verifyLocals_1.verifyLocalAccess(_);else if (_ instanceof booleans_1.Logic) verifyBooleans_1.verifyLogic(_);else if (_ instanceof Val_1.Member) {
            const object = _.object;
            const name = _.name;

            verifyVal(object);
            verifyMemberName_1.default(name);
        } else if (_ instanceof Method_1.default) verifyMethod_1.default(_);else if (_ instanceof Quote_1.MsRegExp) verifyQuote_1.verifyRegExp(_);else if (_ instanceof Call_1.New) verifyCall_1.verifyNew(_);else if (_ instanceof booleans_1.Not) verifyBooleans_1.verifyNot(_);else if (_ instanceof Val_1.NumberLiteral) {} else if (_ instanceof Val_1.ObjSimple) {
            const keys = new Set();
            for (const _ref of _.pairs) {
                const key = _ref.key;
                const value = _ref.value;
                const loc = _ref.loc;

                if (typeof key === 'string') {
                    context_1.check(!keys.has(key), loc, _ => _.duplicateKey(key));
                    keys.add(key);
                } else verifyVal(key);
                verifyVal(value);
            }
        } else if (_ instanceof Val_1.Pipe) {
            const loc = _.loc;
            const startValue = _.startValue;
            const pipes = _.pipes;

            verifyVal(startValue);
            for (const pipe of pipes) verifyLocals_1.registerAndPlusLocal(locals_1.LocalDeclare.focus(loc), () => {
                verifyVal(pipe);
            });
        } else if (_ instanceof Quote_1.default) verifyQuote_1.default(_);else if (_ instanceof Quote_1.QuoteTagged) verifyQuote_1.verifyQuoteTagged(_);else if (_ instanceof Val_1.Range) {
            const start = _.start;
            const opEnd = _.opEnd;

            verifyVal(start);
            verifyOpVal(opEnd);
        } else if (_ instanceof Val_1.SpecialVal) {
            if (_.kind === 1) util_1.setName(_);
        } else if (_ instanceof Val_1.Sub) {
            const subbed = _.subbed;
            const args = _.args;

            verifyVal(subbed);
            verifyEachVal(args);
        } else if (_ instanceof Class_1.SuperMember) verifyClass_1.verifySuperMember(_);else if (_ instanceof Trait_1.default) verifyTrait_1.default(_);else verifyValOrDo_1.default(_, 1);
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

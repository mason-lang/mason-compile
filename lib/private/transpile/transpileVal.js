(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/ObjectExpression', 'op/Op', '../ast/Await', '../ast/Block', '../ast/Call', '../ast/Case', '../ast/Class', '../ast/booleans', '../ast/Del', '../ast/errors', '../ast/Fun', '../ast/locals', '../ast/Loop', '../ast/Poly', '../ast/Quote', '../ast/Switch', '../ast/Trait', '../ast/Val', '../ast/With', '../ast/YieldLike', './context', './ms', './transpileAwait', './transpileBlock', './transpileBooleans', './transpileCall', './transpileCase', './transpileClass', './transpileDel', './transpileErrors', './transpileFun', './transpileLocals', './transpileLoop', './transpileMemberName', './transpileOperator', './transpilePoly', './transpileQuote', './transpileSwitch', './transpileTrait', './transpileWith', './transpileYieldLike', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const Identifier_1 = require('esast/lib/Identifier');
    const Literal_1 = require('esast/lib/Literal');
    const ObjectExpression_1 = require('esast/lib/ObjectExpression');
    const Op_1 = require('op/Op');
    const Await_1 = require('../ast/Await');
    const Block_1 = require('../ast/Block');
    const Call_1 = require('../ast/Call');
    const Case_1 = require('../ast/Case');
    const Class_1 = require('../ast/Class');
    const booleans_1 = require('../ast/booleans');
    const Del_1 = require('../ast/Del');
    const errors_1 = require('../ast/errors');
    const Fun_1 = require('../ast/Fun');
    const locals_1 = require('../ast/locals');
    const Loop_1 = require('../ast/Loop');
    const Poly_1 = require('../ast/Poly');
    const Quote_1 = require('../ast/Quote');
    const Switch_1 = require('../ast/Switch');
    const Trait_1 = require('../ast/Trait');
    const Val_1 = require('../ast/Val');
    const With_1 = require('../ast/With');
    const YieldLike_1 = require('../ast/YieldLike');
    const context_1 = require('./context');
    const ms_1 = require('./ms');
    const transpileAwait_1 = require('./transpileAwait');
    const transpileBlock_1 = require('./transpileBlock');
    const transpileBooleans_1 = require('./transpileBooleans');
    const transpileCall_1 = require('./transpileCall');
    const transpileCase_1 = require('./transpileCase');
    const transpileClass_1 = require('./transpileClass');
    const transpileDel_1 = require('./transpileDel');
    const transpileErrors_1 = require('./transpileErrors');
    const transpileFun_1 = require('./transpileFun');
    const transpileLocals_1 = require('./transpileLocals');
    const transpileLoop_1 = require('./transpileLoop');
    const transpileMemberName_1 = require('./transpileMemberName');
    const transpileOperator_1 = require('./transpileOperator');
    const transpilePoly_1 = require('./transpilePoly');
    const transpileQuote_1 = require('./transpileQuote');
    const transpileSwitch_1 = require('./transpileSwitch');
    const transpileTrait_1 = require('./transpileTrait');
    const transpileWith_1 = require('./transpileWith');
    const transpileYieldLike_1 = require('./transpileYieldLike');
    const util_1 = require('./util');
    function transpileVal(_) {
        return util_1.loc(_, transpileValNoLoc(_));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileVal;
    function transpileValNoLoc(_) {
        if (_ instanceof Await_1.default) return transpileAwait_1.transpileAwaitNoLoc(_);else if (_ instanceof Val_1.BagSimple) return new Expression_1.ArrayExpression(_.parts.map(transpileVal));else if (_ instanceof Block_1.BlockWrap) return transpileBlock_1.transpileBlockVal(_.block);else if (_ instanceof Call_1.default) return transpileCall_1.transpileCallNoLoc(_);else if (_ instanceof Case_1.default) return transpileCase_1.transpileCaseValNoLoc(_);else if (_ instanceof Class_1.default) return transpileClass_1.transpileClassNoLoc(_);else if (_ instanceof booleans_1.Cond) return transpileBooleans_1.transpileCondNoLoc(_);else if (_ instanceof booleans_1.Conditional) return transpileBooleans_1.transpileConditionalValNoLoc(_);else if (_ instanceof Del_1.default) return transpileDel_1.transpileDelNoLoc(_);else if (_ instanceof errors_1.Except) return transpileErrors_1.transpileExceptValNoLoc(_);else if (_ instanceof Loop_1.For) return transpileLoop_1.transpileForValNoLoc(_);else if (_ instanceof Loop_1.ForAsync) return transpileLoop_1.transpileForAsyncValNoLoc(_);else if (_ instanceof Loop_1.ForBag) return transpileLoop_1.transpileForBagNoLoc(_);else if (_ instanceof Fun_1.default) return transpileFun_1.transpileFunNoLoc(_);else if (_ instanceof Val_1.InstanceOf) {
            const instance = _.instance;
            const type = _.type;

            return ms_1.msCall('hasInstance', transpileVal(type), transpileVal(instance));
        } else if (_ instanceof Val_1.Lazy) return util_1.lazyWrap(transpileVal(_.value));else if (_ instanceof locals_1.LocalAccess) return transpileLocals_1.transpileLocalAccessNoLoc(_);else if (_ instanceof Val_1.Member) {
            const object = _.object;
            const name = _.name;

            return transpileMemberName_1.transpileMember(transpileVal(object), name);
        } else if (_ instanceof Quote_1.MsRegExp) return transpileQuote_1.transpileRegExpNoLoc(_);else if (_ instanceof Call_1.New) return transpileCall_1.transpileNewNoLoc(_);else if (_ instanceof Val_1.NumberLiteral) {
            const value = Number(_.value);
            const lit = new Literal_1.LiteralNumber(Math.abs(value));
            const isPositive = value >= 0 && 1 / value !== -Infinity;
            return isPositive ? lit : new Expression_1.UnaryExpression('-', lit);
        } else if (_ instanceof Val_1.ObjSimple) return new ObjectExpression_1.default(_.pairs.map(_ref => {
            let key = _ref.key;
            let value = _ref.value;
            return new ObjectExpression_1.PropertyPlain(transpileMemberName_1.transpileMemberNameToPropertyName(key), transpileVal(value));
        }));else if (_ instanceof Val_1.Operator) return transpileOperator_1.transpileOperatorNoLoc(_);else if (_ instanceof Val_1.Pipe) {
            const startValue = _.startValue;
            const pipes = _.pipes;

            return pipes.reduce((expr, pipe) => util_1.callFocusFun(transpileVal(pipe), expr), transpileVal(startValue));
        } else if (_ instanceof Poly_1.default) return transpilePoly_1.transpilePolyNoLoc(_);else if (_ instanceof Quote_1.default) return transpileQuote_1.transpileQuoteNoLoc(_);else if (_ instanceof Quote_1.QuoteTagged) return transpileQuote_1.transpileQuoteTaggedNoLoc(_);else if (_ instanceof Val_1.Range) {
            const start = _.start;
            const opEnd = _.opEnd;
            const isExclusive = _.isExclusive;

            const endAst = Op_1.caseOp(opEnd, transpileVal, () => globalInfinity);
            return ms_1.msCall('range', transpileVal(start), endAst, new Literal_1.LiteralBoolean(isExclusive));
        } else if (_ instanceof Val_1.SpecialVal) switch (_.kind) {
            case 0:
                return new Literal_1.LiteralBoolean(false);
            case 1:
                return new Literal_1.LiteralString(context_1.verifyResults.name(_));
            case 2:
                return new Literal_1.LiteralNull();
            case 3:
                return new Literal_1.LiteralBoolean(true);
            case 4:
                return new Expression_1.UnaryExpression('void', litZero);
            default:
                throw new Error(String(_.kind));
        } else if (_ instanceof Val_1.Sub) {
            const subbed = _.subbed;
            const args = _.args;

            return ms_1.msCall('sub', transpileVal(subbed), ...args.map(transpileVal));
        } else if (_ instanceof Class_1.SuperCall) return transpileClass_1.transpileSuperCallValNoLoc(_);else if (_ instanceof Class_1.SuperMember) return transpileClass_1.transpileSuperMemberNoLoc(_);else if (_ instanceof Switch_1.default) return transpileSwitch_1.transpileSwitchValNoLoc(_);else if (_ instanceof Trait_1.default) return transpileTrait_1.transpileTraitNoLoc(_);else if (_ instanceof Val_1.UnaryOperator) return transpileOperator_1.transpileUnaryOperatorNoLoc(_);else if (_ instanceof With_1.default) return transpileWith_1.transpileWithValNoLoc(_);else if (_ instanceof YieldLike_1.default) return transpileYieldLike_1.transpileYieldLikeNoLoc(_);else throw new Error(_.constructor.name);
    }
    const globalInfinity = new Identifier_1.default('Infinity');
    const litZero = new Literal_1.LiteralNumber(0);
});
//# sourceMappingURL=transpileVal.js.map

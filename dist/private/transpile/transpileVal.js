var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/ObjectExpression', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../ast/Await', '../ast/Block', '../ast/Call', '../ast/Case', '../ast/Class', '../ast/booleans', '../ast/Del', '../ast/errors', '../ast/Fun', '../ast/locals', '../ast/Loop', '../ast/Method', '../ast/Val', '../ast/Switch', '../ast/Trait', '../ast/With', '../ast/Yield', '../util', './esast-constants', './context', './transpileBlock', './transpileCase', './transpileClass', './transpileFor', './transpileExcept', './transpileFun', './transpileMisc', './transpileVal', './transpileQuotePlain', './transpileSpecial', './transpileSwitch', './transpileTrait', './transpileX', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var ObjectExpression_1 = require('esast/lib/ObjectExpression');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var Await_1 = require('../ast/Await');
    var Block_1 = require('../ast/Block');
    var Call_1 = require('../ast/Call');
    var Case_1 = require('../ast/Case');
    var Class_1 = require('../ast/Class');
    var booleans_1 = require('../ast/booleans');
    var Del_1 = require('../ast/Del');
    var errors_1 = require('../ast/errors');
    var Fun_1 = require('../ast/Fun');
    var locals_1 = require('../ast/locals');
    var Loop_1 = require('../ast/Loop');
    var Method_1 = require('../ast/Method');
    var Val_1 = require('../ast/Val');
    var Switch_1 = require('../ast/Switch');
    var Trait_1 = require('../ast/Trait');
    var With_1 = require('../ast/With');
    var Yield_1 = require('../ast/Yield');
    var util_2 = require('../util');
    var esast_constants_1 = require('./esast-constants');
    var context_1 = require('./context');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileCase_1 = require('./transpileCase');
    var transpileClass_1 = require('./transpileClass');
    var transpileFor_1 = require('./transpileFor');
    var transpileExcept_1 = require('./transpileExcept');
    var transpileFun_1 = require('./transpileFun');
    var transpileMisc_1 = require('./transpileMisc');
    var transpileVal_1 = require('./transpileVal');
    var transpileQuotePlain_1 = require('./transpileQuotePlain');
    var transpileSpecial_1 = require('./transpileSpecial');
    var transpileSwitch_1 = require('./transpileSwitch');
    var transpileTrait_1 = require('./transpileTrait');
    var transpileX_1 = require('./transpileX');
    var util_3 = require('./util');
    function transpileVal(_) {
        return util_3.loc(_, transpileValNoLoc(_));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileVal;
    function transpileValNoLoc(_) {
        if (_ instanceof Await_1.default) return transpileX_1.transpileAwaitNoLoc(_);else if (_ instanceof Val_1.BagSimple) return new Expression_1.ArrayExpression(_.parts.map(transpileVal_1.default));else if (_ instanceof Block_1.BlockWrap) return util_3.blockWrap(transpileBlock_1.default(_.block));else if (_ instanceof Call_1.default) return transpileX_1.transpileCallNoLoc(_);else if (_ instanceof Case_1.default) return transpileCase_1.transpileCaseValNoLoc(_);else if (_ instanceof Class_1.default) return transpileClass_1.transpileClassNoLoc(_);else if (_ instanceof booleans_1.Cond) return transpileX_1.transpileCondNoLoc(_);else if (_ instanceof booleans_1.Conditional) {
            const test = _.test;
            const result = _.result;
            const isUnless = _.isUnless;

            const resultAst = util_3.msCall('some', util_3.blockWrapIfBlock(result));
            const none = util_3.msMember('None');

            var _ref = isUnless ? [none, resultAst] : [resultAst, none];

            var _ref2 = _slicedToArray(_ref, 2);

            const then = _ref2[0];
            const _else = _ref2[1];

            return new Expression_1.ConditionalExpression(transpileVal_1.default(test), then, _else);
        } else if (_ instanceof Del_1.default) return transpileX_1.transpileDelNoLoc(_);else if (_ instanceof errors_1.Except) return transpileExcept_1.transpileExceptValNoLoc(_);else if (_ instanceof Loop_1.For) return transpileFor_1.transpileForValNoLoc(_);else if (_ instanceof Loop_1.ForAsync) return transpileFor_1.transpileForAsyncValNoLoc(_);else if (_ instanceof Loop_1.ForBag) return transpileFor_1.transpileForBagNoLoc(_);else if (_ instanceof Fun_1.default) return transpileFun_1.transpileFunNoLoc(_);else if (_ instanceof Fun_1.GetterFun) return util_3.focusFun(util_3.memberStringOrVal(esast_constants_1.IdFocus, _.name));else if (_ instanceof Val_1.InstanceOf) {
            const instance = _.instance;
            const type = _.type;

            return util_3.msCall('hasInstance', transpileVal_1.default(type), transpileVal_1.default(instance));
        } else if (_ instanceof Val_1.Lazy) return util_3.lazyWrap(transpileVal_1.default(_.value));else if (_ instanceof locals_1.LocalAccess) {
            const name = _.name;

            if (name === 'this') return new Identifier_1.default('_this');else {
                const ld = context_1.verifyResults.localDeclareForAccess(_);
                return ld === undefined ? util_1.identifier(name) : util_3.accessLocalDeclare(ld);
            }
        } else if (_ instanceof booleans_1.Logic) {
            const kind = _.kind;
            const args = _.args;

            return util_2.tail(args).reduce((expr, arg) => new Expression_1.LogicalExpression(kind === 0 ? '&&' : '||', expr, transpileVal_1.default(arg)), transpileVal_1.default(args[0]));
        } else if (_ instanceof Val_1.Member) {
            const object = _.object;
            const name = _.name;

            return util_3.memberStringOrVal(transpileVal_1.default(object), name);
        } else if (_ instanceof Fun_1.MemberFun) {
            const opObject = _.opObject;
            const name = _.name;

            const nameAst = transpileMisc_1.transpileMemberName(name);
            return Op_1.caseOp(opObject, _ => util_3.msCall('methodBound', transpileVal_1.default(_), nameAst), () => util_3.msCall('methodUnbound', nameAst));
        } else if (_ instanceof Method_1.default) {
            const fun = _.fun;

            const name = new Expression_1.LiteralString(context_1.verifyResults.name(_));
            const args = fun.opRestArg === null ? new Expression_1.ArrayExpression(fun.args.map(arg => {
                const name = new Expression_1.LiteralString(arg.name);
                return Op_1.caseOp(arg.opType, _ => new Expression_1.ArrayExpression([name, transpileVal_1.default(_)]), () => name);
            })) : esast_constants_1.LitUndefined;
            const impl = fun instanceof Fun_1.default ? [transpileFun_1.default(fun)] : [];
            return util_3.msCall('method', name, args, ...impl);
        } else if (_ instanceof Val_1.MsRegExp) {
            const parts = _.parts;
            const flags = _.flags;

            if (parts.length === 0) return new Expression_1.LiteralRegExp(new RegExp('', flags));else {
                const firstPart = parts[0];
                if (parts.length === 1 && typeof firstPart === 'string') return new Expression_1.LiteralRegExp(new RegExp(firstPart.replace('\n', '\\n'), flags));else return util_3.msCall('regexp', new Expression_1.ArrayExpression(parts.map(transpileMisc_1.transpileMemberName)), new Expression_1.LiteralString(flags));
            }
        } else if (_ instanceof Call_1.New) {
            const type = _.type;
            const args = _.args;

            return new Expression_1.NewExpression(transpileVal_1.default(type), transpileMisc_1.transpileArguments(args));
        } else if (_ instanceof booleans_1.Not) return new Expression_1.UnaryExpression('!', transpileVal_1.default(_.arg));else if (_ instanceof Val_1.NumberLiteral) {
            const value = Number(_.value);
            const lit = new Expression_1.LiteralNumber(Math.abs(value));
            const isPositive = value >= 0 && 1 / value !== -Infinity;
            return isPositive ? lit : new Expression_1.UnaryExpression('-', lit);
        } else if (_ instanceof Val_1.ObjSimple) return new ObjectExpression_1.default(_.pairs.map(_ref3 => {
            let key = _ref3.key;
            let value = _ref3.value;
            return new ObjectExpression_1.PropertyPlain(util_1.propertyIdOrLiteral(key), transpileVal_1.default(value));
        }));else if (_ instanceof Val_1.Pipe) {
            const startValue = _.startValue;
            const pipes = _.pipes;

            return pipes.reduce((expr, pipe) => util_3.callFocusFun(transpileVal_1.default(pipe), expr), transpileVal_1.default(startValue));
        } else if (_ instanceof Val_1.QuotePlain) return transpileQuotePlain_1.transpileQuotePlainNoLoc(_);else if (_ instanceof Val_1.QuoteSimple) return new Expression_1.LiteralString(_.value);else if (_ instanceof Val_1.QuoteTaggedTemplate) {
            const tag = _.tag;
            const quote = _.quote;

            return new Expression_1.TaggedTemplateExpression(transpileVal_1.default(tag), transpileQuotePlain_1.default(quote));
        } else if (_ instanceof Val_1.Range) {
            const start = _.start;
            const opEnd = _.opEnd;
            const isExclusive = _.isExclusive;

            const endAst = Op_1.caseOp(opEnd, transpileVal_1.default, () => GlobalInfinity);
            return util_3.msCall('range', transpileVal_1.default(start), endAst, new Expression_1.LiteralBoolean(isExclusive));
        } else if (_ instanceof Fun_1.SimpleFun) return util_3.focusFun(transpileVal_1.default(_.value));else if (_ instanceof Val_1.SpecialVal) return transpileSpecial_1.transpileSpecialValNoLoc(_);else if (_ instanceof Val_1.Sub) {
            const subbed = _.subbed;
            const args = _.args;

            return util_3.msCall('sub', transpileVal_1.default(subbed), ...args.map(transpileVal_1.default));
        } else if (_ instanceof Class_1.SuperCall) {
            const method = context_1.verifyResults.superCallToMethod.get(_);
            if (method instanceof Class_1.Constructor) throw new Error();else return transpileX_1.superCallCall(_, method);
        } else if (_ instanceof Class_1.SuperMember) return util_3.memberStringOrVal(esast_constants_1.IdSuper, _.name);else if (_ instanceof Switch_1.default) return transpileSwitch_1.transpileSwitchValNoLoc(_);else if (_ instanceof Trait_1.default) return transpileTrait_1.transpileTraitNoLoc(_);else if (_ instanceof With_1.default) {
            var _transpileX_1$withPar = transpileX_1.withParts(_);

            const idDeclare = _transpileX_1$withPar.idDeclare;
            const val = _transpileX_1$withPar.val;
            const lead = _transpileX_1$withPar.lead;

            return util_3.blockWrap(transpileBlock_1.default(_.block, lead, null, new Statement_1.ReturnStatement(idDeclare)));
        } else if (_ instanceof Yield_1.Yield) return transpileX_1.transpileYieldNoLoc(_);else if (_ instanceof Yield_1.YieldTo) return transpileX_1.transpileYieldToNoLoc(_);else throw new Error();
    }
    const GlobalInfinity = new Identifier_1.default('Infinity');
});
//# sourceMappingURL=transpileVal.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Literal', 'esast/lib/Statement', '../ast/Await', '../ast/booleans', '../ast/BuildEntry', '../ast/Call', '../ast/Case', '../ast/Class', '../ast/Del', '../ast/Do', '../ast/errors', '../ast/locals', '../ast/Loop', '../ast/Switch', '../ast/Trait', '../ast/With', '../ast/YieldLike', './ms', './transpileAwait', './transpileBooleans', './transpileBuildEntry', './transpileCall', './transpileCase', './transpileClass', './transpileDel', './transpileErrors', './transpileLocals', './transpileLoop', './transpileMemberName', './transpileSwitch', './transpileTrait', './transpileVal', './transpileWith', './transpileYieldLike', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const Literal_1 = require('esast/lib/Literal');
    const Statement_1 = require('esast/lib/Statement');
    const Await_1 = require('../ast/Await');
    const booleans_1 = require('../ast/booleans');
    const BuildEntry_1 = require('../ast/BuildEntry');
    const Call_1 = require('../ast/Call');
    const Case_1 = require('../ast/Case');
    const Class_1 = require('../ast/Class');
    const Del_1 = require('../ast/Del');
    const Do_1 = require('../ast/Do');
    const errors_1 = require('../ast/errors');
    const locals_1 = require('../ast/locals');
    const Loop_1 = require('../ast/Loop');
    const Switch_1 = require('../ast/Switch');
    const Trait_1 = require('../ast/Trait');
    const With_1 = require('../ast/With');
    const YieldLike_1 = require('../ast/YieldLike');
    const ms_1 = require('./ms');
    const transpileAwait_1 = require('./transpileAwait');
    const transpileBooleans_1 = require('./transpileBooleans');
    const transpileBuildEntry_1 = require('./transpileBuildEntry');
    const transpileCall_1 = require('./transpileCall');
    const transpileCase_1 = require('./transpileCase');
    const transpileClass_1 = require('./transpileClass');
    const transpileDel_1 = require('./transpileDel');
    const transpileErrors_1 = require('./transpileErrors');
    const transpileLocals_1 = require('./transpileLocals');
    const transpileLoop_1 = require('./transpileLoop');
    const transpileMemberName_1 = require('./transpileMemberName');
    const transpileSwitch_1 = require('./transpileSwitch');
    const transpileTrait_1 = require('./transpileTrait');
    const transpileVal_1 = require('./transpileVal');
    const transpileWith_1 = require('./transpileWith');
    const transpileYieldLike_1 = require('./transpileYieldLike');
    const util_1 = require('./util');
    function transpileDo(_) {
        const ast = transpileDoNoLoc(_);
        if (ast instanceof Array) for (const part of ast) part.loc = _.loc;else ast.loc = _.loc;
        return ast;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileDo;
    function transpileDoNoLoc(_) {
        if (_ instanceof errors_1.Assert) return transpileErrors_1.transpileAssertNoLoc(_);else if (_ instanceof locals_1.Assign) return transpileLocals_1.transpileAssignNoLoc(_);else if (_ instanceof Await_1.default) return new Statement_1.ExpressionStatement(transpileAwait_1.transpileAwaitNoLoc(_));else if (_ instanceof BuildEntry_1.default) return transpileBuildEntry_1.transpileBuildEntryNoLoc(_);else if (_ instanceof Loop_1.Break) return transpileLoop_1.transpileBreakNoLoc(_);else if (_ instanceof Call_1.default) return new Statement_1.ExpressionStatement(transpileCall_1.transpileCallNoLoc(_));else if (_ instanceof Case_1.default) return transpileCase_1.transpileCaseDoNoLoc(_);else if (_ instanceof booleans_1.Cond) return new Statement_1.ExpressionStatement(transpileBooleans_1.transpileCondNoLoc(_));else if (_ instanceof booleans_1.Conditional) return transpileBooleans_1.transpileConditionalDoNoLoc(_);else if (_ instanceof Del_1.default) return new Statement_1.ExpressionStatement(transpileDel_1.transpileDelNoLoc(_));else if (_ instanceof errors_1.Except) return transpileErrors_1.transpileExceptDoNoLoc(_);else if (_ instanceof Loop_1.For) return transpileLoop_1.transpileForDoNoLoc(_);else if (_ instanceof Loop_1.ForAsync) return transpileLoop_1.transpileForAsyncDoNoLoc(_);else if (_ instanceof Do_1.Ignore) return [];else if (_ instanceof locals_1.LocalMutate) return transpileLocals_1.transpileLocalMutateNoLoc(_);else if (_ instanceof Do_1.MemberSet) {
            const object = _.object;
            const name = _.name;
            const opType = _.opType;
            const kind = _.kind;
            const value = _.value;

            const obj = transpileVal_1.default(object);
            const strName = typeof name === 'string' ? name : '<computed member>';
            const val = util_1.maybeWrapInCheckInstance(transpileVal_1.default(value), opType, strName);
            return new Statement_1.ExpressionStatement((() => {
                switch (kind) {
                    case 0:
                        return ms_1.msCall('newProperty', obj, transpileMemberName_1.default(name), val);
                    case 1:
                        return new Expression_1.AssignmentExpression('=', transpileMemberName_1.transpileMember(obj, name), val);
                    default:
                        throw new Error();
                }
            })());
        } else if (_ instanceof Do_1.Pass) {
            return new Statement_1.ExpressionStatement(transpileVal_1.default(_.ignored));
        } else if (_ instanceof Do_1.SetSub) {
            const object = _.object;
            const subbeds = _.subbeds;
            const kind = _.kind;
            const opType = _.opType;
            const value = _.value;

            const kindStr = (() => {
                switch (kind) {
                    case 0:
                        return 'init';
                    case 1:
                        return 'mutate';
                    default:
                        throw new Error();
                }
            })();
            return new Statement_1.ExpressionStatement(ms_1.msCall('setSub', transpileVal_1.default(object), subbeds.length === 1 ? transpileVal_1.default(subbeds[0]) : new Expression_1.ArrayExpression(subbeds.map(transpileVal_1.default)), util_1.maybeWrapInCheckInstance(transpileVal_1.default(value), opType, 'value'), new Literal_1.LiteralString(kindStr)));
        } else if (_ instanceof Do_1.SpecialDo) switch (_.kind) {
            case 0:
                return new Statement_1.DebuggerStatement();
            default:
                throw new Error(String(_.kind));
        } else if (_ instanceof Class_1.SuperCall) return transpileClass_1.transpileSuperCallDoNoLoc(_);else if (_ instanceof Switch_1.default) return transpileSwitch_1.transpileSwitchDoNoLoc(_);else if (_ instanceof errors_1.Throw) {
            return transpileErrors_1.transpileThrowNoLoc(_);
        } else if (_ instanceof Trait_1.TraitDo) return transpileTrait_1.transpileTraitDoNoLoc(_);else if (_ instanceof With_1.default) return transpileWith_1.transpileWithDoNoLoc(_);else if (_ instanceof YieldLike_1.default) return new Statement_1.ExpressionStatement(transpileYieldLike_1.transpileYieldLikeNoLoc(_));else throw new Error(_.constructor.name);
    }
});
//# sourceMappingURL=transpileDo.js.map

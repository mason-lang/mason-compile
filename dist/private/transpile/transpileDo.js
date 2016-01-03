(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Statement', 'esast-create-util/lib/util', '../ast/Await', '../ast/Block', '../ast/booleans', '../ast/Call', '../ast/Case', '../ast/Class', '../ast/Del', '../ast/Do', '../ast/errors', '../ast/locals', '../ast/Loop', '../ast/Switch', '../ast/Trait', '../ast/With', '../ast/Yield', '../util', './context', './esast-constants', './transpileAssertNoLoc', './transpileBlock', './transpileCase', './transpileClass', './transpileExcept', './transpileFor', './transpileMisc', './transpileModule', './transpileSwitch', './transpileTrait', './transpileVal', './transpileX', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    var Await_1 = require('../ast/Await');
    var Block_1 = require('../ast/Block');
    var booleans_1 = require('../ast/booleans');
    var Call_1 = require('../ast/Call');
    var Case_1 = require('../ast/Case');
    var Class_1 = require('../ast/Class');
    var Del_1 = require('../ast/Del');
    var Do_1 = require('../ast/Do');
    var errors_1 = require('../ast/errors');
    var locals_1 = require('../ast/locals');
    var Loop_1 = require('../ast/Loop');
    var Switch_1 = require('../ast/Switch');
    var Trait_1 = require('../ast/Trait');
    var With_1 = require('../ast/With');
    var Yield_1 = require('../ast/Yield');
    var util_2 = require('../util');
    var context_1 = require('./context');
    var esast_constants_1 = require('./esast-constants');
    var transpileAssertNoLoc_1 = require('./transpileAssertNoLoc');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileCase_1 = require('./transpileCase');
    var transpileClass_1 = require('./transpileClass');
    var transpileExcept_1 = require('./transpileExcept');
    var transpileFor_1 = require('./transpileFor');
    var transpileMisc_1 = require('./transpileMisc');
    var transpileModule_1 = require('./transpileModule');
    var transpileSwitch_1 = require('./transpileSwitch');
    var transpileTrait_1 = require('./transpileTrait');
    var transpileVal_1 = require('./transpileVal');
    var transpileX_1 = require('./transpileX');
    var util_3 = require('./util');
    function transpileDo(_) {
        const ast = transpileDoNoLoc(_);
        if (ast instanceof Array) for (const part of ast) part.loc = _.loc;else ast.loc = _.loc;
        return ast;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileDo;
    function transpileDoNoLoc(_) {
        if (_ instanceof errors_1.Assert) return transpileAssertNoLoc_1.default(_);else if (_ instanceof locals_1.AssignSingle) {
            return transpileX_1.transpileAssignSingleNoLoc(_);
        } else if (_ instanceof locals_1.AssignDestructure) {
            const assignees = _.assignees;
            const kind = _.kind;
            const value = _.value;

            return new Declaration_1.VariableDeclarationLet(util_3.makeDestructureDeclarators(assignees, kind === 1, transpileVal_1.default(value), false));
        } else if (_ instanceof Await_1.default) return new Statement_1.ExpressionStatement(transpileX_1.transpileAwaitNoLoc(_));else if (_ instanceof Block_1.BagEntry) {
            const isMany = _.isMany;
            const value = _.value;

            return new Statement_1.ExpressionStatement(util_3.msCall(isMany ? 'addMany' : 'add', esast_constants_1.IdBuilt, transpileVal_1.default(value)));
        } else if (_ instanceof Loop_1.Break) return transpileFor_1.transpileBreakNoLoc(_);else if (_ instanceof Call_1.default) return new Statement_1.ExpressionStatement(transpileX_1.transpileCallNoLoc(_));else if (_ instanceof Case_1.default) return transpileCase_1.transpileCaseDoNoLoc(_);else if (_ instanceof booleans_1.Cond) return new Statement_1.ExpressionStatement(transpileX_1.transpileCondNoLoc(_));else if (_ instanceof booleans_1.Conditional) {
            const test = _.test;
            const result = _.result;
            const isUnless = _.isUnless;

            const testAst = transpileVal_1.default(test);
            return new Statement_1.IfStatement(isUnless ? new Expression_1.UnaryExpression('!', testAst) : testAst, result instanceof Block_1.default ? transpileBlock_1.transpileBlockDo(result) : new Statement_1.ExpressionStatement(transpileVal_1.default(result)));
        } else if (_ instanceof Del_1.default) return new Statement_1.ExpressionStatement(transpileX_1.transpileDelNoLoc(_));else if (_ instanceof errors_1.Except) return transpileExcept_1.transpileExceptDoNoLoc(_);else if (_ instanceof Loop_1.For) return transpileFor_1.transpileForDoNoLoc(_);else if (_ instanceof Loop_1.ForAsync) return transpileFor_1.transpileForAsyncDoNoLoc(_);else if (_ instanceof Do_1.Ignore) return [];else if (_ instanceof locals_1.LocalMutate) {
            const name = _.name;
            const value = _.value;

            return new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', util_1.identifier(name), transpileVal_1.default(value)));
        } else if (_ instanceof Block_1.MapEntry) {
            const key = _.key;
            const val = _.val;

            return new Statement_1.ExpressionStatement(util_3.msCall('setSub', esast_constants_1.IdBuilt, transpileVal_1.default(key), transpileVal_1.default(val)));
        } else if (_ instanceof Do_1.MemberSet) {
            const object = _.object;
            const name = _.name;
            const opType = _.opType;
            const kind = _.kind;
            const value = _.value;

            const obj = transpileVal_1.default(object);
            const strName = typeof name === 'string' ? name : 'computed member';
            const val = util_3.maybeWrapInCheckInstance(transpileVal_1.default(value), opType, strName);
            return new Statement_1.ExpressionStatement((() => {
                switch (kind) {
                    case 0:
                        return util_3.msCall('newProperty', obj, transpileMisc_1.transpileMemberName(name), val);
                    case 1:
                        return new Expression_1.AssignmentExpression('=', util_3.memberStringOrVal(obj, name), val);
                    default:
                        throw new Error();
                }
            })());
        } else if (_ instanceof Block_1.ObjEntryAssign) {
            const assign = _.assign;

            if (assign instanceof locals_1.AssignSingle && !assign.assignee.isLazy) {
                const name = assign.assignee.name;
                return transpileX_1.transpileAssignSingleNoLoc(assign, val => context_1.verifyResults.isObjEntryExport(_) ? transpileModule_1.exportNamedOrDefault(val, name) : new Expression_1.AssignmentExpression('=', util_1.member(esast_constants_1.IdBuilt, name), val));
            } else {
                const assigns = assign.allAssignees().map(_ => new Statement_1.ExpressionStatement(util_3.msCall('setLazy', esast_constants_1.IdBuilt, new Expression_1.LiteralString(_.name), util_3.idForDeclareCached(_))));
                return util_2.cat(transpileDo(assign), assigns);
            }
        } else if (_ instanceof Block_1.ObjEntryPlain) {
            const name = _.name;
            const value = _.value;

            const val = transpileVal_1.default(value);
            return new Statement_1.ExpressionStatement(context_1.verifyResults.isObjEntryExport(_) ? transpileModule_1.exportNamedOrDefault(val, name) : new Expression_1.AssignmentExpression('=', util_3.memberStringOrVal(esast_constants_1.IdBuilt, name), val));
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
            return new Statement_1.ExpressionStatement(util_3.msCall('setSub', transpileVal_1.default(object), subbeds.length === 1 ? transpileVal_1.default(subbeds[0]) : new Expression_1.ArrayExpression(subbeds.map(transpileVal_1.default)), util_3.maybeWrapInCheckInstance(transpileVal_1.default(value), opType, 'value'), new Expression_1.LiteralString(kindStr)));
        } else if (_ instanceof Do_1.SpecialDo) switch (_.kind) {
            case 0:
                return new Statement_1.DebuggerStatement();
            default:
                throw new Error(String(_.kind));
        } else if (_ instanceof Class_1.SuperCall) {
            const args = _.args;

            const method = context_1.verifyResults.superCallToMethod.get(_);
            if (method instanceof Class_1.Constructor) {
                const call = new Statement_1.ExpressionStatement(new Expression_1.CallExpression(esast_constants_1.IdSuper, args.map(transpileVal_1.default)));
                const memberSets = transpileClass_1.constructorSetMembers(method);
                return util_2.cat(call, memberSets, esast_constants_1.SetLexicalThis);
            } else return new Statement_1.ExpressionStatement(transpileX_1.superCallCall(_, method));
        } else if (_ instanceof Switch_1.default) return transpileSwitch_1.transpileSwitchDoNoLoc(_);else if (_ instanceof errors_1.Throw) {
            return transpileMisc_1.transpileThrowNoLoc(_);
        } else if (_ instanceof Trait_1.TraitDo) return transpileTrait_1.transpileTraitDoNoLoc(_);else if (_ instanceof With_1.default) {
            var _transpileX_1$withPar = transpileX_1.withParts(_);

            const idDeclare = _transpileX_1$withPar.idDeclare;
            const val = _transpileX_1$withPar.val;
            const lead = _transpileX_1$withPar.lead;

            return transpileBlock_1.transpileBlockNoLoc(_.block, lead);
        } else if (_ instanceof Yield_1.Yield) return new Statement_1.ExpressionStatement(transpileX_1.transpileYieldNoLoc(_));else if (_ instanceof Yield_1.YieldTo) return new Statement_1.ExpressionStatement(transpileX_1.transpileYieldToNoLoc(_));else throw new Error(_.constructor.name);
    }
});
//# sourceMappingURL=transpileDo.js.map

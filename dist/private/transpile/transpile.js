var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast-create-util/lib/util', 'op/Op', '../MsAst', '../MsAst', '../util', './ast-constants', './context', './transpileAssert', './transpileBlock', './transpileCase', './transpileClass', './transpileExcept', './transpileFor', './transpileFun', './transpileModule', './transpileQuotePlain', './transpileSpecial', './transpileSwitch', './transpileTrait', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var MsAst_1 = require('../MsAst');
    var MsAstTypes = require('../MsAst');
    var util_2 = require('../util');
    var ast_constants_1 = require('./ast-constants');
    var context_1 = require('./context');
    var transpileAssert_1 = require('./transpileAssert');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileCase_1 = require('./transpileCase');
    var transpileClass_1 = require('./transpileClass');
    var transpileExcept_1 = require('./transpileExcept');
    var transpileFor_1 = require('./transpileFor');
    var transpileFun_1 = require('./transpileFun');
    var transpileModule_1 = require('./transpileModule');
    var transpileQuotePlain_1 = require('./transpileQuotePlain');
    var transpileSpecial_1 = require('./transpileSpecial');
    var transpileSwitch_1 = require('./transpileSwitch');
    var transpileTrait_1 = require('./transpileTrait');
    var util_3 = require('./util');
    function transpile(moduleExpression, verifyResults) {
        context_1.setup(verifyResults);
        const res = util_3.t0(moduleExpression);
        context_1.tearDown();
        return res;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpile;
    util_2.implementMany(MsAstTypes, 'transpile', {
        Assert: transpileAssert_1.default,
        AssignSingle(valWrap) {
            const val = valWrap === undefined ? util_3.t0(this.value) : valWrap(util_3.t0(this.value));
            return new ast_1.VariableDeclaration('let', [util_3.makeDeclarator(this.assignee, val, false)]);
        },
        AssignDestructure() {
            return new ast_1.VariableDeclaration('let', util_3.makeDestructureDeclarators(this.assignees, this.kind === 1, util_3.t0(this.value), false));
        },
        Await() {
            return new ast_1.YieldExpression(util_3.t0(this.value), false);
        },
        BagEntry() {
            return util_3.msCall(this.isMany ? 'addMany' : 'add', ast_constants_1.IdBuilt, util_3.t0(this.value));
        },
        BagSimple() {
            return new ast_1.ArrayExpression(this.parts.map(util_3.t0));
        },
        Block: transpileBlock_1.default,
        BlockWrap() {
            return util_3.blockWrap(util_3.t0(this.block));
        },
        Break: transpileFor_1.transpileBreak,
        Call() {
            return new ast_1.CallExpression(util_3.t0(this.called), this.args.map(util_3.t0));
        },
        Case: transpileCase_1.default,
        CasePart: transpileCase_1.transpileCasePart,
        Catch: transpileExcept_1.transpileCatch,
        Class: transpileClass_1.default,
        Cond() {
            return new ast_1.ConditionalExpression(util_3.t0(this.test), util_3.t0(this.ifTrue), util_3.t0(this.ifFalse));
        },
        Conditional() {
            const test = util_3.t0(this.test);
            if (context_1.verifyResults.isStatement(this)) return new ast_1.IfStatement(this.isUnless ? new ast_1.UnaryExpression('!', test) : test, util_3.t0(this.result));else {
                const result = util_3.msCall('some', util_3.blockWrapIfBlock(this.result));
                const none = util_3.msMember('None');

                var _ref = this.isUnless ? [none, result] : [result, none];

                var _ref2 = _slicedToArray(_ref, 2);

                const then = _ref2[0];
                const _else = _ref2[1];

                return new ast_1.ConditionalExpression(test, then, _else);
            }
        },
        Constructor: transpileClass_1.transpileConstructor,
        Del() {
            return util_3.msCall('del', util_3.t0(this.subbed), ...this.args.map(util_3.t0));
        },
        Except: transpileExcept_1.default,
        For: transpileFor_1.transpileFor,
        ForAsync: transpileFor_1.transpileForAsync,
        ForBag: transpileFor_1.transpileForBag,
        Fun: transpileFun_1.default,
        GetterFun() {
            return util_3.focusFun(util_3.memberStringOrVal(ast_constants_1.IdFocus, this.name));
        },
        Ignore() {
            return [];
        },
        InstanceOf() {
            return util_3.msCall('hasInstance', util_3.t0(this.type), util_3.t0(this.instance));
        },
        Lazy() {
            return util_3.lazyWrap(util_3.t0(this.value));
        },
        NumberLiteral() {
            const value = Number(this.value);
            const lit = new ast_1.LiteralNumber(Math.abs(value));
            const isPositive = value >= 0 && 1 / value !== -Infinity;
            return isPositive ? lit : new ast_1.UnaryExpression('-', lit);
        },
        LocalAccess() {
            if (this.name === 'this') return ast_constants_1.IdLexicalThis;else {
                const ld = context_1.verifyResults.localDeclareForAccess(this);
                return ld === undefined ? util_1.identifier(this.name) : util_3.accessLocalDeclare(ld);
            }
        },
        LocalDeclare() {
            return new ast_1.Identifier(util_3.idForDeclareCached(this).name);
        },
        LocalMutate() {
            return new ast_1.ExpressionStatement(new ast_1.AssignmentExpression('=', util_1.identifier(this.name), util_3.t0(this.value)));
        },
        Logic() {
            return util_2.tail(this.args).reduce((expr, arg) => new ast_1.LogicalExpression(this.kind === 0 ? '&&' : '||', expr, util_3.t0(arg)), util_3.t0(this.args[0]));
        },
        MapEntry() {
            return new ast_1.ExpressionStatement(util_3.msCall('setSub', ast_constants_1.IdBuilt, util_3.t0(this.key), util_3.t0(this.val)));
        },
        Member() {
            return util_3.memberStringOrVal(util_3.t0(this.object), this.name);
        },
        MemberFun() {
            const name = util_3.transpileName(this.name);
            return Op_1.caseOp(this.opObject, _ => util_3.msCall('methodBound', util_3.t0(_), name), () => util_3.msCall('methodUnbound', name));
        },
        MemberSet() {
            const obj = util_3.t0(this.object);
            const val = util_3.maybeWrapInCheckInstance(util_3.t0(this.value), this.opType, this.name);
            return new ast_1.ExpressionStatement((() => {
                switch (this.kind) {
                    case 0:
                        return util_3.msCall('newProperty', obj, util_3.transpileName(this.name), val);
                    case 1:
                        return new ast_1.AssignmentExpression('=', util_3.memberStringOrVal(obj, this.name), val);
                    default:
                        throw new Error();
                }
            })());
        },
        Method() {
            const name = new ast_1.LiteralString(context_1.verifyResults.name(this));
            const args = this.fun.opRestArg === null ? new ast_1.ArrayExpression(this.fun.args.map(arg => {
                const name = new ast_1.LiteralString(arg.name);
                return Op_1.caseOp(arg.opType, _ => new ast_1.ArrayExpression([name, util_3.t0(_)]), () => name);
            })) : ast_constants_1.LitUndefined;
            const impl = this.fun instanceof MsAst_1.Fun ? [util_3.t0(this.fun)] : [];
            return util_3.msCall('method', name, args, ...impl);
        },
        Module: transpileModule_1.default,
        MsRegExp() {
            return this.parts.length === 0 ? new ast_1.LiteralRegExp(new RegExp('', this.flags)) : this.parts.length === 1 && typeof this.parts[0] === 'string' ? new ast_1.LiteralRegExp(new RegExp(this.parts[0].replace('\n', '\\n'), this.flags)) : util_3.msCall('regexp', new ast_1.ArrayExpression(this.parts.map(util_3.transpileName)), new ast_1.LiteralString(this.flags));
        },
        New() {
            return new ast_1.NewExpression(util_3.t0(this.type), this.args.map(util_3.t0));
        },
        Not() {
            return new ast_1.UnaryExpression('!', util_3.t0(this.arg));
        },
        ObjEntryAssign() {
            if (this.assign instanceof MsAst_1.AssignSingle && !this.assign.assignee.isLazy) {
                const name = this.assign.assignee.name;
                return util_3.t1(this.assign, val => context_1.verifyResults.isObjEntryExport(this) ? transpileModule_1.exportNamedOrDefault(val, name) : new ast_1.ExpressionStatement(new ast_1.AssignmentExpression('=', util_1.member(ast_constants_1.IdBuilt, name), val)));
            } else {
                const assigns = this.assign.allAssignees().map(_ => util_3.msCall('setLazy', ast_constants_1.IdBuilt, new ast_1.LiteralString(_.name), util_3.idForDeclareCached(_)));
                return util_2.cat(util_3.t0(this.assign), assigns);
            }
        },
        ObjEntryPlain() {
            const val = util_3.t0(this.value);
            return context_1.verifyResults.isObjEntryExport(this) ? transpileModule_1.exportNamedOrDefault(val, this.name) : new ast_1.AssignmentExpression('=', util_3.memberStringOrVal(ast_constants_1.IdBuilt, this.name), val);
        },
        ObjSimple() {
            return new ast_1.ObjectExpression(this.pairs.map(pair => new ast_1.PropertyPlain(util_1.propertyIdOrLiteral(pair.key), util_3.t0(pair.value))));
        },
        Pass() {
            return new ast_1.ExpressionStatement(util_3.t0(this.ignored));
        },
        Pipe() {
            return this.pipes.reduce((expr, pipe) => util_3.callFocusFun(util_3.t0(pipe), expr), util_3.t0(this.startValue));
        },
        QuotePlain: transpileQuotePlain_1.default,
        QuoteSimple() {
            return new ast_1.LiteralString(this.value);
        },
        QuoteTaggedTemplate() {
            return new ast_1.TaggedTemplateExpression(util_3.t0(this.tag), util_3.t0(this.quote));
        },
        Range() {
            const end = Op_1.caseOp(this.end, util_3.t0, () => GlobalInfinity);
            return util_3.msCall('range', util_3.t0(this.start), end, new ast_1.LiteralBoolean(this.isExclusive));
        },
        SetSub() {
            const getKind = () => {
                switch (this.kind) {
                    case 0:
                        return 'init';
                    case 1:
                        return 'mutate';
                    default:
                        throw new Error();
                }
            };
            const kind = getKind();
            return new ast_1.ExpressionStatement(util_3.msCall('setSub', util_3.t0(this.object), this.subbeds.length === 1 ? util_3.t0(this.subbeds[0]) : this.subbeds.map(util_3.t0), util_3.maybeWrapInCheckInstance(util_3.t0(this.value), this.opType, 'value'), new ast_1.LiteralString(kind)));
        },
        SimpleFun() {
            return util_3.focusFun(util_3.t0(this.value));
        },
        SpecialDo: transpileSpecial_1.transpileSpecialDo,
        SpecialVal: transpileSpecial_1.transpileSpecialVal,
        Spread() {
            return new ast_1.SpreadElement(util_3.t0(this.spreaded));
        },
        Sub() {
            return util_3.msCall('sub', util_3.t0(this.subbed), ...this.args.map(util_3.t0));
        },
        SuperCall() {
            const args = this.args.map(util_3.t0);
            const method = context_1.verifyResults.superCallToMethod.get(this);
            if (method instanceof MsAst_1.Constructor) {
                const call = new ast_1.CallExpression(ast_constants_1.IdSuper, args);
                const memberSets = transpileClass_1.constructorSetMembers(method);
                return util_2.cat(call, memberSets, ast_constants_1.SetLexicalThis);
            } else return new ast_1.CallExpression(util_3.memberStringOrVal(ast_constants_1.IdSuper, method.symbol), args);
        },
        SuperMember() {
            return util_3.memberStringOrVal(ast_constants_1.IdSuper, this.name);
        },
        Switch: transpileSwitch_1.default,
        SwitchPart: transpileSwitch_1.transpileSwitchPart,
        Throw() {
            return Op_1.caseOp(this.opThrown, _ => util_3.doThrow(_), () => new ast_1.ThrowStatement(new ast_1.NewExpression(ast_constants_1.GlobalError, [LitStrThrow])));
        },
        Trait: transpileTrait_1.default,
        TraitDo: transpileTrait_1.transpileTraitDo,
        With() {
            const idDeclare = util_3.idForDeclareCached(this.declare);
            const val = util_3.t0(this.value);
            const lead = util_3.plainLet(idDeclare, val);
            return context_1.verifyResults.isStatement(this) ? util_3.t1(this.block, lead) : util_3.blockWrap(util_3.t3(this.block, lead, null, new ast_1.ReturnStatement(idDeclare)));
        },
        Yield() {
            return new ast_1.YieldExpression(Op_1.opMap(this.opValue, util_3.t0), false);
        },
        YieldTo() {
            return new ast_1.YieldExpression(util_3.t0(this.value), true);
        }
    });
    const GlobalInfinity = new ast_1.Identifier('Infinity');
    const LitStrThrow = new ast_1.LiteralString('An error occurred.');
});
//# sourceMappingURL=transpile.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../MsAst', '../util', './context', './locals', './SK', './util', './verifyBlock'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAstTypes = require('../MsAst');
    var MsAst_1 = require('../MsAst');
    var util_1 = require('../util');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var SK_1 = require('./SK');
    var util_2 = require('./util');
    var verifyBlock_1 = require('./verifyBlock');
    function verify(module) {
        context_2.setup();
        module.verify();
        locals_1.warnUnusedLocals();
        const res = context_2.results;
        context_2.tearDown();
        return res;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verify;
    function verifyOpVal(_) {
        if (Op_1.nonNull(_)) _.verify(1);
    }
    function verifyOpDo(_) {
        if (Op_1.nonNull(_)) _.verify(0);
    }
    function verifyEachVal(vals) {
        for (const _ of vals) _.verify(1);
    }
    util_1.implementMany(MsAstTypes, 'verify', {
        Assert(sk) {
            SK_1.checkDo(this, sk);
            this.condition.verify(1);
            verifyOpVal(this.opThrown);
        },
        AssignSingle(sk) {
            SK_1.checkDo(this, sk);
            context_2.withName(this.assignee.name, () => {
                const doV = () => {
                    if (this.value instanceof MsAst_1.Class || this.value instanceof MsAst_1.Fun || this.value instanceof MsAst_1.Method || this.value instanceof MsAst_1.Trait) util_2.setName(this.value);
                    this.assignee.verify();
                    this.value.verify(1);
                };
                if (this.assignee.isLazy) locals_1.withBlockLocals(doV);else doV();
            });
        },
        AssignDestructure(sk) {
            SK_1.checkDo(this, sk);
            for (const _ of this.assignees) _.verify();
            this.value.verify(1);
        },
        Await(_sk) {
            context_1.check(context_2.funKind === 1, this.loc, _ => _.misplacedAwait);
            this.value.verify(1);
        },
        BagEntry(sk) {
            SK_1.checkDo(this, sk);
            locals_1.accessLocal(this, 'built');
            this.value.verify(1);
        },
        BagSimple(sk) {
            SK_1.checkVal(this, sk);
            util_2.verifyEachValOrSpread(this.parts);
        },
        Block: verifyBlock_1.default,
        BlockWrap(sk) {
            SK_1.checkVal(this, sk);
            context_2.withIife(() => this.block.verify(sk));
        },
        Break(sk) {
            SK_1.checkDo(this, sk);
            verifyOpVal(this.opValue);
            const loop = Op_1.orThrow(context_2.opLoop, () => context_1.fail(this.loc, _ => _.misplacedBreak));
            if (loop instanceof MsAst_1.For) {
                if (context_2.results.isStatement(loop)) context_1.check(this.opValue === null, this.loc, _ => _.breakCantHaveValue);else context_1.check(this.opValue !== null, this.loc, _ => _.breakNeedsValue);
            } else {
                util_1.assert(loop instanceof MsAst_1.ForBag);
                context_1.check(this.opValue === null, this.loc, _ => _.breakValInForBag);
            }
            if (context_2.isInSwitch) {
                context_2.results.loopsNeedingLabel.add(loop);
                context_2.results.breaksInSwitch.add(this);
            }
        },
        Call(_sk) {
            this.called.verify(1);
            util_2.verifyEachValOrSpread(this.args);
        },
        Case(sk) {
            SK_1.markStatement(this, sk);
            context_2.withIifeIfVal(sk, () => {
                const doIt = () => {
                    util_2.verifyEach(this.parts, sk);
                    util_2.verifyOp(this.opElse, sk);
                };
                Op_1.caseOp(this.opCased, _ => {
                    _.verify(0);
                    locals_1.verifyAndPlusLocal(_.assignee, doIt);
                }, doIt);
            });
        },
        CasePart(sk) {
            if (this.test instanceof MsAst_1.Pattern) {
                this.test.type.verify(1);
                this.test.patterned.verify(1);
                locals_1.verifyAndPlusLocals(this.test.locals, () => this.result.verify(sk));
            } else {
                this.test.verify(1);
                this.result.verify(sk);
            }
        },
        Catch(sk) {
            util_2.makeUseOptionalIfFocus(this.caught);
            util_2.verifyNotLazy(this.caught, _ => _.noLazyCatch);
            locals_1.verifyAndPlusLocal(this.caught, () => {
                this.block.verify(sk);
            });
        },
        Class(sk) {
            SK_1.checkVal(this, sk);
            Op_1.opEach(this.opFields, fields => {
                for (const _ of fields) _.verify();
            });
            verifyOpVal(this.opSuperClass);
            verifyEachVal(this.traits);
            context_2.withIife(() => {
                Op_1.opEach(this.opDo, _ => _.verify());
            });
            context_2.withMethods(() => {
                for (const _ of this.statics) _.verify();
                Op_1.opEach(this.opConstructor, _ => _.verify(this.opSuperClass !== null));
                for (const _ of this.methods) _.verify();
            });
        },
        ClassTraitDo() {
            locals_1.verifyAndPlusLocal(this.declareFocus, () => this.block.verify(0));
        },
        Cond(sk) {
            this.test.verify(1);
            this.ifTrue.verify(sk);
            this.ifFalse.verify(sk);
        },
        Conditional(sk) {
            SK_1.markStatement(this, sk);
            this.test.verify(1);
            context_2.withIifeIf(this.result instanceof MsAst_1.Block && sk === 1, () => {
                this.result.verify(sk);
            });
        },
        Constructor(classHasSuper) {
            util_2.makeUseOptional(this.fun.opDeclareThis);
            context_2.withMethod(this, () => {
                this.fun.verify(1);
            });
            const superCall = context_2.results.constructorToSuper.get(this);
            if (classHasSuper) context_1.check(superCall !== undefined, this.loc, _ => _.superNeeded);else context_1.check(superCall === undefined, () => superCall.loc, _ => _.superForbidden);
            for (const _ of this.memberArgs) locals_1.setDeclareAccessed(_, this);
        },
        Del(_sk) {
            this.subbed.verify(1);
            verifyEachVal(this.args);
        },
        Except(sk) {
            SK_1.markStatement(this, sk);
            if (this.opElse === null) this.try.verify(sk);else {
                locals_1.plusLocals(verifyBlock_1.verifyDoBlock(this.try), () => this.opElse.verify(sk));
                if (util_1.isEmpty(this.allCatches)) context_1.warn(this.loc, _ => _.elseRequiresCatch);
            }
            if (util_1.isEmpty(this.allCatches) && this.opFinally === null) context_1.warn(this.loc, _ => _.uselessExcept);
            util_2.verifyEach(this.typedCatches, sk);
            util_2.verifyOp(this.opCatchAll, sk);
            verifyOpDo(this.opFinally);
        },
        Field() {
            verifyOpVal(this.opType);
        },
        For(sk) {
            SK_1.markStatement(this, sk);
            verifyFor(this);
        },
        ForAsync(sk) {
            SK_1.markStatement(this, sk);
            context_1.check(sk !== 0 || context_2.funKind === 1, this.loc, _ => _.forAsyncNeedsAsync);
            withVerifyIteratee(this.iteratee, () => {
                context_2.withFun(1, () => {
                    this.block.verify(SK_1.getSK(this.block));
                });
            });
        },
        ForBag(sk) {
            SK_1.checkVal(this, sk);
            locals_1.verifyAndPlusLocal(this.built, () => verifyFor(this));
        },
        Fun(sk) {
            SK_1.checkVal(this, sk);
            context_1.check(this.opReturnType === null || !this.isDo, this.loc, _ => _.doFuncCantHaveType);
            verifyOpVal(this.opReturnType);
            const args = util_1.cat(this.opDeclareThis, this.args, this.opRestArg);
            context_2.withFun(this.kind, () => {
                locals_1.verifyAndPlusLocals(args, () => {
                    this.block.verify(this.isDo ? 0 : 1);
                });
            });
        },
        FunAbstract() {
            for (const _ of this.args) _.verify();
            Op_1.opEach(this.opRestArg, _ => _.verify());
            Op_1.opEach(this.opReturnType, _ => _.verify());
        },
        GetterFun(sk) {
            SK_1.checkVal(this, sk);
            util_2.verifyName(this.name);
        },
        Ignore(sk) {
            SK_1.checkDo(this, sk);
            for (const _ of this.ignoredNames) locals_1.accessLocal(this, _);
        },
        Import() {
            function addUseLocal(ld) {
                const prev = context_2.locals.get(ld.name);
                context_1.check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc));
                locals_1.verifyLocalDeclare(ld);
                locals_1.setLocal(ld);
            }
            for (const _ of this.imported) addUseLocal(_);
            Op_1.opEach(this.opImportDefault, addUseLocal);
        },
        InstanceOf(sk) {
            SK_1.checkVal(this, sk);
            this.instance.verify(1);
            this.type.verify(1);
        },
        Lazy(sk) {
            SK_1.checkVal(this, sk);
            locals_1.withBlockLocals(() => this.value.verify(1));
        },
        LocalAccess(sk) {
            SK_1.checkVal(this, sk);
            const declare = context_2.locals.get(this.name);
            if (declare === undefined) {
                const builtinPath = Op_1.orThrow(context_1.options.opBuiltinPath(this.name), () => locals_1.missingLocalFail(this.loc, this.name));
                context_2.results.accessBuiltin(this.name, builtinPath);
            } else {
                context_2.results.localAccessToDeclare.set(this, declare);
                locals_1.setDeclareAccessed(declare, this);
            }
        },
        LocalDeclare() {
            Op_1.opEach(context_1.options.opBuiltinPath(this.name), path => {
                context_1.warn(this.loc, _ => _.overriddenBuiltin(this.name, path));
            });
            Op_1.opEach(this.opType, _ => _.verify());
        },
        LocalMutate(sk) {
            SK_1.checkDo(this, sk);
            this.value.verify(1);
        },
        Logic(sk) {
            SK_1.checkVal(this, sk);
            context_1.check(this.args.length > 1, this.loc, _ => _.argsLogic);
            verifyEachVal(this.args);
        },
        Not(sk) {
            SK_1.checkVal(this, sk);
            this.arg.verify(1);
        },
        NumberLiteral(sk) {
            SK_1.checkVal(this, sk);
        },
        MapEntry(sk) {
            SK_1.checkDo(this, sk);
            locals_1.accessLocal(this, 'built');
            this.key.verify(1);
            this.val.verify(1);
        },
        Member(sk) {
            SK_1.checkVal(this, sk);
            this.object.verify(1);
            util_2.verifyName(this.name);
        },
        MemberFun(sk) {
            SK_1.checkVal(this, sk);
            verifyOpVal(this.opObject);
            util_2.verifyName(this.name);
        },
        MemberSet(sk) {
            SK_1.checkDo(this, sk);
            this.object.verify(1);
            util_2.verifyName(this.name);
            verifyOpVal(this.opType);
            this.value.verify(1);
        },
        Method(sk) {
            SK_1.checkVal(this, sk);
            util_2.makeUseOptional(this.fun.opDeclareThis);
            this.fun.args.forEach(util_2.makeUseOptional);
            Op_1.opEach(this.fun.opRestArg, util_2.makeUseOptional);
            this.fun.verify(1);
        },
        MethodImpl() {
            verifyMethodImpl(this, () => {
                util_2.makeUseOptional(this.fun.opDeclareThis);
                this.fun.verify(1);
            });
        },
        MethodGetter() {
            verifyMethodImpl(this, () => {
                util_2.makeUseOptional(this.declareThis);
                locals_1.verifyAndPlusLocals([this.declareThis], () => {
                    this.block.verify(1);
                });
            });
        },
        MethodSetter() {
            verifyMethodImpl(this, () => {
                locals_1.verifyAndPlusLocals([this.declareThis, this.declareFocus], () => {
                    this.block.verify(0);
                });
            });
        },
        Module() {
            for (const _ of this.imports) _.verify();
            context_2.withName(context_1.pathOptions.moduleName, () => {
                verifyBlock_1.verifyModuleLines(this.lines, this.loc);
            });
        },
        MsRegExp(sk) {
            SK_1.checkVal(this, sk);
            this.parts.forEach(util_2.verifyName);
            if (this.parts.length === 1 && typeof this.parts[0] === 'string') try {
                new RegExp(this.parts[0]);
            } catch (err) {
                if (!(err instanceof SyntaxError)) throw err;
                throw context_1.fail(this.loc, _ => _.badRegExp(this.parts[0]));
            }
        },
        New(sk) {
            SK_1.checkVal(this, sk);
            this.type.verify(1);
            util_2.verifyEachValOrSpread(this.args);
        },
        ObjEntryAssign(sk) {
            SK_1.checkDo(this, sk);
            if (!context_2.results.isObjEntryExport(this)) locals_1.accessLocal(this, 'built');
            this.assign.verify(0);
            for (const _ of this.assign.allAssignees()) locals_1.setDeclareAccessed(_, this);
        },
        ObjEntryPlain(sk) {
            SK_1.checkDo(this, sk);
            if (context_2.results.isObjEntryExport(this)) context_1.check(typeof this.name === 'string', this.loc, _ => _.exportName);else {
                locals_1.accessLocal(this, 'built');
                util_2.verifyName(this.name);
            }
            this.value.verify(1);
        },
        ObjSimple(sk) {
            SK_1.checkVal(this, sk);
            const keys = new Set();
            for (const _ref of this.pairs) {
                const key = _ref.key;
                const value = _ref.value;
                const loc = _ref.loc;

                context_1.check(!keys.has(key), loc, _ => _.duplicateKey(key));
                keys.add(key);
                value.verify(1);
            }
        },
        Pass(sk) {
            SK_1.checkDo(this, sk);
            this.ignored.verify(1);
        },
        Pipe(sk) {
            SK_1.checkVal(this, sk);
            this.startValue.verify();
            for (const pipe of this.pipes) locals_1.registerAndPlusLocal(MsAst_1.LocalDeclare.focus(this.loc), () => {
                pipe.verify(1);
            });
        },
        QuotePlain(sk) {
            SK_1.checkVal(this, sk);
            this.parts.forEach(util_2.verifyName);
        },
        QuoteSimple(sk) {
            SK_1.checkVal(this, sk);
        },
        QuoteTaggedTemplate(sk) {
            SK_1.checkVal(this, sk);
            this.tag.verify(1);
            this.quote.verify(1);
        },
        Range(sk) {
            SK_1.checkVal(this, sk);
            this.start.verify(1);
            verifyOpVal(this.end);
        },
        SetSub(sk) {
            SK_1.checkDo(this, sk);
            this.object.verify(1);
            verifyEachVal(this.subbeds);
            verifyOpVal(this.opType);
            this.value.verify(1);
        },
        SimpleFun(sk) {
            SK_1.checkVal(this, sk);
            context_2.withFun(0, () => {
                locals_1.registerAndPlusLocal(MsAst_1.LocalDeclare.focus(this.loc), () => {
                    this.value.verify();
                });
            });
        },
        SpecialDo(sk) {
            SK_1.checkDo(this, sk);
        },
        SpecialVal(sk) {
            SK_1.checkVal(this, sk);
            util_2.setName(this);
        },
        Spread(sk) {
            context_1.check(sk === null, this.loc, _ => sk === 1 ? _.misplacedSpreadVal : _.misplacedSpreadDo);
            this.spreaded.verify(1);
        },
        Sub(sk) {
            SK_1.checkVal(this, sk);
            this.subbed.verify(1);
            verifyEachVal(this.args);
        },
        SuperCall(sk) {
            const meth = Op_1.orThrow(context_2.method, () => context_1.fail(this.loc, _ => _.superNeedsMethod));
            context_2.results.superCallToMethod.set(this, meth);
            if (meth instanceof MsAst_1.Constructor) {
                context_1.check(sk === 0, this.loc, _ => _.superMustBeStatement);
                context_2.results.constructorToSuper.set(meth, this);
            }
            verifyEachVal(this.args);
        },
        SuperMember(sk) {
            SK_1.checkVal(this, sk);
            context_1.check(context_2.method !== null, this.loc, _ => _.superNeedsMethod);
            util_2.verifyName(this.name);
        },
        Switch(sk) {
            SK_1.markStatement(this, sk);
            context_2.withIifeIfVal(sk, () => {
                context_2.withInSwitch(true, () => {
                    this.switched.verify(1);
                    util_2.verifyEach(this.parts, sk);
                    util_2.verifyOp(this.opElse, sk);
                });
            });
        },
        SwitchPart(sk) {
            SK_1.markStatement(this, sk);
            verifyEachVal(this.values);
            this.result.verify(sk);
        },
        Throw() {
            verifyOpVal(this.opThrown);
        },
        Trait(sk) {
            SK_1.checkVal(this, sk);
            verifyEachVal(this.superTraits);
            verifyOpDo(this.opDo);
            context_2.withMethods(() => {
                for (const _ of this.statics) _.verify();
                for (const _ of this.methods) _.verify();
            });
        },
        TraitDo(sk) {
            SK_1.checkDo(this, sk);
            this.implementor.verify(1);
            this.trait.verify(1);
            context_2.withMethods(() => {
                for (const _ of this.statics) _.verify();
                for (const _ of this.methods) _.verify();
            });
        },
        With(sk) {
            SK_1.markStatement(this, sk);
            this.value.verify(1);
            context_2.withIifeIfVal(sk, () => {
                if (sk === 1) util_2.makeUseOptionalIfFocus(this.declare);
                locals_1.verifyAndPlusLocal(this.declare, () => {
                    this.block.verify(0);
                });
            });
        },
        Yield(_sk) {
            context_1.check(context_2.funKind === 2, this.loc, _ => _.misplacedYield(112));
            verifyOpVal(this.opValue);
        },
        YieldTo(_sk) {
            context_1.check(context_2.funKind === 2, this.loc, _ => _.misplacedYield(113));
            this.value.verify(1);
        }
    });
    function verifyFor(forLoop) {
        function verifyForBlock() {
            context_2.withLoop(forLoop, () => {
                forLoop.block.verify(0);
            });
        }
        Op_1.caseOp(forLoop.opIteratee, _ => {
            withVerifyIteratee(_, verifyForBlock);
        }, verifyForBlock);
    }
    function withVerifyIteratee(_ref2, action) {
        let element = _ref2.element;
        let bag = _ref2.bag;

        bag.verify(1);
        util_2.verifyNotLazy(element, _ => _.noLazyIteratee);
        locals_1.verifyAndPlusLocal(element, action);
    }
    function verifyMethodImpl(_, doVerify) {
        util_2.verifyName(_.symbol);
        context_2.withMethod(_, doVerify);
    }
});
//# sourceMappingURL=verify.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var util_1 = require('./util');
    class MsAst {
        constructor(loc) {
            this.loc = loc;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MsAst;
    class LineContent extends MsAst {}
    exports.LineContent = LineContent;
    class ValOrDo extends LineContent {
        isVal() {}
        isDo() {}
    }
    exports.ValOrDo = ValOrDo;
    class DoOnly extends LineContent {
        isDo() {}
        isDoOnly() {}
    }
    exports.DoOnly = DoOnly;
    class ValOnly extends LineContent {
        isVal() {}
        isValOnly() {}
    }
    exports.ValOnly = ValOnly;
    class Module extends MsAst {
        constructor(loc, name, opComment, doImports, imports, lines) {
            super(loc);
            this.name = name;
            this.opComment = opComment;
            this.doImports = doImports;
            this.imports = imports;
            this.lines = lines;
        }
    }
    exports.Module = Module;
    class ImportDo extends MsAst {
        constructor(loc, path) {
            super(loc);
            this.path = path;
        }
    }
    exports.ImportDo = ImportDo;
    class Import extends MsAst {
        constructor(loc, path, imported, opImportDefault) {
            super(loc);
            this.path = path;
            this.imported = imported;
            this.opImportDefault = opImportDefault;
        }
    }
    exports.Import = Import;
    class LocalDeclare extends MsAst {
        constructor(loc, name, opType, kind) {
            super(loc);
            this.name = name;
            this.opType = opType;
            this.kind = kind;
        }
        static untyped(loc, name, kind) {
            return new LocalDeclare(loc, name, null, kind);
        }
        static plain(loc, name) {
            return new LocalDeclare(loc, name, null, 0);
        }
        static built(loc) {
            return this.plain(loc, 'built');
        }
        static focus(loc) {
            return this.plain(loc, '_');
        }
        static typedFocus(loc, type) {
            return new LocalDeclare(loc, '_', type, 0);
        }
        static this(loc) {
            return this.plain(loc, 'this');
        }
        get isLazy() {
            return this.kind === 1;
        }
    }
    exports.LocalDeclare = LocalDeclare;
    class LocalAccess extends ValOnly {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
        static focus(loc) {
            return new LocalAccess(loc, '_');
        }
        static this(loc) {
            return new LocalAccess(loc, 'this');
        }
    }
    exports.LocalAccess = LocalAccess;
    class LocalMutate extends DoOnly {
        constructor(loc, name, value) {
            super(loc);
            this.name = name;
            this.value = value;
        }
    }
    exports.LocalMutate = LocalMutate;
    class Assign extends DoOnly {}
    exports.Assign = Assign;
    class AssignSingle extends Assign {
        constructor(loc, assignee, value) {
            super(loc);
            this.assignee = assignee;
            this.value = value;
        }
        static focus(loc, value) {
            return new AssignSingle(loc, LocalDeclare.focus(loc), value);
        }
        allAssignees() {
            return [this.assignee];
        }
    }
    exports.AssignSingle = AssignSingle;
    class AssignDestructure extends Assign {
        constructor(loc, assignees, value) {
            super(loc);
            this.assignees = assignees;
            this.value = value;
        }
        get kind() {
            return this.assignees[0].kind;
        }
        allAssignees() {
            return this.assignees;
        }
    }
    exports.AssignDestructure = AssignDestructure;
    class MemberSet extends DoOnly {
        constructor(loc, object, name, opType, kind, value) {
            super(loc);
            this.object = object;
            this.name = name;
            this.opType = opType;
            this.kind = kind;
            this.value = value;
        }
    }
    exports.MemberSet = MemberSet;
    class SetSub extends DoOnly {
        constructor(loc, object, subbeds, opType, kind, value) {
            super(loc);
            this.object = object;
            this.subbeds = subbeds;
            this.opType = opType;
            this.kind = kind;
            this.value = value;
        }
    }
    exports.SetSub = SetSub;
    class Throw extends DoOnly {
        constructor(loc, opThrown) {
            super(loc);
            this.opThrown = opThrown;
        }
    }
    exports.Throw = Throw;
    class Assert extends DoOnly {
        constructor(loc, negate, condition, opThrown) {
            super(loc);
            this.negate = negate;
            this.condition = condition;
            this.opThrown = opThrown;
        }
    }
    exports.Assert = Assert;
    class Except extends ValOrDo {
        constructor(loc, _try, typedCatches, opCatchAll, opElse, opFinally) {
            super(loc);
            this.typedCatches = typedCatches;
            this.opCatchAll = opCatchAll;
            this.opElse = opElse;
            this.opFinally = opFinally;
            this.try = _try;
        }
        get allCatches() {
            return util_1.cat(this.typedCatches, this.opCatchAll);
        }
    }
    exports.Except = Except;
    class Catch extends MsAst {
        constructor(loc, caught, block) {
            super(loc);
            this.caught = caught;
            this.block = block;
            util_1.assert(!caught.isLazy);
        }
    }
    exports.Catch = Catch;
    class Block extends MsAst {
        constructor(loc, opComment, lines) {
            super(loc);
            this.opComment = opComment;
            this.lines = lines;
        }
    }
    exports.Block = Block;
    class BuildEntry extends DoOnly {}
    exports.BuildEntry = BuildEntry;
    class ObjEntry extends BuildEntry {}
    exports.ObjEntry = ObjEntry;
    class ObjEntryAssign extends ObjEntry {
        constructor(loc, assign) {
            super(loc);
            this.assign = assign;
        }
    }
    exports.ObjEntryAssign = ObjEntryAssign;
    class ObjEntryPlain extends ObjEntry {
        constructor(loc, name, value) {
            super(loc);
            this.name = name;
            this.value = value;
        }
        static access(loc, name) {
            return new ObjEntryPlain(loc, name, new LocalAccess(loc, name));
        }
        static nameEntry(loc, value) {
            return new ObjEntryPlain(loc, 'name', value);
        }
    }
    exports.ObjEntryPlain = ObjEntryPlain;
    class BagEntry extends BuildEntry {
        constructor(loc, value) {
            let isMany = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            super(loc);
            this.value = value;
            this.isMany = isMany;
        }
    }
    exports.BagEntry = BagEntry;
    class MapEntry extends BuildEntry {
        constructor(loc, key, val) {
            super(loc);
            this.key = key;
            this.val = val;
        }
    }
    exports.MapEntry = MapEntry;
    class Conditional extends ValOrDo {
        constructor(loc, test, result, isUnless) {
            super(loc);
            this.test = test;
            this.result = result;
            this.isUnless = isUnless;
        }
    }
    exports.Conditional = Conditional;
    class Cond extends ValOnly {
        constructor(loc, test, ifTrue, ifFalse) {
            super(loc);
            this.test = test;
            this.ifTrue = ifTrue;
            this.ifFalse = ifFalse;
        }
    }
    exports.Cond = Cond;
    class FunLike extends ValOnly {
        constructor(loc, args, opRestArg) {
            super(loc);
            this.args = args;
            this.opRestArg = opRestArg;
        }
    }
    exports.FunLike = FunLike;
    class Fun extends FunLike {
        constructor(loc, args, opRestArg, block) {
            let opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

            super(loc, args, opRestArg);
            this.block = block;

            var _util_1$applyDefaults = util_1.applyDefaults(opts, {
                kind: 0,
                isThisFun: false,
                isDo: false,
                opReturnType: null
            });

            const kind = _util_1$applyDefaults.kind;
            const isThisFun = _util_1$applyDefaults.isThisFun;
            const isDo = _util_1$applyDefaults.isDo;
            const opReturnType = _util_1$applyDefaults.opReturnType;

            this.block = block;
            this.kind = kind;
            this.opDeclareThis = Op_1.opIf(isThisFun, () => LocalDeclare.this(this.loc));
            this.isDo = isDo;
            this.opReturnType = opReturnType;
        }
    }
    exports.Fun = Fun;
    class FunAbstract extends FunLike {
        constructor(loc, args, opRestArg, opReturnType, opComment) {
            super(loc, args, opRestArg);
            this.opReturnType = opReturnType;
            this.opComment = opComment;
        }
    }
    exports.FunAbstract = FunAbstract;
    class Method extends ValOnly {
        constructor(loc, fun) {
            super(loc);
            this.fun = fun;
        }
    }
    exports.Method = Method;
    class Await extends ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.Await = Await;
    class Yield extends ValOnly {
        constructor(loc) {
            let opValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            super(loc);
            this.opValue = opValue;
        }
    }
    exports.Yield = Yield;
    class YieldTo extends ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.YieldTo = YieldTo;
    class Trait extends ValOnly {
        constructor(loc, superTraits) {
            let opComment = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            let opDo = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
            let statics = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];
            let methods = arguments.length <= 5 || arguments[5] === undefined ? [] : arguments[5];

            super(loc);
            this.superTraits = superTraits;
            this.opComment = opComment;
            this.opDo = opDo;
            this.statics = statics;
            this.methods = methods;
        }
    }
    exports.Trait = Trait;
    class TraitDo extends DoOnly {
        constructor(loc, implementor, trait) {
            let statics = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];
            let methods = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];

            super(loc);
            this.implementor = implementor;
            this.trait = trait;
            this.statics = statics;
            this.methods = methods;
        }
    }
    exports.TraitDo = TraitDo;
    class Class extends ValOnly {
        constructor(loc, opFields, opSuperClass, traits) {
            let opComment = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
            let opDo = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
            let statics = arguments.length <= 6 || arguments[6] === undefined ? [] : arguments[6];
            let opConstructor = arguments.length <= 7 || arguments[7] === undefined ? null : arguments[7];
            let methods = arguments.length <= 8 || arguments[8] === undefined ? [] : arguments[8];

            super(loc);
            this.opFields = opFields;
            this.opSuperClass = opSuperClass;
            this.traits = traits;
            this.opComment = opComment;
            this.opDo = opDo;
            this.statics = statics;
            this.opConstructor = opConstructor;
            this.methods = methods;
        }
        get isRecord() {
            return this.opFields !== null;
        }
    }
    exports.Class = Class;
    class Field extends MsAst {
        constructor(loc, name) {
            let opType = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            super(loc);
            this.name = name;
            this.opType = opType;
        }
    }
    exports.Field = Field;
    class ClassTraitDo extends MsAst {
        constructor(loc, block) {
            super(loc);
            this.block = block;
            this.declareFocus = LocalDeclare.focus(loc);
        }
    }
    exports.ClassTraitDo = ClassTraitDo;
    class Constructor extends MsAst {
        constructor(loc, fun, memberArgs) {
            super(loc);
            this.fun = fun;
            this.memberArgs = memberArgs;
        }
    }
    exports.Constructor = Constructor;
    class MethodImplLike extends MsAst {
        constructor(loc, isMy, symbol) {
            super(loc);
            this.isMy = isMy;
            this.symbol = symbol;
        }
    }
    exports.MethodImplLike = MethodImplLike;
    class MethodImpl extends MethodImplLike {
        constructor(loc, isMy, symbol, fun) {
            super(loc, isMy, symbol);
            this.fun = fun;
        }
    }
    exports.MethodImpl = MethodImpl;
    class MethodGetter extends MethodImplLike {
        constructor(loc, isMy, symbol, block) {
            super(loc, isMy, symbol);
            this.block = block;
            this.declareThis = LocalDeclare.this(loc);
        }
    }
    exports.MethodGetter = MethodGetter;
    class MethodSetter extends MethodImplLike {
        constructor(loc, isMy, symbol, block) {
            super(loc, isMy, symbol);
            this.block = block;
            this.block = block;
            this.declareThis = LocalDeclare.this(loc);
            this.declareFocus = LocalDeclare.focus(loc);
        }
    }
    exports.MethodSetter = MethodSetter;
    class SuperCall extends ValOrDo {
        constructor(loc, args) {
            super(loc);
            this.args = args;
        }
    }
    exports.SuperCall = SuperCall;
    class SuperMember extends ValOnly {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
    }
    exports.SuperMember = SuperMember;
    class Call extends ValOnly {
        constructor(loc, called, args) {
            super(loc);
            this.called = called;
            this.args = args;
        }
    }
    exports.Call = Call;
    class New extends ValOnly {
        constructor(loc, type, args) {
            super(loc);
            this.type = type;
            this.args = args;
        }
    }
    exports.New = New;
    class Spread extends ValOnly {
        constructor(loc, spreaded) {
            super(loc);
            this.spreaded = spreaded;
        }
    }
    exports.Spread = Spread;
    class Lazy extends ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.Lazy = Lazy;
    class Case extends ValOrDo {
        constructor(loc, opCased, parts, opElse) {
            super(loc);
            this.opCased = opCased;
            this.parts = parts;
            this.opElse = opElse;
        }
    }
    exports.Case = Case;
    class CasePart extends MsAst {
        constructor(loc, test, result) {
            super(loc);
            this.test = test;
            this.result = result;
        }
    }
    exports.CasePart = CasePart;
    class Pattern extends MsAst {
        constructor(loc, type, locals) {
            super(loc);
            this.type = type;
            this.locals = locals;
            this.patterned = LocalAccess.focus(loc);
        }
    }
    exports.Pattern = Pattern;
    class Switch extends ValOrDo {
        constructor(loc, switched, parts, opElse) {
            super(loc);
            this.switched = switched;
            this.parts = parts;
            this.opElse = opElse;
        }
    }
    exports.Switch = Switch;
    class SwitchPart extends MsAst {
        constructor(loc, values, result) {
            super(loc);
            this.values = values;
            this.result = result;
        }
    }
    exports.SwitchPart = SwitchPart;
    class For extends ValOrDo {
        constructor(loc, opIteratee, block) {
            super(loc);
            this.opIteratee = opIteratee;
            this.block = block;
        }
    }
    exports.For = For;
    class ForAsync extends ValOnly {
        constructor(loc, iteratee, block) {
            super(loc);
            this.iteratee = iteratee;
            this.block = block;
        }
    }
    exports.ForAsync = ForAsync;
    class ForBag extends ValOnly {
        constructor(loc, opIteratee, block) {
            super(loc);
            this.opIteratee = opIteratee;
            this.block = block;
            this.built = LocalDeclare.built(loc);
        }
    }
    exports.ForBag = ForBag;
    class Iteratee extends MsAst {
        constructor(loc, element, bag) {
            super(loc);
            this.element = element;
            this.bag = bag;
        }
    }
    exports.Iteratee = Iteratee;
    class Break extends DoOnly {
        constructor(loc) {
            let opValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            super(loc);
            this.opValue = opValue;
        }
    }
    exports.Break = Break;
    class BlockWrap extends ValOnly {
        constructor(loc, block) {
            super(loc);
            this.block = block;
        }
    }
    exports.BlockWrap = BlockWrap;
    class BagSimple extends ValOnly {
        constructor(loc, parts) {
            super(loc);
            this.parts = parts;
        }
    }
    exports.BagSimple = BagSimple;
    class ObjSimple extends ValOnly {
        constructor(loc, pairs) {
            super(loc);
            this.pairs = pairs;
        }
    }
    exports.ObjSimple = ObjSimple;
    class ObjPair extends MsAst {
        constructor(loc, key, value) {
            super(loc);
            this.key = key;
            this.value = value;
        }
    }
    exports.ObjPair = ObjPair;
    class Logic extends ValOnly {
        constructor(loc, kind, args) {
            super(loc);
            this.kind = kind;
            this.args = args;
        }
    }
    exports.Logic = Logic;
    class Not extends ValOnly {
        constructor(loc, arg) {
            super(loc);
            this.arg = arg;
        }
    }
    exports.Not = Not;
    class NumberLiteral extends ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
        toString() {
            return this.value.toString();
        }
    }
    exports.NumberLiteral = NumberLiteral;
    class Member extends ValOnly {
        constructor(loc, object, name) {
            super(loc);
            this.object = object;
            this.name = name;
        }
    }
    exports.Member = Member;
    class MsRegExp extends ValOnly {
        constructor(loc, parts) {
            let flags = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            super(loc);
            this.parts = parts;
            this.flags = flags;
        }
    }
    exports.MsRegExp = MsRegExp;
    class QuoteAbstract extends ValOnly {}
    exports.QuoteAbstract = QuoteAbstract;
    class QuotePlain extends QuoteAbstract {
        constructor(loc, parts) {
            super(loc);
            this.parts = parts;
        }
    }
    exports.QuotePlain = QuotePlain;
    class QuoteTaggedTemplate extends ValOnly {
        constructor(loc, tag, quote) {
            super(loc);
            this.tag = tag;
            this.quote = quote;
        }
    }
    exports.QuoteTaggedTemplate = QuoteTaggedTemplate;
    class QuoteSimple extends QuoteAbstract {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.QuoteSimple = QuoteSimple;
    class Pipe extends ValOnly {
        constructor(loc, startValue, pipes) {
            super(loc);
            this.startValue = startValue;
            this.pipes = pipes;
        }
    }
    exports.Pipe = Pipe;
    class With extends ValOnly {
        constructor(loc, declare, value, block) {
            super(loc);
            this.declare = declare;
            this.value = value;
            this.block = block;
        }
    }
    exports.With = With;
    class MemberFun extends ValOnly {
        constructor(loc, opObject, name) {
            super(loc);
            this.opObject = opObject;
            this.name = name;
        }
    }
    exports.MemberFun = MemberFun;
    class GetterFun extends ValOnly {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
    }
    exports.GetterFun = GetterFun;
    class SimpleFun extends ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.SimpleFun = SimpleFun;
    class Range extends ValOnly {
        constructor(loc, start, end, isExclusive) {
            super(loc);
            this.start = start;
            this.end = end;
            this.isExclusive = isExclusive;
        }
    }
    exports.Range = Range;
    class InstanceOf extends ValOnly {
        constructor(loc, instance, type) {
            super(loc);
            this.instance = instance;
            this.type = type;
        }
    }
    exports.InstanceOf = InstanceOf;
    class Sub extends ValOnly {
        constructor(loc, subbed, args) {
            super(loc);
            this.subbed = subbed;
            this.args = args;
        }
    }
    exports.Sub = Sub;
    class Del extends ValOrDo {
        constructor(loc, subbed, args) {
            super(loc);
            this.subbed = subbed;
            this.args = args;
        }
    }
    exports.Del = Del;
    class SpecialDo extends DoOnly {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
    }
    exports.SpecialDo = SpecialDo;
    class SpecialVal extends ValOnly {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
    }
    exports.SpecialVal = SpecialVal;
    class Ignore extends DoOnly {
        constructor(loc, ignoredNames) {
            super(loc);
            this.ignoredNames = ignoredNames;
        }
    }
    exports.Ignore = Ignore;
    class Pass extends DoOnly {
        constructor(loc, ignored) {
            super(loc);
            this.ignored = ignored;
        }
    }
    exports.Pass = Pass;
});
//# sourceMappingURL=MsAst.js.map

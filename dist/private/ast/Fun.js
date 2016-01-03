(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../util', './LineContent', './locals', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var util_1 = require('../util');
    var LineContent_1 = require('./LineContent');
    var locals_1 = require('./locals');
    var MsAst_1 = require('./MsAst');
    class Fun extends LineContent_1.ValOnly {
        constructor(loc, args, opRestArg, block) {
            let opts = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

            super(loc);
            this.args = args;
            this.opRestArg = opRestArg;
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

            this.kind = kind;
            this.opDeclareThis = Op_1.opIf(isThisFun, () => locals_1.LocalDeclare.this(this.loc));
            this.isDo = isDo;
            this.opReturnType = opReturnType;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Fun;
    class FunAbstract extends MsAst_1.default {
        constructor(loc, args, opRestArg, opReturnType, opComment) {
            super(loc);
            this.args = args;
            this.opRestArg = opRestArg;
            this.opReturnType = opReturnType;
            this.opComment = opComment;
            this.opReturnType = opReturnType;
        }
    }
    exports.FunAbstract = FunAbstract;
    class MemberFun extends LineContent_1.ValOnly {
        constructor(loc, opObject, name) {
            super(loc);
            this.opObject = opObject;
            this.name = name;
        }
    }
    exports.MemberFun = MemberFun;
    class GetterFun extends LineContent_1.ValOnly {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
    }
    exports.GetterFun = GetterFun;
    class SimpleFun extends LineContent_1.ValOnly {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.SimpleFun = SimpleFun;
});
//# sourceMappingURL=Fun.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../util', './LineContent', './locals'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const util_1 = require('../util');
    const LineContent_1 = require('./LineContent');
    const locals_1 = require('./locals');
    class Fun extends LineContent_1.ValOnly {
        isFun() {}
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Fun;
    class FunBlock extends Fun {
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
    exports.FunBlock = FunBlock;
    class FunMember extends Fun {
        constructor(loc, opObject, name) {
            super(loc);
            this.opObject = opObject;
            this.name = name;
        }
    }
    exports.FunMember = FunMember;
    class FunGetter extends Fun {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
    }
    exports.FunGetter = FunGetter;
    class FunOperator extends Fun {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
    }
    exports.FunOperator = FunOperator;
    class FunUnary extends Fun {
        constructor(loc, kind) {
            super(loc);
            this.kind = kind;
        }
    }
    exports.FunUnary = FunUnary;
    class FunSimple extends Fun {
        constructor(loc, value) {
            super(loc);
            this.value = value;
        }
    }
    exports.FunSimple = FunSimple;
});
//# sourceMappingURL=Fun.js.map

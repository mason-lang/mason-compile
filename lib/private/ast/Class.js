(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    const LineContent_1 = require('./LineContent');
    const MsAst_1 = require('./MsAst');
    class Class extends LineContent_1.ValOnly {
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
        isNamed() {}
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Class;
    class Field extends MsAst_1.default {
        constructor(loc, name) {
            let opType = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            super(loc);
            this.name = name;
            this.opType = opType;
        }
    }
    exports.Field = Field;
    class Constructor extends MsAst_1.default {
        constructor(loc, fun, memberArgs) {
            super(loc);
            this.fun = fun;
            this.memberArgs = memberArgs;
        }
    }
    exports.Constructor = Constructor;
    class SuperCall extends LineContent_1.ValOrDo {
        constructor(loc, args) {
            super(loc);
            this.args = args;
        }
    }
    exports.SuperCall = SuperCall;
    class SuperMember extends LineContent_1.ValOnly {
        constructor(loc, name) {
            super(loc);
            this.name = name;
        }
    }
    exports.SuperMember = SuperMember;
});
//# sourceMappingURL=Class.js.map

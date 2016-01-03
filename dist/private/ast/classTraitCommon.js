(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './locals', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    var locals_1 = require('./locals');
    var MsAst_1 = require('./MsAst');
    class ClassTraitDo extends MsAst_1.default {
        constructor(loc, block) {
            super(loc);
            this.block = block;
            this.declareFocus = locals_1.LocalDeclare.focus(loc);
        }
    }
    exports.ClassTraitDo = ClassTraitDo;
    (function (MethodImplKind) {
        MethodImplKind[MethodImplKind["Plain"] = 0] = "Plain";
        MethodImplKind[MethodImplKind["My"] = 4] = "My";
        MethodImplKind[MethodImplKind["Virtual"] = 2] = "Virtual";
        MethodImplKind[MethodImplKind["Override"] = 1] = "Override";
    })(exports.MethodImplKind || (exports.MethodImplKind = {}));
    var MethodImplKind = exports.MethodImplKind;
    class MethodImplLike extends MsAst_1.default {
        constructor(loc, symbol, kind) {
            super(loc);
            this.symbol = symbol;
            this.kind = kind;
        }
    }
    exports.MethodImplLike = MethodImplLike;
    class MethodImpl extends MethodImplLike {
        constructor(loc, symbol, fun, kind) {
            super(loc, symbol, kind);
            this.fun = fun;
        }
    }
    exports.MethodImpl = MethodImpl;
    class MethodGetter extends MethodImplLike {
        constructor(loc, symbol, block, kind) {
            super(loc, symbol, kind);
            this.block = block;
            this.declareThis = locals_1.LocalDeclare.this(loc);
        }
    }
    exports.MethodGetter = MethodGetter;
    class MethodSetter extends MethodImplLike {
        constructor(loc, symbol, block, kind) {
            super(loc, symbol, kind);
            this.block = block;
            this.block = block;
            this.declareThis = locals_1.LocalDeclare.this(loc);
            this.declareFocus = locals_1.LocalDeclare.focus(loc);
        }
    }
    exports.MethodSetter = MethodSetter;
});
//# sourceMappingURL=classTraitCommon.js.map

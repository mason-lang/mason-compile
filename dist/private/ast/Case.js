(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './LineContent', './locals', './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    var LineContent_1 = require('./LineContent');
    var locals_1 = require('./locals');
    var MsAst_1 = require('./MsAst');
    class Case extends LineContent_1.ValOrDo {
        constructor(loc, opCased, parts, opElse) {
            super(loc);
            this.opCased = opCased;
            this.parts = parts;
            this.opElse = opElse;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Case;
    class CasePart extends MsAst_1.default {
        constructor(loc, test, result) {
            super(loc);
            this.test = test;
            this.result = result;
        }
    }
    exports.CasePart = CasePart;
    class Pattern extends MsAst_1.default {
        constructor(loc, type, locals) {
            super(loc);
            this.type = type;
            this.locals = locals;
            this.patterned = locals_1.LocalAccess.focus(loc);
        }
    }
    exports.Pattern = Pattern;
});
//# sourceMappingURL=Case.js.map

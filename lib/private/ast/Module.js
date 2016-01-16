(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './MsAst'], factory);
    }
})(function (require, exports) {
    "use strict";

    var MsAst_1 = require('./MsAst');
    class Module extends MsAst_1.default {
        constructor(loc, name, opComment, doImports, imports, lines) {
            super(loc);
            this.name = name;
            this.opComment = opComment;
            this.doImports = doImports;
            this.imports = imports;
            this.lines = lines;
            Object.freeze(this);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Module;
    class ImportDo extends MsAst_1.default {
        constructor(loc, path) {
            super(loc);
            this.path = path;
        }
    }
    exports.ImportDo = ImportDo;
    class Import extends MsAst_1.default {
        constructor(loc, path, imported, opImportDefault) {
            super(loc);
            this.path = path;
            this.imported = imported;
            this.opImportDefault = opImportDefault;
        }
    }
    exports.Import = Import;
});
//# sourceMappingURL=Module.js.map

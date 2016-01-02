(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', './context', './locals', './verifyBlock', './verifyLocalDeclare'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var verifyBlock_1 = require('./verifyBlock');
    var verifyLocalDeclare_1 = require('./verifyLocalDeclare');
    function verifyModule(_ref) {
        let imports = _ref.imports;
        let lines = _ref.lines;
        let loc = _ref.loc;

        for (const _ of imports) verifyImport(_);
        context_2.withName(context_1.pathOptions.moduleName, () => {
            verifyBlock_1.verifyModuleLines(lines, loc);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyModule;
    function verifyImport(_ref2) {
        let imported = _ref2.imported;
        let opImportDefault = _ref2.opImportDefault;

        function addUseLocal(ld) {
            const prev = context_2.locals.get(ld.name);
            context_1.check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc));
            verifyLocalDeclare_1.verifyLocalDeclare(ld);
            locals_1.setLocal(ld);
        }
        for (const _ of imported) addUseLocal(_);
        Op_1.opEach(opImportDefault, addUseLocal);
    }
});
//# sourceMappingURL=verifyModule.js.map

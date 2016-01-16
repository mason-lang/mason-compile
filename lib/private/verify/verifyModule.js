(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/BuildEntry', '../util', './autoBlockKind', './context', './SK', './verifyLines', './verifyLocals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var BuildEntry_1 = require('../ast/BuildEntry');
    var util_1 = require('../util');
    var autoBlockKind_1 = require('./autoBlockKind');
    var context_2 = require('./context');
    var SK_1 = require('./SK');
    var verifyLines_1 = require('./verifyLines');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyVal_1 = require('./verifyVal');
    function verifyModule(_ref) {
        let imports = _ref.imports;
        let lines = _ref.lines;
        let loc = _ref.loc;

        for (const _ of imports) verifyImport(_);
        context_2.withName(context_1.pathOptions.moduleName, () => {
            verifyModuleLines(lines, loc);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyModule;
    function verifyImport(_ref2) {
        let imported = _ref2.imported;
        let opImportDefault = _ref2.opImportDefault;

        for (const _ of imported) verifyLocals_1.addImportedLocal(_);
        Op_1.opEach(opImportDefault, verifyLocals_1.addImportedLocal);
    }
    function verifyModuleLines(lines, loc) {
        context_2.results.moduleKind = Op_1.caseOp(autoBlockKind_1.opBlockBuildKind(lines, loc), buildKind => {
            if (buildKind === 5) {
                for (const line of lines) if (line instanceof BuildEntry_1.ObjEntry) context_2.results.objEntryExports.add(line);
                verifyLines_1.default(lines);
                return 2;
            } else {
                verifyLines_1.verifyBuiltLines(lines, loc);
                return buildKind === 3 ? 3 : 4;
            }
        }, () => {
            if (util_1.isEmpty(lines)) return 0;else {
                const l = util_1.last(lines);
                const lastSK = SK_1.getLineSK(l);
                if (lastSK === 0) {
                    verifyLines_1.default(lines);
                    return 0;
                } else {
                    const newLocals = verifyLines_1.default(util_1.rtail(lines));
                    verifyLocals_1.plusLocals(newLocals, () => verifyVal_1.ensureValAndVerify(l));
                    return 1;
                }
            }
        });
    }
});
//# sourceMappingURL=verifyModule.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../ast/Block', '../util', './autoBlockKind', './context', './locals', './SK', './verifyLines', './verifyLocalDeclare', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Block_1 = require('../ast/Block');
    var util_1 = require('../util');
    var autoBlockKind_1 = require('./autoBlockKind');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var SK_1 = require('./SK');
    var verifyLines_1 = require('./verifyLines');
    var verifyLocalDeclare_1 = require('./verifyLocalDeclare');
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

        function addUseLocal(ld) {
            const prev = context_2.locals.get(ld.name);
            context_1.check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc));
            verifyLocalDeclare_1.verifyLocalDeclare(ld);
            locals_1.setLocal(ld);
        }
        for (const _ of imported) addUseLocal(_);
        Op_1.opEach(opImportDefault, addUseLocal);
    }
    function verifyModuleLines(lines, loc) {
        context_2.results.moduleKind = Op_1.caseOp(autoBlockKind_1.opBlockBuildKind(lines, loc), buildKind => {
            if (buildKind === 5) {
                for (const line of lines) if (line instanceof Block_1.ObjEntry) context_2.results.objEntryExports.add(line);
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
                    locals_1.plusLocals(newLocals, () => verifyVal_1.ensureValAndVerify(l));
                    return 1;
                }
            }
        });
    }
});
//# sourceMappingURL=verifyModule.js.map

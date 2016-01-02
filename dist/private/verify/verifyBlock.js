(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../util', './autoBlockKind', './context', './locals', './SK', './verifyLines', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var util_1 = require('../util');
    var autoBlockKind_1 = require('./autoBlockKind');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    var SK_1 = require('./SK');
    var verifyLines_1 = require('./verifyLines');
    var verifyVal_1 = require('./verifyVal');
    function verifyBlockSK(_, sk) {
        if (sk === 0) verifyBlockDo(_);else verifyBlockVal(_);
    }
    exports.verifyBlockSK = verifyBlockSK;
    function verifyBlockVal(_) {
        const lines = _.lines;
        const loc = _.loc;

        context_1.check(!util_1.isEmpty(lines), loc, _ => _.blockNeedsContent);
        const kind = autoBlockKind_1.default(lines, loc);
        switch (kind) {
            case 3:
            case 4:
            case 5:
                verifyBuiltLines(lines, loc);
                break;
            case 1:
                verifyLines_1.default(lines);
                break;
            case 2:
                locals_1.plusLocals(verifyLines_1.default(util_1.rtail(lines)), () => verifyVal_1.verifyValP(util_1.last(lines)));
                break;
            default:
                throw new Error(String(kind));
        }
        context_2.results.blockToKind.set(_, kind);
    }
    exports.verifyBlockVal = verifyBlockVal;
    function verifyBlockDo(_) {
        context_2.results.blockToKind.set(_, 0);
        return verifyLines_1.default(_.lines);
    }
    exports.verifyBlockDo = verifyBlockDo;
    function verifyModuleLines(lines, loc) {
        context_2.results.moduleKind = Op_1.caseOp(autoBlockKind_1.opBlockBuildKind(lines, loc), buildKind => {
            if (buildKind === 5) {
                for (const line of lines) if (line instanceof MsAst_1.ObjEntry) context_2.results.objEntryExports.add(line);
                verifyLines_1.default(lines);
                return 2;
            } else {
                verifyBuiltLines(lines, loc);
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
                    locals_1.plusLocals(newLocals, () => verifyVal_1.verifyValP(l));
                    return 1;
                }
            }
        });
    }
    exports.verifyModuleLines = verifyModuleLines;
    function verifyBuiltLines(lines, loc) {
        locals_1.verifyAndPlusLocal(MsAst_1.LocalDeclare.built(loc), () => {
            verifyLines_1.default(lines);
        });
    }
});
//# sourceMappingURL=verifyBlock.js.map

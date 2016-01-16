(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/BuildEntry', '../ast/locals', '../context', '../util', './context', './verifyDo', './verifyLocals'], factory);
    }
})(function (require, exports) {
    "use strict";

    var BuildEntry_1 = require('../ast/BuildEntry');
    var locals_1 = require('../ast/locals');
    var context_1 = require('../context');
    var util_1 = require('../util');
    var context_2 = require('./context');
    var verifyDo_1 = require('./verifyDo');
    var verifyLocals_1 = require('./verifyLocals');
    function verifyLines(lines) {
        const newLocals = [];
        for (const line of util_1.reverseIter(lines)) for (const _ of util_1.reverseIter(lineNewLocals(line))) {
            verifyLocals_1.registerLocal(_);
            newLocals.push(_);
        }
        context_2.pendingBlockLocals.push(...newLocals);
        const thisBlockLocalNames = new Set();
        const shadowed = [];
        for (const line of lines) {
            verifyDo_1.ensureDoAndVerify(line);
            for (const newLocal of lineNewLocals(line)) {
                const name = newLocal.name;
                const loc = newLocal.loc;

                const oldLocal = context_2.locals.get(name);
                if (oldLocal !== undefined) {
                    context_1.check(!thisBlockLocalNames.has(name), loc, _ => _.duplicateLocal(name));
                    shadowed.push(oldLocal);
                }
                thisBlockLocalNames.add(name);
                verifyLocals_1.setLocal(newLocal);
                const popped = context_2.pendingBlockLocals.pop();
                util_1.assert(popped === newLocal);
            }
        }
        newLocals.forEach(verifyLocals_1.deleteLocal);
        shadowed.forEach(verifyLocals_1.setLocal);
        return newLocals;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyLines;
    function verifyBuiltLines(lines, loc) {
        verifyLocals_1.verifyAndPlusLocal(locals_1.LocalDeclare.built(loc), () => {
            verifyLines(lines);
        });
    }
    exports.verifyBuiltLines = verifyBuiltLines;
    function lineNewLocals(line) {
        return line instanceof locals_1.AssignSingle ? [line.assignee] : line instanceof locals_1.AssignDestructure ? line.assignees : line instanceof BuildEntry_1.ObjEntryAssign ? lineNewLocals(line.assign) : [];
    }
});
//# sourceMappingURL=verifyLines.js.map

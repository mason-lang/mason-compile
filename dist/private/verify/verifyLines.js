(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../MsAst', '../util', './context', './locals'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var util_1 = require('../util');
    var context_2 = require('./context');
    var locals_1 = require('./locals');
    function verifyLines(lines) {
        const newLocals = [];
        for (const line of util_1.reverseIter(lines)) for (const _ of util_1.reverseIter(lineNewLocals(line))) {
            locals_1.registerLocal(_);
            newLocals.push(_);
        }
        context_2.pendingBlockLocals.push(...newLocals);
        const thisBlockLocalNames = new Set();
        const shadowed = [];
        for (const line of lines) {
            line.verify(0);
            for (const newLocal of lineNewLocals(line)) {
                const name = newLocal.name;
                const loc = newLocal.loc;

                const oldLocal = context_2.locals.get(name);
                if (oldLocal !== undefined) {
                    context_1.check(!thisBlockLocalNames.has(name), loc, _ => _.duplicateLocal(name));
                    shadowed.push(oldLocal);
                }
                thisBlockLocalNames.add(name);
                locals_1.setLocal(newLocal);
                const popped = context_2.pendingBlockLocals.pop();
                util_1.assert(popped === newLocal);
            }
        }
        newLocals.forEach(locals_1.deleteLocal);
        shadowed.forEach(locals_1.setLocal);
        return newLocals;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyLines;
    function lineNewLocals(line) {
        return line instanceof MsAst_1.AssignSingle ? [line.assignee] : line instanceof MsAst_1.AssignDestructure ? line.assignees : line instanceof MsAst_1.ObjEntryAssign ? lineNewLocals(line.assign) : [];
    }
});
//# sourceMappingURL=verifyLines.js.map

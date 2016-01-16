(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/BuildEntry', '../context', './context', './verifyLocals', './verifyMemberName', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var BuildEntry_1 = require('../ast/BuildEntry');
    var context_1 = require('../context');
    var context_2 = require('./context');
    var verifyLocals_1 = require('./verifyLocals');
    var verifyMemberName_1 = require('./verifyMemberName');
    var verifyVal_1 = require('./verifyVal');
    function verifyBuildEntry(_) {
        if (_ instanceof BuildEntry_1.BagEntry) {
            verifyLocals_1.accessLocal(_, 'built');
            verifyVal_1.default(_.value);
        } else if (_ instanceof BuildEntry_1.MapEntry) {
            const key = _.key;
            const val = _.val;

            verifyLocals_1.accessLocal(_, 'built');
            verifyVal_1.default(key);
            verifyVal_1.default(val);
        } else if (_ instanceof BuildEntry_1.ObjEntryAssign) {
            const assign = _.assign;

            if (!context_2.results.isObjEntryExport(_)) verifyLocals_1.accessLocal(_, 'built');
            verifyLocals_1.verifyAssign(assign);
            for (const assignee of assign.allAssignees()) verifyLocals_1.setDeclareAccessed(assignee, _);
        } else if (_ instanceof BuildEntry_1.ObjEntryPlain) {
            const loc = _.loc;
            const name = _.name;
            const value = _.value;

            if (context_2.results.isObjEntryExport(_)) context_1.check(typeof name === 'string', loc, _ => _.exportName);else {
                verifyLocals_1.accessLocal(_, 'built');
                verifyMemberName_1.default(name);
            }
            verifyVal_1.default(value);
        } else throw new Error(_.constructor.name);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = verifyBuildEntry;
});
//# sourceMappingURL=verifyBuildEntry.js.map

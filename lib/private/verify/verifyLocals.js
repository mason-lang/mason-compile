var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/locals', '../ast/Named', '../ast/Val', '../context', '../util', './context', './util', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const locals_1 = require('../ast/locals');
    const Named_1 = require('../ast/Named');
    const Val_1 = require('../ast/Val');
    const context_1 = require('../context');
    const util_1 = require('../util');
    const context_2 = require('./context');
    const util_2 = require('./util');
    const verifyVal_1 = require('./verifyVal');
    function verifyLocalDeclare(_ref) {
        let loc = _ref.loc;
        let name = _ref.name;
        let opType = _ref.opType;

        Op_1.opEach(context_1.compileOptions.opBuiltinPath(name), path => {
            context_1.warn(loc, _ => _.overriddenBuiltin(name, path));
        });
        Op_1.opEach(opType, verifyVal_1.default);
    }
    exports.verifyLocalDeclare = verifyLocalDeclare;
    function verifyLocalAccess(_) {
        const loc = _.loc;
        const name = _.name;

        const declare = context_2.locals.get(name);
        if (declare === undefined) {
            const builtinPath = Op_1.orThrow(context_1.compileOptions.opBuiltinPath(name), () => missingLocalFail(loc, name));
            context_2.results.accessBuiltin(name, builtinPath);
        } else {
            context_2.results.localAccessToDeclare.set(_, declare);
            setDeclareAccessed(declare, _);
        }
    }
    exports.verifyLocalAccess = verifyLocalAccess;
    function verifyAssign(_) {
        if (_ instanceof locals_1.AssignSingle) {
            const assignee = _.assignee;
            const value = _.value;

            context_2.withName(assignee.name, () => {
                const doV = () => {
                    if (Named_1.isNamed(value) && !(value instanceof Val_1.SpecialVal)) util_2.setName(value);
                    verifyLocalDeclare(assignee);
                    verifyVal_1.default(value);
                };
                if (assignee.isLazy) withBlockLocals(doV);else doV();
            });
        } else if (_ instanceof locals_1.AssignDestructure) {
            const assignees = _.assignees;
            const value = _.value;

            for (const _ of assignees) verifyLocalDeclare(_);
            verifyVal_1.default(value);
        } else throw new Error(_.constructor.name);
    }
    exports.verifyAssign = verifyAssign;
    function deleteLocal(localDeclare) {
        context_2.locals.delete(localDeclare.name);
    }
    exports.deleteLocal = deleteLocal;
    function setLocal(localDeclare) {
        context_2.locals.set(localDeclare.name, localDeclare);
    }
    exports.setLocal = setLocal;
    function accessLocal(access, name) {
        const declare = getLocalDeclare(name, access.loc);
        setDeclareAccessed(declare, access);
    }
    exports.accessLocal = accessLocal;
    function setDeclareAccessed(declare, access) {
        context_2.results.localDeclareToAccesses.get(declare).push(access);
    }
    exports.setDeclareAccessed = setDeclareAccessed;
    function registerLocal(localDeclare) {
        context_2.results.localDeclareToAccesses.set(localDeclare, []);
    }
    exports.registerLocal = registerLocal;
    function registerAndPlusLocal(localDeclare, action) {
        registerLocal(localDeclare);
        plusLocal(localDeclare, action);
    }
    exports.registerAndPlusLocal = registerAndPlusLocal;
    function plusLocal(addedLocal, action) {
        const shadowed = context_2.locals.get(addedLocal.name);
        context_2.locals.set(addedLocal.name, addedLocal);
        action();
        if (shadowed === undefined) deleteLocal(addedLocal);else setLocal(shadowed);
    }
    function plusLocals(addedLocals, action) {
        const shadowedLocals = [];
        for (const _ of addedLocals) {
            const shadowed = context_2.locals.get(_.name);
            if (shadowed !== undefined) shadowedLocals.push(shadowed);
            setLocal(_);
        }
        action();
        addedLocals.forEach(deleteLocal);
        shadowedLocals.forEach(setLocal);
    }
    exports.plusLocals = plusLocals;
    function verifyAndPlusLocal(addedLocal, action) {
        registerAndVerifyLocalDeclare(addedLocal);
        plusLocal(addedLocal, action);
    }
    exports.verifyAndPlusLocal = verifyAndPlusLocal;
    function verifyAndPlusLocals(addedLocals, action) {
        addedLocals.forEach(registerAndVerifyLocalDeclare);
        const names = new Set();
        for (const _ref2 of addedLocals) {
            const name = _ref2.name;
            const loc = _ref2.loc;

            context_1.check(!names.has(name), loc, _ => _.duplicateLocal(name));
            names.add(name);
        }
        plusLocals(addedLocals, action);
    }
    exports.verifyAndPlusLocals = verifyAndPlusLocals;
    function withBlockLocals(action) {
        const oldPendingBlockLocals = context_2.pendingBlockLocals;
        context_2.setPendingBlockLocals([]);
        plusLocals(oldPendingBlockLocals, action);
        context_2.setPendingBlockLocals(oldPendingBlockLocals);
    }
    exports.withBlockLocals = withBlockLocals;
    function warnUnusedLocals() {
        for (const _ref3 of context_2.results.localDeclareToAccesses) {
            var _ref4 = _slicedToArray(_ref3, 2);

            const local = _ref4[0];
            const accesses = _ref4[1];

            if (util_1.isEmpty(accesses) && local.name !== 'built' && !context_2.okToNotUse.has(local)) context_1.warn(local.loc, _ => _.unusedLocal(local.name));
        }
    }
    exports.warnUnusedLocals = warnUnusedLocals;
    function addImportedLocal(ld) {
        const prev = context_2.locals.get(ld.name);
        context_1.check(prev === undefined, ld.loc, _ => _.duplicateImport(ld.name, prev.loc));
        registerAndVerifyLocalDeclare(ld);
        setLocal(ld);
    }
    exports.addImportedLocal = addImportedLocal;
    function registerAndVerifyLocalDeclare(_) {
        registerLocal(_);
        verifyLocalDeclare(_);
    }
    function getLocalDeclare(name, accessLoc) {
        const declare = context_2.locals.get(name);
        if (declare === undefined) throw missingLocalFail(accessLoc, name);
        return declare;
    }
    function missingLocalFail(loc, name) {
        return context_1.fail(loc, _ => _.missingLocal(name));
    }
    function verifyLocalMutate(_ref5) {
        let value = _ref5.value;

        verifyVal_1.default(value);
    }
    exports.verifyLocalMutate = verifyLocalMutate;
});
//# sourceMappingURL=verifyLocals.js.map

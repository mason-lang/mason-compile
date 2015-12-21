var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../util', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var util_1 = require('../util');
    var context_2 = require('./context');
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
    function verifyLocalDeclare(localDeclare) {
        registerLocal(localDeclare);
        localDeclare.verify();
    }
    exports.verifyLocalDeclare = verifyLocalDeclare;
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
    exports.plusLocal = plusLocal;
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
        verifyLocalDeclare(addedLocal);
        plusLocal(addedLocal, action);
    }
    exports.verifyAndPlusLocal = verifyAndPlusLocal;
    function verifyAndPlusLocals(addedLocals, action) {
        addedLocals.forEach(verifyLocalDeclare);
        const names = new Set();
        for (const _ref of addedLocals) {
            const name = _ref.name;
            const loc = _ref.loc;

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
    function getLocalDeclare(name, accessLoc) {
        const declare = context_2.locals.get(name);
        if (declare === undefined) throw missingLocalFail(accessLoc, name);
        return declare;
    }
    function missingLocalFail(loc, name) {
        return context_1.fail(loc, _ => _.missingLocal(name));
    }
    exports.missingLocalFail = missingLocalFail;
    function warnUnusedLocals() {
        for (const _ref2 of context_2.results.localDeclareToAccesses) {
            var _ref3 = _slicedToArray(_ref2, 2);

            const local = _ref3[0];
            const accesses = _ref3[1];

            if (util_1.isEmpty(accesses) && local.name !== 'built' && !context_2.okToNotUse.has(local)) context_1.warn(local.loc, _ => _.unusedLocal(local.name));
        }
    }
    exports.warnUnusedLocals = warnUnusedLocals;
});
//# sourceMappingURL=locals.js.map

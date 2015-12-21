(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../VerifyResults', './locals'], factory);
    }
})(function (require, exports) {
    "use strict";

    var VerifyResults_1 = require('../VerifyResults');
    var locals_1 = require('./locals');
    function setup() {
        exports.locals = new Map();
        exports.pendingBlockLocals = [];
        exports.funKind = 0;
        exports.okToNotUse = new Set();
        exports.opLoop = null;
        exports.method = null;
        exports.results = new VerifyResults_1.default();
    }
    exports.setup = setup;
    function tearDown() {
        exports.locals = exports.okToNotUse = exports.opLoop = exports.pendingBlockLocals = exports.method = exports.results = null;
    }
    exports.tearDown = tearDown;
    function withLoop(newLoop, action) {
        const oldLoop = exports.opLoop;
        exports.opLoop = newLoop;
        action();
        exports.opLoop = oldLoop;
    }
    exports.withLoop = withLoop;
    function withMethod(newMethod, action) {
        const oldMethod = exports.method;
        exports.method = newMethod;
        action();
        exports.method = oldMethod;
    }
    exports.withMethod = withMethod;
    function withName(newName, action) {
        const oldName = exports.name;
        exports.name = newName;
        action();
        exports.name = oldName;
    }
    exports.withName = withName;
    function withIife(action) {
        withLoop(null, () => {
            withInSwitch(false, action);
        });
    }
    exports.withIife = withIife;
    function withIifeIf(cond, action) {
        if (cond) withIife(action);else action();
    }
    exports.withIifeIf = withIifeIf;
    function withIifeIfVal(sk, action) {
        withIifeIf(sk === 1, action);
    }
    exports.withIifeIfVal = withIifeIfVal;
    function setPendingBlockLocals(val) {
        exports.pendingBlockLocals = val;
    }
    exports.setPendingBlockLocals = setPendingBlockLocals;
    function withInSwitch(newInSwitch, action) {
        const oldInSwitch = exports.isInSwitch;
        exports.isInSwitch = newInSwitch;
        action();
        exports.isInSwitch = oldInSwitch;
    }
    exports.withInSwitch = withInSwitch;
    function withFun(funKind, action) {
        locals_1.withBlockLocals(() => {
            withInFunKind(funKind, () => {
                withIife(action);
            });
        });
    }
    exports.withFun = withFun;
    function withMethods(action) {
        withFun(0, action);
    }
    exports.withMethods = withMethods;
    function withInFunKind(newFunKind, action) {
        const oldFunKind = exports.funKind;
        exports.funKind = newFunKind;
        action();
        exports.funKind = oldFunKind;
    }
});
//# sourceMappingURL=context.js.map

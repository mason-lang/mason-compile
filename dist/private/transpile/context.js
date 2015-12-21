(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    function setup(_verifyResults) {
        exports.verifyResults = _verifyResults;
        exports.funKind = 0;
        exports.nextDestructuredId = 0;
    }
    exports.setup = setup;
    function tearDown() {
        exports.verifyResults = null;
    }
    exports.tearDown = tearDown;
    function getDestructuredId() {
        const _ = exports.nextDestructuredId;
        exports.nextDestructuredId = exports.nextDestructuredId + 1;
        return _;
    }
    exports.getDestructuredId = getDestructuredId;
    function withFunKind(newFunKind, func) {
        const oldFunKind = exports.funKind;
        exports.funKind = newFunKind;
        const _ = func();
        exports.funKind = oldFunKind;
        return _;
    }
    exports.withFunKind = withFunKind;
});
//# sourceMappingURL=context.js.map

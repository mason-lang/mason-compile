(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    const context_1 = require('../context');
    const context_2 = require('./context');
    function makeUseOptional(localDeclare) {
        context_2.okToNotUse.add(localDeclare);
    }
    exports.makeUseOptional = makeUseOptional;
    function makeUseOptionalIfFocus(localDeclare) {
        if (localDeclare.name === '_') makeUseOptional(localDeclare);
    }
    exports.makeUseOptionalIfFocus = makeUseOptionalIfFocus;
    function setName(expr) {
        context_2.results.names.set(expr, context_2.name);
    }
    exports.setName = setName;
    function verifyNotLazy(declare, errorMessage) {
        context_1.check(!declare.isLazy, declare.loc, errorMessage);
    }
    exports.verifyNotLazy = verifyNotLazy;
});
//# sourceMappingURL=util.js.map

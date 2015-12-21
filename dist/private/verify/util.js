(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var context_2 = require('./context');
    function makeUseOptional(localDeclare) {
        context_2.okToNotUse.add(localDeclare);
    }
    exports.makeUseOptional = makeUseOptional;
    function makeUseOptionalIfFocus(localDeclare) {
        if (localDeclare.name === '_') makeUseOptional(localDeclare);
    }
    exports.makeUseOptionalIfFocus = makeUseOptionalIfFocus;
    function verifyEach(asts, sk) {
        for (const _ of asts) _.verify(sk);
    }
    exports.verifyEach = verifyEach;
    function verifyEachValOrSpread(asts) {
        for (const _ of asts) _.verify(_ instanceof MsAst_1.Spread ? null : 1);
    }
    exports.verifyEachValOrSpread = verifyEachValOrSpread;
    function verifyOp(opAst, sk) {
        if (Op_1.nonNull(opAst)) opAst.verify(sk);
    }
    exports.verifyOp = verifyOp;
    function verifyName(_) {
        if (typeof _ !== 'string') _.verify(1);
    }
    exports.verifyName = verifyName;
    function setName(expr) {
        context_2.results.names.set(expr, context_2.name);
    }
    exports.setName = setName;
    function verifyNotLazy(localDeclare, errorMessage) {
        context_1.check(!localDeclare.isLazy, localDeclare.loc, errorMessage);
    }
    exports.verifyNotLazy = verifyNotLazy;
});
//# sourceMappingURL=util.js.map

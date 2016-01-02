(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../context', '../MsAst', './context', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var context_2 = require('./context');
    var verifyVal_1 = require('./verifyVal');
    function makeUseOptional(localDeclare) {
        context_2.okToNotUse.add(localDeclare);
    }
    exports.makeUseOptional = makeUseOptional;
    function makeUseOptionalIfFocus(localDeclare) {
        if (localDeclare.name === '_') makeUseOptional(localDeclare);
    }
    exports.makeUseOptionalIfFocus = makeUseOptionalIfFocus;
    function verifyEachValOrSpread(asts) {
        for (const _ of asts) if (_ instanceof MsAst_1.Spread) verifySpread(_);else verifyVal_1.default(_);
    }
    exports.verifyEachValOrSpread = verifyEachValOrSpread;
    function verifySpread(_ref) {
        let spreaded = _ref.spreaded;

        verifyVal_1.default(spreaded);
    }
    function verifyName(_) {
        if (typeof _ !== 'string') verifyVal_1.default(_);
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

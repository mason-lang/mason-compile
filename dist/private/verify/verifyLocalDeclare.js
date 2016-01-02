(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', './locals', './verifyVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var locals_1 = require('./locals');
    var verifyVal_1 = require('./verifyVal');
    function verifyLocalDeclare(_) {
        locals_1.registerLocal(_);
        justVerifyLocalDeclare(_);
    }
    exports.verifyLocalDeclare = verifyLocalDeclare;
    function justVerifyLocalDeclare(_ref) {
        let loc = _ref.loc;
        let name = _ref.name;
        let opType = _ref.opType;

        Op_1.opEach(context_1.options.opBuiltinPath(name), path => {
            context_1.warn(loc, _ => _.overriddenBuiltin(name, path));
        });
        Op_1.opEach(opType, verifyVal_1.default);
    }
    exports.justVerifyLocalDeclare = justVerifyLocalDeclare;
});
//# sourceMappingURL=verifyLocalDeclare.js.map

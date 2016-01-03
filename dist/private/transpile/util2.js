(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Statement'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Statement_1 = require('esast/lib/Statement');
    function throwErrorFromString(message) {
        return new Statement_1.ThrowStatement(new Expression_1.NewExpression(IdError, [new Expression_1.LiteralString(message)]));
    }
    exports.throwErrorFromString = throwErrorFromString;
    const IdError = new Identifier_1.default('Error');
});
//# sourceMappingURL=util2.js.map

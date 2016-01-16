(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/Statement'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Literal_1 = require('esast/lib/Literal');
    var Statement_1 = require('esast/lib/Statement');
    function throwErrorFromString(message) {
        return new Statement_1.ThrowStatement(new Expression_1.NewExpression(idError, [new Literal_1.LiteralString(message)]));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = throwErrorFromString;
    const idError = new Identifier_1.default('Error');
});
//# sourceMappingURL=throwErrorFromString.js.map

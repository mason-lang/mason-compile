(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Statement', 'op/Op', '../ast/Call', './esast-constants', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var Call_1 = require('../ast/Call');
    var esast_constants_1 = require('./esast-constants');
    var transpileVal_1 = require('./transpileVal');
    var util_1 = require('./util');
    function transpileLocalDeclare(_) {
        return new Identifier_1.default(util_1.idForDeclareCached(_).name);
    }
    exports.transpileLocalDeclare = transpileLocalDeclare;
    function transpileThrow(_) {
        return util_1.loc(_, transpileThrowNoLoc(_));
    }
    exports.transpileThrow = transpileThrow;
    function transpileThrowNoLoc(_) {
        return Op_1.caseOp(_.opThrown, util_1.doThrow, () => new Statement_1.ThrowStatement(new Expression_1.NewExpression(esast_constants_1.GlobalError, [LitStrThrow])));
    }
    exports.transpileThrowNoLoc = transpileThrowNoLoc;
    function transpileArguments(args) {
        return args.map(_ => _ instanceof Call_1.Spread ? new Expression_1.SpreadElement(transpileVal_1.default(_.spreaded)) : transpileVal_1.default(_));
    }
    exports.transpileArguments = transpileArguments;
    function transpileMemberName(_) {
        return typeof _ === 'string' ? new Expression_1.LiteralString(_) : transpileVal_1.default(_);
    }
    exports.transpileMemberName = transpileMemberName;
    const LitStrThrow = new Expression_1.LiteralString('An error occurred.');
});
//# sourceMappingURL=transpileMisc.js.map

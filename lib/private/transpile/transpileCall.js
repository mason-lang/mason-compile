(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', '../ast/Call', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Call_1 = require('../ast/Call');
    var transpileVal_1 = require('./transpileVal');
    function transpileCallNoLoc(_ref) {
        let called = _ref.called;
        let args = _ref.args;

        return new Expression_1.CallExpression(transpileVal_1.default(called), transpileArguments(args));
    }
    exports.transpileCallNoLoc = transpileCallNoLoc;
    function transpileNewNoLoc(_) {
        const type = _.type;
        const args = _.args;

        return new Expression_1.NewExpression(transpileVal_1.default(type), transpileArguments(args));
    }
    exports.transpileNewNoLoc = transpileNewNoLoc;
    function transpileArguments(args) {
        return args.map(_ => _ instanceof Call_1.Spread ? new Expression_1.SpreadElement(transpileVal_1.default(_.spreaded)) : transpileVal_1.default(_));
    }
    exports.transpileArguments = transpileArguments;
});
//# sourceMappingURL=transpileCall.js.map

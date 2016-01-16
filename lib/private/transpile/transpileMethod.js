(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Literal', 'op/Op', '../ast/Fun', './esast-constants', './context', './ms', './transpileFun', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Literal_1 = require('esast/lib/Literal');
    var Op_1 = require('op/Op');
    var Fun_1 = require('../ast/Fun');
    var esast_constants_1 = require('./esast-constants');
    var context_1 = require('./context');
    var ms_1 = require('./ms');
    var transpileFun_1 = require('./transpileFun');
    var transpileVal_1 = require('./transpileVal');
    function transpileMethodNoLoc(_) {
        const value = _.value;

        const name = new Literal_1.LiteralString(context_1.verifyResults.name(_));
        const args = value.opRestArg === null ? new Expression_1.ArrayExpression(value.args.map(arg => {
            const name = new Literal_1.LiteralString(arg.name);
            return Op_1.caseOp(arg.opType, _ => new Expression_1.ArrayExpression([name, transpileVal_1.default(_)]), () => name);
        })) : esast_constants_1.litUndefined;
        const impl = value instanceof Fun_1.FunBlock ? [transpileFun_1.transpileFunBlock(value)] : [];
        return ms_1.msCall('method', name, args, ...impl);
    }
    exports.transpileMethodNoLoc = transpileMethodNoLoc;
});
//# sourceMappingURL=transpileMethod.js.map
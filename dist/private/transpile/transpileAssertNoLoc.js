(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Statement', 'op/Op', '../ast/Call', '../ast/Val', './transpileMisc', './transpileVal', './util', './util2'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var Call_1 = require('../ast/Call');
    var Val_1 = require('../ast/Val');
    var transpileMisc_1 = require('./transpileMisc');
    var transpileVal_1 = require('./transpileVal');
    var util_1 = require('./util');
    var util2_1 = require('./util2');
    function transpileAssertNoLoc(_ref) {
        let negate = _ref.negate;
        let condition = _ref.condition;
        let opThrown = _ref.opThrown;

        const failCond = () => {
            const cond = transpileVal_1.default(condition);
            return negate ? cond : new Expression_1.UnaryExpression('!', cond);
        };
        return Op_1.caseOp(opThrown, _ => new Statement_1.IfStatement(failCond(), util_1.doThrow(_)), () => {
            if (condition instanceof Call_1.default) {
                const called = condition.called;
                const args = condition.args;

                const argAsts = args.map(transpileVal_1.default);
                return new Statement_1.ExpressionStatement(called instanceof Val_1.Member ? util_1.msCall(negate ? 'assertNotMember' : 'assertMember', transpileVal_1.default(called.object), transpileMisc_1.transpileMemberName(called.name), ...argAsts) : util_1.msCall(negate ? 'assertNot' : 'assert', transpileVal_1.default(called), ...argAsts));
            } else return new Statement_1.IfStatement(failCond(), ThrowAssertFail);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileAssertNoLoc;
    const ThrowAssertFail = util2_1.throwErrorFromString('Assertion failed.');
});
//# sourceMappingURL=transpileAssertNoLoc.js.map

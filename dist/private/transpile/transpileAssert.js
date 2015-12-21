(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', 'esast/lib/ast', '../MsAst', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var ast_1 = require('esast/lib/ast');
    var MsAst_1 = require('../MsAst');
    var util_1 = require('./util');
    function default_1() {
        const failCond = () => {
            const cond = util_1.t0(this.condition);
            return this.negate ? cond : new ast_1.UnaryExpression('!', cond);
        };
        return Op_1.caseOp(this.opThrown, _ => new ast_1.IfStatement(failCond(), util_1.doThrow(_)), () => {
            if (this.condition instanceof MsAst_1.Call) {
                const call = this.condition;
                const called = call.called;
                const args = call.args.map(util_1.t0);
                return called instanceof MsAst_1.Member ? util_1.msCall(this.negate ? 'assertNotMember' : 'assertMember', util_1.t0(called.object), util_1.transpileName(called.name), ...args) : util_1.msCall(this.negate ? 'assertNot' : 'assert', util_1.t0(called), ...args);
            } else return new ast_1.IfStatement(failCond(), ThrowAssertFail);
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    const ThrowAssertFail = util_1.throwErrorFromString('Assertion failed.');
});
//# sourceMappingURL=transpileAssert.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', 'esast/lib/ast', '../util', './context', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var ast_1 = require('esast/lib/ast');
    var util_1 = require('../util');
    var context_1 = require('./context');
    var util_2 = require('./util');
    function default_1() {
        const parts = util_1.flatMap(this.parts, util_2.t0);
        parts.push(Op_1.caseOp(this.opElse, _ => new ast_1.SwitchCase(null, util_2.t0(_).body), () => SwitchCaseNoMatch));
        return util_2.blockWrapIfVal(this, new ast_1.SwitchStatement(util_2.t0(this.switched), parts));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    function transpileSwitchPart() {
        const follow = Op_1.opIf(context_1.verifyResults.isStatement(this), () => new ast_1.BreakStatement());
        const block = util_2.t3(this.result, null, null, follow);
        const cases = [];
        for (let i = 0; i < this.values.length - 1; i = i + 1) cases.push(new ast_1.SwitchCase(util_2.t0(this.values[i]), []));
        cases.push(new ast_1.SwitchCase(util_2.t0(this.values[this.values.length - 1]), [block]));
        return cases;
    }
    exports.transpileSwitchPart = transpileSwitchPart;
    const SwitchCaseNoMatch = new ast_1.SwitchCase(null, [util_2.throwErrorFromString('No branch of `switch` matches.')]);
});
//# sourceMappingURL=transpileSwitch.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Statement', 'op/Op', '../util', './context', './transpileBlock', './transpileVal', './util', './util2'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var util_1 = require('../util');
    var context_1 = require('./context');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileVal_1 = require('./transpileVal');
    var util_2 = require('./util');
    var util2_1 = require('./util2');
    function transpileSwitchValNoLoc(_) {
        return util_2.blockWrapStatement(transpileSwitchDoNoLoc(_));
    }
    exports.transpileSwitchValNoLoc = transpileSwitchValNoLoc;
    function transpileSwitchDoNoLoc(_ref) {
        let switched = _ref.switched;
        let parts = _ref.parts;
        let opElse = _ref.opElse;

        const partAsts = util_1.flatMap(parts, transpileSwitchPart);
        partAsts.push(Op_1.caseOp(opElse, _ => new Statement_1.SwitchCase(null, transpileBlock_1.default(_).body), () => SwitchCaseNoMatch));
        return new Statement_1.SwitchStatement(transpileVal_1.default(switched), partAsts);
    }
    exports.transpileSwitchDoNoLoc = transpileSwitchDoNoLoc;
    function transpileSwitchPart(_) {
        const values = _.values;
        const result = _.result;

        const follow = Op_1.opIf(context_1.verifyResults.isStatement(_), () => new Statement_1.BreakStatement());
        const block = transpileBlock_1.default(result, null, null, follow);
        const cases = [];
        for (let i = 0; i < values.length - 1; i = i + 1) cases.push(util_2.loc(_, new Statement_1.SwitchCase(transpileVal_1.default(values[i]), [])));
        cases.push(util_2.loc(_, new Statement_1.SwitchCase(transpileVal_1.default(values[values.length - 1]), [block])));
        return cases;
    }
    const SwitchCaseNoMatch = new Statement_1.SwitchCase(null, [util2_1.throwErrorFromString('No branch of `switch` matches.')]);
});
//# sourceMappingURL=transpileSwitch.js.map

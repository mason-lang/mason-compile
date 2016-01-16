(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loop', 'esast/lib/Statement', 'op/Op', '../util', './throwErrorFromString', './transpileBlock', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loop_1 = require('esast/lib/Loop');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var util_1 = require('../util');
    var throwErrorFromString_1 = require('./throwErrorFromString');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileVal_1 = require('./transpileVal');
    var util_2 = require('./util');
    function transpileSwitchValNoLoc(_) {
        return transpileBlock_1.blockWrapStatement(transpileSwitchVDNoLoc(_, false));
    }
    exports.transpileSwitchValNoLoc = transpileSwitchValNoLoc;
    function transpileSwitchDoNoLoc(_) {
        return transpileSwitchVDNoLoc(_, true);
    }
    exports.transpileSwitchDoNoLoc = transpileSwitchDoNoLoc;
    function transpileSwitchVDNoLoc(_ref, isDo) {
        let switched = _ref.switched;
        let parts = _ref.parts;
        let opElse = _ref.opElse;

        const partAsts = util_1.flatMap(parts, _ => transpileSwitchPart(_, isDo));
        partAsts.push(Op_1.caseOp(opElse, _ => util_2.loc(_, new Statement_1.SwitchCase(null, transpileBlock_1.default(_).body)), () => switchCaseNoMatch));
        return new Statement_1.SwitchStatement(transpileVal_1.default(switched), partAsts);
    }
    function transpileSwitchPart(_, isDo) {
        const values = _.values;
        const result = _.result;

        const follow = Op_1.opIf(isDo, () => new Loop_1.BreakStatement());
        const block = transpileBlock_1.default(result, { follow: follow });
        const cases = [];
        for (let i = 0; i < values.length - 1; i = i + 1) cases.push(util_2.loc(_, new Statement_1.SwitchCase(transpileVal_1.default(values[i]), [])));
        cases.push(util_2.loc(_, new Statement_1.SwitchCase(transpileVal_1.default(values[values.length - 1]), [block])));
        return cases;
    }
    const switchCaseNoMatch = new Statement_1.SwitchCase(null, [throwErrorFromString_1.default('No branch of `switch` matches.')]);
});
//# sourceMappingURL=transpileSwitch.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'op/Op', './esast-constants', './transpileMisc', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Op_1 = require('op/Op');
    var esast_constants_1 = require('./esast-constants');
    var transpileMisc_1 = require('./transpileMisc');
    var transpileVal_1 = require('./transpileVal');
    var util_1 = require('./util');
    function withParts(_ref) {
        let declare = _ref.declare;
        let value = _ref.value;

        const idDeclare = util_1.idForDeclareCached(declare);
        const val = transpileVal_1.default(value);
        const lead = util_1.plainLet(idDeclare, val);
        return { idDeclare: idDeclare, val: val, lead: lead };
    }
    exports.withParts = withParts;
    function transpileAssignSingle(_) {
        return util_1.loc(_, transpileAssignSingleNoLoc(_));
    }
    exports.transpileAssignSingle = transpileAssignSingle;
    function transpileAssignSingleNoLoc(_ref2, valWrap) {
        let assignee = _ref2.assignee;
        let value = _ref2.value;

        const val = valWrap === undefined ? transpileVal_1.default(value) : valWrap(transpileVal_1.default(value));
        return new Declaration_1.VariableDeclarationLet([util_1.makeDeclarator(assignee, val, false)]);
    }
    exports.transpileAssignSingleNoLoc = transpileAssignSingleNoLoc;
    function transpileAwaitNoLoc(_ref3) {
        let value = _ref3.value;

        return new Expression_1.YieldExpression(transpileVal_1.default(value));
    }
    exports.transpileAwaitNoLoc = transpileAwaitNoLoc;
    function transpileCallNoLoc(_ref4) {
        let called = _ref4.called;
        let args = _ref4.args;

        return new Expression_1.CallExpression(transpileVal_1.default(called), transpileMisc_1.transpileArguments(args));
    }
    exports.transpileCallNoLoc = transpileCallNoLoc;
    function transpileCondNoLoc(_ref5) {
        let test = _ref5.test;
        let ifTrue = _ref5.ifTrue;
        let ifFalse = _ref5.ifFalse;

        return new Expression_1.ConditionalExpression(transpileVal_1.default(test), transpileVal_1.default(ifTrue), transpileVal_1.default(ifFalse));
    }
    exports.transpileCondNoLoc = transpileCondNoLoc;
    function transpileDelNoLoc(_ref6) {
        let subbed = _ref6.subbed;
        let args = _ref6.args;

        return util_1.msCall('del', transpileVal_1.default(subbed), ...args.map(transpileVal_1.default));
    }
    exports.transpileDelNoLoc = transpileDelNoLoc;
    function superCallCall(_ref7, method) {
        let args = _ref7.args;

        return new Expression_1.CallExpression(util_1.memberStringOrVal(esast_constants_1.IdSuper, method.symbol), transpileMisc_1.transpileArguments(args));
    }
    exports.superCallCall = superCallCall;
    function transpileYieldNoLoc(_ref8) {
        let opValue = _ref8.opValue;

        return new Expression_1.YieldExpression(Op_1.opMap(opValue, transpileVal_1.default));
    }
    exports.transpileYieldNoLoc = transpileYieldNoLoc;
    function transpileYieldToNoLoc(_ref9) {
        let value = _ref9.value;

        return new Expression_1.YieldDelegateExpression(transpileVal_1.default(value));
    }
    exports.transpileYieldToNoLoc = transpileYieldToNoLoc;
});
//# sourceMappingURL=transpileX.js.map

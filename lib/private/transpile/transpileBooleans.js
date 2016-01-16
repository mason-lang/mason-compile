var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Statement', '../ast/Block', '../util', './ms', './transpileBlock', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Statement_1 = require('esast/lib/Statement');
    var Block_1 = require('../ast/Block');
    var util_1 = require('../util');
    var ms_1 = require('./ms');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileVal_1 = require('./transpileVal');
    function transpileConditionalDoNoLoc(_) {
        const test = _.test;
        const result = _.result;
        const isUnless = _.isUnless;

        const testAst = transpileVal_1.default(test);
        return new Statement_1.IfStatement(isUnless ? new Expression_1.UnaryExpression('!', testAst) : testAst, result instanceof Block_1.default ? transpileBlock_1.transpileBlockDo(result) : new Statement_1.ExpressionStatement(transpileVal_1.default(result)));
    }
    exports.transpileConditionalDoNoLoc = transpileConditionalDoNoLoc;
    function transpileConditionalValNoLoc(_) {
        const test = _.test;
        const result = _.result;
        const isUnless = _.isUnless;

        const resultAst = ms_1.msCall('some', transpileBlock_1.blockWrapIfBlock(result));

        var _ref = isUnless ? [none, resultAst] : [resultAst, none];

        var _ref2 = _slicedToArray(_ref, 2);

        const ifTrue = _ref2[0];
        const ifFalse = _ref2[1];

        return new Expression_1.ConditionalExpression(transpileVal_1.default(test), ifTrue, ifFalse);
    }
    exports.transpileConditionalValNoLoc = transpileConditionalValNoLoc;
    const none = ms_1.msMember('None');
    function transpileCondNoLoc(_ref3) {
        let test = _ref3.test;
        let ifTrue = _ref3.ifTrue;
        let ifFalse = _ref3.ifFalse;

        return new Expression_1.ConditionalExpression(transpileVal_1.default(test), transpileVal_1.default(ifTrue), transpileVal_1.default(ifFalse));
    }
    exports.transpileCondNoLoc = transpileCondNoLoc;
    function transpileLogicNoLoc(_ref4) {
        let kind = _ref4.kind;
        let args = _ref4.args;

        const operator = kind === 0 ? '&&' : '||';
        return util_1.tail(args).reduce((expr, arg) => new Expression_1.LogicalExpression(operator, expr, transpileVal_1.default(arg)), transpileVal_1.default(args[0]));
    }
    exports.transpileLogicNoLoc = transpileLogicNoLoc;
    function transpileNotNoLoc(_ref5) {
        let arg = _ref5.arg;

        return new Expression_1.UnaryExpression('!', transpileVal_1.default(arg));
    }
    exports.transpileNotNoLoc = transpileNotNoLoc;
});
//# sourceMappingURL=transpileBooleans.js.map

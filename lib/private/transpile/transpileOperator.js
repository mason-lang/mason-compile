(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', '../util', './esast-constants', './ms', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Function_1 = require('esast/lib/Function');
    var Identifier_1 = require('esast/lib/Identifier');
    var util_1 = require('../util');
    var esast_constants_1 = require('./esast-constants');
    var ms_1 = require('./ms');
    var transpileVal_1 = require('./transpileVal');
    function transpileOperatorNoLoc(_ref) {
        let kind = _ref.kind;
        let args = _ref.args;

        function fold(binary) {
            return util_1.tail(args).reduce((acc, next) => binary(acc, transpileVal_1.default(next)), transpileVal_1.default(args[0]));
        }
        function logic(operator) {
            return (a, b) => new Expression_1.LogicalExpression(operator, a, b);
        }
        function opr(operator) {
            return (a, b) => new Expression_1.BinaryExpression(operator, a, b);
        }
        function call(called) {
            return (a, b) => new Expression_1.CallExpression(called, [a, b]);
        }
        function conjunction(binary, msFunctionName) {
            return args.length === 2 ? binary(transpileVal_1.default(args[0]), transpileVal_1.default(args[1])) : ms_1.msCall(msFunctionName, ...args.map(transpileVal_1.default));
        }
        switch (kind) {
            case 0:
                return fold(logic('&&'));
            case 1:
                return fold(opr('/'));
            case 2:
                return conjunction(call(ms_1.msMember('eq')), 'eqMany');
            case 3:
                return conjunction(call(objectIs), 'eqExact');
            case 4:
                return fold(call(mathPow));
            case 7:
                return conjunction(opr('<'), 'lt');
            case 8:
                return conjunction(opr('<='), 'lte');
            case 5:
                return conjunction(opr('>'), 'gt');
            case 6:
                return conjunction(opr('>='), 'gte');
            case 9:
                return fold(opr('-'));
            case 10:
                return fold(logic('||'));
            case 11:
                return fold(opr('+'));
            case 12:
                return fold(opr('%'));
            case 13:
                return fold(opr('*'));
            default:
                throw new Error(String(kind));
        }
    }
    exports.transpileOperatorNoLoc = transpileOperatorNoLoc;
    function transpileFunOperatorNoLoc(_) {
        return ms_1.msMember((() => {
            switch (_.kind) {
                case 0:
                    return 'and';
                case 1:
                    return 'div';
                case 2:
                    return 'eqMany';
                case 3:
                    return 'eqExact';
                case 4:
                    return 'exponent';
                case 7:
                    return 'lt';
                case 8:
                    return 'lte';
                case 5:
                    return 'gt';
                case 6:
                    return 'gte';
                case 9:
                    return 'minus';
                case 10:
                    return 'or';
                case 11:
                    return 'plus';
                case 12:
                    return 'remainder';
                case 13:
                    return 'times';
                default:
                    throw new Error(String(_));
            }
        })());
    }
    exports.transpileFunOperatorNoLoc = transpileFunOperatorNoLoc;
    function transpileUnaryOperatorNoLoc(_ref2) {
        let kind = _ref2.kind;
        let arg = _ref2.arg;

        return unaryExpression(kind, transpileVal_1.default(arg));
    }
    exports.transpileUnaryOperatorNoLoc = transpileUnaryOperatorNoLoc;
    function transpileFunUnaryNoLoc(_ref3) {
        let kind = _ref3.kind;

        return new Function_1.ArrowFunctionExpression([esast_constants_1.idFocus], unaryExpression(kind, esast_constants_1.idFocus));
    }
    exports.transpileFunUnaryNoLoc = transpileFunUnaryNoLoc;
    function unaryExpression(kind, arg) {
        switch (kind) {
            case 0:
                return new Expression_1.UnaryExpression('-', arg);
            case 1:
                return new Expression_1.UnaryExpression('!', arg);
            default:
                throw new Error(String(kind));
        }
    }
    const objectIs = new Expression_1.MemberExpressionPlain(new Identifier_1.default('Object'), new Identifier_1.default('is'));
    const mathPow = new Expression_1.MemberExpressionPlain(new Identifier_1.default('Math'), new Identifier_1.default('pow'));
});
//# sourceMappingURL=transpileOperator.js.map

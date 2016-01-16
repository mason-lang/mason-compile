(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Literal', 'esast/lib/Statement', 'op/Op', '../context', '../util', './esast-constants', './context', './ms', './transpileDo', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Function_1 = require('esast/lib/Function');
    var Literal_1 = require('esast/lib/Literal');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var util_1 = require('../util');
    var esast_constants_1 = require('./esast-constants');
    var context_2 = require('./context');
    var ms_1 = require('./ms');
    var transpileDo_1 = require('./transpileDo');
    var transpileVal_1 = require('./transpileVal');
    function loc(expr, node) {
        util_1.assert(node.loc === undefined);
        node.loc = expr.loc;
        return node;
    }
    exports.loc = loc;
    function transpileLines(exprs) {
        const out = [];
        for (const expr of exprs) {
            const ast = transpileDo_1.default(expr);
            if (ast instanceof Array) for (const _ of ast) out.push(_);else out.push(ast);
        }
        return out;
    }
    exports.transpileLines = transpileLines;
    function maybeWrapInCheckInstance(ast, opType, name) {
        return context_1.compileOptions.checks && Op_1.nonNull(opType) ? ms_1.msCall('checkInstance', transpileVal_1.default(opType), ast, new Literal_1.LiteralString(name)) : ast;
    }
    exports.maybeWrapInCheckInstance = maybeWrapInCheckInstance;
    function lazyWrap(value) {
        return ms_1.msCall('lazy', new Function_1.ArrowFunctionExpression([], value));
    }
    exports.lazyWrap = lazyWrap;
    function callFocusFun(value, calledOn) {
        const fun = context_2.funKind === 0 ? new Function_1.ArrowFunctionExpression([esast_constants_1.idFocus], value) : new Function_1.FunctionExpression(null, [esast_constants_1.idFocus], new Statement_1.BlockStatement([new Statement_1.ReturnStatement(value)]), { generator: true });
        return callPreservingFunKind(new Expression_1.CallExpression(fun, [calledOn]));
    }
    exports.callFocusFun = callFocusFun;
    function callPreservingFunKind(call) {
        return context_2.funKind === 0 ? call : new Expression_1.YieldDelegateExpression(call);
    }
    exports.callPreservingFunKind = callPreservingFunKind;
});
//# sourceMappingURL=util.js.map

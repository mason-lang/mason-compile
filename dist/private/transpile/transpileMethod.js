(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast-create-util/lib/util', '../MsAst', './ast-constants', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('esast-create-util/lib/util');
    var MsAst_1 = require('../MsAst');
    var ast_constants_1 = require('./ast-constants');
    var util_2 = require('./util');
    function transpileMethodToDefinition(_, isStatic) {
        var _methodParams = methodParams(_);

        const computed = _methodParams.computed;
        const key = _methodParams.key;
        const kind = _methodParams.kind;
        const value = _methodParams.value;

        return new ast_1.MethodDefinitionPlain(key, value, kind, isStatic, computed);
    }
    exports.transpileMethodToDefinition = transpileMethodToDefinition;
    function transpileMethodToProperty(_) {
        var _methodParams2 = methodParams(_);

        const computed = _methodParams2.computed;
        const key = _methodParams2.key;
        const kind = _methodParams2.kind;
        const value = _methodParams2.value;

        switch (kind) {
            case 'method':
                return new ast_1.PropertyMethod(key, value, computed);
            case 'get':
                return new ast_1.PropertyGet(key, value, computed);
            case 'set':
                return new ast_1.PropertySet(key, value, computed);
            default:
                throw new Error(String(kind));
        }
    }
    exports.transpileMethodToProperty = transpileMethodToProperty;
    function methodParams(_) {
        const symbol = _.symbol;
        return {
            computed: !(typeof _.symbol === 'string'),
            isImpl: _ instanceof MsAst_1.MethodImpl,
            key: typeof symbol === 'string' ? util_1.propertyIdOrLiteral(symbol) : symbol instanceof MsAst_1.QuoteAbstract ? util_2.t0(symbol) : util_2.msCall('symbol', util_2.t0(symbol)),
            kind: _ instanceof MsAst_1.MethodImpl ? 'method' : _ instanceof MsAst_1.MethodGetter ? 'get' : 'set',
            value: _ instanceof MsAst_1.MethodImpl ? util_2.t0(_.fun) : getSetFun(_)
        };
    }
    function getSetFun(_) {
        const args = _ instanceof MsAst_1.MethodGetter ? [] : [ast_constants_1.IdFocus];
        return new ast_1.FunctionExpression(null, args, util_2.t1(_.block, ast_constants_1.DeclareLexicalThis));
    }
});
//# sourceMappingURL=transpileMethod.js.map

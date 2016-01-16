(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Class', 'esast/lib/Function', 'esast/lib/ObjectExpression', 'esast-create-util/lib/util', '../ast/classTraitCommon', '../ast/Quote', './esast-constants', './ms', './transpileBlock', './transpileFun', './transpileQuote', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Class_1 = require('esast/lib/Class');
    var Function_1 = require('esast/lib/Function');
    var ObjectExpression_1 = require('esast/lib/ObjectExpression');
    var util_1 = require('esast-create-util/lib/util');
    var classTraitCommon_1 = require('../ast/classTraitCommon');
    var Quote_1 = require('../ast/Quote');
    var esast_constants_1 = require('./esast-constants');
    var ms_1 = require('./ms');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileFun_1 = require('./transpileFun');
    var transpileQuote_1 = require('./transpileQuote');
    var transpileVal_1 = require('./transpileVal');
    var util_2 = require('./util');
    function transpileMethodToDefinition(_, isStatic) {
        var _methodParams = methodParams(_, { method: Class_1.MethodDefinitionPlain, get: Class_1.MethodDefinitionGet, set: Class_1.MethodDefinitionSet });

        const name = _methodParams.name;
        const ctr = _methodParams.ctr;
        const value = _methodParams.value;

        return util_2.loc(_, new ctr(name, value, { static: isStatic }));
    }
    exports.transpileMethodToDefinition = transpileMethodToDefinition;
    function transpileMethodToProperty(_) {
        var _methodParams2 = methodParams(_, { method: ObjectExpression_1.PropertyMethod, get: ObjectExpression_1.PropertyGet, set: ObjectExpression_1.PropertySet });

        const name = _methodParams2.name;
        const ctr = _methodParams2.ctr;
        const value = _methodParams2.value;

        return util_2.loc(_, new ctr(name, value));
    }
    exports.transpileMethodToProperty = transpileMethodToProperty;
    function methodParams(_, ctrs) {
        const symbol = _.symbol;
        return {
            name: typeof symbol === 'string' ? util_1.propertyIdOrLiteral(symbol) : new ObjectExpression_1.ComputedName(symbol instanceof Quote_1.default ? transpileQuote_1.default(symbol) : ms_1.msCall('symbol', transpileVal_1.default(symbol))),
            ctr: _ instanceof classTraitCommon_1.MethodImpl ? ctrs.method : _ instanceof classTraitCommon_1.MethodGetter ? ctrs.get : ctrs.set,
            value: _ instanceof classTraitCommon_1.MethodImpl ? transpileFun_1.transpileFunBlock(_.fun) : getSetFun(_)
        };
    }
    function getSetFun(_) {
        const args = _ instanceof classTraitCommon_1.MethodGetter ? [] : [esast_constants_1.idFocus];
        return new Function_1.FunctionExpression(null, args, transpileBlock_1.default(_.block, { lead: esast_constants_1.declareLexicalThis }));
    }
});
//# sourceMappingURL=transpileClassTraitCommon.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/ObjectExpression', 'esast/lib/Statement', 'op/Op', './context', './esast-constants', './transpileBlock', './transpileMethod', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var ObjectExpression_1 = require('esast/lib/ObjectExpression');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var context_1 = require('./context');
    var esast_constants_1 = require('./esast-constants');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileMethod_1 = require('./transpileMethod');
    var transpileVal_1 = require('./transpileVal');
    var util_1 = require('./util');
    function transpileTraitNoLoc(_) {
        const superTraits = _.superTraits;
        const opDo = _.opDo;
        const statics = _.statics;
        const methods = _.methods;

        const name = new Expression_1.LiteralString(context_1.verifyResults.name(_));
        const supers = new Expression_1.ArrayExpression(superTraits.map(transpileVal_1.default));
        const trait = util_1.msCall('trait', name, supers, methodsObject(statics), methodsObject(methods));
        return Op_1.caseOp(opDo, _ => util_1.blockWrap(transpileBlock_1.default(_.block, util_1.plainLet(esast_constants_1.IdFocus, trait), null, esast_constants_1.ReturnFocus)), () => trait);
    }
    exports.transpileTraitNoLoc = transpileTraitNoLoc;
    function transpileTraitDoNoLoc(_) {
        const implementor = _.implementor;
        const trait = _.trait;
        const statics = _.statics;
        const methods = _.methods;

        return new Statement_1.ExpressionStatement(util_1.msCall('traitWithDefs', transpileVal_1.default(implementor), transpileVal_1.default(trait), methodsObject(statics), methodsObject(methods)));
    }
    exports.transpileTraitDoNoLoc = transpileTraitDoNoLoc;
    function methodsObject(_) {
        return new ObjectExpression_1.default(_.map(transpileMethod_1.transpileMethodToProperty));
    }
});
//# sourceMappingURL=transpileTrait.js.map

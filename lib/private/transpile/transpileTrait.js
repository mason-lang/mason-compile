(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/ObjectExpression', 'esast/lib/Literal', 'esast/lib/Statement', 'op/Op', './context', './esast-constants', './ms', './transpileBlock', './transpileClassTraitCommon', './transpileLocals', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const ObjectExpression_1 = require('esast/lib/ObjectExpression');
    const Literal_1 = require('esast/lib/Literal');
    const Statement_1 = require('esast/lib/Statement');
    const Op_1 = require('op/Op');
    const context_1 = require('./context');
    const esast_constants_1 = require('./esast-constants');
    const ms_1 = require('./ms');
    const transpileBlock_1 = require('./transpileBlock');
    const transpileClassTraitCommon_1 = require('./transpileClassTraitCommon');
    const transpileLocals_1 = require('./transpileLocals');
    const transpileVal_1 = require('./transpileVal');
    function transpileTraitNoLoc(_) {
        const superTraits = _.superTraits;
        const opDo = _.opDo;
        const statics = _.statics;
        const methods = _.methods;

        const name = new Literal_1.LiteralString(context_1.verifyResults.name(_));
        const supers = new Expression_1.ArrayExpression(superTraits.map(transpileVal_1.default));
        const trait = ms_1.msCall('trait', name, supers, methodsObject(statics), methodsObject(methods));
        return Op_1.caseOp(opDo, _ => transpileBlock_1.transpileBlockVal(_.block, { lead: transpileLocals_1.plainLet(esast_constants_1.idFocus, trait), follow: esast_constants_1.returnFocus }), () => trait);
    }
    exports.transpileTraitNoLoc = transpileTraitNoLoc;
    function transpileTraitDoNoLoc(_) {
        const implementor = _.implementor;
        const trait = _.trait;
        const statics = _.statics;
        const methods = _.methods;

        return new Statement_1.ExpressionStatement(ms_1.msCall('traitWithDefs', transpileVal_1.default(implementor), transpileVal_1.default(trait), methodsObject(statics), methodsObject(methods)));
    }
    exports.transpileTraitDoNoLoc = transpileTraitDoNoLoc;
    function methodsObject(_) {
        return new ObjectExpression_1.default(_.map(transpileClassTraitCommon_1.transpileMethodToProperty));
    }
});
//# sourceMappingURL=transpileTrait.js.map

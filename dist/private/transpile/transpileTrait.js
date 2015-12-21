(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'op/Op', './ast-constants', './context', './transpileMethod', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var Op_1 = require('op/Op');
    var ast_constants_1 = require('./ast-constants');
    var context_1 = require('./context');
    var transpileMethod_1 = require('./transpileMethod');
    var util_1 = require('./util');
    function default_1() {
        const name = new ast_1.LiteralString(context_1.verifyResults.name(this));
        const supers = new ast_1.ArrayExpression(this.superTraits.map(util_1.t0));
        const trait = util_1.msCall('trait', name, supers, methods(this.statics), methods(this.methods));
        return Op_1.caseOp(this.opDo, _ => util_1.blockWrap(util_1.t3(_.block, util_1.plainLet(ast_constants_1.IdFocus, trait), null, ast_constants_1.ReturnFocus)), () => trait);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    function transpileTraitDo() {
        return util_1.msCall('traitWithDefs', util_1.t0(this.implementor), util_1.t0(this.trait), methods(this.statics), methods(this.methods));
    }
    exports.transpileTraitDo = transpileTraitDo;
    function methods(_) {
        return new ast_1.ObjectExpression(_.map(transpileMethod_1.transpileMethodToProperty));
    }
});
//# sourceMappingURL=transpileTrait.js.map

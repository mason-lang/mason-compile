(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Literal', 'esast/lib/ObjectExpression', 'esast-create-util/lib/util', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Expression_1 = require('esast/lib/Expression');
    var Literal_1 = require('esast/lib/Literal');
    var ObjectExpression_1 = require('esast/lib/ObjectExpression');
    var util_1 = require('esast-create-util/lib/util');
    var transpileVal_1 = require('./transpileVal');
    function transpileMemberName(_) {
        return typeof _ === 'string' ? new Literal_1.LiteralString(_) : transpileVal_1.default(_);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileMemberName;
    function transpileMemberNameToPropertyName(_) {
        return typeof _ === 'string' ? util_1.propertyIdOrLiteral(_) : new ObjectExpression_1.ComputedName(transpileVal_1.default(_));
    }
    exports.transpileMemberNameToPropertyName = transpileMemberNameToPropertyName;
    function transpileMember(object, memberName) {
        return typeof memberName === 'string' ? util_1.member(object, memberName) : new Expression_1.MemberExpressionComputed(object, transpileVal_1.default(memberName));
    }
    exports.transpileMember = transpileMember;
});
//# sourceMappingURL=transpileMemberName.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/Statement', 'op/Op', '../ast/Case', './esast-constants', './ms', './throwErrorFromString', './transpileBlock', './transpileLocals', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Literal_1 = require('esast/lib/Literal');
    var Statement_1 = require('esast/lib/Statement');
    var Op_1 = require('op/Op');
    var Case_1 = require('../ast/Case');
    var esast_constants_1 = require('./esast-constants');
    var ms_1 = require('./ms');
    var throwErrorFromString_1 = require('./throwErrorFromString');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileLocals_1 = require('./transpileLocals');
    var transpileVal_1 = require('./transpileVal');
    var util_1 = require('./util');
    function transpileCaseValNoLoc(_ref) {
        let opCased = _ref.opCased;
        let parts = _ref.parts;
        let opElse = _ref.opElse;

        const body = caseBody(parts, opElse);
        const block = Op_1.caseOp(opCased, _ => [transpileLocals_1.transpileAssignSingle(_), body], () => [body]);
        return transpileBlock_1.blockWrap(new Statement_1.BlockStatement(block));
    }
    exports.transpileCaseValNoLoc = transpileCaseValNoLoc;
    function transpileCaseDoNoLoc(_ref2) {
        let opCased = _ref2.opCased;
        let parts = _ref2.parts;
        let opElse = _ref2.opElse;

        const body = caseBody(parts, opElse);
        return Op_1.caseOp(opCased, _ => new Statement_1.BlockStatement([transpileLocals_1.transpileAssignSingle(_), body]), () => body);
    }
    exports.transpileCaseDoNoLoc = transpileCaseDoNoLoc;
    function caseBody(parts, opElse) {
        let acc = Op_1.caseOp(opElse, transpileBlock_1.default, () => throwNoCaseMatch);
        for (let i = parts.length - 1; i >= 0; i = i - 1) acc = transpileCasePart(parts[i], acc);
        return acc;
    }
    function transpileCasePart(_, alternate) {
        const test = _.test;
        const result = _.result;

        return util_1.loc(_, (() => {
            if (test instanceof Case_1.Pattern) {
                const type = test.type;
                const locals = test.locals;

                const decl = transpileLocals_1.plainLet(idExtract, ms_1.msCall('extract', transpileVal_1.default(type), esast_constants_1.idFocus, new Literal_1.LiteralNumber(locals.length)));
                const testExtract = new Expression_1.BinaryExpression('!==', idExtract, esast_constants_1.litNull);
                const extract = new Declaration_1.VariableDeclarationLet(locals.map((_, index) => new Declaration_1.VariableDeclarator(transpileLocals_1.idForDeclareCached(_), new Expression_1.MemberExpressionComputed(idExtract, new Literal_1.LiteralNumber(index)))));
                const res = transpileBlock_1.default(result, { lead: extract });
                return new Statement_1.BlockStatement([decl, new Statement_1.IfStatement(testExtract, res, alternate)]);
            } else return new Statement_1.IfStatement(transpileVal_1.default(test), transpileBlock_1.default(result), alternate);
        })());
    }
    const idExtract = new Identifier_1.default('_$');
    const throwNoCaseMatch = throwErrorFromString_1.default('No branch of `case` matches.');
});
//# sourceMappingURL=transpileCase.js.map

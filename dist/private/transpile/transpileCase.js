(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'op/Op', '../MsAst', './ast-constants', './context', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var Op_1 = require('op/Op');
    var MsAst_1 = require('../MsAst');
    var ast_constants_1 = require('./ast-constants');
    var context_1 = require('./context');
    var util_1 = require('./util');
    function default_1() {
        const body = caseBody(this.parts, this.opElse);
        if (context_1.verifyResults.isStatement(this)) return Op_1.caseOp(this.opCased, _ => new ast_1.BlockStatement([util_1.t0(_), body]), () => body);else {
            const block = Op_1.caseOp(this.opCased, _ => [util_1.t0(_), body], () => [body]);
            return util_1.blockWrap(new ast_1.BlockStatement(block));
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    function transpileCasePart(alternate) {
        if (this.test instanceof MsAst_1.Pattern) {
            var _test = this.test;
            const type = _test.type;
            const patterned = _test.patterned;
            const locals = _test.locals;

            const decl = util_1.plainLet(IdExtract, util_1.msCall('extract', util_1.t0(type), util_1.t0(patterned), new ast_1.LiteralNumber(locals.length)));
            const test = new ast_1.BinaryExpression('!==', IdExtract, ast_constants_1.LitNull);
            const extract = new ast_1.VariableDeclaration('let', locals.map((_, index) => new ast_1.VariableDeclarator(util_1.idForDeclareCached(_), new ast_1.MemberExpressionComputed(IdExtract, new ast_1.LiteralNumber(index)))));
            const res = util_1.t1(this.result, extract);
            return new ast_1.BlockStatement([decl, new ast_1.IfStatement(test, res, alternate)]);
        } else return new ast_1.IfStatement(util_1.t0(this.test), util_1.t0(this.result), alternate);
    }
    exports.transpileCasePart = transpileCasePart;
    function caseBody(parts, opElse) {
        let acc = Op_1.caseOp(opElse, util_1.t0, () => ThrowNoCaseMatch);
        for (let i = parts.length - 1; i >= 0; i = i - 1) acc = util_1.t1(parts[i], acc);
        return acc;
    }
    const IdExtract = new ast_1.Identifier('_$');
    const ThrowNoCaseMatch = util_1.throwErrorFromString('No branch of `case` matches.');
});
//# sourceMappingURL=transpileCase.js.map

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'op/Op', './ast-constants', './context', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var Op_1 = require('op/Op');
    var ast_constants_1 = require('./ast-constants');
    var context_1 = require('./context');
    var util_1 = require('./util');
    function transpileBreak() {
        return Op_1.caseOp(this.opValue, _ => new ast_1.ReturnStatement(util_1.t0(_)), () => new ast_1.BreakStatement(context_1.verifyResults.isBreakInSwitch(this) ? IdLoop : null));
    }
    exports.transpileBreak = transpileBreak;
    function transpileFor() {
        const loop = forLoop(this.opIteratee, this.block);
        return context_1.verifyResults.isStatement(this) ? maybeLabelLoop(this, loop) : util_1.blockWrap(new ast_1.BlockStatement([loop]));
    }
    exports.transpileFor = transpileFor;
    function transpileForAsync() {
        var _iteratee = this.iteratee;
        const element = _iteratee.element;
        const bag = _iteratee.bag;

        const func = new ast_1.FunctionExpression(null, [util_1.t0(element)], util_1.t0(this.block), { generator: true });
        const call = util_1.msCall('$for', util_1.t0(bag), func);
        return context_1.verifyResults.isStatement(this) ? new ast_1.YieldExpression(call) : call;
    }
    exports.transpileForAsync = transpileForAsync;
    function transpileForBag() {
        const loop = maybeLabelLoop(this, forLoop(this.opIteratee, this.block));
        return util_1.blockWrap(new ast_1.BlockStatement([ast_constants_1.DeclareBuiltBag, loop, ReturnBuilt]));
    }
    exports.transpileForBag = transpileForBag;
    function forLoop(opIteratee, block) {
        const jsBlock = util_1.t0(block);
        return Op_1.caseOp(opIteratee, _ref => {
            let element = _ref.element;
            let bag = _ref.bag;
            return new ast_1.ForOfStatement(new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(util_1.t0(element))]), util_1.t0(bag), jsBlock);
        }, () => new ast_1.ForStatement(null, null, null, jsBlock));
    }
    function maybeLabelLoop(ast, loop) {
        return context_1.verifyResults.loopNeedsLabel(ast) ? new ast_1.LabeledStatement(IdLoop, loop) : loop;
    }
    const IdLoop = new ast_1.Identifier('loop');
    const ReturnBuilt = new ast_1.ReturnStatement(ast_constants_1.IdBuilt);
});
//# sourceMappingURL=transpileFor.js.map

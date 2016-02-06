(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', 'esast/lib/Loop', 'esast/lib/Statement', 'op/Op', './context', './esast-constants', './ms', './transpileBlock', './transpileLocals', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Declaration_1 = require('esast/lib/Declaration');
    const Expression_1 = require('esast/lib/Expression');
    const Function_1 = require('esast/lib/Function');
    const Identifier_1 = require('esast/lib/Identifier');
    const Loop_1 = require('esast/lib/Loop');
    const Statement_1 = require('esast/lib/Statement');
    const Op_1 = require('op/Op');
    const context_1 = require('./context');
    const esast_constants_1 = require('./esast-constants');
    const ms_1 = require('./ms');
    const transpileBlock_1 = require('./transpileBlock');
    const transpileLocals_1 = require('./transpileLocals');
    const transpileVal_1 = require('./transpileVal');
    function transpileForValNoLoc(_ref) {
        let opIteratee = _ref.opIteratee;
        let block = _ref.block;

        return transpileBlock_1.blockWrapStatement(forLoop(opIteratee, block));
    }
    exports.transpileForValNoLoc = transpileForValNoLoc;
    function transpileForDoNoLoc(_) {
        const opIteratee = _.opIteratee;
        const block = _.block;

        return maybeLabelLoop(_, forLoop(opIteratee, block));
    }
    exports.transpileForDoNoLoc = transpileForDoNoLoc;
    function transpileForAsyncValNoLoc(_ref2) {
        var _ref2$iteratee = _ref2.iteratee;
        let element = _ref2$iteratee.element;
        let bag = _ref2$iteratee.bag;
        let block = _ref2.block;

        const func = new Function_1.FunctionExpression(null, [transpileLocals_1.transpileLocalDeclare(element)], transpileBlock_1.default(block), { generator: true });
        return ms_1.msCall('$for', transpileVal_1.default(bag), func);
    }
    exports.transpileForAsyncValNoLoc = transpileForAsyncValNoLoc;
    function transpileForAsyncDoNoLoc(_) {
        return new Statement_1.ExpressionStatement(new Expression_1.YieldExpression(transpileForAsyncValNoLoc(_)));
    }
    exports.transpileForAsyncDoNoLoc = transpileForAsyncDoNoLoc;
    function transpileForBagNoLoc(_) {
        const opIteratee = _.opIteratee;
        const block = _.block;

        const loop = maybeLabelLoop(_, forLoop(opIteratee, block));
        return transpileBlock_1.blockWrap(new Statement_1.BlockStatement([esast_constants_1.declareBuiltBag, loop, returnBuilt]));
    }
    exports.transpileForBagNoLoc = transpileForBagNoLoc;
    function transpileBreakNoLoc(_) {
        return Op_1.caseOp(_.opValue, _ => new Statement_1.ReturnStatement(transpileVal_1.default(_)), () => new Loop_1.BreakStatement(context_1.verifyResults.isBreakInSwitch(_) ? idLoop : null));
    }
    exports.transpileBreakNoLoc = transpileBreakNoLoc;
    function forLoop(opIteratee, block) {
        const blockAst = transpileBlock_1.default(block);
        return Op_1.caseOp(opIteratee, _ref3 => {
            let element = _ref3.element;
            let bag = _ref3.bag;
            return new Loop_1.ForOfStatement(new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(transpileLocals_1.transpileLocalDeclare(element))]), transpileVal_1.default(bag), blockAst);
        }, () => new Loop_1.ForStatement(null, null, null, blockAst));
    }
    function maybeLabelLoop(ast, loop) {
        return context_1.verifyResults.loopNeedsLabel(ast) ? new Loop_1.LabeledStatement(idLoop, loop) : loop;
    }
    const idLoop = new Identifier_1.default('loop');
    const returnBuilt = new Statement_1.ReturnStatement(esast_constants_1.idBuilt);
});
//# sourceMappingURL=transpileLoop.js.map

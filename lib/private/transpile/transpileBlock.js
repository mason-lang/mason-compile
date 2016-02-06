(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Statement', '../ast/Block', '../util', './context', './esast-constants', './transpileErrors', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Expression_1 = require('esast/lib/Expression');
    const Function_1 = require('esast/lib/Function');
    const Statement_1 = require('esast/lib/Statement');
    const Block_1 = require('../ast/Block');
    const util_1 = require('../util');
    const context_1 = require('./context');
    const esast_constants_1 = require('./esast-constants');
    const transpileErrors_1 = require('./transpileErrors');
    const transpileVal_1 = require('./transpileVal');
    const util_2 = require('./util');
    function transpileBlock(_) {
        let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return util_2.loc(_, transpileBlockNoLoc(_, options));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileBlock;
    function transpileBlockNoLoc(_) {
        let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        const lines = _.lines;

        const kind = context_1.verifyResults.blockKind(_);
        var _options$lead = options.lead;
        const lead = _options$lead === undefined ? null : _options$lead;
        var _options$opReturnType = options.opReturnType;
        const opReturnType = _options$opReturnType === undefined ? null : _options$opReturnType;
        var _options$follow = options.follow;
        const follow = _options$follow === undefined ? null : _options$follow;

        function blockWithReturn(returned, lines) {
            const doReturn = new Statement_1.ReturnStatement(util_2.maybeWrapInCheckInstance(returned, opReturnType, 'returned value'));
            return new Statement_1.BlockStatement(util_1.cat(lead, lines, doReturn));
        }
        switch (kind) {
            case 0:
                util_1.assert(opReturnType === null);
                return transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow);
            case 1:
                return new Statement_1.BlockStatement(util_1.cat(lead, util_2.transpileLines(util_1.rtail(lines)), transpileErrors_1.transpileThrow(util_1.last(lines))));
            case 2:
                return blockWithReturn(transpileVal_1.default(util_1.last(lines)), util_2.transpileLines(util_1.rtail(lines)));
            case 3:
            case 4:
            case 5:
                {
                    const declare = kind === 3 ? esast_constants_1.declareBuiltBag : kind === 4 ? esast_constants_1.declareBuiltMap : esast_constants_1.declareBuiltObj;
                    return blockWithReturn(esast_constants_1.idBuilt, util_1.cat(declare, util_2.transpileLines(lines)));
                }
            default:
                throw new Error(String(kind));
        }
    }
    exports.transpileBlockNoLoc = transpileBlockNoLoc;
    function transpileBlockVal(_) {
        let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        return blockWrap(transpileBlock(_, options));
    }
    exports.transpileBlockVal = transpileBlockVal;
    function transpileBlockDo(_) {
        return util_2.loc(_, new Statement_1.BlockStatement(util_2.transpileLines(_.lines)));
    }
    exports.transpileBlockDo = transpileBlockDo;
    function transpileBlockDoWithLeadAndFollow(_, lead, follow) {
        return util_2.loc(_, transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow));
    }
    exports.transpileBlockDoWithLeadAndFollow = transpileBlockDoWithLeadAndFollow;
    function transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow) {
        return new Statement_1.BlockStatement(util_1.cat(lead, util_2.transpileLines(_.lines), follow));
    }
    function blockWrap(block) {
        const thunk = context_1.funKind === 0 ? new Function_1.ArrowFunctionExpression([], block) : new Function_1.FunctionExpression(null, [], block, { generator: true });
        return util_2.callPreservingFunKind(new Expression_1.CallExpression(thunk, []));
    }
    exports.blockWrap = blockWrap;
    function blockWrapStatement(statement) {
        return blockWrap(new Statement_1.BlockStatement([statement]));
    }
    exports.blockWrapStatement = blockWrapStatement;
    function blockWrapIfBlock(_) {
        return _ instanceof Block_1.default ? transpileBlockVal(_) : transpileVal_1.default(_);
    }
    exports.blockWrapIfBlock = blockWrapIfBlock;
});
//# sourceMappingURL=transpileBlock.js.map

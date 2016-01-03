(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Statement', '../util', './context', './esast-constants', './transpileMisc', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('../util');
    var context_1 = require('./context');
    var esast_constants_1 = require('./esast-constants');
    var transpileMisc_1 = require('./transpileMisc');
    var transpileVal_1 = require('./transpileVal');
    var util_2 = require('./util');
    function transpileBlock(_) {
        let lead = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        let opReturnType = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        let follow = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        return util_2.loc(_, transpileBlockNoLoc(_, lead, opReturnType, follow));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileBlock;
    function transpileBlockNoLoc(_) {
        let lead = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        let opReturnType = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        let follow = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
        const lines = _.lines;

        const kind = context_1.verifyResults.blockKind(_);
        function blockWithReturn(returned, lines) {
            const doReturn = new Statement_1.ReturnStatement(util_2.maybeWrapInCheckInstance(returned, opReturnType, 'returned value'));
            return new Statement_1.BlockStatement(util_1.cat(lead, lines, doReturn));
        }
        switch (kind) {
            case 0:
                util_1.assert(opReturnType === null);
                return transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow);
            case 1:
                return new Statement_1.BlockStatement(util_1.cat(lead, util_2.tLines(util_1.rtail(lines)), transpileMisc_1.transpileThrow(util_1.last(lines))));
            case 2:
                return blockWithReturn(transpileVal_1.default(util_1.last(lines)), util_2.tLines(util_1.rtail(lines)));
            case 3:
            case 4:
            case 5:
                {
                    const declare = kind === 3 ? esast_constants_1.DeclareBuiltBag : kind === 4 ? esast_constants_1.DeclareBuiltMap : esast_constants_1.DeclareBuiltObj;
                    return blockWithReturn(esast_constants_1.IdBuilt, util_1.cat(declare, util_2.tLines(lines)));
                }
            default:
                throw new Error(String(kind));
        }
    }
    exports.transpileBlockNoLoc = transpileBlockNoLoc;
    function transpileBlockReturnNoLoc(returned, lines, lead, opReturnType) {
        const ret = new Statement_1.ReturnStatement(util_2.maybeWrapInCheckInstance(returned, opReturnType, 'returned value'));
        return new Statement_1.BlockStatement(util_1.cat(lead, lines, ret));
    }
    function transpileBlockDo(_) {
        return util_2.loc(_, new Statement_1.BlockStatement(util_2.tLines(_.lines)));
    }
    exports.transpileBlockDo = transpileBlockDo;
    function transpileBlockDoWithLeadAndFollow(_, lead, follow) {
        return util_2.loc(_, transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow));
    }
    exports.transpileBlockDoWithLeadAndFollow = transpileBlockDoWithLeadAndFollow;
    function transpileBlockDoWithLeadAndFollowNoLoc(_, lead, follow) {
        return new Statement_1.BlockStatement(util_1.cat(lead, util_2.tLines(_.lines), follow));
    }
    exports.transpileBlockDoWithLeadAndFollowNoLoc = transpileBlockDoWithLeadAndFollowNoLoc;
});
//# sourceMappingURL=transpileBlock.js.map

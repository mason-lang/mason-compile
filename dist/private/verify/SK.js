(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../util', './autoBlockKind', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var util_1 = require('../util');
    var autoBlockKind_1 = require('./autoBlockKind');
    var context_2 = require('./context');
    function markStatement(_, sk) {
        if (sk === 0) context_2.results.statements.add(_);
    }
    exports.markStatement = markStatement;
    function getBlockSK(_) {
        return Op_1.orDefault(opBlockSK(_), () => 1);
    }
    exports.getBlockSK = getBlockSK;
    function getLineSK(_) {
        return Op_1.orDefault(opSK(_), () => 1);
    }
    exports.getLineSK = getLineSK;
    function opBlockSK(_ref) {
        let lines = _ref.lines;
        let loc = _ref.loc;

        return autoBlockKind_1.default(lines, loc) === 2 ? util_1.isEmpty(lines) ? 0 : opSK(util_1.last(lines)) : 1;
    }
    function opSK(_) {
        if (_ instanceof MsAst_1.DoOnly) return 0;else if (_ instanceof MsAst_1.ValOnly) return 1;else if (_ instanceof MsAst_1.Conditional) {
            const result = _.result;

            return result instanceof MsAst_1.Block ? opBlockSK(result) : opSK(result);
        } else if (_ instanceof MsAst_1.Except) {
            const loc = _.loc;
            const _try = _.try;
            const allCatches = _.allCatches;
            const opElse = _.opElse;

            const catches = allCatches.map(_ => _.block);
            const parts = Op_1.caseOp(opElse, _ => util_1.cat(_, catches), () => util_1.cat(_try, catches));
            return compositeSK(loc, parts.map(opBlockSK));
        } else if (_ instanceof MsAst_1.For) return Op_1.orDefault(opForSKBlock(_.block), () => 0);else if (_ instanceof MsAst_1.Case || _ instanceof MsAst_1.Switch) return compositeSK(_.loc, caseSwitchParts(_).map(opBlockSK));else return null;
    }
    function opForSKBlock(_ref2) {
        let loc = _ref2.loc;
        let lines = _ref2.lines;

        return util_1.isEmpty(lines) ? null : compositeForSK(loc, lines.map(opForSK));
    }
    function opForSK(_) {
        if (_ instanceof MsAst_1.Break) return _.opValue === null ? 0 : 1;else if (_ instanceof MsAst_1.Conditional) {
            const result = _.result;

            return result instanceof MsAst_1.Block ? opForSKBlock(result) : opForSK(result);
        } else if (_ instanceof MsAst_1.Except) {
            const loc = _.loc;
            const _try = _.try;
            const allCatches = _.allCatches;
            const opElse = _.opElse;
            const opFinally = _.opFinally;

            const catches = allCatches.map(_ => _.block);
            return compositeForSK(loc, util_1.cat(_try, catches, opElse, opFinally).map(opForSKBlock));
        } else if (_ instanceof MsAst_1.With) return opForSKBlock(_.block);else if (_ instanceof MsAst_1.Case || _ instanceof MsAst_1.Switch) return compositeForSK(_.loc, caseSwitchParts(_).map(opForSKBlock));else return null;
    }
    function caseSwitchParts(_ref3) {
        let parts = _ref3.parts;
        let opElse = _ref3.opElse;

        const prts = parts;
        return util_1.cat(prts.map(_ => _.result), opElse);
    }
    function compositeSK(loc, parts) {
        return composite(loc, parts, _ => _.ambiguousSK);
    }
    function compositeForSK(loc, parts) {
        return composite(loc, parts, _ => _.ambiguousForSK);
    }
    function composite(loc, sks, errorMessage) {
        let opSk = sks[0];
        for (let i = 1; i < sks.length; i = i + 1) {
            const otherSK = sks[i];
            if (opSk === null) opSk = otherSK;else context_1.check(otherSK === null || otherSK === opSk, loc, errorMessage);
        }
        return opSk;
    }
});
//# sourceMappingURL=SK.js.map

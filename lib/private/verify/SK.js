(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Block', '../ast/booleans', '../ast/Case', '../ast/errors', '../ast/LineContent', '../ast/Loop', '../ast/Switch', '../ast/With', '../context', '../util', './autoBlockKind'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const Block_1 = require('../ast/Block');
    const booleans_1 = require('../ast/booleans');
    const Case_1 = require('../ast/Case');
    const errors_1 = require('../ast/errors');
    const LineContent_1 = require('../ast/LineContent');
    const Loop_1 = require('../ast/Loop');
    const Switch_1 = require('../ast/Switch');
    const With_1 = require('../ast/With');
    const context_1 = require('../context');
    const util_1 = require('../util');
    const autoBlockKind_1 = require('./autoBlockKind');
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
        if (_ instanceof LineContent_1.DoOnly) return 0;else if (_ instanceof LineContent_1.ValOnly) return 1;else if (_ instanceof booleans_1.Conditional) {
            const result = _.result;

            return result instanceof Block_1.default ? opBlockSK(result) : opSK(result);
        } else if (_ instanceof errors_1.Except) {
            const loc = _.loc;
            const tried = _.tried;
            const allCatches = _.allCatches;
            const opElse = _.opElse;

            const catches = allCatches.map(_ => _.block);
            const parts = Op_1.caseOp(opElse, _ => util_1.cat(_, catches), () => util_1.cat(tried, catches));
            return compositeSK(loc, parts.map(opBlockSK));
        } else if (_ instanceof Loop_1.For) return Op_1.orDefault(opForSKBlock(_.block), () => 0);else if (_ instanceof Case_1.default || _ instanceof Switch_1.default) return compositeSK(_.loc, caseSwitchParts(_).map(opBlockSK));else return null;
    }
    function opForSKBlock(_ref2) {
        let loc = _ref2.loc;
        let lines = _ref2.lines;

        return util_1.isEmpty(lines) ? null : compositeForSK(loc, lines.map(opForSK));
    }
    function opForSK(_) {
        if (_ instanceof Loop_1.Break) return _.opValue === null ? 0 : 1;else if (_ instanceof booleans_1.Conditional) {
            const result = _.result;

            return result instanceof Block_1.default ? opForSKBlock(result) : opForSK(result);
        } else if (_ instanceof errors_1.Except) {
            const loc = _.loc;
            const tried = _.tried;
            const allCatches = _.allCatches;
            const opElse = _.opElse;
            const opFinally = _.opFinally;

            const catches = allCatches.map(_ => _.block);
            return compositeForSK(loc, util_1.cat(tried, catches, opElse, opFinally).map(opForSKBlock));
        } else if (_ instanceof With_1.default) return opForSKBlock(_.block);else if (_ instanceof Case_1.default || _ instanceof Switch_1.default) return compositeForSK(_.loc, caseSwitchParts(_).map(opForSKBlock));else return null;
    }
    function caseSwitchParts(_ref3) {
        let parts = _ref3.parts;
        let opElse = _ref3.opElse;

        return util_1.cat(parts.map(_ => _.result), opElse);
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

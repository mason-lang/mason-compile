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
    var MsAstTypes = require('../MsAst');
    var util_1 = require('../util');
    var autoBlockKind_1 = require('./autoBlockKind');
    var context_2 = require('./context');
    function checkDo(_, sk) {
        context_1.check(sk === 0, _.loc, _ => _.statementAsValue);
    }
    exports.checkDo = checkDo;
    function checkVal(_, sk) {
        if (sk === 0) context_1.warn(_.loc, _ => _.valueAsStatement);
    }
    exports.checkVal = checkVal;
    function markStatement(_, sk) {
        if (sk === 0) context_2.results.statements.add(_);
    }
    exports.markStatement = markStatement;
    function getSK(_) {
        return Op_1.orDefault(_.opSK(), () => 1);
    }
    exports.getSK = getSK;
    util_1.implementMany(MsAstTypes, 'opSK', {
        DoOnly() {
            return 0;
        },
        ValOnly() {
            return 1;
        },
        Call() {
            return null;
        },
        Del() {
            return null;
        },
        Yield() {
            return null;
        },
        YieldTo() {
            return null;
        },
        Block() {
            const lines = this.lines;
            const loc = this.loc;

            return autoBlockKind_1.default(lines, loc) === 2 ? util_1.isEmpty(lines) ? 0 : util_1.last(lines).opSK() : 1;
        },
        Conditional() {
            return this.result.opSK();
        },
        Except() {
            const catches = this.allCatches.map(_ => _.block);
            const parts = Op_1.caseOp(this.opElse, _ => util_1.cat(_, catches), () => util_1.cat(this.try, catches));
            return compositeSK(this.loc, parts);
        },
        For() {
            return Op_1.orDefault(this.block.opForSK(), () => 0);
        },
        Case: caseSwitchSK,
        Switch: caseSwitchSK
    });
    function caseSwitchSK() {
        return compositeSK(this.loc, caseSwitchParts(this));
    }
    util_1.implementMany(MsAstTypes, 'opForSK', {
        default() {
            return null;
        },
        Break() {
            return this.opValue === null ? 0 : 1;
        },
        Block() {
            return util_1.isEmpty(this.lines) ? null : compositeForSK(this.loc, this.lines);
        },
        Conditional() {
            return this.result.opForSK();
        },
        Case: caseSwitchForSK,
        Except() {
            const catches = this.allCatches.map(_ => _.block);
            return compositeForSK(this.loc, util_1.cat(this.try, catches, this.opElse, this.opFinally));
        },
        Switch: caseSwitchForSK
    });
    function caseSwitchForSK() {
        return compositeForSK(this.loc, caseSwitchParts(this));
    }
    function caseSwitchParts(_) {
        return util_1.cat(_.parts.map(_ => _.result), _.opElse);
    }
    function compositeSK(loc, parts) {
        return composite(loc, _ => _.opSK(), parts, _ => _.ambiguousSK);
    }
    function compositeForSK(loc, parts) {
        return composite(loc, _ => _.opForSK(), parts, _ => _.ambiguousForSK);
    }
    function composite(loc, method, parts, errorMessage) {
        let opSk = method(parts[0]);
        for (let i = 1; i < parts.length; i = i + 1) {
            const otherSK = method(parts[i]);
            if (opSk === null) opSk = otherSK;else context_1.check(otherSK === null || otherSK === opSk, loc, errorMessage);
        }
        return opSk;
    }
});
//# sourceMappingURL=SK.js.map

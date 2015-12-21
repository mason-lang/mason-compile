(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";

    function load(_) {
        exports.opParseExpr = _.opParseExpr;
        exports.parseClass = _.parseClass;
        exports.parseExcept = _.parseExcept;
        exports.parseExpr = _.parseExpr;
        exports.parseExprParts = _.parseExprParts;
        exports.parseNExprParts = _.parseNExprParts;
        exports.parseSingle = _.parseSingle;
        exports.parseSpaced = _.parseSpaced;
        exports.parseSwitch = _.parseSwitch;
        exports.parseTraitDo = _.parseTraitDo;
    }
    exports.load = load;
});
//# sourceMappingURL=parse*.js.map

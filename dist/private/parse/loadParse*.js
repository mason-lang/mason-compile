(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './parseClass', './parseExcept', './parseExpr', './parseSingle', './parseSpaced', './parseSwitch', './parseTraitDo', './parse*'], factory);
    }
})(function (require, exports) {
    "use strict";

    var parseClass_1 = require('./parseClass');
    var parseExcept_1 = require('./parseExcept');
    var parseExpr_1 = require('./parseExpr');
    var parseSingle_1 = require('./parseSingle');
    var parseSpaced_1 = require('./parseSpaced');
    var parseSwitch_1 = require('./parseSwitch');
    var parseTraitDo_1 = require('./parseTraitDo');
    var parse_1 = require('./parse*');
    parse_1.load({
        opParseExpr: parseExpr_1.opParseExpr, parseClass: parseClass_1.default, parseExcept: parseExcept_1.default, parseExpr: parseExpr_1.default, parseExprParts: parseExpr_1.parseExprParts, parseNExprParts: parseExpr_1.parseNExprParts, parseSingle: parseSingle_1.default,
        parseSpaced: parseSpaced_1.default, parseSwitch: parseSwitch_1.default, parseTraitDo: parseTraitDo_1.default
    });
});
//# sourceMappingURL=loadParse*.js.map

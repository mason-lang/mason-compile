var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Trait', './parseBlock', './parseExpr', './parseMethodImpls'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const Trait_1 = require('../ast/Trait');
    const parseBlock_1 = require('./parseBlock');
    const parseExpr_1 = require('./parseExpr');
    const parseMethodImpls_1 = require('./parseMethodImpls');
    function parseTraitDo(tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndOpBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const opBlock = _parseBlock_1$beforeA2[1];

        var _parseExpr_1$parseNEx = parseExpr_1.parseNExprParts(before, 2, _ => _.argsTraitDo);

        var _parseExpr_1$parseNEx2 = _slicedToArray(_parseExpr_1$parseNEx, 2);

        const implementor = _parseExpr_1$parseNEx2[0];
        const trait = _parseExpr_1$parseNEx2[1];

        var _Op_1$caseOp = Op_1.caseOp(opBlock, parseMethodImpls_1.parseStaticsAndMethods, () => [[], []]);

        var _Op_1$caseOp2 = _slicedToArray(_Op_1$caseOp, 2);

        const statics = _Op_1$caseOp2[0];
        const methods = _Op_1$caseOp2[1];

        return new Trait_1.TraitDo(tokens.loc, implementor, trait, statics, methods);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseTraitDo;
});
//# sourceMappingURL=parseTraitDo.js.map

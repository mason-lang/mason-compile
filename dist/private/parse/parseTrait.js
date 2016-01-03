var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Trait', './parseBlock', './parseExpr', './parseMethodImpls', './tryTakeComment'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var Trait_1 = require('../ast/Trait');
    var parseBlock_1 = require('./parseBlock');
    var parseExpr_1 = require('./parseExpr');
    var parseMethodImpls_1 = require('./parseMethodImpls');
    var tryTakeComment_1 = require('./tryTakeComment');
    function parseTrait(tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndOpBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const opBlock = _parseBlock_1$beforeA2[1];

        const superTraits = parseExpr_1.parseExprParts(before);

        var _Op_1$caseOp = Op_1.caseOp(opBlock, _ => {
            var _tryTakeComment_1$def = tryTakeComment_1.default(_);

            var _tryTakeComment_1$def2 = _slicedToArray(_tryTakeComment_1$def, 2);

            const opComment = _tryTakeComment_1$def2[0];
            const rest = _tryTakeComment_1$def2[1];

            if (rest.isEmpty()) return [opComment, null, [], []];else {
                var _parseMethodImpls_1$o = parseMethodImpls_1.opTakeDo(rest);

                var _parseMethodImpls_1$o2 = _slicedToArray(_parseMethodImpls_1$o, 2);

                const opDo = _parseMethodImpls_1$o2[0];
                const rest2 = _parseMethodImpls_1$o2[1];

                var _parseMethodImpls_1$p = parseMethodImpls_1.parseStaticsAndMethods(rest2);

                var _parseMethodImpls_1$p2 = _slicedToArray(_parseMethodImpls_1$p, 2);

                const statics = _parseMethodImpls_1$p2[0];
                const methods = _parseMethodImpls_1$p2[1];

                return [opComment, opDo, statics, methods];
            }
        }, () => [null, null, [], []]);

        var _Op_1$caseOp2 = _slicedToArray(_Op_1$caseOp, 4);

        const opComment = _Op_1$caseOp2[0];
        const opDo = _Op_1$caseOp2[1];
        const statics = _Op_1$caseOp2[2];
        const methods = _Op_1$caseOp2[3];

        return new Trait_1.default(tokens.loc, superTraits, opComment, opDo, statics, methods);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseTrait;
});
//# sourceMappingURL=parseTrait.js.map

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/locals', '../ast/Loop', '../context', '../token/Keyword', './parseBlock', './parseExpr', './parseLocalDeclares'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const locals_1 = require('../ast/locals');
    const Loop_1 = require('../ast/Loop');
    const context_1 = require('../context');
    const Keyword_1 = require('../token/Keyword');
    const parseBlock_1 = require('./parseBlock');
    const parseExpr_1 = require('./parseExpr');
    const parseLocalDeclares_1 = require('./parseLocalDeclares');
    function parseFor(tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const block = _parseBlock_1$beforeA2[1];

        return new Loop_1.For(tokens.loc, opParseIteratee(before), parseBlock_1.default(block));
    }
    exports.parseFor = parseFor;
    function parseForAsync(tokens) {
        var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

        const before = _parseBlock_1$beforeA4[0];
        const block = _parseBlock_1$beforeA4[1];

        return new Loop_1.ForAsync(tokens.loc, parseIteratee(before), parseBlock_1.default(block));
    }
    exports.parseForAsync = parseForAsync;
    function parseForBag(tokens) {
        var _parseBlock_1$beforeA5 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA6 = _slicedToArray(_parseBlock_1$beforeA5, 2);

        const before = _parseBlock_1$beforeA6[0];
        const block = _parseBlock_1$beforeA6[1];

        return new Loop_1.ForBag(tokens.loc, opParseIteratee(before), parseBlock_1.default(block));
    }
    exports.parseForBag = parseForBag;
    function opParseIteratee(tokens) {
        return Op_1.opIf(!tokens.isEmpty(), () => parseIteratee(tokens));
    }
    function parseIteratee(tokens) {
        var _Op_1$caseOp = Op_1.caseOp(tokens.opSplitOnce(_ => Keyword_1.isKeyword(53, _)), _ref => {
            let before = _ref.before;
            let after = _ref.after;

            context_1.check(before.size() === 1, before.loc, _ => _.todoForPattern);
            return [parseLocalDeclares_1.parseLocalDeclaresJustNames(before)[0], parseExpr_1.default(after)];
        }, () => [locals_1.LocalDeclare.focus(tokens.loc), parseExpr_1.default(tokens)]);

        var _Op_1$caseOp2 = _slicedToArray(_Op_1$caseOp, 2);

        const element = _Op_1$caseOp2[0];
        const bag = _Op_1$caseOp2[1];

        return new Loop_1.Iteratee(tokens.loc, element, bag);
    }
});
//# sourceMappingURL=parseFor.js.map

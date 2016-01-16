var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../ast/classTraitCommon', '../ast/Quote', '../context', '../token/Keyword', './parseBlock', './parseExpr', './parseFunBlock', './parseMethodSplit'], factory);
    }
})(function (require, exports) {
    "use strict";

    var classTraitCommon_1 = require('../ast/classTraitCommon');
    var Quote_1 = require('../ast/Quote');
    var context_1 = require('../context');
    var Keyword_1 = require('../token/Keyword');
    var parseBlock_1 = require('./parseBlock');
    var parseExpr_1 = require('./parseExpr');
    var parseFunBlock_1 = require('./parseFunBlock');
    var parseMethodSplit_1 = require('./parseMethodSplit');
    function parseMethodImpls(lines) {
        return lines.mapSlices(parseMethodImpl);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseMethodImpls;
    function takeStatics(lines) {
        if (lines.isEmpty()) return [[], lines];else {
            const line = lines.headSlice();
            return Keyword_1.isKeyword(144, line.head()) ? [parseMethodImpls(parseBlock_1.justBlock(144, line.tail())), lines.tail()] : [[], lines];
        }
    }
    exports.takeStatics = takeStatics;
    function parseStaticsAndMethods(lines) {
        var _takeStatics = takeStatics(lines);

        var _takeStatics2 = _slicedToArray(_takeStatics, 2);

        const statics = _takeStatics2[0];
        const rest = _takeStatics2[1];

        return [statics, parseMethodImpls(rest)];
    }
    exports.parseStaticsAndMethods = parseStaticsAndMethods;
    function opTakeDo(lines) {
        const line = lines.headSlice();
        return Keyword_1.isKeyword(94, line.head()) ? [new classTraitCommon_1.ClassTraitDo(line.loc, parseBlock_1.parseJustBlock(94, line.tail())), lines.tail()] : [null, lines];
    }
    exports.opTakeDo = opTakeDo;
    function parseMethodImpl(tokens) {
        var _tokens$takeKeywords = tokens.takeKeywords(130, 155, 137);

        var _tokens$takeKeywords2 = _slicedToArray(_tokens$takeKeywords, 2);

        var _tokens$takeKeywords3 = _slicedToArray(_tokens$takeKeywords2[0], 3);

        const isMy = _tokens$takeKeywords3[0];
        const isVirtual = _tokens$takeKeywords3[1];
        const isOverride = _tokens$takeKeywords3[2];
        const rest = _tokens$takeKeywords2[1];

        const kind = methodKind(tokens.loc, isMy, isVirtual, isOverride);
        const head = rest.head();
        if (isGetSet(head)) {
            var _parseBlock_1$beforeA = parseBlock_1.beforeAndBlock(rest.tail());

            var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

            const before = _parseBlock_1$beforeA2[0];
            const block = _parseBlock_1$beforeA2[1];

            const ctr = head.kind === 120 ? classTraitCommon_1.MethodGetter : classTraitCommon_1.MethodSetter;
            return new ctr(rest.loc, parseExprOrQuoteSimple(before), parseBlock_1.default(block), kind);
        } else {
            var _parseMethodSplit_1$d = parseMethodSplit_1.default(rest);

            const before = _parseMethodSplit_1$d.before;
            const funKind = _parseMethodSplit_1$d.kind;
            const after = _parseMethodSplit_1$d.after;

            const fun = parseFunBlock_1.default(funKind, after);
            return new classTraitCommon_1.MethodImpl(rest.loc, parseExprOrQuoteSimple(before), fun, kind);
        }
    }
    function methodKind(loc, isMy, isVirtual, isOverride) {
        context_1.check(!(isMy && isOverride), loc, _ => _.noMyOverride);
        const m = isMy ? 0b100 : 0;
        const v = isVirtual ? 0b010 : 0;
        const o = isOverride ? 0b001 : 0;
        return m | v | o;
    }
    function isGetSet(token) {
        if (token instanceof Keyword_1.default) return token.kind === 120 || token.kind === 142;else return null;
    }
    function parseExprOrQuoteSimple(tokens) {
        const expr = parseExpr_1.default(tokens);
        return expr instanceof Quote_1.QuoteSimple ? expr.value : expr;
    }
});
//# sourceMappingURL=parseMethodImpls.js.map
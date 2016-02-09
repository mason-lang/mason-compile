var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Await', '../ast/booleans', '../ast/Call', '../ast/Class', '../ast/locals', '../ast/Val', '../ast/With', '../ast/YieldLike', '../context', '../token/Group', '../token/Keyword', '../util', './checks', './parseBlock', './parseClass', './parseCase', './parseDel', './parseExcept', './parseFor', './parseFunBlock', './parsePipe', './parsePoly', './parseSingle', './parseSwitch', './parseTrait', './parseLocalDeclares', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const Await_1 = require('../ast/Await');
    const booleans_1 = require('../ast/booleans');
    const Call_1 = require('../ast/Call');
    const Class_1 = require('../ast/Class');
    const locals_1 = require('../ast/locals');
    const Val_1 = require('../ast/Val');
    const With_1 = require('../ast/With');
    const YieldLike_1 = require('../ast/YieldLike');
    const context_1 = require('../context');
    const Group_1 = require('../token/Group');
    const Keyword_1 = require('../token/Keyword');
    const util_1 = require('../util');
    const checks_1 = require('./checks');
    const parseBlock_1 = require('./parseBlock');
    const parseClass_1 = require('./parseClass');
    const parseCase_1 = require('./parseCase');
    const parseDel_1 = require('./parseDel');
    const parseExcept_1 = require('./parseExcept');
    const parseFor_1 = require('./parseFor');
    const parseFunBlock_1 = require('./parseFunBlock');
    const parsePipe_1 = require('./parsePipe');
    const parsePoly_1 = require('./parsePoly');
    const parseSingle_1 = require('./parseSingle');
    const parseSwitch_1 = require('./parseSwitch');
    const parseTrait_1 = require('./parseTrait');
    const parseLocalDeclares_1 = require('./parseLocalDeclares');
    const Slice_1 = require('./Slice');
    function parseExpr(tokens) {
        checks_1.checkNonEmpty(tokens, _ => _.expectedExpression);
        const parts = parseExprParts(tokens);
        if (parts.length === 1) {
            if (tokens.head() instanceof Group_1.GroupParenthesis) context_1.warn(tokens.loc, _ => _.extraParens);
            return util_1.head(parts);
        } else return new Call_1.default(tokens.loc, util_1.head(parts), util_1.tail(parts));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseExpr;
    function opParseExpr(tokens) {
        return Op_1.opIf(!tokens.isEmpty(), () => parseExpr(tokens));
    }
    exports.opParseExpr = opParseExpr;
    function parseExprParts(tokens) {
        return Op_1.caseOp(tokens.opSplitOnce(Keyword_1.isExprSplitKeyword), _ref => {
            let before = _ref.before;
            let at = _ref.at;
            let after = _ref.after;
            return util_1.cat(before.map(parseSingle_1.default), keywordExpr(at, after));
        }, () => {
            const last = tokens.last();
            if (last instanceof Group_1.GroupParenthesis) {
                const h = Slice_1.Tokens.of(last).head();
                if (Keyword_1.isExprSplitKeyword(h)) context_1.warn(h.loc, _ => _.extraParens);
            }
            return tokens.map(parseSingle_1.default);
        });
    }
    exports.parseExprParts = parseExprParts;
    function parseNExprParts(tokens, n, message) {
        const parts = parseExprParts(tokens);
        context_1.check(parts.length === n, tokens.loc, message);
        return parts;
    }
    exports.parseNExprParts = parseNExprParts;
    function keywordExpr(at, after) {
        if (at instanceof Keyword_1.KeywordFun) return parseFunBlock_1.default(at.options, after);else if (at instanceof Keyword_1.KeywordOperator) return new Val_1.Operator(at.loc, at.kind, parseExprParts(after));else if (at instanceof Keyword_1.KeywordUnaryOperator) return new Val_1.UnaryOperator(at.loc, at.kind, parseExpr(after));else if (at instanceof Keyword_1.KeywordPlain) return keywordPlainExpr(at, after);else throw new Error(at.name());
    }
    function keywordPlainExpr(_ref2, after) {
        let kind = _ref2.kind;
        let loc = _ref2.loc;

        switch (kind) {
            case 0:
                return new Await_1.default(loc, parseExpr(after));
            case 1:
                return parseCase_1.default(after);
            case 2:
                return parseClass_1.default(after);
            case 3:
                return parseCond(after);
            case 4:
                return parseDel_1.default(after);
            case 5:
                return parseExcept_1.default(after);
            case 6:
                return parseFor_1.parseFor(after);
            case 7:
                return parseFor_1.parseForAsync(after);
            case 8:
                return parseFor_1.parseForBag(after);
            case 9:
            case 16:
                return parseConditional(kind, after);
            case 10:
                {
                    const parts = parseExprParts(after);
                    return new Call_1.New(loc, util_1.head(parts), util_1.tail(parts));
                }
            case 12:
                return parsePipe_1.default(after);
            case 11:
                return parsePoly_1.default(after);
            case 13:
                return new Class_1.SuperCall(loc, parseExprParts(after));
            case 14:
                return parseSwitch_1.default(after);
            case 15:
                return parseTrait_1.default(after);
            case 17:
                return parseWith(after);
            case 18:
                return new YieldLike_1.Yield(loc, Op_1.opIf(!after.isEmpty(), () => parseExpr(after)));
            case 19:
                return new YieldLike_1.YieldTo(loc, parseExpr(after));
            default:
                throw new Error(String(kind));
        }
    }
    function parseCond(tokens) {
        var _parseNExprParts = parseNExprParts(tokens, 3, _ => _.argsCond);

        var _parseNExprParts2 = _slicedToArray(_parseNExprParts, 3);

        const cond = _parseNExprParts2[0];
        const ifTrue = _parseNExprParts2[1];
        const ifFalse = _parseNExprParts2[2];

        return new booleans_1.Cond(tokens.loc, cond, ifTrue, ifFalse);
    }
    function parseConditional(kind, tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndOpBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const opBlock = _parseBlock_1$beforeA2[1];

        var _Op_1$caseOp = Op_1.caseOp(opBlock, _ => [parseExpr(before), parseBlock_1.default(_)], () => parseNExprParts(before, 2, _ => _.argsConditional(kind)));

        var _Op_1$caseOp2 = _slicedToArray(_Op_1$caseOp, 2);

        const condition = _Op_1$caseOp2[0];
        const result = _Op_1$caseOp2[1];

        return new booleans_1.Conditional(tokens.loc, condition, result, kind === 16);
    }
    function parseWith(tokens) {
        var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

        const before = _parseBlock_1$beforeA4[0];
        const block = _parseBlock_1$beforeA4[1];

        var _Op_1$caseOp3 = Op_1.caseOp(before.opSplitOnce(_ => Keyword_1.isKeyword(35, _)), _ref3 => {
            let before = _ref3.before;
            let after = _ref3.after;

            context_1.check(after.size() === 1, after.loc, _ => _.asToken);
            return [parseExpr(before), parseLocalDeclares_1.parseLocalDeclare(after.head())];
        }, () => [parseExpr(before), locals_1.LocalDeclare.focus(tokens.loc)]);

        var _Op_1$caseOp4 = _slicedToArray(_Op_1$caseOp3, 2);

        const val = _Op_1$caseOp4[0];
        const declare = _Op_1$caseOp4[1];

        return new With_1.default(tokens.loc, declare, val, parseBlock_1.default(block));
    }
});
//# sourceMappingURL=parseExpr.js.map

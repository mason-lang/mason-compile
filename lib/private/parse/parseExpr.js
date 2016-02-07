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
        return Op_1.caseOp(tokens.opSplitOnce(isSplitKeyword), _ref => {
            let before = _ref.before;
            let at = _ref.at;
            let after = _ref.after;
            return util_1.cat(before.map(parseSingle_1.default), keywordExpr(at, after));
        }, () => {
            const last = tokens.last();
            if (last instanceof Group_1.GroupParenthesis) {
                const h = Slice_1.Tokens.of(last).head();
                if (isSplitKeyword(h)) context_1.warn(h.loc, _ => _.extraParens);
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
        const kind = at.kind;

        switch (kind) {
            case 90:
                return new Await_1.default(at.loc, parseExpr(after));
            case 93:
                return parseCase_1.default(after);
            case 96:
                return parseClass_1.default(after);
            case 95:
                return parseCond(after);
            case 100:
                return parseDel_1.default(after);
            case 106:
                return parseExcept_1.default(after);
            case 111:
                return parseFor_1.parseFor(after);
            case 112:
                return parseFor_1.parseForAsync(after);
            case 113:
                return parseFor_1.parseForBag(after);
            case 115:
            case 116:
            case 117:
            case 118:
            case 119:
            case 120:
            case 121:
            case 122:
            case 123:
            case 124:
            case 125:
            case 126:
                return parseFunBlock_1.default(at.kind, after);
            case 128:
            case 174:
                return parseConditional(at.kind, after);
            case 137:
                {
                    const parts = parseExprParts(after);
                    return new Call_1.New(at.loc, util_1.head(parts), util_1.tail(parts));
                }
            case 141:
            case 142:
            case 143:
            case 144:
            case 145:
            case 146:
            case 147:
            case 148:
            case 149:
            case 150:
            case 151:
            case 152:
            case 153:
            case 154:
                return new Val_1.Operator(at.loc, Keyword_1.keywordKindToOperatorKind(kind), parseExprParts(after));
            case 157:
                return parsePipe_1.default(after);
            case 158:
                return parsePoly_1.default(after);
            case 161:
                return new Class_1.SuperCall(at.loc, parseExprParts(after));
            case 163:
                return parseSwitch_1.default(after);
            case 167:
                return parseTrait_1.default(after);
            case 171:
            case 172:
                return new Val_1.UnaryOperator(at.loc, Keyword_1.keywordKindToUnaryKind(kind), parseExpr(after));
            case 176:
                return parseWith(after);
            case 177:
                return new YieldLike_1.Yield(at.loc, Op_1.opIf(!after.isEmpty(), () => parseExpr(after)));
            case 178:
                return new YieldLike_1.YieldTo(at.loc, parseExpr(after));
            default:
                throw new Error(String(at.kind));
        }
    }
    const exprSplitKeywords = new Set([90, 93, 96, 95, 100, 106, 111, 112, 113, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 128, 137, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 157, 158, 161, 163, 167, 171, 172, 174, 176, 177, 178]);
    function isSplitKeyword(_) {
        return Keyword_1.isAnyKeyword(exprSplitKeywords, _);
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

        return new booleans_1.Conditional(tokens.loc, condition, result, kind === 174);
    }
    function parseWith(tokens) {
        var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

        const before = _parseBlock_1$beforeA4[0];
        const block = _parseBlock_1$beforeA4[1];

        var _Op_1$caseOp3 = Op_1.caseOp(before.opSplitOnce(_ => Keyword_1.isKeyword(86, _)), _ref2 => {
            let before = _ref2.before;
            let after = _ref2.after;

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

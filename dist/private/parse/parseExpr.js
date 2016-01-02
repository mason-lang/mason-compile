var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', 'esast/lib/Loc', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseClass', './parseCase', './parseDel', './parseExcept', './parseFor', './parseFun', './parseMethod', './parseSingle', './parseSwitch', './parseTrait', './parseLocalDeclares', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var Loc_1 = require('esast/lib/Loc');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var util_1 = require('../util');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseClass_1 = require('./parseClass');
    var parseCase_1 = require('./parseCase');
    var parseDel_1 = require('./parseDel');
    var parseExcept_1 = require('./parseExcept');
    var parseFor_1 = require('./parseFor');
    var parseFun_1 = require('./parseFun');
    var parseMethod_1 = require('./parseMethod');
    var parseSingle_1 = require('./parseSingle');
    var parseSwitch_1 = require('./parseSwitch');
    var parseTrait_1 = require('./parseTrait');
    var parseLocalDeclares_1 = require('./parseLocalDeclares');
    var Slice_1 = require('./Slice');
    function parseExpr(tokens) {
        return Op_1.caseOp(tokens.opSplitMany(_ => Token_1.isKeyword(92, _)), _ => parseObjSimple(tokens.loc, _), () => parseExprPlain(tokens));
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
            if (last instanceof Token_1.GroupParenthesis) {
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
    function parseObjSimple(loc, splits) {
        const first = splits[0].before;
        checks_1.checkNonEmpty(first, _ => _.unexpected(splits[0].at));
        const tokensCaller = first.rtail();
        const pairs = [];
        for (let i = 0; i < splits.length - 1; i = i + 1) {
            const nameToken = splits[i].before.last();
            const name = parseName(nameToken);
            const tokensValue = i === splits.length - 2 ? splits[i + 1].before : splits[i + 1].before.rtail();
            const value = parseExprPlain(tokensValue);
            const loc = new Loc_1.default(nameToken.loc.start, tokensValue.loc.end);
            pairs.push(new MsAst_1.ObjPair(loc, name, value));
        }
        const val = new MsAst_1.ObjSimple(loc, pairs);
        if (tokensCaller.isEmpty()) return val;else {
            const parts = parseExprParts(tokensCaller);
            return new MsAst_1.Call(loc, util_1.head(parts), util_1.cat(util_1.tail(parts), val));
        }
    }
    function parseName(token) {
        if (token instanceof Token_1.Name) return token.name;else throw context_1.fail(token.loc, _ => _.expectedName(token));
    }
    function keywordExpr(at, after) {
        switch (at.kind) {
            case 36:
            case 94:
                {
                    const kind = at.kind === 36 ? 0 : 1;
                    return new MsAst_1.Logic(at.loc, kind, parseExprParts(after));
                }
            case 40:
                return new MsAst_1.Await(at.loc, parseExprPlain(after));
            case 43:
                return parseCase_1.default(false, after);
            case 46:
                return parseClass_1.default(after);
            case 45:
                return parseCond(after);
            case 50:
                return parseDel_1.default(after);
            case 56:
                return parseExcept_1.default(after);
            case 61:
                return parseFor_1.parseFor(after);
            case 62:
                return parseFor_1.parseForAsync(after);
            case 63:
                return parseFor_1.parseForBag(after);
            case 65:
            case 66:
            case 67:
            case 68:
            case 69:
            case 70:
            case 71:
            case 72:
            case 73:
            case 74:
            case 75:
            case 76:
                return parseFun_1.default(at.kind, after);
            case 78:
            case 110:
                return parseConditional(at.kind, after);
            case 105:
                return parseTrait_1.default(after);
            case 86:
                return parseMethod_1.default(after);
            case 89:
                {
                    const parts = parseExprParts(after);
                    return new MsAst_1.New(at.loc, util_1.head(parts), util_1.tail(parts));
                }
            case 90:
                return new MsAst_1.Not(at.loc, parseExprPlain(after));
            case 96:
                return parsePipe(after);
            case 99:
                return new MsAst_1.SuperCall(at.loc, parseExprParts(after));
            case 101:
                return parseSwitch_1.default(false, after);
            case 111:
                return parseWith(after);
            case 112:
                return new MsAst_1.Yield(at.loc, Op_1.opIf(!after.isEmpty(), () => parseExprPlain(after)));
            case 113:
                return new MsAst_1.YieldTo(at.loc, parseExprPlain(after));
            default:
                throw new Error(String(at.kind));
        }
    }
    const exprSplitKeywords = new Set([36, 40, 43, 46, 45, 50, 56, 61, 62, 63, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 78, 86, 89, 90, 94, 96, 99, 101, 105, 110, 111, 112, 113]);
    function isSplitKeyword(_) {
        return Token_1.isAnyKeyword(exprSplitKeywords, _);
    }
    function parseExprPlain(tokens) {
        checks_1.checkNonEmpty(tokens, _ => _.expectedExpression);
        const parts = parseExprParts(tokens);
        if (parts.length === 1) {
            if (tokens.head() instanceof Token_1.GroupParenthesis && !(util_1.head(parts) instanceof MsAst_1.ObjSimple)) context_1.warn(tokens.loc, _ => _.extraParens);
            return util_1.head(parts);
        } else return new MsAst_1.Call(tokens.loc, util_1.head(parts), util_1.tail(parts));
    }
    function parseCond(tokens) {
        var _parseNExprParts = parseNExprParts(tokens, 3, _ => _.argsCond);

        var _parseNExprParts2 = _slicedToArray(_parseNExprParts, 3);

        const cond = _parseNExprParts2[0];
        const then = _parseNExprParts2[1];
        const _else = _parseNExprParts2[2];

        return new MsAst_1.Cond(tokens.loc, cond, then, _else);
    }
    function parseConditional(kind, tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndOpBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const opBlock = _parseBlock_1$beforeA2[1];

        var _Op_1$caseOp = Op_1.caseOp(opBlock, _ => [parseExprPlain(before), parseBlock_1.default(_)], () => parseNExprParts(before, 2, _ => _.argsConditional(kind)));

        var _Op_1$caseOp2 = _slicedToArray(_Op_1$caseOp, 2);

        const condition = _Op_1$caseOp2[0];
        const result = _Op_1$caseOp2[1];

        return new MsAst_1.Conditional(tokens.loc, condition, result, kind === 110);
    }
    function parsePipe(tokens) {
        var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

        const before = _parseBlock_1$beforeA4[0];
        const block = _parseBlock_1$beforeA4[1];

        return new MsAst_1.Pipe(tokens.loc, parseExpr(before), block.mapSlices(parseExpr));
    }
    function parseWith(tokens) {
        var _parseBlock_1$beforeA5 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA6 = _slicedToArray(_parseBlock_1$beforeA5, 2);

        const before = _parseBlock_1$beforeA6[0];
        const block = _parseBlock_1$beforeA6[1];

        var _Op_1$caseOp3 = Op_1.caseOp(before.opSplitOnce(_ => Token_1.isKeyword(37, _)), _ref2 => {
            let before = _ref2.before;
            let after = _ref2.after;

            context_1.check(after.size() === 1, after.loc, _ => _.asToken);
            return [parseExprPlain(before), parseLocalDeclares_1.parseLocalDeclare(after.head())];
        }, () => [parseExprPlain(before), MsAst_1.LocalDeclare.focus(tokens.loc)]);

        var _Op_1$caseOp4 = _slicedToArray(_Op_1$caseOp3, 2);

        const val = _Op_1$caseOp4[0];
        const declare = _Op_1$caseOp4[1];

        return new MsAst_1.With(tokens.loc, declare, val, parseBlock_1.default(block));
    }
});
//# sourceMappingURL=parseExpr.js.map

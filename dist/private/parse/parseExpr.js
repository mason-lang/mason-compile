var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', 'esast/lib/Loc', '../ast/Await', '../ast/booleans', '../ast/Call', '../ast/Class', '../ast/locals', '../ast/Val', '../ast/With', '../ast/Yield', '../context', '../token/Group', '../token/Keyword', '../token/Token', '../util', './checks', './parseBlock', './parseClass', './parseCase', './parseDel', './parseExcept', './parseFor', './parseFun', './parseMethod', './parseSingle', './parseSwitch', './parseTrait', './parseLocalDeclares', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var Loc_1 = require('esast/lib/Loc');
    var Await_1 = require('../ast/Await');
    var booleans_1 = require('../ast/booleans');
    var Call_1 = require('../ast/Call');
    var Class_1 = require('../ast/Class');
    var locals_1 = require('../ast/locals');
    var Val_1 = require('../ast/Val');
    var With_1 = require('../ast/With');
    var Yield_1 = require('../ast/Yield');
    var context_1 = require('../context');
    var Group_1 = require('../token/Group');
    var Keyword_1 = require('../token/Keyword');
    var Token_1 = require('../token/Token');
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
        return Op_1.caseOp(tokens.opSplitMany(_ => Keyword_1.isKeyword(134, _)), _ => parseObjSimple(tokens.loc, _), () => parseExprPlain(tokens));
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
            pairs.push(new Val_1.ObjPair(loc, name, value));
        }
        const val = new Val_1.ObjSimple(loc, pairs);
        if (tokensCaller.isEmpty()) return val;else {
            const parts = parseExprParts(tokensCaller);
            return new Call_1.default(loc, util_1.head(parts), util_1.cat(util_1.tail(parts), val));
        }
    }
    function parseName(token) {
        if (token instanceof Token_1.NameToken) return token.name;else throw context_1.fail(token.loc, _ => _.expectedName(token));
    }
    function keywordExpr(at, after) {
        switch (at.kind) {
            case 78:
            case 137:
                {
                    const kind = at.kind === 78 ? 0 : 1;
                    return new booleans_1.Logic(at.loc, kind, parseExprParts(after));
                }
            case 82:
                return new Await_1.default(at.loc, parseExprPlain(after));
            case 85:
                return parseCase_1.default(false, after);
            case 88:
                return parseClass_1.default(after);
            case 87:
                return parseCond(after);
            case 92:
                return parseDel_1.default(after);
            case 98:
                return parseExcept_1.default(after);
            case 103:
                return parseFor_1.parseFor(after);
            case 104:
                return parseFor_1.parseForAsync(after);
            case 105:
                return parseFor_1.parseForBag(after);
            case 107:
            case 108:
            case 109:
            case 110:
            case 111:
            case 112:
            case 113:
            case 114:
            case 115:
            case 116:
            case 117:
            case 118:
                return parseFun_1.default(at.kind, after);
            case 120:
            case 153:
                return parseConditional(at.kind, after);
            case 148:
                return parseTrait_1.default(after);
            case 128:
                return parseMethod_1.default(after);
            case 131:
                {
                    const parts = parseExprParts(after);
                    return new Call_1.New(at.loc, util_1.head(parts), util_1.tail(parts));
                }
            case 132:
                return new booleans_1.Not(at.loc, parseExprPlain(after));
            case 139:
                return parsePipe(after);
            case 142:
                return new Class_1.SuperCall(at.loc, parseExprParts(after));
            case 144:
                return parseSwitch_1.default(false, after);
            case 155:
                return parseWith(after);
            case 156:
                return new Yield_1.Yield(at.loc, Op_1.opIf(!after.isEmpty(), () => parseExprPlain(after)));
            case 157:
                return new Yield_1.YieldTo(at.loc, parseExprPlain(after));
            default:
                throw new Error(String(at.kind));
        }
    }
    const exprSplitKeywords = new Set([78, 82, 85, 88, 87, 92, 98, 103, 104, 105, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 120, 128, 131, 132, 137, 139, 142, 144, 148, 153, 155, 156, 157]);
    function isSplitKeyword(_) {
        return Keyword_1.isAnyKeyword(exprSplitKeywords, _);
    }
    function parseExprPlain(tokens) {
        checks_1.checkNonEmpty(tokens, _ => _.expectedExpression);
        const parts = parseExprParts(tokens);
        if (parts.length === 1) {
            if (tokens.head() instanceof Group_1.GroupParenthesis && !(util_1.head(parts) instanceof Val_1.ObjSimple)) context_1.warn(tokens.loc, _ => _.extraParens);
            return util_1.head(parts);
        } else return new Call_1.default(tokens.loc, util_1.head(parts), util_1.tail(parts));
    }
    function parseCond(tokens) {
        var _parseNExprParts = parseNExprParts(tokens, 3, _ => _.argsCond);

        var _parseNExprParts2 = _slicedToArray(_parseNExprParts, 3);

        const cond = _parseNExprParts2[0];
        const then = _parseNExprParts2[1];
        const _else = _parseNExprParts2[2];

        return new booleans_1.Cond(tokens.loc, cond, then, _else);
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

        return new booleans_1.Conditional(tokens.loc, condition, result, kind === 153);
    }
    function parsePipe(tokens) {
        var _parseBlock_1$beforeA3 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA4 = _slicedToArray(_parseBlock_1$beforeA3, 2);

        const before = _parseBlock_1$beforeA4[0];
        const block = _parseBlock_1$beforeA4[1];

        return new Val_1.Pipe(tokens.loc, parseExpr(before), block.mapSlices(parseExpr));
    }
    function parseWith(tokens) {
        var _parseBlock_1$beforeA5 = parseBlock_1.beforeAndBlock(tokens);

        var _parseBlock_1$beforeA6 = _slicedToArray(_parseBlock_1$beforeA5, 2);

        const before = _parseBlock_1$beforeA6[0];
        const block = _parseBlock_1$beforeA6[1];

        var _Op_1$caseOp3 = Op_1.caseOp(before.opSplitOnce(_ => Keyword_1.isKeyword(79, _)), _ref2 => {
            let before = _ref2.before;
            let after = _ref2.after;

            context_1.check(after.size() === 1, after.loc, _ => _.asToken);
            return [parseExprPlain(before), parseLocalDeclares_1.parseLocalDeclare(after.head())];
        }, () => [parseExprPlain(before), locals_1.LocalDeclare.focus(tokens.loc)]);

        var _Op_1$caseOp4 = _slicedToArray(_Op_1$caseOp3, 2);

        const val = _Op_1$caseOp4[0];
        const declare = _Op_1$caseOp4[1];

        return new With_1.default(tokens.loc, declare, val, parseBlock_1.default(block));
    }
});
//# sourceMappingURL=parseExpr.js.map

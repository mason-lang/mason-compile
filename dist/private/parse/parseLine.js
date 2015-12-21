var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseLocalDeclares', './parseMemberName', './parseName', './parseQuote', './parse*', './Slice'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var Token_1 = require('../Token');
    var util_1 = require('../util');
    var checks_1 = require('./checks');
    var parseBlock_1 = require('./parseBlock');
    var parseLocalDeclares_1 = require('./parseLocalDeclares');
    var parseMemberName_1 = require('./parseMemberName');
    var parseName_1 = require('./parseName');
    var parseQuote_1 = require('./parseQuote');
    var parse_1 = require('./parse*');
    var Slice_1 = require('./Slice');
    function parseLine(tokens) {
        const loc = tokens.loc;
        const head = tokens.head();
        const rest = () => tokens.tail();
        const noRest = () => {
            checks_1.checkEmpty(rest(), _ => _.unexpectedAfter(head));
        };
        if (head instanceof Token_1.Keyword) switch (head.kind) {
            case 38:
            case 64:
                return parseAssert(head.kind === 64, rest());
            case 41:
                return new MsAst_1.Break(loc, parse_1.opParseExpr(rest()));
            case 49:
                noRest();
                return new MsAst_1.SpecialDo(loc, 0);
            case 54:
                return new MsAst_1.BagEntry(loc, parse_1.parseExpr(rest()), true);
            case 79:
                return new MsAst_1.Ignore(loc, rest().map(parseLocalDeclares_1.parseLocalName));
            case 92:
                return new MsAst_1.BagEntry(loc, parse_1.parseExpr(rest()));
            case 95:
                return Op_1.caseOp(parse_1.opParseExpr(rest()), _ => new MsAst_1.Pass(tokens.loc, _), () => []);
            case 97:
                return parseLines(parseBlock_1.justBlock(97, rest()));
            case 103:
                return new MsAst_1.Throw(loc, parse_1.opParseExpr(rest()));
            case 106:
                return parse_1.parseTraitDo(rest());
            default:
        }
        return Op_1.caseOp(tokens.opSplitOnce(_ => Token_1.isAnyKeyword(lineSplitKeywords, _)), _ref => {
            let before = _ref.before;
            let atToken = _ref.at;
            let after = _ref.after;

            const at = atToken;
            switch (at.kind) {
                case 85:
                    return new MsAst_1.MapEntry(loc, parse_1.parseExpr(before), parse_1.parseExpr(after));
                case 92:
                    return parseObjEntry(before, after, loc);
                default:
                    return parseAssignLike(before, at, parse_1.parseExpr(after), loc);
            }
        }, () => parse_1.parseExpr(tokens));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseLine;
    const lineSplitKeywords = new Set([39, 84, 85, 92]);
    function parseLines(lines) {
        const lineContents = [];
        for (const line of lines.slices()) {
            const _ = parseLine(line);
            if (_ instanceof Array) lineContents.push(..._);else lineContents.push(_);
        }
        return lineContents;
    }
    exports.parseLines = parseLines;
    function parseAssignLike(before, at, value, loc) {
        const kind = at.kind;
        if (before.size() === 1) {
            const token = before.head();
            if (token instanceof Token_1.GroupSpace) {
                const spaced = Slice_1.Tokens.of(token);

                var _Op_1$caseOp = Op_1.caseOp(spaced.opSplitOnce(_ => Token_1.isKeyword(47, _)), _ref2 => {
                    let before = _ref2.before;
                    let after = _ref2.after;
                    return [before, parse_1.parseExpr(after)];
                }, () => [spaced, null]);

                var _Op_1$caseOp2 = _slicedToArray(_Op_1$caseOp, 2);

                const assignee = _Op_1$caseOp2[0];
                const opType = _Op_1$caseOp2[1];

                const last = assignee.last();
                const object = obj => obj.isEmpty() ? MsAst_1.LocalAccess.this(obj.loc) : parse_1.parseSpaced(obj);
                if (Token_1.isKeyword(52, assignee.nextToLast())) {
                    const name = parseMemberName_1.default(last);
                    const set = object(assignee.rtail().rtail());
                    return new MsAst_1.MemberSet(loc, set, name, opType, setKind(at), value);
                } else if (last instanceof Token_1.GroupBracket) {
                    const set = object(assignee.rtail());
                    const subbeds = parse_1.parseExprParts(Slice_1.Tokens.of(last));
                    return new MsAst_1.SetSub(loc, set, subbeds, opType, setKind(at), value);
                }
            }
        }
        if (kind === 84) return parseLocalMutate(before, value, loc);else {
            util_1.assert(kind === 39);
            return parseAssign(before, value, loc);
        }
    }
    function parseObjEntry(before, after, loc) {
        if (before.size() === 1) {
            const token = before.head();
            const isName = Token_1.isKeyword(88, token);
            const value = () => parse_1.parseExpr(after);
            if (after.isEmpty()) return isName ? MsAst_1.ObjEntryPlain.nameEntry(loc, new MsAst_1.SpecialVal(loc, 1)) : MsAst_1.ObjEntryPlain.access(loc, parseLocalDeclares_1.parseLocalName(token));else if (token instanceof Token_1.Keyword) return new MsAst_1.ObjEntryPlain(loc, Token_1.keywordName(token.kind), value());else if (token instanceof Token_1.GroupQuote) return new MsAst_1.ObjEntryPlain(loc, parseQuote_1.default(Slice_1.default.of(token)), value());else if (token instanceof Token_1.GroupSpace) {
                const slice = Slice_1.Tokens.of(token);
                if (slice.size() === 2 && Token_1.isKeyword(102, slice.head())) {
                    const name = new MsAst_1.QuoteSimple(loc, parseName_1.default(slice.second()));
                    return new MsAst_1.ObjEntryPlain(loc, name, value());
                }
            }
        }
        const assign = parseAssign(before, parse_1.parseExpr(after), loc);
        return new MsAst_1.ObjEntryAssign(loc, assign);
    }
    function setKind(keyword) {
        switch (keyword.kind) {
            case 39:
                return 0;
            case 84:
                return 1;
            default:
                throw checks_1.unexpected(keyword);
        }
    }
    function parseLocalMutate(localsTokens, value, loc) {
        const locals = parseLocalDeclares_1.parseLocalDeclaresJustNames(localsTokens);
        context_1.check(locals.length === 1, loc, _ => _.todoMutateDestructure);
        return new MsAst_1.LocalMutate(loc, locals[0].name, value);
    }
    function parseAssign(localsTokens, value, loc) {
        const locals = parseLocalDeclares_1.default(localsTokens);
        if (locals.length === 1) return new MsAst_1.AssignSingle(loc, locals[0], value);else {
            context_1.check(locals.length > 1, localsTokens.loc, _ => _.assignNothing);
            const kind = locals[0].kind;
            for (const _ of locals) context_1.check(_.kind === kind, _.loc, _ => _.destructureAllLazy);
            return new MsAst_1.AssignDestructure(loc, locals, value);
        }
    }
    function parseAssert(negate, tokens) {
        checks_1.checkNonEmpty(tokens, _ => _.expectedAfterAssert);

        var _Op_1$caseOp3 = Op_1.caseOp(tokens.opSplitOnce(_ => Token_1.isKeyword(103, _)), _ref3 => {
            let before = _ref3.before;
            let after = _ref3.after;
            return [before, parse_1.parseExpr(after)];
        }, () => [tokens, null]);

        var _Op_1$caseOp4 = _slicedToArray(_Op_1$caseOp3, 2);

        const condTokens = _Op_1$caseOp4[0];
        const opThrown = _Op_1$caseOp4[1];

        const parts = parse_1.parseExprParts(condTokens);
        const cond = parts.length === 1 ? parts[0] : new MsAst_1.Call(condTokens.loc, parts[0], util_1.tail(parts));
        return new MsAst_1.Assert(tokens.loc, negate, cond, opThrown);
    }
});
//# sourceMappingURL=parseLine.js.map

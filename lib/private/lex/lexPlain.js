var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../context', '../token/Group', '../token/Keyword', '../token/Token', '../util', './chars', './groupContext', './lexAfterPeriod', './lexIndent', './lexName', './lexNumber', './lexQuote', './sourceContext', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const context_1 = require('../context');
    const Group_1 = require('../token/Group');
    const Keyword_1 = require('../token/Keyword');
    const Token_1 = require('../token/Token');
    const util_1 = require('../util');
    const chars_1 = require('./chars');
    const groupContext_1 = require('./groupContext');
    const lexAfterPeriod_1 = require('./lexAfterPeriod');
    const lexIndent_1 = require('./lexIndent');
    const lexName_1 = require('./lexName');
    const lexNumber_1 = require('./lexNumber');
    const lexQuote_1 = require('./lexQuote');
    const sourceContext_1 = require('./sourceContext');
    const util_2 = require('./util');
    function lexPlain(isInQuote) {
        let indent = 0;
        let startColumn;
        function startPos() {
            return new Loc_1.Pos(sourceContext_1.line, startColumn);
        }
        function loc() {
            return new Loc_1.default(startPos(), sourceContext_1.pos());
        }
        function kw(kind) {
            util_2.addKeywordPlain(startPos(), kind);
        }
        function funKw(opts) {
            util_2.addKeywordFun(startPos(), opts);
        }
        function handleName() {
            lexName_1.default(startPos(), false);
        }
        while (true) {
            startColumn = sourceContext_1.column;
            const characterEaten = sourceContext_1.eat();
            switch (characterEaten) {
                case 0:
                    return;
                case 96:
                case 34:
                    lexQuote_1.default(indent, characterEaten === 96);
                    break;
                case 40:
                case 91:
                case 123:
                    var _ref = (() => {
                        switch (characterEaten) {
                            case 40:
                                return [Group_1.GroupParenthesis, 41];
                            case 91:
                                return [Group_1.GroupBracket, 93];
                            case 123:
                                return [Group_1.GroupBrace, 125];
                            default:
                                throw new Error(String(characterEaten));
                        }
                    })();

                    var _ref2 = _slicedToArray(_ref, 2);

                    const ctr = _ref2[0];
                    const close = _ref2[1];

                    if (sourceContext_1.tryEat(close)) groupContext_1.addToCurrentGroup(new ctr(loc(), []));else {
                        groupContext_1.openGroup(startPos(), ctr);
                        groupContext_1.openGroup(sourceContext_1.pos(), Group_1.GroupSpace);
                    }
                    break;
                case 41:
                    if (groupContext_1.closeInterpolationOrParenthesis(loc())) {
                        util_1.assert(isInQuote);
                        return;
                    }
                    break;
                case 93:
                case 125:
                    {
                        const ctr = characterEaten === 93 ? Group_1.GroupBracket : Group_1.GroupBrace;
                        groupContext_1.closeGroup(startPos(), Group_1.GroupSpace);
                        groupContext_1.closeGroup(sourceContext_1.pos(), ctr);
                        break;
                    }
                case 32:
                    groupContext_1.space(loc());
                    break;
                case 10:
                    {
                        context_1.check(!isInQuote, loc, _ => _.noNewlineInInterpolation);
                        if (sourceContext_1.peek(-2) === 32) context_1.warn(sourceContext_1.pos(), _ => _.trailingSpace);
                        sourceContext_1.skipNewlines();
                        const oldIndent = indent;
                        indent = lexIndent_1.default();
                        if (indent > oldIndent) {
                            context_1.check(indent === oldIndent + 1, loc, _ => _.tooMuchIndent);
                            const l = loc();
                            if (util_1.isEmpty(groupContext_1.curGroup.subTokens) || !Keyword_1.isKeyword(51, util_1.last(groupContext_1.curGroup.subTokens))) {
                                if (groupContext_1.curGroup instanceof Group_1.GroupSpace) groupContext_1.closeSpaceOKIfEmpty(l.start);
                                groupContext_1.openGroup(l.end, Group_1.GroupSpace);
                            }
                            groupContext_1.openGroup(l.start, Group_1.GroupBlock);
                            groupContext_1.openLine(l.end);
                        } else {
                            const l = loc();
                            for (let i = indent; i < oldIndent; i = i + 1) groupContext_1.closeGroupsForDedent(l.start);
                            groupContext_1.closeLine(l.start);
                            groupContext_1.openLine(l.end);
                        }
                        break;
                    }
                case 9:
                    throw context_1.fail(loc(), _ => _.nonLeadingTab);
                case 33:
                    if (sourceContext_1.tryEat(92)) funKw({ isDo: true });else handleName();
                    break;
                case 36:
                    if (sourceContext_1.tryEat2(33, 92)) funKw({ isDo: true, kind: 1 });else if (sourceContext_1.tryEat(92)) funKw({ kind: 1 });else handleName();
                    break;
                case 42:
                    if (sourceContext_1.tryEat2(33, 92)) funKw({ isDo: true, kind: 2 });else if (sourceContext_1.tryEat(92)) funKw({ kind: 2 });else handleName();
                    break;
                case 92:
                    funKw({});
                    break;
                case 124:
                    const isDocComment = !sourceContext_1.tryEat(124);
                    if (!(sourceContext_1.tryEat(32) || sourceContext_1.tryEat(9) || sourceContext_1.peek() === 10)) context_1.warn(sourceContext_1.pos(), _ => _.commentNeedsSpace);
                    if (isDocComment) {
                        const text = sourceContext_1.eatRestOfLine();
                        groupContext_1.closeSpaceOKIfEmpty(startPos());
                        context_1.check(groupContext_1.curGroup instanceof Group_1.GroupLine && groupContext_1.curGroup.subTokens.length === 0, loc, _ => _.trailingDocComment);
                        groupContext_1.addToCurrentGroup(new Token_1.DocComment(loc(), text));
                    } else sourceContext_1.skipRestOfLine();
                    break;
                case 45:
                    if (chars_1.isDigitDecimal(sourceContext_1.peek())) lexNumber_1.default(startPos());else handleName();
                    break;
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    lexNumber_1.default(startPos());
                    break;
                case 46:
                    lexAfterPeriod_1.default(startPos());
                    break;
                case 58:
                    if (sourceContext_1.tryEat(61)) kw(21);else kw(38);
                    break;
                case 39:
                    kw(58);
                    break;
                case 126:
                    kw(51);
                    break;
                case 38:
                    kw(34);
                    break;
                case 92:
                case 94:
                case 125:
                case 44:
                case 35:
                case 123:
                case 59:
                    throw context_1.fail(loc(), _ => _.reservedChar(characterEaten));
                default:
                    handleName();
            }
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = lexPlain;
});
//# sourceMappingURL=lexPlain.js.map
